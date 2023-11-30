import { Objects } from "../Objects.mjs";

export class Food extends Objects {
    constructor(config) {
        super(config);
        this.icon = '🌱';
        this.energy = 50;
        size = 7;
        this.type = 'food';
    }
}