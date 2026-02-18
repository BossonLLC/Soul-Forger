// ==========================================
// 1. GLOBAL HELPER FUNCTIONS
// ==========================================

function setImageSources(cardList) {
    cardList.items.forEach(item => {
        const imgElement = item.elm.querySelector('.card-image');
        const imagePath = item.values().Image || '';
        if (imagePath && imagePath !== 'SPAN NOT FOUND') {
            const cleanPath = String(imagePath).trim().replace(/[()]/g, ''); 
            imgElement.setAttribute('src', cleanPath);
            const pathSpan = item.elm.querySelector('.Image');
            if (pathSpan) pathSpan.style.display = 'none';
        }
    });
}

function exportLuaDatabase(cardList) {
    const baseURL = "https://soul-forger.com/"; 
    let luaString = "cardDatabase = {\n";
    cardList.items.forEach(item => {
        const val = item.values();
        const name = val["Card Name"];
        const cleanPath = String(val["Image"] || "").trim().replace(/[()]/g, '');
        if (name && cleanPath) {
            luaString += `    ["${name}"] = "${baseURL}${cleanPath}",\n`;
        }
    });
    luaString += "}\ncardBack = \"" + baseURL + "firecards/cardback.png\"";
    navigator.clipboard.writeText(luaString).then(() => alert("Lua Database copied!"));
}

async function copyDeckToTTS() {
    const categoryIds = ['starting-gear-list', 'main-deck-list', 'forge-deck-list'];
    let deckString = "";
    categoryIds.forEach(id => {
        const listElement = document.getElementById(id);
        if (listElement) {
            listElement.querySelectorAll('li').forEach(item => {
                const name = item.getAttribute('data-card-name');
                const qtyInput = item.querySelector('.card-list-item-quantity');
                const qty = qtyInput ? qtyInput.value : 1;
                deckString += `${qty} ${name}\n`;
            });
        }
    });
    if (!deckString) return alert("Deck is empty!");
    await navigator.clipboard.writeText(deckString);
    alert("Decklist copied for TTS!");
}

function updateDeckCounts() {
    const categories = [
        { id: 'starting-gear-list', countId: 'starting-gear-count', limitMin: 0, limitMax: 3 }, 
        { id: 'main-deck-list', countId: 'main-deck-count', limitMin: 60, limitMax: 75 }, 
        { id: 'forge-deck-list', countId: 'forge-deck-count', limitMin: 15, limitMax: 15 },
        { id: 'token-deck-list', countId: 'token-deck-count', limitMin: 0, limitMax: Infinity }
    ];
    categories.forEach(cat => {
        const list = document.getElementById(cat.id);
        const span = document.getElementById(cat.countId);
        if (list && span) {
            let total = 0;
            list.querySelectorAll('li').forEach(li => {
                const qtyInput = li.querySelector('.card-list-item-quantity');
                total += parseInt(qtyInput ? qtyInput.value : 0);
            });
            
            if (cat.id === 'main-deck-list') {
                span.textContent = `${total}/60-75`;
            } else if (cat.id === 'token-deck-list') {
                span.textContent = total;
            } else {
                span.textContent = `${total}/${cat.limitMax}`;
            }
            span.style.color = (total < cat.limitMin || (cat.limitMax !== Infinity && total > cat.limitMax)) ? 'red' : 'green';
        }
    });
}

// ==========================================
// 2. MASTER SEARCH & FILTER LOGIC
// ==========================================

const handleCombinedSearchAndFilter = (list) => {
    const controls = {
        'Card Name': document.getElementById('name-search'),
        'Effect': document.getElementById('effect-search'),
        'Ronum': document.getElementById('ronum-search'),
        'Sub Type': document.getElementById('subtype-search'),
        'Power': document.getElementById('on-guard-power-search'),
        'Off-guard Power': document.getElementById('off-guard-power-search'),
        'Endurance': document.getElementById('endurance-search'),
        'Experience': document.getElementById('experience-search'),
        'Hands': document.getElementById('hand-search'),
        'Type': document.getElementById('type-filter'),
        'Faction': document.getElementById('faction-filter'),
        'Action Speed': document.getElementById('speed-filter')
    };

    const startingGearActive = document.getElementById('starting-gear-filter').checked;
    const tokensActive = document.getElementById('tokens-filter').checked;

    list.filter(item => {
        const val = item.values();
        
        if (startingGearActive || tokensActive) {
            const cost = String(val['Cost'] || "").toLowerCase();
            let passCheck = false;
            if (startingGearActive && cost.includes('starting gear')) passCheck = true;
            if (tokensActive && cost.includes('token')) passCheck = true;
            if (!passCheck) return false;
        }

        for (const key in controls) {
            const el = controls[key];
            if (el && el.value && el.value !== "" && el.value !== "all") {
                const query = el.value.toLowerCase().trim();
                const itemVal = String(val[key] || "").toLowerCase();
                if (el.tagName === 'SELECT' && key !== 'Action Speed') {
                    if (itemVal !== query) return false;
                } else {
                    if (!itemVal.includes(query)) return false;
                }
            }
        }
        return true;
    });
};

// ==========================================
// 3. MAIN INITIALIZATION
// ==========================================

