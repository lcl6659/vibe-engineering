# 前端模块清单

本文档列出了前端项目的所有模块及其功能。

## ✅ 已完成的模块

### 1. 核心框架
- ✅ Next.js 16 (App Router)
- ✅ React 19
- ✅ TypeScript
- ✅ Tailwind CSS v4
- ✅ shadcn/ui (53个组件)

### 2. API 服务层 (`lib/api/`)
- ✅ HTTP 客户端 (`client.ts`)
- ✅ API 配置 (`config.ts`)
- ✅ 类型定义 (`types.ts`)
- ✅ Pomodoro 服务示例 (`services/pomodoro.service.ts`)
- ✅ API Hooks (`hooks/use-pomodoro.ts`)

### 3. 工具函数库 (`lib/utils/`)
- ✅ 基础工具 (`utils.ts`) - cn 函数等
- ✅ Toast 工具 (`toast.ts`) - 通知提示
- ✅ 格式化工具 (`format.ts`) - 文件大小、货币、百分比等
- ✅ 验证工具 (`validation.ts`) - 邮箱、手机号、密码等
- ✅ 存储工具 (`storage.ts`) - localStorage/sessionStorage
- ✅ 日期工具 (`date.ts`) - 日期格式化、相对时间等

### 4. 配置模块
- ✅ 常量配置 (`lib/constants/`) - 应用常量、路由、存储键等
- ✅ 环境配置 (`lib/config/env.ts`) - 环境变量管理

### 5. 类型定义 (`types/`)
- ✅ 全局类型定义 - API 响应、分页、用户等类型

### 6. Hooks (`hooks/`)
- ✅ `useDebounce` - 防抖
- ✅ `useLocalStorage` - 本地存储
- ✅ `useMediaQuery` - 媒体查询
- ✅ `useClickOutside` - 点击外部区域
- ✅ `useIsMobile` - 移动端检测
- ✅ `useIsTablet` - 平板检测
- ✅ `useIsDesktop` - 桌面端检测

### 7. 组件库
- ✅ shadcn/ui 组件 (53个)
- ✅ 布局组件 (`components/layout/main-layout.tsx`)
- ✅ 错误边界 (`components/error-boundary.tsx`)
- ✅ 加载组件 (`components/loading.tsx`)

### 8. Next.js 特殊页面
- ✅ 全局错误页面 (`app/error.tsx`)
- ✅ 404 页面 (`app/not-found.tsx`)
- ✅ 全局加载页面 (`app/loading.tsx`)

### 9. 中间件
- ✅ Next.js 中间件 (`middleware.ts`)

## 📦 模块导出

### API 模块
```tsx
import { apiClient, pomodoroService } from "@/lib/api";
import { usePomodoros } from "@/lib/api/hooks";
```

### 工具函数
```tsx
import { cn, formatFileSize, isValidEmail, setAuthToken, formatDate, toast } from "@/lib/utils";
```

### Hooks
```tsx
import { useDebounce, useLocalStorage, useIsMobile } from "@/hooks";
```

### 常量
```tsx
import { ROUTES, STORAGE_KEYS, PAGINATION } from "@/lib/constants";
```

### 类型
```tsx
import type { User, ApiResponse, PaginatedResponse } from "@/types";
```

### 组件
```tsx
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loading } from "@/components/loading";
```

## 🎯 模块化特性

1. **统一导出**: 每个模块都有统一的导出接口
2. **类型安全**: 完整的 TypeScript 类型定义
3. **易于扩展**: 清晰的模块结构，易于添加新功能
4. **代码复用**: 丰富的工具函数和 Hooks
5. **错误处理**: 统一的错误处理机制

## 📚 相关文档

- [架构文档](./ARCHITECTURE.md) - 完整的项目架构说明
- [API 文档](./lib/api/README.md) - API 服务层文档
- [组件列表](./components/ui/COMPONENTS.md) - shadcn/ui 组件列表

