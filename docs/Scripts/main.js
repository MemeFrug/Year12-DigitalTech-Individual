console.log("Main.js had loaded")

const Game = {
    frameTime: 16,
    currTime: 0,
    paused: false,
    applyTransformations: () => {
        Game.ctx.translate(Game.camera.x, Game.camera.y)
        Game.ctx.scale(Game.camera.scale, Game.camera.scale)
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
        changePageTitle: (value) => {
            document.getElementById("pageTitle").innerHTML = value
        },
        changePageDescription: (value) => {
            document.getElementById("tutorialText").innerHTML = value
        },
        opened: false,
        element: document.getElementsByClassName("Interface")[0],
        userInterfaceElement: document.getElementById("cashierScreen"),
        // The State of the UI and return current visible state of UI
        enableUserInterface: () => {
            Game.interface.opened = true
            Game.interface.userInterfaceElement.style.display = "flex"
            Game.camera.draw = false
        },
        disableUserInterface: () => {
            Game.interface.opened = false
            Game.interface.userInterfaceElement.style.display = "none"
            Game.camera.draw = true
        },
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
        down: false,
        update: (Event) => {
            //Get mouse position relative to all scaling
            // Need to improve this when adding transformation matrixes

            let canvas = Game.ctx.canvas
            const rect = canvas.getBoundingClientRect() // abs. size of element
            const scale = {
                x: canvas.width / rect.width,
                y: canvas.height / rect.height
            }

            // Initialise the variable
            let relMousePosition = undefined;

            relMousePosition = { x: (Event.clientX - rect.left) * scale.x, y: (Event.clientY - rect.top) * scale.y };
            //Apply transforms
            const matrix = Game.ctx.getTransform();
            const imatrix = matrix.invertSelf()

            // Set the global mouse position 
            Game.mouse = {
                x: relMousePosition.x * imatrix.a + relMousePosition.y * imatrix.c + imatrix.e,
                y: relMousePosition.y * imatrix.b + relMousePosition.y * imatrix.d + imatrix.f
            }


        }
    },
    canvasResize: () => {
        ctx.canvas.width = Game.settings.width; // Internal width (Resolution)
        ctx.canvas.height = Game.settings.height; // Internal height (Resolution)
        ctx.canvas.style.width = "calc(100% - 2px)" // Make the canvas's width entire width of Container taking into account the border style
    },
    inputType: new Input(),
    player: new Square(100, 100, 100, 100),
    orders: [
        //Each of the orders
    ],
    world: {
        score: 0,
        status: 0, // Level Status, identifier
        time: undefined,
        timerLoops: [],
        timerEnabled: false,
        interactors: [

        ],
        objects: [],
        spawnNPC: () => {
            // Pick from three possible lines
            const lines = levels[Game.world.status].spawnerLines
            let pickedLine = lines[getRandomInt(0, lines.length - 1)]

            // Get a random list of foods/drinks
            // pickableItems.returnRandomList(levels[Game.world.status].maxItemList)

            const npc = new Square(0, pickedLine.y, 100, 100)
            npc.x = Game.settings.width - npc.w
            npc.leaving = false

            // NPC Script, its update function for arriving at the counter and leaving.
            npc.scripts.push(() => {
                if (npc.x >= 990 + npc.w && !npc.leaving) {
                    npc.vx = -npc.speed - .4
                } else if (!npc.leaving) {
                    if (!npc.interactionSpawned) {
                        const interaction = new Interactor(0, 0, 100, 100)
                        npc.interactionSpawned = true
                        npc.tiedInteractor = interaction

                        interaction.scripts.push(() => {
                            //When interacting with an NPC, open the cashier screen up
                            Game.inputType.enabled = false // Prevent moving the character or other key presses
                            Game.interface.enableUserInterface()
                            orderingUI.newOrder(getRandomInt(1, levels[Game.world.status].maxNPCCount)) // Create a brand new order with a random count
                            orderingUI.npcInstance = npc
                        })

                        interaction.setParent(npc, true)
                        Game.world.interactors.push(interaction)
                        Game.drawLoop.unshift(interaction) // Add to start of draw loop
                        Game.updateLoop.push(interaction) // Add to update loop
                    }
                } else { // When the npc is leaving
                    npc.vx = npc.speed + .2 // Add the speed of the npc to the npc to ensure it travels to the right of the screen.
                    if (npc.x >= 1800) {
                        npc.remove() // Remove the npc once it leaves...
                    }
                }
            })

            npc.draw = (ctx) => {
                ctx.fillStyle = "black";
                ctx.beginPath();
                ctx.arc(npc.x + npc.w/2, npc.y + npc.h/2, npc.w/2, 0, 2 * Math.PI);
                ctx.fill();
            }

            npc.isPlayer = true // Allows it to collide with things...

            levels[Game.world.status].npcList.push(npc) // Add npc to level list
            Game.world.objects.push(npc) // Add Collisions with other objects
            Game.drawLoop.push(npc) // Add to draw loop
            Game.updateLoop.push(npc) // Add to update loop
        },
        setup: () => {
            // Overide all objects, add the walls
            Game.world.objects = [            
                // Walls to the restuarant
                new Square(970, 10, 100, 1060, true),
                new Square(-50, 0, 100, 1100, true),
                new Square(0, -90, 1070, 100, true),
                new Square(0, 1070, 1070, 100, true),
            ]

            // Debug Frame Time display
            Game.UserInterfaceLoop.push({
                draw: (ctx) => {
                    ctx.fillStyle = "black"
                    ctx.font = "35px Verdana"
                    ctx.fillText(Math.round(1000 / Game.frameTime) + "FPS", 60, 40)
                }
            })
        
            // Timer Display
            Game.UserInterfaceLoop.push({
                draw: (ctx) => {
                    ctx.fillStyle = "black"
                    ctx.font = "35px Verdana"
                    ctx.fillText("Timer: " + Game.world.time.toFixed(0) + " | ", Game.settings.width - 800, 50)
                }
            })
        
            // Score Display
            Game.UserInterfaceLoop.push({
                draw: (ctx) => {
                    ctx.fillStyle = "black"
                    ctx.font = "35px Verdana"
                    ctx.fillText("Score: " + Game.world.score.toFixed(0), Game.settings.width - 590, 50)
                }
            })
            
            // Interaction Popup for Help with keybinds
            Game.UserInterfaceLoop.push({
                draw: (ctx) => {
                    ctx.fillStyle = "black"
                    ctx.font = "35px Verdana"
                    ctx.fillText("Movement: (Hold Finger Down)" , Game.settings.width - 590, Game.settings.height- 243)
                    ctx.fillText("W - Up" , Game.settings.width - 210, Game.settings.height- 200)
                    ctx.fillText("A - Left" , Game.settings.width - 210, Game.settings.height- 160)
                    ctx.fillText("S - Down" , Game.settings.width - 210, Game.settings.height- 120)
                    ctx.fillText("D - Right" , Game.settings.width - 210, Game.settings.height- 80)
                    ctx.fillText("Interact: E (Double Tap Finger)" , Game.settings.width - 600, Game.settings.height- 30)
                }
            })
            
            // Reset the position just in case
            Game.player.x = 100
            Game.player.y = 100

            Game.player.draw = (ctx) => {
                ctx.fillStyle = "black";
                ctx.beginPath();
                ctx.arc(Game.player.x + Game.player.w/2, Game.player.y + Game.player.h/2, Game.player.w/2, 0, 2 * Math.PI);
                ctx.fill();
            }

            Game.world.objects.forEach(obj => {
                Game.drawLoop.push(obj)
                Game.updateLoop.push(obj)
            });

            Game.drawLoop.push(Game.player)
            Game.updateLoop.push(Game.player)
            Game.world.objects.push(Game.player)
            Game.player.isPlayer = true
        }
    },
    clean: () => {
        Game.world.interactors = [];
        Game.world.objects = [];
        Game.drawLoop = [];
        Game.updateLoop = [];
        Game.UserInterfaceLoop = [];
        levels[Game.world.status].npcList = [];
        Game.world.score = 0;
        console.log("Finished Clearing the Level");
    },
    localStorage: {
        saveAllScores: () => {
            let levelScores = [] // The position in the array is the level... and the value is the score
            levels.forEach(level => {
                if (level.savedScore) {
                    levelScores[levels.indexOf(level)] = level.savedScore.toFixed(1)
                }
            });
            console.log("Saved, ", levelScores);
            localStorage.setItem("levelScores", JSON.stringify(levelScores)); // Converts the array to JSON string format for parsing later
        },
        loadAllScores: () => {
            const data = JSON.parse(localStorage.getItem("levelScores"));
            if (data) {
                console.log("Got from local Storage", data);
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    levels[i].savedScore = JSON.parse(element)
                }
            } else {
                console.warn("No data for localStorage 'levelScores'")
            }
        }
    },
    finishLevel: () => {
        console.log("Triggering 'finishLevel()'");
        //Close any possible UIs
        Game.interface.disableUserInterface()

        // Open up the end Game Menu
        const endGameMenu = document.getElementById("endGameMenu")
        endGameMenu.style.display = "flex"

        // Set the current score into the saved levels  
        if (levels[Game.world.status].savedScore < Game.world.score) {
            levels[Game.world.status].savedScore = Game.world.score

            // Save the score
            Game.localStorage.saveAllScores()
        }


        if (levels[Game.world.status].scoreNeeded > Game.world.score) {
            document.getElementById("levelSucceeded").textContent = "Failed"
        }
        else document.getElementById("levelSucceeded").textContent = "Succeeded"

        document.getElementById("endGameMenuContinueButton").addEventListener("mouseup", () => {
            // After clicking continue, close menu
            endGameMenu.style.display = "none"
            // Open up the main menu
            document.getElementById("MainMenu").style.display = "flex"
        })

        // Clean the game
        Game.clean();
    }
}

