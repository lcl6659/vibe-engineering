# Vibe Engineering Playbook

This repository documents the minimal automation needed to run an issue-driven agent that ships code through GitHub Actions and a PR review bot.

## Automation Flow
1. Create or label an issue to start the agent:
   - Add the `agent-task` label, **or**
   - Open an issue with a title starting with `[Agent]`.
2. GitHub Actions (`.github/workflows/agent-task.yml`) checks out the repo, saves the issue body to `ISSUE.md`, runs the Codex agent, and opens a pull request on `agent/issue-<ID>`.
3. The pull request clearly references the originating issue and can be auto-reviewed by a bot using `REVIEW_CHECKLIST.md`.

## Key Files
- `.github/workflows/agent-task.yml`: Workflow that triggers on qualifying issues and runs the agent.
- `AGENT_PROTOCOL.md`: Guidance for the agent on planning, execution, verification, and escalation.
- `REVIEW_CHECKLIST.md`: Taste-focused review checklist for automated and human reviewers.
- `DAILY_TODOLIST.md`: Cross-functional daily checklist (PM/FE/BE/Ops) with AI-teammate prompts.
- `PROJECT_DESIGN.md`: Collaboration design (roles/rituals/artifacts) to make cross-functional work runnable.
- `.github/ISSUE_TEMPLATE/*`: Feature/Bug/Release templates for PM/FE/BE/Ops.
- `PULL_REQUEST_TEMPLATE.md`: PR template requiring evidence, risks, and rollback.

## Quick Start

想要测试整个流程？查看 `EXAMPLE_ISSUE.md` 获取完整的测试 Issue 示例。

1. 复制 `EXAMPLE_ISSUE.md` 中的内容
2. 在 GitHub 创建新 Issue，标题以 `[Agent]` 开头
3. 粘贴内容并提交
4. GitHub Actions 会自动运行，Codex 会生成代码并创建 PR
5. 检查 PR 中的代码改动，确认可以运行

## Operating Guidelines
- Treat each issue as the contract for the agent's work; keep requirements and acceptance criteria there.
- Prefer small, reviewable changes with clear assumptions documented in commits or the PR body.
- Use the review checklist to catch clarity, scope, and testing risks early.
