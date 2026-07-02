/**
 * @file apiKeyModal.js — MiniMax API Key 设置弹窗
 * @version 1.3.0
 */

const ApiKeyModal = {

    /** 显示设置弹窗 */
    show(onSave) {
        const existing = document.getElementById('apikey-overlay');
        if (existing) existing.remove();

        const hasKey = !!AIService.getApiKey();
        const overlay = document.createElement('div');
        overlay.id = 'apikey-overlay';
        overlay.className = 'report-overlay report-overlay-show';
        overlay.innerHTML = `
            <div class="report-modal apikey-modal">
                <div class="report-header">
                    <div class="report-icon">⚙</div>
                    <div class="report-title">AI 设置</div>
                </div>
                <div class="report-divider"></div>
                <p class="apikey-desc">输入 MiniMax API Key，启用智能教练和 AI 训练报告。<br>Key 仅存于本地浏览器，不会上传。</p>
                <input id="apikey-input" type="password" class="apikey-input" placeholder="输入你的 MiniMax API Key" autocomplete="off" />
                <div class="report-actions">
                    <button class="report-btn report-btn-primary" onclick="ApiKeyModal._save()">保存</button>
                    ${hasKey ? '<button class="report-btn report-btn-secondary" onclick="ApiKeyModal._clear()">清除 Key</button>' : ''}
                    <button class="report-btn report-btn-secondary" onclick="ApiKeyModal._close()">取消</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        document.getElementById('apikey-input').focus();
        this._cb = onSave || null;
    },

    _save() {
        const val = document.getElementById('apikey-input')?.value.trim();
        if (!val) return;
        AIService.saveApiKey(val);
        this._close();
        if (typeof this._cb === 'function') { this._cb(); this._cb = null; }
    },

    _clear() {
        AIService.clearApiKey();
        this._close();
    },

    _close() {
        document.getElementById('apikey-overlay')?.remove();
    }
};

if (typeof window !== 'undefined') window.ApiKeyModal = ApiKeyModal;
