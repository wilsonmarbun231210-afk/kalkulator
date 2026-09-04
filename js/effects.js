/* ============================================================
   effects.js – Particles, confetti, bubbles, character animations
   ============================================================ */

/* ---------- bubble system ---------- */
C.bubbles = {
  d3: document.getElementById('d3bubble'),
  av: document.getElementById('avbubble')
};
C.bubbleTimers = {};

C.showBubble = function (key, msg) {
  var b = C.bubbles[key];
  if (msg) b.querySelector('.msg').textContent = msg;
  b.classList.remove('show');
  void b.offsetWidth;
  b.classList.add('show');
  clearTimeout(C.bubbleTimers[key]);
  C.bubbleTimers[key] = setTimeout(function () { b.classList.remove('show'); }, 3500);
};

C.randomChar = function () {
  return Math.random() < 0.5 ? 'd3' : 'av';
};

/* ---------- character animations ---------- */
C.shakeChars = function () {
  document.querySelectorAll('.char img').forEach(function (img) { img.classList.add('shake'); });
};

C.shiverChars = function () {
  document.querySelectorAll('.char img').forEach(function (img) { img.classList.add('shiver'); });
};

C.triggerFlash = function () {
  var f = document.getElementById('flash');
  f.classList.remove('go');
  void f.offsetWidth;
  f.classList.add('go');
  document.querySelectorAll('.char img').forEach(function (img) { img.classList.add('jump'); });
};

C.lookAt = function (btn) {
  if (!btn) return;
  var rect = btn.getBoundingClientRect();
  var cx = rect.left + rect.width / 2;
  var ratio = cx / window.innerWidth - 0.5;
  var deg = ratio * 14;
  document.querySelectorAll('.char img').forEach(function (img) {
    if (img.classList.contains('walk')) return;
    img.style.transform = 'rotate(' + deg + 'deg) translateY(' + (Math.abs(ratio) * 12) + 'px)';
    setTimeout(function () { img.style.transform = ''; }, 500);
  });
};

/* ---------- canvas particles ---------- */
var fxCanvas = document.getElementById('fx');
var ctx = fxCanvas.getContext('2d');
var W = 0, H = 0;
var particles = [];
C.confetti = [];

function resizeFx() {
  W = fxCanvas.width = window.innerWidth;
  H = fxCanvas.height = window.innerHeight;
}

function spawnParticle(initial) {
  return {
    x: Math.random() * W,
    y: initial ? Math.random() * H : -20,
    r: 2 + Math.random() * 5,
    vy: 0.4 + Math.random() * 1.2,
    vx: (Math.random() - 0.5) * 0.5,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.02,
    hue: Math.random() < 0.6 ? 335 : Math.random() < 0.5 ? 300 : 180,
    alpha: 0.3 + Math.random() * 0.45,
    shape: Math.random() < 0.5 ? 'petal' : 'star'
  };
}

function drawParticle(p) {
  ctx.save();
  ctx.globalAlpha = p.alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.fillStyle = 'hsl(' + p.hue + ', 80%, 75%)';
  if (p.shape === 'petal') {
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r * 1.6, p.r, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    for (var a = 0; a < Math.PI * 2; a += Math.PI / 5) {
      ctx.lineTo(Math.cos(a) * p.r, Math.sin(a) * p.r);
      ctx.lineTo(Math.cos(a + Math.PI / 5) * p.r * 0.5, Math.sin(a + Math.PI / 5) * p.r * 0.5);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

C.burstConfetti = function (x, y) {
  var colors = ['#ff2e63', '#ffb3c6', '#ffd95c', '#7dff8a', '#8fb3ff', '#ffffff'];
  for (var i = 0; i < 70; i++) {
    C.confetti.push({
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 10,
      vy: -Math.random() * 12 - 2,
      w: 4 + Math.random() * 5,
      h: 4 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1
    });
  }
};

function fxLoop() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(function (p) {
    p.y += p.vy;
    p.x += p.vx + Math.sin(p.y / 50) * 0.3;
    p.rot += p.vr;
    if (p.y > H + 20 || p.x < -20 || p.x > W + 20) Object.assign(p, spawnParticle(false));
    drawParticle(p);
  });
  for (var i = C.confetti.length - 1; i >= 0; i--) {
    var c = C.confetti[i];
    c.vy += 0.4;
    c.x += c.vx;
    c.y += c.vy;
    c.rot += c.vr;
    c.life -= 0.008;
    if (c.life <= 0 || c.y > H + 20) { C.confetti.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = Math.max(0, c.life);
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
    ctx.restore();
  }
  requestAnimationFrame(fxLoop);
}

resizeFx();
window.addEventListener('resize', resizeFx);
for (var i = 0; i < 42; i++) particles.push(spawnParticle(true));
fxLoop();

/* ---------- character click ---------- */
document.getElementById('d3char').addEventListener('click', function () { C.showBubble('d3'); });
document.getElementById('avchar').addEventListener('click', function () { C.showBubble('av'); });

/* ---------- character walk animations ---------- */
document.querySelectorAll('.char img').forEach(function (img) {
  img.addEventListener('animationend', function () {
    img.classList.remove('walk', 'jump', 'shake', 'shiver');
  });
});

/* ---------- character drag ---------- */
document.querySelectorAll('.char').forEach(function (ch) {
  var dragging = false, ox = 0, oy = 0, sx = 0, sy = 0;
  ch.addEventListener('pointerdown', function (e) {
    dragging = true;
    ox = e.clientX;
    oy = e.clientY;
    sx = ch.offsetLeft;
    sy = ch.offsetTop;
    ch.style.transition = 'none';
    ch.style.transform = 'none';
    ch.style.right = 'auto';
    ch.style.width = ch.offsetWidth + 'px';
    ch.setPointerCapture(e.pointerId);
  });
  ch.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    ch.style.left = (sx + e.clientX - ox) + 'px';
    ch.style.top = (sy + e.clientY - oy) + 'px';
  });
  ch.addEventListener('pointerup', function () {
    dragging = false;
    ch.style.transition = '';
  });
});

/* ---------- idle loop ---------- */
C.idleLoop = function () {
  setTimeout(function () {
    document.body.classList.remove('loaded');
    setTimeout(function () {
      document.body.classList.add('loaded');
      document.querySelectorAll('.char img').forEach(function (img) { img.classList.add('walk'); });
      C.showBubble('d3');
      setTimeout(function () { C.showBubble('av'); }, 800);
    }, 2200);
    C.idleLoop();
  }, 25000);
};
