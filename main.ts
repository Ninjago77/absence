import kaplay, {GameObj} from "kaplay";
import "kaplay/global";
kaplay();
const startTime = Date.now(); 
// import kaboom, {GameObj} from "kaboom";
// import "kaboom/global";
// kaboom({});

// const SCREEN_WIDTH = 1600;
// const SCREEN_HEIGHT = 1344;
const FPS = 60;
let speed = 4;
var facing = "idle";
let gundist = 32;
let bSize = 16;
let gunIndex = 0;
let anglediffmagnitude = 2;
let size = 32;
let bulletLoaded = false;
let angleOffset = 3;
var activeBullets: GameObj[] = [];
var activeCows: GameObj[] = [];
var activeChickens: GameObj[] = [];
var activeEggs: GameObj[] = [];
let gameover = false;
let cows_spawn_list_per_seconds = [
    1,2,5,7,10,,13,15,16,20,,22,25,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50
];
let chickens_spawn_list_per_seconds = [
    5,10,15,20,25,30,35,40,45,50
]

let textSave = add([

]);
let textLost = add([
    text("Eggs Lost: 0", { size: size }),
    pos(width()-size , size/2),
    anchor("topright"),
    color(255, 255, 255),
    z(100),
]);

let textSaved = add([
    text("Eggs Saved: 0", { size: size }),
    pos(width()-size , size*2),
    anchor("topright"),
    color(255, 255, 255),
    z(100),
]);

let textMain = add([
    text("Absence - Loss of the Chickens", { size: size }),
    pos(size/2 , size/2),
    anchor("topleft"),
    color(255, 255, 255),
    z(100),
]);



let relaodFractionsTime = 0; // 0.25 means 1/4 seconds to reload
let reloadMagnitude = FPS / 6; // 1 second to reload
// const w = width() / SCREEN_WIDTH;
// const h = height() / SCREEN_HEIGHT;
setBackground(150, 150, 225);
// setCamScale(new Vec2(Math.min(h, w),Math.min(h, w)));
// setCamPos(width() / 2, height() / 2);

// function posify(x: number, y: number) {
//     // return pos(x,y)
//     return pos(x + ((width() - SCREEN_WIDTH) / 2), y + ((height() - SCREEN_HEIGHT) / 2))
// }

// function inversePosify(x: number, y: number) {
//     return vec2(x - ((SCREEN_WIDTH - width()) / 2), y - ((SCREEN_HEIGHT - width()) / 2));
// }

function isInside<T>(item: T, array: T[]): boolean {
    return array.indexOf(item) > -1; 
}

function linkload(text: string) {
    return "https://raw.githubusercontent.com/Ninjago77/absence/main/assets/"+text;
}

loadSprite("player", linkload("Characters/Basic Charakter Spritesheet.png"), {
    sliceX: 4,
    sliceY: 4,
    anims: {
        "up": { from: 0, to: 3, loop: true, speed: 10 },
        "down": { from: 4, to: 7, loop: true, speed: 10 },
        "left": { from: 8, to: 11, loop: true, speed: 10 },
        "right": { from: 12, to: 15, loop: true, speed: 10 },
        "idle": { from: 0, to: 0, loop: false, speed: 10 },
    }
});

// Guns
loadSprite("gun0", linkload("Guns/Luger.png"));              // Luger
loadSprite("gun1", linkload("Guns/M92.png"));                // M92
loadSprite("gun2", linkload("Guns/MP5.png"));                // MP5
loadSprite("gun3", linkload("Guns/M15.png"));                // M15
loadSprite("gun4", linkload("Guns/AK47.png"));               // AK47
loadSprite("gun5", linkload("Guns/SawedOffShotgun.png"));    // Shotgun
loadSprite("gun6", linkload("Guns/Revolver.png"));           // Revolver
loadSprite("gun7", linkload("Guns/M24.png"));                // M24

