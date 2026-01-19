# OAuth 认证问题修复汇总

## 问题列表

### 1. JSON 解析错误 ✅ 已修复

**错误信息：**
```
SyntaxError: Unexpected token 'd', "d70df2144c"... is not valid JSON
```

**原因：**
- `auth_token` 存储的是普通字符串（API key）
- `getStorageItem` 函数尝试用 `JSON.parse` 解析所有存储项
- 字符串不是有效的 JSON，导致解析失败

**修复：**
- 修改 `getAuthToken()` 直接读取 localStorage，不使用 JSON.parse
- 修改 `setAuthToken()` 直接存储字符串，不使用 JSON.stringify
- 在 OAuth 回调页面添加清理逻辑，确保存储格式正确
- 在 AuthPanel 组件添加自动清理损坏数据的逻辑

**相关文件：**
- `frontend/lib/utils/storage.ts`
- `frontend/app/auth/google/callback/page.tsx`
- `frontend/components/AuthPanel.tsx`

### 2. Next.js 模块加载错误 ✅ 已修复

**错误信息：**
```
Could not find the module "[project]/app/insights/page.tsx#default" 
in the React Client Manifest
```

**原因：**
- Next.js 开发服务器热重载问题
- 使用 `router.push()` 客户端路由可能无法正确加载某些模块

**修复：**
- 移除自动重定向，改为手动点击按钮
- 使用 `window.location.href` 完整页面重新加载
- 添加 "Continue to App" 按钮，让用户控制跳转时机

**相关文件：**
- `frontend/app/auth/google/callback/page.tsx`

### 3. 空响应 JSON 解析错误 ✅ 已修复

**错误信息：**
```
SyntaxError: Unexpected end of JSON input
```

**原因：**
- 后端 OAuth 未配置时返回空响应体
- 前端尝试解析空字符串为 JSON

**修复：**
- 在 `handleResponse` 函数中添加空响应体检查
- 空响应时返回空对象而不是抛出错误
- 添加 try-catch 包裹 JSON 解析

**相关文件：**
- `frontend/lib/api/client.ts`

## 清理工具

### 手动清理（浏览器控制台）

如果仍然遇到认证问题，可以在浏览器控制台（F12）运行以下命令：

```javascript
// 清理所有认证数据
localStorage.removeItem('auth_token');
localStorage.removeItem('user_info');
localStorage.removeItem('google_oauth_token');
localStorage.removeItem('google_access_token');
localStorage.removeItem('google_refresh_token');
localStorage.removeItem('google_token_expiry');
sessionStorage.clear();
console.log('认证数据已清理');
```

### 使用清理页面

访问 `/auth/clear` 页面，点击"清理所有数据"按钮即可清理所有认证相关数据。

## OAuth 配置

如需使用 Google OAuth 功能，请配置以下环境变量：

```bash
# 后端环境变量（.env 或 docker-compose.yml）
GOOGLE_CLIENT_ID=你的客户端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=你的客户端密钥
GOOGLE_REDIRECT_URL=http://localhost:3000/auth/google/callback
```

详细配置步骤请参考 `docs/AUTH_SETUP.md`

## 完整的 OAuth 流程

1. 访问 `/auth` 页面
2. 点击 "Authorize with Google" 按钮
3. 跳转到 Google 授权页面
4. 授权成功后返回 `/auth/google/callback`
5. 自动清理旧数据并存储新令牌
6. 显示 "Authorization Complete" 和 "Continue to App" 按钮
7. 点击按钮后重新加载页面并跳转到应用

## 测试步骤

1. 清理所有认证数据（访问 `/auth/clear` 或在控制台运行清理命令）
2. 刷新浏览器
3. 访问 `/auth` 页面
4. 点击 "Authorize with Google"
5. 完成 Google 授权
6. 点击 "Continue to App"
7. 验证是否成功登录

## 故障排除

### 问题：点击授权按钮后显示"OAuth 未配置"

**解决方案：**
- 检查后端环境变量 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 是否已配置
- 重启后端服务

### 问题：授权后仍然显示模块加载错误

**解决方案：**
- 重启前端开发服务器
- 清理 `.next` 缓存目录：`rm -rf .next && npm run dev`

### 问题：授权成功但无法访问需要认证的页面

**解决方案：**
- 检查浏览器控制台，查看 localStorage 中是否有 `auth_token`
- 访问 `/auth/clear` 清理数据并重新授权

## 自动修复

以下情况会自动清理损坏的数据：

1. 访问 `/auth` 页面时，AuthPanel 组件会自动检查并清理损坏的 `auth_token`
2. 进行 OAuth 回调时，会先清理所有旧数据再存储新数据
3. `getAuthToken()` 函数现在能正确处理普通字符串格式的令牌

## 代码改进

### storage.ts

```typescript
// 之前（错误）
export function getAuthToken(): string | null {
  return getStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN); // 会尝试 JSON.parse
}

// 现在（正确）
export function getAuthToken(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN); // 直接读取字符串
  } catch (error) {
    console.error('Failed to get auth token', error);
    return null;
  }
}
```

### client.ts

```typescript
// 之前（错误）
data = await response.json(); // 空响应时会抛出错误

// 现在（正确）
const text = await response.text();
data = text ? JSON.parse(text) : {}; // 空响应返回空对象
```

## 相关文档

- [Google OAuth 配置指南](./AUTH_SETUP.md)
- [OAuth 配置错误修复](./AUTH_SETUP_ERROR.md)
