/**
 * @file input.js — 2048 输入控制模块
 * @author 成员A
 * @version 2.0.0
 *
 * 处理键盘、触屏输入，映射到游戏操作
 */

// ============ 键盘事件 ============

/**
 * 按键映射表
 * - 方向键：上下左右
 * - WASD / HJKL（Vim风格）
 */
const KEY_MAP = {
    'ArrowLeft':  'left',
    'ArrowRight': 'right',
    'ArrowUp':    'up',
    'ArrowDown':  'down',
    'a': 'left',  'd': 'right',  'w': 'up',  's': 'down',
    'h': 'left',  'l': 'right',  'k': 'up',  'j': 'down'
};

document.addEventListener('keydown', (e) => {
    // Ctrl+Z 撤销
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        window.game.undoMove();
        renderBoard();
        return;
    }

    const dir = KEY_MAP[e.key];
    if (dir) {
        e.preventDefault();
        window.game.doMove(dir);
    }
});

// ============ 触摸支持 ============

/** @type {number} */
let touchStartX = 0;
/** @type {number} */
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const threshold = 30;

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

    if (Math.abs(dx) > Math.abs(dy)) {
        window.game.doMove(dx > 0 ? 'right' : 'left');
    } else {
        window.game.doMove(dy > 0 ? 'down' : 'up');
    }
});

if (typeof window !== 'undefined') {
    window.KEY_MAP = KEY_MAP;
}

if (typeof module !== 'undefined') {
    module.exports = { KEY_MAP };
}
