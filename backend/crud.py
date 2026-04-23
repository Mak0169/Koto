from sqlalchemy.orm import Session
import models

""" Gets user data from db. """
def get_user(db: Session, email: str):
    user_dict = db.query(
        models.User).filter(
            models.User.email == email).first()
    return user_dict

""" Gets decks that match with user_id """
def get_decks_by_user(db: Session, user_id: int):
    user_decks = db.query(
        models.Deck).filter(
            models.Deck.user_id == user_id).all()
    return user_decks

""" Gets the cards associated with the deck. """
def get_cards_by_deck(db: Session, deck_id: int):
    user_cards = db.query(
        models.Card).filter(
            models.Card.deck_id == deck_id).all()
    return user_cards