# AI 代码审查实践

## 目标

本项目引入 AI 自动代码审查能力，用于辅助发现潜在 Bug、安全风险、复杂度问题、测试缺失和边界条件遗漏。

## 脚本

```bash
npm run ai:review
```

脚本位置：

```text
scripts/ai_review.js
```

输出报告：

```text
reports/ai_review.md
```

## 工作流程

1. GitHub Actions 拉取代码。
2. 执行 lint、单元测试和覆盖率质量门禁。
3. 执行 `npm run ai:tests` 生成边界测试建议。
4. 执行 `npm run ai:review` 生成 AI Code Review 报告。
5. 将覆盖率、AI Review 报告和 AI 生成测试建议上传为 CI Artifact。

## AI 接入方式

脚本默认支持两种模式：

- 未配置密钥：使用本地启发式审查，保证 CI 可运行。
- 配置 `AI_API_KEY`：调用 OpenAI 兼容接口生成真实 AI 审查报告。

可选环境变量：

```text
AI_API_KEY
AI_API_BASE_URL
AI_MODEL
```

## 审查维度

- 潜在 Bug
- 安全风险
- 重复逻辑
- 复杂度
- 边界条件遗漏
- 测试覆盖不足

## 质量门禁建议

每个 Pull Request 应满足：

1. 单元测试全部通过。
2. 覆盖率达到项目阈值。
3. AI Review 不出现未处理的 High 级别问题。
4. 新功能至少包含正常用例和边界用例。