const mobileMouse = {
    pos: {
        x: 0,
        y: 0
    },
    tapedTwice: false,
}

function InitialiseMobileEventsOn(el) { // Puts the events on the element
    function mobilesetpos(evt) {
        const touches = evt.changedTouches[0];
        // Get the position on canvas
        let canvas = Game.ctx.canvas
        const rect = canvas.getBoundingClientRect() // abs. size of element
        const scale = {
            x: canvas.width / rect.width,
            y: canvas.height / rect.height
        }
        let relMousePosition = {
            x: (touches.clientX - rect.left) * scale.x,
            y: (touches.clientY - rect.top) * scale.y
        }
        //Apply transforms
        const matrix = Game.ctx.getTransform()
        const imatrix = matrix.invertSelf()
        mobileMouse.pos.x = relMousePosition.x * imatrix.a + relMousePosition.y * imatrix.c + imatrix.e
        mobileMouse.pos.y = relMousePosition.y * imatrix.b + relMousePosition.y * imatrix.d + imatrix.f

    }
    function tapHandler(evt) {
        evt.preventDefault()
        if(!mobileMouse.tapedTwice) {
            mobileMouse.tapedTwice = true;
            // Add a delay for double tap function
            setTimeout( function() { mobileMouse.tapedTwice = false; }, 300 );
            // Set the new position of the finger
            mobilesetpos(evt)
            return false;
        }
        // Prevent default actions like zooming when double taping
        evt.preventDefault();
        Game.world.interactors.forEach(interactors => {
            console.log("Interacting");
            interactors.interact(Game.player)
        });
    }
    el.addEventListener("touchstart", tapHandler); 
    el.addEventListener("touchmove", (evt) => {
        evt.preventDefault()
        mobilesetpos(evt)
    });
}

