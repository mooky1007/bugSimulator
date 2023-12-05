import { Objects } from "../Objects.mjs";

export class Food extends Objects {
    constructor(config) {
        super(config);
        this.icon = '🌱';
        this.energy = 15;
        this.size = 4.7;
        this.type = 'food';
    }
}