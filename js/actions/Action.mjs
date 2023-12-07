export class Action {
    constructor(object) {
        this.object = object;
        this.modeChecker = false;
    }

    food() {
        if (this.findFood()) return true;
        if (this.moveToFood()) return true;
    }

    evasion() {
        if (this.runAwayFromPredator()) return true;
        if (this.runAwayFromSameSpecies()) return true;
    }

    species() {
        if (this.giveBirth()) return true;
    }

    findFood() {
        if (this.object.foodTile.length <= this.object.preylimit) {
            const randomPosition = this.object.directions.getDirectionRandom(this.object.adjacentTiles);
            this.object.move(randomPosition?.x, randomPosition?.y);
            if (this.modeChecker) this.object.className = 'find_food';
            return true;
        }
        return false;
    }

    moveToFood() {
        if (this.object.energy <= this.object.needFood && this.object.foodTile.length > this.object.preylimit) {
            this.object.foodTile.sort((a, b) => {
                const aDistance = Math.sqrt(Math.pow(a.x - this.object.position.x, 2) + Math.pow(a.y - this.object.position.y, 2));
                const bDistance = Math.sqrt(Math.pow(b.x - this.object.position.x, 2) + Math.pow(b.y - this.object.position.y, 2));

                if (aDistance > 2 && bDistance > 2) {
                    return b.content.size - a.content.size || b.content.energy - a.content.energy;
                }

                return aDistance - bDistance;
            });

            const toPosition = this.object.directions.getDirectionToTarget(this.object.foodTile[0]);

            this.object.move(toPosition?.x, toPosition?.y);
            this.object.addActionPeriod -= this.object.hungryMoveSpeed;

            if (this.modeChecker) this.object.className = 'move_to_food';
            return true;
        }
        return false;
    }

    runAwayFromPredator() {
        if (this.object.predator.length > 0) {
            this.object.predator
                .filter((tile) => tile?.content?.size >= this.object.size)
                .sort((a, b) => {
                    const aDistance = Math.sqrt(Math.pow(a.x - this.object.position.x, 2) + Math.pow(a.y - this.object.position.y, 2));
                    const bDistance = Math.sqrt(Math.pow(b.x - this.object.position.x, 2) + Math.pow(b.y - this.object.position.y, 2));
                    return aDistance - bDistance;
                });

            const awayPosition = this.object.directions.getDirectionToTargetAway(this.object.predator[0]);

            this.object.move(awayPosition?.x, awayPosition?.y);
            if (this.modeChecker) this.object.className = 'run_away_from_predator';
            return true;
        }
        return false;
    }

    runAwayFromSameSpecies() {
        if (this.object.territory.length > this.object.allowSameSpecies) {
            this.object.territory
                .filter((tile) => tile?.content?.size >= this.object.size)
                .sort((a, b) => {
                    const aDistance = Math.sqrt(Math.pow(a.x - this.object.position.x, 2) + Math.pow(a.y - this.object.position.y, 2));
                    const bDistance = Math.sqrt(Math.pow(b.x - this.object.position.x, 2) + Math.pow(b.y - this.object.position.y, 2));
                    return aDistance - bDistance;
                });

            const awayPosition = this.object.directions.getDirectionToTargetAway(this.object.territory[0]);

            this.object.move(awayPosition?.x, awayPosition?.y);
            if (this.modeChecker) this.object.className = 'run_away_from_same_species';
            return true;
        }
        return false;
    }

    giveBirth() {
        if (this.object.lifeSpan <= this.object.defaultLifeSpan * 0.05 && this.object.energy > this.object.procreationEnergy) {
            this.object.giveBirth();
            return true;
        }

        if (
            this.object.energy > this.object.procreationEnergy &&
            this.object.postpartumcCare <= 0 &&
            this.object.foodTile.length > this.object.preylimit
        ) {
            this.object.giveBirth();
            this.object.className = 'give_birth';
            return true;
        }
        return false;
    }
}