// reterns specific elements
function copyTouch({ identifier, pageX, pageY }) {
    return { identifier, pageX, pageY };
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


    Game.interface.element.addEventListener("touchstart", (e) => {
        Game.mouse.down = true
        console.log("Mouse Down");
    })
    Game.interface.element.addEventListener("touchend", (e) => {
        Game.mouse.down = false;
        console.log("Mouse Up");
    })

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
    Game.inputType.call.up.push(() => { Game.player.movement.up = Game.player.speed })
    Game.inputType.call.down.push(() => { Game.player.movement.down = Game.player.speed })
    Game.inputType.call.left.push(() => { Game.player.movement.left = Game.player.speed })
    Game.inputType.call.right.push(() => { Game.player.movement.right = Game.player.speed })

    // Set event listeners for when letting go from inputs
    Game.inputType.upcall.up.push(() => { Game.player.movement.up = 0 })
    Game.inputType.upcall.down.push(() => { Game.player.movement.down = 0 })
    Game.inputType.upcall.left.push(() => { Game.player.movement.left = 0 })
    Game.inputType.upcall.right.push(() => { Game.player.movement.right = 0 })

    // Set up the level select screen
    setUpLevelSelect()

    //Set up Mobile Touch Events
    InitialiseMobileEventsOn(Game.ctx.canvas)

    // Listen for cashier Screen veiwing
    document.getElementById("cashierOpenButton").addEventListener("mouseup", () => {
        console.log("Clicked button");
        //Close the User Interface
        document.getElementById('MainMenu').style.display = "none"
        //Show the user interface
        Game.interface.userInterfaceElement.style.display = "flex"
        // Hide the initiall Submit button, but show the continue button
        document.getElementById("submitButton").style.display = "none"
        document.getElementById("continueButtonTut").style.display = "flex"
        Game.interface.changePageTitle("Cashier Screen")
        Game.interface.changePageDescription(`Here you can take a look around the order taking user interface
             and learn the different positions of each item on the menu. There are three categories, Food, Drinks and Other. Pressing those buttons below will change the items displayed. Make sure you select the right items as you cannot remove them once selected. 
             Your required items will appear at the top left. You will get a lower score for the longer you take.
            `)
    })
    // Add an mouse up event for when pressing the continue button in the order taking screen
    document.getElementById("continueButtonTut").addEventListener("mouseup", () => {
        // Re Show the initiall Submit button, but show the continue button
        document.getElementById("submitButton").style.display = "flex"
        document.getElementById("continueButtonTut").style.display = "none"
        //Close the User Interface
        document.getElementById('MainMenu').style.display = "flex"
        //Show the user interface
        Game.interface.userInterfaceElement.style.display = "none"
        Game.interface.changePageTitle("Order Taking Trainer")
        Game.interface.changePageDescription("") // Remove the page description
    })

    //Back button functionality for the level select screen
    document.getElementById("backButton").addEventListener("mouseup", () => {
        // Open the User Interface
        document.getElementById('MainMenu').style.display = "flex"
        // Close up the level Select
        document.getElementById("LevelSelect").style.display = "none"
        Game.interface.changePageTitle("Order Taking Trainer")
    })

    // Listen for play button, and set it up so it says the correct text
    let playButton = document.getElementById("playButton")
    playButton.addEventListener("mouseup", () => {
        console.log("Pressed Play");
        //Close the User Interface
        document.getElementById('MainMenu').style.display = "none"
        levelSelect()
        Game.interface.changePageTitle("Level Select")
    })
})

