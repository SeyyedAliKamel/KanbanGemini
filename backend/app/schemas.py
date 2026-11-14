from typing import List, Optional
from pydantic import BaseModel, Field

# Card Schemas
class CardBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    details: str = Field(default="")

class CreateCardRequest(CardBase):
    column_id: str

class UpdateCardRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    details: Optional[str] = None

class MoveCardRequest(BaseModel):
    target_column_id: str
    position: int = Field(..., ge=0)

class CardResponse(CardBase):
    id: str
    column_id: str
    position: int
    created_at: str
    updated_at: str

# Column Schemas
class ColumnBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)

class CreateColumnRequest(ColumnBase):
    pass

class RenameColumnRequest(ColumnBase):
    pass

class ColumnResponse(ColumnBase):
    id: str
    board_id: str
    position: int
    cards: List[CardResponse] = []

# Board Schemas
class BoardResponse(BaseModel):
    id: str
    user_id: str
    title: str
    columns: List[ColumnResponse] = []
