import { Objects } from "../Objects.mjs";

export class Bug extends Objects {
    constructor(config) {
        super(config);
        this.icon = '🐛';
        this.name = config.name;
        this.type = 'bug';
        this.size = 8;
        this.defaultSize = 8;
        this.maxSize = 16;

        this.energy = 50;
        this.defaultEnergy = 50;
        this.lifeSpan = 100;
        this.defaultLifeSpan = 100;
        this.energyEfficiency = 0.5;
        this.moveSpendEnergy = 0.5;
        this.hungerFood = 0.9;
        this.needFood = this.defaultEnergy * this.hungerFood;

        this.reproductiveCycle = 25;
        this.procreationEnergy = 25;
        this.postpartumcCare = 25;

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