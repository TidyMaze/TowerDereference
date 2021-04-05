declare function readline(): string;

class Coord {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

class Tower {
    towerType: string
    towerId: number
    owner: number
    x: number
    y: number
    damage: number
    range: number
    reload: number
    coolDown: number

    constructor(towerType: string,
        towerId: number,
        owner: number,
        x: number,
        y: number,
        damage: number,
        range: number,
        reload: number,
        coolDown: number) {
        this.towerType = towerType
        this.towerId = towerId
        this.owner = owner
        this.x = x
        this.y = y
        this.damage = damage
        this.range = range
        this.reload = reload
        this.coolDown = coolDown
    }
}

const playerId: number = parseInt(readline());
var inputs: string[] = readline().split(' ');
const width: number = parseInt(inputs[0]);
const height: number = parseInt(inputs[1]);

var mapWalkable: boolean[][] = [];

for (let i = 0; i < height; i++) {
    const line: string = readline();
    mapWalkable.push(line.split('').map(c => c == '.'))
}

function showMap(map: boolean[][]) {
    return map.map(l => l.map(c => c ? '.' : '#').join("")).join("\n")
}

console.error(showMap(mapWalkable))

let center = new Coord(
    Math.floor(mapWalkable[0].length / 2),
    Math.floor(mapWalkable.length / 2)
)

console.error(center)

function distance(from: Coord, to: Coord) {
    return Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2)
}

function byClosestWalkableOrDistance(mapWalkable: boolean[][], coveredMap: boolean[][], to: Coord): (a: Coord, b: Coord) => number {
    return function (a: Coord, b: Coord): number {
        let da = coveredWalkable(mapWalkable, coveredMap, a)
        let db = coveredWalkable(mapWalkable, coveredMap, b)

        if (da == db) {
            return distance(a, to) - distance(b, to)
        } else {
            return db - da
        }
    }
}

function isWalkable(mapWalkable: boolean[][]): (c: Coord) => boolean {
    return function (c: Coord) {
        return mapWalkable[c.y][c.x]
    }
}

function not<T>(f: (_: T) => boolean): ((_: T) => boolean) {
    return function (a: T): boolean {
        return !f(a)
    }
}

function and<T>(f1: (_: T) => boolean, f2: (_: T) => boolean): (_: T) => boolean {
    return function (a: T): boolean {
        return f1(a) && f2(a)
    }
}

function availableTower(towers: Tower[]): (c: Coord) => boolean {
    return function (c: Coord) {
        return !towers.some(t => t.x == c.x && t.y == c.y)
    }
}

function closestWalkableDistance(mapWalkable: boolean[][], c: Coord): number {
    let allCoords: Coord[] = []
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            allCoords.push(new Coord(j, i))
        }
    }

    let distances = allCoords
        .filter(isWalkable(mapWalkable))
        .map(c2 => distance(c, c2))

    return Math.min(...distances)
}

function makeCoveredMap(playerId: number, towers: Tower[]){
    let map: boolean[][] = []
    for (let i = 0; i < height; i++) {
        let row = []
        for (let j = 0; j < width; j++) {
            row.push(false)
        }
        map.push(row)
    }

    towers.forEach(t => {
        if(t.owner == playerId){
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    if(distance(new Coord(t.x, t.y), new Coord(j, i)) <= 3){
                        map[i][j] = true
                    }
                }
            }
        }
    })

    return map
}

function coveredWalkable(mapWalkable: boolean[][], coveredMap: boolean[][], c: Coord): number {
    let covered: Coord[] = []
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let dest = new Coord(j, i)
            if (isWalkable(mapWalkable)(dest) && distance(c, dest) <= 3 && !coveredMap[i][j]) {
                covered.push(dest)
            }
        }
    }

    return covered.length
}

let allCoords: Coord[] = []
for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
        allCoords.push(new Coord(j, i))
    }
}

while (true) {
    var inputs: string[] = readline().split(' ');
    const myMoney: number = parseInt(inputs[0]);
    const myLives: number = parseInt(inputs[1]);
    var inputs: string[] = readline().split(' ');
    const opponentMoney: number = parseInt(inputs[0]);
    const opponentLives: number = parseInt(inputs[1]);
    const towerCount: number = parseInt(readline());

    let towers: Tower[] = []

    for (let i = 0; i < towerCount; i++) {
        var inputs: string[] = readline().split(' ');
        const towerType: string = inputs[0];
        const towerId: number = parseInt(inputs[1]);
        const owner: number = parseInt(inputs[2]);
        const x: number = parseInt(inputs[3]);
        const y: number = parseInt(inputs[4]);
        const damage: number = parseInt(inputs[5]);
        const range: number = parseFloat(inputs[6]);
        const reload: number = parseInt(inputs[7]);
        const coolDown: number = parseInt(inputs[8]);
        towers.push(new Tower(towerType, towerId, owner, x, y, damage, range, reload, coolDown))
    }


    const attackerCount: number = parseInt(readline());
    for (let i = 0; i < attackerCount; i++) {
        var inputs: string[] = readline().split(' ');
        const attackerId: number = parseInt(inputs[0]);
        const owner: number = parseInt(inputs[1]);
        const x: number = parseFloat(inputs[2]);
        const y: number = parseFloat(inputs[3]);
        const hitPoints: number = parseInt(inputs[4]);
        const maxHitPoints: number = parseInt(inputs[5]);
        const currentSpeed: number = parseFloat(inputs[6]);
        const maxSpeed: number = parseFloat(inputs[7]);
        const slowTime: number = parseInt(inputs[8]);
        const bounty: number = parseInt(inputs[9]);
    }

    let coveredMap = makeCoveredMap(playerId, towers)

    let walkableByDistanceToCenter =
        allCoords
            .filter(
                and(
                    not(isWalkable(mapWalkable)),
                    availableTower(towers)
                )
            )
            .sort(byClosestWalkableOrDistance(mapWalkable, coveredMap, center))

    console.error(walkableByDistanceToCenter)

    let best = walkableByDistanceToCenter[0]

    console.log(`BUILD ${best.x} ${best.y} GUNTOWER`);
}
