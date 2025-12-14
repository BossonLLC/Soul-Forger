@import url(//fonts.googleapis.com/css?family=Montserrat:400,700);
body {
  background-color: black;
  color: black;
  margin: 0;
padding-top: 60px;
  font-family: 'lobster', ;
}

p {color: #FFFFFF; }

.w3-content{position:relative;margin-top:0em;}

#header {
    background-color: #AFAFAF;
    height: 50px;
    line-height: 50px;
    
    /* CRITICAL: Must be fixed */
    position: fixed;
    top: 0;
    left: 0;
    width: 100%; /* Spans the entire screen width */
    z-index: 100; /* Stays above everything */
}
  #header a {
    color: black;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #FFFFFF;
  }
  #header a:hover {
    color: #222;
  }
#header-title {
  display: block;
  float: left;
  font-size: 20px;
  font-weight: bold;
  color: #FFFFFF;
}
#header-nav {
  display: block;
  float: right;
  margin-top: 0;
}
#header-nav li {
  display: inline;
  padding-right: 20px;
}
.container {
  max-width: 1000px;
  margin: 0 auto;
}
#footer {
  background-color: #2f2f2f;
  padding: 50px 0;
}
.column {
  min-width: 300px;
  display: inline-block;
  vertical-align: top;
}
#footer h4 {
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
#footer p {
  color: white;
}
/*link active*/
a{
  color: #00851a;
  text-decoration: none;
}
/*link hover*/
a:hover {
  color: #0000ff;
  text-decoration: underline;
}
.post, .CardGallery {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 0;
}
.post, .Lore {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 0;
}
.post, .HowToPlay {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 0;
}
.post-author img {
  width: 200px;
  height: 200px;
  vertical-align: middle;
}
.post-author img, .CardGallery-author img {
  border-radius: 50%;
}
.post-author img, .Lore-author img {
  border-radius: 50%;
}
.post-author img, .HowToPlay-author img {
  border-radius: 50%;
}
.post-author img, .Updates-author img {
  border-radius: 50%;
}
.post-author span {
  margin-left: 16px;
}
.post-date {
  color: #D2D2D2;

  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
h1, h2, h3, h4 {
  color: #FFFFFF;
}
p {
  line-height:1.5;
}
.post-container:nth-child(even) {
  background-color: #f2f2f2;
}
/* Dropdown Button */
.dropbtn {
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.1em;
  background-color: #AFAFAF;
  color: white;
  padding: 14px;
  font-size: 16px;
  border: none;
}

/* The container <div> - needed to position the dropdown content */
.dropdown {
  position: relative;
  display: inline-block;
}

/* Dropdown Content (Hidden by Default) */
.dropdown-content {
  display: none;
  position: absolute;
  background-color: #A9A9A9;
  min-width: 100px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

/* Links inside the dropdown */
.dropdown-content a {
  color: white;
  padding: 12px 12px;
  text-decoration: none;
  display: block;
}

/* Change color of dropdown links on hover */
.dropdown-content a:hover {background-color: #AFAFAF;}

/* Show the dropdown menu on hover */
.dropdown:hover .dropdown-content {display: block;}

/* Change the background color of the dropdown button when the dropdown content is shown */
.dropdown:hover .dropbtn {background-color: #AFAFAF;}

    img {
    transition:transform 1s ease;
}

<img src="iframe.png" height="336" width="240">

}

/* iframe:hover {
    -webkit-transform:scale(1.5); /* or some other value */
    transform:scale(1.5);
}

/* <!-- body > img {
    width: 50px;
    height: 50px;
    display: block;
}
#fullsize {
    position: absolute;
}
#fullsize.hidden {
    display: none;
} --> */
/* <!--
.thumbnail:hover {
    position:relative;
    top:0px;
    left:0px;
    width:150%;
    height:auto;
    display:block;
    z-index:999;
} --> */


  /* CSS for the card images */
      .card-image {
        width: 100px;
        height: 150px;
        margin: 10px;
        border: 1px solid black;
      }
/* ------------------------------------------------------------------ */
/* --- NEW LAYOUT RULES: FINAL FLEXBOX IMPLEMENTATION (Guaranteed Fit) --- */
/* ------------------------------------------------------------------ */

/* 1. New Flexbox Wrapper for Main Content */
.main-content-wrapper {
    display: flex; 
    width: 100%; 
    
  padding-top: 60px;
    
    padding-left: 40px; 
    padding-right: 40px; /* This padding should push the content inwards */
    
    min-height: 100vh; 
    box-sizing: border-box; 
}

/* 2. Gallery Container */
#cards-gallery {
    /* Gallery takes all space MINUS the 220px required by the deck list and its margin */
    flex-basis: calc(100% - 440px); 
    flex-grow: 1; /* Allows it to take up any excess space within its flex-basis */
    flex-shrink: 1; 
    
    padding-right: 20px; /* Add some space between the cards and the search controls */
    padding-left: 0; 
 box-sizing: border-box;

    /* NEW CRITICAL FIX: Z-index and Positioning */
    position: relative; /* Essential for z-index to work */
    z-index: 5;        /* Places the entire gallery above most default elements */
}

/* 3. Deck Builder Panel (Sticky Position Fix) */
.card-list {
    position: sticky;
    top: 50px; /* Stops right under the 50px header */
    
    /* Explicitly fix its size */
    flex-basis: 200px; 
    flex-shrink: 0; 
    width: 200px; 
    z-index: 10;
    
    /* REMOVED margin-left: 20px; because flex-basis already reserves that space */
    
    /* Styling */
    height: calc(100vh - 70px); 
    overflow-y: auto; 
    border: 1px solid black;
    box-sizing: border-box; 
    padding: 10px;
}
      
      /* CSS for the card list items */
      .card-list-item {
        margin: 10px;
        cursor: pointer;
      }
      
      /* CSS for the card list item quantity input */
      .card-list-item-quantity {
        width: 30px;
      }


/* New, safer rules for styles.css */
#cards-gallery .card-details, 
#cards-gallery .CardName, 
#cards-gallery .Cost, 
#cards-gallery .Type, 
#cards-gallery .Attack, 
#cards-gallery .Off-guard {
    display: none !important;
}

