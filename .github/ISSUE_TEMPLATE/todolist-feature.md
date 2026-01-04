---
name: TodoList Feature
about: 创建符合 Vibe Guide 最佳实践的 TodoList 功能 Issue
title: '[Agent] '
labels: agent-task
---

## 任务描述

[简要描述要实现的功能]

## 技术栈

- **后端**: Go (标准库 + gorilla/mux)
- **前端**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **数据库**: SQLite

## 验收标准

- [ ] 功能正常工作
- [ ] 代码遵循 Vibe Guide 最佳实践
- [ ] 展示组件和业务逻辑组件分离
- [ ] Tailwind 使用受限的设计系统
- [ ] 通过 ESLint 检查（无禁用规则）
- [ ] 可以离线运行（有假数据）

## Vibe Guide 要求

### Planning
- [ ] 先创建计划（Agent 会自动生成 `EXEC_PLAN.md`）
- [ ] 计划要明确列出要创建/修改的文件

### Code Quality
- [ ] 不关心向后兼容，优先代码可读性
- [ ] 禁止使用 `eslint-disable` 等禁用规则
- [ ] 展示组件（`components/ui/`）不使用 hooks
- [ ] 业务逻辑组件（`components/features/`）处理数据和状态

### Development Setup
- [ ] 确保可以 QA（有测试或验证命令）
- [ ] 解决开发服务器问题（端口管理）
- [ ] 添加假数据（seed data）以便离线运行

## 实现细节

[详细描述实现要求，包括 API 端点、组件结构等]

## 相关文件

[列出可能需要创建或修改的文件]

