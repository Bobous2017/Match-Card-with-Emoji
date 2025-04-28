let draggedCard = null; // Store the element currently being dragged
let pages = []; // store all pages
let currentPage = 1; // to track page number

//🔹 Triggered when you start dragging a card
//🔹 Stores the dragged card in a global variable
function startDrag(event) {
    draggedCard = event.target; // Set the card being dragged
}
//🔹 Without this, the browser won't let you drop elements here
//🔹 This is standard for drag-and-drop behavior
function allowDrop(event) {
    event.preventDefault(); // Required to allow dropping
}
function handleDrop(event) {
    event.preventDefault(); // Stop default behavior (like opening the file)
    const targetCard = event.target.closest(".card"); // Get the card where we're dropping
    //🚫 Guard Clause
    if (!draggedCard || targetCard === draggedCard) return; // 🛑 Prevents: Dropping if nothing is being dragged and Dropping onto itself
    const from = draggedCard.dataset.match; // dragged item
    const to = targetCard.dataset.match; // target you're dropping onto
    if (from === to) {  // Compare match fram A to B
    console.log("✅ Matched!");
    draggedCard.classList.add("matched"); // Green highlight
    targetCard.classList.add("matched"); // Green highlight
    draggedCard.setAttribute("draggable", false); // Lock both
    targetCard.setAttribute("draggable", false);  // Lock both
    } else { // ❌ WRONG MATCH
    console.log("❌ Wrong Match"); // Temporary red highlight
    // Optional: add temporary red shake
    targetCard.classList.add("wrong"); // After 800ms, remove wrong effect
    setTimeout(() => targetCard.classList.remove("wrong"), 800);
    }
    draggedCard = null; // Clear global dragged card
}
// --------------------------------Shuffling and Distrubing ------------------------
// load map dynamically containir their files
async function loadCategory() {
    const selected = document.getElementById("category").value;
  
    // 🔽 Dynamically import the correct file
    const module = await import(`./vocab/${selected}.js`);
    const wordEmojiPairs = module.wordEmojiPairs;
  
    // ⬇️ Now you can do all your existing logic here:
    // Step 1: Shuffle pairs (not individual cards)
    wordEmojiPairs.sort(() => Math.random() - 0.5);
    // Step 2: Chunk into groups of 8 pairs (16 cards per page)
    function chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    const pairChunks = chunk(wordEmojiPairs, 8);
    // Step 3: Convert each chunk into a page with both text + emoji cards
    pages = pairChunks.map(chunk =>
        chunk.flatMap(pair => [
        { type: "text", match: pair.match, content: pair.match },
        { type: "emoji", match: pair.match, content: pair.emoji }
        ])
    );
    // Step 4: Avoid text and emoji end up side-by-side—making the game a bit too easy.
    pages.forEach(page => page.sort(() => Math.random() - 0.5));
    // Step 5: Render pages to DOM
    function renderPage(cards, containerId) {
        const board = document.getElementById(containerId);
        board.innerHTML = ""; // clear old cards
        cards.forEach(card => {
        const div = document.createElement("div");
        div.className = `card ${card.type}`;  // adds 'text' or 'emoji' // To make Big dynamically
        div.setAttribute("draggable", true);
        div.dataset.match = card.match;

       // div.textContent = card.content;
       if (card.type === "emoji" && card.content.includes("flagcdn.com")) {
        div.innerHTML = `<img src="${card.content}" style="width:40px;" alt="${card.match}">`;
        } else {
            div.textContent = card.content;
        }
        
      
      
            
        div.ondragstart = startDrag;
        div.ondragover = allowDrop;
        div.ondrop = handleDrop;
        board.appendChild(div);
        });
    }
    // Create enough pages in HTML dynamically
    pages.forEach((cards, index) => {
        const pageId = `page${index + 1}`;
        let pageDiv = document.getElementById(pageId);
        if (!pageDiv) {
        pageDiv = document.createElement("div");
        pageDiv.className = "board page";
        pageDiv.id = pageId;
        if (index > 0) pageDiv.style.display = "none"; // hide others
        document.body.insertBefore(pageDiv, document.querySelector(".pagination"));
        }
        renderPage(cards, pageId);
    });
    
   
    // First, clear existing .page divs (important when switching categories)
    document.querySelectorAll(".page").forEach(p => p.remove());

    // Dynamically create and render all pages
    pages.forEach((cards, index) => {
    const pageId = `page${index + 1}`;
    const pageDiv = document.createElement("div");
    pageDiv.className = "board page";
    pageDiv.id = pageId;
    if (index > 0) pageDiv.style.display = "none";
    document.body.insertBefore(pageDiv, document.querySelector(".pagination"));
    renderPage(cards, pageId);
    });

    // Start with page 1
    showPage(1);

}
 // Navigation buttons (reuse your existing pagination logic)
function showPage(pageNumber) {
    const totalPages = pages.length;
    // Clamp page number between 1 and totalPages
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    currentPage = pageNumber;
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById("page" + pageNumber).style.display = "flex";
    // Update the page indicator text
    const indicator = document.getElementById("pageIndicator");
    if (indicator) {
    indicator.textContent = `Page ${currentPage} of ${totalPages}`;
    }
}
