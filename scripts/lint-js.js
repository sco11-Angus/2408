#!/usr/bin/env node
/**
 * 轻量级 JS 语法检查脚本。
 * 不引入复杂规则，只保证 CI 能发现明显语法错误。
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DIRS = ['src', 'test', 'scripts'];
let failed = false;

function walk(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(fullPath);
        return entry.name.endsWith('.js') ? [fullPath] : [];
    });
}

for (const dir of TARGET_DIRS) {
    for (const file of walk(path.join(ROOT, dir))) {
        const code = fs.readFileSync(file, 'utf8');
        try {
            new vm.Script(code, { filename: file });
            console.log(`✓ ${path.relative(ROOT, file)}`);
        } catch (error) {
            failed = true;
            console.error(`✗ ${path.relative(ROOT, file)}: ${error.message}`);
        }
    }
}

if (failed) process.exit(1);
