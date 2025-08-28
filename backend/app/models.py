from sqlalchemy import Column, Integer, String, Float, Boolean
from .database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    price = Column(Float, nullable=False)
    is_available = Column(Boolean, nullable=False, default=True)
    category = Column(String(50), nullable=True)