function clearBackgroundClickButton() {
    const menu = document.getElementById("menu")
    Array.from(menu.children).forEach(level => {
        level.style.backgroundColor = "rgba(0,0,0,0)"
        level.value = "notselected"
    })
}

function startLevel(selectedLevel) {
    console.log(selectedLevel);
    //Change the size of the screen for an animation
    const levelSelectLeft = document.getElementById("levelSelectLeft");
    const levelSelectRight = document.getElementById("levelSelectRight");

    levelSelectLeft.style.width = "0%"
    levelSelectRight.style.width = "100%"

    // Fade the screen
    levelSelectRight.style.backgroundColor = "rgb(0,0,0)"


    // Change world settings
    Game.world.time=levels[selectedLevel].timeLimit
    setTimeout(() => {
        // close the level select
        document.getElementById("LevelSelect").style.display = "none"
        //Open up level animation
        document.getElementById("animator").style.display = "flex"
        document.getElementById("animator").textContent = "Loading..."
    },1900) // initialise in 1.8 second

    setTimeout(() => {
        // Initialise the level
        levels[Game.world.status].initialise()
        //opening up animation
        document.getElementById("animator").textContent = "Finished!"
        document.getElementById("animator").style.width = "0%"
    },4000) // Initialise in 3 second
}

