from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from schemas import UserCreate
from database import base, engine, get_db
from auth import hash_password
import models

app = FastAPI()
base.metadata.create_all(engine)

"""
Opens the webpage.
"""
@app.get("/")
def root():
    return {"message": "Portfolio API is running"}

"""
This is used to make a profile for new users.
"""
@app.post("/register")
def create_register(user: UserCreate, db: Session = Depends(get_db)):
    hashed_pass = hash_password(user.password)
    new_user = models.User(email=user.email, password=hashed_pass)
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

"""
This is used to get the users login credentials.
"""
@app.post("/token")
def login_token(user: UserCreate, db: Session = Depends(get_db)):
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)