/* Ensure the list is displayed horizontally */
#cards-gallery .list {
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    list-style: none;
}

/* Style for each card item */
#cards-gallery .card-item {
    margin: 10px;
    border: none;
}

/* Hide all card detail text, keeping only the image visible */
.card-details, .CardName, .Cost, .Type, .Attack, .Off-guard {
    display: none !important;
}

/* Ensure the list is displayed horizontally */
.list {
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    list-style: none; /* Remove bullet points */
}

/* Style for each card item */
.card-item {
    margin: 10px;
    border: none; /* Remove any default border if present */
}

/* Fix 1: Hides the text name header */
#cards-gallery .Card.Name { 
    display: none !important; 
}

#cards-gallery .card-details {
    visibility: hidden !important; 
}

/* And change this for the button/name as well */
#cards-gallery .add-to-deck-btn {
    visibility: hidden !important; 
}

/* Container for the List.js gallery */
#cards-gallery ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap; /* Allows cards to wrap to the next line */
    gap: 20px; /* Space between cards */
}

/* Individual Card Item */
.card-item {
    border: 1px solid #ccc;
    padding: 10px;
    width: 200px; /* Base width of the card container */
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    text-align: center;
    /* NEW: Z-index for card items */
    position: relative;
    z-index: 6; /* Higher than the gallery container */
}

/* The Card Image element (CRITICAL FIX) */
.card-item .card-image {
    /* Set a fixed height for the image area, based on the card design */
    height: 280px; /* A fixed height (adjust this number based on visual fit) */
    width: 100%; /* Fill the width of the card container */
    
    /* FIX: Force the image to maintain its original aspect ratio */
    object-fit: contain; /* Prevents stretching/distortion */
    
    display: block; 
    margin: 0 auto 10px auto;
 }

/* Optional: Style the card details */
.card-details p {
    margin: 5px 0;
    font-size: 0.9em;
}
/* --- Magnified Image Feature Styles --- */

#card-magnifier {
    /* Hide by default */
    display: none; 
    
    /* Position fixed so it stays relative to the viewport, not the page scroll */
    position: fixed; 
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* Center the element */
    
    /* Ensure it hovers above everything else */
    z-index: 1000; 
    
    /* Subtle border/shadow */
    border: 5px solid #000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.9);
    
    /* CRITICAL FIX: Ignore mouse events on the magnified image */
    pointer-events: none; 
}

#magnified-image {
    /* Set the size for the magnified card (Adjust the 400px value as needed) */
    width: 500px; 
    height: auto;
    display: block;
}

