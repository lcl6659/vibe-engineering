# AI Agent 使用指南

## 🚀 快速开始

### 命令一览

| 命令 | 说明 |
|------|------|
| `/agent-ui` | 生成 UI 设计规格（PR 形式） |
| `/agent-spec` | 生成完整技术规格（直接在评论区显示） |
| `/agent-be <url>` | 生成后端代码 |
| `/agent-fe <url>` | 生成前端代码 |
| `/agent-new-ui` | **创建子 Issue** 并生成 UI 规格 |
| `/agent-new-be <url>` | **创建子 Issue** 并生成后端代码 |
| `/agent-new-fe <url>` | **创建子 Issue** 并生成前端代码 |
| `/clean-stale` | 清理超时的处理状态 |

> 💡 **智能分拆**: 当 Issue 评论超过 8 条时，系统会自动创建子 Issue 以避免评论折叠问题。

---

### 1. 生成 UI 设计规格

在 Issue 中评论：
```
/agent-ui

请设计一个用户登录页面
```

**功能:**
- 分析产品需求
- 生成 UI 设计规格
- 输出前端实现方案
- 创建 PR 供 review

---

### 2. 生成完整技术规格

在 Issue 中评论：
```
/agent-spec

新增中英文对照功能
```

**功能:**
- 生成完整的技术规格文档
- 包含需求描述、用户体验流程、后端 API 设计、数据模型、前端实现指南和验收标准
- **直接在 Issue 评论区显示完整内容**（不创建 PR）
- 方便快速查看和讨论
- ⚡ **自动触发后续流程**：完成后自动执行后端和前端代码生成

**输出内容：**
- 📋 需求描述
- 🎨 用户体验流程
- 🔌 后端 API 设计
- 📁 数据模型
- 🖥 前端实现指南
- ✅ 验收标准 Checklist

**自动化流程：**
```
/agent-spec 完成
    ↓ 自动触发
/agent-be 执行
    ↓ 自动触发
/agent-fe 执行
    ↓
全部完成！
```

---

### 3. 生成后端代码

在 Issue 中评论：
```
/agent-be https://github.com/yourrepo/issues/123

实现用户认证 API
```

**功能:**
- 基于 UI 规格生成后端 API
- 自动创建数据模型
- 生成路由和处理器
- 运行测试并创建 PR

**URL 格式支持:**
- Issue URL: `https://github.com/owner/repo/issues/123`
- Issue URL (带锚点): `https://github.com/owner/repo/issues/123#issue-456789`
- Comment URL: `https://github.com/owner/repo/issues/123#issuecomment-456789`

---

### 4. 生成前端代码

在 Issue 中评论：
```
/agent-fe https://github.com/yourrepo/issues/123

使用深色主题
```

**功能:**
- 基于 UI 规格生成前端组件
- 遵循项目设计系统
- 自动集成 API 调用
- 创建 PR 供 review

---

### 5. 强制创建子 Issue（避免评论折叠）

当你想在全新的 Issue 中执行 Agent（不受当前评论影响）：

```
/agent-new-be https://github.com/yourrepo/issues/123

重构认证模块
```

**行为:**
- 创建一个关联的子 Issue
- 在子 Issue 中执行 Agent
- 父 Issue 会收到链接通知
- 保持父子 Issue 的双向引用

**何时使用:**
- 当前 Issue 评论太多，信息混杂
- 想开始一个新的开发分支/阶段
- 需要更清晰的任务追踪

---

## 📋 Issue 标签说明

| 标签 | 含义 |
|------|------|
| `🤖 ai-processing` | AI 正在处理中 |
| `✅ ai-completed` | AI 已完成 |
| `❌ ai-failed` | AI 处理失败 |
| `agent:ui` | UI Agent 标识 |
| `agent:backend` | Backend Agent 标识 |
| `agent:frontend` | Frontend Agent 标识 |
| `sub-issue` | 由系统自动创建的子 Issue |
| `frontend` | 前端相关 |
| `backend` | 后端相关 |
| `bug` | Bug 修复 |
| `enhancement` | 新功能 |

---

## 🔄 标准工作流程

### 方式一：自动级联执行（推荐）⚡

```
1. 创建 Issue 描述需求
   ↓
2. 评论 /agent-spec
   ↓
3. 🤖 系统自动执行完整流程：
   - ✅ 生成技术规格
   - 🔗 自动触发后端代码生成
   - 🔗 自动触发前端代码生成
   ↓
4. Review PR 并合并
```

**特点：**
- ✨ 一键启动，全自动执行
- 📝 每个阶段都有评论记录
- 🎯 适合标准的全栈功能开发

---

### 方式二：手动分步执行

```
1. 创建 Issue 描述需求
   ↓
2. 评论 /agent-spec 生成技术规格
   ↓
3. 评论 /agent-be --spec #123 生成后端代码
   ↓
4. 评论 /agent-fe --spec #123 生成前端代码
   ↓
5. Review PR 并合并
```

**特点：**
- 🎛️ 每步可控，灵活调整
- 🔧 适合需要中途修改的场景
- 🐛 适合仅需后端或前端的情况

---

## 🛠️ 维护命令

### 清理卡住的处理状态

如果某个 Issue 的 AI Agent 超过 24 小时未完成：

```
/clean-stale
```

