import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    confusion_matrix, classification_report, accuracy_score,
    precision_score, recall_score, f1_score, average_precision_score,
    make_scorer, precision_recall_curve
)
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_predict

# ==========================================
# CONFIG
# ==========================================

FN_COST = 15000   # cost of missing a real failure
FP_COST = 500      # cost of a false alarm

TARGET = "TWF"      # change to HDF / PWF / OSF / RNF to reuse for other failure modes
ALL_FAILURE_COLS = ["Machine failure", "HDF", "PWF", "OSF", "RNF", "TWF"]

RANDOM_STATE = 42

# ==========================================
# LOAD & PREP DATA
# ==========================================

df = pd.read_csv("data/ai4i2020.csv")
df.drop(['UDI', 'Product ID'], axis=1, inplace=True)

# NOTE: true mechanical power = Torque * angular velocity = Torque * (2*pi*RPM/60).
# This is Torque * RPM (proportional to power, not power itself). Kept as-is since
# RandomForest is invariant to monotonic scaling of a feature, but renamed for clarity.
df['Torque_RPM_product'] = df['Torque [Nm]'] * df['Rotational speed [rpm]']

le = LabelEncoder()
df['Type'] = le.fit_transform(df['Type'])

failure_cols = [c for c in ALL_FAILURE_COLS if c != TARGET]
X = df.drop(columns=failure_cols + [TARGET])
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=RANDOM_STATE, stratify=y
)

print("Training set:", X_train.shape)
print("Test set:", X_test.shape)
print(f"\n{TARGET} distribution:")
print("Train:")
print(y_train.value_counts())
print("\nTest:")
print(y_test.value_counts())


# ==========================================
# COST-AWARE SCORER (drives hyperparameter search itself)
# ==========================================

def cost_score(y_true, y_pred):
    """Negative total cost — sklearn scorers maximize, so we negate."""
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    total_cost = (fn * FN_COST) + (fp * FP_COST)
    return -total_cost

cost_scorer = make_scorer(cost_score, greater_is_better=True)


# ==========================================
# HYPERPARAMETER SEARCH — now optimizing cost, not F1
# ==========================================

param_grid = {
    "n_estimators": [200, 300, 500],
    "max_depth": [None, 3, 5, 10],
    "min_samples_split": [2, 5],
    "min_samples_leaf": [1, 2, 5, 10],
    "max_features": ["sqrt", "log2", None],
}

results = {}

for use_balanced in [True, False]:
    label = "balanced" if use_balanced else "unbalanced"
    model = RandomForestClassifier(
        class_weight="balanced" if use_balanced else None,
        random_state=RANDOM_STATE,
    )

    grid = GridSearchCV(
        model,
        param_grid,
        cv=5,
        scoring=cost_scorer,
        n_jobs=-1,
        verbose=1,
        return_train_score=True,
    )
    grid.fit(X_train, y_train)

    print(f"\n[{label}] Best params: {grid.best_params_}")
    print(f"[{label}] Best CV cost: ${-grid.best_score_:,.0f}")

    results[label] = grid

# Pick whichever class_weight setting gave the lower (better) CV cost
best_label = min(results, key=lambda k: -results[k].best_score_)
grid = results[best_label]
final_model = grid.best_estimator_

print(f"\n>>> Selected setting: class_weight='{best_label if best_label == 'balanced' else None}' "
      f"(lower CV cost: ${-grid.best_score_:,.0f})")


# ==========================================
# OUT-OF-FOLD PROBABILITIES for threshold tuning (no leakage)
# ==========================================

cv_model = RandomForestClassifier(
    **grid.best_params_,
    class_weight="balanced" if best_label == "balanced" else None,
    random_state=RANDOM_STATE,
    n_jobs=-1,
)

train_probs_cv = cross_val_predict(
    cv_model, X_train, y_train, cv=5, method="predict_proba", n_jobs=-1
)[:, 1]

# Threshold-independent check of how separable the classes are
ap_score = average_precision_score(y_train, train_probs_cv)
print(f"\nOut-of-fold Average Precision (PR-AUC): {ap_score:.4f}")


# ==========================================
# EVALUATION HELPER
# ==========================================

