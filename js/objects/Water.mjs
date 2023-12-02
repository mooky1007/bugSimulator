import { Objects } from "../Objects.mjs";

export class Water extends Objects {
    constructor(config) {
        super(config);
        this.name = config.name || 'water';
        this.type = 'water';
        this.size = 24;
        this.icon = '';
        this.className = 'water';
        this.sightRange = 2;
    }
}