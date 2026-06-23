/**
 * @file game.js — 2048 游戏核心逻辑
 * @author 成员A
 * @version 2.0.0
 */

// ============ 游戏状态 ============

/** @type {number[][]} 当前棋盘 */
let board = [];

/** @type {number} 当前分数 */
let score = 0;

/** @type {number} 历史最大数字（最高分） */
let bestScore = parseInt(localStorage.getItem('bestTile2048')) || 0;

/** @type {number} 棋盘边长 */
let size = 4;

/** @type {{board: number[][], score: number} | null} 上一步快照（支持撤销） */
let lastSnapshot = null;

/** @type {number} 累计消除次数（用于破纪录特效） */
let mergeCount = 0;

// ============ 音效（Web Audio API） ============

/** @type {AudioContext | null} */
let audioCtx = null;

/**
 * 播放短促音效
 * @param {number} freq - 频率 (Hz)
 * @param {number} duration - 时长 (秒)
 * @param {string} type - 波形类型
 */
function playBeep(freq = 440, duration = 0.08, type = 'sine') {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration);
    } catch (_) { /* 静默处理音效失败 */ }
}

/**
 * 根据合并的数字值播放对应音效
 * @param {number} value - 合并后的值
 */
function playMergeSound(value) {
    const freq = 220 + Math.log2(value) * 55;
    playBeep(freq, 0.12, 'triangle');
}

// ============ 核心函数 ============

/**
 * 初始化棋盘，随机生成2个方块
 * @param {number} [newSize=4] - 棋盘边长
 */
function initBoard(newSize = 4) {
    size = newSize;
    board = Array.from({ length: size }, () => Array(size).fill(0));
    score = 0;
    lastSnapshot = null;
    mergeCount = 0;
    updateScoreDisplay();
    hideMessage();
    spawnTile();
    spawnTile();
    renderBoard();
}

/**
 * 开始新游戏（默认4x4）
 */
function newGame() {
    initBoard(size);
}

/**
 * 设置棋盘大小并重新开始
 * @param {number} newSize - 新的棋盘边长 (3/4/5)
 */
function setBoardSize(newSize) {
    initBoard(newSize);
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('size-' + newSize)?.classList.add('active');
}

/**
 * 在空白格子中随机生成 2（90%）或 4（10%）
 * @returns {boolean} 是否成功生成
 */
function spawnTile() {
    const empty = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === 0) empty.push({ r, c });
        }
    }
    if (empty.length === 0) return false;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
}

// ============ 移动逻辑 ============

/**
 * 对单行/列执行滑动合并
 * 将非零元素向左侧靠拢，相邻相同元素合并为一个（值翻倍）
 * 例如：[0, 2, 2, 4] → [4, 4, 0, 0]
 * @param {number[]} row - 待处理的数组
 * @returns {number[]} 合并后的数组
 */
function slideRow(row) {
    let arr = row.filter(v => v !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i];
            playMergeSound(arr[i]);
            arr.splice(i + 1, 1);
        }
    }
    while (arr.length < size) arr.push(0);
    return arr;
}

/**
 * 向左移动
 * @returns {boolean} 是否发生了移动
 */
function moveLeft() {
    let moved = false;
    for (let r = 0; r < size; r++) {
        const oldRow = [...board[r]];
        board[r] = slideRow(board[r]);
        if (board[r].some((v, i) => v !== oldRow[i])) moved = true;
    }
    return moved;
}

/**
 * 向右移动
 * @returns {boolean} 是否发生了移动
 */
function moveRight() {
    let moved = false;
    for (let r = 0; r < size; r++) {
        const reversed = [...board[r]].reverse();
        const slid = slideRow(reversed).reverse();
        if (slid.some((v, i) => v !== board[r][i])) moved = true;
        board[r] = slid;
    }
    return moved;
}

/**
 * 向上移动
 * @returns {boolean} 是否发生了移动
 */
function moveUp() {
    let moved = false;
    for (let c = 0; c < size; c++) {
        const col = board.map(row => row[c]);
        const slid = slideRow(col);
        for (let r = 0; r < size; r++) {
            if (board[r][c] !== slid[r]) moved = true;
            board[r][c] = slid[r];
        }
    }
    return moved;
}

