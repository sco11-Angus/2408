/**
 * @file aiService.js — MiniMax-M3 API 封装
 * @version 1.3.0
 *
 * 注：MiniMax API 已开放 CORS，可直接在浏览器调用。
 * 若遇到跨域问题，需在前端部署一个简单代理。
 */

const AI_BASE_URL = 'https://api.minimax.chat/v1';
const AI_MODEL    = 'MiniMax-M3';
const STORAGE_KEY = 'minimax_api_key_2048';

function getApiKey()      { return localStorage.getItem(STORAGE_KEY) || ''; }
function saveApiKey(key)  { localStorage.setItem(STORAGE_KEY, key.trim()); }
function clearApiKey()    { localStorage.removeItem(STORAGE_KEY); }

async function callMiniMax(systemPrompt, userPrompt, maxTokens = 200) {
    const key = getApiKey();
    if (!key) throw new Error('NO_KEY');

    const messages = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
        : [{ role: 'user', content: userPrompt }];

    const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({ model: AI_MODEL, messages, max_tokens: maxTokens })
    });

    if (!res.ok) throw new Error(`API_ERROR:${res.status}`);

    const data = await res.json();
    const raw = data.choices[0].message.content || '';
    // MiniMax-M3 是推理模型，剥离 <think> 思考链，只保留正文
    const withoutThink = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    if (withoutThink) return withoutThink;
    // 若 token 不足导致正文为空，从 think 块的草稿段提取
    const draftMatch = raw.match(/[Dd]raft[:：]\s*([\s\S]+?)(?:<\/think>|$)/);
    if (draftMatch) return draftMatch[1].trim();
    return withoutThink;
}

function buildCoachMessages({ board, score, maxTile, moveCount, boardSize }) {
    const boardText = board.map(row => row.join(' ')).join('\n');
    const system = '你是2048游戏策略教练，只输出中文策略建议，不重复用户提供的数据，不解释格式，直接给出结论。';
    const user = `棋盘（${boardSize}×${boardSize}，0为空）：\n${boardText}\n分数：${score} | 最大：${maxTile} | 步数：${moveCount}\n\n输出格式（严格按此，不加标题）：\n局面：[1句评价]\n建议：[方向] — [理由，1句]\n战略：[中期提示，1句]`;
    return { system, user };
}

function buildReportMessages({ mode, duration, moveCount, score, maxTile, boardSize, isWin }) {
    const dur = duration >= 60 ? `${Math.floor(duration / 60)}分${duration % 60}秒` : `${duration}秒`;
    const system = '你是认知训练分析师，直接输出报告正文，不重复数据标签，不加标题，不说"以下是"之类的引导语，语气积极温暖。';
    const user = `用户完成一局2048：模式${mode}，${dur}，${moveCount}步，得分${score}，最大数字${maxTile}，${boardSize}×${boardSize}棋盘，${isWin ? '获胜' : '未获胜'}。\n\n请连续输出三段（每段一行）：\n第一行：表现总结（结合数据，2句）\n第二行：鼓励反馈（1句，有温度）\n第三行：训练建议（1~2句，具体可执行）\n总字数不超过100字。`;
    return { system, user };
}

async function getCoachHint(gameState) {
    const { system, user } = buildCoachMessages(gameState);
    return callMiniMax(system, user, 1200);
}

async function generateAIReport(stats) {
    const { system, user } = buildReportMessages(stats);
    return callMiniMax(system, user, 1500);
}

window.aiService = { getApiKey, saveApiKey, clearApiKey, getCoachHint, generateAIReport };
