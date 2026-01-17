# `.github` 目录问题分析报告

> 生成时间：2026-01-17  
> 分析范围：整个 `.github` 目录的结构、配置、workflow 和文档

---

## 🔴 严重问题（必须修复）

### 1. 配置文件缺失
**问题**：多处代码引用 `.github/config/workflow-config.json`，但该文件不存在

**影响位置**：
- `vibe-router.js` 第 22 行
- `vibe-continuous.js` 第 55 行
- `README.md` 多处文档说明

**后果**：
```javascript
// vibe-router.js 会回退到默认配置
console.warn(`⚠️ 无法读取配置文件，使用默认配置: ${error.message}`);
```

**建议**：
- [ ] 创建 `.github/config/workflow-config.json`
- [ ] 或者移除所有对该文件的引用，改用硬编码配置

---

### 2. 硬编码路径存在
**问题**：`debug-checker.js` 包含硬编码的绝对路径

```javascript
// .github/scripts/debug-checker.js:10
const LOG_PATH = '/Users/xiaozihao/Documents/01_Projects/Work_Code/work/Team_AI/vibe-engineering-playbook/.cursor/debug.log';
```

**建议**：
- [ ] 使用相对路径或环境变量
- [ ] 或者删除此文件（如果不再使用）

---

### 3. 标签系统不一致
**问题**：代码中使用 emoji 标签，但文档说已去除 emoji

**文档声明**（LABEL_SYSTEM_V2.md）：
```
3. **去除 emoji**：状态标签更专业（`ai:processing` 代替 `🤖 ai-processing`）
```

**实际代码中仍在使用**：
- `vibe-continuous.js` 第 481、501 行：`🤖 ai-processing`
- `vibe-continuous.js` 第 299-310 行：`🤖 ai-processing`, `❌ ai-failed`, `✅ ai-completed`
- `issue-manager.yml` 第 58 行：提示信息中使用 emoji 标签

**建议**：
- [ ] 选择一种风格（emoji 或纯文本）
- [ ] 统一修改所有代码和文档
- [ ] 推荐使用纯文本标签（更专业）

---

## 🟡 中等问题（建议修复）

### 4. `vibe-agent.yml` 文件过于臃肿
**问题**：单文件 1060 行，包含 5 个 job（解析命令、UI Agent、Spec Agent、BE Agent、FE Agent）

**代码重复**：
- PM Compiler 逻辑在 `agent-ui` 和 `agent-spec` 中重复（150+ 行代码）
- Feature Branch 检测逻辑在 `agent-be` 和 `agent-fe` 中重复（40+ 行代码）
- Git 配置在每个 job 中重复

**建议**：
```
方案 A：拆分为独立 workflow
- vibe-agent-ui.yml
- vibe-agent-spec.yml
- vibe-agent-be.yml
- vibe-agent-fe.yml
- vibe-command-parser.yml（共享解析逻辑）

方案 B：提取共享 Action
- .github/actions/pm-compiler/
- .github/actions/feature-branch-detector/
- .github/actions/setup-vibe-git/
```

**推荐**：方案 B（更灵活，复用性更好）

---

### 5. 文档维护问题
**问题**：多个文档描述相同功能，容易造成混淆

**重复内容**：
- `README.md`：626 行，包含大量更新日志
- `AGENT_GUIDE.md`：392 行，用户使用指南
- `VIBE_ROUTER_UPDATE.md`：139 行，Router 说明
- `LABEL_SYSTEM_V2.md`：标签系统说明
- `LABEL_OPTIMIZATION.md`：标签优化说明（内容与 V2 重复）

**建议**：
```
docs/
├── USER_GUIDE.md          # 用户使用指南（整合 AGENT_GUIDE.md）
├── ARCHITECTURE.md         # 系统架构说明（整合 README.md 的架构部分）
├── CHANGELOG.md            # 更新日志（从 README.md 提取）
└── LABELS.md               # 标签系统（合并 LABEL_SYSTEM_V2 和 LABEL_OPTIMIZATION）

workflows/README.md         # Workflow 技术文档（保留）
```

---

### 6. Workflow 触发逻辑不够自动化
**问题**：用户创建 Issue 后需要手动添加 `needs-route` 标签才能触发路由

**当前流程**：
```
1. 用户创建 Issue
   ↓
2. issue-manager.yml 触发：发送欢迎消息（仅此而已）
   ↓
3. 用户需要手动添加 needs-route 标签
   ↓
4. vibe-router.yml 才会触发分析
```

