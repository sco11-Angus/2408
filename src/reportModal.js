/**
 * @file reportModal.js — 训练报告弹窗模块
 * @description 渲染和显示训练报告弹窗，与 game/render 模块解耦
 * @version 1.3.0
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

                    // 分割线
                    '<div class="report-divider"></div>' +

                    // AI 分析（V1.3 新增）
                    '<div class="report-section">' +
                        '<div class="report-section-title"><span class="ai-badge">🤖 AI 分析</span></div>' +
                        '<div id="ai-analysis-content" class="ai-analysis-loading">' +
                            '<div class="loading-dots"><span></span><span></span><span></span></div>' +
                            '<span>AI 正在分析中…</span>' +
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

        // 异步加载 AI 分析
        this._loadAIAnalysis(stats);
    },

    /** 异步调用 AI 并填充分析内容 */
    async _loadAIAnalysis(stats) {
        const el = () => document.getElementById('ai-analysis-content');
        if (!el()) return;

        try {
            if (!AIService.getApiKey()) {
                this._showFallback('no_key', stats);
                return;
            }
            const text = await AIService.generateReport(stats);
            if (!el()) return;
            el().className = 'ai-analysis-result';
            el().innerHTML = text.replace(/\n/g, '<br>');
        } catch (e) {
            if (!el()) return;
            this._showFallback(e.message === 'NO_KEY' ? 'no_key' : 'error', stats);
        }
    },

    _showFallback(reason, stats) {
        const el = document.getElementById('ai-analysis-content');
        if (!el) return;
        const note = reason === 'no_key'
            ? `<span class="ai-fallback-note">未设置 API Key，显示基础报告。<a href="#" onclick="event.preventDefault();ApiKeyModal.show()">立即设置</a></span>`
            : `<span class="ai-fallback-note">AI 服务暂时不可用，显示基础报告。</span>`;
        const r = window.ReportGenerator.generate(stats);
        el.className = 'ai-analysis-fallback';
        el.innerHTML = note + '<p>' + r.summary.join('') + '</p><p class="ai-encourage">' + r.encouragement + '</p><p>' + r.suggestion + '</p>';
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