/* --- New CSS for Filter Layout --- */
.filter-controls-wrapper {
    display: flex; /* Use flexbox to align items horizontally */
    flex-wrap: wrap; /* Allow controls to wrap to the next line if space runs out */
    gap: 15px; /* Spacing between the control groups */
    margin-bottom: 20px; /* Space between the controls and the card list */
}

/* Style for each individual control group (Label + Input/Select) */
.control-group {
    display: flex;
    flex-direction: column; /* Stack label above input */
    min-width: 150px; /* Give each control a minimum size */
}

/* Style for the labels */
.control-group label {
    color: #FFFFFF; /* Assuming your background is dark */
    font-size: 0.9em;
    margin-bottom: 3px;
    font-weight: bold;
}
/* CSS to fix misalignment within the card details */
.card-details p {
    /* Ensures all inline elements within the <p> are aligned to the middle baseline */
    vertical-align: middle;
}

/* Specifically target the spans inside the details to ensure they are inline-block */
.card-details p span {
    display: inline-block;
    vertical-align: middle; /* Forces them to stay on the same line */
}

/* Optional: If the slash '/' itself is causing issues */
.card-details p {
    /* Sets a consistent line height for the entire paragraph */
    line-height: 1.2;
}
/* --- STRONG FIX FOR POWER/OFF-GUARD ALIGNMENT --- */

.card-details p:nth-child(2) {
    /* Forces the line to use flexbox layout */
    display: flex !important;
    /* Aligns all items perfectly to the center vertically */
    align-items: center !important; 
    /* Remove default margins that could cause shifting */
    margin: 0 !important;
    padding: 2px 0 !important;
}
/* Fixes the Off-Guard power alignment and presentation */
.attack-line {
    /* Set the parent line to a flexible container */
    display: flex;
    align-items: center; /* Center everything vertically */
    gap: 5px; /* Add small space between elements */
}

/* Ensure the second value starts right after the first value */
.attack-line .Off-guard-Power {
    margin-left: -5px; /* Pull it slightly to the left to tighten space */
    /* Ensure no weird padding/margins */
    padding: 0;
}
/* --- New Deck Builder Styling (Phase 1 Fixes) --- */

/* 1. Center the "Add to Deck" Button */
.card-item {
    /* Ensure existing flex properties are kept, or add them if missing */
    display: flex; 
    flex-direction: column; 
    align-items: center; /* Centers items horizontally */
    text-align: center; 
}

/* Ensure the button is styled to follow the centering */
.add-to-deck-btn {
    display: block; 
    margin: 10px auto; /* Centers the button and adds vertical space */
    /* You may need to remove 'visibility: hidden !important;' from line ~318
       of your current CSS for this button to actually appear!
       If you want the button visible under the cards, REMOVE this rule:
       #cards-gallery .add-to-deck-btn { visibility: hidden !important; }
    */
}

/* 2. Style the Deck List Container */
.card-list {
    background-color: white; /* Set the background to solid white */
    padding: 15px; /* Add some internal spacing */
    /* Retain existing position, width, height, and border rules */
}

/* Style for the new deck categories */
.deck-category-header {
    color: black; /* Headers inside the white box should be readable */
    font-size: 1.1em;
    margin-top: 15px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 5px;
}

/* Style for the card list items (Name, Quantity, Remove Button) */
.deck-category-list {
    list-style: none;
    padding: 0;
}

.deck-category-list li {
    display: flex;
    justify-content: space-between; /* Space out the name and controls */
    align-items: center;
    padding: 3px 0;
    font-size: 0.9em;
    color: black;
}

.card-list-item-name {
    flex-grow: 1; /* Takes up all available space */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 5px;
}

.card-list-item-quantity {
    width: 35px;
    text-align: center;
    border: 1px solid #ccc;
    margin: 0 5px;
}

.remove-from-deck-btn {
    background-color: red;
    color: white;
    border: none;
    cursor: pointer;
    padding: 2px 5px;
    line-height: 1;
}

/* --- Scroll-to-Top Button Styles --- */
#scroll-to-top {
    display: none; /* Hidden by default */
    position: fixed; /* Fixed position */
    bottom: 30px; /* 30px from the bottom */
    right: 30px; /* 30px from the right */
    z-index: 99; /* High z-index to stay on top */
    border: none; 
    outline: none; 
    background-color: #AFAFAF; 
    color: white; 
    cursor: pointer; 
    padding: 10px 15px; 
    border-radius: 50%; 
    font-size: 18px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
    transition: background-color 0.3s;
}

#scroll-to-top:hover {
    background-color: #777;
}
