import { Objects } from "../Objects.mjs";

export class Food extends Objects {
    constructor(config) {
        super(config);
        this.energy = 50;
        this.type = 'food';

        this.init();
    }

    init() {
        if(this?.foodLife) clearTimeout(this.foodLife);
        this.foodLife = setTimeout(() => {
            this.die();
        }, 12000);
    }

    die() {
        clearTimeout(this.foodLife);
        super.die();
    }
}