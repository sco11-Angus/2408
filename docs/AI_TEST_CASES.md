# AI 生成测试用例流程

## 目标

通过 AI 分析核心源码，自动生成边界测试建议，再由开发者人工筛选并加入正式测试套件。

## 执行命令

```bash
npm run ai:tests
```

## 脚本位置

```text
scripts/ai_generate_tests.js
```

## 输出位置

```text
tests/ai_generated/boundary_test_suggestions.md
```

## 使用原则

1. AI 生成的是建议，不直接无审核合入正式测试。
2. 人工确认输入、期望输出和业务规则后，再加入 `test/game.test.js`。
3. 优先选择边界值、异常输入和容易回归的场景。

## 当前重点场景

- 四个相同数字成对合并
- 满盘不可合并 / 满盘但可合并
- 无空格时 `spawnTile()` 返回 false
- 不同棋盘尺寸的初始化
- 有效移动后的撤销恢复
