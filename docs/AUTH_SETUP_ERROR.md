# Google OAuth 配置错误修复

## 问题描述

当访问 `/auth` 页面并点击 "Authorize with Google" 按钮时，出现以下错误：

```
Runtime SyntaxError
Unexpected end of JSON input
```

## 问题原因

后端的 Google OAuth 凭证未配置（`GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 环境变量为空），导致后端返回错误响应，前端在解析 JSON 时出错。

## 解决方案

### 1. 前端错误处理优化（已修复）

更新了 `frontend/lib/api/client.ts` 中的 `handleResponse` 函数，使其能够处理空响应体：

```typescript
// 尝试解析 JSON，如果响应体为空则返回空对象
const text = await response.text();
data = text ? JSON.parse(text) : {};
```

### 2. 配置 Google OAuth（需要操作）

#### 步骤 1：创建 Google OAuth 应用

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 YouTube Data API v3
4. 创建 OAuth 2.0 凭据：
   - 应用类型：Web 应用
   - 授权重定向 URI：`http://localhost:3000/auth/google/callback` (开发环境)
   - 授权重定向 URI：`https://your-domain.com/auth/google/callback` (生产环境)

#### 步骤 2：配置环境变量

在后端项目根目录创建 `.env` 文件（或配置 Docker Compose 环境变量）：

```bash
# Google OAuth 2.0 配置
GOOGLE_CLIENT_ID=你的客户端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=你的客户端密钥
GOOGLE_REDIRECT_URL=http://localhost:3000/auth/google/callback
```

#### 步骤 3：重启服务

```bash
docker-compose down
docker-compose up --build
```

### 3. 验证配置

访问 `http://localhost:3000/auth` 并点击 "Authorize with Google" 按钮，应该会重定向到 Google 登录页面。

## 当前状态

- ✅ 前端错误处理已优化
- ⚠️ 后端 OAuth 凭证未配置（需要手动配置）

## 临时解决方案

如果暂时不需要 Google OAuth 功能，可以暂时不配置。但访问 `/auth` 页面时仍会显示授权按钮。

如果需要完全禁用 OAuth 功能，可以：

1. 移除 `/auth` 页面的路由
2. 或者在 AuthPanel 组件中检查 OAuth 是否配置，如果未配置则显示提示信息
