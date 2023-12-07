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

        this.energy = 40;
        this.defaultEnergy = 40;
        this.lifeSpan = 300;
        this.defaultLifeSpan = 300;
        this.energyEfficiency = 1;
        this.moveSpendEnergy = 0.5;
        this.hungerFood = 0.8;
        this.needFood = this.defaultEnergy * this.hungerFood;

        this.reproductiveCycle = 10;
        this.procreationEnergy = 10;
        this.postpartumcCare = 10;

        this.growLevel_1 = 90;
        this.growLevel_2 = 80;

        this.actionPeriod = 200;
        this.addActionPeriod = 0;
        this.hungryMoveSpeed = 10;

        this.sightRange = 8;
        this.territoryRange = 12;
        this.allowSameSpecies = 12;
        this.preylimit = 0;

        this.eatTarget = 'food';

        this.priority = ['food', 'evasion', 'species'];
        this.init();
    }
}