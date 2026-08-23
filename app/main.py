from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app=FastAPI()

artifact=joblib.load("app/twf_model.joblib")
model=artifact["model"]
encoder=artifact['encoder']
threshold=artifact['threshold']
feature_order=artifact['feature_order']


class input_template(BaseModel):
    type:str
    air_temperature:float
    process_temperature:float
    rotational_speed:int
    torque:float
    tool_wear:float


@app.get("/")

def home():
    return {
        "message":"TWF prediction API is running"
    }

@app.post("/predict/twf")

def predict_twf(data:input_template):
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
        result="Tool Wear Failure predicted"
    else:
        result="No Tool Wear Failure predicted"

    return {
        "prediction":prediction,
        "result":result,
        "failure_probability":round(float(prob),4),
        "optimized_threshold":threshold,
        "power":round(power,2)
    }



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
