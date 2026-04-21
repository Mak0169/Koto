from passlib.hash import bcrypt
from sqlalchemy.orm import Session
from jose import jwt
from crud import get_user
from dotenv import load_dotenv
from database import get_db
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

"""
Hashes password.
"""
def hash_password(password):
    hashed_pass = bcrypt.hash(password)
    return hashed_pass

"""
Verifies the password that the user provides
and compares it with the one in the db.
"""
def verify_password(password, hashed_password):
    return bcrypt.verify(password, hashed_password)

"""
Creates access token.
"""
def create_access_token(data: dict):
    to_encode = data.copy()
    encode_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) # type: ignore
    return encode_jwt

"""
Grabs the user from db for when creating a deck.
"""
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    decoded_user = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # type: ignore
    email = decoded_user.get("sub")
    if email is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token")
    user = get_user(db, email)
    return user