// your-gallery-script.js

// --- 1. INITIALIZE LIST.JS AND MAIN GALLERY SETUP ---

async function initCardGallery() {
    try {
        // Fetch card data from JSON file
        const response = await fetch('SFD.json');
        const cardData = await response.json();

        // 2. Define the List.js options
        const options = {
            valueNames: [
                "Card Name", "Ronum", "Cost", "Type", "Action Type", "Sub Type",
                "Attack", "Off-guard Attack", "Effect",
                // This value name is used to inject the image path into the template
                "Image"
            ],
            
            item: `
                <li class="card-item">
                    <h4 class="Card Name">{Card Name}</h4> 
                    
                    <img class="card-image" 
                        data-card-name="{Card Name}" 
                        data-card-id="{Ronum}" 
                        alt="">

                    <span class="Image">{Image}</span>
                    
                    <div class="card-details">
                        <p>Cost: <span class="Cost">{Cost}</span> | Type: <span class="Type">{Type}</span></p>
                        <p>A/OG Attack: <span class="Attack">{Attack}</span> / <span class="Off-guard Attack">{Off-guard Attack}</span></p>
                        <p>Effect: <span class="Effect">{Effect}</span></p>
                    </div>
                    
                    <button class="add-to-deck-btn">Add to Deck</button>
                </li>
            `
        };

        // Initialize List.js
        var cardList = new List('cards-gallery', options, cardData); 
        console.log('List.js initialized with ' + cardList.items.length + ' cards.');

        // ----------------------------------------------------
        // ** START: Event Listeners & Dynamic Logic (Scoped to prevent ReferenceErrors) **
        // ----------------------------------------------------

        // --- 2. DYNAMIC CONTENT RENDERING (Image Source Fix) ---
        // This runs after List.js populates the list (on 'updated')
        cardList.on('updated', function() {
            console.log('*** STARTING IMAGE FIX LOGIC ***'); 
            
            cardList.items.forEach(item => {
                const imgElement = item.elm.querySelector('.card-image');
                
                // Get the hidden span with the image path
                const pathElement = item.elm.querySelector('.Image'); 
                
                // Extract the content
                const imagePath = pathElement ? pathElement.textContent : 'SPAN NOT FOUND'; 
                
                // CRITICAL LOGGING: Check the raw value List.js provided
                console.log(`[DEBUG] Card: ${item.values()['Card Name']} | Raw Content Read: "${imagePath}"`); 
                
                // Set the src only if a path was found and the src attribute is currently missing
                if (imagePath && imagePath !== 'SPAN NOT FOUND' && !imgElement.getAttribute('src')) { 
                    
                    // Clean the path (removes parentheses and leading/trailing whitespace)
                    // e.g., "(sftest/021_Front.png)" -> "sftest/021_Front.png"
                    const cleanPath = imagePath.trim().replace(/[()]/g, '');
                    
                    // CRITICAL LOGGING: Check the final path to be set
                    console.log(`[DEBUG] Final Path to Set: "${cleanPath}"`); 
                    
                    // Set the image source
                    imgElement.setAttribute('src', cleanPath);
                    
                    // Hide the temporary path element
                    pathElement.style.display = 'none';
                }
            });
        });

        // --- 3. FILTERING LOGIC ---
        const typeFilterSelect = document.getElementById('type-filter');

        if (typeFilterSelect) { // Safety check
            typeFilterSelect.addEventListener('change', function() {
                const selectedType = this.value;
                
                if (selectedType === 'all') {
                    cardList.filter();
                } else {
                    cardList.filter(function(item) {
                        return item.values().Type === selectedType; 
                    });
                }
            });
        }
        
        // --- 4. DOWNLOAD BUTTON LISTENER ---
        const downloadButton = document.getElementById('download-button');
        if (downloadButton) { // Safety check
            downloadButton.addEventListener('click', generateDeckPDF);
        }

        // --- 5. DECK BUILDER LOGIC (Event Delegation) --- 
        const selectedCardsList = document.getElementById('selected-cards');
        const cardsGallery = document.getElementById('cards-gallery');

        if (cardsGallery) { // Safety check to prevent the script from crashing if element is missing
            cardsGallery.addEventListener('click', (event) => {
                const addButton = event.target.closest('.add-to-deck-btn');

                if (addButton) {
                    const cardItem = addButton.closest('.card-item');
                    if (!cardItem) return;

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
        }

        // ----------------------------------------------------
        // ** END: Event Listeners **
        // ----------------------------------------------------

    } catch (error) {
        // This catches errors in JSON fetching or List.js initialization
        console.error('Error in Card Gallery setup:', error);
    }
}

// Run the main initialization function only after the entire page is loaded
window.onload = initCardGallery;

// --- 6. PDF GENERATION LOGIC (Can remain outside as it is not called until a click) ---

function generateDeckPDF() {
    // This is safe outside initCardGallery because it's only called by an event listener
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
