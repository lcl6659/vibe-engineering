# 前端项目架构文档

本文档描述了前端项目的完整模块化架构。

## 📁 项目结构

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 首页
│   ├── error.tsx                # 全局错误页面
│   ├── not-found.tsx            # 404 页面
│   ├── loading.tsx              # 全局加载页面
│   └── globals.css              # 全局样式
│
├── components/                   # React 组件
│   ├── ui/                      # shadcn/ui 组件库（53个组件）
│   ├── layout/                  # 布局组件
│   │   └── main-layout.tsx
│   ├── error-boundary.tsx       # 错误边界组件
│   └── loading.tsx             # 加载组件
│
├── hooks/                        # 自定义 Hooks
│   ├── use-debounce.ts          # 防抖 Hook
│   ├── use-local-storage.ts     # 本地存储 Hook
│   ├── use-media-query.ts       # 媒体查询 Hook
│   ├── use-click-outside.ts     # 点击外部区域 Hook
│   ├── use-mobile.tsx           # 移动端检测 Hook
│   └── index.ts                 # 统一导出
│
├── lib/                          # 核心库
│   ├── api/                     # API 服务层
│   │   ├── client.ts            # HTTP 客户端
│   │   ├── config.ts            # API 配置
│   │   ├── types.ts             # API 类型定义
│   │   ├── services/           # API 服务
│   │   │   └── pomodoro.service.ts
│   │   ├── hooks/               # API Hooks
│   │   │   └── use-pomodoro.ts
│   │   └── index.ts             # 统一导出
│   │
│   ├── config/                  # 配置模块
│   │   └── env.ts               # 环境配置
│   │
│   ├── constants/               # 常量定义
│   │   └── index.ts             # 应用常量
│   │
│   └── utils/                   # 工具函数
│       ├── utils.ts             # 基础工具（cn 函数等）
│       ├── toast.ts             # Toast 工具
│       ├── format.ts             # 格式化工具
│       ├── validation.ts         # 验证工具
│       ├── storage.ts            # 存储工具
│       ├── date.ts               # 日期工具
│       └── index.ts              # 统一导出
│
├── types/                        # 全局类型定义
│   └── index.ts
│
├── middleware.ts                  # Next.js 中间件
├── components.json              # shadcn/ui 配置
├── tailwind.config.ts           # Tailwind 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                 # 依赖配置
```

## 🏗️ 模块说明

### 1. API 服务层 (`lib/api/`)

**功能**: 统一的 API 请求管理

**核心文件**:
- `client.ts` - HTTP 客户端封装，支持拦截器、错误处理、超时控制
- `config.ts` - API 基础配置（baseURL、端点等）
- `types.ts` - API 相关类型定义
- `services/` - 业务 API 服务（如 pomodoro.service.ts）
- `hooks/` - API 相关的 React Hooks

**使用示例**:
```tsx
import { pomodoroService } from "@/lib/api";
import { usePomodoros } from "@/lib/api/hooks";

// 使用服务层
const data = await pomodoroService.list();

// 使用 Hook
const { pomodoros, loading, error } = usePomodoros();
```

### 2. 工具函数库 (`lib/utils/`)

**功能**: 通用工具函数集合

**模块**:
- `utils.ts` - 基础工具（cn 函数等）
- `toast.ts` - Toast 通知工具
- `format.ts` - 格式化工具（文件大小、货币、百分比等）
- `validation.ts` - 验证工具（邮箱、手机号、密码等）
- `storage.ts` - 本地存储工具（localStorage/sessionStorage）
- `date.ts` - 日期时间工具

**使用示例**:
```tsx
import { formatFileSize, formatCurrency } from "@/lib/utils/format";
import { isValidEmail, isValidPhone } from "@/lib/utils/validation";
import { setAuthToken, getAuthToken } from "@/lib/utils/storage";
import { formatDate, getRelativeTime } from "@/lib/utils/date";
import { toast } from "@/lib/utils/toast";
```

### 3. 常量配置 (`lib/constants/`)

**功能**: 应用常量集中管理

**包含**:
- 应用信息
- 路由路径
- 存储键名
- HTTP 状态码
- 分页配置
- 日期格式
- 文件上传配置
- 验证规则
- 防抖延迟时间

**使用示例**:
```tsx
import { ROUTES, STORAGE_KEYS, PAGINATION } from "@/lib/constants";
```

### 4. 环境配置 (`lib/config/env.ts`)

**功能**: 环境变量统一管理

**特性**:
- 类型安全的环境变量访问
- 环境验证
- 开发/生产环境区分

**使用示例**:
```tsx
import { env } from "@/lib/config/env";

const apiUrl = env.API_URL;
const isDev = env.IS_DEV;
```

### 5. 类型定义 (`types/`)

**功能**: 全局 TypeScript 类型定义

**包含**:
- API 响应类型
- 分页类型
- 用户类型
- 文件上传类型
- 选择项类型
- 表格列配置类型
- 菜单项类型

**使用示例**:
```tsx
import type { ApiResponse, PaginatedResponse, User } from "@/types";
```

### 6. Hooks (`hooks/`)

**功能**: 可复用的 React Hooks

**Hooks**:
- `useDebounce` - 防抖
- `useLocalStorage` - 本地存储
- `useMediaQuery` - 媒体查询
- `useClickOutside` - 点击外部区域
- `useIsMobile` - 移动端检测
- `useIsTablet` - 平板检测
- `useIsDesktop` - 桌面端检测

**使用示例**:
```tsx
import { useDebounce, useLocalStorage, useIsMobile } from "@/hooks";

