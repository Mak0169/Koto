from passlib.hash import bcrypt
from jose import jwt
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
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