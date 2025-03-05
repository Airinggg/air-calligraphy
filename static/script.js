const canvas = document.getElementById("calligraphyCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let drawing = false;
let isErasing = false;
let lastX = 0;
let lastY = 0;
let lastTime = 0;
let pressure = 0.5;

// Brush settings
let brushSize = 10;
let brushColor = "#000000";

// Handle both mouse and touch events
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);
canvas.addEventListener("mousemove", draw);

canvas.addEventListener("touchstart", startDrawingTouch);
canvas.addEventListener("touchend", stopDrawing);
canvas.addEventListener("touchcancel", stopDrawing);
canvas.addEventListener("touchmove", drawTouch);

// Update brush size and color
document.getElementById("brushSize").addEventListener("input", (e) => {
    brushSize = e.target.value;
});

document.getElementById("colorPicker").addEventListener("input", (e) => {
    brushColor = e.target.value;
});

function startDrawing(event) {
    event.preventDefault();
    drawing = true;
    [lastX, lastY] = [event.offsetX, event.offsetY];
    lastTime = Date.now();
    ctx.beginPath();
}

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

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

function draw(event) {
    if (!drawing) return;
    event.preventDefault();

    const currentX = event.offsetX;
    const currentY = event.offsetY;
    drawLine(currentX, currentY);
}

function drawTouch(event) {
    if (!drawing) return;
    event.preventDefault();

    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    drawLine(currentX, currentY);
}

function drawLine(currentX, currentY) {
    const currentTime = Date.now();
    const dx = currentX - lastX;
    const dy = currentY - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeDiff = currentTime - lastTime;

    // Simulate pressure (slower stroke = more pressure)
    pressure = Math.max(0.1, Math.min(1, 1 / (timeDiff / distance + 0.05)));

    // Dynamic brush width and opacity
    const lineWidth = isErasing ? brushSize * 2 : Math.max(brushSize * pressure, 2);
    const opacity = isErasing ? 1 : Math.min(1, 0.3 + pressure * 0.7);

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (isErasing) {
        ctx.globalCompositeOperation = "destination-out";
    } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = `rgba(${hexToRgb(brushColor)}, ${opacity})`;

        // Add ink-like shadow and blur
        ctx.shadowBlur = pressure * 10;
        ctx.shadowColor = `rgba(0, 0, 0, ${opacity * 0.3})`;
    }

    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(currentX, currentY);

    [lastX, lastY] = [currentX, currentY];
    lastTime = currentTime;
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
}

// Save the canvas as an image
function saveCanvas() {
    const link = document.createElement('a');
    link.download = 'calligraphy.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Toggle eraser mode
function toggleEraser() {
    isErasing = !isErasing;
    const eraserButton = document.querySelector("button[onclick='toggleEraser()']");
    eraserButton.textContent = isErasing ? "Stop Eraser" : "Eraser";
}

// Resize canvas
function resizeCanvas() {
    const size = document.getElementById("canvasSize").value;
    if (size === "full") {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        const [width, height] = size.split("x").map(Number);
        canvas.width = width;
        canvas.height = height;
    }
    clearCanvas();
}

// Convert hex to RGB
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
}
