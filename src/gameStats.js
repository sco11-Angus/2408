/**
 * @file gameStats.js — 游戏统计数据模块
 * @description 记录每局游戏的统计数据，独立封装，不依赖核心算法
 * @version 1.2.0
 */

const GameStats = {
    /** @type {string} 训练模式ID */
    mode: 'normal',

    /** @type {number} 开始时间戳 */
    startTime: 0,

    /** @type {number} 结束时间戳 */
    endTime: 0,

    /** @type {number} 游戏时长（毫秒） */
    duration: 0,

    /** @type {number} 移动步数 */
    moveCount: 0,

    /** @type {number} 最终分数 */
    score: 0,

    /** @type {number} 最大数字 */
    maxTile: 0,

    /**
     * 开始记录一局游戏
     * @param {string} modeId - 训练模式ID
     */
    start(modeId) {
        this.mode = modeId || 'normal';
        this.startTime = Date.now();
        this.endTime = 0;
        this.duration = 0;
        this.moveCount = 0;
        this.score = 0;
        this.maxTile = 0;
    },

    /**
     * 记录一次移动
     */
    recordMove() {
        this.moveCount++;
    },

    /**
     * 结束游戏并计算统计数据
     * @param {number} score - 最终分数
     * @param {number} maxTile - 最大数字
     * @returns {object} 统计结果
     */
    finish(score, maxTile) {
        this.endTime = Date.now();
        this.duration = this.endTime - this.startTime;
        this.score = score;
        this.maxTile = maxTile;
        return this.getReport();
    },

    /**
     * 获取统计数据快照
     * @returns {object}
     */
    getReport() {
        return {
            mode: this.mode,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.duration,
            moveCount: this.moveCount,
            score: this.score,
            maxTile: this.maxTile
        };
    },

    /**
     * 格式化时长为 中文 字符串
     * @param {number} ms - 毫秒
     * @returns {string} 如 "8分32秒"
     */
    formatDuration(ms) {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        if (min > 0) {
            return min + '分' + sec + '秒';
        }
        return sec + '秒';
    }
};

if (typeof window !== 'undefined') {
    window.GameStats = GameStats;
}

if (typeof module !== 'undefined') {
    module.exports = { GameStats };
}
