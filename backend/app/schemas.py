from typing import Optional
from pydantic import BaseModel, Field

class MenuItemBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0)
    is_available: bool = True
    category: Optional[str] = Field(default=None, max_length=50)

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    price: Optional[float] = Field(default=None, gt=0)
    is_available: Optional[bool] = None
    category: Optional[str] = Field(default=None, max_length=50)

class MenuItemOut(MenuItemBase):
    id: int

    class Config:
        from_attributes = True
