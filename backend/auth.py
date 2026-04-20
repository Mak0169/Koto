from passlib.hash import bcrypt

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