from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class DeckCreate(BaseModel):
    name: str

class CardCreate(BaseModel):
    term: str
    definition: str

class ReviewCreate(BaseModel):
    quality: int = Field(ge=0, le=5)