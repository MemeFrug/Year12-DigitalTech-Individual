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

    // Player Selected Order list
    selectedOrderList: [],

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
        // Clear the order list html
        orderingUI.elements.orderList.innerHTML = ""

        // Get a random list to have as the order
        const randomList = pickableItems.returnRandomList(count)
        randomList.forEach(list => {
            // Add the order element to the user interface
            const listElement = document.createElement("li")
            listElement.textContent = list.name
            orderingUI.elements.orderList.appendChild(listElement)
        });
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

        // Add the order to the game
        Game.orders.push(orderingUI.selectedOrderList)
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
        console.log(minimumCount, count1, count2, count3);
        
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

function debugToggleOrdering() {
    //When interacting with an NPC, open the cashier screen up
    Game.inputType.enabled = !Game.inputType.enabled // Prevent moving the character or other key presses
    Game.interface.toggleUserInterface()
    Game.camera.draw = !Game.camera.draw // Prevent drawing under the UI 

    orderingUI.newOrder(4)
}

orderingUI.init()