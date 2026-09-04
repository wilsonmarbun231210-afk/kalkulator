/* ============================================================
   game.js – Guess Number + Math Speed minigames
   ============================================================ */

C.gameEl = document.getElementById('game');
var gameBtn = document.getElementById('gameBtn');
var gameClose = document.getElementById('gameClose');
var activeMode = 'guess';

/* ---------- guess number ---------- */
var gGuessInput = document.getElementById('gGuessInput');
var gGuessBtn = document.getElementById('gGuessBtn');
var gRestart = document.getElementById('gRestart');
var gAttemptsEl = document.getElementById('gAttempts');
var gBestEl = document.getElementById('gBest');
var gHint = document.getElementById('gHint');
var gSecret = 0, gAttempts = 0;
var gBest = parseInt(localStorage.getItem('kalkBest') || '0', 10);

function gNewGame() {
  gSecret = 1 + Math.floor(Math.random() * 100);
  gAttempts = 0;
  gAttemptsEl.textContent = '0';
  gBestEl.textContent = gBest || '\u2013';
  gHint.textContent = 'pilih angka di antara 1 sampai 100. D3rlord3 dan Avery siap membantu.';
  gGuessInput.value = '';
  gGuessInput.disabled = false;
  gGuessInput.focus();
}

function gSubmit() {
  var n = parseInt(gGuessInput.value, 10);
  if (!n || n < 1 || n > 100) {
    gHint.textContent = 'angka harus di antara 1 sampai 100.';
    return;
  }
  gAttempts++;
  gAttemptsEl.textContent = gAttempts;
  gGuessInput.value = '';
  gGuessInput.focus();
  if (n === gSecret) {
    gGuessInput.disabled = true;
    var newBest = !gBest || gAttempts < gBest;
    gHint.textContent = 'benar!! angkanya ' + gSecret + ', tepat dalam ' + gAttempts + ' percobaan.' + (newBest ? ' rekor baru!' : '');
    if (newBest) {
      gBest = gAttempts;
      localStorage.setItem('kalkBest', String(gBest));
      gBestEl.textContent = gBest;
    }
    C.triggerFlash();
    C.burstConfetti(window.innerWidth / 2, window.innerHeight / 2);
    C.showBubble(C.randomChar(), newBest ? 'rekor baru, hebat!' : 'tepat! kamu jago tebak angka');
  } else if (n < gSecret) {
    gHint.textContent = 'terlalu kecil. naikkan angkanya.';
  } else {
    gHint.textContent = 'terlalu besar. turunkan angkanya.';
  }
}

gGuessBtn.addEventListener('click', gSubmit);
gGuessInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') gSubmit(); });
gRestart.addEventListener('click', gNewGame);

/* ---------- math speed ---------- */
var mQ = document.getElementById('mQ');
var mScoreEl = document.getElementById('mScore');
var mTimeEl = document.getElementById('mTime');
var mHint = document.getElementById('mHint');
var mAnswerInput = document.getElementById('mAnswerInput');
var mAnswerBtn = document.getElementById('mAnswerBtn');
var mRestart = document.getElementById('mRestart');
var mScore = 0, mAnswer = 0, mLeft = 30, mTimerId = null;

function mNewQuestion() {
  var type = Math.floor(Math.random() * 4);
  var a, b, op, res;
  if (type === 0) {
    a = 2 + Math.floor(Math.random() * 98);
    b = 2 + Math.floor(Math.random() * 98);
    op = '+';
    res = a + b;
  } else if (type === 1) {
    a = 2 + Math.floor(Math.random() * 98);
    b = 2 + Math.floor(Math.random() * (a - 1));
    op = '\u2212';
    res = a - b;
  } else if (type === 2) {
    a = 2 + Math.floor(Math.random() * 12);
    b = 2 + Math.floor(Math.random() * 12);
    op = '\u00d7';
    res = a * b;
  } else {
    b = 2 + Math.floor(Math.random() * 12);
    res = 2 + Math.floor(Math.random() * 12);
    a = b * res;
    op = '\u00f7';
  }
  mAnswer = res;
  mQ.textContent = a + ' ' + op + ' ' + b + ' = ?';
  mAnswerInput.value = '';
  mAnswerInput.disabled = false;
  mAnswerInput.focus();
}

function mTick() {
  mLeft--;
  mTimeEl.textContent = mLeft;
  if (mLeft <= 0) {
    clearInterval(mTimerId);
    mTimerId = null;
    mAnswerInput.disabled = true;
    mHint.textContent = 'waktu habis! skor kamu ' + mScore + '. coba lagi?';
    C.showBubble(C.randomChar(), 'waktu habis, skor ' + mScore);
  }
}

function mStart() {
  if (mTimerId) clearInterval(mTimerId);
  mScore = 0;
  mLeft = 30;
  mScoreEl.textContent = '0';
  mTimeEl.textContent = '30';
  mHint.textContent = 'jawab secepatnya, setiap benar dapat +1. waktu 30 detik!';
  mNewQuestion();
  mTimerId = setInterval(mTick, 1000);
}

function mSubmit() {
  var v = parseInt(mAnswerInput.value, 10);
  if (isNaN(v) || mAnswerInput.value.trim() === '') return;
  if (v === mAnswer) {
    mScore++;
    mScoreEl.textContent = mScore;
    mHint.textContent = 'benar! +1';
    mNewQuestion();
  } else {
    mHint.textContent = 'salah, jawabannya ' + mAnswer + '.';
  }
}

mAnswerBtn.addEventListener('click', mSubmit);
mAnswerInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') mSubmit(); });
mRestart.addEventListener('click', mStart);

/* ---------- open / close ---------- */
C.openGame = function () {
  C.gameEl.classList.add('open');
  if (activeMode === 'guess') gNewGame();
  else mStart();
};

C.closeGame = function () {
  C.gameEl.classList.remove('open');
  if (mTimerId) {
    clearInterval(mTimerId);
    mTimerId = null;
  }
};

gameBtn.addEventListener('click', function () {
  if (C.gameEl.classList.contains('open')) C.closeGame();
  else { C.closeTools(); C.openGame(); }
});
gameClose.addEventListener('click', C.closeGame);

/* ---------- tabs ---------- */
document.querySelectorAll('.game-tabs .tab').forEach(function (t) {
  t.addEventListener('click', function () {
    if (mTimerId) {
      clearInterval(mTimerId);
      mTimerId = null;
    }
    document.querySelectorAll('.game-tabs .tab').forEach(function (x) { x.classList.toggle('on', x === t); });
    activeMode = t.dataset.mode;
    document.getElementById('gm-guess').hidden = activeMode !== 'guess';
    document.getElementById('gm-math').hidden = activeMode !== 'math';
    if (activeMode === 'guess') gNewGame();
    else mStart();
  });
});
