from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os

from .database import Base, engine, SessionLocal
from . import schemas, crud, models

# Create tables on startup (simple dev approach)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cafe API", version="1.0.0")

# CORS (for React later)
allowed_origins = (os.getenv("ALLOWED_ORIGINS") or "").split(",")
if allowed_origins and allowed_origins != [""]:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in allowed_origins if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Convenience routes ---
@app.get("/")
def root():
    return {"message": "Cafe API is running", "version": app.version}

@app.get("/health")
def health():
    return {"status": "ok"}

# --- CRUD: insert/select/update/delete ---

# INSERT
@app.post("/items", response_model=schemas.MenuItemOut, status_code=201)
def create_menu_item(payload: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_item(db, payload)
    except Exception as e:
        # e.g., unique constraint on name
        raise HTTPException(status_code=400, detail=str(e))

# SELECT all
@app.get("/items", response_model=List[schemas.MenuItemOut])
def list_menu_items(db: Session = Depends(get_db)):
    return crud.get_items(db)

# SELECT by id
@app.get("/items/{item_id}", response_model=schemas.MenuItemOut)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# UPDATE
@app.put("/items/{item_id}", response_model=schemas.MenuItemOut)
def update_menu_item(item_id: int, payload: schemas.MenuItemUpdate, db: Session = Depends(get_db)):
    try:
        item = crud.update_item(db, item_id, payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# DELETE
@app.delete("/items/{item_id}", status_code=204)
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_item(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Item not found")
    return
