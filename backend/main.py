from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import UserCreate, Token, DeckCreate, CardCreate
from database import base, engine, get_db
from auth import hash_password, verify_password, create_access_token, get_current_user
from crud import get_user, get_decks_by_user, get_cards_by_deck
import models

app = FastAPI()
base.metadata.create_all(engine)

""" Opens the webpage. """
@app.get("/")
def root():
    return {"message": "Portfolio API is running"}

""" This is used to make a profile for new users. """
@app.post("/register")
def create_register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    hashed_pass = hash_password(user.password)
    new_user = models.User(email=user.email, password=hashed_pass)
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

""" This is used to get the users login credentials. """
@app.post("/token")
def login_token(
    user_cred: UserCreate,
    db: Session = Depends(get_db)
):
    user = get_user(db, user_cred.email)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect credentials"
        )
    if not verify_password(user_cred.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect credentials"
        )
    access_token = create_access_token(
        data={"sub": user.email})
    if not access_token:
        raise HTTPException(
            status_code=500,
            detail="Token creation failed"
        )
    return Token(access_token=access_token, token_type="bearer")

""" Allows the user to create a deck and name it. """
@app.post("/deck")
def create_deck(
    deck: DeckCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    new_deck = models.Deck(user_id=current_user.id, name=deck.name)
    db.add(new_deck)
    db.commit()
    return {"message": "Deck created."}

"""
This grabs the deck from the db
that is associated with the user.
"""
@app.get("/deck")
def get_deck(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_decks = get_decks_by_user(db, current_user.id)
    return user_decks

"""
This grabs the cards that are based of
deck_id form the db.
"""
@app.get("/deck/{deck_id}/card")
def get_card(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    user_cards = get_cards_by_deck(db, deck_id=deck_id)
    return user_cards

@app.post("/deck/{deck_id}/card")
def create_card(
    card: CardCreate,
    deck_id: int,
    db: Session = Depends(get_db)
):  
    new_card = models.Card(deck_id=deck_id,term=card.term, definition=card.definition)
    db.add(new_card)
    db.commit()
    return {"message": "Card Created."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)