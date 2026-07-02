/**
 * @file render.js — 2048 游戏渲染模块
 * @author 成员A
 * @version 2.0.0
 */

/**
 * 渲染棋盘到DOM
 * 从 game 模块读取棋盘状态并绘制所有格子
 */
function renderBoard() {
    const boardEl = document.getElementById('board');
    const msgEl = document.getElementById('message');
    const size = window.game.getBoardSize();

    // 更新CSS变量控制棋盘列数
    boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    boardEl.innerHTML = '';
    boardEl.appendChild(msgEl);

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            const val = window.game.board[r][c];
            if (val !== 0) {
                cell.textContent = val;
                cell.classList.add('cell-' + val);
                cell.classList.add('cell-pop');
                // 大数字缩小字号
                if (val >= 1024) cell.style.fontSize = (size <= 4) ? '24px' : '20px';
                if (val >= 16384) cell.style.fontSize = '16px';
            }
            boardEl.appendChild(cell);
        }
    }
}

/**
 * 显示游戏结束 / 胜利消息
 * @param {string} msg - 消息文本（支持HTML）
 * @param {boolean} isWin - 是否为胜利（影响样式）
 */
function showMessage(msg, isWin = false) {
    const el = document.getElementById('message');
    el.innerHTML = msg + '<br><button onclick="window.game.newGame()">再来一局</button>';
    el.className = isWin ? 'message show win' : 'message show lose';
}

/**
 * 隐藏消息遮罩
 */
function hideMessage() {
    const el = document.getElementById('message');
    if (el) el.className = 'message';
}

if (typeof window !== 'undefined') {
    window.renderBoard = renderBoard;
    window.showMessage = showMessage;
    window.hideMessage = hideMessage;
}

if (typeof module !== 'undefined') {
    module.exports = { renderBoard, showMessage, hideMessage };
}
