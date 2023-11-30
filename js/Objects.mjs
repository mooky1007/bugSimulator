import { Directions } from './Directions.mjs';

export class Objects {
    constructor(config) {
        this.map = config.map;
        this.position = config.position;

        this.icon = config.icon || '';
        this.name = config.name || 'object';
        this.size = config.size || 9;
        this.maxSize = this.size * 2;

        this.energy = config.energy || 0;
        this.lifeSpan = config.lifeSpan || 500;

        this.safePosition = null;

        this.actionPeriod = config.actionPeriod || 100;
        this.addActionPeriod = config.addActionPeriod || 0;

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
        if (this._lifeSpan < 0) this.die();
    }

    init() {
        if (this?.life) clearInterval(this.life);
        if (this?.moveCycle) clearTimeout(this.moveCycle);

        this.life = setInterval(() => {
            this.energy -= 1;
            this.lifeSpan -= 1;
            if (this.postpartumcCare > 0) this.postpartumcCare -= 1;
            if (this.energy <= 0) this.die();
        }, 200);

        this.moveCycleAction();
    }

    moveCycleAction() {
        this.moveCycle = setTimeout(() => {
            this.action();
            this.moveCycleAction();
        }, this.actionPeriod + this.addActionPeriod);
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
        ]
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
        const foodTile = this.sight.filter((tile) => tile?.content?.type === this.eatTarget); // 주변의 음식
        const territory = this.getSight(this.territoryRange).filter((tile) => tile?.content?.type === this.type); // 활동영역
        const predator = this.sight.filter((tile) => tile?.content?.eatTarget === this.type); // 주변의 포식자

        if(foodTile.length <= 0){
            this.move(this.directions.getDirectionRandom(this.nearbyTiles).x, this.directions.getDirectionRandom(this.nearbyTiles).y);
            return;
        }

        if(this.energy <= this.needFood && foodTile.length > 0){
            foodTile.sort((a, b) => {
                const aDistance = Math.sqrt(Math.pow(a.x - this.position.x, 2) + Math.pow(a.y - this.position.y, 2));
                const bDistance = Math.sqrt(Math.pow(b.x - this.position.x, 2) + Math.pow(b.y - this.position.y, 2));
                return aDistance - bDistance;
            });

            this.move(this.directions.getDirectionToTarget(foodTile[0]).x, this.directions.getDirectionToTarget(foodTile[0]).y);
            this.addActionPeriod -= 20;
            return;
        }

        if(predator.length > 0){
            predator.sort((a, b) => {
                const aDistance = Math.sqrt(Math.pow(a.x - this.position.x, 2) + Math.pow(a.y - this.position.y, 2));
                const bDistance = Math.sqrt(Math.pow(b.x - this.position.x, 2) + Math.pow(b.y - this.position.y, 2));
                return aDistance - bDistance;
            });
            this.move(this.directions.getDirectionToTargetAway(predator[0]).x, this.directions.getDirectionToTargetAway(predator[0]).y);
            return;
        }
        
        if(territory.length > this.allowSameSpecies){
            this.move(this.directions.getDirectionRandom(this.nearbyTiles).x, this.directions.getDirectionRandom(this.nearbyTiles).y);
            return;
        }

        if (this.energy > this.procreationEnergy && this.postpartumcCare <= 0) {
            this.giveBirth();
            return;
        }
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
        if(!x || !y) return;
        if (x < 0 || y < 0 || x >= this.map.boardX || y >= this.map.boardY) {
            // random move
            const emptyTiles = this.getSight(1).filter((tile) => tile?.content === null);

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
                const emptyTiles = this.getSight(1).filter((tile) => tile?.content === null);

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
        this.map.getTile(oldX, oldY).content = null;
        tile.content = this;
    }

    eat(target) {
        target.die();
        this.addActionPeriod = 0;
        this.energy += target.energy;
        this.eatCount += 1;
        this.size += 0.2;
    }

    giveBirth() {
        const nearlyTiles = this.getSight(1);

        const territory = this.getSight(this.territoryRange).filter((tile) => tile?.content?.type === this.type);
        if (territory.length > this.allowSameSpecies) {
            this.postpartumcCare += 3;
            return;
        }

        if (this.getSight(this.sightRange).filter((tile) => tile?.content?.type === this.eatTarget).length < 3) {
            this.postpartumcCare += 3;
            return;
        }

        const emptyTiles = nearlyTiles.filter((tile) => tile?.content === null);
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

            this.postpartumcCare = this.reproductiveCycle;
            this.energy -= this.procreationEnergy;
            this.map.bug++;
        }
    }

    die() {
        clearInterval(this.life);
        clearTimeout(this.moveCycle);
        this.map.getTile(this.position.x, this.position.y).content = null;
    }
}

export class Bug extends Objects {
    constructor(config) {
        super(config);
        this.icon = '🐛';
        this.size = 9;
        this.name = config.name;
        this.type = 'bug';
        this.eatTarget = 'food';
        this.power = 8;
        this.lifeSpan = 600; // 수명

        this.actionPeriod = 300; // 행동 주기
        this.energy = 80; // 초기 에너지
        this.maxEnergy = 100; // 최대 에너지
        this.sightRange = 9; // 시야 영역
        this.territoryRange = 3; // 영역
        this.needFood = 50; // 허기를 느끼는 수치
        this.procreationEnergy = 30;  // 번식에 필요한 에너지
        this.reproductiveCycle = 30; // 번식주기
        this.postpartumcCare = this.reproductiveCycle; // 새끼를 낳고 다시 낳을 수 있을때 까지의 시간
        this.newBornEnergy = this.energy / 4; // 새로 태어나는 개체의 초기 에너지

        this.allowSameSpecies = 12; // 시야 영역 내에 허용되는 동족 개체수, 초과되면 번식하지 않음
        this.gen = 0;

        this.init();
    }

    // action() {
    //     const predator = this.sight.filter((tile) => {
    //         return  tile?.content?.eatTarget === this.type && tile?.content?.energy < tile?.content?.needFood;
    //     }); // 주변의 포식자
    //     if(predator.length > 0){
    //         predator.sort((a, b) => {
    //             const aDistance = Math.sqrt(Math.pow(a.x - this.position.x, 2) + Math.pow(a.y - this.position.y, 2));
    //             const bDistance = Math.sqrt(Math.pow(b.x - this.position.x, 2) + Math.pow(b.y - this.position.y, 2));
    //             return aDistance - bDistance;
    //         });
    //         this.move(this.directions.getDirectionToTargetAway(predator[0]).x, this.directions.getDirectionToTargetAway(predator[0]).y);
    //         return;
    //     }
        
    //     super.action();
    // }
}

export class HunterBug extends Objects {
    constructor(config) {
        super(config);
        this.icon = '🦗';
        this.size= 18;
        this.type = 'hunter';
        this.eatTarget = 'bug';
        this.power = 16;

        this.lifeSpan = 1200;

        this.actionPeriod = 320;
        this.energy = 120;
        this.maxEnergy = 160;
        this.sightRange = 12;
        this.territoryRange = 12;
        this.needFood = 90;
        this.reproductiveCycle = 160;
        this.procreationEnergy = 80;
        this.postpartumcCare = this.reproductiveCycle;
        this.newBornEnergy = this.energy / 4;
        this.gen = 0;

        this.allowSameSpecies = 3;
        this.init();
    }

    move(x, y) {
        this.energy -= 1;
        super.move(x, y);
    }
}
