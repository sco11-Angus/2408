/**
 * @file apiKeyModal.js — API Key 设置弹窗
 * @version 1.3.0
 */

function showApiKeyModal(onSave) {
    const existing = document.getElementById('apikey-modal');
    if (existing) existing.remove();

    const hasKey = !!window.aiService.getApiKey();

    const modal = document.createElement('div');
    modal.id = 'apikey-modal';
    modal.className = 'report-overlay';
    modal.innerHTML = `
        <div class="report-card apikey-card">
            <div class="report-header">⚙ AI 设置</div>
            <p class="apikey-desc">输入 MiniMax API Key，启用智能教练和 AI 训练报告。<br>Key 仅存于本地浏览器，不会上传。</p>
            <input id="apikey-input" type="password" class="apikey-input" placeholder="sk-…" autocomplete="off" />
            <div class="report-actions">
                <button class="btn" onclick="window._saveKey()">保存</button>
                ${hasKey ? `<button class="btn btn-undo" onclick="window._clearKey()">清除 Key</button>` : ''}
                <button class="btn btn-undo" onclick="document.getElementById('apikey-modal').remove()">取消</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('apikey-input').focus();
    window._apiKeyCb = onSave || null;
}

window._saveKey = function () {
    const val = document.getElementById('apikey-input').value.trim();
    if (!val) return;
    window.aiService.saveApiKey(val);
    document.getElementById('apikey-modal').remove();
    if (typeof window._apiKeyCb === 'function') { window._apiKeyCb(); window._apiKeyCb = null; }
};

window._clearKey = function () {
    window.aiService.clearApiKey();
    document.getElementById('apikey-modal').remove();
};

window.showApiKeyModal = showApiKeyModal;
