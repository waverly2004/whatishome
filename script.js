let currentScreen = 'screen1';
let currentPath = null;
const collectedColors = {
    path1: [],
    path2: [],
    path3: []
};
const allCollectedColors = [];
const visitedPaths = new Set();
let currentHoverCard = null;
let selectedColor = null;
let isDrawing = false;
let canvas = null;
let ctx = null;
let lastX = 0;
let lastY = 0;
let lastSpeed = 0;
let cracksCanvas = null;
let cracksCtx = null;
let crackInterval = null;
let textInterval = null;

// Poetry lines from the code
const poetryLines = [
    "I think home",
    "Might be all the beds I've slept in.",
    "Might be all the people I realize   I miss.",
    "Might be the food I eat   and wonder why",
    "it doesn't really taste the same.",
    "Might be every color of every memory",
    "I forgot   to mix and paint with.",
    "I see   the space I fit into, and I call that",
    "home.",
    "It is November, 2004.",
    "I was born in Pennsylvania on a cold",
    "and late winter morning.",
    "I spend most of my birthdays in Pennsylvania.",
    "I wonder,",
    "How many people have seen me light my candles",
    "and close my eyes?",
    "How many do I still talk to?",
    "What would I wish for, now?",
    "What did I wish for, then?",
    "北京 is cold in the winter and hotter than Pennsylvania in the summer.",
    "The sun feels different here,",
    "my body somehow lighter.",
    "My childhood is a blur of walking down warm asphalt streets",
    "eating at round tables surrounded by uncles and aunts",
    "who know me more than I know them.",
    "When my 老爷 was struggling with Alzheimer's",
    "he always thought I remained 9 years old.",
    "I smile at the thought that he still remembered me enough",
    "to be small.",
    "It is December, 2025.",
    "I don't need Google Maps to navigate downtown Providence anymore.",
    "I don't need light to walk through my dorm room.",
    "I was asked if I'd return here after graduation.",
    "But knowing the streets is empty without",
    "knowing the faces who walk by.",
    "I've decided to fold my words carefully",
    "as my roommates fold our laundry",
    "as my 奶奶 hand washed my socks",
    "as I fold my worlds into one idea of home."
];

function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

function goToPath(pathNum) {
    currentPath = pathNum;
    visitedPaths.add(pathNum);
    goToScreen('path' + pathNum);
    randomizeImagePositions('path' + pathNum);
    updateGlobalColorBar();
}

function randomizeImagePositions(pathId) {
    const container = document.querySelector('#' + pathId + ' .images-section');
    const images = container.querySelectorAll('.image-card');
    const containerWidth = 700;
    const containerHeight = 600;
    
    images.forEach(img => {
        const imgWidth = img.classList.contains('large') ? 300 : 200;
        const imgHeight = img.classList.contains('large') ? 180 : 200;
        
        const maxX = containerWidth - imgWidth;
        const maxY = containerHeight - imgHeight;
        
        const x = Math.random() * maxX;
        const y = Math.random() * maxY;
        
        img.style.left = x + 'px';
        img.style.top = y + 'px';
    });
}

function showDialog(card, event) {
    if (event) event.stopPropagation();
    
    if (currentHoverCard === card && document.getElementById('hoverDialog').classList.contains('active')) {
        return;
    }
    
    hideDialog();
    
    currentHoverCard = card;
    const dialog = document.getElementById('hoverDialog');
    const color = card.dataset.color;
    const date = card.dataset.date;
    const desc = card.dataset.desc;
    
    document.getElementById('dialogDesc').textContent = desc;
    document.getElementById('dialogDate').textContent = 'Date: ' + date + '.';
    document.getElementById('dialogColor').innerHTML = 'Color: ' + color + '<span class="color-preview" style="background-color: ' + color + '"></span>';
    
    dialog.classList.add('active');
    
    const rect = card.getBoundingClientRect();
    dialog.style.left = (rect.left + rect.width * 0.5) + 'px';
    dialog.style.top = (rect.top + rect.height * 0.5) + 'px';
}

