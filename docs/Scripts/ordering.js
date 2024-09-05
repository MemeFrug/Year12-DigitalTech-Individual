console.log("loaded ordering.js");

// Set up the ordering UI

const buttons = {
    food: document.getElementById("foodButton"),
    drinks: document.getElementById("drinksButton"),
    other: document.getElementById("otherButton"),
    submit: document.getElementById("submitButton")
}

const orderingUI = {
    data: [
        [[/*1*/], [/*2*/], [/*3*/]], // Food Columns
        [[], [], []], // Drink
        [[], [], []] // Other
    ],

    npcInstance: undefined,

    deltaTimeInitial: 0,

    // Player Selected Order list
    selectedOrderList: [],

    // The required Order List
    requiredOrderList: [],

    // A easier way of getting the HTML Elements
    elements: {
        food: document.getElementById("FoodMenu"),
        drinks: document.getElementById("DrinksMenu"),
        other: document.getElementById("OtherMenu"),
        orderList: document.getElementById("orderList"),
        selectedOrderList: document.getElementById("selectedOrderList"),
        orderTotal: document.getElementById("orderTotal")
    },
    newOrder: (count) => {
        // Set the current time to account for how long the menu has been up
        orderingUI.deltaTimeInitial = Game.currTime

        // Clear the order list html
        orderingUI.elements.orderList.innerHTML = ""

        //Reset the total cost

        // Get a random list to have as the order
        const randomList = pickableItems.returnRandomList(count)
        randomList.forEach(list => {
            // Add the order element to the user interface
            const listElement = document.createElement("li")
            listElement.textContent = list.name
            orderingUI.elements.orderList.appendChild(listElement)
        });
        orderingUI.requiredOrderList = randomList
    },

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
        // menu food   = 0
        // menu drinks = 1
        // menu other  = 2
        */
        console.log("Changing menu to", menu);
        switch (menu) {
            case val.categories.Food:
                orderingUI.elements.food.style.display = "flex"
                orderingUI.elements.drinks.style.display = "none"
                orderingUI.elements.other.style.display = "none"
                break;
            case val.categories.Drinks:
                orderingUI.elements.food.style.display = "none"
                orderingUI.elements.drinks.style.display = "flex"
                orderingUI.elements.other.style.display = "none"

                break;
            case val.categories.Other:
                orderingUI.elements.food.style.display = "none"
                orderingUI.elements.drinks.style.display = "none"
                orderingUI.elements.other.style.display = "flex"

                break;

            default:
                console.warn("This should never happen.")
                break;
        }
    },
    submit: () => {
        console.log("Submitting");

        // Re enable gameplay
        Game.inputType.enabled = true
        Game.interface.disableUserInterface()

        if (orderingUI.npcInstance) { // Check if the npc exists
            orderingUI.npcInstance.leaving = true // let its custom update script know its leaving 
            orderingUI.npcInstance.y = 200 // Move it out of the way
            orderingUI.npcInstance.x += 50 
            orderingUI.npcInstance.removeChildren() // Remove the interactors
        }

        // Check how many of the orders got correct.
        let copyOfRequiredList = orderingUI.requiredOrderList
        let lengthOfSelectedList = orderingUI.selectedOrderList.length
        let howManyCorrect = 0
        orderingUI.selectedOrderList.forEach(order => {
            copyOfRequiredList.forEach(reqOrder => {
                if (order == reqOrder) {
                    // Iterate the variable describing how many correct choices
                    howManyCorrect += 1;
                    // Remove the order in the copied list
                    copyOfRequiredList.splice(copyOfRequiredList.indexOf(reqOrder), 1)
                    
                }
            });
        });
        let incorrectSelections = lengthOfSelectedList - howManyCorrect
        
        // How long the menu has been up in ms
        let orderingUIOpenTime = Game.currTime-orderingUI.deltaTimeInitial
        orderingUIOpenTime = orderingUIOpenTime/1000 // Convert it into seconds

        //Add the total cost to the score, scales with how many you got right
        const scoreToAdd = howManyCorrect - incorrectSelections*2
        if (scoreToAdd <= 0) {
            Game.world.score += (scoreToAdd * 10) - 15
            console.log("added:", (scoreToAdd * 10) - 15);    
        } else if (scoreToAdd > 0) {
            Game.world.score += ((scoreToAdd*3) * 1/orderingUIOpenTime) * 10
            console.log("added:", ((scoreToAdd*3) * 1/orderingUIOpenTime) * 10);    
        }
        
        orderingUI.elements.orderTotal.textContent = "0" // Reset it back to zero dollerydoos

        // Reset the selected items
        orderingUI.elements.selectedOrderList.innerHTML = ""

        // Add the order to the game
        Game.orders.push(orderingUI.requiredOrderList) // Push the required Order List just in case the user messes up to much
        orderingUI.selectedOrderList = [] // Clear it,
        console.log(Game.orders);
    }
}

function applyUserEvents(element, item) {
    element.addEventListener("mouseup", () => {
        console.log("Clicked", element.textContent);
        const listElement = document.createElement("li")
        listElement.textContent = element.textContent
        orderingUI.elements.selectedOrderList.appendChild(listElement)
        orderingUI.selectedOrderList.push(item)

        //Update the total cost
        let ordertotal = orderingUI.elements.orderTotal.textContent
        orderingUI.elements.orderTotal.textContent = eval(ordertotal)+item.cost
    })
}

function setUpOrdering(itemsList) {
    itemsList.forEach(item => {
        let count1 = undefined
        let count2 = undefined
        let count3 = undefined
        let pickedColumn = undefined

        const div = document.createElement("div")
        div.innerHTML = item.name

        count1 = orderingUI.data[item.category][0].length
        count2 = orderingUI.data[item.category][1].length
        count3 = orderingUI.data[item.category][2].length

        const minimumCount = Math.min(count1, count2, count3)
        
        if (minimumCount == count1) {
            pickedColumn = document.getElementById(item.category+"Column1");
            orderingUI.data[item.category][0].push(div)
        } else if (minimumCount == count2) {
            pickedColumn = document.getElementById(item.category+"Column2");
            orderingUI.data[item.category][1].push(div)
        } else if (minimumCount == count3) {
            pickedColumn = document.getElementById(item.category+"Column3");
            orderingUI.data[item.category][2].push(div)
        }

        pickedColumn.appendChild(div)
        applyUserEvents(div, item)
    });
}

orderingUI.init()