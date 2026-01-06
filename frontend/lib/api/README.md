# API 模块文档

本模块提供了完整的 API 服务层架构，包括配置、客户端封装和服务层。

## 目录结构

```
lib/api/
├── config.ts              # API 配置（baseURL、端点等）
├── types.ts               # TypeScript 类型定义
├── client.ts              # HTTP 客户端封装
├── services/              # API 服务层
│   ├── pomodoro.service.ts
│   └── index.ts
├── index.ts               # 统一导出
└── README.md              # 本文档
```

## 快速开始

### 1. 配置环境变量

创建 `.env.local` 文件（参考 `.env.example`）：

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 2. 使用 API 服务

```tsx
import { pomodoroService } from "@/lib/api";

// 创建 Pomodoro
const pomodoro = await pomodoroService.create({
  start_time: "2024-01-01T10:00:00Z",
  end_time: "2024-01-01T10:25:00Z",
  duration: 25,
});

// 获取列表
const list = await pomodoroService.list();

// 获取单个
const item = await pomodoroService.getById(1);

// 更新
const updated = await pomodoroService.update(1, {
  is_completed: true,
});

// 删除
await pomodoroService.delete(1);
```

### 3. 直接使用 HTTP 客户端

```tsx
import { apiClient } from "@/lib/api";

// GET 请求
const data = await apiClient.get("/endpoint", {
  params: { page: 1, pageSize: 10 },
});

// POST 请求
const result = await apiClient.post("/endpoint", {
  name: "Example",
});

// PUT 请求
await apiClient.put("/endpoint/1", {
  name: "Updated",
});

// DELETE 请求
await apiClient.delete("/endpoint/1");
```

## 功能特性

### ✅ 统一配置管理
- 环境变量支持
- 可配置的 baseURL
- 统一的 API 版本管理

### ✅ 请求拦截
- 自动添加认证 token
- 统一的请求头管理
- 请求超时控制

### ✅ 错误处理
- 统一的错误类型（ApiError）
- 详细的错误信息
- 网络错误处理

### ✅ TypeScript 支持
- 完整的类型定义
- 类型安全的 API 调用
- 自动补全支持

### ✅ 响应处理
- 自动 JSON 解析
- 统一的响应格式
- 错误响应处理

## 添加新的 API 服务

### 1. 在 `config.ts` 中添加端点

```typescript
export const API_ENDPOINTS = {
  // ... 现有端点
  NEW_SERVICE: {
    BASE: "/new-service",
    CREATE: "/new-service",
    LIST: "/new-service",
    GET: (id: string | number) => `/new-service/${id}`,
  },
} as const;
```

### 2. 创建服务文件

在 `services/` 目录下创建 `new-service.service.ts`：

```typescript
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";

export interface NewServiceItem {
  id: number;
  name: string;
}

class NewService {
  async list(): Promise<NewServiceItem[]> {
    const response = await apiClient.get(API_ENDPOINTS.NEW_SERVICE.LIST);
    return response.data || response;
  }
}

export const newService = new NewService();
export default NewService;
```

### 3. 导出服务

在 `services/index.ts` 中添加：

```typescript
export * from "./new-service.service";
```

在 `lib/api/index.ts` 中添加：

```typescript
export * from "./services/new-service.service";
```

## 错误处理示例

```tsx
import { pomodoroService, ApiError } from "@/lib/api";

try {
  const pomodoro = await pomodoroService.create({
    start_time: "2024-01-01T10:00:00Z",
    end_time: "2024-01-01T10:25:00Z",
    duration: 25,
  });
} catch (error) {
  if (error instanceof ApiError) {
    console.error("API Error:", error.status, error.message);
    console.error("Response data:", error.data);
  } else {
    console.error("Unknown error:", error);
  }
}
```

## 认证 Token 管理

认证 token 会自动从 `localStorage` 中读取 `auth_token`。

设置 token：

```typescript
localStorage.setItem("auth_token", "your-token-here");
```

清除 token：

```typescript
localStorage.removeItem("auth_token");
```

## 自定义请求配置

```tsx
import { apiClient } from "@/lib/api";

// 自定义超时时间
const data = await apiClient.get("/endpoint", {
  timeout: 10000, // 10秒
});

// 自定义请求头
const result = await apiClient.post("/endpoint", body, {
  headers: {
    "X-Custom-Header": "value",
  },
});

// 使用 AbortController 取消请求
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

try {
  await apiClient.get("/endpoint", {
    signal: controller.signal,
  });
} catch (error) {
  // 请求被取消
}
```

## 注意事项

1. **环境变量**：必须以 `NEXT_PUBLIC_` 开头才能在客户端使用
2. **类型安全**：建议为所有 API 响应定义 TypeScript 类型
3. **错误处理**：始终使用 try-catch 处理 API 调用
4. **Token 管理**：生产环境建议使用更安全的 token 存储方式