function hideDialog() {
    document.getElementById('hoverDialog').classList.remove('active');
    currentHoverCard = null;
}

function collectColorFromDialog() {
    if (currentHoverCard) {
        collectColor(currentHoverCard);
    }
    hideDialog();
}

function collectColor(card) {
    if (card.classList.contains('collected')) return;
    
    const color = card.dataset.color;
    const pathKey = 'path' + currentPath;
    
    if (!collectedColors[pathKey].includes(color)) {
        collectedColors[pathKey].push(color);
        card.classList.add('collected');
        
        if (!allCollectedColors.includes(color)) {
            allCollectedColors.push(color);
        }
        
        const colorBar = document.getElementById('colorBar' + currentPath);
        const circle = document.createElement('div');
        circle.className = 'color-circle';
        circle.style.backgroundColor = color;
        colorBar.appendChild(circle);
        
        updateGlobalColorBar();
        checkAllCollected();
    }
    
    hideDialog();
}

function updateGlobalColorBar() {
    for (let i = 1; i <= 3; i++) {
        const colorBar = document.getElementById('colorBar' + i);
        if (colorBar) {
            colorBar.innerHTML = '';
            allCollectedColors.forEach(color => {
                const circle = document.createElement('div');
                circle.className = 'color-circle';
                circle.style.backgroundColor = color;
                colorBar.appendChild(circle);
            });
        }
    }
    
    // Check if final arrow should be enabled
    if (visitedPaths.size === 3 && 
        collectedColors.path1.length === 5 && 
        collectedColors.path2.length === 5 && 
        collectedColors.path3.length === 5) {
        document.getElementById('finalArrow').disabled = false;
    }
}

function checkAllCollected() {
    const pathKey = 'path' + currentPath;
    const totalImages = document.querySelectorAll('#' + pathKey + ' .image-card').length;
    
    if (collectedColors[pathKey].length === totalImages) {
        document.getElementById('backBtn' + currentPath).disabled = false;
    }
}

function tryGoBack() {
    const pathKey = 'path' + currentPath;
    const totalImages = document.querySelectorAll('#' + pathKey + ' .image-card').length;
    
    if (collectedColors[pathKey].length === totalImages) {
        goToScreen('screen3');
        currentPath = null;
    } else {
        document.getElementById('notificationDialog').classList.add('active');
    }
}

function goToFinalScreen() {
    initializeFinalScreen();
}

