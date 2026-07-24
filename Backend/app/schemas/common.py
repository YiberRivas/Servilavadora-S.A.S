from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None


class ApiError(BaseModel):
    success: bool = False
    message: str
    errors: Optional[List[str]] = None


class PaginationParams(BaseModel):
    page: int = 1
    per_page: int = 20


class PaginatedResponse(BaseModel):
    success: bool = True
    message: str = "OK"
    data: Optional[Any] = None
    total: int = 0
    page: int = 1
    per_page: int = 20
    total_pages: int = 0
