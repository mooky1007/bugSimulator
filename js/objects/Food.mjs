import { Objects } from "../Objects.mjs";

export class Food extends Objects {
    constructor(config) {
        super(config);
        this.icon = '🌱';
        this.energy = 25;
        this.size = 7;
        this.type = 'food';
    }
}