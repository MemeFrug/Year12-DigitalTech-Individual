console.log("Main.js had loaded")

const Game = {
    frameTime: 16,
    paused: false,
    applyTransformations: () => {
        Game.ctx.translate(Game.camera.x, Game.camera.y)
        Game.ctx.scale(Game.camera.scale,Game.camera.scale)
    },
    settings: {
        width: 1920, // Could change this to localStorage value so we can change
        height: 1080,
        inputStyle: "keyboard"
    },
    camera: {
        x: 0,
        y: 0,
        scale: 1,
        draw: true,
    },
    interface: {
        opened: false,
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
    updateLoop: [], // Loops through objects and runs their .update(dt) function where dt is the deltaTime
    drawLoop: [], // Loops through objects and runs their .draw(ctx) function where ctx is canvas Context
    UserInterfaceLoop: [], // A loop that runs objects's update and draw functions before camera movement 
    clickListener: [], // Runs any function inside here when the mouse clicks.. NEED TO MAKE OBJECT, AND IF OBJECT RUN THEIR RESPECTIVE FUNCTION IF THEY ARE CLICKED ON
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

            // With the scale of the imagei n the canvas, get the relative mouse position
            const relMousePosition = {
                x: (Event.clientX - rect.left) * scale.x,
                y: (Event.clientY - rect.top) * scale.y
            }

            //Apply transforms
            const matrix = Game.ctx.getTransform()
            const imatrix = matrix.invertSelf()
            
            // Set the global mouse position 
            Game.mouse = { 
                x: relMousePosition.x * imatrix.a + relMousePosition.y * imatrix.c + imatrix.e, 
                y: relMousePosition.y * imatrix.b + relMousePosition.y * imatrix.d + imatrix.f
            }
        }
    },
    canvasResize: () => {
        ctx.canvas.width = Game.settings.width;
        ctx.canvas.height = Game.settings.height;
        ctx.canvas.style.width = "calc(100% - 2px)"
        Game.interface.element.style.width = "100%"
    },
    inputType: new Input(),
    player: new Square(10,50,100,100),
    orders: [
        //Each of the orders
    ],
    world: {
        score: 0,
        status: 0,
        time: 60,
        timerLoops: [],
        timerEnabled: true,
        interactors: [

        ],
        objects: [
            // Walls to the restuarant
            new Square(970,10, 100,1060),
            new Square(-90,0, 100,1080),
            new Square(0,-90, 1070,100),
            new Square(0,1070, 1070,100),
        ],
        spawnNPC: () => {
            // Pick from three possible lines
            const lines = levels[Game.world.status].spawnerLines
            let pickedLine = lines[getRandomInt(0, lines.length-1)]
            
            // Get a random list of foods/drinks
            // pickableItems.returnRandomList(levels[Game.world.status].maxItemList)

            const npc = new Square(0, pickedLine.y,100,100)
            npc.x = Game.settings.width - npc.w

            // NPC Script
            npc.scripts.push(() => {
                if (npc.x >= 975 + npc.w) {
                    npc.vx = -npc.speed
                } else {
                    if (!npc.interactionSpawned){
                        const interaction = new Interactor(0,0,100,100)
                        npc.interactionSpawned = true
                        npc.tiedInteractor = interaction

                        interaction.scripts.push(() => {
                            //When interacting with an NPC, open the cashier screen up
                            Game.inputType.enabled = false // Prevent moving the character or other key presses
                            Game.interface.toggleUserInterface()
                            orderingUI.newOrder(Game.world.status*2+1) // Create a brand new order
                            Game.camera.draw = false // Prevent drawing under the UI 
                        })

                        interaction.setParent(npc, true)
                        Game.world.interactors.push(interaction)
                        Game.drawLoop.unshift(interaction) // Add to draw loop
                        Game.updateLoop.push(interaction) // Add to update loop
                    }
                }
            })
            
            npc.draw = (ctx) => {
                ctx.fillRect(npc.x,npc.y, npc.w, npc.h)
            }

            npc.isPlayer = true // Allows it to collide with things...

            levels[Game.world.status].npcList.push(npc) // Add npc to level list
            Game.world.objects.push(npc) // Add Collisions with other objects
            Game.drawLoop.push(npc) // Add to draw loop
            Game.updateLoop.push(npc) // Add to update loop
        },
        setup: () => {
            Game.world.objects.forEach(obj => {
                Game.drawLoop.push(obj)
                Game.updateLoop.push(obj)
            });

            Game.drawLoop.push(Game.player)
            Game.updateLoop.push(Game.player)
            Game.world.objects.push(Game.player)
            Game.player.isPlayer = true
        }
    }
}

