from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Portfolio API is running"}