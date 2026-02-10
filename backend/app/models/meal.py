from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class MealRecord(Base, TimestampMixin):
    """饮食记录模型"""

    __tablename__ = "meal_records"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        comment="饮食记录ID",
    )
    meal_type: Mapped[str] = mapped_column(String(20), comment="餐次类型")
    eaten_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=func.now(),
        nullable=False,
        comment="进食时间",
    )
    notes: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="备注",
    )

    total_calories: Mapped[float] = mapped_column(
        Float,
        default=0,
        nullable=False,
        comment="总卡路里",
    )
    total_protein: Mapped[float] = mapped_column(
        Float,
        default=0,
        nullable=False,
        comment="总蛋白质(g)",
    )
    total_carbs: Mapped[float] = mapped_column(
        Float,
        default=0,
        nullable=False,
        comment="总碳水(g)",
    )
    total_fat: Mapped[float] = mapped_column(
        Float,
        default=0,
        nullable=False,
        comment="总脂肪(g)",
    )

    food_items: Mapped[list["FoodItem"]] = relationship(
        back_populates="meal_record",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class FoodItem(Base, TimestampMixin):
    """食物项模型"""

    __tablename__ = "food_items"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        comment="食物项ID",
    )
    meal_record_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("meal_records.id", ondelete="CASCADE"),
        index=True,
        comment="关联饮食记录ID",
    )
    name: Mapped[str] = mapped_column(String(100), comment="食物名称")
    quantity: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="份量",
    )
    unit: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="份量单位",
    )
    calories: Mapped[float] = mapped_column(Float, default=0, nullable=False, comment="卡路里")
    protein: Mapped[float] = mapped_column(Float, default=0, nullable=False, comment="蛋白质(g)")
    carbs: Mapped[float] = mapped_column(Float, default=0, nullable=False, comment="碳水(g)")
    fat: Mapped[float] = mapped_column(Float, default=0, nullable=False, comment="脂肪(g)")

    meal_record: Mapped[MealRecord] = relationship(back_populates="food_items")

