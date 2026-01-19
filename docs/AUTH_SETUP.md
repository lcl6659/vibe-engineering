# Google OAuth 登录流程说明

## 功能概述

系统已经实现了使用 Google OAuth 作为统一登录方式的功能。用户通过 Google 账号登录后，系统会：

1. 获取用户的 Google 账号信息（邮箱、姓名）
2. 在数据库中创建或查找对应的系统用户
3. 返回系统 API key 用于后续 API 调用
4. 同时保存 Google OAuth token 用于访问 YouTube API

## 工作流程

### 1. 用户访问受保护页面（如 /insights）

- 前端检测到没有 `auth_token`
- 调用 API 时返回 401 Unauthorized
- **自动跳转**到 `/auth` 页面

### 2. 用户在 /auth 页面点击 Google 登录

- 前端调用 `GET /api/v1/auth/google/url` 获取 Google OAuth 授权链接
- 用户被重定向到 Google 授权页面

### 3. 用户在 Google 授权页面同意授权

- Google 重定向回 `/auth/google/callback?code=xxx`
- 前端提取 `code` 参数

### 4. 前端 callback 处理

```typescript
// POST /api/v1/auth/google/callback
{
  code: "google_auth_code",
  state: "optional_state"
}
```

### 5. 后端处理 OAuth callback

后端执行以下步骤：

1. 用授权码换取 Google OAuth token
2. 使用 token 获取用户的 Google 账号信息（邮箱、姓名）
3. 在数据库中查找该邮箱对应的用户
   - 如果不存在，创建新用户
   - 如果存在，直接使用该用户
4. 返回响应：

```json
{
  "accessToken": "google_access_token",
  "refreshToken": "google_refresh_token",
  "tokenType": "Bearer",
  "expiry": "2024-01-20T12:00:00Z",
  "tokenJSON": "{...}",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "User Name",
    "created_at": "2024-01-19T12:00:00Z"
  },
  "apiKey": "451204fb233d4a4be5c6108216bd35370c6095a57882ae72bcf8ee46762142a0"
}
```

### 6. 前端保存认证信息

```javascript
// 系统 API 认证（用于后端 API 调用）
localStorage.setItem('auth_token', response.apiKey);
localStorage.setItem('user_info', JSON.stringify(response.user));

// Google OAuth token（用于 YouTube API 调用）
localStorage.setItem('google_oauth_token', response.tokenJSON);
localStorage.setItem('google_access_token', response.accessToken);
localStorage.setItem('google_refresh_token', response.refreshToken);
localStorage.setItem('google_token_expiry', response.expiry);
```

### 7. 自动跳转回原页面

- 跳转到 `sessionStorage.getItem('auth_return_url')` 或默认的 `/insights`
- 用户可以正常使用系统功能

## 自动 401 跳转机制

在 `frontend/lib/api/client.ts` 的 `handleResponse` 函数中：

```typescript
// Handle 401 Unauthorized - redirect to login
if (response.status === 401 && typeof window !== "undefined") {
  // Save current URL to return after login
  const currentPath = window.location.pathname + window.location.search;
  if (currentPath !== "/auth" && currentPath !== "/auth/google/callback") {
    sessionStorage.setItem("auth_return_url", currentPath);
  }
  // Redirect to auth page
  window.location.href = "/auth";
}
```

## 数据库用户表结构

```go
type User struct {
    ID       uint   `json:"id" gorm:"primaryKey"`
    Email    string `json:"email" gorm:"type:varchar(255);uniqueIndex;not null"`
    Password string `json:"-" gorm:"type:varchar(255);not null"` // OAuth 用户使用占位符
    Name     string `json:"name" gorm:"type:varchar(255)"`
    APIKey   string `json:"-" gorm:"type:varchar(64);uniqueIndex;not null"`
    
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt `gorm:"index"`
}
```

## 测试步骤

### 准备工作

1. 确保已配置 Google OAuth 环境变量：
   ```bash
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URL=http://localhost:3000/auth/google/callback
   ```

2. 清除浏览器 localStorage（模拟未登录状态）：
   ```javascript
   localStorage.clear();
   ```

### 测试流程

1. **访问受保护页面**
   - 打开浏览器访问 `http://localhost:3000/insights`
   - 应该自动跳转到 `/auth` 页面

2. **Google 登录**
   - 点击 "Authorize with Google" 按钮
   - 在 Google 授权页面登录并同意授权
   - 应该自动跳转回 `/insights` 页面

3. **验证登录状态**
   - 打开浏览器开发者工具 > Application > Local Storage
   - 检查是否存在：
     - `auth_token`: 系统 API key
     - `user_info`: 用户信息
     - `google_access_token`: Google OAuth token

4. **测试 API 调用**
   - 在 `/insights` 页面应该能正常加载数据
   - 查看 Network 标签，API 请求的 `Authorization` header 应该包含 `Bearer <auth_token>`

5. **测试自动跳转**
   - 清除 localStorage
   - 访问任何需要认证的页面（如 `/insights`）
   - 应该自动跳转到 `/auth`
   - 登录后自动返回原页面

## 技术细节

### 后端改动

1. **services/oauth.go**
   - 添加 `GetUserInfo()` 方法获取 Google 用户信息
   - 添加 userinfo.email 和 userinfo.profile scopes

2. **handlers/youtube_api.go**
   - 修改 `HandleCallback()` 创建/查找系统用户
   - 返回系统 API key 和用户信息

3. **models/youtube.go**
   - 扩展 `OAuthCallbackResponse` 包含 user 和 apiKey 字段

4. **router/router.go**
   - 向 `YouTubeAPIHandler` 注入 `UserRepository`

### 前端改动

1. **lib/api/client.ts**
   - 修改 `handleResponse()` 添加 401 拦截逻辑
   - 修改 `buildHeaders()` 优先使用系统 auth_token

2. **app/auth/google/callback/page.tsx**
   - 保存系统 API key 到 `auth_token`
   - 保存用户信息到 `user_info`
   - 默认跳转到 `/insights`

## 安全注意事项

1. **State 参数**：目前使用固定的 state token，生产环境应该生成随机 state 并验证
2. **HTTPS**：生产环境必须使用 HTTPS
3. **Token 存储**：使用 httpOnly cookies 会更安全，但需要修改架构
4. **API Key 保护**：确保 API key 不会被记录到日志中
