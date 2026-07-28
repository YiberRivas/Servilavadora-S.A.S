from typing import Any, Optional
from pydantic import BaseModel


class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None


class PaginatedResponse(BaseModel):
    success: bool = True
    message: str = "OK"
    data: Optional[Any] = None
    total: int = 0
    page: int = 1
    per_page: int = 20
    total_pages: int = 0
