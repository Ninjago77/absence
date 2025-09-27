import kaplay from "kaplay";
import "kaplay/global";
kaplay();
// import kaboom, {GameObj} from "kaboom";
// import "kaboom/global";
// kaboom({});

// const SCREEN_WIDTH = 1600;
// const SCREEN_HEIGHT = 1344;
const FPS = 60;
let size = 16*4;
let speed = 4;
var facing = "idle";
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

loadSprite("cow", linkload("Characters/Free Cow Sprites.png"), {
    sliceX: 3,
    sliceY: 2,
    anims: {
        "idle": { from: 0, to: 2, loop: true, speed: 5,},
        "walkright": { from: 3, to: 4, loop: true, speed: 5 },
    }
});

loadSprite("chicken", linkload("Characters/Free Chicken Sprites.png"), {
    sliceX: 3,
    sliceY: 2,
    anims: {
        "idle": { from: 0, to: 2, loop: true, speed: 5 },
        "walkright": { from: 3, to: 4, loop: true, speed: 5 },
    }
});


var player = add([
    sprite("player"),
    pos(width()/2, height()/2),
    scale(4),
    anchor("center"),
    "player",
    {
        anim: "idle",
    }
]);

loop(1/FPS, () => {
    let MPos = mousePos();
    if (facing === "up") {
        player.pos.y -= speed;
    } else if (facing === "down") {
        player.pos.y += speed;
    } else if (facing === "left") {
        player.pos.x -= speed;
    } else if (facing === "right") {
        player.pos.x += speed;
    }
    if (facing != "idle" && player.curAnim() != facing) {
        player.play(facing);
        player.anim = facing;
    } else if (facing === "idle" && player.curAnim() != "idle") {
        player.play("idle");
        player.anim = "idle";
    }
})

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






