import { Objects } from "../Objects.mjs";

export class HunterBug extends Objects {
    constructor(config) {
        super(config);
        this.icon = '🦗';
        this.name = config.name;
        this.type = 'hunter';
        this.size = 13;
        this.defaultSize = 13;
        this.maxSize = 19.5;

        this.energy = 100;
        this.defaultEnergy = 100;
        this.lifeSpan = 200;
        this.defaultLifeSpan = 200;
        this.energyEfficiency = 0.25;
        this.moveSpendEnergy = 1;
        this.hungerFood = 0.75;
        this.needFood = this.defaultEnergy * this.hungerFood;

        this.reproductiveCycle = 50;
        this.procreationEnergy = 50;
        this.postpartumcCare = 50;

        this.growLevel_1 = 98;
        this.growLevel_2 = 80;

        this.actionPeriod = 50;
        this.addActionPeriod = 0;
        this.hungryMoveSpeed = 50;

        this.sightRange = 12;
        this.territoryRange = 16;
        this.allowSameSpecies = 1;
        this.preylimit = 0;

        this.eatTarget = 'bug';

        this.priority = ['food', 'species', 'evasion'];
        this.init();
    }
}
