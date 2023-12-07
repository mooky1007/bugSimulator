import { Tree } from './objects/Tree.mjs';
import { Food } from './objects/Food.mjs';
import { Water } from './objects/Water.mjs';
import { Bug } from './objects/Bug.mjs';
import { HunterBug } from './objects/Hunter.mjs';
import { ChartContainer } from './UI/ChartContainer.mjs';

class Board {
    constructor(
        config = {
            boardX: 10,
            boardY: 10,
            screen: true,
            wrapperClassNams: '.board',
        }
    ) {
        this.boardX = config.boardX;
        this.boardY = config.boardY;
        this.isObstacle = config.isObstacle;
        this.el = document.querySelector(config.wrapperClassNams);
        this.exponentialPopulationGrowth = config.exponentialPopulationGrowth || false;
        this.tiles = [];
        this.bug = 0;
        this.hunter = 0;
        this.birth = {};

        this.dev = false;
        this.speed = this.dev ? 25 : 1;

        if (this.dev) {
            this.el.classList.add('dev');
        }

        this.object = {
            bug: {
                food: 0,
                species: 0,
                evasion: 0,
            },
            hunter: {
                food: 0,
                species: 0,
                evasion: 0,
            },
        };

        this.init();
        this.create();
    }

    init() {
        for (let x = 0; x < this.boardX; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < this.boardY; y++) {
                this.tiles[x][y] = new Tile(x, y);
            }
        }
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

