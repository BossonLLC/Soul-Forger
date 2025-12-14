// your-gallery-script.js

// --- HELPER FUNCTIONS FOR DECK MANAGEMENT ---

// 1. Function to update the card counts displayed in the deck builder panel
function updateDeckCounts() {
    const categories = [
        { id: 'starting-gear-list', countId: 'starting-gear-count', limit: 3, printable: true },
        { id: 'main-deck-list', countId: 'main-deck-count', limit: 75, printable: true },
        { id: 'forge-deck-list', countId: 'forge-deck-count', limit: 15, printable: true },
        { id: 'token-deck-list', countId: 'token-deck-count', limit: Infinity, printable: false } // No limit for tokens
    ];

    categories.forEach(category => {
        const listElement = document.getElementById(category.id);
        const countElement = document.getElementById(category.countId);
        let currentCount = 0;

        if (listElement) {
            listElement.querySelectorAll('li').forEach(item => {
                const quantityInput = item.querySelector('.card-list-item-quantity');
                const quantity = quantityInput ? parseInt(quantityInput.value) || 0 : 0;
                currentCount += quantity;
            });
        }
        
        if (countElement) {
            countElement.textContent = currentCount;
            
            // Apply color coding for limits (skip tokens as limit is Infinity)
            if (category.limit !== Infinity) {
                if (currentCount > category.limit) {
                    countElement.style.color = 'red';
                } else {
                    countElement.style.color = 'black';
                }
            }
        }
    });
}

