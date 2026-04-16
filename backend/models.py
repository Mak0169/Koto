from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from database import base

class User(base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)

class Deck(base):
    __tablename__ = "deck"
    deck_id = Column(Integer, primary_key=True)

class Card(base):
    __tablename__ = "card"
    card_id = Column(Integer, ForeignKey("deck_id"))
    term = Column(String)
    definition = Column(String)
