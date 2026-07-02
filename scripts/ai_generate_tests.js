#!/usr/bin/env node
/**
 * @file ai_generate_tests.js — AI 辅助生成边界测试建议
 *
 * 生成 Markdown 测试建议，人工确认后再合入正式测试。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'tests', 'ai_generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'boundary_test_suggestions.md');
const SOURCE_FILE = path.join(ROOT, 'src', 'game.js');

function localSuggestions() {
    return `# AI Generated Boundary Test Suggestions\n\n` +
        `> 说明：以下用例由 AI 测试生成流程产出，进入正式测试前需要人工确认。\n\n` +
        `## slideRow(row)\n\n` +
        `| 场景 | 输入 | 期望 |\n` +
        `|---|---|---|\n` +
        `| 相邻合并 | \`[2,2,0,0]\` | \`[4,0,0,0]\` |\n` +
        `| 隔空合并 | \`[0,2,0,2]\` | \`[4,0,0,0]\` |\n` +
        `| 连续三个相同值 | \`[2,2,2,0]\` | \`[4,2,0,0]\` |\n` +
        `| 四个相同值 | \`[2,2,2,2]\` | \`[4,4,0,0]\` |\n` +
        `| 全零边界 | \`[0,0,0,0]\` | \`[0,0,0,0]\` |\n\n` +
        `## checkLose()\n\n` +
        `- 满盘且横向、纵向都不能合并：返回 \`true\`。\n` +
        `- 满盘但存在横向相邻相同方块：返回 \`false\`。\n` +
        `- 满盘但存在纵向相邻相同方块：返回 \`false\`。\n` +
        `- 仍存在空格：返回 \`false\`。\n\n` +
        `## spawnTile()\n\n` +
        `- 棋盘存在空格：非零方块数量增加 1。\n` +
        `- 棋盘无空格：返回 \`false\` 且棋盘不变。\n\n` +
        `## undoMove()\n\n` +
        `- 有效移动后撤销：棋盘和分数恢复到移动前。\n` +
        `- 无快照时撤销：返回 \`false\`。\n\n` +
        `## 棋盘尺寸\n\n` +
        `- \`setBoardSize(3)\` 后棋盘为 3×3，初始非零方块为 2。\n` +
        `- \`setBoardSize(5)\` 后棋盘为 5×5，初始非零方块为 2。\n`;
}

async function aiSuggestions() {
    const apiKey = process.env.AI_API_KEY;
    const source = fs.readFileSync(SOURCE_FILE, 'utf8').slice(0, 50000);
    if (!apiKey || typeof fetch !== 'function') return localSuggestions();

    const apiUrl = process.env.AI_API_BASE_URL || 'https://api.openai.com/v1/chat/completions';
    const model = process.env.AI_MODEL || 'gpt-4o-mini';
    const prompt = `请为以下 2048 游戏核心逻辑生成边界测试建议。只输出 Markdown，按函数分组，包含输入、期望输出、为什么需要该用例。\n\n${source}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2
            })
        });

        if (!response.ok) throw new Error(`AI API returned ${response.status}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content || localSuggestions();
    } catch (error) {
        return localSuggestions() + `\n\n> AI 接口调用失败，已回退到本地测试建议：${error.message}\n`;
    }
}

(async function main() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const content = await aiSuggestions();
    fs.writeFileSync(OUTPUT_FILE, content.endsWith('\n') ? content : `${content}\n`);
    console.log(`AI generated test suggestions: ${path.relative(ROOT, OUTPUT_FILE)}`);
})();
