# TodoList 项目快速开始指南

本指南说明如何使用 Vibe Engineering Playbook 自动化流程来创建 TodoList 项目。

## 前置条件

1. **GitHub 仓库**：确保你有一个 GitHub 仓库，并且有 Actions 权限
2. **API 密钥**：配置以下 Secret 之一：
   - `OPENROUTER_API_KEY`（推荐）- 使用 OpenRouter API
   - `OPENAI_API_KEY`（备选）- 使用 OpenAI API

## 配置 GitHub Secrets

在 GitHub 仓库中，进入 **Settings → Secrets and variables → Actions**，添加：

- `OPENROUTER_API_KEY`: 你的 OpenRouter API 密钥
- `HTTP_REFERER`: （可选）默认 `https://github.com`
- `MODEL`: （可选）默认 `openai/gpt-5.1-codex`

## 创建 Issue

### 方法 1：使用 Issue 模板

1. 在 GitHub 仓库中点击 **Issues → New Issue**
2. 选择 **TodoList Feature** 模板
3. 填写 Issue 内容（或直接复制 `TODOLIST_ISSUE.md` 的内容）
4. 确保标题以 `[Agent]` 开头
5. 提交 Issue

### 方法 2：直接创建

1. 复制 `TODOLIST_ISSUE.md` 中的内容
2. 在 GitHub 创建新 Issue，标题：`[Agent] 创建 TodoList 网站 - 邮箱登录和待办事项管理`
3. 粘贴内容并提交

## 自动化流程

提交 Issue 后，GitHub Actions 会自动：

1. ✅ **触发工作流**：检测到 `[Agent]` 前缀或 `agent-task` 标签
2. ✅ **保存 Issue**：将 Issue 内容保存到 `ISSUE.md`
3. ✅ **调用 AI API**：运行 `scripts/implement_issue.py`，调用 OpenRouter API
4. ✅ **生成代码**：AI 根据 Issue 和 Vibe Guide 最佳实践生成代码
5. ✅ **创建分支**：创建 `agent/issue-<ID>` 分支
6. ✅ **提交代码**：提交所有生成的代码文件
7. ✅ **创建 PR**：自动创建 Pull Request

## 查看结果

1. **检查 Actions**：在 GitHub 仓库的 **Actions** 标签页查看工作流运行状态
2. **查看 PR**：工作流完成后，会自动创建 Pull Request
3. **检查代码**：在 PR 中查看生成的代码，确认：
   - ✅ 代码符合 Issue 要求
   - ✅ 遵循 Vibe Guide 最佳实践
   - ✅ 展示组件和业务逻辑组件分离
   - ✅ Tailwind 使用受限的设计系统
   - ✅ 无 ESLint 禁用规则

## 验证代码

PR 创建后，你可以：

1. **本地测试**：
   ```bash
   # 克隆仓库
   git clone <your-repo-url>
   cd <repo-name>
   
   # 切换到 PR 分支
   git checkout agent/issue-<ID>
   
   # 运行后端（如果已生成）
   cd backend
   go mod download
   go run cmd/server/main.go
   
   # 运行前端（如果已生成）
   cd frontend
   npm install
   npm run dev
   ```

2. **检查代码质量**：
   ```bash
   # 后端测试
   cd backend
   go test ./...
   
   # 前端 lint
   cd frontend
   npm run lint
   ```

## 项目结构

生成的项目应该包含以下结构：

```
backend/
├── cmd/server/main.go
├── internal/
│   ├── auth/
│   ├── handlers/
│   ├── models/
│   ├── database/
│   └── middleware/
├── migrations/
├── seed/
└── go.mod

frontend/
├── app/
│   ├── login/page.tsx
│   ├── todos/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/          # 展示组件（无状态）
│   └── features/    # 业务逻辑组件
├── lib/
│   ├── api.ts
│   └── auth.ts
└── tailwind.config.js
```

## 常见问题

### Q: GitHub Actions 没有触发？

A: 检查：
- Issue 标题是否以 `[Agent]` 开头
- 或 Issue 是否有 `agent-task` 标签
- 工作流文件 `.github/workflows/agent-task.yml` 是否存在

### Q: API 调用失败？

A: 检查：
- GitHub Secrets 中是否配置了 `OPENROUTER_API_KEY` 或 `OPENAI_API_KEY`
- API 密钥是否有效
- 查看 Actions 日志中的错误信息

### Q: 生成的代码不符合要求？

A: 
- 检查 `ISSUE.md` 中的需求是否清晰
- 查看 `EXEC_PLAN.md` 中的实现计划
- 可以在 Issue 中添加更多细节，然后重新运行工作流

### Q: 如何重新生成代码？

A: 
- 在 Issue 中添加评论，说明需要修改的地方
- 或者关闭当前 PR，修改 Issue 内容，重新提交

## 下一步

1. ✅ 创建 Issue
2. ✅ 等待 GitHub Actions 运行
3. ✅ 检查生成的 PR
4. ✅ 本地测试代码
5. ✅ 合并 PR（如果满意）
6. ✅ 继续开发新功能

## 参考文档

- [Vibe Guide](https://www.vibekanban.com/vibe-guide) - 最佳实践指南
- `TODOLIST_PROJECT_PLAN.md` - 详细的项目计划
- `AGENT_PROTOCOL.md` - Agent 协议
- `REVIEW_CHECKLIST.md` - 代码审查清单

