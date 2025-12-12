// your-gallery-script.js

// --- 1. INITIALIZE LIST.JS AND MAIN GALLERY SETUP ---

// Helper function to handle image source setting
// your-gallery-script.js (around line 3)
function setImageSources(cardList) {
    console.log('*** STARTING IMAGE FIX LOGIC (FORCED) ***');
    
    cardList.items.forEach(item => {
        const imgElement = item.elm.querySelector('.card-image');
        const imagePath = item.values().Image || 'SPAN NOT FOUND';
        
        if (imagePath && imagePath !== 'SPAN NOT FOUND') {
            
            // Clean the path (CRITICAL: MUST remove literal parentheses)
            // If the raw path is "(path/file.png)", this turns it into "path/file.png"
            const cleanPath = String(imagePath).trim().replace(/[()]/g, ''); 
            
            // =========================================================
            // *** CRITICAL DEBUGGING LINES ***
            // You can keep these temporarily to verify the fix works!
            // =========================================================
            console.log(`[DEBUG] Card: ${item.values()['Card Name']}`);
            console.log(`[DEBUG] RAW Path: "${imagePath}"`);
            console.log(`[DEBUG] CLEAN Path: "${cleanPath}"`); // THIS SHOULD NOW SHOW 'firecards/blazemawwhelp.png'
            // =========================================================

            imgElement.setAttribute('src', cleanPath);
            
            const pathSpan = item.elm.querySelector('.Image');
            if (pathSpan) pathSpan.style.display = 'none';
        }
    });
}


async function initCardGallery() {
    try {
        const response = await fetch('SFD.json');
        const cardData = await response.json();

      // your-gallery-script.js (around line 47-50, inside initCardGallery)

        const options = {
            valueNames: [
                "Card Name", "Ronum", "Cost", "Type", "Action Type", "Sub Type",
                "Power", "Off-guard Power", "Effect", // <-- Correct JSON fields
                "Image", "Endurance", "Experience", "Hands", // <-- Adding missing fields for search/display
                "Faction", "Action Speed" // <-- Adding filter fields
            ] // <--- **THIS LINE MUST END WITH A COMMA ,**
            , // <--- **I'm adding it here for clarity, though it belongs on the line above**
            
// Replace the entire 'item' definition in options with this:
            item: `<li class="card-item"><h4 class="Card Name">{Card Name}</h4><img class="card-image" data-card-name="{Card Name}" data-card-id="{Ronum}" alt=""><span class="Image">{Image}</span><div class="card-details"><p>Cost: <span class="Cost">{Cost}</span> | Type: <span class="Type">{Type}</span></p><p class="attack-line">A/OG Attack: <span class="Power">{Power}</span> <span class="Off-guard-Power off-guard-display-fix">| {Off-guard Power}</span></p><p>Effect: <span class="Effect">{Effect}</span></p></div><button class="add-to-deck-btn">Add to Deck</button></li>`
        }; // <--- The options object must also be properly closed with }
        
        // 2. Initialize List.js
        var cardList = new List('cards-gallery', options, cardData);
        console.log('List.js initialized with ' + cardList.items.length + ' cards.'); 

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
        setImageSources(cardList); 

        // --- 3. DYNAMIC CONTENT RENDERING (Image Source Fix - Event Listener) ---
        // Keep the listener in case the list is searched/filtered later
        try {
            cardList.on('updated', function() { 
                setImageSources(cardList); 
            });
        } catch (e) {
            console.warn("List.js 'updated' event registration failed, but forced update already ran.", e);
        }

        // --- NEW DROPDOWN FILTER LOGIC (SIMPLIFIED & CONNECTED) ---
        function initializeFilter(list, filterId) {
            const selectElement = document.getElementById(filterId);
            if (selectElement) {
                selectElement.addEventListener('change', function() {
                    // CRITICAL: Call the master function to check ALL controls
                    handleCombinedSearchAndFilter(list);
                });
            }
        }

        // 4. Initialize the new dropdown filters
        initializeFilter(cardList, 'type-filter'); 
        initializeFilter(cardList, 'faction-filter');
        initializeFilter(cardList, 'speed-filter'); 


        // ------------------------------------------------------------------
        // --- 5. CUSTOM SEARCH LOGIC (TARGETED COLUMNS & DROPDOWN COMBINATION) ---
        // ------------------------------------------------------------------

        // Master function that runs ALL search and filter logic
        const handleCombinedSearchAndFilter = (list) => {
            // 1. Get references to all 12 controls (Inputs + Selects)
            const controls = {
                // Text Inputs (Search) - MUST match JSON attribute names (keys) and HTML IDs (values)
                'Card Name': document.getElementById('name-search'),
                'Effect': document.getElementById('effect-search'),
                'Ronum': document.getElementById('ronum-search'),
                'Sub Type': document.getElementById('subtype-search'),
                'Power': document.getElementById('on-guard-power-search'),
                'Off-guard Power': document.getElementById('off-guard-power-search'),
                'Endurance': document.getElementById('endurance-search'),
                'Experience': document.getElementById('experience-search'),
                'Hands': document.getElementById('hand-search'),
                // Dropdowns (Filter)
                'Type': document.getElementById('type-filter'),
                'Faction': document.getElementById('faction-filter'),
                'Action Speed': document.getElementById('speed-filter') 
            };
        
            // 1. Reset List.js filter/search state
            list.search();
            list.filter();
        
            // 2. Collect all active criteria
            const activeCriteria = [];
            let isAnyControlActive = false;
        
            for (const key in controls) {
                const element = controls[key];
                if (element) {
                    const value = element.value.toLowerCase().trim();
                    const type = element.tagName.toLowerCase(); // 'input' or 'select'
        
                    // Check if the control has a meaningful value
                    if (value && value !== "" && !value.includes("all")) {
                        isAnyControlActive = true;
                        activeCriteria.push({
                            attribute: key,
                            query: value,
                            type: type
                        });
                    }
                }
            }
        
            // 3. If nothing is active, stop here (the list is already reset above)
            if (!isAnyControlActive) {
                return;
            }
        
            // 4. Apply Custom Filtering
            list.filter(function(item) {
                let matchesAllCriteria = true;
                const itemValues = item.values();
        
                // Check against every active criteria
                for (const criteria of activeCriteria) {
                    const itemValue = itemValues[criteria.attribute];
                    if (!itemValue) continue; // Skip if the card data is missing this field
        
                    const normalizedItemValue = String(itemValue).toLowerCase();
        
                    // Check if the current card matches the criteria
                    let matches = false;
        
                    if (criteria.type === 'input') {
                        // TEXT SEARCH (Targeted check for each text box)
                        matches = normalizedItemValue.includes(criteria.query);
                    } else if (criteria.type === 'select') {
                        // DROPDOWN FILTER (Inclusion check for Action Speed, Exact match for others)
                        if (criteria.attribute === 'Action Speed') {
                            // Use .includes() for action speed to catch 'Normal, Lingering'
                            matches = normalizedItemValue.includes(criteria.query);
                        } else {
                            // Exact match for Type/Faction
                            matches = normalizedItemValue === criteria.query;
                        }
                    }
        
                    // If this card fails to match one criteria, it fails all
                    if (!matches) {
                        matchesAllCriteria = false;
                        break; 
                    }
                }
                
                return matchesAllCriteria;
            });
        };


        // 5. Attach Event Listeners to ALL controls
        // Note: The 'controls' object is now inside handleCombinedSearchAndFilter, so we
        // must reference the IDs directly here.

        const controlIds = [
            'name-search', 'effect-search', 'ronum-search', 'subtype-search',
            'on-guard-power-search', 'off-guard-power-search', 'endurance-search',
            'experience-search', 'hand-search', 'type-filter', 'faction-filter',
            'speed-filter'
        ];

        controlIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const eventType = element.tagName.toLowerCase() === 'input' ? 'keyup' : 'change';
                element.addEventListener(eventType, () => handleCombinedSearchAndFilter(cardList));
            }
        });


        // --- 6. DOWNLOAD BUTTON LISTENER ---
        const downloadButton = document.getElementById('download-button');
        if (downloadButton) { 
            downloadButton.addEventListener('click', generateDeckPDF);
        }

