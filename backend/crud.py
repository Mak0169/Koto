from sqlalchemy.orm import Session
import models

"""
Gets user data from db.
"""
def get_user(db: Session, email: str):
    user_dict = db.query(
        models.User).filter(
            models.User.email == email).first()
    return user_dict