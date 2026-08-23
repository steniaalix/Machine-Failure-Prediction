from fastapi import FastAPI, HTTPException
from pydantic import BaseModel,Field
from typing import Literal
import joblib
import pandas as pd

app=FastAPI(title="Cost-Aware Tool Wear Failure Prediction API",
            description=("An ML API that predicts Tool Wear Failure using a Random Forest model and a cost-optimized threshold"),
            version="1.0.0")


artifact=joblib.load("app/twf_model.joblib")
model=artifact["model"]
encoder=artifact['encoder']
threshold=artifact['threshold']
feature_order=artifact['feature_order']



FN_COST=15000
FP_COST=500


class input_template(BaseModel):
    type:Literal["L","M","H"]=Field(
        description="Machine Quality Type"
    )

    air_temperature:float=Field(
        gt=0,
        description="Air temperature in Kelvin"
    )

    process_temperature:float=Field(
        gt=0,
        description="Process temperature in Kelvin"
    )

    rotational_speed:int=Field(
        gt=0,
        description="Rotational speed in RPM"
    )

    torque:float=Field(
        gt=0,
        description="Torque in Nm"
    )

    tool_wear:float=Field(
        ge=0,
        description="Tool wear in minutes"
    )


class response_template(BaseModel):
    machine_type: str

    prediction: int

    result: str

    risk_level: str

    failure_probability: float

    optimized_threshold: float

    default_threshold: float

    default_prediction: int

    power: float

    cost_strategy: str


@app.get("/")

def home():
    return {
        "message":"TWF prediction API",
        "status":"running",
    }

@app.get("/health")

def health_check():

    return {
        "status":"healthy",
        "model_loaded":True,
        "model_type":type(model).__name__
    }


@app.get("/model-info")
def model_info():

    return {
        "model": type(model).__name__,

        "optimized_threshold": threshold,

        "default_threshold": 0.5,

        "false_negative_cost": FN_COST,

        "false_positive_cost": FP_COST,

        "feature_order": feature_order,

        "sklearn_version": artifact.get(
            "sklearn_version",
            "Unknown"
        )
    }

@app.post("/predict/twf",response_model=response_template)

def predict_twf(data:input_template):

    try:
        encoded_type=encoder.transform([data.type])[0]
        power=data.torque*data.rotational_speed
        input_df=pd.DataFrame([{
            "Type":encoded_type,
            "Air temperature [K]":data.air_temperature,
            "Process temperature [K]":data.process_temperature,
            "Rotational speed [rpm]":data.rotational_speed,
            "Torque [Nm]":data.torque,
            "Tool wear [min]":data.tool_wear,
            "Power":power
        }])

        input_df=input_df[feature_order]

        prob=float(model.predict_proba(input_df)[0][1])

        default_prediction=int(prob>=0.5)

        prediction=int(prob>=threshold)


        if prediction==1:
            result="Tool Wear Failure predicted"
        else:
            result="No Tool Wear Failure predicted"

        if prob<threshold:

            risk_level="LOW"

        elif prob<0.5:
            risk_level="MEDIUM"

        else:
            risk_level="HIGH"



        return response_template(
            machine_type=data.type,
            prediction=prediction,
            result=result,
            risk_level=risk_level,
            failure_probability=round(prob,4),
            optimized_threshold=round(threshold,4),
            default_threshold=0.5,
            default_prediction=default_prediction,
            power=round(power,2),
            cost_strategy=(
                f"FN Cost= ${FN_COST:,},"
                f"FP Cost= ${FP_COST:,}"
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


'''
@app.post("/predict/hdf")

def predict_hdf(data:input_template):
    encoded_type=encoder.transform([data.type])[0]
    power=data.torque*data.rotational_speed
    input_df=pd.DataFrame([{
        "Type":encoded_type,
        "Air temperature [K]":data.air_temperature,
        "Process temperature [K]":data.process_temperature,
        "Rotational speed [rpm]":data.rotational_speed,
        "Torque [Nm]":data.torque,
        "Tool wear [min]":data.tool_wear,
        "Power":power
    }])

    input_df=input_df[feature_order]

    prob=model.predict_proba(input_df)[0][1]
    prediction=int(prob>=threshold)

    if prediction==1:
        result="Heat Dissipation Failure predicted"
    else:
        result="No Heat Dissipation Failure predicted"

    return {
        "prediction":prediction,
        "result":result,
        "failure_probability":round(float(prob),4),
        "optimized_threshold":threshold,
        "power":round(power,2)
    }

'''