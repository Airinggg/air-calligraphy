const canvas = document.getElementById("calligraphyCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let drawing = false;
let isErasing = false;
let lastX = 0;
let lastY = 0;
let lastTime = 0;

// Brush settings
let brushSize = 10;
let brushColor = "#000000";
let inkSpreadAngle = -45;

// Handle mouse and touch events
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);
canvas.addEventListener("mousemove", draw);

canvas.addEventListener("touchstart", startDrawingTouch);
canvas.addEventListener("touchend", stopDrawing);
canvas.addEventListener("touchcancel", stopDrawing);
canvas.addEventListener("touchmove", drawTouch);

// Brush size and color controls
document.getElementById("brushSize").addEventListener("input", (e) => {
    brushSize = e.target.value;
});

document.getElementById("colorPicker").addEventListener("input", (e) => {
    brushColor = e.target.value;
});

// Start drawing (mouse)
function startDrawing(event) {
    event.preventDefault();
    drawing = true;
    [lastX, lastY] = [event.offsetX, event.offsetY];
    lastTime = Date.now();
    ctx.beginPath();
}

// Start drawing (touch)
function startDrawingTouch(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    drawing = true;
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
    lastTime = Date.now();
    ctx.beginPath();
}

// Stop drawing
function stopDrawing() {
    if (drawing) {
        drawInkSpread(lastX, lastY);
    }
    drawing = false;
    ctx.beginPath();
}

// Main drawing function (mouse)
function draw(event) {
    if (!drawing) return;
    event.preventDefault();
    drawStroke(event.offsetX, event.offsetY);
}

// Main drawing function (touch)
function drawTouch(event) {
    if (!drawing) return;
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    drawStroke(touch.clientX - rect.left, touch.clientY - rect.top);
}

// Handle the stroke
function drawStroke(currentX, currentY) {
    const currentTime = Date.now();
    const dx = currentX - lastX;
    const dy = currentY - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeDiff = currentTime - lastTime;

    const speed = distance / (timeDiff || 1);

    // Adjust line width and opacity based on speed
    const lineWidth = Math.min(brushSize + speed * 2, brushSize * 1.5);
    const opacity = Math.max(0.3, 1 - speed * 0.05); // Faster = lower opacity

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (isErasing) {
        ctx.globalCompositeOperation = "destination-out";
    } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = `rgba(${hexToRgb(brushColor)}, ${opacity})`;

        // Add slight ink splatter for texture
        drawSplatter(currentX, currentY, lineWidth * 0.1, opacity);
    }

    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    // Add subtle "fiber" effect
    drawFibers(currentX, currentY, lineWidth);

    ctx.beginPath();
    ctx.moveTo(currentX, currentY);

    [lastX, lastY] = [currentX, currentY];
    lastTime = currentTime;
}

// Ink spread effect on stopping
function drawInkSpread(x, y) {
    const spreadSize = brushSize * 1.5;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((inkSpreadAngle * Math.PI) / 180);

    ctx.beginPath();
    ctx.ellipse(0, 0, spreadSize * 1.2, spreadSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${hexToRgb(brushColor)}, 0.8)`;
    ctx.fill();

    ctx.restore();
}

// Splatter effect for texture
function drawSplatter(x, y, size, opacity) {
    for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * size;

        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, size * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hexToRgb(brushColor)}, ${opacity * 0.5})`;
        ctx.fill();
    }
}

// Brush fiber effect for smoother transitions
function drawFibers(x, y, size) {
    const fiberCount = 6;

    for (let i = 0; i < fiberCount; i++) {
        const angle = (Math.PI * 2 * i) / fiberCount;
        const offsetX = Math.cos(angle) * size * 0.3;
        const offsetY = Math.sin(angle) * size * 0.3;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + offsetX, y + offsetY);
        ctx.lineWidth = size * 0.1;
        ctx.strokeStyle = `rgba(${hexToRgb(brushColor)}, 0.3)`;
        ctx.stroke();
    }
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
}

// Save the canvas as an image
function saveCanvas() {
    const link = document.createElement("a");
    link.download = "calligraphy.png";
    link.href = canvas.toDataURL();
    link.click();
}

// Toggle eraser mode
function toggleEraser() {
    isErasing = !isErasing;
    const eraserButton = document.querySelector("button[onclick='toggleEraser()']");
    eraserButton.textContent = isErasing ? "Stop Eraser" : "Eraser";
}

// Convert hex to RGB
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
}
