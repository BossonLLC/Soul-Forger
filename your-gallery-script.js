// ==========================================
// 1. GLOBAL HELPERS (Paths, Counts, & Exports)
// ==========================================

function setImageSources(cardList) {
    cardList.items.forEach(item => {
        const imgElement = item.elm.querySelector('.card-image');
        const imagePath = item.values().Image || '';
        if (imagePath) {
            const cleanPath = String(imagePath).trim().replace(/[()]/g, ''); 
            imgElement.setAttribute('src', cleanPath);
            const pathSpan = item.elm.querySelector('.Image');
            if (pathSpan) pathSpan.style.display = 'none';
        }
    });
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
                total += parseInt(li.querySelector('.card-list-item-quantity').value || 0);
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
    navigator.clipboard.writeText(luaString).then(() => alert("Lua Database copied for TTS!"));
}

async function copyDeckToTTS() {
    const categoryIds = ['starting-gear-list', 'main-deck-list', 'forge-deck-list'];
    let deckString = "";
    categoryIds.forEach(id => {
        const listElement = document.getElementById(id);
        if (listElement) {
            listElement.querySelectorAll('li').forEach(item => {
                const name = item.getAttribute('data-card-name');
                const qty = item.querySelector('.card-list-item-quantity').value;
                deckString += `${qty} ${name}\n`;
            });
        }
    });
    if (!deckString) return alert("Deck is empty!");
    await navigator.clipboard.writeText(deckString);
    alert("Decklist copied! Paste into your TTS deck importer.");
}

// ==========================================
// 2. SEARCH & FILTER ENGINE
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

    const startingGearActive = document.getElementById('starting-gear-filter')?.checked;
    const tokensActive = document.getElementById('tokens-filter')?.checked;

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
            if (el && el.value && el.value !== "" && !el.value.toLowerCase().includes("all")) {
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

        const cardList = new List('cards-gallery', options, cardData);
        setImageSources(cardList);
        cardList.on('updated', () => setImageSources(cardList));

        // --- ATTACH BUTTONS ---
        document.getElementById('export-lua-db-btn').onclick = () => exportLuaDatabase(cardList);
        document.getElementById('copy-tts-btn').onclick = copyDeckToTTS;
        document.getElementById('download-button').onclick = generateDeckPDF;
        
        document.getElementById('clear-filters-btn').onclick = () => {
            document.querySelectorAll('.filter-input, select, .checkbox-filter').forEach(el => {
                if (el.type === 'checkbox') el.checked = false;
                else el.value = (el.tagName === 'SELECT' ? 'all' : '');
            });
            cardList.filter();
            cardList.search();
        };

        // --- ATTACH SEARCH LISTENERS ---
        const controlIds = ['name-search', 'effect-search', 'ronum-search', 'subtype-search', 'on-guard-power-search', 'off-guard-power-search', 'endurance-search', 'experience-search', 'hand-search', 'type-filter', 'faction-filter', 'speed-filter', 'starting-gear-filter', 'tokens-filter'];
        controlIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const ev = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'keyup';
                el.addEventListener(ev, () => handleCombinedSearchAndFilter(cardList));
            }
        });

        // --- DECK BUILDER LOGIC (FIXED) ---
        const gallery = document.getElementById('cards-gallery');
        gallery.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-deck-btn');
            if (!btn) return;

            const cardItem = btn.closest('.card-item');
            const name = cardItem.querySelector('h4').textContent.trim();
            const type = cardItem.querySelector('.Type').textContent.trim();
            const cost = cardItem.querySelector('.Cost').textContent.trim().toLowerCase();
            const imgPath = cardItem.querySelector('.card-image').getAttribute('src');

            // Category Selection Logic
            let listId = 'main-deck-list';
            let maxCopies = 4;

            if (cost.includes('starting gear')) { listId = 'starting-gear-list'; maxCopies = 1; }
            else if (cost.includes('token')) { listId = 'token-deck-list'; maxCopies = Infinity; }
            else if (type === 'Equipment') { listId = 'forge-deck-list'; maxCopies = 4; }

            const targetList = document.getElementById(listId);
            if (!targetList) return console.error("Missing list: " + listId);

            let existing = targetList.querySelector(`li[data-card-name="${name}"]`);

            if (existing) {
                const input = existing.querySelector('.card-list-item-quantity');
                if (parseInt(input.value) < maxCopies) {
                    input.value = parseInt(input.value) + 1;
                }
            } else {
                const li = document.createElement('li');
                li.setAttribute('data-card-name', name);
                li.setAttribute('data-image-path', imgPath);
                li.style.listStyle = "none";
                li.innerHTML = `
                    <button class="remove-btn" style="color:red; font-weight:bold; margin-right:10px; border:none; background:none; cursor:pointer;">X</button>
                    <span>${name}</span>
                    <input type="number" class="card-list-item-quantity" value="1" min="1" max="${maxCopies}" style="width:40px; float:right;">
                `;
                li.querySelector('.remove-btn').onclick = () => { li.remove(); updateDeckCounts(); };
                li.querySelector('input').onchange = (ev) => {
                    if (parseInt(ev.target.value) > maxCopies) ev.target.value = maxCopies;
                    updateDeckCounts();
                };
                targetList.appendChild(li);
            }
            updateDeckCounts();
        });

    } catch (err) { console.error('Init Error:', err); }
}

window.onload = initCardGallery;

// --- PDF & MAGNIFIER LOGIC ---
// (Your existing generateDeckPDF and Magnifier functions go here)