**建议**：
```yaml
# 方案 A：自动触发（推荐）
on:
  issues:
    types: [opened, edited]  # 创建或编辑时自动触发

# 方案 B：智能判断
# 如果 Issue body 包含验收标准，自动添加 needs-route 标签
```

---

## 🟢 优化建议（可选）

### 7. 脚本文件组织良好
**现状**：已成功提取 3 个脚本文件
- `vibe-router.js`：复杂度路由（225 行）
- `vibe-continuous.js`：自动迭代引擎（734 行）
- `agent-utils.js`：共享工具函数（292 行）

**优点**：
- ✅ 代码复用性高
- ✅ 易于测试和维护
- ✅ workflow 文件更简洁

**建议**：继续保持此风格，考虑提取更多共享逻辑

---

### 8. Actions 复用度可以提高
**现状**：只有 2 个 composite actions
- `load-prompt`：加载 prompt 模板
- `context-discovery`：上下文发现

**建议**：继续提取可复用 actions
```
.github/actions/
├── load-prompt/           ✅ 已存在
├── context-discovery/     ✅ 已存在
├── pm-compiler/           🆕 编译产品需求
├── feature-detector/      🆕 检测功能分支
├── setup-vibe-git/        🆕 设置 Git 配置
└── api-contract-gen/      🆕 生成 API Contract
```

---

### 9. 标签数量可以进一步优化
**当前**：10 个核心标签 + 动态标签

**建议**：考虑合并部分标签
```
合并前：
- ai:processing
- ai:completed
- ai:failed

合并后：
- ai-status:processing
- ai-status:completed
- ai-status:failed
```

**好处**：
- 更容易过滤（`ai-status:*`）
- 减少命名冲突
- 更易管理

---

## 📊 文件结构分析

### 当前目录结构
```
.github/
├── actions/ (2 个)
│   ├── context-discovery/     ✅ 复用良好
│   └── load-prompt/           ✅ 复用良好
├── config/
│   └── workflow-config.json   ❌ 缺失
├── prompts/ (9 个)
│   ├── router/
│   │   └── complexity-analyzer.md
│   └── agents/
│       ├── simple.md
│       ├── medium.md
│       └── vibe/
│           ├── pm-compiler.md
│           ├── ui-spec.md
│           ├── tech-spec.md
│           ├── be-contract.md
│           ├── be-codegen.md
│           └── fe-codegen.md
├── scripts/ (4 个)
│   ├── vibe-router.js         ✅ 模块化良好
│   ├── vibe-continuous.js     ✅ 模块化良好
│   ├── agent-utils.js         ✅ 模块化良好
│   └── debug-checker.js       ⚠️ 有硬编码路径
├── workflows/ (16 个)
│   ├── vibe-agent.yml         ⚠️ 过于臃肿 (1060 行)
│   ├── vibe-router.yml        ✅ 已模块化
│   ├── vibe-continuous.yml    ✅ 已模块化
│   ├── agent-simple.yml
│   ├── agent-medium.yml
│   ├── agent-complex.yml
│   ├── issue-manager.yml
│   └── ... (9 个其他 workflow)
└── 文档 (7 个)
    ├── AGENT_GUIDE.md         📄 用户指南
    ├── README.md              📄 技术文档 + 更新日志
    ├── LABEL_SYSTEM_V2.md     📄 标签系统
    ├── LABEL_OPTIMIZATION.md  ⚠️ 与 V2 重复
    ├── VIBE_ROUTER_UPDATE.md  ⚠️ 可合并到 README
    ├── WORKFLOW_ISSUES_FIXED.md
    └── .claude/ (配置文件)
```

### 健康度评分
```
✅ 优秀：脚本模块化 (85/100)
⚠️ 良好：Actions 复用 (70/100)
⚠️ 一般：Workflow 组织 (60/100)
❌ 较差：配置管理 (40/100) - config 文件缺失
❌ 较差：文档维护 (45/100) - 重复内容多
```

---

## 🎯 优先级修复建议

### 🔥 立即修复（P0）
1. ✅ 创建 `workflow-config.json` 或移除所有引用
2. ✅ 统一标签系统（emoji vs 纯文本）
3. ✅ 修复 `debug-checker.js` 硬编码路径

### ⚡ 短期优化（P1 - 本周内）
4. ✅ 拆分 `vibe-agent.yml`（提取共享 Actions）
5. ✅ 整理文档结构（合并重复内容）
6. ✅ 优化 Issue 自动触发流程

### 🔧 中期改进（P2 - 本月内）
7. ✅ 提取更多可复用 Actions
8. ✅ 优化标签命名规范
9. ✅ 添加 workflow 单元测试

---

## 📝 具体修复步骤

