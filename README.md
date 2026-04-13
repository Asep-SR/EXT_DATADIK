# 🚀 Datadik Ciamis Scraper Pro

**Datadik Ciamis Scraper Pro** adalah ekstensi Google Chrome yang dirancang untuk mengotomatisasi pengambilan data individu guru dari portal resmi Datadik Kemendikdasmen. Ekstensi ini dikembangkan untuk mendukung efisiensi pengolahan data di Dinas Pendidikan Kabupaten Ciamis.

Ekstensi ini menyuntikkan tombol kustom langsung ke dalam UI portal Datadik, memungkinkan pengguna untuk mengunduh data dari seluruh kecamatan di Kabupaten Ciamis menjadi satu file Excel secara otomatis.

---

## ✨ Fitur Utama
* **Automated Bulk Scraper:** Mengambil data dari seluruh kecamatan yang tersedia di dropdown secara berurutan.
* **Direct UI Injection:** Tombol download terintegrasi langsung di samping tombol "Tampilkan" asli portal.
* **Progress Tracking Modal:** UI Popup untuk memantau status pengambilan data (Pending, Loading, Success/Jumlah Guru).
* **Smart Data Mapping:** Mengonversi struktur *nested array* dari API Datadik menjadi format tabel Excel yang rapi.
* **Built-in Delay:** Memiliki jeda antar request untuk meminimalisir risiko blokir dari server (Rate Limiting).

## 🛠️ Spesifikasi Teknis
* **Manifest V3:** Menggunakan standar terbaru ekstensi Chrome.
* **SheetJS (XLSX):** Library utama untuk konversi JSON ke format Excel (.xlsx).
* **MutationObserver:** Memastikan tombol tetap muncul meskipun halaman memuat konten secara dinamis (AJAX).

## 📦 Struktur Folder
Pastikan struktur repositori Anda terlihat seperti ini:
```text
├── manifest.json         # Konfigurasi ekstensi
├── content.js            # Logika utama scraper & manipulasi DOM
├── style.css             # Desain modal progress
├── xlsx.full.min.js      # Library SheetJS (Wajib ada)
└── README.md             # Dokumentasi ini
```

## 🚀 Cara Instalasi
* Download repositori ini sebagai ZIP atau git clone.
* Buka Google Chrome dan buka chrome://extensions/.
* Aktifkan Developer Mode di pojok kanan atas.
* Klik Load unpacked dan pilih folder proyek ini.
* Pastikan Anda sudah mengunduh xlsx.full.min.js dari SheetJS CDN.

## 📖 Panduan Penggunaan
* Login ke portal Datadik.
* Pilih filter Provinsi dan Kabupaten (Ciamis).
* Klik tombol biru "Download Semua Kecamatan" yang muncul secara otomatis.
* Tunggu modal progress selesai memproses semua wilayah.
* File Excel akan terunduh secara otomatis setelah selesai.

## ⚠️ Disclaimer
Ekstensi ini dibuat khusus untuk mempermudah tugas administratif di lingkungan Kabupaten Ciamis. Penggunaan ekstensi ini harus mematuhi kebijakan privasi dan keamanan data yang berlaku di Kemendikdasmen. Pengembang tidak bertanggung jawab atas penyalahgunaan data hasil scraping.

##📍 Dikembangkan untuk Dinas Pendidikan Kabupaten Ciamis
