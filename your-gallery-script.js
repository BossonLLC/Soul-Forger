// your-gallery-script.js

// --- 1. INITIALIZE LIST.JS AND MAIN GALLERY SETUP ---

// Helper function to handle image source setting
function setImageSources(cardList) {
    console.log('*** STARTING IMAGE FIX LOGIC (FORCED) ***'); 
    
    cardList.items.forEach(item => {
        const imgElement = item.elm.querySelector('.card-image');
        const pathElement = item.elm.querySelector('.Image'); 
        
        // Use item.values().Image to access the raw data directly, which is more reliable
        // than reading textContent from a newly created DOM element.
        const imagePath = item.values().Image || 'SPAN NOT FOUND'; 
        
        // NOTE: We MUST check if the src is already set to prevent infinite loop or unnecessary re-setting
        if (imagePath && imagePath !== 'SPAN NOT FOUND' && !imgElement.getAttribute('src')) { 
            
            // Clean the path (removes parentheses and leading/trailing whitespace)
            const cleanPath = String(imagePath).trim().replace(/[()]/g, '');
            
            console.log(`[DEBUG] Card: ${item.values()['Card Name']} | Final Path to Set: "${cleanPath}"`); 
            
            imgElement.setAttribute('src', cleanPath);
            
            // Optional: Hide the span element after getting the path
            const pathSpan = item.elm.querySelector('.Image');
            if (pathSpan) pathSpan.style.display = 'none';
        }
    });
}


async function initCardGallery() {
    try {
        const response = await fetch('SFD.json');
        const cardData = await response.json();

        const options = {
            valueNames: [
                "Card Name", "Ronum", "Cost", "Type", "Action Type", "Sub Type",
                "Attack", "Off-guard Attack", "Effect",
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

    // your-gallery-script.js (Around line 40)

        // 2. Initialize List.js
        var cardList = new List('cards-gallery', options, cardData); 
        console.log('List.js initialized with ' + cardList.items.length + ' cards.'); // <-- Line 43

        // ----------------------------------------------------
        // ** CRITICAL VALIDATION CHECK **
        // ----------------------------------------------------
        if (!cardList || cardList.items.length === 0) {
            console.error("List.js object failed to initialize or contains no items. Check HTML ID ('cards-gallery') and list item structure.");
            // Stop execution here if the list isn't ready
            return;
        }

        // ----------------------------------------------------
        // ** FIX: FORCE IMAGE UPDATE LOGIC TO RUN IMMEDIATELY **
        // ----------------------------------------------------
        setImageSources(cardList); // <-- This should now run ONLY if cardList is valid.

        // --- 3. DYNAMIC CONTENT RENDERING (Image Source Fix - Event Listener) ---
        // Keep the listener in case the list is searched/filtered later
        try {
            cardList.on('updated', function() { 
                setImageSources(cardList); 
            });
        } catch (e) {
            console.warn("List.js 'updated' event registration failed, but forced update already ran.", e);
        }

        // --- 4. FILTERING LOGIC ---
        const typeFilterSelect = document.getElementById('type-filter');

        if (typeFilterSelect) { 
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
        
        // --- 5. DOWNLOAD BUTTON LISTENER ---
        const downloadButton = document.getElementById('download-button');
        if (downloadButton) { 
            downloadButton.addEventListener('click', generateDeckPDF);
        }

        // --- 6. DECK BUILDER LOGIC (Event Delegation) --- 
        const selectedCardsList = document.getElementById('selected-cards');
        const cardsGallery = document.getElementById('cards-gallery');

        if (cardsGallery) { 
            cardsGallery.addEventListener('click', (event) => {
                const addButton = event.target.closest('.add-to-deck-btn');
                // ... (rest of deck builder logic is here) ...
                if (addButton) {
                    const cardItem = addButton.closest('.card-item');
                    if (!cardItem) return;

                    const cardName = cardItem.querySelector('.card-image').getAttribute('data-card-name');
                    const cardImageSrc = cardItem.querySelector('.card-image').getAttribute('src');

                    const cardListItem = selectedCardsList.querySelector(`li[data-card-name="${cardName}"]`);
                    
                    if (cardListItem) {
                        const quantityInput = cardListItem.querySelector('.card-list-item-quantity');
                        quantityInput.value = parseInt(quantityInput.value) + 1;
                    } else {
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

    } catch (error) {
        console.error('CRITICAL ERROR: Main Initialization Failed:', error);
    }
}

        // --- 7. CARD MAGNIFIER HOVER LOGIC ---
        
        const magnifier = document.getElementById('card-magnifier');
        const magnifiedImage = document.getElementById('magnified-image');
        const gallery = document.getElementById('cards-gallery');
        let hoverTimeout;

        if (gallery && magnifier && magnifiedImage) {
            
            // Function to handle showing the card
            const showMagnifier = (src) => {
                magnifiedImage.setAttribute('src', src);
                magnifier.style.display = 'block';
            };

            // Function to handle hiding the card
            const hideMagnifier = () => {
                clearTimeout(hoverTimeout);
                magnifier.style.display = 'none';
                magnifiedImage.setAttribute('src', ''); // Clear the image source
            };

            gallery.addEventListener('mouseover', (event) => {
                const imageElement = event.target.closest('.card-image');
                
                if (imageElement) {
                    // Clear any existing timeout to restart the timer
                    clearTimeout(hoverTimeout); 

                    const cardSrc = imageElement.getAttribute('src');
                    if (!cardSrc) return; // Exit if no source is set yet

                    // Set the timer for 1200ms (1.2 seconds) before showing
                    hoverTimeout = setTimeout(() => {
                        showMagnifier(cardSrc);
                    }, 500); // Adjust this delay (1000ms is 1 second)
                }
            });

            gallery.addEventListener('mouseout', (event) => {
                // If the mouse leaves any part of the gallery, hide the magnifier
                hideMagnifier();
            });
        }
// Run the main initialization function only after the entire page is loaded
window.onload = initCardGallery;

// --- 8. PDF GENERATION LOGIC ---
// ... (generateDeckPDF function remains the same) ...
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
