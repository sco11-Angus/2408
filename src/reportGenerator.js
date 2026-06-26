/**
 * @file reportGenerator.js — 训练报告生成模块
 * @description 基于规则模板生成训练报告，不依赖AI接口，方便后续替换为LLM生成
 * @version 1.2.0
 */

const ReportGenerator = {

    /** @type {string[]} 鼓励语库 */
    encouragements: [
        '坚持训练会带来持续进步！',
        '今天也完成了一次脑力挑战！',
        '每一步思考都值得肯定！',
        '继续努力，下次一定会更进一步！',
        '保持专注，你正在不断成长！'
    ],

    /**
     * 根据统计数据生成完整训练报告
     * @param {object} stats - GameStats.getReport() 返回的数据
     * @returns {object} { summary, encouragement, suggestion }
     */
    generate(stats) {
        return {
            summary: this.generateSummary(stats),
            encouragement: this.generateEncouragement(),
            suggestion: this.generateSuggestion(stats)
        };
    },

    /**
     * 生成表现总结
     * @param {object} stats
     * @returns {string[]} 多条总结
     */
    generateSummary(stats) {
        const lines = [];

        // 时长评价
        const durationMin = stats.duration / 60000;
        if (durationMin < 5) {
            lines.push('完成了一次快速训练。');
        } else if (durationMin <= 15) {
            lines.push('完成了一次较为完整的训练。');
        } else {
            lines.push('保持了较长时间的持续训练。');
        }

        // 步数评价
        if (stats.moveCount < 150) {
            lines.push('决策速度较快。');
        } else if (stats.moveCount <= 300) {
            lines.push('节奏较为稳定。');
        } else {
            lines.push('进行了充分思考。');
        }

        // 最大数字评价
        if (stats.maxTile >= 4096) {
            lines.push('表现优秀，继续保持！');
        } else if (stats.maxTile >= 2048) {
            lines.push('成功完成2048挑战！');
        } else if (stats.maxTile >= 1024) {
            lines.push('逻辑规划能力表现良好。');
        } else if (stats.maxTile >= 512) {
            lines.push('已经掌握基础策略。');
        }

        return lines;
    },

    /**
     * 随机选取一句鼓励语
     * @returns {string}
     */
    generateEncouragement() {
        const idx = Math.floor(Math.random() * this.encouragements.length);
        return this.encouragements[idx];
    },

    /**
     * 根据数据生成训练建议
     * @param {object} stats
     * @returns {string}
     */
    generateSuggestion(stats) {
        // 步数过少 → 建议规划
        if (stats.moveCount < 150) {
            return '可以尝试提前规划数字布局。';
        }

        // 最大数字不到512 → 建议角落策略
        if (stats.maxTile < 512) {
            return '建议尽量将最大数字固定在角落。';
        }

        // 达到2048 → 挑战更高
        if (stats.maxTile >= 2048) {
            return '可以挑战更高分数，尝试完成4096。';
        }

        // 默认建议
        return '继续保持稳定节奏。';
    }
};

if (typeof window !== 'undefined') {
    window.ReportGenerator = ReportGenerator;
}

if (typeof module !== 'undefined') {
    module.exports = { ReportGenerator };
}
