// import kaplay from "kaplay";
// import "kaplay/global";
// kaplay();
import kaboom, {GameObj} from "kaboom";
import "kaboom/global";
kaboom({});

const SCREEN_WIDTH = 1600;
const SCREEN_HEIGHT = 1344;

const w = width() / SCREEN_WIDTH;
const h = height() / SCREEN_HEIGHT;
setBackground(0, 0, 0);
camScale(new Vec2(Math.min(h, w),Math.min(h, w)));
camPos(width() / 2, height() / 2);

function posify(x: number, y: number) {
    // return pos(x,y)
    return pos(x + ((width() - SCREEN_WIDTH) / 2), y + ((height() - SCREEN_HEIGHT) / 2))
}

function isInside<T>(item: T, array: T[]): boolean {
    return array.indexOf(item) > -1; 
}

add([
    rect(SCREEN_WIDTH, SCREEN_HEIGHT),
    posify(0, 0),
    color(255, 0, 0),
    z(-100),
]);


function linkload(text: string) {
    return "https://raw.githubusercontent.com/Ninjago77/absence/main/assets/"+text;

}

function strTo3x3(text: string): number[][] {
    let list: number[][] = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            list[i][j] = parseInt(text.charAt(i * 3 + j));
        }
    }
    return list;
}

function T3x3Tostr(list: number[][]): string {
    let text = "";
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            text += list[i][j];
        }
    }
    return text;

}

const GRASS_ANIMS = {
    "000011011": { "from": 0, "to": 0, "loop": false },
    "000111111": { "from": 1, "to": 1, "loop": false },
    "000110110": { "from": 2, "to": 2, "loop": false },
    "000010010": { "from": 3, "to": 3, "loop": false },
    "000011010": { "from": 4, "to": 4, "loop": false },
    "000111110": { "from": 5, "to": 5, "loop": false },
    "000111011": { "from": 6, "to": 6, "loop": false },
    "000110010": { "from": 7, "to": 7, "loop": false },
    "000111010": { "from": 8, "to": 8, "loop": false },
    "110111011": { "from": 9, "to": 9, "loop": false },
    
    "011011011": { "from": 11, "to": 11, "loop": false },
    "111111111": { "from": 12, "to": 12, "loop": false },
    "110110110": { "from": 13, "to": 13, "loop": false },
    "010010010": { "from": 14, "to": 14, "loop": false },
    "011011010": { "from": 15, "to": 15, "loop": false },
    "111111110": { "from": 16, "to": 16, "loop": false },
    "111111011": { "from": 17, "to": 17, "loop": false },
    "110110010": { "from": 18, "to": 18, "loop": false },
    "111111010": { "from": 19, "to": 19, "loop": false },
    "011111110": { "from": 20, "to": 20, "loop": false },
    
    "011011000": { "from": 22, "to": 22, "loop": false },
    "111111000": { "from": 23, "to": 23, "loop": false },
    "110110000": { "from": 24, "to": 24, "loop": false },
    "010010000": { "from": 25, "to": 25, "loop": false },
    "010011011": { "from": 26, "to": 26, "loop": false },
    "110111111": { "from": 27, "to": 27, "loop": false },
    "011111111": { "from": 28, "to": 28, "loop": false },
    "010110110": { "from": 29, "to": 29, "loop": false },
    "010111111": { "from": 30, "to": 30, "loop": false },
    "010111011": { "from": 31, "to": 31, "loop": false },
    "010111110": { "from": 32, "to": 32, "loop": false },
    "000011000": { "from": 33, "to": 33, "loop": false },
    "000111000": { "from": 34, "to": 34, "loop": false },
    "000110000": { "from": 35, "to": 35, "loop": false },
    "000010000": { "from": 36, "to": 36, "loop": false },
    "010011000": { "from": 37, "to": 37, "loop": false },
    "110111000": { "from": 38, "to": 38, "loop": false },
    "011111000": { "from": 39, "to": 39, "loop": false },
    "010110000": { "from": 40, "to": 40, "loop": false },
    "010111000": { "from": 41, "to": 41, "loop": false },
    "011111010": { "from": 42, "to": 42, "loop": false },
    "110111010": { "from": 43, "to": 43, "loop": false },
    
    "010011010": { "from": 48, "to": 48, "loop": false },
    "110111110": { "from": 49, "to": 49, "loop": false },
    "011111011": { "from": 50, "to": 50, "loop": false },
    "010110010": { "from": 51, "to": 51, "loop": false },
    "010111010": { "from": 52, "to": 52, "loop": false },

    "000000000": { "from": 76, "to": 76, "loop": false },
}


loadSprite("grass", linkload("Tilesets/Grass.png"), {
    sliceX: 11, // how many sprites are in the X axis
    sliceY: 7, // how many sprites are in the Y axis
    anims: GRASS_ANIMS,
});

// --- Simple seeded RNG ---
function mulberry32(a: number): () => number {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// --- Perlin Noise Implementation ---
class Perlin {
    private perm: number[];

    constructor(seed = Math.random() * 10000) {
        this.perm = new Array(512);
        const p = new Array(256);

        for (let i = 0; i < 256; i++) p[i] = i;

        let rng = mulberry32(Math.floor(seed));
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }

        for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
    }

    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private lerp(a: number, b: number, t: number): number {
        return a + t * (b - a);
    }

    private grad(hash: number, x: number, y: number): number {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x: number, y: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);

        const u = this.fade(xf);
        const v = this.fade(yf);

        const aa = this.perm[X + this.perm[Y]];
        const ab = this.perm[X + this.perm[Y + 1]];
        const ba = this.perm[X + 1 + this.perm[Y]];
        const bb = this.perm[X + 1 + this.perm[Y + 1]];

        const x1 = this.lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u);
        const x2 = this.lerp(this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1), u);

        return (this.lerp(x1, x2, v) + 1) / 2;
    }
}

