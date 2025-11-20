// Function to fetch the JSON data and initialize List.js
async function initCardGallery() {
    try {
        // 1. Fetch your JSON data from the repository
        const response = await fetch('path/to/your-card-data.json'); 
        const cardData = await response.json();

        // 2. Define the List.js options
        const options = {
            // ValueNames are the properties in your JSON object you want to display/search
            valueNames: [
                'name', 
                'faction', 
                'power', 
                'endurance', 
                { data: ['id'] } // Data for unique ID
            ],
            // Template for a single card item
            item: `
                <li class="card-item">
                    <h4 class="name"></h4>
                    <img class="card-image" src="" data-card-id="">
                    <p>Faction: <span class="faction"></span></p>
                    <p>Pwr: <span class="power"></span> / End: <span class="endurance"></span></p>
                    </li>
            `
        };

        // 3. Initialize List.js
        const cardList = new List('cards-gallery', options, cardData);

        // 4. Implement advanced filtering (like filtering by faction)
        document.querySelectorAll('.filter').forEach(button => {
            button.addEventListener('click', function() {
                // Get the filter class from the button's data attribute (e.g., ".faction-Sky")
                const filterValue = this.getAttribute('data-filter');
                cardList.filter(function(item) {
                    // Check if the card's faction matches the filter
                    return item.values().faction === filterValue.replace('.faction-', '');
                });
            });
        });

    } catch (error) {
        console.error('Error loading card data or List.js:', error);
    }
}

// Run the function when the page loads
window.onload = initCardGallery;
