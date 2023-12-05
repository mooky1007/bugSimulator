import { Directions } from './Directions.mjs';

export class Objects {
    constructor(config) {
        this.map = config.map;
        this.position = config.position;

        this.icon = config.icon || '';
        this.name = config.name || 'object';
        this.size = config.size || 9;
        this.defaultSize = config.defaultSize || config.size || 9;
        this.maxSize = config.size || 13.5;

        this.energy = config.energy || 0;
        this.lifeSpan = config.lifeSpan || 500;
        this.defaultLifeSpan = config.lifeSpan || 500;

        this.hungryMoveSpeed = config.hungryMoveSpeed || 100;

        this.safePosition = null;

        this.actionPeriod = config.actionPeriod || 100;
        this.addActionPeriod = config.addActionPeriod || 0;

        this.growLevel1 = config.growLevel1 || 90;
        this.growLevel2 = config.growLevel2 || 80;

        this.energyEfficiency = config.energyEfficiency || 1;
        this.moveSpendEnergy = config.moveSpendEnergy || 0;
        this.preylimit = config.preylimit || 1;
        this.sightRange = config.sightRange || 0;
        this.eatCount = 0;
        this.directions = new Directions(this);
    }

    get energy() {
        return this._energy;
    }

    set energy(value) {
        this._energy = value;
        if (this._energy > this.maxEnergy) this._energy = this.maxEnergy;
        if (this._energy < 0) this._energy = 0;
    }

    get lifeSpan() {
        return this._lifeSpan;
    }

    set lifeSpan(value) {
        this._lifeSpan = value;
        if (this._lifeSpan < 0) this.die('no lifeSpan');
    }

    init() {
        if (this?.life) clearInterval(this.life);
        if (this?.moveCycle) clearTimeout(this.moveCycle);

        this.life = setInterval(() => {
            this.energy -= this.energyEfficiency;
            this.lifeSpan -= 1;

            if (this.growLevel === 0) this.size = this.defaultSize * 0.6;
            if (this.growLevel === 1) this.size = this.defaultSize * 0.8;
            if (this.growLevel === 2) this.size = this.defaultSize;

            if (this.postpartumcCare > 0) this.postpartumcCare -= 1;
            if (this.energy <= 0) this.die('no energy');
        }, 200 / this.map.speed);

        this.moveCycleAction();
    }

    get growLevel() {
        const { lifeSpan, defaultLifeSpan } = this;
        const percent = (lifeSpan / defaultLifeSpan) * 100;
        if (percent <= this.growLevel1) return 0;
        if (percent <= this.growLevel2) return 1;
        return 2;
    }

    moveCycleAction() {
        this.moveCycle = setTimeout(() => {
            this.action();
            this.moveCycleAction();
        }, (this.actionPeriod + this.addActionPeriod) / this.map.speed);
    }

    get nearbyTiles() {
        return [
            this.map.getTile(this.position.x, this.position.y - 1),
            this.map.getTile(this.position.x, this.position.y + 1),
            this.map.getTile(this.position.x - 1, this.position.y),
            this.map.getTile(this.position.x + 1, this.position.y),
            this.map.getTile(this.position.x - 1, this.position.y - 1),
            this.map.getTile(this.position.x + 1, this.position.y - 1),
            this.map.getTile(this.position.x - 1, this.position.y + 1),
            this.map.getTile(this.position.x + 1, this.position.y + 1),
        ];
    }

    get sight() {
        return this.getSight(this.sightRange);
    }

    getSight(sight) {
        const { x, y } = this.position;
        let sightTiles = [];

        const transform = (i, j) => this.map.getTile(x + i, y + j);

        for (let i = -sight; i <= sight; i++) {
            for (let j = -sight; j <= sight; j++) {
                const distance = Math.sqrt(i * i + j * j);
                if (distance <= sight) sightTiles.push(transform(i, j));
            }
        }
        sightTiles = sightTiles.filter((tile) => tile?.content !== this);
        return sightTiles;
    }

    getEmptyTiles(tileArray) {
        return tileArray.filter((tile) => tile?.content === null);
    }

    action() {
        this.addActionPeriod = 0;
        this.sightTiles = this.sight;
        this.foodTile = this.sightTiles.filter((tile) => tile?.content?.type === this.eatTarget); // 주변의 음식
        this.predator = this.sightTiles.filter((tile) => tile?.content?.eatTarget === this.type && tile?.content?.energy < tile?.content?.needFood); // 주변의 포식자
        this.territory = this.getSight(this.territoryRange).filter((tile) => tile?.content?.type === this.type); // 활동영역
    }

    collisionEvent(event, target) {
        // 충돌에 대한 처리

        switch (event) {
            case 'eat':
                this.eat(target);
                break;
        }
    }

