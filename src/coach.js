/**
 * @file coach.js — 智能教练模块
 * @description 每局最多 5 次 AI 策略提示，棋盘下方展示
 * @version 1.3.1
 */

const Coach = {
    MAX_HINTS: 5,
    used: 0,

    _show(zone) { zone.style.display = 'block'; },
    _hide(zone) { zone.style.display = 'none';  },

    /** 新局重置计数与提示区 */
    reset() {
        this.used = 0;
        this._updateBtn();
        const zone = document.getElementById('coach-hint');
        if (zone) { this._hide(zone); zone.innerHTML = ''; }
    },

    /** 请求一次教练提示 */
    async requestHint() {
        if (this.used >= this.MAX_HINTS) return;

        if (!AIService.getApiKey()) {
            ApiKeyModal.show(() => this.requestHint());
            return;
        }

        const btn  = document.getElementById('coach-btn');
        const zone = document.getElementById('coach-hint');
        btn.disabled = true;
        btn.textContent = '💡 分析中…';
        this._show(zone);
        zone.innerHTML = '<span class="coach-loading"><div class="loading-dots"><span></span><span></span><span></span></div>AI 正在分析棋盘…</span>';

        try {
            const hint = await AIService.getCoachHint({
                board:     window.game.board,
                score:     window.game.getScore(),
                maxTile:   window.game.getMaxTile(),
                moveCount: GameStats.moveCount,
                boardSize: window.game.getBoardSize()
            });
            this.used++;
            zone.innerHTML = `<div class="coach-body"><span class="ai-badge">🤖 教练</span><p>${hint.replace(/\n/g, '<br>')}</p></div>`;
            clearTimeout(this._timer);
            this._timer = setTimeout(() => this._hide(zone), 15000);
        } catch (e) {
            zone.innerHTML = '<span class="coach-error">提示获取失败，请检查网络或 API Key。</span>';
        }

        this._updateBtn();
    },

    _updateBtn() {
        const btn = document.getElementById('coach-btn');
        if (!btn) return;
        const left = this.MAX_HINTS - this.used;
        btn.textContent = left > 0 ? `💡 教练提示（${left}次）` : '💡 提示（已用完）';
        btn.disabled = left <= 0;
    }
};

if (typeof window !== 'undefined') window.Coach = Coach;
