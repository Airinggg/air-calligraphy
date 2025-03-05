const canvas = document.getElementById("calligraphyCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let drawing = false;
let isErasing = false;
let lastX = 0;
let lastY = 0;
let lastTime = 0;
let inkSpreadTimeout = null;

// Brush settings
let brushSize = 10;
let brushColor = "#000000";

// Eraser settings
let eraserSize = 20; // Default eraser size

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

// Eraser size control
document.getElementById("eraserSize").addEventListener("input", (e) => {
    eraserSize = e.target.value;
});

// Start drawing (mouse)
function startDrawing(event) {
    event.preventDefault();
    drawing = true;
    [lastX, lastY] = [event.offsetX, event.offsetY];
    lastTime = Date.now();
    ctx.beginPath();

    // Trigger ink spread immediately at the start of the stroke
    drawInkSpread(lastX, lastY);
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

    // Trigger ink spread immediately at the start of the stroke
    drawInkSpread(lastX, lastY);
}

// Stop drawing
function stopDrawing() {
    if (drawing) {
        clearTimeout(inkSpreadTimeout);
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
    const lineWidth = isErasing ? eraserSize : Math.max(brushSize * 0.5, brushSize * (1 - speed * 0.05)); // Faster = thinner, slower = thicker
    const opacity = Math.max(0.3, 1 - speed * 0.05); // Faster = lower opacity

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (isErasing) {
        ctx.globalCompositeOperation = "destination-out";
    } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = `rgba(${hexToRgb(brushColor)}, ${opacity})`; // Apply opacity for watercolor effect
    }

    // Draw smooth stroke with fiber-like texture
    drawSmoothStroke(currentX, currentY, lineWidth, opacity);

    // Check for ink spread (if the mouse stops moving)
    clearTimeout(inkSpreadTimeout);
    inkSpreadTimeout = setTimeout(() => {
        if (!isErasing) {
            drawInkSpread(currentX, currentY);
        }
    }, 50); // Reduced delay to 50ms for faster detection

    [lastX, lastY] = [currentX, currentY];
    lastTime = currentTime;
}

// Draw smooth stroke with fiber-like texture
function drawSmoothStroke(x, y, lineWidth, opacity) {
    const fiberCount = 10; // Number of fibers
    const fiberLength = lineWidth * 0.5; // Length of each fiber

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Draw fibers for texture (only for brush, not eraser)
    if (!isErasing) {
        for (let i = 0; i < fiberCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const offsetX = Math.cos(angle) * fiberLength;
            const offsetY = Math.sin(angle) * fiberLength;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + offsetX, y + offsetY);
            ctx.lineWidth = lineWidth * 0.1;
            ctx.strokeStyle = `rgba(${hexToRgb(brushColor)}, ${opacity * 0.5})`; // Apply opacity for fibers
            ctx.stroke();
        }
    }
}

// Ink spread effect on stopping
function drawInkSpread(x, y) {
    const spreadSize = brushSize * 1.2; // Slightly larger than the stroke

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((-45 * Math.PI) / 180); // Corrected to -45 degrees (equivalent to 135 degrees)

    ctx.beginPath();
    ctx.ellipse(0, 0, spreadSize * 1.2, spreadSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${hexToRgb(brushColor)}, 0.8)`;
    ctx.fill();

    ctx.restore();
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