    move(x, y) {
        this.energy -= this.moveSpendEnergy;
        if (x === undefined || y === undefined) return;
        if (x < 0 || y < 0 || x >= this.map.boardX || y >= this.map.boardY) {
            // random move
            const emptyTiles = this.nearbyTiles.filter((tile) => tile?.content === null);

            if (emptyTiles.length > 0) {
                const randomIndex = Math.floor(Math.random() * emptyTiles.length);
                const { x, y } = emptyTiles[randomIndex];
                this.move(x, y);
            }

            return;
        }

        const tile = this.map.getTile(x, y);
        if (tile.content) {
            if (tile.content.type === this.eatTarget && this.energy <= this.needFood) {
                this.collisionEvent('eat', tile.content);
                return;
            } else if (tile.content.type === 'water') {
                this.die('water');
                return;
            } else {
                const emptyTiles = this.nearbyTiles.filter((tile) => tile?.content === null);

                if (emptyTiles.length > 0) {
                    const randomIndex = Math.floor(Math.random() * emptyTiles.length);
                    const { x, y } = emptyTiles[randomIndex];
                    this.move(x, y);
                }
                return;
            }
        }

        const { x: oldX, y: oldY } = this.position;
        this.position = { x, y };
        this.oldTile = this.map.getTile(oldX, oldY);
        this.oldTile.content = null;
        this.oldTile.el.innerHTML = '';
        tile.content = this;
        tile.el.innerHTML = `<span
                            class="${this.className || ''}"
                            style="
                            font-size: ${this.size}px;
                        " id="${this.name || ''}">
                            ${this.icon}
                        </span>`;
    }

    eat(target) {
        this.energy += target.energy;
        this.eatCount += 1;
        target.die('eaten');
    }

    giveBirth() {
        const territory = this.getSight(this.territoryRange).filter((tile) => tile?.content?.type === this.type);
        if (territory.length > this.allowSameSpecies) {
            this.postpartumcCare += 3;
            return;
        }

        const emptyTiles = this.nearbyTiles.filter((tile) => tile?.content === null);
        if (emptyTiles.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyTiles.length);
            const { x, y } = emptyTiles[randomIndex];
            let newBug;

            switch (this.type) {
                case 'bug':
                    newBug = this.map.createBug(x, y);
                    break;
                case 'hunter':
                    newBug = this.map.createHunter(x, y);
                    break;
                default:
                    newBug = this.map.createBug(x, y);
                    break;
            }

            newBug.power = this.power;
            newBug.icon = this.icon;
            newBug.type = this.type;
            newBug.eatTarget = this.eatTarget;
            newBug.power = this.power;

            newBug.actionPeriod = this.actionPeriod;
            newBug.hungryMoveSpeed = this.hungryMoveSpeed;
            newBug.energy = this.newBornEnergy;
            newBug.originEnergy = this.originEnergy;
            newBug.maxEnergy = this.maxEnergy;
            newBug.needFood = this.needFood;
            newBug.sightRange = this.sightRange;
            newBug.territoryRange = this.territoryRange;
            newBug.procreationEnergy = this.procreationEnergy;
            newBug.reproductiveCycle = this.reproductiveCycle;
            newBug.newBornEnergy = this.newBornEnergy;
            newBug.allowSameSpecies = this.allowSameSpecies;
            newBug.defaultSize = this.defaultSize;
            newBug.size = newBug.defaultSize * 0.6;

            newBug.gen = this.gen + 1;

            if (Math.random() < 0.2) {
                const originSize = newBug.defaultSize;

                newBug.defaultSize = (newBug.defaultSize * (Math.random() * 0.2 + 0.9)).toFixed(1);
                newBug.size = newBug.defaultSize * 0.6;

                const sizeRatio = newBug.defaultSize / originSize;

                newBug.actionPeriod *= sizeRatio;

                newBug.energy *= sizeRatio;
                newBug.originEnergy *= sizeRatio;
                newBug.maxEnergy *= sizeRatio;
                newBug.needFood *= sizeRatio;
                newBug.procreationEnergy *= sizeRatio;
                newBug.newBornEnergy *= sizeRatio;
                newBug.energyEfficiency *= sizeRatio;

                newBug.sightRange = Math.round(newBug.sightRange * sizeRatio);
            }

            this.postpartumcCare = this.reproductiveCycle;
            this.energy -= this.procreationEnergy;
            this.map.bug++;
        }
    }

    die(reason) {
        // if(this.type !== 'food') console.log(this.name, reason);

        clearInterval(this.life);
        clearTimeout(this.moveCycle);
        const targetTile = this.map.getTile(this.position.x, this.position.y);
        this.energy = 0;
        this.lifeSpan = 0;
        targetTile.content = null;
        targetTile.el.innerHTML = '';
    }
}



