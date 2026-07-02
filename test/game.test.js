/**
 * @file game.test.js — 2048 游戏核心逻辑测试
 *
 * 运行方式：
 *   npm install
 *   npm test
 */

// ============ 模拟浏览器环境 ============
const { JSDOM } = require('jsdom');
const { expect } = require('chai');

const dom = new JSDOM(`<!DOCTYPE html>
<html><body>
    <div id="score">0</div>
    <div class="score-box"><div id="best">0</div></div>
    <div id="board"><div id="message"></div></div>
    <button id="size-3" class="size-btn"></button>
    <button id="size-4" class="size-btn active"></button>
    <button id="size-5" class="size-btn"></button>
</body></html>`, { url: 'http://localhost' });

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.setTimeout = (fn) => fn();
global.renderBoard = function () {};
global.hideMessage = function () {};
global.showMessage = function (msg, isWin = false) {
    const el = document.getElementById('message');
    el.innerHTML = msg;
    el.className = isWin ? 'message show win' : 'message show lose';
};

require('../src/game.js');
const game = window.game;

function setBoard(matrix) {
    game.board.splice(0, game.board.length, ...matrix.map(row => [...row]));
}

function countNonZeroCells() {
    return game.board.flat().filter(v => v !== 0).length;
}

describe('2048 游戏核心逻辑', function () {

    beforeEach(function () {
        localStorage.clear();
        document.getElementById('best').textContent = '0';
        game.initBoard(4);
    });

    describe('initBoard()', function () {
        it('应创建4x4棋盘', function () {
            expect(game.board).to.have.lengthOf(4);
            game.board.forEach(row => expect(row).to.have.lengthOf(4));
        });

        it('初始应有恰好2个非零方块', function () {
            expect(countNonZeroCells()).to.equal(2);
        });

        it('初始分数应为0', function () {
            expect(game.getScore()).to.equal(0);
        });
    });

    describe('slideRow()', function () {
        it('应合并相同相邻数字', function () {
            expect(game.slideRow([2, 2, 0, 0])).to.deep.equal([4, 0, 0, 0]);
        });

        it('应忽略被合并过的数字', function () {
            expect(game.slideRow([2, 2, 2, 0])).to.deep.equal([4, 2, 0, 0]);
        });

        it('应正确滑动非相邻数字', function () {
            expect(game.slideRow([0, 2, 0, 2])).to.deep.equal([4, 0, 0, 0]);
        });

        it('一行四个相同数字时应成对合并', function () {
            expect(game.slideRow([2, 2, 2, 2])).to.deep.equal([4, 4, 0, 0]);
        });

        it('全零行应保持不变', function () {
            expect(game.slideRow([0, 0, 0, 0])).to.deep.equal([0, 0, 0, 0]);
        });
    });

    describe('moveLeft()', function () {
        it('应正确左移并返回true', function () {
            setBoard([
                [0, 0, 2, 2],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]);

            expect(game.moveLeft()).to.be.true;
            expect(game.board[0]).to.deep.equal([4, 0, 0, 0]);
        });

        it('无法左移时应返回false', function () {
            setBoard([
                [2, 4, 8, 16],
                [4, 8, 16, 32],
                [8, 16, 32, 64],
                [16, 32, 64, 128]
            ]);

            expect(game.moveLeft()).to.be.false;
        });
    });

    describe('moveRight()', function () {
        it('应正确右移并合并', function () {
            setBoard([
                [2, 2, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]);

            expect(game.moveRight()).to.be.true;
            expect(game.board[0]).to.deep.equal([0, 0, 0, 4]);
        });
    });

    describe('moveUp() / moveDown()', function () {
        it('应正确上移并合并列', function () {
            setBoard([
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]);

            expect(game.moveUp()).to.be.true;
            expect(game.board.map(row => row[1])).to.deep.equal([4, 0, 0, 0]);
        });

        it('应正确下移并合并列', function () {
            setBoard([
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0]
            ]);

            expect(game.moveDown()).to.be.true;
            expect(game.board.map(row => row[1])).to.deep.equal([0, 0, 0, 4]);
        });
    });

    describe('checkWin()', function () {
        it('到达2048应判定胜利', function () {
            game.board[0][0] = 2048;
            expect(game.checkWin()).to.be.true;
        });

        it('没有2048不应判定胜利', function () {
            expect(game.checkWin()).to.be.false;
        });
    });

    describe('checkLose()', function () {
        it('有空格不应判定失败', function () {
            expect(game.checkLose()).to.be.false;
        });

        it('满盘且无法合并应判定失败', function () {
            setBoard([
                [2, 4, 8, 16],
                [4, 8, 16, 32],
                [8, 16, 32, 64],
                [16, 32, 64, 128]
            ]);

            expect(game.checkLose()).to.be.true;
        });

        it('满盘但存在相邻可合并方块时不应失败', function () {
            setBoard([
                [2, 2, 8, 16],
                [4, 8, 16, 32],
                [8, 16, 32, 64],
                [16, 32, 64, 128]
            ]);

            expect(game.checkLose()).to.be.false;
        });
    });

    describe('spawnTile()', function () {
        it('有空格时应生成方块', function () {
            const before = countNonZeroCells();
            expect(game.spawnTile()).to.be.true;
            expect(countNonZeroCells()).to.equal(before + 1);
        });

        it('无空格时应返回false', function () {
            setBoard([
                [2, 4, 8, 16],
                [4, 8, 16, 32],
                [8, 16, 32, 64],
                [16, 32, 64, 128]
            ]);

            expect(game.spawnTile()).to.be.false;
        });
    });

    describe('undoMove()', function () {
        it('有快照时应成功撤销', function () {
            setBoard([
                [0, 0, 2, 2],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]);
            const oldBoard = game.board.map(r => [...r]);

            game.doMove('left');
            expect(game.undoMove()).to.be.true;
            expect(game.board).to.deep.equal(oldBoard);
        });

        it('无快照时应返回false', function () {
            expect(game.undoMove()).to.be.false;
        });
    });

    describe('setBoardSize()', function () {
        it('3x3棋盘应正确创建', function () {
            game.setBoardSize(3);
            expect(game.getBoardSize()).to.equal(3);
            expect(game.board).to.have.lengthOf(3);
            game.board.forEach(row => expect(row).to.have.lengthOf(3));
        });

        it('5x5棋盘应正确创建', function () {
            game.setBoardSize(5);
            expect(game.getBoardSize()).to.equal(5);
            expect(game.board).to.have.lengthOf(5);
            game.board.forEach(row => expect(row).to.have.lengthOf(5));
        });
    });

});
