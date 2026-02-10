from fastapi import APIRouter

from .meals import router as meals_router
from .user import router as user_router

# 创建主路由
api_router = APIRouter()

# 注册子路由
api_router.include_router(user_router)
api_router.include_router(meals_router)

__all__ = ["api_router"]
