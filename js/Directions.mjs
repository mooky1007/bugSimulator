export class Directions {
    constructor(parent) {
        this.parent = parent;
    }

    get position() {
        return this.parent.position;
    }

    getDirectionRandom(nearbyTiles) {
        if (!nearbyTiles) return false;
        const emptyNearTiles = nearbyTiles.filter((tile) => tile?.content === null);
        if (emptyNearTiles.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyNearTiles.length);
            const { x, y } = emptyNearTiles[randomIndex];
            return { x, y };
        } else {
            return false;
        }
    }

    getDirectionToTarget(target) {
        const { x, y } = this.position;
        const { x: targetX, y: targetY } = target;
        const diffX = targetX - x;
        const diffY = targetY - y;

        if (diffX > 0) {
            return { x: x + 1, y };
        } else if (diffX < 0) {
            return { x: x - 1, y };
        } else if (diffY > 0) {
            return { x, y: y + 1 };
        } else if (diffY < 0) {
            return { x, y: y - 1 };
        }
    }

    getDirectionToTargetAway(target) {
        const { x, y } = this.position;
        const { x: targetX, y: targetY } = target;
        const diffX = targetX - x;
        const diffY = targetY - y;

        if (diffX > 0) {
            return { x: x - 1, y };
        } else if (diffX < 0) {
            return { x: x + 1, y };
        } else if (diffY > 0) {
            return { x, y: y - 1 };
        } else if (diffY < 0) {
            return { x, y: y + 1 };
        }
    }

    getDirectionToAround(target, range = 1) {
        console.log(`랜덤하게 타겟 주변을 배회 (멀어지지 않는다, 거리는 range 만큼)`);
        console.log(target, range)
        const { x, y } = this.position;
        const { x: targetX, y: targetY } = target;
        const diffX = targetX - x;
        const diffY = targetY - y;

        console.log(diffX, diffY)

        if (diffX > 0) {
            return { x: x + Math.floor(Math.random() * range), y };
        }
        if (diffX < 0) {
            return { x: x - Math.floor(Math.random() * range), y };
        }
        if (diffY > 0) {
            return { x, y: y + Math.floor(Math.random() * range) };
        }
        if (diffY < 0) {
            return { x, y: y - Math.floor(Math.random() * range) };
        }
    }
}
