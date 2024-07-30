console.log("Main.js had loaded")

const Game = {
    frameTime: 16,
    applyTransformations: () => {
        Game.ctx.translate(Game.camera.x, Game.camera.y)
    },
    settings: {
        width: 1920, // Could change this to localStorage value so we can change
        height: 1080
    },
    camera: {
        x: 0,
        y: 0,
    },
    interface: {
        opened: true,
        element: document.getElementsByClassName("Interface")[0],
        userInterfaceElement: document.getElementById("cashierScreen"),
        // Toggle the UI and return current visible state of UI
        toggleUserInterface: () => {
            Game.interface.opened = !Game.interface.opened
            if (Game.interface.opened) Game.interface.userInterfaceElement.style.display = "flex"
            else if (!Game.interface.opened) Game.interface.userInterfaceElement.style.display = "none"
            return Game.interface.opened
        }
    },
    updateLoop: [],
    drawLoop: [],
    UserInterfaceLoop: [],
    clickListener: [],
    ctx: document.querySelector("canvas").getContext("2d"), // Let the website know to create memory for this variable
    update: undefined,
    mouse: {
        x: 0,
        y: 0,
        update: (Event) => {
            //Get mouse position relative to all scaling
            // Need to improve this when adding transformation matrixes

            let canvas = Game.ctx.canvas
            const rect = canvas.getBoundingClientRect() // abs. size of element
            const scale = {
                x: canvas.width / rect.width,
                y: canvas.height / rect.height
            }
            Game.mouse ={
                x: (Event.clientX - rect.left) * scale.x,
                y: (Event.clientY - rect.top) * scale.y
            }

            //Apply transforms
            const matrix = Game.ctx.getTransform()
            const imatrix = matrix.invertSelf()
            
            Game.mouse = { 
                x: Game.mouse.x * imatrix.a + Game.mouse.y * imatrix.c + imatrix.e, 
                y: Game.mouse.y * imatrix.b + Game.mouse.y * imatrix.d + imatrix.f
            }
        }
    }
}

// Setup the canvas
const canvasElement = document.querySelector("canvas") // gets the first canvas in the html
let ctx = document.querySelector("canvas").getContext("2d"); // Let the website know to create memory for this variable

// Listen for document load, for any images and files, then set up the canvas
window.addEventListener("load", () => {
    console.log("Document Loaded, setting up canvas."); // Inform Devs of Situation

    Game.canvasResize = () => {
        ctx.canvas.width = Game.settings.width;
        ctx.canvas.height = Game.settings.height;
        ctx.canvas.style.width = "calc(100% - 2px)"
        Game.interface.element.style.width = "100%"
    }
    Game.canvasResize()
    window.addEventListener("resize", Game.canvasResize) // Event for whenever page resizes

    //Add mouse update loop
    Game.interface.element.addEventListener("mousemove", Game.mouse.update)
    // Debug Draw mouse cursor
    Game.drawLoop.push({draw: (ctx) => {ctx.fillRect(Game.mouse.x-5, Game.mouse.y-5, 10, 10)}})

    Game.interface.element.addEventListener("mouseup", (e) => {
        Game.clickListener.forEach(element => {
            console.log("Running Click Function");
            element(Game.mouse.x, Game.mouse.y)
        })
    })

    Game.drawLoop.push({draw:(ctx) => {
        ctx.font = "35px Verdana"
        ctx.fillText("dt: "+ Game.frameTime.toFixed(1), 30, 40)}})

    Game.clickListener.push((x, y) => {
        Game.drawLoop.push({draw: (ctx) => {ctx.fillRect(x-25, y-25,50,50)}})
    })
    console.log("canvas set up with", Game.settings.width,"x",Game.settings.height)
    Game.update() // Start the update loop
})

// Get the last time to get the current Frame time
let lastTime = 0
function Update(delta) {
    //Get deltaTime for Consistent Animations
    const deltaTime = delta - lastTime
    lastTime = delta

    //Ensure deltaTime is available globally
    Game.frameTime = deltaTime

    // Reset the transformation so that it doesnt constantly be applied
    Game.ctx.resetTransform()
    //Clear the rect every
    Game.ctx.clearRect(0,0,Game.settings.width, Game.settings.height)
    // Run the user interface loop before transformations applied.
    Game.UserInterfaceLoop.forEach(element => {
        if (element.update) {
            element.update(deltaTime)
        }
        if (element.draw) {
            element.draw(Game.ctx)
        }
    })
    // Apply all transformations and rotations, could just be a single set transforms
    Game.applyTransformations()

    Game.updateLoop.forEach(element => {
        if (element.update) {
            element.update(deltaTime)
        }
    });
    Game.drawLoop.forEach(element => {
        if (element.draw) {
            element.draw(Game.ctx)
        }
    });
    requestAnimationFrame(Game.update)
}

Game.update = Update