def evaluate_model(y_true, probs, threshold=0.5, name="Model"):
    preds = (probs >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, preds, labels=[0, 1]).ravel()

    print("\n" + "=" * 50)
    print(name)
    print(f"Threshold: {threshold}")
    print(f"TN: {tn}  FP: {fp}  FN: {fn}  TP: {tp}")
    print(f"\nAccuracy:  {accuracy_score(y_true, preds):.4f}")
    print(f"Precision: {precision_score(y_true, preds, zero_division=0):.4f}")
    print(f"Recall:    {recall_score(y_true, preds, zero_division=0):.4f}")
    print(f"F1 Score:  {f1_score(y_true, preds, zero_division=0):.4f}")
    print("\n" + classification_report(y_true, preds, zero_division=0))

    return preds, (tn, fp, fn, tp)


def calculate_cost(y_true, preds):
    tn, fp, fn, tp = confusion_matrix(y_true, preds, labels=[0, 1]).ravel()
    total_cost = (fn * FN_COST) + (fp * FP_COST)
    return total_cost, tn, fp, fn, tp


# ==========================================
# THRESHOLD SWEEP (on out-of-fold CV predictions)
# ==========================================

thresholds = np.linspace(0.01, 0.99, 99)
cv_costs = []
best_threshold = 0.5
best_cost = float("inf")

for threshold in thresholds:
    cv_preds = (train_probs_cv >= threshold).astype(int)
    cost, tn, fp, fn, tp = calculate_cost(y_train, cv_preds)
    cv_costs.append(cost)

    if cost < best_cost:
        best_cost = cost
        best_threshold = threshold

print("\n" + "=" * 50)
print("CROSS-VALIDATED THRESHOLD OPTIMIZATION")
print("=" * 50)
print(f"Best Threshold: {best_threshold:.2f}")
print(f"Minimum Cross-Validated Cost: ${best_cost:,.0f}")


# ==========================================
# FINAL TEST SET EVALUATION
# ==========================================

optimized_threshold = best_threshold
test_probs = final_model.predict_proba(X_test)[:, 1]

evaluate_model(y_test, test_probs, threshold=0.5, name="TEST SET - DEFAULT MODEL")
evaluate_model(y_test, test_probs, threshold=best_threshold, name="TEST SET - COST-OPTIMIZED THRESHOLD")

test_preds_default = (test_probs >= 0.5).astype(int)
test_preds_optimized = (test_probs >= optimized_threshold).astype(int)

default_test_cost, tn, fp, fn, tp = calculate_cost(y_test, test_preds_default)
print("\n" + "=" * 50)
print("TEST SET — DEFAULT THRESHOLD")
print("=" * 50)
print(f"Threshold: 0.50")
print(f"TN = {tn}  FP = {fp}  FN = {fn}  TP = {tp}")
print(f"Total Cost: ${default_test_cost:,}")

optimized_test_cost, tn2, fp2, fn2, tp2 = calculate_cost(y_test, test_preds_optimized)
print("\n" + "=" * 50)
print("TEST SET — COST-OPTIMIZED THRESHOLD")
print("=" * 50)
print(f"Threshold: {optimized_threshold:.2f}")
print(f"TN = {tn2}  FP = {fp2}  FN = {fn2}  TP = {tp2}")
print(f"Total Cost: ${optimized_test_cost:,}")

savings = default_test_cost - optimized_test_cost
improvement = (savings / default_test_cost) * 100 if default_test_cost > 0 else 0

print("\n" + "=" * 50)
print("FINAL COST COMPARISON")
print("=" * 50)
print(f"Default Cost:   ${default_test_cost:,}")
print(f"Optimized Cost: ${optimized_test_cost:,}")
print(f"Savings:        ${savings:,}")
print(f"Cost Reduction: {improvement:.2f}%")
print("=" * 50)


# ==========================================
# PLOTS
# ==========================================

fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# Cost vs threshold
axes[0].plot(thresholds, cv_costs, linewidth=2)
axes[0].axvline(x=0.5, linestyle="--", color="gray", label="Default Threshold (0.50)")
axes[0].axvline(x=best_threshold, linestyle="--", color="red",
                label=f"Optimal Threshold ({best_threshold:.2f})")
axes[0].set_xlabel("Decision Threshold")
axes[0].set_ylabel("Cross-Validation Cost ($)")
axes[0].set_title(f"Cost-Aware Threshold Optimization ({TARGET})")
axes[0].legend()
axes[0].grid(True)

# Precision-recall curve
prec, rec, _ = precision_recall_curve(y_train, train_probs_cv)
axes[1].plot(rec, prec, linewidth=2)
axes[1].set_xlabel("Recall")
axes[1].set_ylabel("Precision")
axes[1].set_title(f"Precision-Recall Curve (AP = {ap_score:.3f})")
axes[1].grid(True)

plt.tight_layout()
plt.show()