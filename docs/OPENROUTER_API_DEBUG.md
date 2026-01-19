# OpenRouter API 调试指南

## 当前问题

后端调用 OpenRouter API 时返回 401 错误：
```json
{"error":{"message":"User not found.","code":401}}
```

## 可能的原因

### 1. API Key 账户问题

访问 [OpenRouter Dashboard](https://openrouter.ai/activity) 检查：

- ✅ 账户是否激活
- ✅ API Key 是否有效
- ✅ 账户是否有余额（如果需要）
- ✅ API Key 是否有使用限制

### 2. 缺少必需的请求头

OpenRouter 官方文档建议添加以下请求头：

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "HTTP-Referer: http://localhost:3000" \
  -H "X-Title: VIBE Engineering Playbook" \
  -d '{
    "model": "google/gemini-flash-1.5",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

### 3. API Key 格式问题

确保 API Key 格式正确：
- 应该以 `sk-or-v1-` 开头
- 长度应该是 64+ 字符
- 没有空格或换行符

## 快速诊断

### 测试 1：验证 API Key

```bash
# 设置你的 API Key
export OPENROUTER_API_KEY="你的API_Key"

# 测试基本调用
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: http://localhost:3000" \
  -H "X-Title: Test" \
  -d '{
    "model": "google/gemini-flash-1.5",
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 10
  }'
```

成功的响应应该是：
```json
{
  "id": "gen-...",
  "model": "google/gemini-flash-1.5",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Hello!"
      },
      ...
    }
  ],
  ...
}
```

### 测试 2：检查账户状态

访问以下链接检查账户信息：

```bash
curl https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### 测试 3：列出可用模型

```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

## 修复方案

### 方案 1：更新后端代码添加必需的请求头

修改 `backend/internal/services/youtube.go` 的 `callGemini` 函数：

```go
req.Header.Set("Content-Type", "application/json")
req.Header.Set("Authorization", "Bearer "+s.openRouterAPIKey)
req.Header.Set("HTTP-Referer", "http://localhost:3000") // 添加这行
req.Header.Set("X-Title", "VIBE Engineering Playbook") // 添加这行
```

### 方案 2：检查 API Key 是否正确加载

在容器中验证：

```bash
# 检查环境变量
docker-compose exec backend printenv | grep OPENROUTER

# 应该输出：
# OPENROUTER_API_KEY=sk-or-v1-...
```

### 方案 3：重新生成 API Key

1. 访问 [OpenRouter API Keys](https://openrouter.ai/keys)
2. 删除旧的 API Key
3. 创建新的 API Key
4. 复制新的 API Key
5. 更新 `.env` 文件
6. 重启服务

## 常见错误

### 错误 1: "User not found" (401)

**可能原因：**
- API Key 无效或已撤销
- 账户已删除
- API Key 格式错误

**解决方案：**
- 重新生成 API Key
- 检查账户状态
- 验证 API Key 格式

### 错误 2: "Insufficient credits" (402)

**可能原因：**
- 账户余额不足
- 需要充值

**解决方案：**
- 访问 [OpenRouter Credits](https://openrouter.ai/credits) 充值

### 错误 3: "Rate limit exceeded" (429)

**可能原因：**
- 超过免费额度
- 请求频率过高

**解决方案：**
- 等待限制重置
- 升级账户

## OpenRouter 账户设置

### 免费额度

OpenRouter 提供有限的免费额度：
- 某些模型完全免费
- 某些模型需要付费

查看 [模型定价](https://openrouter.ai/models)

### 推荐配置

在 `.env` 中使用免费或便宜的模型：

```bash
# 免费模型（推荐开始使用）
GEMINI_MODEL=google/gemini-flash-1.5

# 或者其他免费模型
GEMINI_MODEL=meta-llama/llama-3.2-3b-instruct:free
GEMINI_MODEL=mistralai/mistral-7b-instruct:free
```

## 验证修复

修复后，运行以下命令验证：

```bash
# 1. 重启服务
docker-compose down
docker-compose up --build

# 2. 检查日志
docker-compose logs backend | grep -i "openrouter"

# 3. 在前端重新处理失败的内容
# 访问 http://localhost:3000/insights
# 点击失败的项目
# 点击"重新处理"按钮
```

## 联系支持

如果问题持续：

1. 查看 [OpenRouter 文档](https://openrouter.ai/docs)
2. 访问 [OpenRouter Discord](https://discord.gg/openrouter)
3. 发送邮件到 OpenRouter 支持团队

## 调试日志

启用详细日志：

```bash
# 在 docker-compose.yml 中设置
LOG_LEVEL=debug
```

然后查看详细的 API 调用日志：

```bash
docker-compose logs -f backend | grep -A 10 -B 10 "OpenRouter"
```