const [value, setValue] = useLocalStorage("key", "default");
const debouncedValue = useDebounce(value, 300);
const isMobile = useIsMobile();
```

### 7. 组件 (`components/`)

**功能**: React 组件库

**分类**:
- `ui/` - shadcn/ui 组件（53个）
- `layout/` - 布局组件
- `error-boundary.tsx` - 错误边界
- `loading.tsx` - 加载组件

**使用示例**:
```tsx
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loading } from "@/components/loading";
```

### 8. Next.js 特殊页面 (`app/`)

**功能**: Next.js App Router 特殊页面

- `error.tsx` - 全局错误页面
- `not-found.tsx` - 404 页面
- `loading.tsx` - 全局加载页面

### 9. 中间件 (`middleware.ts`)

**功能**: Next.js 中间件，用于请求拦截、认证、重定向等

## 🔧 核心特性

### ✅ 类型安全
- 完整的 TypeScript 类型定义
- 类型安全的 API 调用
- 类型安全的工具函数

### ✅ 模块化设计
- 清晰的模块划分
- 统一的导出接口
- 易于扩展和维护

### ✅ 错误处理
- 统一的错误处理机制
- 错误边界组件
- 全局错误页面

### ✅ 性能优化
- 防抖/节流 Hooks
- 代码分割
- 懒加载支持

### ✅ 开发体验
- 完整的类型提示
- 统一的代码风格
- 完善的工具函数

## 📦 依赖管理

### 核心依赖
- **Next.js 16** - React 框架
- **React 19** - UI 库
- **TypeScript** - 类型系统
- **Tailwind CSS v4** - 样式框架
- **shadcn/ui** - 组件库

### 工具库
- **date-fns** - 日期处理
- **zod** - 数据验证
- **sonner** - Toast 通知
- **react-hook-form** - 表单处理

## 🚀 快速开始

### 1. 导入模块

```tsx
// API 服务
import { pomodoroService } from "@/lib/api";

// 工具函数
import { formatDate, isValidEmail } from "@/lib/utils";

// Hooks
import { useDebounce, useLocalStorage } from "@/hooks";

// 组件
import { Button } from "@/components/ui/button";

// 常量
import { ROUTES, STORAGE_KEYS } from "@/lib/constants";

// 类型
import type { User, ApiResponse } from "@/types";
```

### 2. 使用示例

```tsx
"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks";
import { pomodoroService } from "@/lib/api";
import { toast } from "@/lib/utils/toast";
import { Button } from "@/components/ui/button";

export default function MyComponent() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const handleClick = async () => {
    try {
      const data = await pomodoroService.list();
      toast.success("加载成功");
    } catch (error) {
      toast.error("加载失败");
    }
  };

  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <Button onClick={handleClick}>提交</Button>
    </div>
  );
}
```

## 📝 最佳实践

1. **统一导入**: 使用统一的导出接口，避免深层导入
2. **类型安全**: 始终使用 TypeScript 类型
3. **错误处理**: 使用统一的错误处理机制
4. **代码复用**: 优先使用已有的工具函数和 Hooks
5. **模块化**: 保持模块职责单一，易于测试和维护

## 🔄 扩展指南

### 添加新的 API 服务

1. 在 `lib/api/services/` 创建服务文件
2. 在 `lib/api/config.ts` 添加端点配置
3. 在 `lib/api/services/index.ts` 导出
4. 可选：创建对应的 Hook

### 添加新的工具函数

1. 在 `lib/utils/` 创建工具文件
2. 在 `lib/utils/index.ts` 导出
3. 添加类型定义和文档

### 添加新的 Hook

1. 在 `hooks/` 创建 Hook 文件
2. 在 `hooks/index.ts` 导出
3. 添加使用示例和文档

## 🚀 代码生成约束

### 系统文件列表

以下文件定义了项目的核心架构模式，代码生成时必须参考：

<!-- AGENT_SYSTEM_FILES_START -->
```
frontend/app/globals.css
frontend/app/layout.tsx
frontend/app/page.tsx
frontend/components.json
frontend/hooks/index.ts
frontend/lib/api/client.ts
frontend/lib/api/config.ts
frontend/lib/api/endpoints.ts
frontend/lib/api/types.ts
frontend/lib/config/env.ts
frontend/lib/constants/index.ts
frontend/lib/utils/toast.ts
frontend/lib/utils/utils.ts
frontend/middleware.ts
frontend/package.json
frontend/tailwind.config.ts
frontend/tsconfig.json
frontend/types/index.ts
```
<!-- AGENT_SYSTEM_FILES_END -->

### 代码生成规则

1. **遵循模块化架构**
   - API 服务层 → `lib/api/`
   - 工具函数 → `lib/utils/`
   - 组件 → `components/`
   - Hooks → `hooks/`
   - 类型定义 → `types/`

2. **路径约束**
   - 所有文件必须在 `frontend/` 目录下
   - 遵循现有目录结构
   - 不允许在 `frontend/` 目录外创建文件

3. **代码风格**
   - 使用 TypeScript 严格模式
   - 遵循现有代码风格
   - 使用统一的导入路径别名 `@/`

4. **组件规范**
   - 使用 shadcn/ui 组件库
   - 遵循组件命名规范
   - 使用统一的样式方案（Tailwind CSS）

5. **API 调用**
   - 使用统一的 API 客户端
   - 遵循 API 服务层模式
   - 使用类型安全的 API 调用

## 📚 相关文档

- [API 模块文档](./lib/api/README.md)
- [组件列表](./components/ui/COMPONENTS.md)
- [Next.js 文档](https://nextjs.org/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)

