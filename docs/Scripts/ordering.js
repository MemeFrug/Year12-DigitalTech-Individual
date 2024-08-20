console.log("loaded ordering.js");

// Set up the ordering UI

const buttons = {
    food: document.getElementById("foodButton"),
    drinks: document.getElementById("drinksButton"),
    other: document.getElementById("otherButton"),
    submit: document.getElementById("submitButton")
}

const orderingUI = {
    //Initialise
    init: () => {
        buttons.submit.addEventListener("mouseup", orderingUI.submit)
        buttons.food.addEventListener("mouseup", () => orderingUI.changeMenu(0))
        buttons.drinks.addEventListener("mouseup", () => orderingUI.changeMenu(1))
        buttons.other.addEventListener("mouseup", () => orderingUI.changeMenu(2))
    },
    changeMenu: (menu) => {
        /*
        // menu is food if = 0
        // menu is drinks if = 1
        // menu is other if = 2
        */
        console.log("Changing menu to", menu);
    },
    submit: () => {
        console.log("Submitting");

    }
}

function setUpOrdering(itemsList) {
    const column1 = document.getElementById("column1");
    const column2 = document.getElementById("column2");
    const column3 = document.getElementById("column3");


}

function debugToggleOrdering() {
                                //When interacting with an NPC, open the cashier screen up
                                Game.inputType.enabled = !Game.inputType.enabled // Prevent moving the character or other key presses
                                Game.interface.toggleUserInterface()
                                Game.camera.draw = !Game.camera.draw // Prevent drawing under the UI 
}

orderingUI.init()