这会：
- 查找所有带有 `🤖 ai-processing` 标签且超过 24 小时未更新的 issue
- 移除 `ai-processing` 标签
- 添加警告评论

---

## 💡 使用技巧

### 1. 清晰的需求描述

**好的示例:**
```
/agent-ui

设计一个用户登录页面，包含：
- 邮箱输入框（验证格式）
- 密码输入框（显示/隐藏切换）
- 记住我 checkbox
- 登录按钮（主按钮样式）
- 忘记密码链接
```

**不好的示例:**
```
/agent-ui
登录页面
```

### 2. 提供足够的上下文

**Backend Agent:**
```
/agent-be https://github.com/owner/repo/issues/123

实现用户认证 API
- 使用 JWT token
- 密码需要 bcrypt 加密
- 支持 refresh token
```

### 3. 迭代式改进

如果第一次生成的代码不满意：
1. 在生成的 PR 中评论具体的修改建议
2. 或创建新 Issue 描述改进点
3. 再次触发对应的 Agent

---

## ⚠️ 注意事项

### 执行限制

- 每个 Agent 执行时会自动创建进度追踪评论
- Claude Code Action 有 token 和时间限制
- 复杂需求可能需要拆分成多个子任务

### PR Review

- **所有 AI 生成的 PR 都需要人工 review**
- 测试失败不会阻止 PR 创建，但会在 PR 中标注
- Review 时注意检查：
  - 代码逻辑正确性
  - 安全性（特别是认证、授权）
  - 性能考虑
  - 测试覆盖

### 标签管理

- `🤖 ai-processing` 会在 Agent 完成后自动移除
- 如果超过 24 小时未完成，需要手动清理或使用 `/clean-stale`
- 可以手动添加标签来组织 issues

---

## 🐛 故障排除

### Agent 没有响应？

1. **检查 Actions 标签页** 查看执行日志
2. **确认触发命令格式** 是否正确（空格、URL 等）
3. **检查 Issue 标签** 是否有 `ai-processing`
4. **查看 Secrets** 确保 `OPENROUTER_API_KEY` 已配置

### 代码生成失败？

1. **检查 UI Spec 是否明确**
   - 是否包含足够的细节？
   - 接口定义是否清晰？

2. **查看 Error Handler** 创建的错误报告
   - 会自动评论到原 Issue
   - 包含详细的失败日志链接

3. **提供更多上下文**
   - 在 Issue 中补充技术细节
   - 引用类似的实现示例

### 测试失败？

- Agent 仍会创建 PR，但标注测试失败
- 手动修复后 commit 到同一分支
- 或者在 PR 中评论请求 Claude 修复

### PR 创建失败？

可能原因：
- 没有代码变更（Claude 判断无需修改）
- Git 冲突（与 main 分支有冲突）
- 权限问题（检查 workflow permissions）

解决方案：
- 检查 Actions 日志查看具体错误
- 手动创建 PR（分支已推送）
- 或重新触发 Agent

---

## 📊 监控和调试

### 查看 Agent 进度

1. **进度评论**
   - Agent 启动时会创建带 checklist 的评论
   - 实时更新当前状态

2. **Actions 日志**
   - 点击 Actions 标签页
   - 找到对应的 workflow run
   - 查看详细日志

3. **Issue 标签**
   - `🤖 ai-processing` - 正在处理
   - `✅ ai-completed` - 已完成
   - `❌ ai-failed` - 失败

### 常见日志模式

**成功执行:**
```
✅ 获取 UI Spec
✅ 生成 API Contract: 3 个接口
✅ 读取系统文件
✅ 上下文准备完成
✅ 代码生成完成
✅ 测试通过
✅ PR 创建成功
```

**失败执行:**
```
❌ 获取 UI Spec 失败: Not Found
❌ API Contract 推导失败
❌ JSON 解析错误
```

---

## 🔧 高级配置

### 自定义系统文件

如果你的项目结构不同，可以在 Backend Agent 的 `Parse Command` 步骤中修改 `systemFiles` 数组：

```javascript
const systemFiles = [
  "backend/go.mod",
  "backend/cmd/server/main.go",
  "backend/internal/router/router.go",
  "backend/internal/config/config.go",
  // 添加你的项目文件
  "backend/pkg/middleware/auth.go",
  "backend/pkg/utils/validator.go"
];
```

### 调整 Claude 参数

在 workflow 中修改 `claude_args`:

```yaml
claude_args: |
  --model anthropic/claude-sonnet-4.5
  --max-turns 30  # 增加最大轮次
  --temperature 0.3  # 调整温度
```

### 自定义标签

在 `issue-manager.yml` 中添加更多标签规则：

```javascript
if (text.includes('urgent') || text.includes('紧急')) {
  labels.push('priority:high');
}
if (text.includes('database') || text.includes('数据库')) {
  labels.push('database');
}
```

---

## 📚 相关资源

- [Claude Code Action 官方文档](https://github.com/marketplace/actions/claude-code-action-official)
- [OpenRouter API 文档](https://openrouter.ai/docs)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

## 🤝 贡献和反馈

遇到问题或有改进建议？

1. 创建 Issue 描述问题
2. 附上 Actions 日志链接
3. 说明期望的行为

---

_最后更新: 2025-01-14_
