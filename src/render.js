/**
 * @file render.js — 2048 游戏渲染模块
 * @author 成员A
 * @version 1.1.0
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
 * 显示游戏结束 / 胜利 / 训练完成消息
 * @param {string} msg - 消息HTML文本
 * @param {boolean} [isWin=false] - 是否为胜利（影响样式）
 * @param {boolean} [autoButton=true] - 是否自动添加"再来一局"按钮
 */
function showMessage(msg, isWin = false, autoButton = false) {
    const el = document.getElementById('message');
    let html = msg;
    // 仅在消息不含按钮且需要自动添加时追加
    if (autoButton && !msg.includes('<button')) {
        html += '<br><button onclick="window.game.newGame();hideMessage();">再来一局</button>';
    }
    el.innerHTML = html;
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
