# YouTube 视频解析修复文档

## 问题描述

之前在解析 YouTube 视频时遇到以下问题：

1. **视频解析失败**：依赖 OpenRouter API 获取视频元数据，当 API 密钥无效时解析失败
2. **错误的404响应**：OpenRouter API 错误中包含 "User not found"，被误判为 "Insight not found"，返回404
3. **没有充分利用 yt-dlp**：系统已安装 yt-dlp 但没有在视频元数据获取中使用

## 解决方案

### 1. 新增 yt-dlp 元数据获取方法

在 `backend/internal/services/youtube.go` 中新增：

```go
// GetVideoMetadataWithYtDlp fetches video metadata using yt-dlp (most reliable, no API key needed).
func (s *YouTubeService) GetVideoMetadataWithYtDlp(ctx context.Context, videoID string) (*VideoMetadata, error)
```

**特点**：
- ✅ 不需要任何 API 密钥
- ✅ 最可靠的方法
- ✅ 获取标题、作者、时长、缩略图等信息

### 2. 实现3层回退机制

在 `backend/internal/services/insight_processor.go` 中修改了 `processYouTubeInsight` 方法：

```go
// Method 1: Try YouTube Data API v3 (fastest if configured)
metadata, err = p.youtubeService.GetVideoMetadataFromAPI(ctx, videoID)
if err != nil {
    // Method 2: Try yt-dlp (most reliable, no API key needed)
    metadata, err = p.youtubeService.GetVideoMetadataWithYtDlp(ctx, videoID)
    if err != nil {
        // Method 3: Try Gemini/OpenRouter (last resort)
        metadata, err = p.youtubeService.GetVideoMetadata(ctx, insight.SourceURL)
        // ...
    }
}
```

**优先级**：
1. YouTube Data API v3 - 最快，但需要配置
2. **yt-dlp** ⭐ - 最可靠，无需配置
3. OpenRouter API - 最后选择，需要有效密钥

### 3. 修复错误处理逻辑

在 `backend/internal/handlers/chat.go` 中修复了错误判断：

**之前的问题**：
```go
if strings.Contains(err.Error(), "not found") {
    // "User not found" 被误判为 "Insight not found"
    return 404
}
```

**修复后**：
```go
// 更精确的判断
if strings.Contains(errMsg, "insight not found") || strings.Contains(errMsg, "record not found") {
    return 404
}

// 专门处理 OpenRouter 认证错误
if strings.Contains(errMsg, "OpenRouter API 认证失败") || strings.Contains(errMsg, "User not found") {
    return 503 // Service Unavailable
}
```

## 测试结果

### 成功案例

**视频**: https://www.youtube.com/watch?v=0C2lF8pKwlI

**结果**:
```json
{
  "id": 18,
  "title": "高市早苗剛透露了未來 3 年發財的方法，不聽只能變窮。",
  "author": "尼可拉斯楊Live精",
  "status": "completed",
  "duration": 1035
}
```

✅ **解析成功**：即使 OpenRouter API 密钥无效，仍然成功使用 yt-dlp 获取了完整的视频元数据

### 错误处理

当调用 `/api/v1/insights/18/analyze-entities` 时（需要 OpenRouter API）：

**之前**:
```
HTTP 404 Not Found
{"code": "INSIGHT_NOT_FOUND", "message": "Insight not found."}
```

**现在**:
```
HTTP 503 Service Unavailable
{"code": "OPENROUTER_AUTH_FAILED", "message": "AI service authentication failed. Please contact administrator."}
```

✅ **正确的错误响应**：明确告知是 AI 服务认证失败，而不是资源不存在

## 影响的文件

1. `backend/internal/services/youtube.go`
   - 新增 `GetVideoMetadataWithYtDlp()` 方法
   - 添加 `os/exec` 导入

2. `backend/internal/services/insight_processor.go`
   - 修改 `processYouTubeInsight()` 方法
   - 实现3层回退机制

3. `backend/internal/handlers/chat.go`
   - 修复 `AnalyzeEntities()` 错误处理
   - 区分不同类型的错误

## 优势

### 可靠性
- ✅ 不依赖任何外部 API 密钥即可获取视频元数据
- ✅ yt-dlp 定期更新，支持最新的 YouTube 格式
- ✅ 即使所有 API 都失败，也能给出明确的错误信息

### 成本
- ✅ 减少对 YouTube Data API v3 的依赖（有配额限制）
- ✅ 减少对 OpenRouter API 的依赖（有费用）

### 用户体验
- ✅ 更快的响应（yt-dlp 通常比 API 调用更快）
- ✅ 更准确的错误提示
- ✅ 不会因为配置问题导致基本功能不可用

## 注意事项

1. **yt-dlp 依赖**：确保 Docker 镜像中已安装 yt-dlp
   ```dockerfile
   RUN pip3 install --break-system-packages --no-cache-dir yt-dlp
   ```

2. **网络访问**：yt-dlp 需要访问 YouTube，确保网络连接正常

3. **超时设置**：yt-dlp 可能需要几秒钟，建议设置合理的超时时间

## 版本历史

- **2026-01-19**: 初始版本
  - 添加 yt-dlp 元数据获取方法
  - 实现3层回退机制
  - 修复404错误处理
