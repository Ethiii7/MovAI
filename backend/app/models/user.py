from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False)
    email      = Column(String, unique=True, index=True, nullable=False)
    password   = Column(String, nullable=False)   # bcrypt hash
    avatar_url = Column(String, nullable=True)
    plan       = Column(String, default="gratuito")  # "gratuito" | "pro"
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)