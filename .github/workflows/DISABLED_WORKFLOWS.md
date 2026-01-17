# 已禁用的工作流

为了简化系统架构，以下工作流已被禁用（重命名为 `.disabled` 后缀）：

## 禁用列表

### 1. `vibe-router.yml.disabled`
- **功能**: 自动分析 Issue 复杂度并路由到不同的 Agent
- **禁用原因**: 复杂度分析增加了不必要的复杂性，用户更倾向于简单直接的工作流
- **替代方案**: 使用 `/agent-spec` 自动级联流程

### 2. `agent-simple.yml.disabled`
- **功能**: 处理简单任务（S 级）
- **禁用原因**: 统一使用 vibe-agent.yml 中的标准流程
- **替代方案**: `/agent-spec` → `/agent-be` → `/agent-fe`

### 3. `agent-medium.yml.disabled`
- **功能**: 处理中等任务（M 级）
- **禁用原因**: 统一使用 vibe-agent.yml 中的标准流程
- **替代方案**: `/agent-spec` → `/agent-be` → `/agent-fe`

### 4. `agent-complex.yml.disabled`
- **功能**: 处理复杂任务（L 级）
- **禁用原因**: 统一使用 vibe-agent.yml 中的标准流程
- **替代方案**: `/agent-spec` → `/agent-be` → `/agent-fe`

---

## 当前活跃的工作流

只保留以下核心工作流：

- ✅ `vibe-agent.yml` - 统一的 Agent 入口（spec/be/fe）
- ✅ `vibe-continuous.yml` - 任务监控与自动迭代
- ✅ `issue-manager.yml` - Issue 标签管理
- ✅ 其他辅助工作流（daily-maintenance, vercel-status-monitor 等）

---

## 如何恢复这些工作流？

如果将来需要恢复某个工作流，只需：

```bash
# 示例：恢复 vibe-router
cd .github/workflows
mv vibe-router.yml.disabled vibe-router.yml
git add vibe-router.yml
git commit -m "feat: 重新启用 vibe-router 工作流"
git push
```

---

## 禁用时间

- 禁用日期: 2026-01-17
- 操作人: xiaozihao
- 原因: 简化工作流，专注于 `/agent-spec` 自动级联功能

---

_备注: 这些文件仍保留在仓库中供参考，只是不会被 GitHub Actions 执行。_
