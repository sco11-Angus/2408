/**
 * @file reportModal.js — 训练报告弹窗
 * @version 1.3.0
 */

function formatDuration(seconds) {
    if (seconds < 60) return `${seconds} 秒`;
    return `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`;
}

function showReport(stats) {
    const existing = document.getElementById('report-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'report-modal';
    modal.className = 'report-overlay';

    modal.innerHTML = `
        <div class="report-card">
            <div class="report-header">训练报告</div>

            <div class="report-stats">
                <div class="stat-row"><span class="stat-label">训练模式</span><span class="stat-val">${stats.mode}</span></div>
                <div class="stat-row"><span class="stat-label">游戏时长</span><span class="stat-val">${formatDuration(stats.duration)}</span></div>
                <div class="stat-row"><span class="stat-label">操作步数</span><span class="stat-val">${stats.moveCount}</span></div>
                <div class="stat-row"><span class="stat-label">得分</span><span class="stat-val">${stats.score}</span></div>
                <div class="stat-row"><span class="stat-label">最大数字</span><span class="stat-val">${stats.maxTile}</span></div>
            </div>

            <div class="report-divider"></div>

            <div class="report-analysis">
                <div class="analysis-label"><span class="ai-badge">🤖 AI 分析</span></div>
                <div id="analysis-content" class="analysis-loading">
                    <div class="loading-dots"><span></span><span></span><span></span></div>
                    <span>AI 正在分析中…</span>
                </div>
            </div>

            <div class="report-actions">
                <button class="btn" onclick="window.game.newGame(); document.getElementById('report-modal').remove();">🔄 再来一局</button>
                <button class="btn btn-undo" onclick="document.getElementById('report-modal').remove();">关闭</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    loadAIAnalysis(stats);
}

async function loadAIAnalysis(stats) {
    const el = () => document.getElementById('analysis-content');
    if (!el()) return;

    try {
        const key = window.aiService.getApiKey();
        if (!key) { showFallback(stats, 'no_key'); return; }

        const text = await window.aiService.generateAIReport(stats);
        if (!el()) return;
        el().className = 'analysis-ai';
        el().innerHTML = text.replace(/\n/g, '<br>');

    } catch (e) {
        if (!el()) return;
        showFallback(stats, e.message === 'NO_KEY' ? 'no_key' : 'error');
    }
}

function showFallback(stats, reason) {
    const el = document.getElementById('analysis-content');
    if (!el) return;

    const r = window.generateRulesReport(stats);
    const noteHtml = reason === 'no_key'
        ? `<span class="analysis-note">未设置 API Key，显示基础报告。<a href="#" onclick="event.preventDefault();window.showApiKeyModal()">立即设置</a></span>`
        : `<span class="analysis-note">AI 服务暂时不可用，显示基础报告。</span>`;

    el.className = 'analysis-fallback';
    el.innerHTML = `${noteHtml}<p>${r.summary}</p><p class="encourage">${r.encouragement}</p><p>${r.suggestion}</p>`;
}

window.showReport = showReport;
