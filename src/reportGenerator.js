/**
 * @file reportGenerator.js — 规则报告生成（AI 降级备用）
 * @version 1.3.0
 */

function generateRulesReport({ duration, moveCount, maxTile }) {
    const timePart = duration < 300  ? '完成了一次快速训练'
                   : duration < 900  ? '完成了一次较为完整的训练'
                   :                   '保持了较长时间的持续训练';

    const pacePart = moveCount < 150 ? '决策速度较快'
                   : moveCount < 300 ? '节奏较为稳定'
                   :                   '进行了充分思考';

    const tilePart = maxTile >= 2048 ? '成功完成2048挑战！'
                   : maxTile >= 1024 ? '逻辑规划能力表现良好。'
                   : maxTile >= 512  ? '已掌握基础策略。'
                   :                   '正在熟悉游戏规律。';

    const summary = `${timePart}，${pacePart}。${tilePart}`;

    const msgs = [
        '坚持训练会带来持续进步！',
        '今天也完成了一次脑力挑战！',
        '每一步思考都值得肯定！',
        '继续努力，下次一定更进一步！',
        '保持专注，你正在不断成长！'
    ];
    const encouragement = msgs[Math.floor(Math.random() * msgs.length)];

    const suggestion = moveCount < 100 ? '可以尝试提前规划数字布局，减少无效操作。'
                     : maxTile  < 512  ? '建议尽量将最大数字固定在角落，建立稳定结构。'
                     : maxTile >= 2048 ? '可以挑战更高分数，尝试完成4096！'
                     :                   '继续保持稳定节奏，逐步提升最大数字。';

    return { summary, encouragement, suggestion };
}

window.generateRulesReport = generateRulesReport;
