import { Objects } from "../Objects.mjs";

export class HunterBug extends Objects {
    constructor(config) {
        super(config);
        this.icon = '🦗';
        this.size = 13;
        this.defaultSize = 13;
        this.type = 'hunter';
        this.eatTarget = 'bug';
        this.power = 16;

        this.lifeSpan = 2400;

        this.actionPeriod = 220;
        this.hungryMoveSpeed = 60; // 배고플때 움직이는 추가 속도
        this.needFood = 180;
        this.energy = 240;
        this.originEnergy = 240;
        this.maxEnergy = 260;
        this.sightRange = 20;
        this.territoryRange = 24;
        this.reproductiveCycle = 75;
        this.procreationEnergy = 100;
        this.postpartumcCare = this.reproductiveCycle;
        this.newBornEnergy = 180;
        this.gen = 0;

        this.growLevel1 = 98;
        this.growLevel2 = 90;

        this.energyEfficiency = 1;
        this.moveSpendEnergy = 2;
        this.preylimit = 3;
        this.allowSameSpecies = 3;
        this.init();
    }

    eat(target) {
        super.eat(target);
        this.energy += 25;
    }

    action() {
        super.action();
        this.foodTile = this.sightTiles.filter((tile) => {
            return tile?.content?.type === this.eatTarget && tile?.content?.size <= this.size;
        }); // 주변의 음식

        if (this.foodTile.length <= 0) {
            const randomPosition = this.directions.getDirectionRandom(this.nearbyTiles);
            this.move(randomPosition?.x, randomPosition?.y);
            return;
        }

        if (this.energy <= this.needFood && this.foodTile.length > this.preylimit) {
            this.foodTile.sort((a, b) => {
                const aDistance = Math.sqrt(Math.pow(a.x - this.position.x, 2) + Math.pow(a.y - this.position.y, 2));
                const bDistance = Math.sqrt(Math.pow(b.x - this.position.x, 2) + Math.pow(b.y - this.position.y, 2));
                const aSize = a.content.size;
                const bSize = b.content.size;
                return aDistance - bDistance || bSize - aSize;
            });

            const toPosition = this.directions.getDirectionToTarget(this.foodTile[0]);

            this.move(toPosition?.x, toPosition?.y);
            this.addActionPeriod -= this.hungryMoveSpeed;
            return;
        }

        if (this.energy > this.procreationEnergy && this.postpartumcCare <= 0) {
            this.giveBirth();
            return;
        }

        if (this.territory.length > this.allowSameSpecies) {
            this.territory
                .filter((tile) => tile?.content?.size >= this.size)
                .sort((a, b) => {
                    const aDistance = Math.sqrt(Math.pow(a.x - this.position.x, 2) + Math.pow(a.y - this.position.y, 2));
                    const bDistance = Math.sqrt(Math.pow(b.x - this.position.x, 2) + Math.pow(b.y - this.position.y, 2));
                    return aDistance - bDistance;
                });

            const awayPosition = this.directions.getDirectionToTargetAway(this.territory[0]);

            if (
                this.position.x === 0 ||
                this.position.y === 0 ||
                this.position.x === this.map.boardX - 1 ||
                this.position.y === this.map.boardY - 1
            ) {
                this.die('out of map');
                return;
            }

            this.move(awayPosition?.x, awayPosition?.y);
            return;
        }
    }
}
