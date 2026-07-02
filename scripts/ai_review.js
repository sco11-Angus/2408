#!/usr/bin/env node
/**
 * @file ai_review.js — AI 代码审查脚本
 *
 * 默认生成本地启发式 Review 报告；配置 AI_API_KEY 后可调用 OpenAI 兼容接口。
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT, 'reports');
const REPORT_FILE = path.join(REPORT_DIR, 'ai_review.md');

function run(command) {
    try {
        return execSync(command, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch (_) {
        return '';
    }
}

function readText(file) {
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function collectChangedContent() {
    const baseRef = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'HEAD~1';
    const diff = run(`git diff --unified=80 ${baseRef}...HEAD`) || run('git diff --unified=80 HEAD');
    if (diff) return diff.slice(0, 60000);

    return [
        'src/game.js',
        'src/render.js',
        'src/input.js',
        'test/game.test.js'
    ].map(file => `\n## ${file}\n\n${readText(path.join(ROOT, file))}`).join('\n').slice(0, 60000);
}

function heuristicReview(content) {
    const findings = [];

    if (content.includes('innerHTML')) {
        findings.push({
            level: 'Medium',
            title: '渲染层使用 innerHTML',
            advice: 'showMessage 当前拼接 HTML，若未来消息来自用户输入，需要改为 textContent 或对内容做转义。'
        });
    }

    if (content.includes('Math.random')) {
        findings.push({
            level: 'Low',
            title: '随机逻辑需要确定性测试',
            advice: 'spawnTile 使用随机位置和值，建议在测试中通过棋盘计数、边界满盘等方式验证行为，避免依赖固定随机结果。'
        });
    }

    if (!content.includes('checkLose') || !content.includes('checkWin')) {
        findings.push({
            level: 'Medium',
            title: '胜负边界测试不足',
            advice: '应覆盖满盘不可合并、满盘但可合并、到达 2048 和未到达 2048 等情况。'
        });
    }

    const qualityConfig = [
        readText(path.join(ROOT, 'package.json')),
        readText(path.join(ROOT, '.github', 'workflows', 'quality.yml')),
        content
    ].join('\n');

    if (!qualityConfig.includes('coverage') && !qualityConfig.includes('nyc')) {
        findings.push({
            level: 'Medium',
            title: '缺少覆盖率质量门禁',
            advice: '建议在 CI 中配置测试覆盖率阈值，例如行覆盖率不低于 70%。'
        });
    }

    if (findings.length === 0) {
        findings.push({
            level: 'Info',
            title: '未发现明显阻断问题',
            advice: '当前变更具备基础测试与质量门禁，可继续通过社区反馈补充更多场景。'
        });
    }

    return `# AI Code Review Report\n\n` +
        `> 模式：本地启发式审查（未配置 AI_API_KEY 时自动启用）\n\n` +
        `## 总体评价\n\n项目已具备模块化游戏逻辑和自动化测试基础，建议继续围绕边界输入、DOM 安全和 CI 覆盖率门禁增强质量保障。\n\n` +
        `## 发现的问题与建议\n\n` +
        findings.map((item, index) => `### ${index + 1}. ${item.title}\n\n- 严重级别：${item.level}\n- 建议：${item.advice}\n`).join('\n') +
        `\n## 建议补充的测试\n\n` +
        `- 四个相同数字成对合并：\`[2,2,2,2] -> [4,4,0,0]\`\n` +
        `- 满盘但存在相邻可合并方块时不应失败\n` +
        `- 3×3 / 5×5 棋盘初始化后尺寸和初始方块数量正确\n` +
        `- 撤销后棋盘恢复到移动前快照\n` +
        `- 无空格时 \`spawnTile()\` 返回 \`false\`\n`;
}

async function aiReview(content) {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey || typeof fetch !== 'function') return heuristicReview(content);

    const apiUrl = process.env.AI_API_BASE_URL || 'https://api.openai.com/v1/chat/completions';
    const model = process.env.AI_MODEL || 'gpt-4o-mini';
    const prompt = `你是严格的软件质量审查员。请审查以下 2048 Web 游戏代码变更，重点关注：潜在 Bug、安全风险、重复逻辑、复杂度、边界条件、测试缺失。请用 Markdown 输出：总体评价、主要问题、严重程度、修改建议、建议补充的测试用例。\n\n${content}`;

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
        return data.choices?.[0]?.message?.content || heuristicReview(content);
    } catch (error) {
        return heuristicReview(content) + `\n\n> AI 接口调用失败，已回退到本地审查：${error.message}\n`;
    }
}

(async function main() {
    const content = collectChangedContent();
    const report = await aiReview(content);
    fs.mkdirSync(REPORT_DIR, { recursive: true });
    fs.writeFileSync(REPORT_FILE, report.endsWith('\n') ? report : `${report}\n`);
    console.log(`AI review report generated: ${path.relative(ROOT, REPORT_FILE)}`);
})();
