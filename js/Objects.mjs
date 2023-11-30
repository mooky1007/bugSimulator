export class Objects {
    constructor(config) {
        this.map = config.map;
        this.position = config.position;
        this.name = config.name || 'object';
        this.size = config.size || 9;
        this.icon = config.icon || '';
        this.energy = config.energy || 0;
        this.directions = ['up', 'down', 'left', 'right'];
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
        if (this?.moveCycle) clearTimeout(this.moveCycle);

        this.life = setInterval(() => {
            this.energy--;
            if (this.energy <= 0) {
                this.die();
            }
        }, 200);

        this.moveCycleAction();
    }

    moveCycleAction() {
        this.moveCycle = setTimeout(() => {
            this.moveAction();
            this.moveCycleAction();
        }, this.speed);
    }

    getSight(sight) {
        const { x, y } = this.position;
        let sightTiles = [];

        const transform = (i, j) => this.map.getTile(x + i, y + j);

        for (let i = -sight; i <= sight; i++) {
            for (let j = -sight; j <= sight; j++) {
                const distance = Math.sqrt(i * i + j * j);

                if (distance <= sight) {
                    sightTiles.push(transform(i, j));
                }
            }
        }
        sightTiles = sightTiles.filter((tile) => tile?.content !== this);
        return sightTiles;
    }

    collisionEvent(event, target) {
        switch (event) {
            case 'eat':
                this.eat(target);
                break;
        }
    }

    eat(target) {
        target.die();
        this.energy += target.energy;
        this.power += 1;
        this.size += 0.2;
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
        this.name = config.name;
        this.type = 'bug';
        this.eatTarget = 'food';
        this.power = 8;

        this.speed = 300;
        this.energy = 80;
        this.maxEnergy = 100;
        this.sightRange = 9;
        this.needFood = 50;
        this.procreationEnergy = 30;
        this.reproductiveCycle = 30;
        this.postpartumcCare = this.reproductiveCycle;
        this.newBornEnergy = this.energy / 4;
        this.allowSameSpecies = 64;
        this.gen = 0;

        this.init();
    }

    bear() {
        const nearlyTiles = this.getSight(1);

        const sameSpecies = this.getSight(this.sightRange).filter((tile) => tile?.content?.type === this.type);
        if (sameSpecies.length > this.allowSameSpecies) {
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
                    if (this.name.includes('ant')) {
                        newBug = this.map.createAnt(x, y);
                        break;
                    } else {
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

        const predators = this.getSight(this.sightRange).filter((tile) => {
            if (this.type === 'bug') {
                return tile?.content?.type === 'hunter';
            }
        });

        if (predators.length > 0) {
            direction = this.getDirectionToTileReverse(predators[0]);
        } else if (this.energy < this.needFood) {
            if (this.type === 'hunter') {
                this.huntMode = true;
            }
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

    getDirectionRandom() {
        const randomIndex = Math.floor(Math.random() * this.directions.length);
        return this.directions[randomIndex];
    }

    getDirectionToTileReverse(tile) {
        const { x, y } = this.position;
        const { x: tileX, y: tileY } = tile;
        if (x === tileX) {
            if (y > tileY) return 'down';
            if (y < tileY) return 'up';
        }
        if (y === tileY) {
            if (x > tileX) return 'right';
            if (x < tileX) return 'left';
        }
        if (x > tileX) {
            if (y > tileY) return 'down';
            if (y < tileY) return 'up';
        }
        if (x < tileX) {
            if (y > tileY) return 'down';
            if (y < tileY) return 'up';
        }
    }

    findNearestFood() {
        const sightTiles = this.getSight(this.sightRange);
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
}

export class HunterBug extends Bug {
    constructor(config) {
        super(config);
        this.type = 'hunter';
        this.eatTarget = 'bug';
        this.power = 16;
        
        this.speed = 150;
        this.energy = 120;
        this.maxEnergy = 160;
        this.sightRange = 12;
        this.needFood = 70;
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
