/*
 Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/*
 Returns a random integer between min (inclusive) and max (inclusive).
 The value is no lower than min (or the next integer greater than min
 if min isn't an integer) and no greater than max (or the next integer
 lower than max if max isn't an integer).
 Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Square {
    constructor(x = 0,y = 0, w=50,h=50) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.vx = 0
        this.vy = 0
        this.speed = .15
        this.movement = { // Constant Values Applied to velocity
            up: 0,
            down: 0,
            left: 0,
            right: 0,
        }
        this.isPlayer = false

        this.scripts = [

        ]
    }

    //https://stackoverflow.com/questions/67747353/javascript-how-to-have-collision-with-character-and-an-object
    narrowPhase(obj) {
        const player = this
        const dampFactor = 0.5

        let playerTop_ObjBottom = Math.abs(player.y - (obj.y + obj.h));
        let playerRight_ObjLeft = Math.abs((player.x + player.w) - obj.x);
        let playerLeft_ObjRight = Math.abs(player.x - (obj.x + obj.w));
        let playerBottom_ObjTop = Math.abs((player.y + player.h) - obj.y);
    
        if ((player.y <= obj.y + obj.h && player.y + player.h > obj.y + obj.h) && (playerTop_ObjBottom < playerRight_ObjLeft && playerTop_ObjBottom < playerLeft_ObjRight)) {
            player.y = obj.y + obj.h;
            player.vy = -player.vy * dampFactor;
        }
        if ((player.y + player.h >= obj.y && player.y < obj.y) && (playerBottom_ObjTop < playerRight_ObjLeft && playerBottom_ObjTop < playerLeft_ObjRight)) {
            player.y = obj.y - player.h; 
            player.vy = -player.vy * dampFactor;
        }
        if ((player.x + player.w >= obj.x && player.x < obj.x) && (playerRight_ObjLeft < playerTop_ObjBottom && playerRight_ObjLeft < playerBottom_ObjTop)) {
            player.x = obj.x - player.w;
            player.vx = -player.vx * dampFactor; 
        }
        if ((player.x <= obj.x + obj.w && player.x + player.w > obj.x + obj.w) && (playerLeft_ObjRight < playerTop_ObjBottom && playerLeft_ObjRight < playerBottom_ObjTop)) {
            player.x = obj.x + obj.w;
            player.vx = -player.vx * dampFactor; 
        }
    }

    detectCollision(obj) {
        if (obj.isPlayer) return;
        if (!this.isPlayer) return;
        if (obj instanceof Square){
            if (this.x + this.w >= obj.x &&     // r1 right edge past r2 left
                this.x <= obj.x + obj.w &&       // r1 left edge past r2 right
                this.y + this.h >= obj.y &&       // r1 top edge past r2 bottom
                this.y <= obj.y + obj.h) {       // r1 bottom edge past r2 top
                    // The two objects are colliding
                    // this.x = obj.x + obj.w
                    this.narrowPhase(obj)
                    return true;
              }
              return false;
        }
        else {
            console.error("Unknown Class")
        }
    }

    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    movementUpdate(dt) {
        this.vx += this.movement.right - this.movement.left
        this.vy += this.movement.down - this.movement.up
    }

    update(dt, objectLoop = []) {
        this.scripts.forEach(script => {
            script(dt, objectLoop)
        })

        // Update the player movement
        this.movementUpdate(dt)

        // Add square's velocity to coords with deltaTime
        this.x += this.vx * dt
        this.y += this.vy * dt
        
        // Dampen The square's velocity
        this.vx *= 0.9
        this.vy *= 0.9
        objectLoop.forEach(obj => {
            this.detectCollision(obj)
        });
    }
}

class Input {
    constructor(style="keyboard") {
        this.style = style

        this.call = {
            left: [],
            up: [],
            right: [],
            down: []
        }

        this.upcall = {
            left: [],
            up: [],
            right: [],
            down: []
        }
    }

    init() {
        window.addEventListener("keydown", (code) => {
            switch (code.key) {
                case "w":
                    this.call.up.forEach(func => {
                        func()
                    });
                    break;
                case "a":
                    this.call.left.forEach(func => {
                        func()
                    });
                    break;
                case "s":
                    this.call.down.forEach(func => {
                        func()
                    });
                    break;
                case "d":
                    this.call.right.forEach(func => {
                        func()
                    });
                    break;
                default:
                    // console.warn("unknown input", code.key)
                    break;
            }
        })
        window.addEventListener("keyup", (code) => {
            switch (code.key) {
                case "w":
                    this.upcall.up.forEach(func => {
                        func()
                    });
                    break;
                case "a":
                    this.upcall.left.forEach(func => {
                        func()
                    });
                    break;
                case "s":
                    this.upcall.down.forEach(func => {
                        func()
                    });
                    break;
                case "d":
                    this.upcall.right.forEach(func => {
                        func()
                    });
                    break;
                default:
                    // console.warn("unknown input", code.key)
                    break;
            }
        })
    }

    update(dt) {

    }
}

const pickableItems = {
    items: [
        {}
    ],
    returnRandomList: (numberOfItems) => {
        let list = []

        return list;
    }
}



const levels = [
    {   //level 0
        spawnerLines: [
            {y:110},
            {y:500},
            {y:700},
        ],
        spawnTimer: 0, // Timer for NPC spawning.
        spawnSpeed: 2400, // Spawn Speed of NPCs
        maxItemList: 2, // How many items
        spawner: (dt) => {
            if (Game.paused) {
                return;
            }
            if (Game.world.time <= 0) {
                spawnTimer = 0;
                return;
            }
            let level = levels[0]
            level.spawnTimer += Math.random() * dt
            if (level.spawnTimer >= level.spawnSpeed) {
                console.log("spawning");
                level.spawnTimer = 0

                //Spawn the npc
                Game.world.spawnNPC()
            }
        },

        update: (dt) => {
            levels[0].spawner(dt)
        }
    },
    {   //level 1

    },
    {   //level 2

    },
]