// ==========================================
// 1. GLOBAL HELPER FUNCTIONS
// ==========================================

function setImageSources(cardList) {
    cardList.items.forEach(item => {
        const imgElement = item.elm.querySelector('.card-image');
        const imagePath = item.values().Image || '';
        if (imgElement && imagePath && imagePath !== 'SPAN NOT FOUND') {
            const cleanPath = String(imagePath).trim().replace(/[()]/g, ''); 
            imgElement.setAttribute('src', cleanPath);
            const pathSpan = item.elm.querySelector('.Image');
            if (pathSpan) pathSpan.style.display = 'none';
        }
    });
    initMagnifier();
}

function initMagnifier() {
    const magnifierDiv = document.getElementById('card-magnifier');
    const magnifiedImg = document.getElementById('magnified-image');
    const cardImages = document.querySelectorAll('.card-image');
    
    if (!magnifierDiv || !magnifiedImg) return;

    cardImages.forEach(img => {
        img.onmouseenter = function() {
            magnifiedImg.src = this.src;
            magnifierDiv.style.display = "block";
        };
        img.onmouseleave = function() {
            magnifierDiv.style.display = "none";
        };
    });
}

function clearDeck() {
    if (!confirm("Are you sure you want to clear your entire deck?")) return;
    const categoryIds = ['starting-gear-list', 'main-deck-list', 'forge-deck-list', 'token-deck-list'];
    categoryIds.forEach(id => {
        const list = document.getElementById(id);
        if (list) list.innerHTML = '';
    });
    updateDeckCounts();
}

// ==========================================
// 2. EXPORT & COUNT LOGIC
// ==========================================

function exportLuaDatabase(cardList) {
    const baseURL = "https://soul-forger.com/"; 
    const universalBack = "https://soul-forger.com/back%20%26%20mat/back.png";
    let luaString = "cardDatabase = {\n";
    cardList.items.forEach(item => {
        const val = item.values();
        const name = val["Card Name"];
        const cleanPath = String(val["Image"] || "").trim().replace(/[()]/g, '');
        if (name && cleanPath) {
            luaString += `    ["${name}"] = { f = "${baseURL}${cleanPath}", b = "${universalBack}" },\n`;
        }
    });
    luaString += "}\n";
    navigator.clipboard.writeText(luaString).then(() => alert("Lua Database copied!"));
}

async function copyDeckToTTS() {
    const categoryIds = ['starting-gear-list', 'main-deck-list', 'forge-deck-list', 'token-deck-list'];
    let deckString = "";
    categoryIds.forEach(id => {
        const listElement = document.getElementById(id);
        if (listElement) {
            listElement.querySelectorAll('li').forEach(item => {
                const name = item.getAttribute('data-card-name');
                const qtyInput = item.querySelector('.card-list-item-quantity');
                const qty = qtyInput ? parseInt(qtyInput.value) : 1;
                for (let i = 0; i < qty; i++) { deckString += `${name}\n`; }
            });
        }
    });
    if (!deckString) return alert("Deck is empty!");
    await navigator.clipboard.writeText(deckString.trim());
    alert("Decklist copied for TTS!");
}

