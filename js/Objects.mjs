import { Action } from './actions/Action.mjs';
import { Directions } from './actions/Directions.mjs';

export class Objects {
    constructor(config) {
        this.map = config.map;
        this.position = config.position;
        this.areaClass = config.areaClass || 'sight-area';

        this.icon = config.icon || 'undefined icon';
        this.name = config.name || 'undefined name';
        this.type = config.type || 'undefined type';
        this.size = config.size || 9;
        this.defaultSize = config.defaultSize || config.size || 9;
        this.maxSize = config.size || 13.5;

        this.gen = config.gen || 0;

        this.isAlive = true;
        this.energy = config.energy || 0;
        this.defaultEnergy = config.energy || 0;
        this.lifeSpan = config.lifeSpan || 500;
        this.defaultLifeSpan = config.lifeSpan || 500;
        this.energyEfficiency = config.energyEfficiency || 1;
        this.moveSpendEnergy = config.moveSpendEnergy || 0;
        this.hungerFood = config.hungerFood || 0.75;
        this.needFood = this.defaultEnergy * this.hungerFood;

        this.reproductiveCycle = config.reproductiveCycle || 100;
        this.procreationEnergy = config.procreationEnergy || 100;
        this.postpartumcCare = config.postpartumcCare || 0;

        this.growLevel_1 = config.growLevel_1 || 90;
        this.growLevel_2 = config.growLevel_2 || 80;

        this.actionPeriod = config.actionPeriod || 100;
        this.addActionPeriod = config.addActionPeriod || 0;
        this.hungryMoveSpeed = config.hungryMoveSpeed || 100;

        this.sightRange = config.sightRange || 0;
        this.territoryRange = config.territoryRange || 0;
        this.allowSameSpecies = config.allowSameSpecies || 4;
        this.preylimit = config.preylimit || 1;

        this.eatTarget = config.eatTarget || null;

        this.directions = new Directions(this);
        this.actions = new Action(this);

        this.priority = config.priority || [];
    }

    init() {
        if (this?.life) clearInterval(this.life);
        if (this?.moveCycle) clearTimeout(this.moveCycle);

        this.life = setInterval(() => {
            if(!this.isAlive) return;
            this.lifeSpan -= 1;
            this.energy -= this.energyEfficiency;

            if (this.growLevel === 0) this.size = this.defaultSize * 0.6;
            if (this.growLevel === 1) this.size = this.defaultSize * 0.8;
            if (this.growLevel === 2) this.size = this.defaultSize;

            if (this.postpartumcCare > 0) this.postpartumcCare -= 1;

            // if(this.energy < this.needFood){
            //     this.className = 'hungry';
            // }else{
            //     this.className = '';
            // }

            if (this.energy <= 0 || this.lifeSpan <= 0) {
                this.die('no energy and lifeSpan');
                return;
            }

            this.render();
        }, 200 / this.map.speed);

        this.moveCycleAction();
    }

    get growLevel() {
        const { lifeSpan, defaultLifeSpan } = this;
        const ratio = lifeSpan / defaultLifeSpan;

        if (ratio > this.growLevel_1 / 100) return 0;
        if (ratio > this.growLevel_2 / 100) return 1;
        return 2;
    }

    drawArea(area, className = this.areaClass) {
        area.filter((tile) => tile).forEach((tile) => tile.el.classList.add(className));
        this.map.getTile(this.position.x, this.position.y).el.classList.add('tree-area');
    }

    removeArea(area) {
        area.filter((tile) => tile).forEach((tile) => tile.el.classList.remove(this.areaClass));
    }

    moveCycleAction() {
        if(!this.isAlive) return;
        this.moveCycle = setTimeout(() => {
            this.action();
            this.moveCycleAction();
        }, (this.actionPeriod + this.addActionPeriod) / this.map.speed);
    }

