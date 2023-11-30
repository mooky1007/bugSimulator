import { Ant, Bug, Food, HunterBug, Rock, Scolpion, Tree } from './Objects.mjs';

class Board {
    constructor(
        config = {
            boardX: 10,
            boardY: 10,
        }
    ) {
        this.boardX = config.boardX;
        this.boardY = config.boardY;
        this.isObstacle = config.isObstacle;
        this.el = document.querySelector(config.wrapperClassNams);
        this.tiles = [];
        this.bug = 0;
        this.food = 0;

        this.init();
        this.create();
        this.render();
    }

    init() {
        for (let x = 0; x < this.boardX; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < this.boardY; y++) {
                this.tiles[x][y] = new Tile(x, y);
            }
        }

        setInterval(() => {
            this.render();
        }, 100);
    }

    create() {
        this.el.innerHTML = '';
        for (let y = 0; y < this.boardY; y++) {
            const row = document.createElement('div');
            row.classList.add('row');

            for (let x = 0; x < this.boardX; x++) {
                let tile = document.createElement('div');
                tile.classList.add('tile');
                this.tiles[x][y].el = tile;
                row.appendChild(tile);
            }

            this.el.appendChild(row);
        }
    }

    getPowerfulObject(type) {
        let powerfulObject = null;
        this.tiles.forEach((row) => {
            row.forEach((tile) => {
                if (tile.content && tile.content.type === type) {
                    if (!powerfulObject || powerfulObject.power < tile.content.power) {
                        powerfulObject = tile.content;
                    }
                }
            });
        });
        return powerfulObject;
    }

    render() {
        this.tiles.forEach((row) => {
            row.forEach((tile) => {
                tile.el.innerHTML = '';
                if (tile.content) {
                    tile.el.innerHTML = `
                        <span
                            class="${tile.content.className || ''}"
                            style="
                            font-size: ${tile.content.size}px;
                        " id="${tile.content.name || ''}">
                            ${tile.content.icon}
                            ${
                                tile.content.type !== 'food'
                                    ? `<span
                                style="color: ${tile.content.color || '#fff'}; display: none;"
                            >${tile.content.energy}${tile.content.gen ? '/' + tile.content.gen : ''}</span>`
                                    : ''
                            }
                        </span>
                    `;
                }
            });
        });

        document.querySelector('.food-count').innerHTML = this.getObjCount('food');
        document.querySelector('.bug-count').innerHTML = this.getObjCount('bug');
        document.querySelector('.hunter-count').innerHTML = this.getObjCount('hunter');
        document.querySelector('.tree-count').innerHTML = this.getObjCount('tree');
    }

    getTile(x, y) {
        if (x < 0 || y < 0 || x >= this.boardX || y >= this.boardY) return null;
        return this.tiles[x][y];
    }

    getObjCount(type) {
        let count = 0;
        this.tiles.forEach((row) => {
            row.forEach((tile) => {
                if (tile.content && tile.content.type === type) {
                    count++;
                }
            });
        });
        return count;
    }

    createBug(x, y) {
        this.getTile(x, y).content = new Bug({
            map: this,
            position: { x: x, y: y },
            name: `bug_${this.bug}`,
            size: 9,
            icon: '🐛',
        });

        this.bug++;

        return this.getTile(x, y).content;
    }

    createHunter(x, y) {
        this.getTile(x, y).content = new HunterBug({
            map: this,
            position: { x: x, y: y },
            name: `hunter_${this.bug}`,
            size: 12,
            icon: '🕷',
        });

        this.bug++;

        return this.getTile(x, y).content;
    }

    createFood(x, y) {
        this.getTile(x, y).content = new Food({
            map: this,
            position: { x: x, y: y },
            name: `food_${this.bug}`,
            size: 8,
            icon: '🍎',
        });

        this.food++;
    }

    createTree(x, y) {
        this.getTile(x, y).content = new Tree({
            map: this,
            position: { x: x, y: y },
            name: `tree_${this.bug}`,
        });
    }

    createRock(x, y) {
        this.getTile(x, y).content = new Rock({
            map: this,
            position: { x: x, y: y },
            name: `rock_${this.bug}`,
        });
    }

    createAnt(x, y) {
        this.getTile(x, y).content = new Ant({
            map: this,
            position: { x: x, y: y },
            name: `ant_${this.bug}`,
            size: 8,
            icon: '🐜',
        });
    }

    createScolpion(x, y) {
        this.getTile(x, y).content = new Scolpion({
            map: this,
            position: { x: x, y: y },
            name: `scolpion_${this.bug}`,
            size: 8,
            icon: '🦂',
        });
    }

    generateObject(object, count = 1) {
        while (count > 0) {
            const x = Math.floor(Math.random() * this.boardX);
            const y = Math.floor(Math.random() * this.boardY);

            if (this.getTile(x, y).content) continue;

            count--;

            if (object === 'food') this.createFood(x, y);
            if (object === 'bug') this.createBug(x, y);
            if (object === 'hunter') this.createHunter(x, y);
            if (object === 'tree') this.createTree(x, y);
            if (object === 'rock') this.createRock(x, y);
            if (object === 'ant') this.createAnt(x, y);
            if (object === 'scolpion') this.createScolpion(x, y);
        }
    }
}

class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.content = null;
    }
}

export default Board;