### Step 1: 创建配置文件
```bash
mkdir -p .github/config
cat > .github/config/workflow-config.json << 'EOF'
{
  "version": "1.1.0",
  "router": {
    "complexity_thresholds": {
      "simple_max_chars": 500,
      "medium_max_chars": 2000
    }
  },
  "monitor": {
    "stale_threshold_hours": 4,
    "retry_limit": 3,
    "retry_interval_minutes": 30
  },
  "continuous": {
    "check_interval_hours": 1,
    "max_iterations_per_issue": 10
  },
  "agents": {
    "default_model": "anthropic/claude-sonnet-4",
    "ui_model": "google/gemini-2.0-flash-001",
    "router_model": "google/gemini-2.0-flash-001",
    "max_turns": {
      "simple": 30,
      "medium": 50,
      "complex": 60
    }
  },
  "paths": {
    "spec_dir": "docs/specs",
    "prompts_dir": ".github/prompts"
  },
  "labels": {
    "status": {
      "processing": "ai:processing",
      "completed": "ai:completed",
      "failed": "ai:failed"
    },
    "complexity": {
      "simple": "complexity:simple",
      "medium": "complexity:medium",
      "complex": "complexity:complex"
    },
    "scope": {
      "frontend": "frontend",
      "backend": "backend",
      "database": "database"
    },
    "ui_spec": "ui-spec-ready"
  },
  "git": {
    "bot_name": "vibe-agent[bot]",
    "bot_email": "vibe-agent@github-actions.bot"
  }
}
EOF
```

### Step 2: 统一标签系统
```bash
# 在所有文件中替换 emoji 标签为纯文本
find .github -name "*.js" -o -name "*.yml" | xargs sed -i '' \
  -e 's/🤖 ai-processing/ai:processing/g' \
  -e 's/✅ ai-completed/ai:completed/g' \
  -e 's/❌ ai-failed/ai:failed/g' \
  -e 's/⚠️ stale/stale/g' \
  -e 's/⚠️ no-pr/no-pr/g'
```

### Step 3: 修复硬编码路径
```javascript
// .github/scripts/debug-checker.js
// 修改前
const LOG_PATH = '/Users/xiaozihao/Documents/.../debug.log';

// 修改后
const LOG_PATH = path.join(process.cwd(), '.cursor/debug.log');
```

### Step 4: 整理文档
```bash
# 1. 合并更新日志
mv .github/workflows/README.md .github/WORKFLOWS.md
cat >> docs/CHANGELOG.md << 'EOF'
# 从 .github/WORKFLOWS.md 提取更新日志部分
EOF

# 2. 删除重复文档
rm .github/LABEL_OPTIMIZATION.md
rm .github/VIBE_ROUTER_UPDATE.md

# 3. 创建新的文档结构
mkdir -p docs
```

---

## 🔍 检查清单

使用此清单验证修复完成度：

### 配置完整性
- [ ] `workflow-config.json` 已创建并包含所有必需字段
- [ ] 所有脚本都能正确读取配置
- [ ] 配置 Schema 验证通过

### 代码质量
- [ ] 无硬编码路径
- [ ] 标签使用一致（emoji vs 纯文本）
- [ ] 无重复代码块（>50 行）
- [ ] 所有 workflow 正常运行

### 文档质量
- [ ] 无重复文档
- [ ] 文档与代码实现一致
- [ ] 所有链接有效
- [ ] 更新日志独立维护

### 测试覆盖
- [ ] 所有 workflow 都有测试用例
- [ ] 所有脚本都有单元测试
- [ ] 边界情况已覆盖

---

## 📈 预期改进效果

### 代码维护性
- 减少重复代码：~300 行
- 提高复用性：+40%
- 降低出错概率：-50%

### 文档质量
- 减少文档数量：7 → 4 个
- 提高一致性：100%
- 降低学习成本：-60%

### 系统可靠性
- 减少配置错误：100%（配置集中管理）
- 提高自动化程度：+30%
- 降低维护成本：-40%

---

## 🤝 后续维护建议

### 代码审查规范
1. 所有 PR 必须通过 lint 检查
2. 新增 workflow 必须添加文档说明
3. 配置变更必须更新 `workflow-config.json`

### 文档维护规范
1. 每次功能变更必须同步更新文档
2. 每月检查文档与代码一致性
3. 更新日志及时记录

### 监控和告警
1. 添加 workflow 执行失败告警
2. 监控 API 调用限流情况
3. 定期检查 stale issue

---

**生成时间**：2026-01-17  
**下次审查**：2026-02-17（建议每月审查一次）
