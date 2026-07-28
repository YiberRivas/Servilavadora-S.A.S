from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.base import Usuario, Archivo
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.modulos import ArchivoCreate
from app.dependencies import require_role
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/archivos", tags=["Archivos"])


@router.get("", response_model=PaginatedResponse)
async def list_archivos(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    query = select(Archivo)
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Archivo.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    archivos = result.scalars().all()

    return PaginatedResponse(
        data=[
            {
                "uuid": a.uuid, "nombre_original": a.nombre_original,
                "nombre_servidor": a.nombre_servidor, "extension": a.extension,
                "mime_type": a.mime_type, "peso": a.peso, "ruta": a.ruta,
                "estado": a.estado,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in archivos
        ],
        total=total, page=page, per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.post("", response_model=ApiResponse)
async def create_archivo(
    data: ArchivoCreate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    new_archivo = Archivo(
        uuid=generate_uuid(),
        nombre_original=data.nombre_original,
        nombre_servidor=data.nombre_servidor,
        extension=data.extension,
        mime_type=data.mime_type,
        peso=data.peso,
        ruta=data.ruta,
        hash_sha256=data.hash_sha256,
    )
    db.add(new_archivo)
    await db.flush()
    return ApiResponse(success=True, message="Archivo registrado", data={"uuid": new_archivo.uuid})


@router.delete("/{archivo_uuid}", response_model=ApiResponse)
async def delete_archivo(
    archivo_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Archivo).where(Archivo.uuid == archivo_uuid))
    archivo = result.scalar_one_or_none()
    if not archivo:
        return ApiResponse(success=False, message="Archivo no encontrado")

    archivo.estado = 0
    await db.flush()
    return ApiResponse(success=True, message="Archivo desactivado")
