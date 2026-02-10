"""饮食记录相关API路由"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas import MealRecordCreate, MealRecordResponse
from app.services import meal as meal_service

router = APIRouter(prefix="/api/meals", tags=["meals"])


@router.post("/record", response_model=MealRecordResponse, status_code=201)
async def create_meal_record(
    payload: MealRecordCreate,
    db: AsyncSession = Depends(get_db),
):
    """保存饮食记录"""
    return await meal_service.create_meal_record(db, payload)


@router.get("/today", response_model=list[MealRecordResponse])
async def get_today_meal_records(db: AsyncSession = Depends(get_db)):
    """获取今日饮食记录"""
    return await meal_service.get_today_meal_records(db)


@router.get("/history", response_model=list[MealRecordResponse])
async def get_meal_records_history(
    days: int = Query(default=7, ge=1, le=30, description="查询最近N天记录"),
    db: AsyncSession = Depends(get_db),
):
    """获取历史饮食记录"""
    return await meal_service.get_meal_records_history(db, days=days)

