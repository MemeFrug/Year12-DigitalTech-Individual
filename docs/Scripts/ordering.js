console.log("loaded ordering.js");

// Set up the ordering UI

function setUpOrdering() {

}

function debugToggleOrdering() {
                                //When interacting with an NPC, open the cashier screen up
                                Game.inputType.enabled = !Game.inputType.enabled // Prevent moving the character or other key presses
                                Game.interface.toggleUserInterface()
                                Game.camera.draw = !Game.camera.draw // Prevent drawing under the UI 
}