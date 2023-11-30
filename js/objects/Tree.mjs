import { Objects } from "../Objects.mjs";

export class Tree extends Objects {
    constructor(config) {
        super(config);
        this.name = config.name || 'tree';
        this.type = 'tree';
        this.size = 11;
        this.icon = '🌱';
        this.sightRange = 4;

        this.level = 0;

        this.aliveTime = 0;
        this.createDuration = 2000 + Math.floor(Math.random() * 1000);
        this.createLength = 6;
        this.area = this.sight();
        this.init();
    }

    init() {
        if (this?.life) clearTimeout(this.life);
        this.life = setTimeout(this.growAndCreate.bind(this), this.createDuration);
    }

    growAndCreate() {
        if (this.level <= 2) {
            this.size += 2;
            this.level += 1;
            this.life = setTimeout(this.growAndCreate.bind(this), this.createDuration * (this.level / 2));
            return;
        }
        this.icon = '🌲';
        this.size = 24;

        const emptyTiles = this.sight().filter((tile) => !tile?.content);

        this.aliveTime += this.createDuration;
        for (let i = 0; i < Math.floor(Math.random() * (this.createLength - 3)) + 3; i++) {
            if (emptyTiles.length > 0) {
                const randomIndex = Math.floor(Math.random() * emptyTiles.length);
                if (!emptyTiles[randomIndex]) continue;
                const { x, y } = emptyTiles[randomIndex];
                this.map.createFood(x, y);
            }
        }

        if(this.level < 10){
            this.level += 1;
            this.size += this.level;
            this.sightRange += Math.floor(this.level / 4);
            this.createLength += this.level;
            this.drawArea();
            this.life = setTimeout(this.growAndCreate.bind(this), this.createDuration * (this.level / 2));
            return;
        }

        if (this.level > 10) {
            this.removeArea();
            clearTimeout(this.life);
            this.die();
            this.map.tiles.forEach((row) => {
                row.forEach((tile) => {
                    if (tile?.content?.type === 'tree') {
                        tile.content.level > 3 && tile.content.drawArea();
                    }
                });
            });
            return;
        }

        this.life = setTimeout(this.growAndCreate.bind(this), this.createDuration * (this.level / 2));
    }

    drawArea() {
        this.area = this.sight();
        this.area
            .filter((tile) => tile)
            .forEach((tile) => {
                tile.el.classList.add('tree-area');
            });

        this.map.getTile(this.position.x, this.position.y).el.classList.add('tree-area');
    }

    removeArea() {
        this.area = this.sight();
        this.area
            .filter((tile) => tile)
            .forEach((tile) => {
                tile.el.classList.remove('tree-area');
            });

        this.map.getTile(this.position.x, this.position.y).el.classList.remove('tree-area');
    }

    die() {
        let count = Math.floor(Math.random() * 2) + 1;

        if(this.map.getObjCount('tree') > 8) {
            count = 0;
        }

        if (this.map.getObjCount('tree') < 4) {
            count = 2;
        }

        while (count > 0) {
            const emptyTiles = this.sight().filter((tile) => !tile?.content);
            const randomIndex = Math.floor(Math.random() * emptyTiles.length);
            if (!emptyTiles[randomIndex]?.x && !emptyTiles[randomIndex]?.y && !emptyTiles[randomIndex]?.content) continue;
            this.map.createTree(emptyTiles[randomIndex].x, emptyTiles[randomIndex].y);
            count--;
        }
        super.die();
    }
}
