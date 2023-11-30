import { Objects } from '../Objects.mjs';

export class Tree extends Objects {
    constructor(config) {
        super(config);
        this.name = config.name || 'tree';
        this.type = 'tree';
        this.size = 11;
        this.icon = '🌱';
        this.sightRange = 4;

        this.level = 0;

        this.createDuration = 2000 + Math.floor(Math.random() * 1000);
        this.createLength = 9;
        this.area = this.getSight(this.sightRange);
        this.init();
    }

    init() {
        if (this?.life) clearTimeout(this.life);
        this.life = setTimeout(this.growAndCreate.bind(this), this.createDuration);
    }

    growAndCreate() {
        const { x, y } = this.position;

        if (this.level <= 2) {
            this.size += 2;
            this.level += 1;
            const tile = this.map.getTile(x, y);
            tile.el.innerHTML = `<span
                            class="${this.className || ''}"
                            style="
                            font-size: ${this.size}px;
                        " id="${this.name || ''}">
                            ${this.icon}
                        </span>`;
            this.life = setTimeout(this.growAndCreate.bind(this), this.createDuration * (this.level / 2));
            return;
        }
        this.icon = '🌲';
        this.size = 24;

        const emptyTiles = this.area.filter((tile) => !tile?.content);

        for (let i = 0; i < Math.floor(Math.random() * (this.createLength - 3)) + 3; i++) {
            if (this.area.filter((tile) => tile?.content?.type === 'food').length > this.area.length / 16) {
                break;
            }

            if (emptyTiles.length > 0) {
                const randomIndex = Math.floor(Math.random() * emptyTiles.length);
                if (!emptyTiles[randomIndex]) continue;
                const { x, y } = emptyTiles[randomIndex];
                this.map.createFood(x, y);
            }
        }

        if (this.level < 10) {
            this.level += 1;
            this.size += this.level;
            this.sightRange += Math.floor(this.level ** 1.7);
            this.area = this.getSight(this.sightRange);
            this.createLength += this.level ** 2;
            const tile = this.map.getTile(x, y);
            tile.el.innerHTML = `<span
                            class="${this.className || ''}"
                            style="
                            font-size: ${this.size}px;
                        " id="${this.name || ''}">
                            ${this.icon}
                        </span>`;
            this.drawArea();
            this.life = setTimeout(this.growAndCreate.bind(this), this.createDuration * (this.level / 4));
            return;
        }

        this.life = setTimeout(this.growAndCreate.bind(this), this.createDuration * (this.level / 2));
    }

    drawArea() {
        this.area = this.getSight(this.sightRange);
        this.area
            .filter((tile) => tile)
            .forEach((tile) => {
                tile.el.classList.add('tree-area');
            });

        this.map.getTile(this.position.x, this.position.y).el.classList.add('tree-area');
    }
}
