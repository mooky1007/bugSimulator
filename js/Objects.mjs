class Objects {
    constructor(config) {
        this.map = config.map;
        this.position = config.position;
        this.name = config.name || 'object';
        this.size = config.size || 9;
        this.icon = config.icon || '⭕';
        this.directions = ['up', 'down', 'left', 'right'];
    }

    sight() {
        const { x, y } = this.position;
        let sightTiles = [];

        const transform = (i, j) => this.map.getTile(x + i, y + j);

        for (let i = -this.sightRange; i <= this.sightRange; i++) {
            for (let j = -this.sightRange; j <= this.sightRange; j++) {
                const distance = Math.sqrt(i * i + j * j);

                if (distance <= this.sightRange) {
                    sightTiles.push(transform(i, j));
                }
            }
        }
        sightTiles = sightTiles.filter((tile) => tile?.content !== this);
        return sightTiles;
    }

    die() {
        this.map.getTile(this.position.x, this.position.y).content = null;
    }
}

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

export class Bug extends Objects {
    constructor(config) {
        super(config);
        this.name = config.name;
        this.type = 'bug';
        this.eatTarget = 'food';
        this.power = 8;
        this.speed = 300;
        this.energy = 80;
        this.maxEnergy = 100;
        this.sightRange = 12;
        this.needFood = 50;
        this.procreationEnergy = 30;
        this.reproductiveCycle = 30;
        this.postpartumcCare = this.reproductiveCycle;
        this.newBornEnergy = this.energy / 4;
        this.gen = 0;

        this.init();
    }

    get energy() {
        return this._energy;
    }

    set energy(value) {
        this._energy = value;
        if (this._energy > this.maxEnergy) this._energy = this.maxEnergy;
        if (this._energy < 0) this._energy = 0;
    }

    init() {
        if (this?.life) clearInterval(this.life);
        if (this?.moveCycle) clearInterval(this.moveCycle);

        this.life = setInterval(() => {
            this.energy--;
            if (this.energy <= 0) {
                this.die();
            }
        }, 200);

        this.moveCycle = setInterval(() => {
            this.moveAction();
        }, this.speed);
    }

    die() {
        clearInterval(this.life);
        clearInterval(this.moveCycle);
        super.die();
    }

