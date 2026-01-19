# 多语言字幕系统设计文档

## 系统架构

### 设计理念

采用**渐进式增强**策略：
1. **基础功能**：使用 yt-dlp 获取原文字幕（无需 API）
2. **增强功能**：如果 OpenRouter API 可用，提供翻译（需要 API 密钥）
3. **降级策略**：API 失败时仍保证原文字幕可用

### 数据流程图

```
YouTube URL
    ↓
[yt-dlp 获取字幕] ✅ 总是成功（不需要 API）
    ↓
原文字幕 (Text)
    ↓
[检测源语言] ← OpenRouter API
    ↓
[批量翻译] ← OpenRouter API
    ↓
译文字幕 (TranslatedText) ⚠️ 可能失败
    ↓
返回组合结果
```

## 数据结构

### TranscriptItem（字幕条目）

```typescript
interface TranscriptItem {
  timestamp: string;      // 时间戳格式："05:12"
  seconds: number;        // 时间戳（秒）：312
  text: string;           // 原文（总是存在）✅
  translated_text?: string; // 译文（可选）⚠️
}
```

### Insight（视频分析结果）

```typescript
interface Insight {
  id: number;
  title: string;
  author: string;
  duration: number;
  transcripts: TranscriptItem[];  // 字幕数组
  raw_content: string;            // 原文全文（用于搜索）
  trans_content?: string;         // 译文全文（如果有翻译）
  target_lang: string;            // 目标语言："zh", "en", "ja"
  // ...其他字段
}
```

## 后端实现

### 1. 获取字幕（yt-dlp）

```go
// 使用 yt-dlp 获取字幕，不需要任何 API 密钥
transcriptResponse, err := p.youtubeService.FetchYouTubeTranscriptStructured(ctx, videoID)
if err != nil {
    p.log.Warn("Failed to fetch transcripts", zap.Error(err))
    // 字幕获取失败，但视频元数据仍然可用
} else {
    // ✅ 字幕获取成功
}
```

**特点**：
- ✅ 免费，无配额限制
- ✅ 支持多种语言的自动字幕
- ✅ 包含时间戳信息

### 2. 翻译字幕（OpenRouter API）

```go
// 尝试翻译（可选，失败不影响主流程）
if p.translationService != nil && targetLang != "" {
    translations, err := p.translationService.TranslateBatch(ctx, texts, sourceLang, targetLang)
    if err != nil {
        // ⚠️ 翻译失败，但继续执行
        p.log.Warn("翻译失败，字幕仍包含原文")
    } else {
        // ✅ 翻译成功，添加到 TranslatedText 字段
        for i, translation := range translations {
            transcriptItems[i].TranslatedText = translation
        }
    }
}
```

**特点**：
- ⚠️ 需要有效的 OpenRouter API 密钥
- ⚠️ 失败不阻塞主流程
- ✅ 支持批量翻译（高效）

### 3. 返回结果

#### 场景A：翻译成功（理想情况）

```json
{
  "id": 18,
  "title": "高市早苗剛透露了未來 3 年發財的方法...",
  "transcripts": [
    {
      "timestamp": "00:00",
      "seconds": 0,
      "text": "嘿大家好",
      "translated_text": "Hey everyone"  // ✅ 有翻译
    },
    {
      "timestamp": "00:03",
      "seconds": 3,
      "text": "今天我们来聊聊投资",
      "translated_text": "Today let's talk about investment"
    }
  ]
}
```

#### 场景B：翻译失败（降级处理）

```json
{
  "id": 18,
  "title": "高市早苗剛透露了未來 3 年發財的方法...",
  "transcripts": [
    {
      "timestamp": "00:00",
      "seconds": 0,
      "text": "嘿大家好"
      // ⚠️ 没有 translated_text，但原文仍可用
    },
    {
      "timestamp": "00:03",
      "seconds": 3,
      "text": "今天我们来聊聊投资"
    }
  ]
}
```

## 前端实现建议

### 1. 显示逻辑

```typescript
function TranscriptViewer({ transcripts }: { transcripts: TranscriptItem[] }) {
  const [showTranslation, setShowTranslation] = useState(true);
  
  // 检查是否有翻译
  const hasTranslation = transcripts.some(item => item.translated_text);
  
  return (
    <div>
      {/* 只在有翻译时显示切换按钮 */}
      {hasTranslation && (
        <button onClick={() => setShowTranslation(!showTranslation)}>
          {showTranslation ? '显示原文' : '显示译文'}
        </button>
      )}
      
      {transcripts.map(item => (
        <div key={`${item.seconds}`}>
          <span className="timestamp">{item.timestamp}</span>
          <span className="text">
            {showTranslation && item.translated_text 
              ? item.translated_text  // 显示译文
              : item.text             // 显示原文（fallback）
            }
          </span>
        </div>
      ))}
    </div>
  );
}
```

