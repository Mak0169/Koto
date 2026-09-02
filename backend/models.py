from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Float
from database import base
from datetime import datetime, timezone

class User(base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)

class Deck(base):
    __tablename__ = "deck"
    user_id = Column(Integer, ForeignKey("users.id"))
    deck_id = Column(Integer, primary_key=True)
    name = Column(String)

class Card(base):
    __tablename__ = "card"
    card_id = Column(Integer, primary_key=True)
    deck_id = Column(Integer, ForeignKey("deck.deck_id"))
    term = Column(String)
    definition = Column(String)
    easiness_factor = Column(Float, default=2.5)
    interval = Column(Float, default=0)
    repetitions = Column(Integer, default=0)

class Review(base):
    __tablename__ = "review"
    review_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    card_id = Column(Integer, ForeignKey("card.card_id"))
    next_review_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    was_correct = Column(Boolean)
    review_count = Column(Integer)