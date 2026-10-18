const canvas = document.getElementById('postcard-canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let brushColor = '#4f46e5';
let brushSize = 5;
let isEraser = false;

document.getElementById('brush-color').addEventListener('input', (e) => {
  brushColor = e.target.value;
  isEraser = false;
});

document.getElementById('brush-size').addEventListener('input', (e) => {
  brushSize = e.target.value;
});

document.getElementById('eraser-btn').addEventListener('click', () => {
  isEraser = true;
});

document.getElementById('clear-canvas').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);

function startDraw(e) {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!isDrawing) return;
  ctx.strokeStyle = isEraser ? '#ffffff' : brushColor;
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function stopDraw() {
  isDrawing = false;
  ctx.closePath();
}

// 支援背景照片上傳
document.getElementById('bg-upload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});