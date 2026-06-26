/**
 * @file reportModal.js — 训练报告弹窗模块
 * @description 渲染和显示训练报告弹窗，与 game/render 模块解耦
 * @version 1.2.0
 */

const ReportModal = {

    /** @type {string} 当前模式名称 */
    modeName: '普通模式',

    /**
     * 获取模式显示名称
     * @param {string} modeId
     * @returns {string}
     */
    getModeName(modeId) {
        const names = {
            'normal': '普通模式',
            'adhd': 'ADHD专注模式',
            'senior': '老年认知模式'
        };
        return names[modeId] || modeId;
    },

    /**
     * 显示训练报告弹窗
     * @param {object} stats - 统计数据
     */
    show(stats) {
        const report = window.ReportGenerator.generate(stats);
        const durationStr = window.GameStats.formatDuration(stats.duration);
        const modeName = this.getModeName(stats.mode);

        // 构建总结文本
        const summaryHtml = report.summary.map(line =>
            '<div class="report-summary-item">' + line + '</div>'
        ).join('');

        const html =
            '<div class="report-overlay" id="report-overlay">' +
                '<div class="report-modal">' +
                    // 标题
                    '<div class="report-header">' +
                        '<div class="report-icon">📊</div>' +
                        '<div class="report-title">训练报告</div>' +
                    '</div>' +

                    // 分割线
                    '<div class="report-divider"></div>' +

                    // 数据统计
                    '<div class="report-section">' +
                        '<div class="report-section-title">📋 本局数据</div>' +
                        '<div class="report-stats">' +
                            '<div class="report-stat">' +
                                '<span class="stat-label">训练模式</span>' +
                                '<span class="stat-value">' + modeName + '</span>' +
                            '</div>' +
                            '<div class="report-stat">' +
                                '<span class="stat-label">游戏时长</span>' +
                                '<span class="stat-value">' + durationStr + '</span>' +
                            '</div>' +
                            '<div class="report-stat">' +
                                '<span class="stat-label">步数</span>' +
                                '<span class="stat-value">' + stats.moveCount + '</span>' +
                            '</div>' +
                            '<div class="report-stat">' +
                                '<span class="stat-label">最高分</span>' +
                                '<span class="stat-value">' + stats.score + '</span>' +
                            '</div>' +
                            '<div class="report-stat">' +
                                '<span class="stat-label">最大数字</span>' +
                                '<span class="stat-value highlight">' + stats.maxTile + '</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    // 分割线
                    '<div class="report-divider"></div>' +

                    // 表现总结
                    '<div class="report-section">' +
                        '<div class="report-section-title">📝 表现总结</div>' +
                        '<div class="report-summary">' +
                            summaryHtml +
                        '</div>' +
                    '</div>' +

                    // 分割线
                    '<div class="report-divider"></div>' +

                    // 鼓励反馈
                    '<div class="report-section">' +
                        '<div class="report-section-title">💪 鼓励反馈</div>' +
                        '<div class="report-encouragement">' +
                            report.encouragement +
                        '</div>' +
                    '</div>' +

                    // 分割线
                    '<div class="report-divider"></div>' +

                    // 训练建议
                    '<div class="report-section">' +
                        '<div class="report-section-title">💡 训练建议</div>' +
                        '<div class="report-suggestion">' +
                            report.suggestion +
                        '</div>' +
                    '</div>' +

                    // 按钮
                    '<div class="report-actions">' +
                        '<button class="report-btn report-btn-primary" onclick="ReportModal.restart()">🔄 重新开始</button>' +
                        '<button class="report-btn report-btn-secondary" onclick="ReportModal.close()">✕ 关闭</button>' +
                    '</div>' +

                '</div>' +
            '</div>';

        // 插入到 body
        document.body.insertAdjacentHTML('beforeend', html);

        // 入场动画
        const overlay = document.getElementById('report-overlay');
        requestAnimationFrame(() => {
            overlay.classList.add('report-overlay-show');
        });
    },

    /**
     * 关闭弹窗并重新开始
     */
    restart() {
        this._remove();
        window.game.newGame();
    },

    /**
     * 关闭弹窗返回首页
     */
    close() {
        this._remove();
        if (typeof backToModeSelector === 'function') {
            backToModeSelector();
        }
    },

    /**
     * 移除弹窗DOM
     */
    _remove() {
        const overlay = document.getElementById('report-overlay');
        if (overlay) {
            overlay.classList.remove('report-overlay-show');
            setTimeout(() => overlay.remove(), 250);
        }
    }
};

if (typeof window !== 'undefined') {
    window.ReportModal = ReportModal;
}

if (typeof module !== 'undefined') {
    module.exports = { ReportModal };
}
