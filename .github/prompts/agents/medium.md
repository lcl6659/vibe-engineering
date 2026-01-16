## 任务类型

这是一个 **中等复杂度任务**，需要先分析再实现。

## Issue 信息

- 仓库: {{repository}}
- Issue: #{{issue_number}}
- 标题: {{title}}

## 需求描述

{{body}}

{{#if continuation_context}}
## 🔄 继续迭代上下文

上一轮迭代的反馈：
{{continuation_context}}

请基于以上反馈继续完成任务，重点关注未完成的验收标准。
{{/if}}

## ⚠️ 重要：你必须完成实际的代码修改

你的任务是 **实际编写代码并创建 PR**，而不仅仅是分析。如果你只做分析而没有写代码，任务就是失败的。

## 执行流程

### 阶段 1: 需求分析（简短）

1. 快速阅读需求，理解要做什么
2. 找到需要修改的文件位置
3. 如果需求完全不清晰无法开始，在 Issue 评论中提问然后停止

### 阶段 2: 创建分支

**必须先创建新分支再开始编码：**

```bash
git checkout -b claude/issue-{{issue_number}}-$(date +%Y%m%d-%H%M)
```

### 阶段 3: 编写代码

1. **直接开始写代码**，不要过度分析
2. 按照验收标准逐一实现功能
3. 参考项目中现有的类似代码风格
4. 对于数据库任务：
   - 查找现有的 model 文件位置（如 `backend/internal/model/`）
   - 查找现有的 migration 文件位置
   - 按照现有模式添加新字段和迁移
5. 对于 API 任务：
   - 参考现有的 handler/service/repository 模式
6. 对于前端任务：
   - 使用 shadcn/ui 组件
   - 参考现有页面结构

### 阶段 4: 提交代码

```bash
git add .
git commit -m "feat(issue-{{issue_number}}): 简短描述

详细说明做了什么修改

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 阶段 5: 推送并创建 PR

```bash
git push -u origin HEAD
gh pr create --title "feat: {{title}}" --body "## Summary
- 完成了 Issue #{{issue_number}} 的需求

## Changes
- 列出主要修改

## Test Plan
- 说明如何测试

Closes #{{issue_number}}"
```

## 项目结构

- 前端: `frontend/` (Next.js + TypeScript + shadcn/ui)
- 后端: `backend/` (Go + Gin + GORM)
- 后端模型: `backend/internal/model/`
- 后端 Handler: `backend/internal/handler/`
- 后端 Service: `backend/internal/service/`
- 类型定义: `frontend/lib/api/types.ts`
- API 客户端: `frontend/lib/api/client.ts`

## 质量要求

- 代码清晰易懂
- 遵循现有的设计模式和命名规范
- 处理边界情况
- 添加必要的错误处理

## 成功标准

任务成功的标志是：
1. ✅ 创建了新分支
2. ✅ 编写了实现需求的代码
3. ✅ 代码已提交
4. ✅ 已推送到远程
5. ✅ 已创建 PR
6. ✅ **更新了 Issue body 中的验收标准 checkbox**

**如果没有创建 PR，任务就是失败的。**

## ⚠️ 必须逐项更新验收标准 Checkbox

完成一项验收标准后，**仅更新该项的 checkbox**：

1. 获取当前 Issue body
2. **仅将你确实完成的项目**从 `- [ ]` 改为 `- [x]`
3. 使用 `gh issue edit` 更新

**重要：不要全部勾选！只勾选你实际完成的项目。**

示例：如果只完成了"添加 API 端点"这一项，只更新这一项：

```bash
# 获取当前 Issue body
CURRENT_BODY=$(gh issue view {{issue_number}} --json body --jq '.body')

# 仅更新你实际完成的特定项目（示例：更新包含某关键词的行）
# 方法1: 更新特定内容的 checkbox
UPDATED_BODY=$(echo "$CURRENT_BODY" | sed '/具体的验收标准文字/s/- \[ \]/- [x]/')

# 方法2: 如果你完成了所有验收标准，才使用全局替换
# UPDATED_BODY=$(echo "$CURRENT_BODY" | sed 's/- \[ \] /- [x] /g')

gh issue edit {{issue_number}} --body "$UPDATED_BODY"
```

**不更新 checkbox 等于任务未完成！假勾选会导致验收失败！**

## 处理"代码已存在"的情况

如果你发现代码已经存在：
1. **仍然需要验证代码是否满足所有验收标准**
2. **仍然需要更新 Issue body 中的 checkbox**
3. 如果没有需要修改的代码，创建一个说明性的评论并更新 checkbox
4. 不需要创建 PR，但必须在评论中说明原因