async function initCardGallery() {
    try {
        const response = await fetch('SFD.json');
        const cardData = await response.json();

        const options = {
            valueNames: ["Card Name", "Ronum", "Cost", "Type", "Action Type", "Sub Type", "Power", "Off-guard Power", "Effect", "Image", "Endurance", "Experience", "Hands", "Faction", "Action Speed"],
            item: `<li class="card-item"><h4 class="Card Name">{Card Name}</h4><img class="card-image" loading="lazy" alt=""><span class="Image" style="display:none">{Image}</span><div class="card-details"><p>Cost: <span class="Cost">{Cost}</span> | Type: <span class="Type">{Type}</span></p><p>A/OG: <span class="Power">{Power}</span> | <span class="Off-guard Power">{Off-guard Power}</span></p><p>Effect: <span class="Effect">{Effect}</span></p></div><button class="add-to-deck-btn">Add to Deck</button></li>`
        };

        var cardList = new List('cards-gallery', options, cardData);
        setImageSources(cardList);
        cardList.on('updated', () => setImageSources(cardList));

        // Listeners for Search
        const controlIds = ['name-search', 'effect-search', 'ronum-search', 'subtype-search', 'on-guard-power-search', 'off-guard-power-search', 'endurance-search', 'experience-search', 'hand-search', 'type-filter', 'faction-filter', 'speed-filter', 'starting-gear-filter', 'tokens-filter'];
        controlIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const ev = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'keyup';
                el.addEventListener(ev, () => handleCombinedSearchAndFilter(cardList));
            }
        });

        // Buttons
        document.getElementById('export-lua-db-btn').onclick = () => exportLuaDatabase(cardList);
        document.getElementById('copy-tts-btn').onclick = copyDeckToTTS;
        if(document.getElementById('download-button')) {
            document.getElementById('download-button').onclick = generateDeckPDF;
        }

// ==========================================
// DECK BUILDER LOGIC (DIAGNOSTIC VERSION)
// ==========================================
const galleryElement = document.getElementById('cards-gallery');

if (galleryElement) {
    console.log("SUCCESS: Gallery container found. Listening for clicks...");
    
    galleryElement.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-deck-btn');
        
        // If we didn't click the button, stop.
        if (!btn) return; 

        console.log("1. CLICK DETECTED: 'Add to Deck' button pressed.");

        const cardItem = btn.closest('.card-item');
        if (!cardItem) return console.error("ERROR: Could not find the card container (.card-item)");

        // SCRAPING DATA
        const name = cardItem.querySelector('h4').textContent.trim();
        const typeEl = cardItem.querySelector('.Type');
        const costEl = cardItem.querySelector('.Cost');
        const imgEl = cardItem.querySelector('.card-image');

        if (!typeEl || !costEl) {
            return console.error("ERROR: Missing .Type or .Cost in the card HTML template!");
        }

        const type = typeEl.textContent.trim();
        const cost = costEl.textContent.trim().toLowerCase();
        const imgPath = imgEl ? imgEl.getAttribute('src') : "";

        console.log(`2. SCRAPED DATA: Name: ${name}, Type: ${type}, Cost: ${cost}`);

        // SORTING LOGIC
        let listId = 'main-deck-list';
        let maxCopies = 4;

        if (cost.includes('starting gear')) {
            listId = 'starting-gear-list';
            maxCopies = 1;
        } else if (cost.includes('token')) {
            listId = 'token-deck-list';
            maxCopies = Infinity;
        } else if (type === 'Equipment') {
            listId = 'forge-deck-list';
            maxCopies = 4;
        }

        console.log(`3. TARGETING: Sending card to #${listId}`);

        const targetList = document.getElementById(listId);
        if (!targetList) {
            return console.error(`ERROR: Could not find the list in HTML with id="${listId}"`);
        }

        // ADDING TO LIST
        let existing = targetList.querySelector(`li[data-card-name="${name}"]`);

        if (existing) {
            console.log("4. UPDATING: Card exists, increasing quantity.");
            const input = existing.querySelector('.card-list-item-quantity');
            if (parseInt(input.value) < maxCopies) {
                input.value = parseInt(input.value) + 1;
            }
        } else {
            console.log("4. ADDING: Creating new list item.");
            const li = document.createElement('li');
            li.setAttribute('data-card-name', name);
            li.setAttribute('data-image-path', imgPath);
            li.className = 'deck-list-item';
            li.innerHTML = `
                <button class="remove-btn" style="color:red; margin-right:8px;">X</button>
                <span>${name}</span>
                <input type="number" class="card-list-item-quantity" value="1" min="1" max="${maxCopies}" style="width:40px; float:right;">
            `;
            
            li.querySelector('.remove-btn').onclick = () => { li.remove(); updateDeckCounts(); };
            li.querySelector('input').onchange = () => updateDeckCounts();
            
            targetList.appendChild(li);
        }
        
        updateDeckCounts();
        console.log("5. FINISHED: List updated successfully.");
    });
} else {
    console.error("CRITICAL ERROR: Could not find <div id='cards-gallery'> in your HTML!");
}
    } catch (err) { 
        console.error('Init Error:', err); 
    } // Closed the try block correctly
} // Closed the function correctly

window.onload = initCardGallery;

// --- KEEP YOUR PDF GENERATION CODE BELOW THIS LINE ---
function generateDeckPDF() {
    alert("PDF function is currently empty, but I'm not crashing anymore!");
}
