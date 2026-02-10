# Aqua - AI 饮食助手

## 快速开始

### 后端运行

```bash
cd backend

# 配置环境变量（首次运行）
cp .env.example .env
# 编辑 .env 文件，填入你的 GEMINI_API_KEY

# 安装依赖
uv sync

# 启动开发服务器
uv run fastapi dev app/main.py
```

后端将运行在 http://localhost:8000
- API 文档: http://localhost:8000/docs

### 前端运行

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 http://localhost:5173

## 技术栈

**后端**
- FastAPI - Web 框架
- SQLAlchemy - ORM
- SQLite - 数据库
- LangChain + Gemini - AI 集成

**前端**
- React 19
- React Router 7
- Zustand - 状态管理
- TailwindCSS 4 - 样式
- Vite - 构建工具
