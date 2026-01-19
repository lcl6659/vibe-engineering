# 测试 Google OAuth 登录流程

## 1. 准备工作

### 清除现有认证信息

打开浏览器控制台（F12），执行以下命令：

```javascript
// 清除所有存储的认证信息
localStorage.clear();
sessionStorage.clear();

// 验证已清除
console.log('auth_token:', localStorage.getItem('auth_token')); // 应该是 null
console.log('user_info:', localStorage.getItem('user_info')); // 应该是 null
```

## 2. 测试自动跳转流程

### 步骤 1: 访问受保护的页面

1. 在浏览器中访问: `http://localhost:3000/insights`
2. **预期行为**：
   - 页面会尝试加载 insights 数据
   - API 调用会返回 401 Unauthorized（因为没有 auth_token）
   - 100ms 后自动跳转到 `/auth` 页面
   - 控制台不会显示红色错误提示（401 错误被静默处理）

### 步骤 2: Google 授权

1. 在 `/auth` 页面，点击 **"Authorize with Google"** 按钮
2. **预期行为**：
   - 浏览器跳转到 Google 授权页面
   - URL 类似：`https://accounts.google.com/o/oauth2/v2/auth?...`

### 步骤 3: Google 授权页面

1. 选择你的 Google 账号
2. 同意授权请求的权限：
   - YouTube 只读访问
   - 用户信息（邮箱、姓名）
3. **预期行为**：
   - Google 重定向回你的应用
   - URL: `http://localhost:3000/auth/google/callback?code=...`

### 步骤 4: 授权回调处理

1. 页面显示 "Authorizing..." 加载状态
2. **预期行为**：
   - 前端使用 code 换取 token
   - 后端创建或查找用户
   - 返回系统 API key 和用户信息
   - 保存到 localStorage
   - 显示 "Authorization successful!"
   - 2秒后自动跳转到 `/insights`

### 步骤 5: 验证登录成功

1. 页面应该成功跳转到 `/insights`
2. 数据正常加载
3. 打开开发者工具 > Application > Local Storage
4. **验证以下项目存在**：

```javascript
// 系统认证（用于后端 API）
localStorage.getItem('auth_token')
// 示例：'451204fb233d4a4be5c6108216bd35370c6095a57882ae72bcf8ee46762142a0'

localStorage.getItem('user_info')
// 示例：'{"id":1,"email":"your@gmail.com","name":"Your Name",...}'

// Google OAuth（用于 YouTube API）
localStorage.getItem('google_access_token')
// 示例：'ya29.a0A...'

localStorage.getItem('google_refresh_token')
// 示例：'1//0d...'

localStorage.getItem('google_token_expiry')
// 示例：'2024-01-20T12:00:00Z'
```

### 步骤 6: 验证 API 请求

1. 打开开发者工具 > Network 标签
2. 刷新 `/insights` 页面
3. 找到对 `/api/v1/insights` 的请求
4. **检查请求头**：

```
Authorization: Bearer 451204fb233d4a4be5c6108216bd35370c6095a57882ae72bcf8ee46762142a0
```

5. **检查响应**：
   - Status Code: `200 OK`
   - 返回 insights 数据

## 3. 测试场景

### 场景 1: 未登录用户访问受保护页面

```
访问 /insights → 401 → 自动跳转到 /auth → 登录 → 跳转回 /insights ✅
```

### 场景 2: 已登录用户访问页面

```
访问 /insights → 使用 auth_token → 200 OK → 正常显示数据 ✅
```

### 场景 3: 从深层链接跳转

```
访问 /insights?search=test → 401 → 跳转到 /auth → 登录 → 跳转回 /insights?search=test ✅
```

## 4. 故障排查

### 问题 1: 跳转后仍显示错误

**症状**: 控制台显示 "Missing authorization header" 错误

**解决方案**:
- 确认 MemoryRail.tsx 中已经添加了 401 错误处理
- 检查 client.ts 中的 401 拦截器是否正确

### 问题 2: Google 授权失败

**症状**: 回调页面显示 "Authorization failed"

**可能原因**:
1. Google OAuth 配置错误
2. Redirect URL 不匹配
3. Client ID 或 Secret 错误

**检查环境变量**:
```bash
# 后端 .env 文件
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URL=http://localhost:3000/auth/google/callback
```

### 问题 3: 用户创建失败

**症状**: 后端日志显示 "Failed to create user"

**检查**:
1. 数据库连接是否正常
2. users 表是否存在
3. 查看后端日志获取详细错误信息

```bash
docker-compose logs backend --tail 100
```

### 问题 4: 循环跳转

**症状**: 在 /auth 和其他页面之间循环跳转

**原因**: 401 拦截器可能在 /auth 页面也被触发

**检查**: client.ts 中是否排除了 /auth 和 /auth/google/callback

```typescript
if (currentPath !== "/auth" && currentPath !== "/auth/google/callback") {
  // ...
}
```

## 5. 调试技巧

### 查看网络请求

```javascript
// 在控制台执行，监控所有 fetch 请求
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch:', args[0], args[1]);
  return originalFetch.apply(this, args);
};
```

### 查看 401 处理流程

在 `frontend/lib/api/client.ts` 的 `handleResponse` 函数中添加调试日志：

```typescript
if (response.status === 401) {
  console.log('[401 Handler] Triggered');
  console.log('[401 Handler] Current path:', currentPath);
  console.log('[401 Handler] Will redirect to /auth');
}
```

### 查看后端日志

```bash
# 实时查看后端日志
docker-compose logs -f backend

# 查看最近的错误
docker-compose logs backend | grep ERROR

# 查看 OAuth 相关日志
docker-compose logs backend | grep -i oauth
```

## 6. 成功标志

✅ 未登录访问 /insights 自动跳转到 /auth
✅ Google 授权后自动返回原页面
✅ localStorage 包含 auth_token 和 user_info
✅ API 请求携带正确的 Authorization header
✅ /insights 页面正常加载数据
✅ 控制台无错误提示
✅ 用户信息正确显示

## 7. 后续优化建议

1. **添加用户信息显示**: 在导航栏显示用户名和退出按钮
2. **Token 过期处理**: 当 API key 失效时自动刷新或重新登录
3. **State 验证**: 实现 OAuth state 参数的生成和验证
4. **HTTPS**: 生产环境使用 HTTPS
5. **错误提示优化**: 更友好的错误提示信息
