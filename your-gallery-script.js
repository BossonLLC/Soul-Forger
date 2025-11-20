// your-gallery-script.js

// --- 1. INITIALIZE LIST.JS AND THE DECK BUILDER ---

async function initCardGallery() {
    try {
        // *** IMPORTANT: Update this path! ***
        // Ensure this points to your JSON file (e.g., './data/cards.json')
        const response = await fetch('path/to/your-card-data.json'); 
        const cardData = await response.json();

        // 2. Define the List.js options
        const options = {
            // These MUST match the keys in your JSON data exactly.
            valueNames: [
                "Card Name", "Ronum", "Cost", "Type", "Action Type", "Sub Type",
                "Attack", "Off-guard Attack", "Effect",
                // NEW: Map the 'Image' field from JSON to a data attribute (data-image-path)
                { name: 'Image', attr: 'data-image-path' } 
            ],
            
            item: `
                <li class="card-item">
                    <h4 class="Card Name"></h4>
                    
                    <img class="card-image" 
                         data-card-name="" 
                         data-card-id="" 
                         alt=""
                         data-image-path> 
                         
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


        // --- 2. DYNAMIC CONTENT RENDERING (Image Fix) ---

        // This runs whenever List.js updates (on load, after search, or after filter)
        cardList.on('updated', function() {
            cardList.items.forEach(item => {
                const imgElement = item.elm.querySelector('.card-image');
                
                // 1. Get the path from the data-image-path attribute set by List.js
                const imagePath = imgElement.getAttribute('data-image-path');
                
                if (imagePath && !imgElement.getAttribute('src')) { // Only run if src hasn't been set
                    // 2. Remove the outer parentheses from the path: (sftest/021_Front.png) -> sftest/021_Front.png
                    const cleanPath = imagePath.replace(/[()]/g, '');
                    
                    // 3. Set the actual image source
                    imgElement.setAttribute('src', cleanPath);
                    
                    // 4. Also set the card name for the deck builder logic
                    const cardName = item.values()['Card Name'];
                    imgElement.setAttribute('data-card-name', cardName); 
                }
            });
        });


        // --- 3. FILTERING LOGIC ---
        
        document.querySelectorAll('.filter').forEach(button => {
            button.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                
                cardList.filter(function(item) {
                    // Assuming 'Type' in your JSON is what determines Faction/Group
                    // If your filters need to look at another field (e.g., 'Fire', 'Dark', etc.), change '.Type' here.
                    return item.values().Type === filterValue; 
                });
            });
        });


        // --- 4. DECK BUILDER LOGIC (Event Delegation) ---

        const selectedCardsList = document.getElementById('selected-cards');
        const cardsGallery = document.getElementById('cards-gallery');

        cardsGallery.addEventListener('click', (event) => {
            const addButton = event.target.closest('.add-to-deck-btn');

            if (addButton) {
                const cardItem = addButton.closest('.card-item');
                if (!cardItem) return;

                // Get card name from the data-card-name attribute we set above
                const cardName = cardItem.querySelector('.card-image').getAttribute('data-card-name');
                const cardImageSrc = cardItem.querySelector('.card-image').getAttribute('src');

                const cardListItem = selectedCardsList.querySelector(`li[data-card-name="${cardName}"]`);
                
                if (cardListItem) {
                    // Increment quantity
                    const quantityInput = cardListItem.querySelector('.card-list-item-quantity');
                    quantityInput.value = parseInt(quantityInput.value) + 1;
                } else {
                    // Add new card to list
                    const newCardListItem = document.createElement('li');
                    newCardListItem.setAttribute('data-card-name', cardName);
                    
                    const newCardListItemImage = document.createElement('img');
                    newCardListItemImage.setAttribute('src', cardImageSrc);
                    newCardListItemImage.setAttribute('class', 'card-list-item-image');
                    
                    const newCardListItemName = document.createElement('span');
                    newCardListItemName.textContent = cardName;
                    
                    const newCardListItemQuantity = document.createElement('input');
                    newCardListItemQuantity.setAttribute('type', 'number');
                    newCardListItemQuantity.setAttribute('class', 'card-list-item-quantity');
                    newCardListItemQuantity.setAttribute('min', '1');
                    newCardListItemQuantity.setAttribute('max', '99');
                    newCardListItemQuantity.setAttribute('value', '1');

                    newCardListItem.appendChild(newCardListItemImage);
                    newCardListItem.appendChild(newCardListItemName);
                    newCardListItem.appendChild(newCardListItemQuantity);
                    
                    selectedCardsList.appendChild(newCardListItem);
                }
            }
        });

    } catch (error) {
        console.error('Error in Card Gallery setup:', error);
    }
}

// Run the main initialization function
window.onload = initCardGallery;

// --- 5. PDF GENERATION LOGIC ---

function generateDeckPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const deckName = "My Soul-Forger Deck"; 
    doc.text(deckName, 10, 10); 
    
    let yPosition = 20; 

    const selectedCardsList = document.getElementById('selected-cards');
    const cardListItems = selectedCardsList.querySelectorAll('li');

    if (cardListItems.length === 0) {
        alert("Your deck is empty! Add some cards first.");
        return;
    }

    doc.setFontSize(12);

    cardListItems.forEach(item => {
        const cardName = item.getAttribute('data-card-name');
        const quantityInput = item.querySelector('.card-list-item-quantity');
        const quantity = quantityInput ? quantityInput.value : '1';

        const deckLine = `${quantity} x ${cardName}`;
        
        doc.text(deckLine, 10, yPosition);
        
        yPosition += 8; 

        if (yPosition > 280) { 
            doc.addPage();
            yPosition = 10; 
        }
    });

    doc.save(`${deckName}.pdf`);
}

// Attach the PDF function to the download button
document.getElementById('download-button').addEventListener('click', generateDeckPDF);