// Bullets (matched correctly)
loadSprite("gun0B", linkload("Bullets/PistolAmmoSmall.png")); // Luger
loadSprite("gun1B", linkload("Bullets/PistolAmmoSmall.png")); // M92
loadSprite("gun2B", linkload("Bullets/PistolAmmoSmall.png")); // MP5
loadSprite("gun3B", linkload("Bullets/RifleAmmoSmall.png"));  // M15
loadSprite("gun4B", linkload("Bullets/RifleAmmoBig.png"));    // AK47
loadSprite("gun5B", linkload("Bullets/ShotgunShellBig.png")); // Shotgun
loadSprite("gun6B", linkload("Bullets/PistolAmmoBig.png"));   // Revolver
loadSprite("gun7B", linkload("Bullets/RifleAmmoBig.png"));    // M24


var guns = ["gun0","gun1","gun2","gun3","gun4","gun5","gun6","gun7"];

loadSprite("cow", linkload("Characters/Free Cow Sprites.png"), {
    sliceX: 3,
    sliceY: 2,
    anims: {
        "idle": { from: 0, to: 2, loop: true, speed: 5,},
        "walkright": { from: 3, to: 4, loop: true, speed: 5 },
    }
});

loadSprite("chicken", linkload("Characters/Free Chicken Sprites.png"), {
    sliceX: 4,
    sliceY: 2,
    anims: {
        "idle": { from: 0, to: 1, loop: true, speed: 5 },
        "walkright": { from: 4, to: 7, loop: true, speed: 5 },
    }
});

loadSprite("egg", linkload("Characters/Egg_And_Nest.png"), {
    sliceX: 4,
    sliceY: 1,
    anims: {
        "egg": { from: 0, to: 0, loop: false},
        "eggnest": { from: 2, to: 2, loop: false},
        "nest": { from: 3, to: 3, loop: false},
    }
});

var player = add([
    sprite("player"),
    pos(width()/2, height()/2),
    scale(4),
    anchor("center"),
    area(),
    z(20),
    "player",
    {
        anim: "idle",
    }
]);

for (let i = 0; i < 6; i++) {
    // column: 0 = above, 1 = below
    let column = i % 2 === 0 ? -1 : 1;

    // row offset: 0, 1, 2 (stack of 3)
    let row = Math.floor(i / 2);

    let egg = add([
        sprite("egg", { anim: "eggnest" }),
        pos(player.pos.x, player.pos.y + column * size * 2 * (row + 1)),
        anchor("center"),
        area(),
        scale(4),
        z(0), { nice: "eggnest" }
    ]);

    activeEggs.push(egg);
}

var gun = add([
    sprite("gun0"),
    pos(player.pos.x + gundist, player.pos.y),
    scale(4),
    anchor("left"),
    "gun",
    rotate(0),
]);

