# Vibe Engineering Playbook

This repository documents the minimal automation needed to run an issue-driven agent that ships code through GitHub Actions and a PR review bot.

## Automation Flow

1. Create or label an issue to start the automation:
   - Add the `agent-task` label, **or**
   - Open an issue with a title starting with `[Agent]`.
2. GitHub Actions (`.github/workflows/agent-task.yml`) checks out the repo, saves the issue body to `ISSUE.md`, runs the Python implementation script (`scripts/implement_issue.py`), and opens a pull request on `agent/issue-<ID>`.
3. The pull request clearly references the originating issue and can be auto-reviewed using `REVIEW_CHECKLIST.md`.

## Key Files

- `.github/workflows/agent-task.yml`: Workflow that triggers on qualifying issues and runs the implementation script.
- `scripts/implement_issue.py`: Python script that reads ISSUE.md, calls AI API, and generates code files.
- `AGENT_PROTOCOL.md`: Guidance for implementation planning, execution, verification, and escalation.
- `REVIEW_CHECKLIST.md`: Taste-focused review checklist for automated and human reviewers.
- `DAILY_TODOLIST.md`: Cross-functional daily checklist (PM/FE/BE/Ops) with AI-teammate prompts.
- `PROJECT_DESIGN.md`: Collaboration design (roles/rituals/artifacts) to make cross-functional work runnable.
- `.github/ISSUE_TEMPLATE/*`: Feature/Bug/Release templates for PM/FE/BE/Ops.
- `PULL_REQUEST_TEMPLATE.md`: PR template requiring evidence, risks, and rollback.
- `TODOLIST_PROJECT_PLAN.md`: 完整的 TodoList 项目计划，遵循 [Vibe Guide](https://www.vibekanban.com/vibe-guide) 最佳实践。
- `TODOLIST_ISSUE.md`: TodoList 项目的 Issue 模板示例。

## Quick Start

想要测试整个流程？查看 `EXAMPLE_ISSUE.md` 获取完整的测试 Issue 示例。

1. 复制 `EXAMPLE_ISSUE.md` 中的内容
2. 在 GitHub 创建新 Issue，标题以 `[Agent]` 开头
3. 粘贴内容并提交
4. GitHub Actions 会自动运行 Python 脚本，调用 AI API 生成代码并创建 PR
5. 检查 PR 中的代码改动，确认可以运行

**配置要求**：

- 推荐：配置 `OPENROUTER_API_KEY`，默认使用 `openai/gpt-5.1-codex`（专为代码生成优化）
- 备选：配置 `OPENAI_API_KEY`，使用 `gpt-4o`
- 可选：配置 `MODEL` secret 指定其他模型（如 `openai/gpt-5.2`）

## Vibe Guide 最佳实践

本项目遵循 [Vibe Guide](https://www.vibekanban.com/vibe-guide) 的最佳实践：

### Planning

- ✅ **先做计划**：Agent 会自动生成 `EXEC_PLAN.md`
- ✅ **Plan more, review less**：详细规划，减少审查时间
- ✅ **Planning sets the shape**：计划决定代码结构

### Code Quality

- ✅ **No backwards compatibility**：不关心向后兼容，优先代码可读性
- ✅ **Disable disabling lint rules**：禁止使用 `eslint-disable` 等禁用规则

### Frontend Best Practices

- ✅ **Separate presentation from logic**：展示组件和业务逻辑组件分离
- ✅ **Restrict Tailwind**：使用受限的设计系统，禁止随意使用 Tailwind 类

### Development Setup

- ✅ **Set the codebase up to be QA'd**：确保代码可以测试和验证
- ✅ **Solve dev servers**：解决开发服务器端口冲突问题
- ✅ **Add dummy data**：添加假数据，确保可以离线运行

### Async & Model Selection

- ✅ **Biggest model is fastest**：使用最大的模型（`openai/gpt-5.1-codex`）
- ✅ **Use YOLO mode**：减少人工干预，让 Agent 自主工作

## TodoList 项目示例

查看 `TODOLIST_ISSUE.md` 获取完整的 TodoList 项目 Issue 示例。该项目展示了如何：

1. 创建符合 Vibe Guide 的 Issue
2. 使用 Go + Next.js 技术栈
3. 遵循最佳实践（组件分离、Tailwind 限制、ESLint 规则等）
4. 通过 GitHub Actions 自动运行代码

## Operating Guidelines

- Treat each issue as the contract for the agent's work; keep requirements and acceptance criteria there.
- Prefer small, reviewable changes with clear assumptions documented in commits or the PR body.
- Use the review checklist to catch clarity, scope, and testing risks early.
- Follow Vibe Guide best practices for code quality and development workflow.
