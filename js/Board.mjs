import { Bug, HunterBug } from './Objects.mjs';
import { Rock } from './objects/Rock.mjs';
import { Tree } from './objects/Tree.mjs';
import { Food } from './objects/Food.mjs';

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

        const ctx = document.getElementById('myChart');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: '🌱',
                        data: [],
                        borderColor: '#617f65',
                        borderWidth: 1,
                        tension: 0.5,
                    },
                    {
                        label: '🐛',
                        data: [],
                        borderColor: '#23b169',
                        borderWidth: 1,
                        tension: 0.5,
                    },
                    {
                        label: '🦗**1.5',
                        data: [],
                        borderColor: '#016130',
                        borderWidth: 1,
                        tension: 0.5,
                    },
                ],
            },
            options: {
                animation: {
                    duration: 0,
                },
                pointStyle: false,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'start',
                        labels: {
                            boxWidth: 10,
                            boxHeight: 10,
                            padding: 30,
                            font: {
                                family: 'Pretendard-Regular, Tossface',
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        suggestedMin: 0, // X축 최소값
                        suggestedMax: 1000, // X축 최대값
                    },
                    y: {
                        suggestedMin: 0, // Y축 최소값
                    },
                },
            },
        });

        const ctx2 = document.getElementById('myChart2');
        this.chart2 = new Chart(ctx2, {
            type: 'bubble',
            data: {
                labels: [],
                datasets: [
                    {
                        label: '🐛',
                        data: [],
                        borderColor: '#23b169',
                        backgroundColor: '#23b169',
                        borderWidth: 1,
                        tension: 0.5,
                    },
                    {
                        label: '🦗',
                        data: [],
                        borderColor: 'tomato',
                        backgroundColor: 'tomato',
                        borderWidth: 1,
                        tension: 0.5,
                    },
                ],
            },
            options: {
                animation: {
                    duration: 0,
                },
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'start',
                        labels: {
                            boxWidth: 10,
                            boxHeight: 10,
                            padding: 30,
                            font: {
                                family: 'Tossface',
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        suggestedMin: 0, // X축 최소값
                        suggestedMax: 25, // X축 최대값
                    },
                    y: {
                        reverse: true,
                        suggestedMin: 0, // Y축 최소값
                        suggestedMax: 25, // Y축 최대값
                    },
                },
            },
        });

        this.chartLength = 0;
        this.chart.data.labels.push(this.chartLength);
        this.chart.data.datasets[0].data.push(this.getObjCount('food'));
        this.chart.data.datasets[1].data.push(this.getObjCount('bug'));
        this.chart.data.datasets[2].data.push(this.getObjCount('hunter') ** 1.5);
        document.querySelector('.food-count').innerHTML = this.getObjCount('food');
        document.querySelector('.bug-count').innerHTML = this.getObjCount('bug');
        document.querySelector('.hunter-count').innerHTML = this.getObjCount('hunter');
        this.chart.update();
        this.chartLength += 1;

        setInterval(() => {
            if (this.chart.data.labels.length > 1000) {
                this.chart.data.labels.shift();
                this.chart.data.datasets[0].data.shift();
                this.chart.data.datasets[1].data.shift();
                this.chart.data.datasets[2].data.shift();
            }

            this.chart.data.labels.push(this.chartLength);
            this.chart.data.datasets[0].data.push(this.getObjCount('food'));
            this.chart.data.datasets[1].data.push(this.getObjCount('bug'));
            this.chart.data.datasets[2].data.push(this.getObjCount('hunter') ** 1.5);
            document.querySelector('.food-count').innerHTML = this.getObjCount('food');
            document.querySelector('.bug-count').innerHTML = this.getObjCount('bug');
            document.querySelector('.hunter-count').innerHTML = this.getObjCount('hunter');
            this.chart.update();
            this.chartLength += 1;
        }, 1000);

        setInterval(() => {
            const fields = [];

            for (let x = 0; x < 25; x++) {
                fields[x] = [];
                for (let y = 0; y < 25; y++) {
                    fields[x][y] = {
                        bug: 0,
                        hunter: 0,
                    };
                }
            }

            for (let x = 0; x < 100; x++) {
                for (let y = 0; y < 100; y++) {
                    fields[Math.floor(x / 4)][Math.floor(y / 4)].bug += this.tiles[x][y].content?.type === 'bug' ? 1 : 0;
                    fields[Math.floor(x / 4)][Math.floor(y / 4)].hunter += this.tiles[x][y].content?.type === 'hunter' ? 1 : 0;
                }
            }

            this.chart2.data.labels = [];
            this.chart2.data.datasets[0].data = [];
            this.chart2.data.datasets[1].data = [];

            for (let x = 0; x < 25; x++) {
                for (let y = 0; y < 25; y++) {
                    this.chart2.data.datasets[0].data.push({ x: x, y: y, r: fields[x][y].bug * 1.5 });
                    this.chart2.data.datasets[1].data.push({ x: x, y: y, r: fields[x][y].hunter * 1.5 });
                }
            }

            this.chart2.update();
        }, 1000);
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

    createBug(x, y) {
        this.getTile(x, y).content = new Bug({
            map: this,
            position: { x: x, y: y },
            name: `bug_${this.bug}`,
        });

        this.bug++;

        return this.getTile(x, y).content;
    }

    createHunter(x, y) {
        this.getTile(x, y).content = new HunterBug({
            map: this,
            position: { x: x, y: y },
            name: `hunter_${this.bug}`,
        });

        this.bug++;

        return this.getTile(x, y).content;
    }

    createFood(x, y) {
        const targetTile = this.getTile(x, y);
        targetTile.content = new Food({
            map: this,
            position: { x: x, y: y },
            name: `food_${this.bug}`,
        });

        targetTile.el.innerHTML = `<span
        class="${targetTile.content.className || ''}"
        style="
        font-size: ${targetTile.content.size}px;
    " id="${targetTile.content.name || ''}">
        ${targetTile.content.icon}
    </span>`;

        this.food++;
    }

    createTree(x, y) {
        const targetTile = this.getTile(x, y);

        targetTile.content = new Tree({
            map: this,
            position: { x: x, y: y },
            name: `tree_${this.bug}`,
        });

        targetTile.el.innerHTML = `<span
        class="${targetTile.content.className || ''}"
        style="
        font-size: ${targetTile.content.size}px;
    " id="${targetTile.content.name || ''}">
        ${targetTile.content.icon}
    </span>`;
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
        }
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
