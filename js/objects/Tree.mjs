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

        this.createDuration = 500;
        this.createLength = 4;
        this.density = 24; // 낮을 수록 밀도가 높아짐
        this.init();
    }

    init() {
        this.drawArea(this.area);
        if (this?.life) clearTimeout(this.life);
        this.life = setTimeout(this.createFood.bind(this), this.createDuration / this.map.speed);
    }

    createFood() {
        const emptyTiles = this.area.filter((tile) => !tile?.content);
        const areaFoodCount = this.area.filter((tile) => tile?.content?.type === 'food').length;

        const foodToCreate = Math.min(this.createLength, Math.max(0, this.area.length / this.density - areaFoodCount));

        for (let i = 0; i < foodToCreate; i++) {
            const randomIndex = Math.floor(Math.random() * emptyTiles.length);
            if (!emptyTiles[randomIndex]) continue;
            const { x, y } = emptyTiles[randomIndex];
            this.map.createFood(x, y);
        }

        this.life = setTimeout(this.createFood.bind(this), this.createDuration / this.map.speed);
    }
}
