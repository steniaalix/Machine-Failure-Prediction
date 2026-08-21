import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import confusion_matrix
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

df=pd.read_csv("data/ai4i2020.csv")
df.drop(['UDI','Product ID'],axis=1,inplace=True)

df['Power']=df['Torque [Nm]']*df["Rotational speed [rpm]"]

le=LabelEncoder()

df['Type']=le.fit_transform(df['Type'])

target="TWF"

failure_cols=["Machine failure","HDF","PWF","OSF","RNF"]
X=df.drop(columns=failure_cols +[target])
y=df[target]

X_train,X_test,y_train,y_test=train_test_split(X,y,test_sie=0.3,random_state=42,stratify=y)

model=RandomForestClassifier(n_estimators=100,random_state=42)

model.fit(X_train,y_train)

probs=model.predict_proba(X_test)[:,1]

def calculate_cost(y_true,preds):
    tn,fp,fn,tp= confusion_matrix(y_true,preds).ravel()
    cost=(fn*5000)+(fp*500)
    return cost,tn,fp,fn,tp

pred_default=(probs>=0.5).astype(int)
cost_def,tn,fp,fn,tp=calculate_cost(y_test,pred_default)

print("="*50)
print("BASELINE (Threshold = 0.5)")
print(f"TN={tn}, FP={fp}, FN={fn}, TP={tp}")
print(f"Cost: ${cost_def:,}")
print("="*50)

