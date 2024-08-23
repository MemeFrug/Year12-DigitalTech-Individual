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
        buttons.food.addEventListener("mouseup", () => orderingUI.changeMenu(val.categories.Food))
        buttons.drinks.addEventListener("mouseup", () => orderingUI.changeMenu(val.categories.Drinks))
        buttons.other.addEventListener("mouseup", () => orderingUI.changeMenu(val.categories.Other))
    
        setUpOrdering(pickableItems.returnList())
    },
    changeMenu: (menu) => {
        /*
        // menu is food if = 0
        // menu is drinks if = 1
        // menu is other if = 2
        */
        console.log("Changing menu to", menu);
        switch (i) {
            case i = val.categories.Food:
                
                break;
            case i = val.categories.Drinks:
                
                break;
            case i = val.categories.Other:
                
                break;
        
            default:
                break;
        }
    },
    submit: () => {
        console.log("Submitting");

    }
}

function setUpOrdering(itemsList) {
    itemsList.forEach(item => {
        switch (item.category) {
            case i = val.categories.Food:
                let foodcolumn1 = document.getElementById("foodColumn1");
                let foodcolumn2 = document.getElementById("foodColumn2");
                let foodcolumn3 = document.getElementById("foodColumn3");
            
                let div = document.createElement("div")
                div.textContent = item.name
                foodcolumn1.appendChild(div) //Need to make it pick a suitable column
                break;
            case i = val.categories.Drinks:
                let drinkcolumn1 = document.getElementById("drinkColumn1");
                let drinkcolumn2 = document.getElementById("drinkColumn2");
                let drinkcolumn3 = document.getElementById("drinkColumn3");
            
                break;
            case i = val.categories.Other:
                let othercolumn1 = document.getElementById("otherColumn1");
                let othercolumn2 = document.getElementById("otherColumn2");
                let othercolumn3 = document.getElementById("otherColumn3");
            
                break;
        
            default:
                break;
        }
    });
}

function debugToggleOrdering() {
                                //When interacting with an NPC, open the cashier screen up
                                Game.inputType.enabled = !Game.inputType.enabled // Prevent moving the character or other key presses
                                Game.interface.toggleUserInterface()
                                Game.camera.draw = !Game.camera.draw // Prevent drawing under the UI 

                                setUpOrdering(pickableItems.returnRandomList(3))
}

orderingUI.init()