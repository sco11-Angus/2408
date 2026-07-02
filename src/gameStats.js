/**
 * @file gameStats.js — 游戏统计模块
 * @version 1.3.0
 */

const gameStats = {
    mode: '',
    startTime: 0,
    moveCount: 0,

    start(boardSize) {
        this.startTime = Date.now();
        this.moveCount = 0;
        this.mode = `标准 ${boardSize}×${boardSize}`;
    },

    recordMove() {
        this.moveCount++;
    },

    /** 返回本局完整统计快照 */
    collect(isWin) {
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        return {
            mode: this.mode || '标准模式',
            duration,
            moveCount: this.moveCount,
            score: window.game.getScore(),
            maxTile: window.game.getMaxTile(),
            boardSize: window.game.getBoardSize(),
            isWin: !!isWin
        };
    }
};

window.gameStats = gameStats;
