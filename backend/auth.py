from passlib.hash import bcrypt

def hash_password(password):
    e_pass = bcrypt.hash(password)
    return e_pass