// Setup the canvas
const canvasElement = document.querySelector("canvas") // gets the first canvas in the html
let ctx = document.querySelector("canvas").getContext("2d"); // Let the website know to create memory for this variable

// Listen for document load, for any images and files, then set up the canvas
window.addEventListener("load", () => {
    console.log("Document Loaded, setting up canvas."); // Inform Devs of Situation
    
    if (!Game.interface.opened) Game.interface.userInterfaceElement.style.display = "none"

    // Start the canvas resize
    Game.canvasResize()
    // Set the window resize event to the function call above
    window.addEventListener("resize", Game.canvasResize) // Event for whenever page resizes

    //Add mouse update loop
    Game.interface.element.addEventListener("mousemove", Game.mouse.update)
    
    // Debug Draw mouse cursor
    // Game.drawLoop.push({draw: (ctx) => {
    //     ctx.fillStyle = "black"
    //     ctx.fillRect(Game.mouse.x-5, Game.mouse.y-5, 10, 10)
    // }})

    Game.interface.element.addEventListener("mouseup", (e) => {
        Game.clickListener.forEach(element => {
            console.log("Running Click Function");
            if (element === Square) {
                console.log("element is an Element");
                if (element.click) {
                    element.click(Game.mouse.x, Game.mouse.y)
                }
            }
            else element(Game.mouse.x, Game.mouse.y)
        })
    })

    //When interaction key is pressed check if player is over interaction point
    Game.inputType.interactEvent = () => {
        Game.world.interactors.forEach(interactors => {
            console.log("Interacting");
            interactors.interact(Game.player)
        });
    }

    // When Lose focus, pause game
    window.addEventListener("blur", () => {
        console.log("Loss Window Focus");
        Game.paused = true
    })
    window.addEventListener("focus", () => {
        console.log("Gained window focus");
        Game.paused = false
    })

    // Set event listeners for when pressing inputs.
    Game.inputType.call.up.push(() => {Game.player.movement.up = Game.player.speed})
    Game.inputType.call.down.push(() => {Game.player.movement.down = Game.player.speed})
    Game.inputType.call.left.push(() => {Game.player.movement.left = Game.player.speed})
    Game.inputType.call.right.push(() => {Game.player.movement.right = Game.player.speed})

    // Set event listeners for when lifting inputs
    Game.inputType.upcall.up.push(() => {Game.player.movement.up = 0})
    Game.inputType.upcall.down.push(() => {Game.player.movement.down = 0})
    Game.inputType.upcall.left.push(() => {Game.player.movement.left = 0})
    Game.inputType.upcall.right.push(() => {Game.player.movement.right = 0})
    
    Game.UserInterfaceLoop.push({draw:(ctx) => {
        ctx.fillStyle = "black"
        ctx.font = "35px Verdana"
        ctx.fillText("dt: "+ Game.frameTime.toFixed(1), 30, 40)}})

    Game.UserInterfaceLoop.push({draw:(ctx) => {
        ctx.fillStyle = "black"
        ctx.font = "35px Verdana"
        ctx.fillText("Timer: "+ Game.world.time.toFixed(0), Game.settings.width - 500, 50)}})

    // Start Listening to keyboard events
    Game.inputType.style = Game.settings.inputStyle
    Game.inputType.init()

    Game.world.setup() // Setup the player
    console.log("Done Setup, Game loop Starting");
    Game.update() // Start the update loop
})

// Get the last time to get the current Frame time
let lastTime = 0
function Update(delta) {
    //Get deltaTime for Consistent Animations
    const deltaTime = delta - lastTime
    lastTime = delta
    if (!deltaTime || Game.paused) {
        Game.update = Update
        requestAnimationFrame(Game.update);
        return
    }
    // if (deltaTime > 33) console.warn("FPS Lower than 30...", Math.round(1000/deltaTime),"FPS")
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
            if (element instanceof Square) {
                element.update(deltaTime, Game.world.objects)
            } else {
                element.update(deltaTime)
            }
        }
    });

    //Update the Level
    if (Game.world.timerEnabled && Game.world.time > 0) {
        Game.world.timerEnabled = true // This might break the loop
        Game.world.time-= deltaTime/1000
    } else if (Game.world.timerEnabled) {
        Game.world.timerEnabled = false
    }
    // Call the level's update function
    levels[Game.world.status].update(deltaTime)


    //Draw Everything
    if (Game.camera.draw) {
        Game.drawLoop.forEach(element => {
            if (element.draw) {
                element.draw(Game.ctx)
            }
        });
    }
    requestAnimationFrame(Game.update)
}

Game.update = Update