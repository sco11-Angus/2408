/**
 * @file input.test.js — 2048 输入控制模块测试
 */
const { JSDOM } = require('jsdom');
const { expect } = require('chai');

describe('2048 输入控制模块', function () {
    let moves;
    let undoCount;
    let renderCount;

    beforeEach(function () {
        const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, { url: 'http://localhost' });
        global.window = dom.window;
        global.document = dom.window.document;
        moves = [];
        undoCount = 0;
        renderCount = 0;
        window.game = {
            doMove: dir => moves.push(dir),
            undoMove: () => { undoCount += 1; }
        };
        global.renderBoard = () => { renderCount += 1; };

        delete require.cache[require.resolve('../src/input.js')];
        require('../src/input.js');
    });

    function dispatchKey(key, ctrlKey = false) {
        const event = new window.KeyboardEvent('keydown', { key, ctrlKey, cancelable: true });
        document.dispatchEvent(event);
        return event;
    }

    function dispatchTouch(type, x, y) {
        const event = new window.Event(type, { bubbles: true, cancelable: true });
        const point = { clientX: x, clientY: y };
        Object.defineProperty(event, type === 'touchstart' ? 'touches' : 'changedTouches', {
            value: [point]
        });
        document.dispatchEvent(event);
    }

    it('方向键应映射为移动方向', function () {
        dispatchKey('ArrowLeft');
        dispatchKey('ArrowRight');
        dispatchKey('ArrowUp');
        dispatchKey('ArrowDown');

        expect(moves).to.deep.equal(['left', 'right', 'up', 'down']);
    });

    it('WASD 和 Vim 按键应映射为移动方向', function () {
        ['a', 'd', 'w', 's', 'h', 'l', 'k', 'j'].forEach(key => dispatchKey(key));

        expect(moves).to.deep.equal(['left', 'right', 'up', 'down', 'left', 'right', 'up', 'down']);
    });

    it('Ctrl+Z 应触发撤销并重新渲染', function () {
        dispatchKey('z', true);

        expect(undoCount).to.equal(1);
        expect(renderCount).to.equal(1);
    });

    it('短距离触摸不应移动', function () {
        dispatchTouch('touchstart', 100, 100);
        dispatchTouch('touchend', 110, 110);

        expect(moves).to.deep.equal([]);
    });

    it('水平滑动应触发左右移动', function () {
        dispatchTouch('touchstart', 100, 100);
        dispatchTouch('touchend', 160, 105);
        dispatchTouch('touchstart', 100, 100);
        dispatchTouch('touchend', 40, 105);

        expect(moves).to.deep.equal(['right', 'left']);
    });

    it('垂直滑动应触发上下移动', function () {
        dispatchTouch('touchstart', 100, 100);
        dispatchTouch('touchend', 105, 160);
        dispatchTouch('touchstart', 100, 100);
        dispatchTouch('touchend', 105, 40);

        expect(moves).to.deep.equal(['down', 'up']);
    });
});
