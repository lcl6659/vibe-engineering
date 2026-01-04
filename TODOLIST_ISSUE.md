[Agent] 创建 TodoList 网站 - 邮箱登录和待办事项管理 #61

## 任务描述

实现一个完整的 TodoList 网站：

后端（Go）：
- 邮箱账号密码注册和登录
- JWT token 认证
- Todo CRUD API（创建、读取、更新、删除今天的 todo）
- SQLite 数据库

前端（Next.js）：
- 登录页面（邮箱密码登录）
- TodoList 页面（显示今天的 todo）
- 创建、编辑、删除、完成 todo 功能
- 使用 Tailwind CSS 美化界面

## 验收标准

- [ ] 用户可以注册和登录
- [ ] 登录后可以看到今天的 todo 列表
- [ ] 可以创建、编辑、删除、完成 todo
- [ ] UI 美观且响应式
- [ ] 代码遵循 Vibe Guide 最佳实践

## Vibe Guide 要求

### Planning
- [ ] Agent 先创建计划（`EXEC_PLAN.md`），明确列出要创建/修改的文件
- [ ] 计划要详细，减少后续审查时间

### Code Quality
- [ ] **No backwards compatibility**：不关心向后兼容，优先代码可读性
- [ ] **Disable disabling lint rules**：禁止使用 `eslint-disable-next-line` 等
- [ ] 如果遇到 lint 错误，必须修复，不能禁用

### Frontend Best Practices
- [ ] **Separate presentation from logic**：
  - 展示组件（`components/ui/`）：纯函数组件，只接收 props，禁止使用 hooks
  - 业务逻辑组件（`components/features/`）：处理数据获取、状态管理
- [ ] **Restrict Tailwind**：只使用预定义的设计系统（如 `p-base`, `p-double`），禁止使用 `p-4`, `p-8` 等

### Development Setup
- [ ] 确保代码可以 QA：添加测试或验证命令（如 `go test`, `npm test`）
- [ ] 解决开发服务器问题：使用环境变量配置端口（`PORT`, `NEXT_PUBLIC_API_URL`）
- [ ] 添加假数据（seed data）：创建 `backend/seed/seed.go`，确保可以离线运行

## 技术栈

- **后端**: Go (标准库 + gorilla/mux)
- **前端**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **数据库**: SQLite
- **认证**: JWT

## 项目结构要求

```
backend/
├── cmd/server/main.go          # 入口文件
├── internal/
│   ├── auth/                   # 认证逻辑
│   ├── handlers/               # HTTP 处理器
│   ├── models/                 # 数据模型
│   ├── database/               # 数据库操作
│   └── middleware/             # JWT 中间件
├── migrations/                 # 数据库迁移
├── seed/                       # 假数据种子
└── go.mod

frontend/
├── app/
│   ├── login/page.tsx          # 登录页面（展示组件）
│   ├── todos/page.tsx          # Todo 列表页面（展示组件）
│   └── layout.tsx
├── components/
│   ├── ui/                     # 纯展示组件（无状态）
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── TodoItem.tsx
│   └── features/               # 业务逻辑组件
│       ├── LoginForm.tsx       # 包含登录逻辑
│       └── TodoList.tsx        # 包含数据获取和状态管理
├── lib/
│   ├── api.ts                  # API 客户端
│   └── auth.ts                 # 认证工具
└── tailwind.config.js          # 受限的 Tailwind 配置
```

## API 设计

### 认证端点
- `POST /api/auth/register` - 注册（email, password）
- `POST /api/auth/login` - 登录（email, password），返回 JWT token
- `GET /api/auth/me` - 获取当前用户（需要 JWT）

### Todo 端点
- `GET /api/todos` - 获取今天的 todos（需要 JWT）
- `POST /api/todos` - 创建 todo（需要 JWT，title）
- `PUT /api/todos/:id` - 更新 todo（需要 JWT，title, completed）
- `DELETE /api/todos/:id` - 删除 todo（需要 JWT）

## 数据库 Schema

```sql
-- users 表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- todos 表
CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 实现细节

1. **后端实现**：
   - 使用 `golang-jwt/jwt` 生成和验证 JWT token
   - 使用 `golang.org/x/crypto/bcrypt` 加密密码
   - 使用 `gorilla/mux` 处理路由
   - SQLite 数据库文件：`backend/data/todolist.db`

2. **前端实现**：
   - 使用 Next.js App Router
   - JWT token 存储在 localStorage
   - API 调用使用 fetch，统一错误处理
   - 响应式设计，移动端友好

3. **开发环境**：
   - 后端默认端口：`8080`（可通过 `PORT` 环境变量配置）
   - 前端默认端口：`3000`（Next.js 默认）
   - 创建 `scripts/dev-backend.sh` 和 `scripts/dev-frontend.sh`

4. **假数据**：
   - 创建 `backend/seed/seed.go`
   - 预创建测试用户：`test@example.com` / `password123`
   - 每个用户有 5-10 个示例 todos

## ESLint 配置要求

创建 `frontend/.eslintrc.json`：

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "plugins": ["eslint-comments"],
  "rules": {
    "eslint-comments/no-restricted-disable": "error",
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.name='useState']",
        "message": "View components should not manage state. Use controlled props."
      },
      {
        "selector": "CallExpression[callee.name='useEffect']",
        "message": "View components should not use effects. Use controlled props."
      }
    ]
  }
}
```

## Tailwind 配置要求

创建 `frontend/tailwind.config.js`：

```javascript
module.exports = {
  theme: {
    extend: {
      spacing: {
        'base': '1rem',    // 16px
        'double': '2rem',  // 32px
      },
      colors: {
        'primary': '#3b82f6',
        'secondary': '#64748b',
      }
    }
  }
}
```

禁止使用 `p-4`, `p-8`, `m-4` 等，只允许 `p-base`, `p-double`, `m-base` 等。

## 相关文件

参考：
- `TODOLIST_PROJECT_PLAN.md` - 详细的项目计划
- `AGENT_PROTOCOL.md` - Agent 协议
- `REVIEW_CHECKLIST.md` - 代码审查清单

## 给 AI 队友的上下文

- 必须遵守 `AGENT_PROTOCOL.md`：先写计划到 `EXEC_PLAN.md`
- 严格遵循 Vibe Guide 最佳实践（见 `TODOLIST_PROJECT_PLAN.md`）
- 代码变更要小且可审，必须产生非空 diff
- 在 PR 描述中引用本 Issue，并提供验证证据（命令+输出）
- 使用最大的模型（openai/gpt-5.1-codex），确保代码质量