    bear() {
        const nearlyTiles = this.getNealarTiles();

        const emptyTiles = nearlyTiles.filter((tile) => tile?.content === null);
        if (emptyTiles.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyTiles.length);
            const { x, y } = emptyTiles[randomIndex];
            let newBug;

            switch (this.type) {
                case 'bug':
                    if(this.name.includes('ant')) {
                        newBug = this.map.createAnt(x, y);
                        break;
                    }else{
                        newBug = this.map.createBug(x, y);
                        break;
                    }
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

    moveAction() {
        const { x, y } = this.position;
        let direction;
        if (this.energy < this.needFood) {
            direction = this.findNearestFood();
        } else {
            direction = this.getDirectionRandom();
        }

        if (this.postpartumcCare > 0) {
            this.postpartumcCare -= 1;
        }

        if (this.energy > this.procreationEnergy && this.postpartumcCare <= 0) {
            this.bear();
        }

        switch (direction) {
            case 'up':
                this.move(x, y - 1);
                break;
            case 'down':
                this.move(x, y + 1);
                break;
            case 'left':
                this.move(x - 1, y);
                break;
            case 'right':
                this.move(x + 1, y);
                break;
        }
    }

    move(x, y) {
        if (x < 0 || y < 0 || x >= this.map.boardX || y >= this.map.boardY) return;

        const tile = this.map.getTile(x, y);
        if (tile.content) {
            if (tile.content.type === this.eatTarget) {
                this.collisionEvent('eat', tile.content);
                return;
            } else {
                const emptyTiles = this.getNealarTiles().filter((tile) => tile?.content === null);

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

    getDirectionRandom() {
        const randomIndex = Math.floor(Math.random() * this.directions.length);
        return this.directions[randomIndex];
    }

    findNearestFood() {
        const sightTiles = this.sight();
        const foodTiles = sightTiles.filter((tile) => tile?.content && tile?.content?.type === this.eatTarget);

        if (foodTiles.length === 0) {
            return this.getDirectionRandom();
        }

        const distances = foodTiles.map((tile) => {
            const distance = Math.sqrt(Math.pow(tile.x - this.position.x, 2) + Math.pow(tile.y - this.position.y, 2));
            return { tile, distance };
        });

        distances.sort((a, b) => a.distance - b.distance);

        const nearestFood = distances[0].tile;
        const direction = this.getDirectionToTile(nearestFood);
        return direction;
    }

    getDirectionToTile(tile) {
        const { x, y } = this.position;
        const { x: tileX, y: tileY } = tile;
        if (x === tileX) {
            if (y > tileY) return 'up';
            if (y < tileY) return 'down';
        }
        if (y === tileY) {
            if (x > tileX) return 'left';
            if (x < tileX) return 'right';
        }
        if (x > tileX) {
            if (y > tileY) return 'up';
            if (y < tileY) return 'down';
        }
        if (x < tileX) {
            if (y > tileY) return 'up';
            if (y < tileY) return 'down';
        }
    }

    collisionEvent(event, target) {
        switch (event) {
            case 'eat':
                this.eat(target);
                break;
        }
    }

    getNealarTiles() {
        const { x, y } = this.position;
        const nearlyTiles = [];

        this.map.getTile(x, y - 1) && nearlyTiles.push(this.map.getTile(x, y - 1));
        this.map.getTile(x, y + 1) && nearlyTiles.push(this.map.getTile(x, y + 1));
        this.map.getTile(x - 1, y) && nearlyTiles.push(this.map.getTile(x - 1, y));
        this.map.getTile(x + 1, y) && nearlyTiles.push(this.map.getTile(x + 1, y));
        this.map.getTile(x - 1, y - 1) && nearlyTiles.push(this.map.getTile(x - 1, y - 1));
        this.map.getTile(x + 1, y - 1) && nearlyTiles.push(this.map.getTile(x + 1, y - 1));
        this.map.getTile(x - 1, y + 1) && nearlyTiles.push(this.map.getTile(x - 1, y + 1));
        this.map.getTile(x + 1, y + 1) && nearlyTiles.push(this.map.getTile(x + 1, y + 1));

        return nearlyTiles;
    }

    eat(target) {
        target.die();
        this.energy += target.type === 'food' ? target.energy : target.energy;
        this.power += 1;
        this.size += 0.2;
    }
}

export class HunterBug extends Bug {
    constructor(config) {
        super(config);
        this.type = 'hunter';
        this.eatTarget = 'bug';
        this.power = 16;
        this.speed = 220;
        this.energy = 180;
        this.maxEnergy = 240;
        this.sightRange = 32;
        this.needFood = 40;
        this.reproductiveCycle = 120;
        this.procreationEnergy = 40;
        this.postpartumcCare = this.reproductiveCycle;
        this.newBornEnergy = this.energy / 4;
        this.gen = 0;

        this.init();
    }

    eat(target) {
        if (target.power > this.power) {
            target.power -= 1;
            return;
        }
        super.eat(target);
    }

    move(x, y){
        super.move(x, y);
        this.energy -= 1;
    }
}

export class Tree extends Objects {
    constructor(config) {
        super(config);
        this.name = config.name || 'tree';
        this.type = 'tree';
        this.size = 11;
        this.icon = '🌱';
        this.sightRange = 4;

        this.level = 0;

        this.aliveTime = 0;
        this.createDuration = 2000 + Math.floor(Math.random() * 1000);
        this.createLength = 6;
        this.area = this.sight();
        this.init();
    }

    init() {
        if (this?.life) clearTimeout(this.life);
        this.life = setTimeout(this.growAndCreate.bind(this), this.createDuration);
    }

    growAndCreate() {
        if (this.level <= 2) {
            this.size += 2;
            this.level += 1;
            this.life = setTimeout(this.growAndCreate.bind(this), this.createDuration * (this.level / 2));
            return;
        }
        this.icon = '🌲';
        this.size = 24;

        const emptyTiles = this.sight().filter((tile) => !tile?.content);

        this.aliveTime += this.createDuration;
        for (let i = 0; i < Math.floor(Math.random() * this.createLength) + this.createLength - 3; i++) {
            if (emptyTiles.length > 0) {
                const randomIndex = Math.floor(Math.random() * emptyTiles.length);
                if (!emptyTiles[randomIndex]) continue;
                const { x, y } = emptyTiles[randomIndex];
                this.map.createFood(x, y);
            }
        }

        if(this.level < 10){
            this.level += 1;
            this.size += this.level;
            this.sightRange += Math.floor(this.level / 4);
            this.createLength += this.level;
            this.drawArea();
            this.life = setTimeout(this.growAndCreate.bind(this), this.createDuration * (this.level / 2));
            return;
        }

        if (this.level > 10) {
            this.removeArea();
            clearTimeout(this.life);
            this.die();
            this.map.tiles.forEach((row) => {
                row.forEach((tile) => {
                    if (tile?.content?.type === 'tree') {
                        tile.content.level > 3 && tile.content.drawArea();
                    }
                });
            });
            return;
        }

        this.life = setTimeout(this.growAndCreate.bind(this), this.createDuration * (this.level / 2));
    }

    drawArea() {
        this.area = this.sight();
        this.area
            .filter((tile) => tile)
            .forEach((tile) => {
                tile.el.classList.add('tree-area');
            });

        this.map.getTile(this.position.x, this.position.y).el.classList.add('tree-area');
    }

    removeArea() {
        this.area = this.sight();
        this.area
            .filter((tile) => tile)
            .forEach((tile) => {
                tile.el.classList.remove('tree-area');
            });

        this.map.getTile(this.position.x, this.position.y).el.classList.remove('tree-area');
    }

    die() {
        let count = Math.floor(Math.random() * 2) + 1;

        if(this.map.getObjCount('tree') > 8) {
            count = 0;
        }

        if (this.map.getObjCount('tree') < 4) {
            count = 2;
        }

        while (count > 0) {
            const emptyTiles = this.sight().filter((tile) => !tile?.content);
            const randomIndex = Math.floor(Math.random() * emptyTiles.length);
            if (!emptyTiles[randomIndex]?.x && !emptyTiles[randomIndex]?.y && !emptyTiles[randomIndex]?.content) continue;
            this.map.createTree(emptyTiles[randomIndex].x, emptyTiles[randomIndex].y);
            count--;
        }
        super.die();
    }
}

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

export class Ant extends Bug {
    constructor(config) {
        super(config);
        this.needFood = 1800;

        this.init();
    }
}

export class Scolpion extends HunterBug {
    constructor(config) {
        super(config);
        this.needFood = 1800;
        this.speed = 500;

        this.init();
    }
}