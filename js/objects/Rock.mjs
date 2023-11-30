import { Objects } from "../Objects.mjs";

export class Rock extends Objects {
    constructor(config) {
        super(config);
        this.name = config.name || 'rock';
        this.type = 'rock';
        this.size = 24;
        this.icon = '';
        this.className = 'rock';
        this.sightRange = 2;
    }
}