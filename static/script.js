const canvas = document.getElementById("calligraphyCanvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let isErasing = false;
let brushSize = 15;
let brushColor = "#000000";
let lastX = 0, lastY = 0;
let lastPressure = 0.5;
let lastSpeed = 0;

// History stack for undo/redo
let history = [];
let redoStack = [];

canvas.width = 800;
canvas.height = 600;

function resizeCanvas() {
    const size = document.getElementById("canvasSize").value.split("x");
    canvas.width = parseInt(size[0]);
    canvas.height = parseInt(size[1]);
    clearCanvas();
}

canvas.addEventListener("pointerdown", (event) => {
    saveState(); // Save state before starting a new stroke
    drawing = true;
    [lastX, lastY] = [event.offsetX, event.offsetY];
    lastPressure = event.pressure || 0.5;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
});

canvas.addEventListener("pointerup", () => {
    drawing = false;
    ctx.closePath();
});

canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;
    draw(event.offsetX, event.offsetY, event.pressure || 0.5);
});

function draw(x, y, pressure) {
    const dx = x - lastX;
    const dy = y - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = distance / 10;
    const angle = Math.atan2(dy, dx);

    const dynamicSize = isErasing ?  document.getElementById("eraserSize").value : brushSize * Math.min(pressure * 2, 1.5) * (1 - speed * 0.1);

    const wavelength = Math.max(5, 20 * (1 - pressure));
    const amplitude = dynamicSize * 0.5 * pressure;

    ctx.lineWidth = dynamicSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = isErasing ? "rgba(0, 0, 0, 1)" : `rgba(${hexToRgb(brushColor)}, ${1 - speed * 0.2})`;
    ctx.shadowColor = isErasing ? "transparent" : ctx.strokeStyle;
    ctx.shadowBlur = isErasing ? 0 : 5;

    ctx.globalCompositeOperation = isErasing ? "destination-out" : "source-over";

    drawOverlappingWaves(x, y, wavelength, amplitude);

    [lastX, lastY] = [x, y];
    lastPressure = pressure;
    lastSpeed = speed;
}

function toggleEraser() {
    isErasing = !isErasing;
    const eraserButton = document.querySelector('[title="消しゴム"]');

    if (isErasing) {
        brushSize = document.getElementById("eraserSize").value;
        eraserButton.classList.add("active"); // Add 'active' class when eraser is on
    } else {
        brushSize = document.getElementById("brushSize").value;
        eraserButton.classList.remove("active"); // Remove 'active' class when eraser is off
    }
}

function drawOverlappingWaves(x, y, wavelength, amplitude) {
    const waveCount = 3;
    const horizontalShift = wavelength * 0.2;

    for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        for (let j = 0; j < wavelength * 2; j++) {
            const t = j / (wavelength * 2);
            const waveOffset = amplitude * Math.sin(t * Math.PI * 2);
            const curveX = lastX + (x - lastX) * t + i * horizontalShift;
            const curveY = lastY + (y - lastY) * t + waveOffset;
            j === 0 ? ctx.moveTo(curveX, curveY) : ctx.lineTo(curveX, curveY);
        }
        ctx.stroke();
    }
}

// Save the current canvas state
function saveState() {
    history.push(canvas.toDataURL());
    redoStack = [];
}

// Undo function
function undo() {
    if (history.length > 0) {
        redoStack.push(canvas.toDataURL());
        const imgData = history.pop();
        restoreCanvas(imgData);
    }
}

// Redo function
function redo() {
    if (redoStack.length > 0) {
        history.push(canvas.toDataURL());
        const imgData = redoStack.pop();
        restoreCanvas(imgData);
    }
}

// Restore canvas from saved state
function restoreCanvas(imgData) {
    const img = new Image();
    img.src = imgData;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
}

function saveCanvas() {
    const link = document.createElement("a");
    link.download = "calligraphy.png";
    link.href = canvas.toDataURL();
    link.click();
}

document.getElementById("colorPicker").addEventListener("input", (e) => {
    brushColor = e.target.value;
});

document.getElementById("brushSize").addEventListener("input", (e) => {
    brushSize = e.target.value;
});

resizeCanvas();

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
}

