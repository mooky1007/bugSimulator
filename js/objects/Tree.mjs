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

        this.area = this.getSight(this.sightRange);
        this.areaClass = 'tree-area';

        this.createDuration = 3000;
        this.createLength = 120;
        this.density = 12; // 낮을 수록 밀도가 높아짐
        this.init();
    }

    init() {
        this.drawArea(this.area);
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
}
