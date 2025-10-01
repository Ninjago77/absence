import kaplay, {GameObj} from "kaplay";
import "kaplay/global";

kaplay();

loadRoot("https://raw.githubusercontent.com/Ninjago77/absence/main/assets/");
// loadRoot("./assets/");



loadSprite("grass", "Sprout Lands Assets/Tilesets/Grass.png", {
    sliceX: 11,
    sliceY: 7,
    anims: (() => {
        let l: { [key: string]: { from: number, to: number, loop: boolean } } = {};
        for (let i = 0; i <= 77; i++) {
            l["t"+i] = {from: i, to: i, loop: false};
        }
        return l;
    })()
});

let grassTiles : { [key: string]: string[] } = {
    "0000": ["t76"],
    "0001": ["t0"],
    "0011": ["t1"],
    "0010": ["t2"],
    "1001": ["t9"],
    "0101": ["t11"],
    "1010": ["t13"],
    "1110": ["t16"],
    "1101": ["t17"],
    "0110": ["t20"],
    "0100": ["t22"],
    "1100": ["t23"],
    "1000": ["t24"],
    "1011": ["t27"],
    "0111": ["t28"],
    // TODO: change these to more tiles later
    "1111": ["t12", "t55", "t56", "t57", "t58", "t59", "t66", "t67", "t68", "t69", "t70", "t71"],
};

loadSprite("dungeon", "Dungeon Assets/character and tileset/Dungeon_Tileset.png", {
    sliceX: 10,
    sliceY: 10,
        // TODO: dungeon random anim
    anims: (() => {
        let l: { [key: string]: { from: number, to: number, loop: boolean } } = {};
        for (let i = 0; i <= 99; i++) {
            l["t"+i] = {from: i, to: i, loop: false};
        }
        return l;
    })()
});
let dungeonTiles: { [key: string]: string[] } = {
    // "1111": ["t6", "t7", "t8", "t9", "t11", "t12", "t13", "t14", "t21", "t22", "t23", "t24", "t31", "t32", "t33", "t34", "t60", "t61", "t62", "t63"],
    // "1111": ["t70", "t71", "t72"],
    // "0101": ["t0", "t10", "t20", "t30"],
    // "0001": ["t0", "t10", "t20", "t30"],
    // "1010": ["t5", "t15", "t25", "t35"],
    // "0010": ["t5", "t15", "t25", "t35"],
    // "1011": ["t1", "t2", "t3", "t4"],
    // "0111": ["t1", "t2", "t3", "t4"],
    // "0011": ["t1", "t2", "t3", "t4"],
    // "1100": ["t41", "t42", "t43", "t44", "t51", "t52"],
    // "0100": ["t40"],
    // "1000": ["t45"],
    // "1110": ["t50", "t54"],
    // "1101": ["t53", "t55"],
    // // TODO:  change these to more tiles later
    // "0110": ["t99"],
    // "1001": ["t99"],
    // "0000": ["t78"]

    "1111": ["t22", "t23"],
    "0001": ["t11"],
    "0011": ["t12", "t13"],
    "0010": ["t14"],
    //
};

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

const WIDTH_IN_TILES = 40;
const HEIGHT_IN_TILES = 20;
let WORLD_REDUCED = generatePerlinBinary(WIDTH_IN_TILES-1, HEIGHT_IN_TILES-1, 0.4, 0, false);
let WORLD: string[][] = [];
for (let y = 0; y < (HEIGHT_IN_TILES-1) + 1; y++) {
    const row: string[] = [];
    for (let x = 0; x < (WIDTH_IN_TILES-1) + 1; x++) {
        const tl = (y - 1 >= 0 && x - 1 >= 0 && WORLD_REDUCED[y - 1][x - 1]) ? 1 : 0;
        const tr = (y - 1 >= 0 && x < (WIDTH_IN_TILES-1) && WORLD_REDUCED[y - 1][x]) ? 1 : 0;
        const bl = (y < (HEIGHT_IN_TILES-1) && x - 1 >= 0 && WORLD_REDUCED[y][x - 1]) ? 1 : 0;
        const br = (y < (HEIGHT_IN_TILES-1) && x < (WIDTH_IN_TILES-1) && WORLD_REDUCED[y][x]) ? 1 : 0;
        let val = "" + tl + tr + bl + br;
        if (val === "0110") {
            row.push("1001");
        } else if (val === "1001") {
            row.push("0110");
        } else {
            row.push(val);
        }
    }
    WORLD.push(row);
}

for (let y = 0; y < HEIGHT_IN_TILES; y++) {
    for (let x = 0; x < WIDTH_IN_TILES; x++) {
        let chosenAnim = grassTiles[WORLD[y][x]][Math.floor(Math.random()*grassTiles[WORLD[y][x]].length)];
        add([
            sprite("grass", {anim: chosenAnim}),
            pos(x*32, y*32),
            layer("bg"),
            scale(2),
            fixed(),
            "tile"
        ]);
    }
}

console.log(WORLD_REDUCED);
console.log(WORLD);






