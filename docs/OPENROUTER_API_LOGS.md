# OpenRouter API 日志改进文档

## 概述

本文档说明了针对 OpenRouter API 认证失败（401错误）的日志改进。

## 改进内容

### 1. 服务启动日志

系统启动时会检查并显示 OpenRouter API 密钥状态：

#### 密钥已配置

```log
2026-01-19T06:25:25.814Z	INFO	services/chat.go:51	✅ OpenRouter API 服务已初始化
  model: google/gemini-3-flash-preview
  api_key: sk-or-v1-0...ada9  (掩码显示，保护隐私)
```

#### 密钥未配置

```log
ERROR	⚠️  OpenRouter API 密钥未设置
  环境变量: OPENROUTER_API_KEY
  影响功能: 聊天、实体分析等AI功能将无法使用
  解决方案: 请在 .env 文件中设置 OPENROUTER_API_KEY，访问 https://openrouter.ai/ 获取密钥
```

### 2. API 调用失败日志

#### 401 认证失败（聊天服务）

```log
ERROR	services/chat.go:458	❌ OpenRouter API 认证失败 - API密钥无效
  status_code: 401
  response_body: {"error":{"message":"User not found.","code":401}}
  api_key_prefix: sk-or-v1-0...ada9
  error_type: AUTHENTICATION_FAILED
  解决方案: 请检查 OPENROUTER_API_KEY 环境变量，访问 https://openrouter.ai/ 获取有效密钥
```

#### 401 认证失败（流式聊天）

```log
ERROR	services/chat.go:326	❌ OpenRouter API 认证失败 - API密钥无效 (流式请求)
  status_code: 401
  response_body: {"error":{"message":"User not found.","code":401}}
  api_key_prefix: sk-or-v1-0...ada9
  insight_id: 13
  error_type: AUTHENTICATION_FAILED
  解决方案: 请检查 OPENROUTER_API_KEY 环境变量，访问 https://openrouter.ai/ 获取有效密钥
```

#### 401 认证失败（YouTube分析服务）

```log
ERROR	services/youtube.go:1787	❌ OpenRouter API 认证失败 - API密钥无效 (YouTube服务)
  status_code: 401
  response_body: {"error":{"message":"User not found.","code":401}}
  error_type: AUTHENTICATION_FAILED
  解决方案: 请检查 OPENROUTER_API_KEY 环境变量，访问 https://openrouter.ai/ 获取有效密钥
```

#### 401 认证失败（翻译服务）

```log
ERROR	services/translation.go:244	❌ OpenRouter API 认证失败 - API密钥无效 (翻译服务)
  status_code: 401
  response_body: {"error":{"message":"User not found.","code":401}}
  error_type: AUTHENTICATION_FAILED
  解决方案: 请检查 OPENROUTER_API_KEY 环境变量，访问 https://openrouter.ai/ 获取有效密钥
```

### 3. 其他 HTTP 错误

对于非401错误，仍然会记录详细的错误信息：

```log
ERROR	OpenRouter API returned error
  status_code: 500
  response_body: {"error":...}
```

## 安全性

- API 密钥在日志中会被掩码处理，只显示前10个字符和后4个字符
- 例如：`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` 
- 显示为：`sk-or-v1-0...ada9`

## 解决方案

当遇到 OpenRouter API 认证失败时：

1. **检查 API 密钥配置**
   ```bash
   # 查看环境变量
   docker-compose exec backend printenv | grep OPENROUTER_API_KEY
   ```

2. **获取新的 API 密钥**
   - 访问 [https://openrouter.ai/](https://openrouter.ai/)
   - 登录账户
   - 前往 API Keys 页面
   - 生成新密钥

3. **更新环境变量**
   ```bash
   # 编辑 .env 文件
   OPENROUTER_API_KEY=你的新密钥
   ```

4. **重启服务**
   ```bash
   docker-compose restart backend
   ```

## 涉及的文件

- `backend/internal/services/chat.go`
- `backend/internal/services/youtube.go`
- `backend/internal/services/translation.go`

## 测试

可以通过以下方式测试新的日志功能：

1. **测试启动日志**
   ```bash
   docker-compose up backend
   # 查看启动日志中是否显示 API 密钥状态
   ```

2. **测试 API 调用失败日志**
   ```bash
   # 使用无效的 API 密钥
   curl -X POST http://localhost:8080/api/v1/insights/{id}/analyze-entities \
     -H 'Authorization: Bearer YOUR_TOKEN'
   
   # 查看后端日志
   docker-compose logs backend --tail=50 | grep "OpenRouter"
   ```

## 改进效果

使用新的日志系统后，开发者可以：

1. ✅ 快速识别 OpenRouter API 认证问题
2. ✅ 清楚了解哪个服务遇到了认证失败
3. ✅ 获得明确的解决方案指引
4. ✅ 验证 API 密钥是否正确配置
5. ✅ 追踪 API 调用的详细信息

## 版本历史

- **2026-01-19**: 初始版本，添加 OpenRouter API 认证失败的详细日志
