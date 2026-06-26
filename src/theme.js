/**
 * @file theme.js — 深色/浅色模式切换
 * @author 成员A
 * @version 1.0.0
 *
 * 切换逻辑：
 * 1. 点击按钮 → 切换 data-theme 属性
 * 2. 偏好保存到 localStorage
 * 3. 页面加载时自动恢复
 */

(function () {
    'use strict';

    const THEME_KEY = '2048-theme-preference';
    const DARK = 'dark';
    const LIGHT = 'light';

    /**
     * 获取当前主题
     * @returns {'light'|'dark'}
     */
    function getCurrentTheme() {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === DARK || stored === LIGHT) {
            return stored;
        }
        // 首次访问：跟随系统偏好
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return DARK;
        }
        return LIGHT;
    }

    /**
     * 应用主题
     * @param {'light'|'dark'} theme
     */
    function applyTheme(theme) {
        if (theme === DARK) {
            document.documentElement.setAttribute('data-theme', DARK);
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem(THEME_KEY, theme);
    }

    /**
     * 切换主题
     */
    function toggleTheme() {
        const current = getCurrentTheme();
        const next = current === DARK ? LIGHT : DARK;
        applyTheme(next);
        updateToggleIcon(next);
    }

    /**
     * 更新按钮图标
     * @param {'light'|'dark'} theme
     */
    function updateToggleIcon(theme) {
        const btn = document.getElementById('theme-toggle-btn');
        if (!btn) return;
        btn.textContent = theme === DARK ? '\u2600' : '\u263D';  // ☀ / ☽
        btn.setAttribute('aria-label', theme === DARK ? '切换为浅色模式' : '切换为深色模式');
    }

    /**
     * 初始化：恢复偏好 + 绑定事件
     */
    function init() {
        const saved = getCurrentTheme();
        applyTheme(saved);
        updateToggleIcon(saved);

        // 绑定按钮
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.addEventListener('click', toggleTheme);
        }

        // 监听系统主题变化
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', function (e) {
                    // 仅在没有手动设置过时跟随系统
                    if (!localStorage.getItem(THEME_KEY)) {
                        applyTheme(e.matches ? DARK : LIGHT);
                        updateToggleIcon(e.matches ? DARK : LIGHT);
                    }
                });
        }

        console.log('[Theme] 已加载，当前主题：' + saved);
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露到全局，方便调试
    if (typeof window !== 'undefined') {
        window.toggleTheme = toggleTheme;
    }
})();