    render() {
        this.tiles.forEach((row) => {
            row.forEach((tile) => {
                if (tile.content) {
                    tile.el.innerHTML = `
                        <span
                            class="${tile.content.className || ''}"
                            style="
                            font-size: ${tile.content.size}px;
                        " id="${tile.content.name || ''}">
                            ${tile.content.icon}
                        </span>
                    `;
                } else {
                    if (tile.el.innerHTML !== '') tile.el.innerHTML = '';
                }
            });
        });
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

    createBug(x, y, type) {
        this.getTile(x, y).content = new Bug({
            map: this,
            position: { x: x, y: y },
            name: `bug_${this.bug}`,
            type: type === 2 ? 'bug2' : 'bug',
            icon: type === 2 ? '🐞' : '🐛',
        });

        this.bug++;

        return this.getTile(x, y).content;
    }

    createHunter(x, y) {
        this.getTile(x, y).content = new HunterBug({
            map: this,
            position: { x: x, y: y },
            name: `hunter_${this.hunter}`,
        });

        this.hunter++;

        return this.getTile(x, y).content;
    }

    createFood(x, y) {
        const targetTile = this.getTile(x, y);
        targetTile.content = new Food({
            map: this,
            position: { x: x, y: y },
        });

        targetTile.el.innerHTML = `
            <span
                class="${targetTile.content.className || ''}"
                style="font-size: ${targetTile.content.size}px;">
                ${targetTile.content.icon}
            </span>
        `;
    }

    createTree(x, y) {
        const targetTile = this.getTile(x, y);

        targetTile.content = new Tree({
            map: this,
            position: { x: x, y: y },
        });

        targetTile.el.innerHTML = `
            <span
                class="${targetTile.content.className || ''}"
                style="font-size: ${targetTile.content.size}px;">
                ${targetTile.content.icon}
            </span>
        `;
    }

    createWater(x, y) {
        const targetTile = this.getTile(x, y);

        targetTile.content = new Water({
            map: this,
            position: { x: x, y: y },
        });

        targetTile.el.innerHTML = `
            <span class="${targetTile.content.className || ''}"></span>
        `;
    }

    generateObject(object, count = 1) {
        while (count > 0) {
            const x = Math.floor(Math.random() * this.boardX);
            const y = Math.floor(Math.random() * this.boardY);

            if (this.getTile(x, y).content) continue;

            count--;

            if (object === 'food') this.createFood(x, y);
            if (object === 'bug') this.createBug(x, y);
            if (object === 'bug2') this.createBug(x, y, 2);
            if (object === 'hunter') this.createHunter(x, y);
            if (object === 'tree') this.createTree(x, y);
        }
    }

    generateEnvironment() {
        this.createWater(99, 46);
        this.createWater(99, 47);
        this.createWater(99, 48);
        this.createWater(99, 49);
        this.createWater(99, 50);
        this.createWater(99, 51);
        this.createWater(99, 52);
        this.createWater(99, 53);
        this.createWater(99, 54);
        this.createWater(99, 55);
        this.createWater(99, 56);
        this.createWater(99, 57);
        this.createWater(99, 58);

        this.createWater(98, 47);
        this.createWater(98, 48);
        this.createWater(98, 49);
        this.createWater(98, 50);
        this.createWater(98, 51);
        this.createWater(98, 52);
        this.createWater(98, 53);
        this.createWater(98, 54);
        this.createWater(98, 55);
        this.createWater(98, 56);
        this.createWater(98, 57);

        this.createWater(97, 47);
        this.createWater(97, 48);
        this.createWater(97, 49);
        this.createWater(97, 50);
        this.createWater(97, 51);
        this.createWater(97, 52);
        this.createWater(97, 53);
        this.createWater(97, 54);
        this.createWater(97, 55);
        this.createWater(97, 56);
        this.createWater(97, 57);

        this.createWater(96, 47);
        this.createWater(96, 48);
        this.createWater(96, 49);
        this.createWater(96, 50);
        this.createWater(96, 51);
        this.createWater(96, 52);
        this.createWater(96, 53);
        this.createWater(96, 54);
        this.createWater(96, 55);
        this.createWater(96, 56);
        this.createWater(96, 57);

        this.createWater(95, 47);
        this.createWater(95, 48);
        this.createWater(95, 49);
        this.createWater(95, 50);
        this.createWater(95, 51);
        this.createWater(95, 52);
        this.createWater(95, 53);
        this.createWater(95, 54);
        this.createWater(95, 55);
        this.createWater(95, 56);
        this.createWater(95, 57);

        this.createWater(94, 47);
        this.createWater(94, 48);
        this.createWater(94, 49);
        this.createWater(94, 50);
        this.createWater(94, 51);
        this.createWater(94, 52);
        this.createWater(94, 53);
        this.createWater(94, 54);
        this.createWater(94, 55);
        this.createWater(94, 56);
        this.createWater(94, 57);

        this.createWater(93, 47);
        this.createWater(93, 48);
        this.createWater(93, 49);
        this.createWater(93, 50);
        this.createWater(93, 51);
        this.createWater(93, 52);
        this.createWater(93, 53);
        this.createWater(93, 54);
        this.createWater(93, 55);
        this.createWater(93, 56);

        this.createWater(92, 47);
        this.createWater(92, 48);
        this.createWater(92, 49);
        this.createWater(92, 50);
        this.createWater(92, 51);
        this.createWater(92, 52);
        this.createWater(92, 53);
        this.createWater(92, 54);
        this.createWater(92, 55);
        this.createWater(92, 56);

        this.createWater(91, 47);
        this.createWater(91, 48);
        this.createWater(91, 49);
        this.createWater(91, 50);
        this.createWater(91, 51);
        this.createWater(91, 52);
        this.createWater(91, 53);
        this.createWater(91, 54);
        this.createWater(91, 55);
        this.createWater(91, 56);

        this.createWater(90, 47);
        this.createWater(90, 48);
        this.createWater(90, 49);
        this.createWater(90, 50);
        this.createWater(90, 51);
        this.createWater(90, 52);
        this.createWater(90, 53);
        this.createWater(90, 54);
        this.createWater(90, 55);
        this.createWater(90, 56);

        this.createWater(89, 48);
        this.createWater(89, 49);
        this.createWater(89, 50);
        this.createWater(89, 51);
        this.createWater(89, 52);
        this.createWater(89, 53);
        this.createWater(89, 54);
        this.createWater(89, 55);
        this.createWater(89, 56);
        this.createWater(89, 57);

        this.createWater(88, 48);
        this.createWater(88, 49);
        this.createWater(88, 50);
        this.createWater(88, 51);
        this.createWater(88, 52);
        this.createWater(88, 53);
        this.createWater(88, 54);
        this.createWater(88, 55);
        this.createWater(88, 56);
        this.createWater(88, 57);

        this.createWater(87, 48);
        this.createWater(87, 49);
        this.createWater(87, 50);
        this.createWater(87, 51);
        this.createWater(87, 52);
        this.createWater(87, 53);
        this.createWater(87, 54);
        this.createWater(87, 55);
        this.createWater(87, 56);
        this.createWater(87, 57);

        this.createWater(86, 48);
        this.createWater(86, 49);
        this.createWater(86, 50);
        this.createWater(86, 51);
        this.createWater(86, 52);
        this.createWater(86, 53);
        this.createWater(86, 54);
        this.createWater(86, 55);
        this.createWater(86, 56);
        this.createWater(86, 57);

        this.createWater(85, 47);
        this.createWater(85, 48);
        this.createWater(85, 49);
        this.createWater(85, 50);
        this.createWater(85, 51);
        this.createWater(85, 52);
        this.createWater(85, 53);
        this.createWater(85, 54);
        this.createWater(85, 55);
        this.createWater(85, 56);

        this.createWater(84, 47);
        this.createWater(84, 48);
        this.createWater(84, 49);
        this.createWater(84, 50);
        this.createWater(84, 51);
        this.createWater(84, 52);
        this.createWater(84, 53);
        this.createWater(84, 54);
        this.createWater(84, 55);
        this.createWater(84, 56);

        this.createWater(83, 47);
        this.createWater(83, 48);
        this.createWater(83, 49);
        this.createWater(83, 50);
        this.createWater(83, 51);
        this.createWater(83, 52);
        this.createWater(83, 53);
        this.createWater(83, 54);
        this.createWater(83, 55);
        this.createWater(83, 56);

        this.createWater(82, 47);
        this.createWater(82, 48);
        this.createWater(82, 49);
        this.createWater(82, 50);
        this.createWater(82, 51);
        this.createWater(82, 52);
        this.createWater(82, 53);
        this.createWater(82, 54);
        this.createWater(82, 55);
        this.createWater(82, 56);

        this.createWater(81, 47);
        this.createWater(81, 48);
        this.createWater(81, 49);
        this.createWater(81, 50);
        this.createWater(81, 51);
        this.createWater(81, 52);
        this.createWater(81, 53);
        this.createWater(81, 54);
        this.createWater(81, 55);
        this.createWater(81, 56);

        this.createWater(80, 48);
        this.createWater(80, 49);
        this.createWater(80, 50);
        this.createWater(80, 51);
        this.createWater(80, 52);
        this.createWater(80, 53);
        this.createWater(80, 54);
        this.createWater(80, 55);
        this.createWater(80, 56);
        this.createWater(80, 57);

        this.createWater(79, 48);
        this.createWater(79, 49);
        this.createWater(79, 50);
        this.createWater(79, 51);
        this.createWater(79, 52);
        this.createWater(79, 53);
        this.createWater(79, 54);
        this.createWater(79, 55);
        this.createWater(79, 56);
        this.createWater(79, 57);

        this.createWater(78, 48);
        this.createWater(78, 49);
        this.createWater(78, 50);
        this.createWater(78, 51);
        this.createWater(78, 52);
        this.createWater(78, 53);
        this.createWater(78, 54);
        this.createWater(78, 55);
        this.createWater(78, 56);
        this.createWater(78, 57);
        this.createWater(78, 58);

        this.createWater(77, 48);
        this.createWater(77, 49);
        this.createWater(77, 50);
        this.createWater(77, 51);
        this.createWater(77, 52);
        this.createWater(77, 53);
        this.createWater(77, 54);
        this.createWater(77, 55);
        this.createWater(77, 56);
        this.createWater(77, 57);
        this.createWater(77, 58);

        this.createWater(76, 48);
        this.createWater(76, 49);
        this.createWater(76, 50);
        this.createWater(76, 51);
        this.createWater(76, 52);
        this.createWater(76, 53);
        this.createWater(76, 54);
        this.createWater(76, 55);
        this.createWater(76, 56);
        this.createWater(76, 57);
        this.createWater(76, 58);

        this.createWater(75, 48);
        this.createWater(75, 49);
        this.createWater(75, 50);
        this.createWater(75, 51);
        this.createWater(75, 52);
        this.createWater(75, 53);
        this.createWater(75, 54);
        this.createWater(75, 55);
        this.createWater(75, 56);
        this.createWater(75, 57);

        this.createWater(74, 48);
        this.createWater(74, 49);
        this.createWater(74, 50);
        this.createWater(74, 51);
        this.createWater(74, 52);
        this.createWater(74, 53);
        this.createWater(74, 54);
        this.createWater(74, 55);
        this.createWater(74, 56);
        this.createWater(74, 57);

        this.createWater(73, 47);
        this.createWater(73, 48);
        this.createWater(73, 49);
        this.createWater(73, 50);
        this.createWater(73, 51);
        this.createWater(73, 52);
        this.createWater(73, 53);
        this.createWater(73, 54);
        this.createWater(73, 55);
        this.createWater(73, 56);

        this.createWater(72, 47);
        this.createWater(72, 48);
        this.createWater(72, 49);
        this.createWater(72, 50);
        this.createWater(72, 51);
        this.createWater(72, 52);
        this.createWater(72, 53);
        this.createWater(72, 54);
        this.createWater(72, 55);
        this.createWater(72, 56);

        this.createWater(71, 47);
        this.createWater(71, 48);
        this.createWater(71, 49);
        this.createWater(71, 50);
        this.createWater(71, 51);
        this.createWater(71, 52);
        this.createWater(71, 53);
        this.createWater(71, 54);
        this.createWater(71, 55);
        this.createWater(71, 56);
        this.createWater(71, 57);

        this.createWater(70, 48);
        this.createWater(70, 49);
        this.createWater(70, 50);
        this.createWater(70, 51);
        this.createWater(70, 52);
        this.createWater(70, 53);
        this.createWater(70, 54);
        this.createWater(70, 55);
        this.createWater(70, 56);
        this.createWater(70, 57);

        this.createWater(69, 48);
        this.createWater(69, 49);
        this.createWater(69, 50);
        this.createWater(69, 51);
        this.createWater(69, 52);
        this.createWater(69, 53);
        this.createWater(69, 54);
        this.createWater(69, 55);
        this.createWater(69, 56);
        this.createWater(69, 57);

        this.createWater(68, 48);
        this.createWater(68, 49);
        this.createWater(68, 50);
        this.createWater(68, 51);
        this.createWater(68, 52);
        this.createWater(68, 53);
        this.createWater(68, 54);
        this.createWater(68, 55);
        this.createWater(68, 56);
        this.createWater(68, 57);

        this.createWater(67, 49);
        this.createWater(67, 50);
        this.createWater(67, 51);
        this.createWater(67, 52);
        this.createWater(67, 53);
        this.createWater(67, 54);
        this.createWater(67, 55);
        this.createWater(67, 56);
        this.createWater(67, 57);
        this.createWater(67, 58);

        this.createWater(66, 49);
        this.createWater(66, 50);
        this.createWater(66, 51);
        this.createWater(66, 52);
        this.createWater(66, 53);
        this.createWater(66, 54);
        this.createWater(66, 55);
        this.createWater(66, 56);
        this.createWater(66, 57);
        this.createWater(66, 58);

        this.createWater(65, 49);
        this.createWater(65, 50);
        this.createWater(65, 51);
        this.createWater(65, 52);
        this.createWater(65, 53);
        this.createWater(65, 54);
        this.createWater(65, 55);
        this.createWater(65, 56);
        this.createWater(65, 57);
        this.createWater(65, 58);

        this.createWater(64, 48);
        this.createWater(64, 49);
        this.createWater(64, 50);
        this.createWater(64, 51);
        this.createWater(64, 52);
        this.createWater(64, 53);
        this.createWater(64, 54);
        this.createWater(64, 55);
        this.createWater(64, 56);
        this.createWater(64, 57);
        this.createWater(64, 58);

        this.createWater(63, 48);
        this.createWater(63, 49);
        this.createWater(63, 50);
        this.createWater(63, 51);
        this.createWater(63, 52);
        this.createWater(63, 53);
        this.createWater(63, 54);
        this.createWater(63, 55);
        this.createWater(63, 56);
        this.createWater(63, 57);
        this.createWater(63, 58);

        this.createWater(62, 49);
        this.createWater(62, 50);
        this.createWater(62, 51);
        this.createWater(62, 52);
        this.createWater(62, 53);
        this.createWater(62, 54);
        this.createWater(62, 55);
        this.createWater(62, 56);
        this.createWater(62, 57);
        this.createWater(62, 58);
        this.createWater(62, 59);

        this.createWater(61, 50);
        this.createWater(61, 51);
        this.createWater(61, 52);
        this.createWater(61, 53);
        this.createWater(61, 54);
        this.createWater(61, 55);
        this.createWater(61, 56);
        this.createWater(61, 57);
        this.createWater(61, 58);
        this.createWater(61, 59);
        this.createWater(61, 60);

        this.createWater(60, 51);
        this.createWater(60, 52);
        this.createWater(60, 53);
        this.createWater(60, 54);
        this.createWater(60, 55);
        this.createWater(60, 56);
        this.createWater(60, 57);
        this.createWater(60, 58);
        this.createWater(60, 59);
        this.createWater(60, 60);

        this.createWater(59, 51);
        this.createWater(59, 52);
        this.createWater(59, 53);
        this.createWater(59, 54);
        this.createWater(59, 55);
        this.createWater(59, 56);
        this.createWater(59, 57);
        this.createWater(59, 58);
        this.createWater(59, 59);
        this.createWater(59, 60);

        this.createWater(58, 51);
        this.createWater(58, 52);
        this.createWater(58, 53);
        this.createWater(58, 54);
        this.createWater(58, 55);
        this.createWater(58, 56);
        this.createWater(58, 57);
        this.createWater(58, 58);
        this.createWater(58, 59);
        this.createWater(58, 60);

        this.createWater(57, 52);
        this.createWater(57, 53);
        this.createWater(57, 54);
        this.createWater(57, 55);
        this.createWater(57, 56);
        this.createWater(57, 57);
        this.createWater(57, 58);
        this.createWater(57, 59);
        this.createWater(57, 60);

        this.createWater(56, 53);
        this.createWater(56, 54);
        this.createWater(56, 55);
        this.createWater(56, 56);
        this.createWater(56, 57);
        this.createWater(56, 58);
        this.createWater(56, 59);
        this.createWater(56, 60);

        this.createWater(55, 55);
        this.createWater(55, 56);
        this.createWater(55, 57);
        this.createWater(55, 58);
        this.createWater(55, 59);
        this.createWater(55, 60);

        this.createWater(54, 54);
        this.createWater(54, 55);
        this.createWater(54, 56);
        this.createWater(54, 57);
        this.createWater(54, 58);
        this.createWater(54, 59);

        this.createWater(53, 55);
        this.createWater(53, 56);
        this.createWater(53, 57);
        this.createWater(53, 58);
        this.createWater(53, 59);

        this.createWater(52, 54);
        this.createWater(52, 55);
        this.createWater(52, 56);
        this.createWater(52, 57);
        this.createWater(52, 58);
        this.createWater(52, 59);

        this.createWater(51, 54);
        this.createWater(51, 55);
        this.createWater(51, 56);
        this.createWater(51, 57);
        this.createWater(51, 58);
        this.createWater(51, 59);

        this.createWater(50, 54);
        this.createWater(50, 55);
        this.createWater(50, 56);
        this.createWater(50, 57);
        this.createWater(50, 58);
        this.createWater(50, 59);

        this.createWater(49, 55);
        this.createWater(49, 56);
        this.createWater(49, 57);
        this.createWater(49, 58);
        this.createWater(49, 59);

        this.createWater(48, 55);
        this.createWater(48, 56);
        this.createWater(48, 57);
        this.createWater(48, 58);
        this.createWater(48, 59);

        this.createWater(47, 56);
        this.createWater(47, 57);
        this.createWater(47, 58);

        this.createTree(34, 5);
        this.createTree(14, 35);
        this.createTree(40, 80);
        this.createTree(90, 84);
        this.createTree(24, 71);
        this.createTree(15, 91);
        this.createTree(86, 95);
        this.createTree(81, 21);
        this.createTree(75, 27);

        this.render();
    }

    reset() {
        this.tiles.forEach((row) => {
            row.forEach((tile) => {
                tile?.content?.die();
            });
        });

        this.tiles = [];

        for (let x = 0; x < this.boardX; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < this.boardY; y++) {
                this.tiles[x][y] = new Tile(x, y);
            }
        }

        this.chart?.reset();
        this.chart2?.reset();

        this.create();
        this.generateEnvironment();
    }

    stop(){
        this.tiles.forEach((row) => {
            row.forEach((tile) => {
                tile?.content?.stop();
            });
        });
        this.chart?.stop();
        this.chart2?.stop();
    }
}

class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.content = null;
        this.el = null;
        this.className = null;
        this.property = null;
    }
}

export default Board;
