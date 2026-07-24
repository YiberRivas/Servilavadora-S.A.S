from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.base import Usuario, ConfiguracionGlobal
from app.schemas.common import ApiResponse
from app.dependencies import require_role

router = APIRouter(prefix="/configuraciones", tags=["Configuraciones"])


@router.get("", response_model=ApiResponse)
async def get_configuraciones(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ConfiguracionGlobal))
    configs = result.scalars().all()

    data = {}
    for c in configs:
        data[c.clave] = c.valor

    return ApiResponse(success=True, message="OK", data=data)


@router.get("/all", response_model=ApiResponse)
async def get_all_configuraciones(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ConfiguracionGlobal))
    configs = result.scalars().all()

    return ApiResponse(
        success=True,
        message="OK",
        data=[
            {
                "uuid": c.uuid,
                "clave": c.clave,
                "valor": c.valor,
                "descripcion": c.descripcion,
            }
            for c in configs
        ],
    )
