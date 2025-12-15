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

              // --- DECK COUNTS HELPER FUNCTION ---
function updateDeckCounts() {
    const categories = [
        // Changed limit from 0 to 3 for Starting Gear
        { id: 'starting-gear-list', countId: 'starting-gear-count', limitMin: 0, limitMax: 3 }, 
        // Set min/max limits for Main Deck
        { id: 'main-deck-list', countId: 'main-deck-count', limitMin: 60, limitMax: 75 }, 
        // Set exact limit for Forge Deck (min/max are both 15)
        { id: 'forge-deck-list', countId: 'forge-deck-count', limitMin: 15, limitMax: 15 },
        // Tokens have no required limit
        { id: 'token-deck-list', countId: 'token-deck-count', limitMin: 0, limitMax: Infinity }
    ];

    categories.forEach(category => {
        const list = document.getElementById(category.id);
        const countSpan = document.getElementById(category.countId);

        if (list && countSpan) {
            let totalCards = 0;
            // Iterate over every list item in the category
            list.querySelectorAll('li').forEach(item => {
                const quantityInput = item.querySelector('.card-list-item-quantity');
                const quantity = quantityInput ? parseInt(quantityInput.value) : 0; // Use 0 if invalid
                totalCards += quantity;
            });

            // 1. Determine the count text
            let countText;
            if (category.id === 'main-deck-list') {
                countText = `${totalCards}/${category.limitMin}-${category.limitMax}`;
            } else if (category.limitMax === Infinity) {
                countText = `${totalCards}`; // For Tokens/unlimited categories
            } else {
                countText = `${totalCards}/${category.limitMax}`;
            }
            
            countSpan.textContent = countText;

            // 2. Apply visual feedback based on limits
            if (totalCards < category.limitMin) {
                countSpan.style.color = 'red'; // Too few cards
            } else if (totalCards > category.limitMax) {
                countSpan.style.color = 'red'; // Too many cards
            } else {
                // If it meets the limit (or is an unlimited category)
                countSpan.style.color = 'green'; // Use green for valid counts
            }
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
item: `<li class="card-item"><h4 class="Card Name">{Card Name}</h4><img class="card-image" loading="lazy" data-card-name="{Card Name}" data-card-id="{Ronum}" alt=""><span class="Image">{Image}</span><div class="card-details"><p>Cost: <span class="Cost">{Cost}</span> | Type: <span class="Type">{Type}</span></p><p class="attack-line">A/OG Attack: <span class="Power">{Power}</span> <span class="Off-guard-Power off-guard-display-fix">| {Off-guard Power}</span></p><p>Effect: <span class="Effect">{Effect}</span></p></div><button class="add-to-deck-btn">Add to Deck</button></li>`        }; // <--- The options object must also be properly closed with }
        
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
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++
                    // *** CRITICAL ADDITION: Ignore 'N/A' placeholder ***
                    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++
                    if (normalizedItemValue === 'n/a') {
                        continue; // If the card's value is N/A, it should not fail the filter (it's ignored).
                    }
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
            const cardType = cardItem.querySelector('.Type').textContent.trim();
            const cardCost = cardItem.querySelector('.Cost').textContent.trim();
            
            // Get the target list ID and item class
            const { id: listId, itemClass } = getTargetList(cardType, cardCost);
            const targetList = document.getElementById(listId);

            if (!targetList) return;

            // --- 1. Determine the Card Limit based on the Category ---
            let MAX_COPIES_PER_CARD = Infinity; 
            
            // Check the list ID to set the limit
            if (listId === 'starting-gear-list') {
                MAX_COPIES_PER_CARD = 1;
            } else if (listId === 'main-deck-list' || listId === 'forge-deck-list') {
                MAX_COPIES_PER_CARD = 4;
            } 
            // 'token-deck-list' defaults to Infinity, as set above.
            
            // --- 2. Check if the card already exists in the deck list ---
            let cardListItem = targetList.querySelector(`li[data-card-name="${cardName}"]`);
            
            if (cardListItem) {
                // Card already exists, increase quantity
                const quantityInput = cardListItem.querySelector('.card-list-item-quantity');
                const currentQuantity = parseInt(quantityInput.value); 
                
                // === START: CUSTOM LIMIT CHECK ===
                if (MAX_COPIES_PER_CARD !== Infinity && currentQuantity >= MAX_COPIES_PER_CARD) {
                    // Alert the user and prevent further addition
                   // alert(`Cannot add more than ${MAX_COPIES_PER_CARD} copies of ${cardName} to the ${listId.replace('-list', '').replace('-', ' ').toUpperCase()}.`);
                    return; // Stop execution here
                }
                // === END: CUSTOM LIMIT CHECK ===

                // If the limit hasn't been reached (or it's a Token card), increase quantity
                quantityInput.value = currentQuantity + 1;
                updateDeckCounts(); 	
            } else {
                // Card is new, create the list item (starts at 1)
                
                // === CHECK LIMIT FOR NEW CARD ===
                // This handles the case where the limit is 1 (Starting Gear)
                if (MAX_COPIES_PER_CARD === 1) {
                    // If the card is starting gear, we allow it to be added (quantity 1), but
                    // if they already have one, the block above would have caught it.
                    // This is mainly a redundant check, but good for clarity.
                }

                const newCardListItem = document.createElement('li');
                newCardListItem.setAttribute('data-card-name', cardName);
                newCardListItem.setAttribute('class', itemClass);
                
                // --- CRITICAL ADDITION: Store the image path directly ---
    const cardImagePath = cardItem.querySelector('.card-image').getAttribute('src');
    newCardListItem.setAttribute('data-image-path', cardImagePath); // <-- ADD THIS LINE
    // --------------------------------------------------------
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

                // Add event listener for quantity change:
                quantityInput.addEventListener('change', updateDeckCounts); // <--- ADD THIS LINE
                
                // Remove Button
                const removeButton = document.createElement('button');
                removeButton.textContent = 'X';
                removeButton.setAttribute('class', 'remove-from-deck-btn');
                removeButton.addEventListener('click', () => {
                    newCardListItem.remove();
                  updateDeckCounts();
                });

                newCardListItem.appendChild(removeButton);
                newCardListItem.appendChild(nameSpan);
                newCardListItem.appendChild(quantityInput);
                
                targetList.appendChild(newCardListItem);
            }
            updateDeckCounts();
        }
    });
}
        

    // --- 10. ROBUST SCROLL-TO-TOP LOGIC ---
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    if (scrollToTopBtn) {
        // Function to show/hide the button
        window.onscroll = function() {
            if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                scrollToTopBtn.style.display = "block";
            } else {
                scrollToTopBtn.style.display = "none";
            }
        };

        // Function to scroll to the top smoothly
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Smooth scroll animation
            });
        });
        console.log("Scroll-to-Top button listeners attached.");
    } else {
        console.warn("Scroll-to-Top button element was not found in the DOM.");
    }
    // ------------------------------------

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
// --- CRITICAL ASYNC HELPER: Converts image URL to Base64 Data URI ---
function imageUrlToBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Important for CORS if using external images
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                // Convert canvas image to Base64 JPEG data URI
                const dataURL = canvas.toDataURL('image/jpeg', 1.0); // Use JPEG for smaller file size
                resolve(dataURL);
            } catch (e) {
                reject(new Error(`Failed to process image canvas for URL: ${url}`));
            }
        };
        img.onerror = (e) => {
            console.error(`Image loading failed for URL: ${url}`, e);
            reject(new Error(`Failed to load image from URL: ${url}`));
        };
        img.src = url;
    });
}
// --- 9. PDF GENERATION LOGIC (IMAGE-BASED) ---
async function generateDeckPDF() { // <--- CRITICAL: MUST be async
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const deckName = "My Soul-Forger Deck"; 
    
// Define card layout dimensions (standard TCG card size: 63.5mm x 88.9mm)
    const cardWidth = 63.5;  // Standard TCG Width (2.5 inches)
    const cardHeight = 88.9; // Standard TCG Height (3.5 inches)
    const padding = 0;       // Spacing between cards (5mm)
    const margin = 3;       // Page margins
    
    let x = margin;
    let y = margin;
    let cardsPerRow = Math.floor((doc.internal.pageSize.getWidth() - (2 * margin)) / (cardWidth + padding));
    let cardsInRow = 0;
    

    // CRITICAL: New way to select cards from all categories
    const categoryLists = [
        { id: 'starting-gear-list', header: 'Starting Gear' },
        { id: 'main-deck-list', header: 'Main Deck' },
        { id: 'forge-deck-list', header: 'Forge Deck' },
        { id: 'token-deck-list', header: 'Tokens' }
        // NOTE: Tokens are usually NOT included in printable decks. We will skip them for now
        // to focus on printable cards. You can add them back if needed.
    ];



// 1. COLLECT ALL CARDS AND QUANTITIES (WITH DEBUGGING) ---
let allCardsToPrint = []; // **KEEP THIS DECLARATION HERE**

console.log('--- PDF GENERATION DEBUG START ---');

categoryLists.forEach(category => {
    const listElement = document.getElementById(category.id);
    
    if (!listElement) {
        console.warn(`List element not found for ID: ${category.id}. Skipping.`);
        return; // Skip this category if the UL element is missing
    }
    
    // CRITICAL: This variable must be defined inside the category loop
    const cardListItems = listElement.querySelectorAll('li'); 
    
    console.log(`Checking List: ${category.id}. Found ${cardListItems.length} list items.`);
    
    // Start of the inner loop to process each card item (which was mostly correct)
    cardListItems.forEach(item => { 
        const cardName = item.getAttribute('data-card-name');
        const imagePath = item.getAttribute('data-image-path'); // Getting path directly (our successful fix)
        
        const quantityInput = item.querySelector('.card-list-item-quantity');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        
        if (!imagePath) {
            console.warn(`[IMAGE ERROR] Card item ${cardName} is missing the data-image-path attribute. Skipping.`);
            return;
        }
        
        console.log(`Adding ${quantity} copies of: ${cardName} (Path: ${imagePath})`);
        for (let i = 0; i < quantity; i++) {
            allCardsToPrint.push({ name: cardName, path: imagePath });
        }
    });
});

console.log('Total Cards Collected for Print:', allCardsToPrint.length);
console.log('--- PDF GENERATION DEBUG END ---');
// The original check below remains:
if (allCardsToPrint.length === 0) {
    alert("Your printable deck is empty! Add some cards first.");
    return;
}

    // 2. PROCESS AND ADD IMAGES TO PDF
    
    // Add a small header/title on the first page
    //doc.setFontSize(14);
    //doc.text(`Total Cards to Print: ${allCardsToPrint.length}`, margin, y + 5);
   // y += 10;
    
    // Display a loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.textContent = 'Generating PDF with images... Please wait.';
    loadingMessage.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 20px; border: 2px solid #000; z-index: 9999;';
    document.body.appendChild(loadingMessage);

    for (let i = 0; i < allCardsToPrint.length; i++) {
        const card = allCardsToPrint[i];

        try {
            // Convert the image path (e.g., "firecards/card.png") to Base64 data
            const base64Image = await imageUrlToBase64(card.path);

            // Check if we need a page break (for new row)
            if (y + cardHeight + margin > doc.internal.pageSize.getHeight()) {
                doc.addPage();
                x = margin;
                y = margin;
                cardsInRow = 0;
            }
            
            // Check if we need a new row
            if (cardsInRow >= cardsPerRow) {
                x = margin;
                y += cardHeight + padding;
                cardsInRow = 0;
            }

            // Check for page break again (for new row on new page)
            if (y + cardHeight + margin > doc.internal.pageSize.getHeight()) {
                doc.addPage();
                x = margin;
                y = margin;
                cardsInRow = 0;
            }

            // Add the image to the PDF
            doc.addImage(base64Image, 'JPEG', x, y, cardWidth, cardHeight);
            
            // Move to the next card position
            x += cardWidth + padding;
            cardsInRow++;

        } catch (error) {
            console.error(`Error processing card ${card.name}:`, error);
            // Optionally add a placeholder text for the failed image
            doc.text(`[Image Error: ${card.name}]`, x, y + cardHeight / 2);
            x += cardWidth + padding;
            cardsInRow++;
        }
    }
    
    // 3. CLEAN UP AND SAVE
    document.body.removeChild(loadingMessage);
    doc.save(`${deckName}_Printable.pdf`);
}