### 2. 双语对照模式

```typescript
function BilingualTranscript({ item }: { item: TranscriptItem }) {
  return (
    <div className="transcript-item">
      <span className="timestamp">{item.timestamp}</span>
      <div className="text-container">
        <div className="original-text">{item.text}</div>
        {item.translated_text && (
          <div className="translated-text">{item.translated_text}</div>
        )}
      </div>
    </div>
  );
}
```

### 3. 搜索功能

```typescript
function searchTranscripts(
  transcripts: TranscriptItem[], 
  query: string,
  searchInTranslation: boolean = true
): TranscriptItem[] {
  return transcripts.filter(item => {
    // 在原文中搜索
    if (item.text.toLowerCase().includes(query.toLowerCase())) {
      return true;
    }
    // 如果有译文，也在译文中搜索
    if (searchInTranslation && item.translated_text) {
      return item.translated_text.toLowerCase().includes(query.toLowerCase());
    }
    return false;
  });
}
```

## API 配置说明

### 配置 OpenRouter API（可选）

如果需要翻译功能，需要配置 OpenRouter API 密钥：

1. **获取 API 密钥**
   - 访问 [https://openrouter.ai/](https://openrouter.ai/)
   - 注册并获取 API 密钥

2. **配置环境变量**
   ```bash
   # .env 文件
   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
   GEMINI_MODEL=google/gemini-3-flash-preview
   ```

3. **重启服务**
   ```bash
   docker-compose restart backend
   ```

### 验证配置

启动后查看日志：

#### ✅ 配置正确
```log
INFO  ✅ OpenRouter API 服务已初始化
  model: google/gemini-3-flash-preview
  api_key: sk-or-v1-0...xxxx
```

#### ⚠️ 未配置
```log
WARN  ⚠️  OpenRouter API 密钥未设置
  说明: 字幕将只包含原文，这不影响基本功能
```

## 优势总结

### 1. **渐进式增强** ✅
- 基础功能（字幕获取）无需配置
- 高级功能（翻译）需要配置但是可选

### 2. **容错性强** ✅
- API 失败不影响核心功能
- 总是能提供至少原文字幕

### 3. **成本优化** ✅
- 字幕获取免费（yt-dlp）
- 翻译按需使用（OpenRouter）

### 4. **用户体验好** ✅
- 即使翻译失败，用户仍能看到原文
- 支持双语对照
- 支持原文/译文切换

## 扩展功能

### 多语言翻译

可以支持翻译成多种语言：

```go
type TranscriptItem struct {
    Timestamp      string            `json:"timestamp"`
    Seconds        int               `json:"seconds"`
    Text           string            `json:"text"`
    Translations   map[string]string `json:"translations,omitempty"` // {"zh": "...", "en": "...", "ja": "..."}
}
```

前端示例：
```typescript
function MultilingualSelector({ item, languages }: Props) {
  const [selectedLang, setSelectedLang] = useState('zh');
  
  return (
    <div>
      <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)}>
        <option value="original">原文</option>
        {Object.keys(item.translations || {}).map(lang => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>
      <div className="text">
        {selectedLang === 'original' 
          ? item.text 
          : item.translations?.[selectedLang] || item.text
        }
      </div>
    </div>
  );
}
```

## 故障排查

### 问题：字幕没有翻译

**检查步骤**：

1. **查看后端日志**
   ```bash
   docker-compose logs backend | grep "翻译"
   ```

2. **可能的原因**
   - ⚠️ OpenRouter API 密钥未配置
   - ⚠️ OpenRouter API 密钥无效
   - ⚠️ 源语言与目标语言相同

3. **解决方案**
   - 配置有效的 OpenRouter API 密钥
   - 查看 `docs/OPENROUTER_API_LOGS.md` 获取详细说明

### 问题：完全没有字幕

**检查步骤**：

1. **查看后端日志**
   ```bash
   docker-compose logs backend | grep "transcript"
   ```

2. **可能的原因**
   - YouTube 视频没有字幕
   - yt-dlp 未正确安装
   - 网络问题

3. **解决方案**
   - 确认视频确实有字幕
   - 检查 Docker 镜像是否包含 yt-dlp
   - 检查网络连接

## 版本历史

- **2026-01-19**: 初始版本
  - 实现 yt-dlp 字幕获取
  - 实现 OpenRouter 翻译（可选）
  - 渐进式增强策略
  - 完善的错误处理
