/**
 * @file coach.js — 智能教练模块
 * @version 1.3.0
 */

const COACH_MAX = 5;
let coachUsed = 0;

function resetCoach() {
    coachUsed = 0;
    _updateBtn();
    const zone = document.getElementById('coach-hint');
    if (zone) { zone.classList.remove('active'); zone.innerHTML = ''; }
}

function _updateBtn() {
    const btn = document.getElementById('coach-btn');
    if (!btn) return;
    const left = COACH_MAX - coachUsed;
    if (left <= 0) {
        btn.textContent = '💡 提示（已用完）';
        btn.disabled = true;
    } else {
        btn.textContent = `💡 教练提示（${left}次）`;
        btn.disabled = false;
    }
}

async function requestHint() {
    if (coachUsed >= COACH_MAX) return;

    if (!window.aiService.getApiKey()) {
        window.showApiKeyModal(requestHint);
        return;
    }

    const btn  = document.getElementById('coach-btn');
    const zone = document.getElementById('coach-hint');
    btn.disabled = true;
    btn.textContent = '💡 分析中…';
    zone.className = 'coach-hint active';
    zone.innerHTML = '<span class="hint-loading"><div class="loading-dots"><span></span><span></span><span></span></div>AI 正在分析棋盘…</span>';

    try {
        const hint = await window.aiService.getCoachHint({
            board:     window.game.board,
            score:     window.game.getScore(),
            maxTile:   window.game.getMaxTile(),
            moveCount: window.gameStats.moveCount,
            boardSize: window.game.getBoardSize()
        });
        coachUsed++;
        zone.innerHTML = `<div class="hint-body"><span class="ai-badge">🤖 教练</span><p>${hint.replace(/\n/g, '<br>')}</p></div>`;

        clearTimeout(window._hintTimer);
        window._hintTimer = setTimeout(() => zone.classList.remove('active'), 15000);
    } catch (e) {
        zone.innerHTML = '<span class="hint-error">获取失败，请检查网络或 Key。</span>';
    }

    _updateBtn();
}

window.coach = { resetCoach, requestHint };
