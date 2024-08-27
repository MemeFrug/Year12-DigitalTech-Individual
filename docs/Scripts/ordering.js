console.log("loaded ordering.js");

// Set up the ordering UI

const buttons = {
    food: document.getElementById("foodButton"),
    drinks: document.getElementById("drinksButton"),
    other: document.getElementById("otherButton"),
    submit: document.getElementById("submitButton")
}

const orderingUI = {
    data: {
        food: [[],[],[]],
        drinks: [[],[],[]],
        other: [[],[],[]]
    },

    //Initialise    
    init: () => {
        buttons.submit.addEventListener("mouseup", orderingUI.submit)
        buttons.food.addEventListener("mouseup", () => orderingUI.changeMenu(val.categories.Food))
        buttons.drinks.addEventListener("mouseup", () => orderingUI.changeMenu(val.categories.Drinks))
        buttons.other.addEventListener("mouseup", () => orderingUI.changeMenu(val.categories.Other))
    
        // setUpOrdering(pickableItems.returnRandomList(3))
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
                const count1 = orderingUI.data.food[0].length
                const count2 = orderingUI.data.food[1].length
                const count3 = orderingUI.data.food[2].length

                // Not Returning correct minimum
                const minimumCount = Math.min(count1, count2, count3)
                let pickedColumn = undefined
                console.log(minimumCount, count1, count2, count3);

                switch (minimumCount) {
                    case count1:
                        pickedColumn = document.getElementById("foodColumn1");
                        break;
                    case count2:
                        pickedColumn = document.getElementById("foodColumn2");
                        break;
                    case count3:
                        pickedColumn = document.getElementById("foodColumn3");
                        break
                    default:
                        console.warn("This shouldnt happen.");
                        break;
                } 
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

                                setUpOrdering(pickableItems.returnList())
}

orderingUI.init()