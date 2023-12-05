import { Objects } from '../Objects.mjs';

export class Tree extends Objects {
    constructor(config) {
        super(config);
        this.name = config.name || 'tree';
        this.type = 'tree';
        this.size = 24;
        this.icon = '🌲';
        this.sightRange = 16;

        this.level = 10;

        this.createDuration = 3000;
        this.createLength = 797;
        this.density = 24;
        this.area = this.getSight(this.sightRange);
        console.log(this.area.length)
        console.log(this.area.length/this.density)
        this.init();
    }

    init() {
        this.drawArea();
        if (this?.life) clearTimeout(this.life);
        this.life = setTimeout(this.createFood.bind(this), this.createDuration/this.map.speed);
    }

    createFood() {
        const emptyTiles = this.area.filter((tile) => !tile?.content);
        let AreaInfoodCount = this.area.filter((tile) => tile?.content?.type === 'food').length;

        while(AreaInfoodCount < this.area.length/this.density) {
            const randomIndex = Math.floor(Math.random() * emptyTiles.length);
            if (!emptyTiles[randomIndex]) continue;
            const { x, y } = emptyTiles[randomIndex];
            this.map.createFood(x, y);
            AreaInfoodCount++;
        }

        this.life = setTimeout(this.createFood.bind(this), this.createDuration/this.map.speed);
    }

    drawArea() {
        this.area
            .filter((tile) => tile)
            .forEach((tile) => {
                tile.el.classList.add('tree-area');
            });

        this.map.getTile(this.position.x, this.position.y).el.classList.add('tree-area');
    }
}