    get adjacentTiles() {
        const adjacentTiles = [
            this.map.getTile(this.position.x, this.position.y - 1),
            this.map.getTile(this.position.x, this.position.y + 1),
            this.map.getTile(this.position.x - 1, this.position.y),
            this.map.getTile(this.position.x + 1, this.position.y),
            this.map.getTile(this.position.x - 1, this.position.y - 1),
            this.map.getTile(this.position.x + 1, this.position.y - 1),
            this.map.getTile(this.position.x - 1, this.position.y + 1),
            this.map.getTile(this.position.x + 1, this.position.y + 1),
        ];

        adjacentTiles.empty = adjacentTiles.filter((tile) => tile?.content === null);

        return adjacentTiles;
    }

    getSight(sight) {
        const { x, y } = this.position;
        let sightTiles = [];

        for (let i = -sight; i <= sight; i++) {
            for (let j = -sight; j <= sight; j++) {
                const distance = Math.sqrt(i**2 + j**2);
                if (distance < sight) sightTiles.push(this.map.getTile(x + i, y + j));
            }
        }
        sightTiles = sightTiles.filter((tile) => tile?.content !== this);
        sightTiles.empty = sightTiles.filter((tile) => tile?.content === null);

        return sightTiles;
    }

    action() {
        this.addActionPeriod = 0;

        this.sightTiles = this.getSight(this.sightRange);
        this.territoryTiles = this.getSight(this.territoryRange);

        this.foodTile = this.sightTiles.filter((tile) => tile?.content?.type === this.eatTarget && tile?.content?.size < this.size);
        this.predator = this.sightTiles.filter((tile) => tile?.content?.eatTarget === this.type && tile?.content?.energy < tile?.content?.needFood);
        this.territory = this.territoryTiles.filter((tile) => tile?.content !== 'food' && tile?.content?.size >= this.size);

        this.priority.forEach((action) => this.actions[action]());
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
            const emptyTiles = this.adjacentTiles.filter((tile) => tile?.content === null);

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
            } else {
                const emptyTiles = this.adjacentTiles.filter((tile) => tile?.content === null);

                if (emptyTiles.length > 0) {
                    const randomIndex = Math.floor(Math.random() * emptyTiles.length);
                    const { x, y } = emptyTiles[randomIndex];
                    this.move(x, y);
                }
                return;
            }
        }

        if (this.map.dev) {
            this.removeArea(this.getSight(this.territoryRange), 'territory-area');
            this.removeArea(this.getSight(this.sightRange));
        }
        const { x: oldX, y: oldY } = this.position;
        this.position = { x, y };
        this.oldTile = this.map.getTile(oldX, oldY);
        this.oldTile.content = null;
        this.oldTile.el.innerHTML = '';
        tile.content = this;

        this.render();
        if (this.map.dev) {
            this.drawArea(this.getSight(this.territoryRange), 'territory-area');
            this.drawArea(this.getSight(this.sightRange));
        }
    }

    eat(target) {
        this.energy += target.energy;
        target.die('eaten');
    }

    giveBirth() {
        const emptyTiles = this.adjacentTiles.empty;
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

            newBug.icon = this.icon;
            newBug.type = this.type;
            newBug.energy = this.procreationEnergy + 10;
            newBug.priority = this.priority;
            if (Math.random() > 0.01) newBug.priority = [...this.priority].sort(() => Math.random() - 0.5);

            this.postpartumcCare = this.reproductiveCycle;
            this.energy -= this.procreationEnergy;
            this.map.bug++;
        }
    }

    render() {
        const { x, y } = this.position;
        const tile = this.map.getTile(x, y);

        tile.content = this;
        tile.el.innerHTML = `
            <span
                class="${this.className || ''}"
                style="
                font-size: ${this.size}px;
            " id="${this.name || ''}">
                ${this.icon}
            </span>
        `;

        // <div class="status_wrap">
        //     <span style="background: red; transform: scaleX(${this.energy / this.defaultEnergy});"></span>
        //     <span style="background: green; transform: scaleX(${this.lifeSpan / this.defaultLifeSpan});"></span>
        // </div>
    }

    die(reason) {
        const { x, y } = this.position;
        const tile = this.map.getTile(x, y);
                
        clearInterval(this.life);
        clearTimeout(this.moveCycle);
        this.isAlive = false;

        tile.content = null;
        tile.el.innerHTML = '';
    }
}