// --- 7. DECK BUILDER LOGIC (Event Delegation) ---
const deckListContainer = document.getElementById('deck-list-container');
const cardsGallery = document.getElementById('cards-gallery');

// Helper function to get the correct list based on card type and cost
function getTargetList(cardType, cardCost) {
    const costLower = String(cardCost).toLowerCase();
    
    // 1. Starting Gear Category: Match cards with "starting gear" in the Cost value
    if (costLower.includes('starting gear')) {
        return { id: 'starting-gear-list', name: 'Starting Gear', itemClass: 'starting-gear-card' };
    }

    // 2. Tokens Category: Match cards with "token" in the Cost value
    if (costLower.includes('token')) {
        return { id: 'token-deck-list', name: 'Tokens', itemClass: 'token-card' };
    } 
    
    // 3. Forge Deck Category (Equipment)
    else if (cardType === 'Equipment') {
        return { id: 'forge-deck-list', name: 'Forge Deck', itemClass: 'forge-card' };
    } 
    
    // 4. Main Deck Category (Creature and Action)
    else if (cardType === 'Creature' || cardType === 'Action') {
        return { id: 'main-deck-list', name: 'Main Deck', itemClass: 'main-card' };
    }
    
    // Fallback
    return { id: 'main-deck-list', name: 'Main Deck', itemClass: 'main-card' }; 
}