/**
 * 向下移动
 * @returns {boolean} 是否发生了移动
 */
function moveDown() {
    let moved = false;
    for (let c = 0; c < size; c++) {
        const col = board.map(row => row[c]).reverse();
        const slid = slideRow(col).reverse();
        for (let r = 0; r < size; r++) {
            if (board[r][c] !== slid[r]) moved = true;
            board[r][c] = slid[r];
        }
    }
    return moved;
}

// ============ 撤销功能 ============

/**
 * 保存当前棋盘快照（用于撤销）
 */
function snapshotBoard() {
    lastSnapshot = {
        board: board.map(row => [...row]),
        score: score
    };
}

/**
 * 撤销上一步操作
 * @returns {boolean} 是否成功撤销
 */
function undoMove() {
    if (!lastSnapshot) return false;
    board = lastSnapshot.board.map(row => [...row]);
    score = lastSnapshot.score;
    updateScoreDisplay();
    lastSnapshot = null;
    playBeep(330, 0.1, 'square');
    return true;
}

// ============ 胜负判定 ============

/**
 * 检查是否达成2048
 * @returns {boolean}
 */
function checkWin() {
    for (let r = 0; r < size; r++) {
        if (board[r].includes(2048)) return true;
    }
    return false;
}

/**
 * 检查是否无法继续移动
 * @returns {boolean}
 */
function checkLose() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === 0) return false;
            if (c < size - 1 && board[r][c] === board[r][c + 1]) return false;
            if (r < size - 1 && board[r][c] === board[r + 1][c]) return false;
        }
    }
    return true;
}

/**
 * 获取当前棋盘最大数字
 * @returns {number}
 */
function getMaxTile() {
    let max = 0;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] > max) max = board[r][c];
        }
    }
    return max;
}

// ============ 执行移动 ============

/**
 * 执行一次方向移动（完整流程：快照→移动→生成→渲染→判定）
 * @param {string} dir - 方向 ('left' | 'right' | 'up' | 'down')
 */
function doMove(dir) {
    snapshotBoard();
    let moved = false;
    switch (dir) {
        case 'left':  moved = moveLeft();  break;
        case 'right': moved = moveRight(); break;
        case 'up':    moved = moveUp();    break;
        case 'down':  moved = moveDown();  break;
    }
    if (moved) {
        if (lastSnapshot && lastSnapshot.board.every((row, r) => row.every((v, c) => v === board[r][c]))) {
            lastSnapshot = null; // 移动无效，丢弃快照
        }
        spawnTile();
        renderBoard();
        updateScoreDisplay();
        if (checkWin()) showMessage('🎉 你赢了！', true);
        else if (checkLose()) showMessage('😵 游戏结束', false);
    } else {
        lastSnapshot = null; // 无有效移动
    }
}

// ============ 分数系统 ============

/**
 * 更新分数显示，包含破纪录动画
 */
function updateScoreDisplay() {
    const maxTile = getMaxTile();
    if (maxTile > bestScore) {
        bestScore = maxTile;
        localStorage.setItem('bestTile2048', bestScore);
        document.getElementById('best').textContent = bestScore;
        // 破纪录特效：闪金色
        const bestBox = document.getElementById('best').parentElement;
        bestBox.classList.add('best-new');
        setTimeout(() => bestBox.classList.remove('best-new'), 800);
        playBeep(880, 0.2, 'sine');
    }
    const bestEl = document.getElementById('best');
    if (bestEl.textContent === '0') {
        bestEl.textContent = bestScore;
    }
}

/**
 * 获取当前分数
 * @returns {number}
 */
function getScore() {
    return score;
}

/**
 * 获取棋盘尺寸
 * @returns {number}
 */
function getBoardSize() {
    return size;
}

// ============ 暴露到全局 ============
window.game = {
    initBoard,
    newGame,
    setBoardSize,
    spawnTile,
    slideRow,
    moveLeft,
    moveRight,
    moveUp,
    moveDown,
    doMove,
    undoMove,
    checkWin,
    checkLose,
    getBoardSize,
    getScore,
    getMaxTile,
    updateScoreDisplay,
    get board() { return board; },
    get bestScore() { return bestScore; }
};
