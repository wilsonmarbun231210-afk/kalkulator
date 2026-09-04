/* ============================================================
   tools.js – Unit converter + Memory feature
   ============================================================ */

C.toolsEl = document.getElementById('tools');
var toolsBtn = document.getElementById('toolsBtn');
var toolsClose = document.getElementById('toolsClose');
var activeTool = 'conv';

/* ---------- unit converter ---------- */
var CONV_UNITS = {
  panjang: [
    { n: 'meter', f: 1 }, { n: 'cm', f: 0.01 }, { n: 'km', f: 1000 },
    { n: 'inci', f: 0.0254 }, { n: 'kaki', f: 0.3048 }, { n: 'mil', f: 1609.344 }
  ],
  berat: [
    { n: 'kg', f: 1 }, { n: 'gram', f: 0.001 }, { n: 'pon', f: 0.45359237 },
    { n: 'ons', f: 0.0283495231 }, { n: 'ton', f: 1000 }
  ],
  kecepatan: [
    { n: 'm/s', f: 1 }, { n: 'km/jam', f: 1 / 3.6 }, { n: 'mil/jam', f: 0.44704 }, { n: 'knot', f: 0.514444 }
  ],
  suhu: [
    { n: '\u00b0C', toB: function (v) { return v; }, fromB: function (v) { return v; } },
    { n: '\u00b0F', toB: function (v) { return (v - 32) * 5 / 9; }, fromB: function (v) { return v * 9 / 5 + 32; } },
    { n: 'K', toB: function (v) { return v - 273.15; }, fromB: function (v) { return v + 273.15; } }
  ]
};

var convCat = document.getElementById('convCat');
var convVal = document.getElementById('convVal');
var convOut = document.getElementById('convOut');
var convFrom = document.getElementById('convFrom');
var convTo = document.getElementById('convTo');
var convSwap = document.getElementById('convSwap');

function convPopulateUnits() {
  var units = CONV_UNITS[convCat.value];
  convFrom.innerHTML = '';
  convTo.innerHTML = '';
  units.forEach(function (u, i) {
    convFrom.appendChild(new Option(u.n, i));
    convTo.appendChild(new Option(u.n, i));
  });
  convTo.selectedIndex = units.length > 1 ? 1 : 0;
  convUpdate();
}

function convUpdate() {
  var v = parseFloat(convVal.value);
  if (isNaN(v)) {
    convOut.value = '';
    return;
  }
  var cat = CONV_UNITS[convCat.value];
  var fromU = cat[+convFrom.value];
  var toU = cat[+convTo.value];
  var base = fromU.toB ? fromU.toB(v) : v * fromU.f;
  var out = toU.fromB ? toU.fromB(base) : base / toU.f;
  convOut.value = C.fmt(String(Math.round(out * 1e10) / 1e10));
}

convCat.addEventListener('change', convPopulateUnits);
convVal.addEventListener('input', convUpdate);
convFrom.addEventListener('change', convUpdate);
convTo.addEventListener('change', convUpdate);
convSwap.addEventListener('click', function () {
  var f = convFrom.selectedIndex;
  convFrom.selectedIndex = convTo.selectedIndex;
  convTo.selectedIndex = f;
  convUpdate();
});

/* ---------- memory ---------- */
var memVal = parseFloat(localStorage.getItem('kalkMem') || '0') || 0;
var memValEl = document.getElementById('memVal');

function memRender() {
  memValEl.textContent = C.fmt(String(Math.round(memVal * 1e10) / 1e10));
  localStorage.setItem('kalkMem', String(memVal));
}

function memCurrent() {
  var v = parseFloat(C.shownValue);
  return isFinite(v) ? v : 0;
}

document.getElementById('memMp').addEventListener('click', function () {
  memVal += memCurrent();
  memRender();
  C.showBubble(C.randomChar(), 'memori: +' + C.fmt(String(memCurrent())));
});
document.getElementById('memMm').addEventListener('click', function () {
  memVal -= memCurrent();
  memRender();
  C.showBubble(C.randomChar(), 'memori: \u2212' + C.fmt(String(memCurrent())));
});
document.getElementById('memMr').addEventListener('click', function () {
  C.expr = String(memVal);
  C.justEvaluated = true;
  C.render();
  C.showBubble(C.randomChar(), 'nilai memori dipindah ke layar');
});
document.getElementById('memMc').addEventListener('click', function () {
  memVal = 0;
  memRender();
  C.showBubble(C.randomChar(), 'memori dihapus');
});
memRender();

/* ---------- open / close ---------- */
C.openTools = function () {
  C.toolsEl.classList.add('open');
  if (activeTool === 'conv') convPopulateUnits();
};
C.closeTools = function () {
  C.toolsEl.classList.remove('open');
};
toolsBtn.addEventListener('click', function () {
  if (C.toolsEl.classList.contains('open')) C.closeTools();
  else { C.closeGame(); C.openTools(); }
});
toolsClose.addEventListener('click', C.closeTools);

/* ---------- tabs ---------- */
document.querySelectorAll('#tools .game-tabs .tab').forEach(function (t) {
  t.addEventListener('click', function () {
    document.querySelectorAll('#tools .game-tabs .tab').forEach(function (x) { x.classList.toggle('on', x === t); });
    activeTool = t.dataset.mode;
    document.getElementById('gm-conv').hidden = activeTool !== 'conv';
    document.getElementById('gm-mem').hidden = activeTool !== 'mem';
    if (activeTool === 'conv') convPopulateUnits();
  });
});
