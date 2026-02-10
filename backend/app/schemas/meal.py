from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class FoodItemBase(BaseModel):
    """食物项基础模型"""

    name: str = Field(..., min_length=1, max_length=100, description="食物名称")
    quantity: Optional[float] = Field(None, ge=0, description="份量")
    unit: Optional[str] = Field(None, max_length=20, description="份量单位")
    calories: float = Field(..., ge=0, description="卡路里")
    protein: float = Field(0, ge=0, description="蛋白质(g)")
    carbs: float = Field(0, ge=0, description="碳水(g)")
    fat: float = Field(0, ge=0, description="脂肪(g)")


class FoodItemCreate(FoodItemBase):
    """创建食物项模型"""


class FoodItemResponse(FoodItemBase):
    """食物项响应模型"""

    id: str = Field(..., description="食物项ID")

    model_config = {"from_attributes": True}


class MealRecordCreate(BaseModel):
    """创建饮食记录模型"""

    meal_type: str = Field(
        ...,
        pattern="^(breakfast|lunch|dinner|snack)$",
        description="餐次类型",
    )
    eaten_at: Optional[datetime] = Field(None, description="进食时间")
    notes: Optional[str] = Field(None, max_length=255, description="备注")
    food_items: List[FoodItemCreate] = Field(..., min_length=1, description="食物项列表")


class MealRecordResponse(BaseModel):
    """饮食记录响应模型"""

    id: str = Field(..., description="饮食记录ID")
    meal_type: str = Field(..., description="餐次类型")
    eaten_at: datetime = Field(..., description="进食时间")
    notes: Optional[str] = Field(None, description="备注")
    total_calories: float = Field(..., description="总卡路里")
    total_protein: float = Field(..., description="总蛋白质(g)")
    total_carbs: float = Field(..., description="总碳水(g)")
    total_fat: float = Field(..., description="总脂肪(g)")
    food_items: List[FoodItemResponse] = Field(..., description="食物项列表")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

    model_config = {"from_attributes": True}

