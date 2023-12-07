import { Objects } from "../Objects.mjs";

export class Bug extends Objects {
    constructor(config) {
        super(config);
        this.icon = config.icon || '🐛';
        this.name = config.name;
        this.type = config.type || 'bug';
        this.size = 8;
        this.defaultSize = 8;
        this.maxSize = 16;

        this.energy = 25;
        this.defaultEnergy = 25;
        this.lifeSpan = 200;
        this.defaultLifeSpan = 200;
        this.energyEfficiency = 2;
        this.moveSpendEnergy = 0.5;
        this.hungerFood = 0.9;
        this.needFood = this.defaultEnergy * this.hungerFood;

        this.reproductiveCycle = 10;
        this.procreationEnergy = 10;
        this.postpartumcCare = 10;

        this.growLevel_1 = 90;
        this.growLevel_2 = 80;

        this.actionPeriod = 200;
        this.addActionPeriod = 0;
        this.hungryMoveSpeed = 10;

        this.sightRange = 4;
        this.territoryRange = 8;
        this.allowSameSpecies = 8;
        this.preylimit = 0;

        this.eatTarget = 'food';

        this.priority = ['food', 'evasion', 'species'];
        this.init();
    }
}