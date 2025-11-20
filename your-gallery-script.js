// Function to fetch the JSON data and initialize List.js and the Deck Builder
async function initCardGallery() {
    try {
        // --- PART 1: INITIALIZE LIST.JS ---

        // 1. Fetch your JSON data from the repository
        // *** IMPORTANT: Update this path! ***
        const response = await fetch('path/to/your-card-data.json'); 
        const cardData = await response.json();

        const options = {
            // These MUST match the keys in your JSON data exactly (case and spaces)
            valueNames: [
                "Card Name", "Ronum", "Cost", "Type", "Action Type", "Sub Type",
                "Attack", "Off-guard Attack", "Effect",
            ],
            
            // This template is used to create each card in the HTML
            item: `
                <li class="card-item">
                    <h4 class="Card Name"></h4>
                    
                    <img class="card-image" 
                         src="path/to/card/images/<span class='Ronum'></span>.jpg" 
                         data-card-name="" 
                         data-card-id="" 
                         alt="">

                    <div class="card-details">
                        <p>Cost: <span class="Cost"></span> | Type: <span class="Type"></span></p>
                        <p>A/OG Attack: <span class="Attack"></span> / <span class="Off-guard Attack"></span></p>
                        <p>Effect: <span class="Effect"></span></p>
                    </div>
                    
                    <button class="add-to-deck-btn">Add to Deck</button>
                </li>
            `
        };

        const cardList = new List('cards-gallery', options, cardData);
        console.log('List.js initialized with', cardList.items.length, 'cards.');

        // 2. Implement filtering for the buttons you added in the HTML
        document.querySelectorAll('.filter').forEach(button => {
            button.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                
                // This filters the List.js items where the 'Type' value matches the button's data-filter
                cardList.filter(function(item) {
                    // Assuming 'Type' in your JSON is what determines Faction/Group
                    // If Faction is a separate field, replace '.Type' with 'item.values().Faction'
                    return item.values().Type === filterValue; 
                });
            });
        });

        
        // --- PART 2: INTEGRATE DECK BUILDER LOGIC ---

        // Get references to the deck list elements
        const selectedCardsList = document.getElementById('selected-cards');
        const cardsGallery = document.getElementById('cards-gallery');

        // *** Use Event Delegation to listen for clicks on the whole gallery container ***
        cardsGallery.addEventListener('click', (event) => {
            // Check if the clicked element (or its parent) is the 'Add to Deck' button
            const addButton = event.target.closest('.add-to-deck-btn');

            if (addButton) {
                // Find the card item (li) that contains the button
                const cardItem = addButton.closest('.card-item');
                if (!cardItem) return; // safety check

                // Get the card data from the List.js item (you need a better ID later)
                // For now, we'll use the Card Name displayed on the screen
                const cardNameElement = cardItem.querySelector('.Card.Name');
                if (!cardNameElement) return; // safety check
                
                const cardName = cardNameElement.textContent;
                const cardImageSrc = cardItem.querySelector('.card-image').getAttribute('src');


                // Your existing Deck Builder Logic starts here
                
                // Check if the card is already in the deck list
                const cardListItem = selectedCardsList.querySelector(`li[data-card-name="${cardName}"]`);
                
                if (cardListItem) {
                    // If it is, increment the quantity input
                    const quantityInput = cardListItem.querySelector('.card-list-item-quantity');
                    quantityInput.value = parseInt(quantityInput.value) + 1;
                } else {
                    // If it's not, create a new list item and add it to the deck list
                    const newCardListItem = document.createElement('li');
                    newCardListItem.setAttribute('data-card-name', cardName);
                    
                    const newCardListItemImage = document.createElement('img');
                    newCardListItemImage.setAttribute('src', cardImageSrc);
                    newCardListItemImage.setAttribute('class', 'card-list-item-image');
                    
                    const newCardListItemName = document.createElement('span');
                    newCardListItemName.textContent = cardName;
                    
                    const newCardListItemQuantity = document.createElement('input');
                    newCardListItemQuantity.setAttribute('type', 'number');
                    newCardListItemQuantity.setAttribute('class', 'card-list-item-quantity'); // Added class for easier targeting
                    newCardListItemQuantity.setAttribute('min', '1');
                    newCardListItemQuantity.setAttribute('max', '99');
                    newCardListItemQuantity.setAttribute('value', '1');

                    // Append the elements to the new list item
                    newCardListItem.appendChild(newCardListItemImage);
                    newCardListItem.appendChild(newCardListItemName);
                    newCardListItem.appendChild(newCardListItemQuantity);
                    
                    // Add the new list item to the deck list
                    selectedCardsList.appendChild(newCardListItem);
                }
            }
        });

    } catch (error) {
        console.error('Error in Card Gallery setup:', error);
    }
}

