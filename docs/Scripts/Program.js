// Global Values
const val = {
    categories: {
        Food: 0,
        Drinks: 1,
        Other: 2
    },
}

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

class Element {

}

class Square extends Element {
    constructor(x = 0, y = 0, w = 50, h = 50) {
        super()
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.vx = 0
        this.vy = 0
        this.speed = .07
        this.movement = { // Constant Values Applied to velocity
            up: 0,
            down: 0,
            left: 0,
            right: 0,
        }
        this.isPlayer = false

        this.children = [

        ]

        this.scripts = [

        ]
    }

    remove() {
        const drawLoop = Game.drawLoop.indexOf(this)
        const updateLoop = Game.updateLoop.indexOf(this)
        const worldLoop = Game.world.objects.indexOf(this)
        const npcList = levels[Game.world.status].npcList.indexOf(this)
        if (drawLoop != -1) {
            Game.drawLoop.splice(drawLoop, 1)
        }
        if (updateLoop != -1) {
            Game.updateLoop.splice(updateLoop, 1)
        }
        if (worldLoop != -1) {
            Game.world.objects.splice(worldLoop, 1)
        }
        if (npcList != -1) {
            levels[Game.world.status].npcList.splice(npcList, 1)
        }
    }

    removeChildren() {
        this.children.forEach(element => {
            element.remove()
        });
        this.children = []
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
        // if (obj.isPlayer) return;
        // if (!this.isPlayer) return;
        if (obj instanceof Square) {
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
            console.error("Class not setup for collision")
        }
    }

    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x+1, this.y+1, this.w-1, this.h-1); // The constants are the margin
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

class Interactor extends Element {
    constructor(x, y, w, h) {
        super()
        this.x = x
        this.y = y
        this.w = w
        this.h = h

        this.parent = undefined

        this.scripts = []
    }

    setParent(parent) {
        this.parent = parent
        parent.children.push(this)

        this.x = parent.x - this.w - parent.w - 10
        this.y = parent.y
    }

    remove() {
        const drawLoop = Game.drawLoop.indexOf(this)
        const updateLoop = Game.updateLoop.indexOf(this)
        const worldLoop = Game.world.objects.indexOf(this)
        if (drawLoop != -1) {
            Game.drawLoop.splice(drawLoop, 1)
        }
        if (updateLoop != -1) {
            Game.updateLoop.splice(updateLoop, 1)
        }
        if (worldLoop != -1) {
            Game.world.objects.splice(worldLoop, 1)
        }
    }

    draw(ctx) {
        ctx.globalAlpha = 0.5
        ctx.strokeStyle = "darkgreen"
        ctx.fillStyle = "lightgreen"
        ctx.fillRect(this.x, this.y, this.w, this.h)
        ctx.strokeRect(this.x, this.y, this.w, this.h)
        ctx.globalAlpha = 1
    }

    interact(obj) {
        if (this.isTouching(obj)) {
            this.scripts.forEach(script => {
                script()
            });
        }
    }

    isTouching(obj) {
        // if (obj.isPlayer) return;
        // if (!this.isPlayer) return;
        if (obj instanceof Square) { // Check if it has class square so no errors are thrown
            if (this.x + this.w >= obj.x &&     // r1 right edge past r2 left
                this.x <= obj.x + obj.w &&       // r1 left edge past r2 right
                this.y + this.h >= obj.y &&       // r1 top edge past r2 bottom
                this.y <= obj.y + obj.h) {       // r1 bottom edge past r2 top
                // The two objects are colliding return true
                return true;
            }
            return false;
        }
        else {
            console.error("Class not setup for collision")
        }
    }
}

class Input {
    constructor(style = "keyboard") {
        this.style = style

        this.enabled = true

        this.call = {
            left: [],
            up: [],
            right: [],
            down: []
        }

        this.interactEvent = undefined

        this.upcall = {
            left: [],
            up: [],
            right: [],
            down: []
        }
    }

    init() {
        window.addEventListener("keydown", (code) => {
            if (!this.enabled) return;
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
                    break;
            }
        })
        window.addEventListener("keyup", (code) => {
            if (!this.enabled) return;
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
                case "e":
                    if (this.interactEvent) {
                        this.interactEvent()
                    }
                    break;
                default:
                    break;
            }
        })
    }

    update(dt) {

    }
}

const pickableItems = {
    items: [
        // Each entry contains a name, category and cost of the product
        { name: "Cheese Balls", category: val.categories.Food, cost: 10 },
        { name: "Coke", category: val.categories.Drinks, cost: 10 },
        { name: "Cup With Logo", category: val.categories.Other, cost: 10 },
        { name: "Pepsi", category: val.categories.Drinks, cost: 10 },
        { name: "Fanta", category: val.categories.Drinks, cost: 10 },
        { name: "Creaming Soda", category: val.categories.Drinks, cost: 10 },
        { name: "Pizza", category: val.categories.Food, cost: 10 },
        { name: "Hot Fudge Sundae", category: val.categories.Other, cost: 10 },
        { name: "Chicken Tenders", category: val.categories.Food, cost: 10 },
        { name: "Hash Browns", category: val.categories.Food, cost: 10 },
        { name: "Chicken Soup", category: val.categories.Food, cost: 10 },
        { name: "Brownies", category: val.categories.Other, cost: 10 },
    ],
    // Returns an array that contains specified amount of items
    returnRandomList: (numberOfItems) => {
        let list = [] // Get an empty list
        for (let i = 0; i < numberOfItems; i++) {
            // Loop through a set number of times
            const item = pickableItems.items[getRandomInt(0, pickableItems.items.length - 1)]

            list.push(item)
        }
        console.log(list);
        return list;
    },
    // Returns the entire list
    returnList: () => {
        // Returns the entire list for building the User Interface
        return pickableItems.items
    }
}



const levels = [
    {   //level 0
        spawnerLines: [
            { y: 500 },
            { y: 700 },
            { y: 900 },
        ],
        spawnTimer: 0, // Timer for NPC spawning.
        spawnSpeed: 1000, // Spawn Speed of NPCs
        maxNPCCount: 2,
        maxItemList: 2, // How many items

        npcList: [],

        initialise: () => {
            // Start Listening to keyboard events
            Game.inputType.style = Game.settings.inputStyle
            Game.inputType.init()

            Game.world.setup() // Setup the player
            console.log("Done Setup, Game loop Starting");
            Game.update() // Start the update loop
        },

        endEvent: () => {
            // Check how many npcs are active and deduct 5 points per npc
            const totalNPC = levels[0].npcList.length
            Game.score
        },

        spawner: (dt) => {
            let level = levels[0]

            if (Game.paused) return;
            if (Game.world.time <= 0) {
                spawnTimer = 0;
                return;
            }

            if (level.maxNPCCount <= level.npcList.length) return;

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