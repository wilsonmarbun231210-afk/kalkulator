/* ============================================================
   app.js – Core calculator logic, state, and shared namespace
   ============================================================ */
window.C = {};

/* ---------- state ---------- */
C.exprEl    = document.getElementById('expr');
C.resEl     = document.getElementById('result');
C.historyList = document.getElementById('historyList');

C.expr = '';
C.justEvaluated = false;
C.pctCount = 0;
C.history = JSON.parse(localStorage.getItem('kalkHist') || '[]');
C.ops = { add: '+', sub: '-', mul: '*', div: '/' };
C.shownValue = 0;
C.digitLevel = -1;

/* ---------- helpers ---------- */
C.fmt = function (n) {
  const parts = String(n).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.join(',');
};

C.compute = function (str) {
  try {
    const value = Function('"use strict";return (' + str + ')')();
    if (typeof value !== 'number' || !isFinite(value)) return 'Error';
    return String(Math.round(value * 1e10) / 1e10);
  } catch { return ''; }
};

C.rand = function (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
};

C.esc = function (s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

/* ---------- render ---------- */
C.render = function () {
  C.exprEl.textContent = C.expr;
  const v = C.expr ? C.compute(C.expr) : '0';
  if (v && v !== 'Error') C.animateResult(v);
  else C.resEl.textContent = v === 'Error' ? 'Error' : '0';
};

C.animateResult = function (target) {
  const start = parseFloat(C.shownValue) || 0;
  const end = parseFloat(target) || 0;
  const t0 = performance.now();
  const dur = 220;
  function step(t) {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = start + (end - start) * eased;
    C.resEl.textContent = C.fmt(String(Math.round(val * 1e10) / 1e10));
    if (p < 1) requestAnimationFrame(step);
    else {
      C.shownValue = target;
      C.resEl.textContent = C.fmt(target);
    }
  }
  requestAnimationFrame(step);
};

/* ---------- history ---------- */
C.addHistory = function (text, res) {
  C.history.unshift({ text, res });
  if (C.history.length > 10) C.history.pop();
  localStorage.setItem('kalkHist', JSON.stringify(C.history));
  C.renderHistory();
};

C.renderHistory = function () {
  C.historyList.innerHTML = '';
  if (!C.history.length) {
    C.historyList.innerHTML = '<div class="hist-empty">belum ada riwayat</div>';
    return;
  }
  C.history.forEach(function (h) {
    const item = document.createElement('div');
    item.className = 'hist-item';
    item.innerHTML = '<span class="hist-expr">' + C.esc(h.text) + '</span><span class="hist-res">= ' + C.esc(C.fmt(h.res)) + '</span>';
    item.addEventListener('click', function () {
      C.expr = h.res;
      C.justEvaluated = true;
      C.render();
      C.showBubble(C.randomChar(), C.rand(histMsgs));
    });
    C.historyList.appendChild(item);
  });
};

C.flashButton = function (k) {
  const btn = document.querySelector('button[data-k="' + k + '"]');
  if (!btn) return;
  btn.classList.add('press');
  setTimeout(function () { btn.classList.remove('press'); }, 150);
};

/* ---------- messages ---------- */
var histMsgs = [
  'oh, mau pakai hasil lama ya, pintar',
  'riwayat itu kenangan, jangan lupa',
  'hasil kemarin dipakai lagi, mantap'
];

var toggleMsgs = {
  hide: [
    'heh, kalkulatornya disembunyikan?',
    'jangan-jangan mau contekan',
    'oke, kalkulator mode rahasia'
  ],
  show: [
    'kalkulatornya muncul lagi',
    'balik lagi, seru juga',
    'mulai hitung lagi yuk'
  ]
};

var pctEaster = [
  'kok suka banget pencet %',
  'persen melulu, nggak bosen?',
  'jangan main % terus, itu cuma pembagian seratus',
  'aku menangkapmu, suka persen',
  'oke, % terakhir, jangan lagi ya'
];

var funnyResults = { '69': 1, '420': 1, '666': 1, '123456': 1, '80085': 1, '1337': 1 };
var egg67 = [
  '67! angka spesial, keren!',
  '67, yang bikin kalkulator ini pasti bangga',
  'wow 67, kau tahu rahasianya?',
  '67 lagi 67 lagi, nomor favorit!'
];
var reactMsgs = [
  'wah, hasilnya menarik',
  'aku lebih baik diam',
  'nggak nyangka',
  'angka legendaris',
  'matematika itu misterius',
  'oke itu keren, tapi jangan dibawa main'
];
var opEaster = [
  'jangan dobel operator dong',
  'operator sekali aja cukup',
  'hitung yang bener ya',
  'iya iya, aku lihat operatornya'
];
var overwhelmMsgs = [
  'mulai banyak juga nih angkanya',
  'panjang banget, jangan sampai salah',
  'aku mulai pusing',
  'otakku meledak'
];

C.checkOverwhelm = function () {
  var digits = (C.expr.match(/\d/g) || []).length;
  for (var i = overwhelmMsgs.length - 1; i >= 0; i--) {
    if (digits >= 4 + i * 4 && i > C.digitLevel) {
      C.digitLevel = i;
      C.showBubble(C.randomChar(), overwhelmMsgs[i]);
      return;
    }
  }
};

/* ---------- core press ---------- */
C.press = function (k, btn) {
  C.lookAt(btn);
  C.clickSound(k);
  if (k === 'C') {
    C.expr = '';
    C.digitLevel = -1;
  } else if (k === 'back') {
    C.expr = C.expr.slice(0, -1);
  } else if (k === '%') {
    if (!C.expr) return;
    C.expr = '((' + C.expr + ')/100)';
    C.pctCount++;
    if (C.pctCount >= 3) {
      C.pctCount = 0;
      C.showBubble(C.randomChar(), pctEaster[Math.floor(Math.random() * pctEaster.length)]);
    }
  } else if (k === 'sq') {
    if (!C.expr) return;
    C.expr = '((' + C.expr + ') ** 2)';
  } else if (k === 'sqrt') {
    if (!C.expr) return;
    C.expr = 'Math.sqrt(' + C.expr + ')';
  } else if (k === 'neg') {
    if (!C.expr) return;
    C.expr = '-(' + C.expr + ')';
  } else if (k === 'eq') {
    var v = C.compute(C.expr);
    if (v && v !== 'Error') {
      var before = C.expr;
      C.expr = v;
      C.addHistory(before, v);
      C.triggerFlash();
      if (parseFloat(v) < 0) {
        C.shiverChars();
        C.showBubble(C.randomChar(), 'brr, minus. dingin banget');
      }
      var n = String(parseFloat(v));
      if (parseFloat(v) === 67) {
        C.showBubble(C.randomChar(), C.rand(egg67));
        C.burstConfetti(window.innerWidth / 2, window.innerHeight / 2);
        C.burstConfetti(window.innerWidth / 2 + 120, window.innerHeight / 2);
        C.burstConfetti(window.innerWidth / 2 - 120, window.innerHeight / 2);
        document.querySelectorAll('.char img').forEach(function (img) { img.classList.add('jump'); });
      } else if (funnyResults[n]) {
        C.showBubble(C.randomChar(), reactMsgs[Math.floor(Math.random() * reactMsgs.length)]);
        C.burstConfetti(window.innerWidth / 2, window.innerHeight / 2);
      }
    }
  } else if (C.ops[k]) {
    if (!C.expr) return;
    if (/[+\-*/]\s*$/.test(C.expr)) {
      C.expr = C.expr.replace(/[+\-*/]\s*$/, C.ops[k] + ' ');
      C.shakeChars();
      C.showBubble(C.randomChar(), opEaster[Math.floor(Math.random() * opEaster.length)]);
    } else {
      C.expr += ' ' + C.ops[k] + ' ';
    }
  } else {
    if (C.justEvaluated) { C.expr = ''; }
    C.expr += k;
    C.checkOverwhelm();
  }
  C.justEvaluated = (k === 'eq');
  C.render();
};

/* ---------- button listeners ---------- */
document.querySelectorAll('button[data-k]').forEach(function (b) {
  b.addEventListener('click', function () { C.press(b.dataset.k, b); });
});

document.getElementById('clearHist').addEventListener('click', function () {
  C.history.length = 0;
  localStorage.setItem('kalkHist', JSON.stringify(C.history));
  C.renderHistory();
});

/* ---------- toggle calc ---------- */
document.getElementById('toggleCalc').addEventListener('click', function () {
  var hidden = document.body.classList.toggle('calc-hidden');
  C.showBubble(C.randomChar(), C.rand(hidden ? toggleMsgs.hide : toggleMsgs.show));
});

/* ---------- sound ---------- */
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
C.muted = localStorage.getItem('kalkMute') === '1';
var muteBtn = document.getElementById('muteBtn');
C.setMute = function (m) {
  C.muted = m;
  muteBtn.textContent = C.muted ? 'suara: off' : 'suara: on';
  localStorage.setItem('kalkMute', C.muted ? '1' : '0');
};
C.setMute(C.muted);
muteBtn.addEventListener('click', function () { C.setMute(!C.muted); });

C.clickSound = function (k) {
  if (!audioCtx) return;
  if (C.muted) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  var o = audioCtx.createOscillator();
  var g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.value = k === 'eq' ? 1200 : 700;
  g.gain.setValueAtTime(0.06, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.09);
};

/* ---------- theme ---------- */
var themeBtn = document.getElementById('themeBtn');
C.setTheme = function (light) {
  document.body.classList.toggle('light', light);
  themeBtn.textContent = light ? 'mode gelap' : 'mode terang';
  localStorage.setItem('kalkTheme', light ? 'light' : 'dark');
};
themeBtn.addEventListener('click', function () {
  C.setTheme(!document.body.classList.contains('light'));
});
if (localStorage.getItem('kalkTheme') === 'light') C.setTheme(true);

/* ---------- color palette ---------- */
var colorNames = ['pink', 'purple', 'cyan', 'green', 'orange', 'gold'];
C.setColor = function (t) {
  colorNames.forEach(function (n) { document.body.classList.remove('theme-' + n); });
  document.body.classList.add('theme-' + t);
  document.querySelectorAll('#palette .dot').forEach(function (d) { d.classList.toggle('on', d.dataset.t === t); });
  localStorage.setItem('kalkColor', t);
};
document.querySelectorAll('#palette .dot').forEach(function (d) {
  d.addEventListener('click', function () { C.setColor(d.dataset.t); });
});
var savedColor = localStorage.getItem('kalkColor');
C.setColor(colorNames.indexOf(savedColor) !== -1 ? savedColor : 'pink');

/* ---------- mode (pc / hp) ---------- */
var modeBtn = document.getElementById('modeBtn');
C.setMode = function (m) {
  var mobile = m === 'hp';
  document.body.classList.toggle('mode-mobile', mobile);
  modeBtn.textContent = mobile ? 'mode PC' : 'mode HP';
};
modeBtn.addEventListener('click', function () {
  var mobile = document.body.classList.contains('mode-mobile');
  C.setMode(mobile ? 'pc' : 'hp');
  C.showBubble(C.randomChar(), mobile ? 'kembali ke mode PC' : 'berpindah ke mode HP, pas untuk layar kecil');
});

/* ---------- keyboard ---------- */
document.addEventListener('keydown', function (e) {
  if (C.gameEl && C.gameEl.classList.contains('open') || C.toolsEl && C.toolsEl.classList.contains('open')) {
    if (e.key === 'Escape') { C.closeGame(); C.closeTools(); }
    return;
  }
  var intro = document.getElementById('intro');
  if (intro && e.key === 'Enter') {
    C.enterMode('pc');
    return;
  }
  var map = {
    'Enter': 'eq', '=': 'eq', 'Backspace': 'back', 'Escape': 'C',
    '*': 'mul', '/': 'div', '-': 'sub', '+': 'add', '^': 'sq', 'r': 'sqrt'
  };
  var k = null;
  if (map[e.key]) k = map[e.key];
  else if (/[0-9.%]/.test(e.key)) k = e.key;
  if (k) {
    C.flashButton(k);
    var btn = document.querySelector('button[data-k="' + k + '"]');
    C.press(k, btn);
  }
});

/* ---------- intro / entrance ---------- */
function startEntrance() {
  document.body.classList.add('loaded');
  document.querySelectorAll('.char img').forEach(function (img) { img.classList.add('walk'); });
  setTimeout(function () { C.showBubble('d3'); }, 2200);
  setTimeout(function () { C.showBubble('av'); }, 2900);
  C.idleLoop();
}

var introEl = document.getElementById('intro');
C.enterMode = function (mode) {
  C.setMode(mode);
  introEl.classList.add('exit');
  startEntrance();
  setTimeout(function () { introEl.remove(); }, 650);
};
document.getElementById('modePcBtn').addEventListener('click', function () { C.enterMode('pc'); });
document.getElementById('modeHpBtn').addEventListener('click', function () { C.enterMode('hp'); });

/* ---------- result copy ---------- */
C.resEl.style.cursor = 'pointer';
C.resEl.title = 'klik untuk menyalin hasil';
C.resEl.addEventListener('click', function () {
  var txt = String(parseFloat(C.shownValue) || 0);
  var done = function () { C.showBubble(C.randomChar(), 'hasil disalin: ' + txt); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(done).catch(done);
  } else {
    var ta = document.createElement('textarea');
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(ta);
    done();
  }
});

/* ---------- bootstrap ---------- */
C.render();
C.renderHistory();
