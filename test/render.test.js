/**
 * @file render.test.js — 2048 渲染模块测试
 */
const { JSDOM } = require('jsdom');
const { expect } = require('chai');

describe('2048 渲染模块', function () {
    let dom;
    let render;

    beforeEach(function () {
        dom = new JSDOM(`<!DOCTYPE html>
<html><body>
    <div id="board"><div id="message"></div></div>
</body></html>`, { url: 'http://localhost' });

        global.window = dom.window;
        global.document = dom.window.document;
        window.game = {
            getBoardSize: () => 4,
            board: [
                [2, 0, 4, 0],
                [0, 8, 0, 16],
                [32, 0, 64, 0],
                [0, 128, 0, 2048]
            ],
            newGame: () => {}
        };

        delete require.cache[require.resolve('../src/render.js')];
        render = require('../src/render.js');
    });

    it('renderBoard() 应按棋盘尺寸渲染格子', function () {
        render.renderBoard();

        const boardEl = document.getElementById('board');
        const cells = boardEl.querySelectorAll('.cell');
        expect(boardEl.style.gridTemplateColumns).to.equal('repeat(4, 1fr)');
        expect(cells).to.have.lengthOf(16);
        expect(cells[0].textContent).to.equal('2');
        expect(cells[15].textContent).to.equal('2048');
        expect(cells[15].style.fontSize).to.equal('24px');
    });

    it('showMessage() 应展示胜利消息', function () {
        render.showMessage('你赢了', true);

        const msgEl = document.getElementById('message');
        expect(msgEl.innerHTML).to.include('你赢了');
        expect(msgEl.className).to.equal('message show win');
    });

    it('showMessage() 应展示失败消息', function () {
        render.showMessage('游戏结束', false);

        const msgEl = document.getElementById('message');
        expect(msgEl.innerHTML).to.include('游戏结束');
        expect(msgEl.className).to.equal('message show lose');
    });

    it('hideMessage() 应隐藏消息', function () {
        const msgEl = document.getElementById('message');
        msgEl.className = 'message show win';

        render.hideMessage();

        expect(msgEl.className).to.equal('message');
    });
});
