const canvas = document.getElementById("calligraphyCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let drawing = false;
let lastX = 0;
let lastY = 0;
let lastTime = 0;

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);
canvas.addEventListener("mousemove", draw);

function startDrawing(event) {
    drawing = true;
    [lastX, lastY] = [event.offsetX, event.offsetY];
    lastTime = Date.now();
    ctx.beginPath();
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

function draw(event) {
    if (!drawing) return;

    const currentX = event.offsetX;
    const currentY = event.offsetY;
    const currentTime = Date.now();

    const dx = currentX - lastX;
    const dy = currentY - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeDiff = currentTime - lastTime;

    // Simulate pressure with speed
    const speed = distance / (timeDiff || 1);
    const lineWidth = Math.max(20 - speed * 5, 2); // Slow = thicker, Fast = thinner

    // Simulate ink flow with opacity
    const opacity = Math.min(1, 0.6 + (1 / (speed + 1)));

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.shadowBlur = 5;
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)"; // Ink bleed effect

    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(currentX, currentY);

    [lastX, lastY] = [currentX, currentY];
    lastTime = currentTime;
}

// Clear Canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
}

// Save Canvas as Image
function saveCanvas() {
    const link = document.createElement('a');
    link.download = 'calligraphy.png';
    link.href = canvas.toDataURL();
    link.click();
}
