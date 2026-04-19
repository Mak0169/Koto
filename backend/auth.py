from passlib.hash import bcrypt

def hash_password(password):
    hashed_pass = bcrypt.hash(password)
    return hashed_pass