// Run the function when the page loads
window.onload = initCardGallery;





// Add this function inside your your-gallery-script.js file

function generateDeckPDF() {
    // We need to use the jspdf library which is loaded from the CDN
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const deckName = "My Soul-Forger Deck"; // You can make this user-editable later
    doc.text(deckName, 10, 10); // Title at position (x=10, y=10)
    
    let yPosition = 20; // Starting position for the card list

    // Get the list of cards in the deck
    const selectedCardsList = document.getElementById('selected-cards');
    const cardListItems = selectedCardsList.querySelectorAll('li');

    // Check if the deck is empty
    if (cardListItems.length === 0) {
        alert("Your deck is empty! Add some cards first.");
        return;
    }

    doc.setFontSize(12);

    cardListItems.forEach(item => {
        const cardName = item.getAttribute('data-card-name');
        const quantityInput = item.querySelector('.card-list-item-quantity');
        const quantity = quantityInput ? quantityInput.value : '1';

        // Format the text: Quantity x Card Name
        const deckLine = `${quantity} x ${cardName}`;
        
        // Add the line to the PDF
        doc.text(deckLine, 10, yPosition);
        
        yPosition += 8; // Move down for the next line (adjust this value for spacing)

        // If we reach the bottom of the page, add a new page
        if (yPosition > 280) { // Standard A4 page height is about 297, use 280 for margin
            doc.addPage();
            yPosition = 10; // Reset Y position on the new page
        }
    });

    // Save the PDF with a file name
    doc.save(`${deckName}.pdf`);
}

// Attach the function to the download button
document.getElementById('download-button').addEventListener('click', generateDeckPDF);


// --- Function to generate the PDF ---

function generateDeckPDF() {
    // We need to use the jspdf library which is loaded from the CDN
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const deckName = "My Soul-Forger Deck"; // You can make this user-editable later
    doc.text(deckName, 10, 10); // Title at position (x=10, y=10)
    
    let yPosition = 20; // Starting position for the card list

    // Get the list of cards in the deck
    const selectedCardsList = document.getElementById('selected-cards');
    const cardListItems = selectedCardsList.querySelectorAll('li');

    // Check if the deck is empty
    if (cardListItems.length === 0) {
        alert("Your deck is empty! Add some cards first.");
        return;
    }

    doc.setFontSize(12);

    cardListItems.forEach(item => {
        const cardName = item.getAttribute('data-card-name');
        const quantityInput = item.querySelector('.card-list-item-quantity');
        const quantity = quantityInput ? quantityInput.value : '1';

        // Format the text: Quantity x Card Name
        const deckLine = `${quantity} x ${cardName}`;
        
        // Add the line to the PDF
        doc.text(deckLine, 10, yPosition);
        
        yPosition += 8; // Move down for the next line (adjust this value for spacing)

        // If we reach the bottom of the page, add a new page
        if (yPosition > 280) { // Standard A4 page height is about 297, use 280 for margin
            doc.addPage();
            yPosition = 10; // Reset Y position on the new page
        }
    });

    // Save the PDF with a file name
    doc.save(`${deckName}.pdf`);
}



// --- Attach the PDF function to the button click ---

document.getElementById('download-button').addEventListener('click', generateDeckPDF);
