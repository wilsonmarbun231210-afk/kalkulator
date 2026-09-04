# Kalkulator

Kalkulator web interaktif dengan tema, minigame, dan tools - dibuat oleh **Wilson**.

> Semantic HTML, CSS, dan JavaScript dipisah ke folder masing-masing agar mudah dirawat.

## Fitur

**Kalkulator**
- Operasi dasar: tambah, kurang, kali, bagi
- Fungsi: persen `%`, kuadrat `x²`, akar `√`, negatif `±`
- Riwayat perhitungan (tersimpan di `localStorage`)
- Salin hasil dengan klik pada angka hasil
- Dukungan keyboard (angka, `+ - * /`, `Enter` = `=`, `Backspace` = hapus, `Esc` = `C`)

**Tampilan**
- Mode gelap / terang
- 6 warna aksen: pink, ungu, cyan, hijau, oranye, emas
- Mode PC / HP (responsive)
- Animasi partikel, confetti, dan karakter D3rlord3 & Avery sebagai "asisten" yang bisa diajak bicara dan diseret

**Minigame**
- Tebak angka (1–100, ada rekor terbaik)
- Hitung cepat (kuis dengan waktu 30 detik)

**Tools**
- Konversi satuan: panjang, berat, suhu, kecepatan
- Memori kalkulator: M+ / M− / MR / MC

## Struktur Folder

```
kalkulator/
├── index.html          # Halaman utama (HTML murni, tanpa CSS/JS inline)
├── css/
│   └── style.css       # Semua styling & tema
├── js/
│   ├── app.js          # Logika inti kalkulator (state, compute, history, tema, mode, keyboard)
│   ├── effects.js      # Partikel, confetti, bubble, animasi karakter, drag
│   ├── game.js         # Minigame: tebak angka + hitung cepat
│   └── tools.js        # Tools: konversi satuan + memori
└── assets/
    ├── avery_sprite.png
    ├── d3rlord3_sprite.png
    └── pintu.webp      # Background layar masuk
```

## Cara Menjalankan

Bisa dibuka langsung dengan double-click pada `index.html`, atau lewat server lokal:

```bash
# dari folder proyek
python -m http.server 8765
# lalu buka http://localhost:8765
```

## Catatan Teknis

- Tidak memakai framework / library eksternal — pure HTML, CSS, dan JavaScript.
- Data disimpan di `localStorage` (riwayat, tema, warna, mode, suara, rekor game, memori).
- Urutan pemuatan JS di `index.html` penting: `app.js` mendefinisikan namespace `window.C` yang dipakai modul lain (`effects.js`, `game.js`, `tools.js`).