// 2. TTS Export Function (NEW FEATURE)
function exportTTSDeckList() {
    const categories = [
        { id: 'main-deck-list', header: 'Main Deck' },
        { id: 'forge-deck-list', header: 'Forge Deck' },
        { id: 'starting-gear-list', header: 'Starting Gear' },
        { id: 'token-deck-list', header: 'Tokens' }
    ];
    
    let exportText = "Soul-Forger TTS Deck List\n\n";

    categories.forEach(category => {
        const listElement = document.getElementById(category.id);
        if (listElement && listElement.children.length > 0) {
            exportText += `--- ${category.header} ---\n`;
            listElement.querySelectorAll('li').forEach(item => {
                const cardName = item.getAttribute('data-card-name');
                const quantityInput = item.querySelector('.card-list-item-quantity');
                const quantity = quantityInput ? parseInt(quantityInput.value) || 0 : 0;
                if (quantity > 0) {
                    exportText += `${quantity}x ${cardName}\n`;
                }
            });
            exportText += "\n";
        }
    });

    if (exportText.trim() === "Soul-Forger TTS Deck List") {
        alert("The deck list is empty. Add cards before exporting.");
        return;
    }

    // Create a Blob and prompt the user to download
    const blob = new Blob([exportText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Soul_Forger_Decklist.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Deck list exported to Soul_Forger_Decklist.txt!");
}


// --- 1. INITIALIZE LIST.JS AND MAIN GALLERY SETUP ---

// Helper function to handle image source setting
function setImageSources(cardList) {
    console.log('*** STARTING IMAGE FIX LOGIC (FORCED) ***');
    
    cardList.items.forEach(item => {
        const imgElement = item.elm.querySelector('.card-image');
        const imagePath = item.values().Image || 'SPAN NOT FOUND';
        
        if (imagePath && imagePath !== 'SPAN NOT FOUND') {
            
            // Clean the path (CRITICAL: MUST remove literal parentheses)
            const cleanPath = String(imagePath).trim().replace(/[()]/g, ''); 
            
            // DEBUG LINES REMOVED for clean code deployment

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
                "Power", "Off-guard Power", "Effect", 
                "Image", "Endurance", "Experience", "Hands",
                "Faction", "Action Speed" 
            ], 
            
            // Replace the entire 'item' definition in options with this:
            item: `<li class="card-item"><h4 class="Card Name">{Card Name}</h4><img class="card-image" loading="lazy" data-card-name="{Card Name}" data-card-id="{Ronum}" alt=""><span class="Image">{Image}</span><div class="card-details"><p>Cost: <span class="Cost">{Cost}</span> | Type: <span class="Type">{Type}</span></p><p class="attack-line">A/OG Attack: <span class="Power">{Power}</span> <span class="Off-guard-Power off-guard-display-fix">| {Off-guard Power}</span></p><p>Effect: <span class="Effect">{Effect}</span></p></div><button class="add-to-deck-btn">Add to Deck</button></li>`
        }; 

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
        
        // --- NEW 6.1 TTS EXPORT BUTTON LISTENER ---
        const exportButton = document.getElementById('export-deck-btn');
        if (exportButton) {
            exportButton.addEventListener('click', exportTTSDeckList);
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
                    
                    // Read data from the rendered spans
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
                        
                        // --- DECK COUNT FIX: Add listener to quantity input ---
                        quantityInput.addEventListener('change', updateDeckCounts);
                        // -----------------------------------------------------

                        // Remove Button
                        const removeButton = document.createElement('button');
                        removeButton.textContent = 'X';
                        removeButton.setAttribute('class', 'remove-from-deck-btn');
                        removeButton.addEventListener('click', () => {
                            newCardListItem.remove();
                            updateDeckCounts(); // Update count when a card is removed
                        });

                        newCardListItem.appendChild(removeButton);
                        newCardListItem.appendChild(nameSpan);
                        newCardListItem.appendChild(quantityInput);
                        
                        targetList.appendChild(newCardListItem);
                    }
                    
                    updateDeckCounts(); // Update count when a card is added
                }
            });
        }
        
    // *** CRITICAL FIX: The closing bracket for the try block was placed here instead of initCardGallery ***
    // (It was at line 372 in your original file block)
    } catch (error) {
        console.error('CRITICAL ERROR: Main Initialization Failed:', error);
    }
    // End of initCardGallery function logic above this line
    
    // Initial call to set counts to zero (or whatever they start at)
    updateDeckCounts(); 

    // --- 10. ROBUST SCROLL-TO-TOP LOGIC ---
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    if (scrollToTopBtn) {
        // Function to show/hide the button
        window.addEventListener('scroll', function() {
            if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                scrollToTopBtn.style.display = "block";
            } else {
                scrollToTopBtn.style.display = "none";
            }
        });

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

} 
// ---------------------------------------------

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
    const cardWidth = 63.5;  // Standard TCG Width (2.5 inches)
    const cardHeight = 88.9; // Standard TCG Height (3.5 inches)
    const padding = 2;       // Spacing between cards (2mm)
    const margin = 3;       // Page margins
    
    let x = margin;
    let y = margin;
    let cardsPerRow = Math.floor((doc.internal.pageSize.getWidth() - (2 * margin)) / (cardWidth + padding));
    let cardsInRow = 0;
    
    
    // CRITICAL: Filter out Tokens for PDF printing (can be re-added if needed)
    const categoryLists = [
        { id: 'starting-gear-list', header: 'Starting Gear' },
        { id: 'main-deck-list', header: 'Main Deck' },
        { id: 'forge-deck-list', header: 'Forge Deck' }
        // Tokens are excluded from the default printable list
    ];


    // 1. COLLECT ALL CARDS AND QUANTITIES (RE-USED LOGIC) ---
    let allCardsToPrint = []; 

    console.log('--- PDF GENERATION DEBUG START ---');

    categoryLists.forEach(category => {
        const listElement = document.getElementById(category.id);
        
        if (!listElement) {
            console.warn(`List element not found for ID: ${category.id}. Skipping.`);
            return; // Skip this category if the UL element is missing
        }
        
        const cardListItems = listElement.querySelectorAll('li'); 
        
        console.log(`Checking List: ${category.id}. Found ${cardListItems.length} list items.`);
        
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

    if (allCardsToPrint.length === 0) {
        alert("Your printable deck is empty! Add some cards first.");
        return;
    }

    // 2. PROCESS AND ADD IMAGES TO PDF
    
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

            // Check for page break (new row or new page)
            if (cardsInRow >= cardsPerRow) {
                x = margin;
                y += cardHeight + padding;
                cardsInRow = 0;
            }

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
