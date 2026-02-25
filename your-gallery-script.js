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
    // Re-initialize magnifier whenever images are refreshed
    initMagnifier();
}

// --- ADD THIS MAGNIFIER FUNCTION ---
function initMagnifier() {
    const cards = document.querySelectorAll('.card-image');
    const zoomResult = document.getElementById('zoom-result'); // Ensure you have this ID in your HTML

    cards.forEach(card => {
        card.onmouseover = function() {
            if(zoomResult) {
                zoomResult.style.backgroundImage = `url('${this.src}')`;
                zoomResult.style.display = "block";
            }
        };
        card.onmouseout = function() {
            if(zoomResult) zoomResult.style.display = "none";
        };
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
    
    luaString += "}\n";
    luaString += "cardBack = \"" + baseURL + "firecards/cardback.png\"";
    
    navigator.clipboard.writeText(luaString).then(() => {
        alert("Lua Database copied!");
    });
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
        
        // Initial Image setup
        setImageSources(cardList);
        
        // Setup listeners
        cardList.on('updated', () => {
            setImageSources(cardList);
        });

        const controlIds = ['name-search', 'effect-search', 'ronum-search', 'subtype-search', 'on-guard-power-search', 'off-guard-power-search', 'endurance-search', 'experience-search', 'hand-search', 'type-filter', 'faction-filter', 'speed-filter', 'starting-gear-filter', 'tokens-filter'];
        controlIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const ev = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'keyup';
                el.addEventListener(ev, () => handleCombinedSearchAndFilter(cardList));
            }
        });

        document.getElementById('export-lua-db-btn').onclick = () => exportLuaDatabase(cardList);
        document.getElementById('copy-tts-btn').onclick = copyDeckToTTS;

        // Deck Builder Event Delegation
        const galleryElement = document.getElementById('cards-gallery');
        if (galleryElement) {
            galleryElement.addEventListener('click', (e) => {
                const btn = e.target.closest('.add-to-deck-btn');
                if (!btn) return; 

                const cardItem = btn.closest('.card-item');
                const name = cardItem.querySelector('h4').textContent.trim();
                const type = cardItem.querySelector('.Type').textContent.trim();
                const cost = cardItem.querySelector('.Cost').textContent.trim().toLowerCase();
                const imgPath = cardItem.querySelector('.card-image').src;

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

                const targetList = document.getElementById(listId);
                let existing = targetList.querySelector(`li[data-card-name="${name}"]`);

                if (existing) {
                    const input = existing.querySelector('.card-list-item-quantity');
                    if (parseInt(input.value) < maxCopies) {
                        input.value = parseInt(input.value) + 1;
                    }
                } else {
                    const li = document.createElement('li');
                    li.setAttribute('data-card-name', name);
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
            });
        }
    } catch (err) { 
        console.error('Init Error:', err); 
    }
}

window.onload = initCardGallery;