loop(1/FPS, () => {
    if (gameover) { return; }
    gunIndex = gunIndex % guns.length;
    let MPos = mousePos();
    if (relaodFractionsTime > 0) {
        relaodFractionsTime -= 1;
    } else {
        relaodFractionsTime = 0;
    }
    if (facing === "up" && player.pos.y > 0 + size) {
        player.pos.y -= speed;
    } else if (facing === "down" && player.pos.y < height() - size) {
        player.pos.y += speed;
    } else if (facing === "left" && player.pos.x > 0 + size) {
        player.pos.x -= speed;
    } else if (facing === "right" && player.pos.x < width() - size) {
        player.pos.x += speed;
    }
    if (facing != "idle" && player.curAnim() != facing) {
        player.play(facing);
        player.anim = facing;
    } else if (facing === "idle" && player.curAnim() != "idle") {
        player.play("idle");
        player.anim = "idle";
    }
    MPos.y -5;
    let angle = Math.atan2(MPos.y - player.pos.y, MPos.x - player.pos.x);
    gun.pos.x = player.pos.x + Math.cos(angle) * gundist;
    gun.pos.y = player.pos.y + Math.sin(angle) * gundist;
    gun.angle = angle * (180 / Math.PI) + angle;

    if (bulletLoaded == true) {
        bulletLoaded = false;
        var bulletSprite = "gun"+gunIndex+"B";
        var bullet = add([
            sprite(bulletSprite),
            pos(gun.pos.x + Math.cos(angle) * bSize, gun.pos.y + Math.sin(angle) * bSize),
            scale(2),
            anchor("center"),
            rotate(gun.angle - angleOffset + (((Math.random()*2)-1) * anglediffmagnitude * (guns.length - gunIndex) )),
            "bullet",
            z(11),
            area( ),
            { index : gunIndex }
        ]);
        activeBullets.push(bullet);        
    }
    let time = (Date.now() - startTime)/1000;

    if (isInside(Math.floor(time), cows_spawn_list_per_seconds) || (time > 60000 && Math.random() < 0.1)) {
        cows_spawn_list_per_seconds.splice(cows_spawn_list_per_seconds.indexOf(Math.floor(time)), 1);
        let is_left = Math.random() < 0.5;
        let p = pos(is_left ? 0 : width(), Math.random() * height());
        var cow = add([
            sprite("chicken", {
                anim: "walkright",
                flipX: is_left ? false : true,
            }),
            p,
            scale(4),
            anchor("center"),
            "cow",
            {
                is_left: is_left,
                hp: 100,
                negbar: add([
                    rect(size*2, size/2, { radius: 4 }),
                    pos(p.pos.x, p.pos.y - size/2),
                    color(255, 100, 100),
                    anchor("bot"),
                    "hpbar",
                ]),
                posbar: add([
                    rect(size*2, size/2, { radius: 4 }),
                    pos(p.pos.x, p.pos.y - size/2),
                    color(100, 255, 100),
                    anchor("bot"),
                    "hpbar",
                    z(10),
                ]),
            },
            area( ),
        ]);
        activeCows.push(cow);
    }
    for (var i = 0; i < activeBullets.length; i++) {
        var b = activeBullets[i];
        b.pos.x += Math.cos(b.angle * (Math.PI / 180)) * bSize;
        b.pos.y += Math.sin(b.angle * (Math.PI / 180)) * bSize;
        if (b.pos.x < 0 - bSize || b.pos.x > width() + bSize || b.pos.y < 0 - bSize || b.pos.y > height() + bSize) {
            destroy(b);
            activeBullets.splice(i, 1);
            i--;
        }
    }
    for (var i = 0; i < activeCows.length; i++) {
        var c = activeCows[i];
        if (c.is_left) {
            c.pos.x += speed/4;
            if (c.pos.x > width() + size) {
                destroy(c);
                activeCows.splice(i, 1);
                i--;
            }
        } else {
            c.pos.x -= speed/4;
            if (c.pos.x < 0 - size) {
                destroy(c);
                activeCows.splice(i, 1);
                i--;
            }
        }
        for (var j = 0; j < activeBullets.length; j++) {
            var b = activeBullets[j];
            if (c.isColliding(b)) {
                console.log("hit");
                c.hp -= ((b.index+1)/(guns.length)) * 100;
                console.log(c.hp);
                destroy(b);
                activeBullets.splice(j, 1);
                j--;
                if (c.hp <= 0) {
                    destroy(c);
                    destroy(c.negbar);
                    destroy(c.posbar);
                    activeCows.splice(i, 1);
                    i--;
                    break;

                }
            }
        }
        c.posbar.width = (c.hp/100) * (size*2);
        c.negbar.pos.x = c.pos.x;
        c.posbar.pos.x = c.pos.x;

    }
    for (var j = 0; j < activeEggs.length; j++) {
        var egg = activeEggs[j];
        console.log(egg.nice);
        for (var i = 0; i < activeCows.length; i++) {
            var c = activeCows[i];
            if (egg.isColliding(c) && egg.nice != "nest") {
                egg.play("nest");
                egg.nice = "nest";
                textLost.text = "Eggs Lost: " + (parseInt(textLost.text.split(": ")[1]) + 1);
            }
        }
    }
});

onKeyDown(["w","up"], () => {
    facing = "up";
});
onKeyDown(["a","left"], () => {
    facing = "left";
});
onKeyDown(["s","down"], () => {
    facing = "down";
});
onKeyDown(["d","right"], () => {
    facing = "right";
});
onKeyRelease(["w","a","s","d","up", "left", "down", "right"], () => {
    facing = "idle";
}
);

onClick(() => {
    if (relaodFractionsTime <= 0) {
        bulletLoaded = true;
        relaodFractionsTime = reloadMagnitude*gunIndex;
    }

});

onScroll((delta) => {
    console.log("scrolled");
    console.log();
    gunIndex += Math.sign(delta.y);
    gunIndex = gunIndex % guns.length;
    if (gunIndex >= 0 && gunIndex < guns.length) {gun.sprite = guns[gunIndex % guns.length];}
});






