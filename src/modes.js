/**
 * @file modes.js — 训练模式配置
 * @description 统一管理所有游戏模式的参数，禁止在业务逻辑中硬编码
 * @version 1.1.0
 */

const GAME_MODES = {
  normal: {
    id: 'normal',
    name: '普通模式',
    description: '经典2048体验',
    goal: '休闲娱乐与脑力训练',
    boardSize: 4,
    undoLimit: Infinity,
    buttonText: '开始游戏'
  },

  adhd: {
    id: 'adhd',
    name: 'ADHD专注模式',
    description: '10分钟专注挑战',
    goal: '保持持续专注并完成训练任务',
    boardSize: 4,
    undoLimit: Infinity,
    targetTime: 600,
    buttonText: '开始训练'
  },

  senior: {
    id: 'senior',
    name: '老年认知模式',
    description: '轻松节奏认知训练',
    goal: '锻炼记忆与逻辑能力',
    boardSize: 4,
    undoLimit: Infinity,
    largeFont: true,
    buttonText: '开始训练'
  }
};

if (typeof window !== 'undefined') {
  window.GAME_MODES = GAME_MODES;
}

if (typeof module !== 'undefined') {
  module.exports = { GAME_MODES };
}
