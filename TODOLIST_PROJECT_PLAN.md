# TodoList 项目计划 - 遵循 Vibe Guide 最佳实践

## 项目概述

创建一个完整的 TodoList 网站，包含 Go 后端和 Next.js 前端，遵循 [Vibe Guide](https://www.vibekanban.com/vibe-guide) 的最佳实践。

## 核心原则（来自 Vibe Guide）

### Planning

- ✅ **先做计划**：本文件就是计划
- ✅ **Plan more, review less**：详细规划，减少审查时间
- ✅ **Planning sets the shape**：计划决定代码结构，避免后续修补

### Async & YOLO Mode

- ✅ 使用最大的模型（OpenRouter 的 `openai/gpt-5.1-codex`）
- ✅ 设置代码库以便 AI 可以自行 QA
- ✅ 解决开发服务器问题（避免端口冲突）

### Combating Laziness

- ✅ **No backwards compatibility**：不关心向后兼容，优先代码可读性
- ✅ **Disable disabling lint rules**：禁止使用 `eslint-disable` 等

### Frontend Best Practices

- ✅ **Separate presentation from logic**：分离展示组件和业务逻辑
- ✅ **Restrict Tailwind**：限制 Tailwind 类，使用预定义的设计系统

## 技术栈

### 后端（Go）

- **框架**：标准库 + `gorilla/mux`（路由）
- **数据库**：SQLite（本地开发）
- **认证**：JWT（`golang-jwt/jwt`）
- **密码加密**：`golang.org/x/crypto/bcrypt`

### 前端（Next.js）

- **框架**：Next.js 14+ (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS（受限的设计系统）
- **状态管理**：React Context（简单场景）
- **HTTP 客户端**：fetch API

## 项目结构

```
todolist-project/
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go          # 入口文件
│   ├── internal/
│   │   ├── auth/                 # 认证逻辑
│   │   ├── handlers/             # HTTP 处理器
│   │   ├── models/               # 数据模型
│   │   ├── database/             # 数据库操作
│   │   └── middleware/           # 中间件（JWT 验证）
│   ├── migrations/              # 数据库迁移
│   ├── seed/                     # 假数据种子
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── app/                      # Next.js App Router
│   │   ├── login/
│   │   │   └── page.tsx          # 登录页面（展示组件）
│   │   ├── todos/
│   │   │   └── page.tsx          # Todo 列表页面（展示组件）
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                   # 纯展示组件（无状态）
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── TodoItem.tsx
│   │   └── features/             # 业务逻辑组件
│   │       ├── LoginForm.tsx     # 包含登录逻辑
│   │       └── TodoList.tsx      # 包含数据获取和状态管理
│   ├── lib/
│   │   ├── api.ts                # API 客户端
│   │   └── auth.ts               # 认证工具
│   ├── styles/
│   │   └── globals.css           # Tailwind 配置和设计系统
│   ├── tailwind.config.js        # 受限的 Tailwind 配置
│   ├── package.json
│   └── tsconfig.json
├── .github/
│   └── workflows/
│       └── agent-task.yml        # GitHub Actions 工作流
├── scripts/
│   ├── dev-backend.sh            # 启动后端服务器
│   ├── dev-frontend.sh           # 启动前端服务器
│   └── seed-db.sh                # 填充假数据
├── docker-compose.yml            # 开发环境（可选）
├── .eslintrc.json                # ESLint 配置（禁止禁用规则）
└── README.md
```

## 实现细节

### 后端 API 设计

#### 认证端点

- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户（需要 JWT）

#### Todo 端点

- `GET /api/todos` - 获取今天的 todos（需要 JWT）
- `POST /api/todos` - 创建 todo（需要 JWT）
- `PUT /api/todos/:id` - 更新 todo（需要 JWT）
- `DELETE /api/todos/:id` - 删除 todo（需要 JWT）

### 数据库 Schema

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

### 前端组件设计

#### 展示组件（`components/ui/`）

- **纯函数组件**，只接收 props
- **禁止使用 hooks**（useState, useEffect 等）
- 通过 ESLint 规则强制执行

#### 业务逻辑组件（`components/features/`）

- 包含数据获取、状态管理
- 调用 API 客户端
- 管理认证状态

### Tailwind 限制策略

在 `tailwind.config.js` 中定义设计系统：

```javascript
module.exports = {
  theme: {
    extend: {
      spacing: {
        base: "1rem", // 16px
        double: "2rem", // 32px
      },
      colors: {
        primary: "#3b82f6",
        secondary: "#64748b",
      },
    },
  },
};
```

ESLint 规则禁止使用 `p-4`, `p-8` 等，只允许 `p-base`, `p-double`。

## 开发服务器配置

### 后端

- 默认端口：`8080`
- 使用环境变量 `PORT` 可配置
- 自动检测端口占用，自动分配新端口

### 前端

- 默认端口：`3000`
- Next.js 自动处理端口冲突

### 假数据（Seed Data）

创建 `backend/seed/seed.go`：

- 预创建 2-3 个测试用户
- 每个用户有 5-10 个示例 todos
- 可以离线运行，无需外部依赖

## ESLint 配置

### 禁止禁用 lint 规则

使用 `eslint-comments/no-restricted-disable` 插件。

### 限制展示组件使用 hooks

```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.name='useState']",
        "message": "View components should not manage state. Use controlled props."
      }
    ]
  }
}
```

## 测试策略

### 后端

- 单元测试：`go test ./...`
- 集成测试：测试 API 端点

### 前端

- 组件测试：使用 React Testing Library
- E2E 测试：使用 Playwright（可选）

## GitHub Actions 配置

### 工作流触发条件

- Issue 标题以 `[Agent]` 开头
- 或 Issue 有 `agent-task` 标签

### 工作流步骤

1. Checkout 代码
2. 保存 Issue 内容到 `ISSUE.md`
3. 运行 `scripts/implement_issue.py`
4. 提交代码到新分支 `agent/issue-<ID>`
5. 创建 Pull Request

### 环境变量

- `OPENROUTER_API_KEY`：OpenRouter API 密钥
- `HTTP_REFERER`：可选，默认 `https://github.com`
- `MODEL`：可选，默认 `openai/gpt-5.1-codex`

## 验收标准

- [ ] 用户可以注册和登录
- [ ] 登录后可以看到今天的 todo 列表
- [ ] 可以创建、编辑、删除、完成 todo
- [ ] UI 美观且响应式
- [ ] 代码遵循 Vibe Guide 最佳实践
- [ ] ESLint 规则通过，无禁用规则
- [ ] 展示组件和业务逻辑组件分离
- [ ] Tailwind 使用受限的设计系统
- [ ] 可以离线运行（有假数据）
- [ ] GitHub Actions 可以自动运行代码

## 文件清单

### 需要创建的文件

**后端：**

- `backend/cmd/server/main.go`
- `backend/internal/auth/auth.go`
- `backend/internal/handlers/auth.go`
- `backend/internal/handlers/todos.go`
- `backend/internal/models/user.go`
- `backend/internal/models/todo.go`
- `backend/internal/database/db.go`
- `backend/internal/middleware/jwt.go`
- `backend/migrations/001_init.sql`
- `backend/seed/seed.go`
- `backend/go.mod`

**前端：**

- `frontend/app/login/page.tsx`
- `frontend/app/todos/page.tsx`
- `frontend/app/layout.tsx`
- `frontend/components/ui/Button.tsx`
- `frontend/components/ui/Input.tsx`
- `frontend/components/ui/TodoItem.tsx`
- `frontend/components/features/LoginForm.tsx`
- `frontend/components/features/TodoList.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/auth.ts`
- `frontend/styles/globals.css`
- `frontend/tailwind.config.js`
- `frontend/.eslintrc.json`
- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/next.config.js`

**配置和脚本：**

- `.github/workflows/agent-task.yml`
- `scripts/dev-backend.sh`
- `scripts/dev-frontend.sh`
- `scripts/seed-db.sh`
- `.eslintrc.json`（根目录）
- `README.md`（更新）

## 下一步

1. ✅ 创建本计划文档
2. 创建 GitHub Actions 工作流
3. 创建项目基础结构
4. 实现后端 API
5. 实现前端界面
6. 添加测试和假数据
7. 配置 ESLint 规则
8. 更新 README

## 参考

- [Vibe Guide](https://www.vibekanban.com/vibe-guide)
- [AGENT_PROTOCOL.md](./AGENT_PROTOCOL.md)
- [REVIEW_CHECKLIST.md](./REVIEW_CHECKLIST.md)
