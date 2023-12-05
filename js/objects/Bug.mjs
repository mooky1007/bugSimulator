import { Objects } from "../Objects.mjs";

export class Bug extends Objects {
    constructor(config) {
        super(config);
        this.icon = '🐛';
        this.size = 8;
        this.defaultSize = 8;
        this.name = config.name;
        this.type = 'bug';
        this.eatTarget = 'food';
        this.power = 8;
        this.lifeSpan = 1800; // 수명

        this.actionPeriod = 310; // 행동 주기
        this.hungryMoveSpeed = 10; // 배고플때 움직이는 추가 속도
        this.energy = 80; // 초기 에너지
        this.originEnergy = 80; // 초기 에너지 고정값
        this.maxEnergy = 100; // 최대 에너지
        this.needFood = 70; // 허기를 느끼는 수치
        this.sightRange = 12; // 시야 영역
        this.territoryRange = 18; // 영역
        this.procreationEnergy = 50; // 번식에 필요한 에너지
        this.reproductiveCycle = 50; // 번식주기
        this.postpartumcCare = this.reproductiveCycle; // 새끼를 낳고 다시 낳을 수 있을때 까지의 시간
        this.newBornEnergy = 50; // 새로 태어나는 개체의 초기 에너지
        
        this.gen = 0;
        
        this.growLevel1 = 90;
        this.growLevel2 = 80;
        
        this.energyEfficiency = 1.5;
        this.moveSpendEnergy = 0.5;
        this.allowSameSpecies = 36; // 시야 영역 내에 허용되는 동족 개체수, 초과되면 번식하지 않음
        this.init();
    }
    
    action() {
        super.action();

        if (this.foodTile.length <= 0) {
            const randomPosition = this.directions.getDirectionRandom(this.nearbyTiles);
            this.move(randomPosition?.x, randomPosition?.y);
            return;
        }

        if (this.energy <= this.needFood && this.foodTile.length > this.preylimit) {
            this.foodTile.sort((a, b) => {
                const aDistance = Math.sqrt(Math.pow(a.x - this.position.x, 2) + Math.pow(a.y - this.position.y, 2));
                const bDistance = Math.sqrt(Math.pow(b.x - this.position.x, 2) + Math.pow(b.y - this.position.y, 2));
                return aDistance - bDistance;
            });

            const toPosition = this.directions.getDirectionToTarget(this.foodTile[0]);

            this.move(toPosition?.x, toPosition?.y);
            this.addActionPeriod -= this.hungryMoveSpeed;
            return;
        }

        if (this.predator.length > 0) {
            this.predator
                .filter((tile) => tile?.content?.size >= this.size)
                .sort((a, b) => {
                    const aDistance = Math.sqrt(Math.pow(a.x - this.position.x, 2) + Math.pow(a.y - this.position.y, 2));
                    const bDistance = Math.sqrt(Math.pow(b.x - this.position.x, 2) + Math.pow(b.y - this.position.y, 2));
                    return aDistance - bDistance;
                });

            const awayPosition = this.directions.getDirectionToTargetAway(this.predator[0]);

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

        if (this.energy > this.procreationEnergy && this.postpartumcCare <= 0) {
            this.giveBirth();
            return;
        }
    }
}