function updateDeckCounts() {
    const categories = [
        { id: 'starting-gear-list', countId: 'starting-gear-count', limitMin: 0, limitMax: 4 }, 
        { id: 'main-deck-list', countId: 'main-deck-count', limitMin: 60, limitMax: 75 }, 
        { id: 'forge-deck-list', countId: 'forge-deck-count', limitMin: 10, limitMax: 10 },
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
            } else {
                span.textContent = (cat.limitMax === Infinity) ? total : `${total}/${cat.limitMax}`;
            }
            span.style.color = (total < cat.limitMin || (cat.limitMax !== Infinity && total > cat.limitMax)) ? 'red' : 'green';
        }
    });
}

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

        // --- BUTTON CONNECTIONS ---
        const clearBtn = document.getElementById('clear-deck-btn');
        if (clearBtn) clearBtn.onclick = clearDeck;

        if (document.getElementById('export-lua-db-btn')) document.getElementById('export-lua-db-btn').onclick = () => exportLuaDatabase(cardList);
        if (document.getElementById('copy-tts-btn')) document.getElementById('copy-tts-btn').onclick = copyDeckToTTS;
        if (document.getElementById('download-button')) document.getElementById('download-button').onclick = generateDeckPDF;

        // Scroll to top button
        const scrollBtn = document.getElementById("scroll-to-top");
        if (scrollBtn) {
            scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // --- DECK BUILDER LOGIC ---
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
                if (cost.includes('starting gear')) { listId = 'starting-gear-list'; maxCopies = 1; }
                else if (cost.includes('token')) { listId = 'token-deck-list'; maxCopies = Infinity; }
                else if (type === 'Equipment') { listId = 'forge-deck-list'; maxCopies = 4; }

                const targetList = document.getElementById(listId);
                let existing = targetList.querySelector(`li[data-card-name="${name}"]`);

                if (existing) {
                    const input = existing.querySelector('.card-list-item-quantity');
                    if (input && (maxCopies === Infinity || parseInt(input.value) < maxCopies)) {
                        input.value = parseInt(input.value) + 1;
                    }
                } else {
                    const li = document.createElement('li');
                    li.setAttribute('data-card-name', name);
                    li.setAttribute('data-image-path', imgPath);
                    li.className = 'deck-list-item';
                    li.innerHTML = `
                        <button class="remove-btn" style="color:red; margin-right:8px;">X</button>
                        <span class="deck-card-hover">${name}</span>
                        <input type="number" class="card-list-item-quantity" value="1" min="1" max="${maxCopies === Infinity ? '' : maxCopies}" style="width:40px; float:right;">
                    `;

                    // Hover logic for the list item
                    const nameSpan = li.querySelector('.deck-card-hover');
                    const magnifierDiv = document.getElementById('card-magnifier');
                    const magnifiedImg = document.getElementById('magnified-image');

                    nameSpan.onmouseenter = () => {
                        if (magnifierDiv && magnifiedImg) {
                            magnifiedImg.src = imgPath;
                            magnifierDiv.style.display = "block";
                        }
                    };
                    nameSpan.onmouseleave = () => { if (magnifierDiv) magnifierDiv.style.display = "none"; };

                    li.querySelector('.remove-btn').onclick = () => { li.remove(); updateDeckCounts(); if (magnifierDiv) magnifierDiv.style.display="none"; };
                    li.querySelector('input').onchange = () => updateDeckCounts();
                    targetList.appendChild(li);
                }
                updateDeckCounts();
            });
        }
    } catch (err) { console.error('Init Error:', err); }
}

// ==========================================
// 4. PRINT & SCROLL UTILITIES
// ==========================================

function generateDeckPDF() {
    const categories = ['starting-gear-list', 'main-deck-list', 'forge-deck-list', 'token-deck-list'];
    let printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Soul Forger PnP</title><style>@page { margin: 0.25in; } body { margin: 0; padding: 0; background: #fff; } .print-grid { display: flex; flex-wrap: wrap; gap: 0; justify-content: flex-start; } .print-card { width: 2.5in; height: 3.5in; border: 0.1mm solid #ccc; box-sizing: border-box; display: block; page-break-inside: avoid; }</style></head><body><div class="print-grid">');
    categories.forEach(id => {
        const list = document.getElementById(id);
        if (list) {
            list.querySelectorAll('li').forEach(li => {
                const imgPath = li.getAttribute('data-image-path');
                const qty = parseInt(li.querySelector('.card-list-item-quantity').value);
                if (imgPath) { for (let i = 0; i < qty; i++) { printWindow.document.write(`<img src="${imgPath}" class="print-card">`); } }
            });
        }
    });
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    printWindow.onload = () => setTimeout(() => printWindow.print(), 800);
}

// Global scroll listener for the button visibility
window.onscroll = function() {
    const scrollBtn = document.getElementById("scroll-to-top");
    if (scrollBtn) {
        if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
            scrollBtn.style.display = "block";
        } else {
            scrollBtn.style.display = "none";
        }
    }
};

window.onload = initCardGallery;
