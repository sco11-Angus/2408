# 🎮 AI-2048

> 开源软件课程项目 — Harness CI/CD 驱动 + AI 代码质量管理

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

经典的数字合并游戏，采用模块化架构，集成 Harness 全自动 CI/CD 流水线和 AI 驱动的代码质量管控。

## ✨ 特性

| 功能 | 说明 |
|------|------|
| 🎯 经典2048 | 键盘 + 触屏双支持，WASD/Vim(HJKL)多套按键 |
| ↩ 撤销功能 | Ctrl+Z 撤销上一步，无限悔棋 |
| 📐 多尺寸 | 支持 3×3 / 4×4 / 5×5 棋盘切换 |
| 🔊 音效反馈 | Web Audio API 合成音效，合并方块有反馈 |
| 🌟 破纪录动画 | 刷新最高分时金色闪烁特效 |
| 🤖 AI 审查 | AI 自动 Code Review + 生成测试用例 |
| 🔄 CI/CD | Harness Pipeline 全自动构建→测试→部署 |

## 🚀 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/Yu-717/2408.git
cd 2408

# 2. 直接在浏览器打开
open game2048/index.html

# 3. 或使用本地服务器
npx serve game2048
```

## 🎮 操作

| 按键 | 操作 |
|------|------|
| `↑ ↓ ← →` | 方向键移动 |
| `W A S D` | 备选移动 |
| `H J K L` | Vim风格 |
| `Ctrl+Z` | 撤销 |
| 触屏滑动 | 移动端 |

## 🏗️ 项目结构

```
game2048/
├── index.html              # 游戏入口
├── style.css               # 全局样式
├── src/
│   ├── game.js             # 🧠 核心逻辑（棋盘、移动、判定、撤销、音效）
│   ├── render.js           # 🎨 渲染模块（DOM绘制、消息提示）
│   └── input.js            # ⌨️ 输入控制（键盘、触屏）
├── test/
│   └── game.test.js        # 自动化测试（Mocha + Chai）
├── .github/                # CI/CD 配置
│   └── workflows/
│       ├── quality.yml     # 质量检查（lint + 测试矩阵 + AI审查 + 质量门禁）
│       └── deploy.yml      # GitHub Pages 自动部署
├── docs/
│   ├── CI_CD_PIPELINE.md   # 完整流水线文档 ← ★ 新增
│   └── ...
├── README.md
└── CONTRIBUTING.md
```

## 🧪 运行测试

```bash
npm install --save-dev mocha chai jsdom
npx mocha test/game.test.js
```

## 📋 模块 API

### game.js — 核心逻辑

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `initBoard(size?)` | `size: number` | `void` | 初始化棋盘 |
| `newGame()` | — | `void` | 重新开始 |
| `setBoardSize(n)` | `n: 3\|4\|5` | `void` | 切换棋盘大小 |
| `spawnTile()` | — | `boolean` | 生成随机方块 |
| `slideRow(row)` | `row: number[]` | `number[]` | 单行滑动合并 |
| `moveLeft()` | — | `boolean` | 左移 |
| `moveRight()` | — | `boolean` | 右移 |
| `moveUp()` | — | `boolean` | 上移 |
| `moveDown()` | — | `boolean` | 下移 |
| `doMove(dir)` | `dir: string` | `void` | 执行完整移动 |
| `undoMove()` | — | `boolean` | 撤销上一步 |
| `checkWin()` | — | `boolean` | 判定胜利 |
| `checkLose()` | — | `boolean` | 判定失败 |
| `getScore()` | — | `number` | 获取分数 |
| `getBoardSize()` | — | `number` | 获取棋盘尺寸 |
| `getMaxTile()` | — | `number` | 获取最大方块值 |

### render.js — 渲染

| 函数 | 说明 |
|------|------|
| `renderBoard()` | 渲染完整棋盘 |
| `showMessage(msg, isWin)` | 显示消息遮罩 |
| `hideMessage()` | 隐藏消息遮罩 |

## 👥 团队

| 角色 | 职责 |
|------|------|
| 成员A | 全栈游戏开发 |
| 成员B | AI能力 + 测试 |
| 成员C | CI/CD + 运营 |

## 📄 协议

MIT License
