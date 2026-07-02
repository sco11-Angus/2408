/**
 * @file aiService.js — MiniMax-M3 API 封装
 * @description V1.3 AI 功能：智能教练 + AI 训练报告
 * @version 1.3.0
 *
 * MiniMax-M3 是推理模型，响应包含 <think>...</think> 思考链 + 正文。
 * 代码自动剥离 think 块；若 token 不足导致正文为空，从 think 块草稿段提取。
 */

const AIService = {
    BASE_URL:    'https://api.minimax.chat/v1',
    MODEL:       'MiniMax-M3',
    STORAGE_KEY: 'minimax_api_key_2048',
    // 内置默认 Key，用户无需配置即可使用 AI 功能
    DEFAULT_KEY: 'sk-api-lO-NmM0udvDgxrP-t2q3iQX4RdBD4CmfHNxaEVHddTgSWKhuHtyNW3jX4dFYdIoqHzMWgiAZ7XhaH_PpH7gYLEMAaqr1JJfdON_RvkOXZV2JdFniI2hpjho',

    // localStorage 中的 Key 优先；无则使用内置默认 Key
    getApiKey()     { return localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_KEY; },
    saveApiKey(key) { localStorage.setItem(this.STORAGE_KEY, key.trim()); },
    clearApiKey()   { localStorage.removeItem(this.STORAGE_KEY); },

    /** 调用 MiniMax Chat Completions API */
    async call(systemPrompt, userPrompt, maxTokens = 1500) {
        const key = this.getApiKey();
        if (!key) throw new Error('NO_KEY');

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userPrompt   }
        ];

        const res = await fetch(`${this.BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({ model: this.MODEL, messages, max_tokens: maxTokens })
        });

        if (!res.ok) throw new Error(`API_ERROR:${res.status}`);

        const data = await res.json();
        return this._extractContent(data.choices[0].message.content || '');
    },

    /** 剥离 <think> 思考链，返回正文；正文为空时从 think 草稿段提取 */
    _extractContent(raw) {
        const body = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        if (body) return body;
        // token 不足时正文为空，从 think 块 Draft 段提取
        const m = raw.match(/[Dd]raft[:：]\s*([\s\S]+?)(?:<\/think>|$)/);
        return m ? m[1].trim() : '';
    },

    /** 获取棋盘策略提示 */
    async getCoachHint({ board, score, maxTile, moveCount, boardSize }) {
        const boardText = board.map(row => row.join(' ')).join('\n');
        const system = '你是2048游戏策略教练，只输出中文策略建议，不重复用户数据，直接给结论。';
        const user   = `棋盘（${boardSize}×${boardSize}，0为空）：\n${boardText}\n分数：${score} | 最大：${maxTile} | 步数：${moveCount}\n\n输出格式（严格按此，不加任何标题前缀）：\n局面：[1句评价]\n建议：[方向] — [理由，1句]\n战略：[中期提示，1句]`;
        return this.call(system, user, 1200);
    },

    /** 生成 AI 训练报告 */
    async generateReport(stats) {
        const dur = GameStats.formatDuration(stats.duration);
        const modeName = { normal: '普通模式', adhd: 'ADHD专注模式', senior: '老年认知模式' }[stats.mode] || stats.mode;
        const system = '你是认知训练分析师，直接输出报告正文，不加标题，不重复数据标签，语气积极温暖。';
        const user   = `用户完成一局2048：${modeName}，用时${dur}，${stats.moveCount}步，得分${stats.score}，最大数字${stats.maxTile}。\n\n连续输出三行（每行一段，不加序号或标题）：\n第一行：表现总结（结合数据，2句）\n第二行：鼓励反馈（1句，有温度）\n第三行：训练建议（1~2句，具体可执行）\n总字数不超过100字。`;
        return this.call(system, user, 1500);
    }
};

if (typeof window !== 'undefined') window.AIService = AIService;
