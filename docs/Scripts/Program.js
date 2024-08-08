class Element {
    constructor() {
        this.x = 0
        this.y = 0
    }
}

class Square extends Element {
    constructor(x,y, w=0,h=0) {
        super();
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.vx = 0
        this.vy = 0
        this.movement = {
            y: 0,
            x: 0,
        }
        this.isPlayer = false
    }

    detectCollision(obj) {
        if (obj.isPlayer) return;
        if (!this.isPlayer) return;
        if (obj instanceof Square){
            if (this.x + this.w >= obj.x &&     // r1 right edge past r2 left
                this.x <= obj.x + obj.w &&       // r1 left edge past r2 right
                this.y + this.h >= obj.y &&       // r1 top edge past r2 bottom
                this.y <= obj.y + obj.h) {       // r1 bottom edge past r2 top
                    // console.log("Colliding");
                    this.x = obj.x + obj.w
                    return true;
              }
              return false;
        }
        else {
            console.error("Unknown Class")
        }
    }

    draw(ctx) {
        ctx.fillStyle = "black"
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    update(dt, objectLoop = []) {
        if (!this.x || !this.y) {
            this.x = 0
            this.y = 0
        }
        this.vx = (this.vx + this.movement.x)
        this.vy = (this.vy + this.movement.y)
        this.x += this.vx * dt
        this.y += this.vy * dt
        this.vx *= 0.6
        this.vy *= 0.6
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