// --- Binary Map Generator ---
function generatePerlinBinary(width: number, height: number, fullness: number, scale = 0, fractal = false): number[][] {
    if (fullness <= 0) return Array.from({ length: height }, () => Array(width).fill(0));
    if (fullness >= 1) return Array.from({ length: height }, () => Array(width).fill(1));

    const perlin = new Perlin();

    if (scale <= 0) scale = Math.max(width, height) / 8; // auto-adjust if not provided

    const values: number[] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let noiseVal: number;
            if (!fractal) {
                noiseVal = perlin.noise(x / scale, y / scale);
            } else {
                let total = 0;
                let frequency = 1;
                let amplitude = 1;
                let maxValue = 0;
                for (let octave = 0; octave < 4; octave++) {
                    total += perlin.noise((x / scale) * frequency, (y / scale) * frequency) * amplitude;
                    maxValue += amplitude;
                    amplitude *= 0.5;
                    frequency *= 2;
                }
                noiseVal = total / maxValue;
            }
            values.push(noiseVal);
        }
    }

    const sorted = [...values].sort((a, b) => a - b);
    const cutoff = sorted[Math.floor((1 - fullness) * sorted.length)];

    const grid: number[][] = [];
    let idx = 0;
    for (let y = 0; y < height; y++) {
        const row: number[] = [];
        for (let x = 0; x < width; x++) {
            row.push(values[idx++] > cutoff ? 1 : 0);
        }
        grid.push(row);
    }

    return grid;
}

// --- Example usage ---
// const map = generatePerlinBinary(50, 50, 0.5, 0, true);
// console.log(map.map(r => r.join(" ")).join("\n"));


var WORLD_CORE;
const WORLD_WIDTH = 25;
const WORLD_HEIGHT = 19;
WORLD_CORE = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0],
    [0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0],
    [0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0],
    [1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
    [1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,0,0,1,1,0,0,1],
    [1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,0,0,1,1,0,0,1],
    [0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,0,0,1,1,0,0,1,0],
    [0,1,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,1,0,0,1,0,0],
    [0,1,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,1,0,0,1,0,0],
    [0,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,1,0,0],
    [0,0,0,0,0,1,1,1,0,0,1,1,0,0,0,0,0,1,1,0,0,1,0],
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,0,0,0,1,0],
    [0,1,0,0,0,1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,1,0],
    [0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
];
console.log(WORLD_CORE.map(r => r.join(" ")).join("\n"));
var WORLDx3: string[][] = [];
var WORLD_SPRITES: any[][] = [];
for (let i = 0; i < WORLD_HEIGHT; i++) {
    WORLDx3.push([]);
    WORLD_SPRITES.push([]);
}
for (let i = 0; i < WORLD_HEIGHT; i++) {
    for (let j = 0; j < WORLD_WIDTH; j++) {
        let cell = "";
        if (WORLD_CORE[i][j] == 1) {
            let core = strTo3x3("000010000");

            if (i > 0) {
                if (WORLD_CORE[i-1][j]) {
                    core[1][0] = 1;
                }
            }
            if (i < WORLD_HEIGHT-1) {
                if (WORLD_CORE[i+1][j]) {
                    core[1][2] = 1;
                }
            }
            if (j > 0) {
                if (WORLD_CORE[i][j-1]) {
                    core[0][1] = 1;
                }
            }
            if (j < WORLD_WIDTH-1) {
                if (WORLD_CORE[i][j+1]) {
                    core[2][1] = 1;
                }
            }

            if (i > 0 && j > 0) {
                if (WORLD_CORE[i-1][j-1]) {
                    core[0][0] = 1;
                }
            }
            if (i > 0 && j < WORLD_WIDTH-1) {
                if (WORLD_CORE[i-1][j+1]) {
                    core[2][0] = 1;
                }
            }
            if (i < WORLD_HEIGHT-1 && j > 0) {
                if (WORLD_CORE[i+1][j-1]) {
                    core[0][2] = 1;
                }
            }
            if (i < WORLD_HEIGHT-1 && j < WORLD_WIDTH-1) {
                if (WORLD_CORE[i+1][j+1]) {
                    core[2][2] = 1;
                }
            }
            cell = T3x3Tostr(core);
        } else {
            cell = "000000000";
        }
        WORLDx3[i][j] = cell;
    }
}


for (let i = 0; i < WORLD_HEIGHT; i++) {
    for (let j = 0; j < WORLD_WIDTH; j++) {
        if (isInside(WORLDx3[i][j], Object.keys(GRASS_ANIMS))) {
            WORLD_SPRITES[i][j] = add([
                sprite("grass", {anim: WORLDx3[i][j], frame: 0}),
                scale(8),
                posify(j * 64, i * 64),
                anchor("topleft"),
            ]);
        } else {
            console.log("Missing sprite for code: " + WORLDx3[i][j]);
        }
    }
}






