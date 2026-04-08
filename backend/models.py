from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from database import base

class User(base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)

class Holdings(base):
    __tablename__ = "holdings"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

class Transaction(base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ticker = Column(String(10))
    shares = Column(Float)
    price = Column(Float)
    amount = Column(Float)
    type = Column(String)
    executed_at = Column(DateTime)