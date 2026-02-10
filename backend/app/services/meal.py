"""饮食记录相关业务逻辑"""
from datetime import datetime, timedelta

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import FoodItem, MealRecord
from app.schemas.meal import MealRecordCreate


def _calculate_totals(food_items: list[dict]) -> dict[str, float]:
    total_calories = sum(item["calories"] for item in food_items)
    total_protein = sum(item["protein"] for item in food_items)
    total_carbs = sum(item["carbs"] for item in food_items)
    total_fat = sum(item["fat"] for item in food_items)

    return {
        "total_calories": round(total_calories, 1),
        "total_protein": round(total_protein, 1),
        "total_carbs": round(total_carbs, 1),
        "total_fat": round(total_fat, 1),
    }


async def create_meal_record(db: AsyncSession, payload: MealRecordCreate) -> MealRecord:
    """创建饮食记录"""
    items_data = [item.model_dump() for item in payload.food_items]
    totals = _calculate_totals(items_data)

    meal_record = MealRecord(
        meal_type=payload.meal_type,
        eaten_at=payload.eaten_at or datetime.now(),
        notes=payload.notes,
        **totals,
    )

    for item in items_data:
        meal_record.food_items.append(FoodItem(**item))

    db.add(meal_record)
    await db.commit()
    await db.refresh(meal_record)
    return meal_record


async def get_today_meal_records(db: AsyncSession) -> list[MealRecord]:
    """获取今日饮食记录"""
    now = datetime.now()
    start_of_day = datetime(now.year, now.month, now.day)
    end_of_day = start_of_day + timedelta(days=1)

    statement = (
        select(MealRecord)
        .options(selectinload(MealRecord.food_items))
        .where(
            and_(
                MealRecord.eaten_at >= start_of_day,
                MealRecord.eaten_at < end_of_day,
            )
        )
        .order_by(MealRecord.eaten_at.desc())
    )
    result = await db.execute(statement)
    return list(result.scalars().all())


async def get_meal_records_history(db: AsyncSession, days: int = 7) -> list[MealRecord]:
    """获取历史饮食记录"""
    now = datetime.now()
    start_time = now - timedelta(days=days)

    statement = (
        select(MealRecord)
        .options(selectinload(MealRecord.food_items))
        .where(MealRecord.eaten_at >= start_time)
        .order_by(MealRecord.eaten_at.desc())
    )
    result = await db.execute(statement)
    return list(result.scalars().all())

