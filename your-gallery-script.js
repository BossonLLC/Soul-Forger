// your-gallery-script.js

// --- 1. INITIALIZE LIST.JS AND THE DECK BUILDER ---

async function initCardGallery() {
    try {
        // *** IMPORTANT: Update this path! ***
        // Ensure this points to your JSON file (e.g., './data/cards.json')
        const response = await fetch('SFD.json');
        const cardData = await response.json();

        // 2. Define the List.js options
const options = {
    // ...
    valueNames: [
        "Card Name", "Ronum", "Cost", "Type", "Action Type", "Sub Type",
        "Attack", "Off-guard Attack", "Effect",
        // FIX 1: CHANGE 'Image' back to a simple string in valueNames
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

        const cardList = new List('cards-gallery', options, cardData);
        console.log('List.js initialized with', cardList.items.length, 'cards.');

        // FIX 4: Put the event listener here so it runs after initialization
document.getElementById('download-button').addEventListener('click', generateDeckPDF);

// --- 2. DYNAMIC CONTENT RENDERING (Image Fix) ---

cardList.on('updated', function() {
    cardList.items.forEach(item => {
        const imgElement = item.elm.querySelector('.card-image');
        
        // --- 1. GET THE HIDDEN SPAN CONTAINING THE RAW PATH ---
        const pathElement = item.elm.querySelector('.Image'); 
        
        // --- 2. EXTRACT THE RAW PATH CONTENT ---
        // Use textContent to get the value, which should be the path string
        const imagePath = pathElement ? pathElement.textContent : 'SPAN NOT FOUND'; 
        
        // --- 3. CRITICAL LOGGING: Check the raw value List.js provided ---
        console.log(`[DEBUG] Card: ${item.values()['Card Name']} | Raw Content Read: "${imagePath}"`); 
        
        // Only proceed if the path was successfully read and we haven't set the src yet
        if (imagePath && imagePath !== 'SPAN NOT FOUND' && !imgElement.getAttribute('src')) { 
            
            // --- 4. CLEAN THE PATH ---
            const cleanPath = imagePath.trim().replace(/[()]/g, '');
            
            // --- 5. CRITICAL LOGGING: Check the final path to be set ---
            console.log(`[DEBUG] Final Path to Set: "${cleanPath}"`); 
            
            // --- 6. SET THE SOURCE ATTRIBUTE ---
            imgElement.setAttribute('src', cleanPath);
            
            // Hide the temporary path element
            pathElement.style.display = 'none';
        }
    });
});


// --- 3. FILTERING LOGIC (New Dropdown Logic) ---
const typeFilterSelect = document.getElementById('type-filter');

typeFilterSelect.addEventListener('change', function() {
    const selectedType = this.value;
    
    if (selectedType === 'all') {
        // Show all items (clear the filter)
        cardList.filter();
    } else {
        // Filter by the selected Type
        cardList.filter(function(item) {
            // Note: This still filters based on the 'Type' field in your JSON
            return item.values().Type === selectedType; 
        });
    }
});


        // --- 4. DECK BUILDER LOGIC (Event Delegation) ---

const selectedCardsList = document.getElementById('selected-cards');
const cardsGallery = document.getElementById('cards-gallery');

cardsGallery.addEventListener('click', (event) => {
    const addButton = event.target.closest('.add-to-deck-btn');

    if (addButton) {
        const cardItem = addButton.closest('.card-item');
        if (!cardItem) return;

        // FIX: Define cardName here by reading the attribute set in the template
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

