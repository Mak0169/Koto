from fastapi import FastAPI
from database import base, engine
import models

app = FastAPI()
base.metadata.create_all(engine)

@app.get("/")
def root():
    return {"message": "Portfolio API is running"}