// ==========================================
// 1. GLOBAL HELPER FUNCTIONS (The "Brains")
// ==========================================

// Fixes image paths from (path/file.png) to path/file.png
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

// Generates the Lua Database for Tabletop Simulator
function exportLuaDatabase(cardList) {
    const baseURL = "https://soul-forger.com/"; // BASE URL only
    let luaString = "cardDatabase = {\n";

    cardList.items.forEach(item => {
        const val = item.values();
        const name = val["Card Name"];
        const rawPath = val["Image"] || "";
        const cleanPath = String(rawPath).trim().replace(/[()]/g, '');
        
        if (name && cleanPath) {
            luaString += `    ["${name}"] = "${baseURL}${cleanPath}",\n`;
        }
    });

    luaString += "}\n";
    luaString += `cardBack = "${baseURL}firecards/cardback.png"`;

    navigator.clipboard.writeText(luaString).then(() => {
        alert("Lua Database copied! Paste into TTS Script.");
    }).catch(err => {
        console.log(luaString);
        alert("Check console (F12) for code.");
    });
}

// Copies the current decklist in "Quantity Name" format
async function copyDeckToTTS() {
    const categoryIds = ['starting-gear-list', 'main-deck-list', 'forge-deck-list'];
    let deckString = "";

    categoryIds.forEach(id => {
        const listElement = document.getElementById(id);
        if (listElement) {
            const items = listElement.querySelectorAll('li');
            items.forEach(item => {
                const name = item.getAttribute('data-card-name');
                const quantityInput = item.querySelector('.card-list-item-quantity');
                const quantity = quantityInput ? quantityInput.value : 1;
                deckString += `${quantity} ${name}\n`;
            });
        }
    });

    if (!deckString) { alert("Your deck is empty!"); return; }

    try {
        await navigator.clipboard.writeText(deckString);
        alert("Decklist copied for TTS!");
    } catch (err) {
        console.log(deckString);
        alert("Copy failed. Check console.");
    }
}

// Updates the 0/60 deck counters
function updateDeckCounts() {
    const categories = [
        { id: 'starting-gear-list', countId: 'starting-gear-count', limitMin: 0, limitMax: 3 }, 
        { id: 'main-deck-list', countId: 'main-deck-count', limitMin: 60, limitMax: 75 }, 
        { id: 'forge-deck-list', countId: 'forge-deck-count', limitMin: 15, limitMax: 15 },
        { id: 'token-deck-list', countId: 'token-deck-count', limitMin: 0, limitMax: Infinity }
    ];

    categories.forEach(category => {
        const list = document.getElementById(category.id);
        const countSpan = document.getElementById(category.countId);
        if (list && countSpan) {
            let totalCards = 0;
            list.querySelectorAll('li').forEach(item => {
                const quantityInput = item.querySelector('.card-list-item-quantity');
                totalCards += quantityInput ? parseInt(quantityInput.value) : 0;
            });
            countSpan.textContent = (category.limitMax === Infinity) ? totalCards : `${totalCards}/${category.limitMax}`;
            countSpan.style.color = (totalCards < category.limitMin || totalCards > category.limitMax) ? 'red' : 'green';
        }
    });
}

// ==========================================
// 2. MAIN INITIALIZATION (The "Heart")
// ==========================================

async function initCardGallery() {
    try {
        const response = await fetch('SFD.json');
        const cardData = await response.json();

        const options = {
            valueNames: [
                "Card Name", "Ronum", "Cost", "Type", "Action Type", "Sub Type",
                "Power", "Off-guard Power", "Effect", "Image", "Endurance", 
                "Experience", "Hands", "Faction", "Action Speed"
            ],
            item: `<li class="card-item">
                <h4 class="Card Name">{Card Name}</h4>
                <img class="card-image" loading="lazy" data-card-name="{Card Name}" alt="">
                <span class="Image" style="display:none">{Image}</span>
                <div class="card-details">
                    <p>Cost: <span class="Cost">{Cost}</span> | Type: <span class="Type">{Type}</span></p>
                    <p class="attack-line">A/OG: <span class="Power">{Power}</span> | <span class="Off-guard Power">{Off-guard Power}</span></p>
                    <p>Effect: <span class="Effect">{Effect}</span></p>
                </div>
                <button class="add-to-deck-btn">Add to Deck</button>
            </li>`
        };

        var cardList = new List('cards-gallery', options, cardData);
        setImageSources(cardList);

        cardList.on('updated', () => setImageSources(cardList));

        // --- BUTTON CONNECTIONS ---
        const luaBtn = document.getElementById('export-lua-db-btn');
        if (luaBtn) luaBtn.onclick = () => exportLuaDatabase(cardList);

        const ttsBtn = document.getElementById('copy-tts-btn');
        if (ttsBtn) ttsBtn.onclick = copyDeckToTTS;

        const downloadBtn = document.getElementById('download-button');
        if (downloadBtn) downloadBtn.onclick = generateDeckPDF;

        // --- DECK BUILDING LOGIC ---
        document.getElementById('cards-gallery').addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-deck-btn');
            if (!btn) return;

            const cardItem = btn.closest('.card-item');
            const name = cardItem.querySelector('h4').textContent.trim();
            const type = cardItem.querySelector('.Type').textContent.trim();
            const cost = cardItem.querySelector('.Cost').textContent.trim();
            const imgPath = cardItem.querySelector('.card-image').getAttribute('src');

            // Logic to find which list to add to (Main, Forge, etc)
            let listId = 'main-deck-list';
            if (cost.toLowerCase().includes('starting gear')) listId = 'starting-gear-list';
            else if (cost.toLowerCase().includes('token')) listId = 'token-deck-list';
            else if (type === 'Equipment') listId = 'forge-deck-list';

            const targetList = document.getElementById(listId);
            let existing = targetList.querySelector(`li[data-card-name="${name}"]`);

            if (existing) {
                const input = existing.querySelector('.card-list-item-quantity');
                input.value = parseInt(input.value) + 1;
            } else {
                const li = document.createElement('li');
                li.setAttribute('data-card-name', name);
                li.setAttribute('data-image-path', imgPath);
                li.innerHTML = `<button class="remove-btn">X</button> <span>${name}</span> 
                                <input type="number" class="card-list-item-quantity" value="1" min="1">`;
                
                li.querySelector('.remove-btn').onclick = () => { li.remove(); updateDeckCounts(); };
                li.querySelector('input').onchange = updateDeckCounts;
                targetList.appendChild(li);
            }
            updateDeckCounts();
        });

    } catch (error) {
        console.error('Initialization Failed:', error);
    }
}

window.onload = initCardGallery;

// --- PDF & IMAGE HELPERS (Kept at bottom) ---
async function generateDeckPDF() { 
    /* ... (Your existing PDF code is fine here) ... */ 
}
function imageUrlToBase64(url) { 
    /* ... (Your existing Base64 code is fine here) ... */ 
}