function initializeFinalScreen() {
    const finalImages = document.getElementById('finalImages');
    finalImages.innerHTML = '';
    
    const allImageData = [];
    for (let i = 1; i <= 3; i++) {
        const pathImages = document.querySelectorAll('#path' + i + ' .image-card');
        pathImages.forEach(img => {
            const imgElement = img.querySelector('img');
            allImageData.push({
                src: imgElement ? imgElement.src : '',
                alt: imgElement ? imgElement.alt : '',
                color: img.dataset.color,
                date: img.dataset.date,
                desc: img.dataset.desc,
                isLarge: img.classList.contains('large')
            });
        });
    }
    
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    allImageData.forEach(data => {
        const imgCard = document.createElement('div');
        imgCard.className = 'image-card';
        if (data.isLarge) imgCard.classList.add('large');
        imgCard.style.opacity = '0.3';
        imgCard.style.pointerEvents = 'auto';
        imgCard.onmousedown = (e) => startDragFinal(e, imgCard);
        
        const img = document.createElement('img');
        img.src = data.src;
        img.alt = data.alt;
        imgCard.appendChild(img);
        
        const imgWidth = data.isLarge ? 300 : 200;
        const imgHeight = data.isLarge ? 180 : 200;
        
        const maxX = containerWidth - imgWidth;
        const maxY = containerHeight - imgHeight;
        
        const x = Math.random() * maxX;
        const y = Math.random() * maxY;
        
        imgCard.style.left = x + 'px';
        imgCard.style.top = y + 'px';
        
        finalImages.appendChild(imgCard);
    });
    
    canvas = document.getElementById('drawingCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const palette = document.getElementById('paintPalette');
    palette.innerHTML = '';
    allCollectedColors.forEach(color => {
        const paintColor = document.createElement('div');
        paintColor.className = 'paint-color';
        paintColor.style.backgroundColor = color;
        paintColor.onclick = () => selectColor(color, paintColor);
        palette.appendChild(paintColor);
    });
    
    if (allCollectedColors.length > 0) {
        selectColor(allCollectedColors[0], palette.firstChild);
    }
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Initialize cracks canvas
    cracksCanvas = document.getElementById('cracksCanvas');
    cracksCanvas.width = window.innerWidth;
    cracksCanvas.height = window.innerHeight;
    cracksCtx = cracksCanvas.getContext('2d');
    cracksCtx.globalAlpha = 0.5;
    
    // Start generating cracks
    startCracks();
    
    // Start generating poetry text
    startPoetryText();
    
    goToScreen('finalScreen');
    currentPath = null;
}

function startCracks() {
    // Generate a crack every 3-6 seconds
    crackInterval = setInterval(() => {
        generateCrack();
    }, Math.random() * 3000 + 3000);
}

function startPoetryText() {
    // Generate poetry text every 2-5 seconds
    textInterval = setInterval(() => {
        generatePoetryText();
    }, Math.random() * 3000 + 2000);
}

function generatePoetryText() {
    if (!cracksCtx || poetryLines.length === 0) return;
    
    // Pick a random poetry line
    const line = poetryLines[Math.floor(Math.random() * poetryLines.length)];
    
    // Random position
    const x = Math.random() * (window.innerWidth - 400); // Leave some margin
    const y = Math.random() * window.innerHeight;
    
    // Random rotation between -15 and 15 degrees
    const rotation = (Math.random() - 0.5) * 30;
    
    // Pick a random color from collected colors, or use white if none
    const color = allCollectedColors.length > 0 
        ? allCollectedColors[Math.floor(Math.random() * allCollectedColors.length)]
        : '#ffffff';
    
    cracksCtx.save();
    cracksCtx.translate(x, y);
    cracksCtx.rotate(rotation * Math.PI / 180);
    cracksCtx.globalAlpha = 0.5;
    cracksCtx.fillStyle = color;
    cracksCtx.font = '16px Inter, sans-serif';
    cracksCtx.textAlign = 'left';
    cracksCtx.textBaseline = 'middle';
    cracksCtx.fillText(line, 0, 0);
    cracksCtx.restore();
}

function generateCrack() {
    if (!cracksCtx || allCollectedColors.length === 0) return;
    
    // Pick a random color from collected colors
    const color = allCollectedColors[Math.floor(Math.random() * allCollectedColors.length)];
    cracksCtx.strokeStyle = color;
    cracksCtx.lineWidth = 1.5;
    cracksCtx.lineCap = 'round';
    cracksCtx.lineJoin = 'miter';
    
    // Random starting point
    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;
    
    cracksCtx.beginPath();
    cracksCtx.moveTo(x, y);
    
    // Create lightning-like crack with multiple segments
    const segments = Math.floor(Math.random() * 15) + 10; // 10-25 segments
    
    for (let i = 0; i < segments; i++) {
        // Create jagged, lightning-like movement
        const angle = Math.random() * Math.PI * 2;
        const length = Math.random() * 30 + 10; // 10-40 pixels per segment
        
        x += Math.cos(angle) * length;
        y += Math.sin(angle) * length;
        
        // Keep within bounds (with some overflow allowed)
        x = Math.max(-50, Math.min(window.innerWidth + 50, x));
        y = Math.max(-50, Math.min(window.innerHeight + 50, y));
        
        cracksCtx.lineTo(x, y);
        
        // Randomly branch off
        if (Math.random() < 0.3) {
            const branchLength = Math.floor(Math.random() * 5) + 3;
            const branchX = x;
            const branchY = y;
            
            for (let j = 0; j < branchLength; j++) {
                const branchAngle = Math.random() * Math.PI * 2;
                const branchDist = Math.random() * 20 + 5;
                x += Math.cos(branchAngle) * branchDist;
                y += Math.sin(branchAngle) * branchDist;
                cracksCtx.lineTo(x, y);
            }
            
            // Return to main crack
            cracksCtx.moveTo(branchX, branchY);
            x = branchX;
            y = branchY;
        }
    }
    
    cracksCtx.stroke();
}

function selectColor(color, element) {
    selectedColor = color;
    document.querySelectorAll('.paint-color').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

function startDrawing(e) {
    if (!selectedColor) return;
    if (e.target.classList.contains('image-card') || e.target.classList.contains('paint-color')) return;
    
    isDrawing = true;
    lastX = e.clientX;
    lastY = e.clientY;
    lastSpeed = 0;
    ctx.strokeStyle = selectedColor;
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
}

function draw(e) {
    if (!isDrawing || !selectedColor) return;
    
    // Calculate speed based on distance traveled
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Smooth the speed calculation
    const currentSpeed = distance;
    lastSpeed = lastSpeed * 0.7 + currentSpeed * 0.3;
    
    // Map speed to line width (faster = thinner, slower = thicker)
    // Typical ink pen range: 1-8 pixels
    const minWidth = 1.5;
    const maxWidth = 8;
    const speedFactor = Math.min(lastSpeed / 15, 1); // Normalize speed
    const lineWidth = maxWidth - (speedFactor * (maxWidth - minWidth));
    
    ctx.lineWidth = lineWidth;
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
    
    lastX = e.clientX;
    lastY = e.clientY;
}

function stopDrawing() {
    isDrawing = false;
}

function closeNotification() {
    document.getElementById('notificationDialog').classList.remove('active');
}

document.addEventListener('click', function(event) {
    const dialog = document.getElementById('hoverDialog');
    const isClickInsideDialog = dialog.contains(event.target);
    const isClickOnImage = event.target.closest('.image-card');
    
    if (!isClickInsideDialog && !isClickOnImage && dialog.classList.contains('active')) {
        hideDialog();
    }
});

let draggedElement = null;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;

function startDrag(event, element) {
    event.preventDefault();
    isDragging = false;
    draggedElement = element;
    
    const rect = element.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    
    element.classList.add('dragging');
    hideDialog();
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

function drag(event) {
    if (!draggedElement) return;
    
    isDragging = true;
    const container = draggedElement.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    let newX = event.clientX - containerRect.left - offsetX;
    let newY = event.clientY - containerRect.top - offsetY;
    
    draggedElement.style.left = newX + 'px';
    draggedElement.style.top = newY + 'px';
}

function stopDrag(event) {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        
        if (!isDragging && event.target === draggedElement) {
            showDialog(draggedElement, event);
        }
        
        draggedElement = null;
    }
    
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

// Drag functionality for final screen images
let draggedFinalElement = null;
let finalOffsetX = 0;
let finalOffsetY = 0;
let isFinalDragging = false;

function startDragFinal(event, element) {
    event.preventDefault();
    event.stopPropagation();
    isFinalDragging = false;
    draggedFinalElement = element;
    
    const rect = element.getBoundingClientRect();
    finalOffsetX = event.clientX - rect.left;
    finalOffsetY = event.clientY - rect.top;
    
    element.classList.add('dragging');
    element.style.zIndex = '1000';
    
    document.addEventListener('mousemove', dragFinal);
    document.addEventListener('mouseup', stopDragFinal);
}

function dragFinal(event) {
    if (!draggedFinalElement) return;
    
    isFinalDragging = true;
    
    let newX = event.clientX - finalOffsetX;
    let newY = event.clientY - finalOffsetY;
    
    draggedFinalElement.style.left = newX + 'px';
    draggedFinalElement.style.top = newY + 'px';
}

function stopDragFinal(event) {
    if (draggedFinalElement) {
        draggedFinalElement.classList.remove('dragging');
        draggedFinalElement.style.zIndex = '';
        draggedFinalElement = null;
    }
    
    document.removeEventListener('mousemove', dragFinal);
    document.removeEventListener('mouseup', stopDragFinal);
}