from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
# SQL echo is OFF unless DB_ECHO is truthy ("1", "true", ...). Prevents
# statement-level log spam (and leaking row data) in production.
DB_ECHO = os.getenv("DB_ECHO", "").lower() in ("1", "true", "yes", "on")
engine = create_engine(DATABASE_URL, echo=DB_ECHO) # type: ignore
Sesh = sessionmaker(autocommit=False, autoflush=False, bind=engine)
base = declarative_base()

def get_db():
    db = Sesh()
    try:
        yield db
    finally:
        db.close()