function setUpLevelSelect() {
    //Level descriptiors
    const levelName = document.getElementById("levelTitle")
    const levelInfoScore = document.getElementById("levelScore")
    const levelInfoTimeLimit = document.getElementById("timeLimit")
    const levelDescription = document.getElementById("levelDescription")
    const failedLevel = document.getElementById("failedLevel")
    //Listen for the play button
    document.getElementById("playLevelButton").addEventListener("mouseup", () => {
        startLevel(Game.world.status)
        Game.interface.changePageTitle("Level " + Game.world.status)
    })
    levels.forEach(level => {
        const levelNumber = levels.indexOf(level)
        console.log(levelNumber);
        // Create a div to serve as the button
        const div = document.createElement("div")
        div.textContent = "Level " + (levelNumber + 1)
        div.className = "button"
        // Add it to the level select
        const menuToAddTo = document.getElementById("menu")
        menuToAddTo.appendChild(div)
        div.value = "notselected"
        // Listen for an on click event to change the menu on right and background of button
        div.addEventListener("mouseup", () => {
            // Open up the level descriptor
            document.getElementById("levelSelectRight").style.width = "60%"
            // Clear all the other button's backgrounds
            clearBackgroundClickButton()
            if (div.value != "selected") { // Check if the button is already selected
                div.style.backgroundColor = "rgba(0,0,0,0.2)" // Change the background to be semi-dark
                div.value = "selected"
            } else { // Else remove the background of the button
                div.value = "notselected"
                div.style.backgroundColor = "rgba(0,0,0,0)"
            }

            // Change menu on right
            levelName.textContent = "Level " + (levelNumber+1) // Change the name of the level
            levelInfoScore.textContent = level.savedScore // Gathered From Local Storage
            levelInfoTimeLimit.textContent =  level.timeLimit // Convert the time limit to seconds
            levelDescription.textContent = level.description
            if (level.scoreNeeded >= level.savedScore) failedLevel.textContent = "Incomplete Level"
            else failedLevel.textContent = "Complete Level"
            // Change game states
            Game.world.status = levelNumber
        })
    })
}

// This function is used for the main menu when opening up the level screen for opening up the UI element
function levelSelect() {
    clearBackgroundClickButton()
    document.getElementById("animator").style.display = "none"
    document.getElementById("animator").style.width = "100%"
    // Close the level select descriptor
    document.getElementById("levelSelectRight").style.width = "0%"
    document.getElementById("levelSelectRight").style.backgroundColor = "rgba(0,0,0,0)"
    // Open up the level select selector
    document.getElementById("levelSelectLeft"). style.width = "100%"
    // Open up the level Select
    document.getElementById("LevelSelect").style.display = "flex"

    Game.localStorage.loadAllScores()
}

// Get the last time to get the current Frame time
let lastTime = 0
function Update(delta) {
    Game.currTime = delta
    //Get deltaTime for Consistent Animations
    const deltaTime = delta - lastTime
    lastTime = delta
    if (!deltaTime || Game.paused) {
        Game.update = Update
        requestAnimationFrame(Game.update);
        return
    }
    if (deltaTime > 34) {
        console.error("deltaTime Exceeded Maximum value exceeded ignoring tick", deltaTime)
        requestAnimationFrame(Game.update);
        return;
    }

    //Ensure deltaTime is available globally
    Game.frameTime = deltaTime

    // Reset the transformation so that it doesnt constantly be applied
    Game.ctx.resetTransform()
    //Clear the rect every
    Game.ctx.clearRect(0, 0, Game.settings.width, Game.settings.height)
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
        Game.world.time -= deltaTime / 1000

        // Call the level's update function
        levels[Game.world.status].update(deltaTime)
    } else if (Game.world.timerEnabled) {
        Game.world.timerEnabled = false

        Game.finishLevel();
    }


    //Draw Everything
    if (Game.camera.draw) {
        Game.drawLoop.forEach(element => {
            if (element.draw) {
                element.draw(Game.ctx)
            }
        });
    }

    // If mouse is down
    if (Game.mouse.down) {
        // Make player go towards mouse
        const mousexposrel = mobileMouse.pos.x - (Game.player.x+Game.player.w/2)
        const mouseyposrel = mobileMouse.pos.y - (Game.player.y+Game.player.h/2)
        Game.player.vx += mousexposrel/1200
        Game.player.vy += mouseyposrel/1200
    }
    requestAnimationFrame(Game.update)
}

Game.update = Update