/**
 * Vibe Continuous - 24小时自动迭代引擎
 *
 * 此脚本负责检测 Issue 完成度并触发后续任务
 */

const fs = require('fs');

module.exports = async ({ github, context, core, mode, specificIssue }) => {
  const now = new Date();

  console.log("=".repeat(60));
  console.log("🔄 VIBE CONTINUOUS - 24小时自动迭代引擎");
  console.log("=".repeat(60));
  console.log(`时间: ${now.toISOString()}`);
  console.log(`模式: ${mode}`);
  if (specificIssue) console.log(`指定 Issue: #${specificIssue}`);

  // 读取配置
  let config;
  try {
    const configContent = fs.readFileSync('.github/config/workflow-config.json', 'utf8');
    config = JSON.parse(configContent);
  } catch (error) {
    console.warn(`⚠️ 无法读取配置文件，使用默认值`);
    config = {
      continuous: {
        check_interval_hours: 1,
        max_iterations_per_issue: 10
      }
    };
  }

  // 获取需要检测的 Issues
  async function getTargetIssues() {
    if (specificIssue) {
      const { data: issue } = await github.rest.issues.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: parseInt(specificIssue)
      });
      return [issue];
    }

    const { data: issues } = await github.rest.issues.listForRepo({
      owner: context.repo.owner,
      repo: context.repo.repo,
      state: 'open',
      per_page: 100
    });

    return issues.filter(issue => {
      const labels = issue.labels.map(l => l.name);
      const body = issue.body || '';

      const hasAcceptanceCriteria =
        body.includes('验收标准') ||
        body.includes('Acceptance Criteria') ||
        body.includes('## ✅') ||
        body.includes('- [ ]');

      const isInProgress =
        labels.includes('🤖 ai-processing') ||
        labels.includes('✅ ai-completed') ||
        labels.some(l => l.includes('complexity:'));

      const shouldSkip =
        labels.includes('skip-vibe') ||
        labels.includes('needs-triage') ||
        issue.title.startsWith('[PRD]');

      return hasAcceptanceCriteria && isInProgress && !shouldSkip;
    });
  }

  // 解析验收标准
  function parseAcceptanceCriteria(body) {
    const criteria = [];
    const lines = body.split('\n');
    let inCriteriaSection = false;

    for (const line of lines) {
      if (line.includes('验收标准') || line.includes('Acceptance Criteria') || line.includes('## ✅')) {
        inCriteriaSection = true;
        continue;
      }

      if (inCriteriaSection && line.startsWith('## ') && !line.includes('✅')) {
        inCriteriaSection = false;
        continue;
      }

      const checkboxMatch = line.match(/^[\s-]*\[([x ])\]\s*(.+)/i);
      if (checkboxMatch) {
        criteria.push({
          completed: checkboxMatch[1].toLowerCase() === 'x',
          text: checkboxMatch[2].trim()
        });
      }
    }

    if (criteria.length === 0) {
      const allCheckboxes = body.match(/\[([x ])\]\s*(.+)/gi) || [];
      for (const match of allCheckboxes) {
        const m = match.match(/\[([x ])\]\s*(.+)/i);
        if (m) {
          criteria.push({
            completed: m[1].toLowerCase() === 'x',
            text: m[2].trim()
          });
        }
      }
    }

    return criteria;
  }

  // 基于 checkbox 状态评估完成度
  function evaluateCompletion(criteria) {
    const completed = criteria.filter(c => c.completed).length;
    const total = criteria.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const completedItems = criteria.filter(c => c.completed).map(c => c.text);
    const pendingItems = criteria.filter(c => !c.completed).map(c => c.text);

    let agentType = 'medium';
    if (pendingItems.length <= 2) agentType = 'simple';
    else if (pendingItems.length > 5) agentType = 'complex';

    return {
      completion_percentage: percentage,
      completed_items: completedItems,
      pending_items: pendingItems,
      next_action: percentage < 100 ? `继续完成剩余 ${pendingItems.length} 项任务` : "所有验收标准已满足",
      should_continue: percentage < 100,
      agent_type: agentType
    };
  }

  // 从 Agent 评论中解析已完成项
  async function parseAgentCompletionFromComments(issueNumber, criteria) {
    try {
      const { data: comments } = await github.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        per_page: 50
      });

      const agentComments = comments.filter(c =>
        c.body && (
          c.body.includes('Claude finished') ||
          c.body.includes('Status: COMPLETE') ||
          c.body.includes('**Status: COMPLETE') ||
          (c.body.includes('验收标准') && c.body.includes('✅'))
        )
      );

      if (agentComments.length === 0) {
        console.log(`    📝 未找到 Agent 完成报告评论`);
        return null;
      }

      const latestComment = agentComments[agentComments.length - 1];
      const commentBody = latestComment.body;

      console.log(`    📝 找到 Agent 完成报告 (评论 ID: ${latestComment.id})`);

      // 如果评论中明确表示全部完成
      if (
        commentBody.includes('all requirements have already been implemented') ||
        commentBody.includes('All acceptance criteria') ||
        commentBody.includes('所有验收标准已满足') ||
        commentBody.includes('Status: COMPLETE')
      ) {
        console.log(`    ✅ Agent 报告所有验收标准已完成`);
        return criteria.map(c => c.text);
      }

      return null;
    } catch (error) {
      console.error(`    ❌ 解析 Agent 评论失败: ${error.message}`);
      return null;
    }
  }

  // 更新 Issue body 中的 checkbox 状态
  async function updateIssueCheckboxes(issueNumber, issueBody, completedItems) {
    let updatedBody = issueBody;
    let updateCount = 0;

    for (const item of completedItems) {
      const escapedItem = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const uncheckedPattern = new RegExp(`- \\[ \\]\\s*${escapedItem}`, 'gi');

      if (uncheckedPattern.test(updatedBody)) {
        updatedBody = updatedBody.replace(uncheckedPattern, `- [x] ${item}`);
        updateCount++;
      }
    }

    if (updateCount > 0) {
      await github.rest.issues.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        body: updatedBody
      });
      console.log(`    📝 已更新 ${updateCount} 个 checkbox 为已完成`);
      return updatedBody;
    }

    return issueBody;
  }

  // 触发 Agent 继续处理
  async function triggerContinuation(issue, evaluation) {
    const iterationMatch = issue.body?.match(/<!-- vibe-iteration: (\d+) -->/);
    const currentIteration = iterationMatch ? parseInt(iterationMatch[1]) : 0;
    const maxIterations = config.continuous?.max_iterations_per_issue || 10;

    if (currentIteration >= maxIterations) {
      console.log(`⚠️ Issue #${issue.number} 已达最大迭代次数 (${maxIterations})`);

      await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue.number,
        body: `⚠️ **自动迭代已达上限**\n\n此任务已自动迭代 ${maxIterations} 次，需要人工介入。\n\n**当前完成度**: ${evaluation.completion_percentage}%\n\n**未完成项目**:\n${evaluation.pending_items.map(p => '- ' + p).join('\n')}\n\n---\n> 🔍 由 Vibe Continuous 检测`
      });

      await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue.number,
        labels: ['needs-review', '⚠️ iteration-limit']
      });

      return false;
    }

    const newBody = issue.body?.includes('<!-- vibe-iteration:')
      ? issue.body.replace(/<!-- vibe-iteration: \d+ -->/, `<!-- vibe-iteration: ${currentIteration + 1} -->`)
      : `${issue.body || ''}\n\n<!-- vibe-iteration: ${currentIteration + 1} -->`;

    await github.rest.issues.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issue.number,
      body: newBody
    });

    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issue.number,
      body: `## 🔄 自动迭代 #${currentIteration + 1}\n\n**完成度检测结果**:\n- 当前进度: ${evaluation.completion_percentage}%\n- 待完成: ${evaluation.pending_items.length} 项\n\n**待完成项目**:\n${evaluation.pending_items.map(p => '- [ ] ' + p).join('\n')}\n\n---\n> 🔄 由 Vibe Continuous 自动触发`
    });

    const agentWorkflow = evaluation.agent_type === 'simple' ? 'agent-simple.yml' :
                          evaluation.agent_type === 'complex' ? 'agent-complex.yml' : 'agent-medium.yml';

    try {
      await github.rest.actions.createWorkflowDispatch({
        owner: context.repo.owner,
        repo: context.repo.repo,
        workflow_id: agentWorkflow,
        ref: 'main',
        inputs: {
          issue_number: String(issue.number)
        }
      });
      console.log(`✅ 已触发 ${agentWorkflow} 处理 Issue #${issue.number}`);
    } catch (dispatchError) {
      console.error(`❌ 触发 ${agentWorkflow} 失败: ${dispatchError.message}`);
      return false;
    }

    return true;
  }

  // 处理验收通过
  async function handleVerified(issue, evaluation) {
    const issueLabels = issue.labels.map(l => l.name);
    const isSubIssue = issueLabels.includes('sub-issue');

    // 移除进行中的标签
    const labelsToRemove = ['🤖 ai-processing', '❌ ai-failed', 'needs-review', 'agent:medium', 'agent:simple', 'agent:complex'];
    for (const label of labelsToRemove) {
      try {
        await github.rest.issues.removeLabel({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: issue.number,
          name: label
        });
      } catch (e) {}
    }

    if (isSubIssue) {
      await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue.number,
        body: `## ✅ 验收通过\n\n**完成度**: ${evaluation.completion_percentage}%\n\n**已完成项目**:\n${evaluation.completed_items.map(i => '- [x] ' + i).join('\n')}\n\n此 Issue 为子任务，验收通过后自动关闭以触发依赖链中的下一个任务。\n\n---\n> 🔍 由 Vibe Continuous 自动验收`
      });

      await github.rest.issues.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue.number,
        state: 'closed'
      });

      console.log(`  🎉 Sub-Issue #${issue.number} 验收通过，已自动关闭`);
    } else {
      await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue.number,
        body: `## ✅ 验收通过\n\n**完成度**: ${evaluation.completion_percentage}%\n\n**已完成项目**:\n${evaluation.completed_items.map(i => '- [x] ' + i).join('\n')}\n\n所有验收标准已满足，请确认后关闭此 Issue。\n\n---\n> 🔍 由 Vibe Continuous 自动验收`
      });

      await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue.number,
        labels: ['📋 pending-confirmation']
      });

      console.log(`  🎉 Issue #${issue.number} 验收通过，等待用户最终确认`);
    }
  }

  // 主逻辑
  const targetIssues = await getTargetIssues();
  console.log(`\n📋 找到 ${targetIssues.length} 个需要检测的 Issue\n`);

  const results = { checked: 0, completed: 0, continued: 0, skipped: 0 };

  for (const issue of targetIssues) {
    console.log(`\n${"─".repeat(50)}`);
    console.log(`📌 Issue #${issue.number}: ${issue.title}`);

    const criteria = parseAcceptanceCriteria(issue.body || '');
    if (criteria.length === 0) {
      console.log(`  ⏭️ 跳过: 无可识别的验收标准`);
      results.skipped++;
      continue;
    }

    console.log(`  📋 验收标准: ${criteria.length} 项`);
    console.log(`  ✅ 已完成: ${criteria.filter(c => c.completed).length} 项`);

    // 从 Agent 评论中解析已完成项
    let currentBody = issue.body || '';
    const agentCompletedItems = await parseAgentCompletionFromComments(issue.number, criteria);

    if (agentCompletedItems && agentCompletedItems.length > 0) {
      currentBody = await updateIssueCheckboxes(issue.number, currentBody, agentCompletedItems);
      const updatedCriteria = parseAcceptanceCriteria(currentBody);
      if (updatedCriteria.length > 0) {
        criteria.length = 0;
        criteria.push(...updatedCriteria);
      }
    }

    const evaluation = evaluateCompletion(criteria);
    console.log(`  📊 Checkbox 完成度: ${evaluation.completion_percentage}%`);
    results.checked++;

    if (evaluation.completion_percentage >= 100) {
      console.log(`  ✅ 任务已完成！`);
      results.completed++;

      await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue.number,
        labels: ['✅ verified']
      });

      if (mode === 'verify') {
        await handleVerified(issue, evaluation);
      }

    } else if (evaluation.should_continue && (mode === 'scan' || mode === 'continue')) {
      const triggered = await triggerContinuation(issue, evaluation);
      if (triggered) results.continued++;
    } else if (mode === 'verify') {
      console.log(`  ❌ 验收未通过，完成度: ${evaluation.completion_percentage}%`);

      await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue.number,
        body: `## ⚠️ 验收未通过\n\n**完成度**: ${evaluation.completion_percentage}%\n\n**未完成项目**:\n${evaluation.pending_items.map(i => '- [ ] ' + i).join('\n')}\n\n**建议下一步**:\n${evaluation.next_action}\n\n---\n> 🔍 由 Vibe Continuous 自动验收`
      });

      await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue.number,
        labels: ['needs-review']
      });
    } else {
      console.log(`  ℹ️ 完成度: ${evaluation.completion_percentage}% (模式: ${mode})`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 检测结果汇总");
  console.log("=".repeat(60));
  console.log(`  检测: ${results.checked} 个`);
  console.log(`  已完成: ${results.completed} 个`);
  console.log(`  继续迭代: ${results.continued} 个`);
  console.log(`  跳过: ${results.skipped} 个`);

  return results;
};
