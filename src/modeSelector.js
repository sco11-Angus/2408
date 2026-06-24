/**
 * @file modeSelector.js — 模式选择页面渲染
 * @description 游戏开始前显示模式选择页，用户必须选择模式后才能进入游戏
 * @version 1.1.0
 */

/**
 * 渲染模式选择页面
 * 显示三个模式卡片：ADHD专注 / 老年认知 / 普通
 */
function renderModeSelector() {
  const el = document.getElementById('mode-selector');
  const modes = window.GAME_MODES;
  const modeList = [modes.adhd, modes.senior, modes.normal];

  // 图标映射
  const icons = {
    adhd: '🧠',
    senior: '🌿',
    normal: '🎮'
  };

  // 颜色映射
  const colors = {
    adhd: '#6c5ce7',
    senior: '#00b894',
    normal: '#fdcb6e'
  };

  let html = '<h2 class="mode-title">选择训练模式</h2><div class="mode-cards">';

  modeList.forEach(mode => {
    html += `
      <div class="mode-card" data-mode="${mode.id}" style="border-top: 4px solid ${colors[mode.id]}">
        <div class="mode-icon">${icons[mode.id]}</div>
        <div class="mode-name">${mode.name}</div>
        <div class="mode-desc">${mode.description}</div>
        <div class="mode-goal">🎯 ${mode.goal}</div>
        <button class="mode-btn" style="background: ${colors[mode.id]}">
          ${mode.buttonText}
        </button>
      </div>`;
  });

  html += '</div>';
  el.innerHTML = html;

  // 绑定点击事件
  el.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', function (e) {
      // 如果点击的是按钮，不处理（按钮本身有事件）
      if (e.target.tagName === 'BUTTON') return;
      const modeId = this.dataset.mode;
      selectMode(modeId);
    });
  });

  el.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const modeId = this.closest('.mode-card').dataset.mode;
      selectMode(modeId);
    });
  });
}

/**
 * 选择模式并开始游戏
 * @param {string} modeId - 模式ID ('normal' | 'adhd' | 'senior')
 */
function selectMode(modeId) {
  const mode = window.GAME_MODES[modeId];
  if (!mode) return;

  // 隐藏模式选择页，显示游戏区域
  document.getElementById('mode-selector').style.display = 'none';
  document.getElementById('game-area').style.display = 'block';

  // 设置模式相关样式
  document.body.classList.remove('mode-senior', 'mode-adhd', 'mode-normal');
  document.body.classList.add('mode-' + modeId);

  // 显示/隐藏计时器
  const timerEl = document.getElementById('timer-display');
  if (modeId === 'adhd') {
    timerEl.style.display = 'flex';
  } else {
    timerEl.style.display = 'none';
  }

  // 初始化游戏
  window.game.initBoard(mode.boardSize, mode);
}

/**
 * 返回模式选择页
 */
function backToModeSelector() {
  // 停止计时器
  if (window.game.stopTimer) {
    window.game.stopTimer();
  }

  document.getElementById('game-area').style.display = 'none';
  document.getElementById('mode-selector').style.display = 'block';
  document.body.className = '';
  document.getElementById('message').className = 'message';
}

if (typeof window !== 'undefined') {
  window.renderModeSelector = renderModeSelector;
  window.selectMode = selectMode;
  window.backToModeSelector = backToModeSelector;
}

if (typeof module !== 'undefined') {
  module.exports = { renderModeSelector, selectMode, backToModeSelector };
}
