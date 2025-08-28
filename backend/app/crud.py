from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from .models import MenuItem
from .schemas import MenuItemCreate, MenuItemUpdate

def get_items(db: Session) -> List[MenuItem]:
    return db.scalars(select(MenuItem)).all()

def get_item(db: Session, item_id: int) -> Optional[MenuItem]:
    return db.get(MenuItem, item_id)

def create_item(db: Session, payload: MenuItemCreate) -> MenuItem:
    item = MenuItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def update_item(db: Session, item_id: int, payload: MenuItemUpdate) -> Optional[MenuItem]:
    item = db.get(MenuItem, item_id)
    if not item:
        return None
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

def delete_item(db: Session, item_id: int) -> bool:
    item = db.get(MenuItem, item_id)
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True
