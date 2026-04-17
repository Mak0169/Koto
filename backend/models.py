from sqlalchemy import Column, Integer, String, ForeignKey
from database import base

class User(base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)

class Deck(base):
    __tablename__ = "deck"
    user_id = Column(Integer, ForeignKey("users.id"))
    deck_id = Column(Integer, primary_key=True)

class Card(base):
    __tablename__ = "card"
    card_id = Column(Integer, primary_key=True)
    deck_id = Column(Integer, ForeignKey("deck.deck_id"))
    term = Column(String)
    definition = Column(String)

class Review(base):
    __tablename__ = "review"
    review_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    card_id = Column(Integer, ForeignKey("card.card_id"))
    next_review_at = Column(Integer)