if (cardsGallery) {
    cardsGallery.addEventListener('click', (event) => {
        const addButton = event.target.closest('.add-to-deck-btn');
        
        if (addButton) {
            const cardItem = addButton.closest('.card-item');
            if (!cardItem) return;

            // Extract values needed for categorization and display
            const cardName = cardItem.querySelector('h4').textContent.trim();
            
            // We need to use List.js data values to get Type and Cost correctly
            // Since we can't easily access List.js item data from the HTML element,
            // we'll temporarily read the data from the rendered spans in the card-details
            const cardType = cardItem.querySelector('.Type').textContent.trim();
            const cardCost = cardItem.querySelector('.Cost').textContent.trim();
            
            const { id: listId, itemClass } = getTargetList(cardType, cardCost);
            const targetList = document.getElementById(listId);

            if (!targetList) return;

            let cardListItem = targetList.querySelector(`li[data-card-name="${cardName}"]`);
            
            if (cardListItem) {
                // Card already exists, increase quantity
                const quantityInput = cardListItem.querySelector('.card-list-item-quantity');
                quantityInput.value = parseInt(quantityInput.value) + 1;
            } else {
                // Card is new, create the list item
                const newCardListItem = document.createElement('li');
                newCardListItem.setAttribute('data-card-name', cardName);
                newCardListItem.setAttribute('class', itemClass);
                
                // Card Name (we want text only, no image)
                const nameSpan = document.createElement('span');
                nameSpan.textContent = cardName;
                nameSpan.setAttribute('class', 'card-list-item-name');
                
                // Quantity Input
                const quantityInput = document.createElement('input');
                quantityInput.setAttribute('type', 'number');
                quantityInput.setAttribute('class', 'card-list-item-quantity');
                quantityInput.setAttribute('min', '1');
                quantityInput.setAttribute('max', '99');
                quantityInput.setAttribute('value', '1');
                
                // Remove Button
                const removeButton = document.createElement('button');
                removeButton.textContent = 'X';
                removeButton.setAttribute('class', 'remove-from-deck-btn');
                removeButton.addEventListener('click', () => {
                    newCardListItem.remove();
                    // Optional: Update deck counts here if you implement a count function
                });

                newCardListItem.appendChild(removeButton);
                newCardListItem.appendChild(nameSpan);
                newCardListItem.appendChild(quantityInput);
                
                targetList.appendChild(newCardListItem);
            }
            // Optional: Call a function here to update the deck counts (0/60, etc.)
        }
    });
}
        } catch (error) {
        console.error('CRITICAL ERROR: Main Initialization Failed:', error);
    }
} // <--- CRITICAL: This closes the entire async function initCardGallery()
// ---------------------------------------------
// --- NEW REMOVE LOGIC FOR DECK LIST ITEMS ---
// Since we add the event listener directly above, we don't need a delegation listener here
// (The logic is inside the 'removeButton' listener)

// --- MAGNIFIER, PDF GENERATION, and other functions follow ---

// --- 8. CARD MAGNIFIER HOVER LOGIC ---

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

            // Set the timer for 250ms before showing
            hoverTimeout = setTimeout(() => {
                showMagnifier(cardSrc);
            }, 250);
        }
    });

    gallery.addEventListener('mouseout', (event) => {
        // If the mouse leaves any part of the gallery, hide the magnifier
        hideMagnifier();
    });
}

// Run the main initialization function only after the entire page is loaded
window.onload = initCardGallery;

// --- 9. PDF GENERATION LOGIC (UPDATED TO HANDLE CATEGORIES) ---
function generateDeckPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const deckName = "My Soul-Forger Deck"; 
    
    let yPosition = 20; 
    let cardCount = 0; // Total card count
    const margin = 10;
    const lineHeight = 8;
    
    doc.setFontSize(14);
    doc.text(deckName, margin, margin); 
    doc.setFontSize(12);

    // CRITICAL: New way to select cards from all categories
    const categoryLists = [
        { id: 'starting-gear-list', header: 'Starting Gear' },
        { id: 'main-deck-list', header: 'Main Deck' },
        { id: 'forge-deck-list', header: 'Forge Deck' },
        { id: 'token-deck-list', header: 'Tokens' }
    ];

    let isDeckEmpty = true;

    categoryLists.forEach(category => {
        const listElement = document.getElementById(category.id);
        if (!listElement) return; // Skip if element isn't found
        
        const cardListItems = listElement.querySelectorAll('li');
        
        if (cardListItems.length > 0) {
            isDeckEmpty = false;
            
            // Add Category Header to PDF
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`${category.header}:`, margin, yPosition);
            yPosition += lineHeight;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);

            cardListItems.forEach(item => {
                const cardName = item.getAttribute('data-card-name');
                const quantityInput = item.querySelector('.card-list-item-quantity');
                const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
                
                const deckLine = `${quantity} x ${cardName}`;
                
                doc.text(deckLine, margin + 5, yPosition); // Indent card list
                
                yPosition += lineHeight; 
                cardCount += quantity;

                // Check for page break
                if (yPosition > 280) { 
                    doc.addPage();
                    yPosition = 10; 
                    doc.setFontSize(10);
                }
            });
            // Add a small spacer after the category
            yPosition += (lineHeight / 2);
        }
    });

    if (isDeckEmpty) {
        alert("Your deck is empty! Add some cards first.");
        return;
    }

    // Add total count at the end
    doc.setFontSize(12);
    doc.text(`Total Cards: ${cardCount}`, margin, yPosition);

    doc.save(`${deckName}.pdf`);
}
