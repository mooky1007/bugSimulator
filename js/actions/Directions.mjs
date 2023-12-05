export class Directions {
    constructor(parent) {
        this.parent = parent;
    }

    get position() {
        return this.parent.position;
    }

    getDirectionRandom(adjacentTiles) {
        if (!adjacentTiles) return false;

        const emptyNearTiles = adjacentTiles.filter((tile) => tile?.content === null);
        if (emptyNearTiles.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyNearTiles.length);
            const { x, y } = emptyNearTiles[randomIndex];
            return { x, y };
        } else {
            return false;
        }
    }

    getDirectionToTarget(target) {
        if (!target) return false;

        const { x, y } = this.position;
        const { x: targetX, y: targetY } = target;
        const diffX = targetX - x;
        const diffY = targetY - y;

        if (diffX > 0) {
            if (diffY > 0) {
                return { x: x + 1, y: y + 1 };
            } else if (diffY < 0) {
                return { x: x + 1, y: y - 1 };
            } else {
                return { x: x + 1, y };
            }
        } else if (diffX < 0) {
            if (diffY > 0) {
                return { x: x - 1, y: y + 1 };
            } else if (diffY < 0) {
                return { x: x - 1, y: y - 1 };
            } else {
                return { x: x - 1, y };
            }
        } else {
            if (diffY > 0) {
                return { x, y: y + 1 };
            } else if (diffY < 0) {
                return { x, y: y - 1 };
            }
        }
    }

    getDirectionToTargetAway(target) {
        if (!target) return false;

        const { x, y } = this.position;
        const { x: targetX, y: targetY } = target;
        const diffX = targetX - x;
        const diffY = targetY - y;

        if (diffX > 0) {
            if (diffY > 0) {
                return { x: x - 1, y: y - 1 };
            } else if (diffY < 0) {
                return { x: x - 1, y: y + 1 };
            } else {
                return { x: x - 1, y };
            }
        } else if (diffX < 0) {
            if (diffY > 0) {
                return { x: x + 1, y: y - 1 };
            } else if (diffY < 0) {
                return { x: x + 1, y: y + 1 };
            } else {
                return { x: x + 1, y };
            }
        } else {
            if (diffY > 0) {
                return { x, y: y - 1 };
            } else if (diffY < 0) {
                return { x, y: y + 1 };
            }
        }
    }
}
