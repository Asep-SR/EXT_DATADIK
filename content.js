const columns = [
    "Nama", "NIK", "NUPTK", "NIP", "L/P", "Tempat Lahir", "Tanggal Lahir",
    "Status Tugas", "Tempat Tugas", "NPSN", "Kecamatan", "Kabupaten/Kota",
    "Nomor HP", "SK CPNS", "Tanggal CPNS", "SK Pengangkatan", "TMT Pengangkatan",
    "Jenis PTK", "Jabatan PTK", "Pendidikan", "Bidang Studi Pendidikan",
    "Bidang Studi Sertifikasi", "Status Kepegawaian", "Pangkat/Gol",
    "TMT Pangkat", "Masa Kerja Tahun", "Masa Kerja Bulan",
    "Mata Pelajaran Diajarkan", "Jam Mengajar Perminggu", "Jabatan Kepsek"
];

// Injeksi Tombol ke UI Datadik
function injectButton() {
    const originalBtn = document.getElementById('tampil');
    if (originalBtn && !document.getElementById('btn-scraper-ciamis')) {
        const scraperBtn = document.createElement('button');
        scraperBtn.id = 'btn-scraper-ciamis';
        scraperBtn.className = 'btn btn-primary'; // Menggunakan class bootstrap asli Datadik
        scraperBtn.style.marginLeft = '10px';
        scraperBtn.style.backgroundColor = '#007bff';
        scraperBtn.innerHTML = '<i class="icon-cloud-download"></i> Download Semua Kecamatan';
        
        originalBtn.parentNode.appendChild(scraperBtn);
        scraperBtn.addEventListener('click', runBulkScraper);
    }
}

async function runBulkScraper() {
    const selectKec = document.getElementById('kec');
    const options = Array.from(selectKec.options).filter(opt => opt.value !== "");
    
    if (options.length === 0) {
        alert("Pilih kabupaten terlebih dahulu agar daftar kecamatan muncul.");
        return;
    }

    if (!confirm(`Apakah Anda ingin mendownload data dari ${options.length} kecamatan?`)) return;

    // Tampilkan Modal
    const modal = createModal(options);
    document.body.appendChild(modal);

    let finalData = [];

    for (const opt of options) {
        updateUIStatus(opt.value, 'loading', 'Proses...');
        
        try {
            // Fetch langsung ke endpoint API sesuai format yang Anda berikan
            const response = await fetch(`https://datadik.kemendikdasmen.go.id/ma74/xindividuguru/${opt.value}`);
            const data = await response.json();

            if (Array.isArray(data)) {
                data.forEach(row => {
                    let entry = {};
                    columns.forEach((colName, index) => {
                        entry[colName] = (row[index] === null || row[index] === undefined) ? "" : row[index];
                    });
                    finalData.push(entry);
                });
                updateUIStatus(opt.value, 'success', `${data.length} Guru`);
            } else {
                updateUIStatus(opt.value, 'error', 'Format Salah');
            }
        } catch (err) {
            console.error(`Error ID ${opt.value}:`, err);
            updateUIStatus(opt.value, 'error', 'Gagal');
        }

        // Jeda 300ms agar tidak membebani server
        await new Promise(r => setTimeout(r, 300));
    }

    // Proses Download via SheetJS
    if (finalData.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(finalData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Guru");
        
        const fileName = `Data_Guru_Kab_Ciamis_${new Date().toLocaleDateString().replace(/\//g,'-')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        alert("Scraping Selesai! File Excel telah diunduh.");
    } else {
        alert("Tidak ada data yang berhasil ditarik.");
    }
}

function createModal(options) {
    const overlay = document.createElement('div');
    overlay.id = 'scraper-modal-overlay';
    
    let listHtml = options.map(opt => `
        <div class="progress-item">
            <span>${opt.text}</span>
            <span id="stat-${opt.value}" class="badge-status pending">Menunggu</span>
        </div>
    `).join('');

    overlay.innerHTML = `
        <div class="scraper-modal-content">
            <h4><i class="icon-download-alt"></i> Progress Scraping</h4>
            <div style="margin-bottom: 15px; font-size: 12px; color: #666;">
                Mohon jangan tutup halaman ini sampai proses selesai.
            </div>
            ${listHtml}
            <button class="btn-close-scraper" onclick="this.parentElement.parentElement.remove()">Batalkan & Tutup</button>
        </div>
    `;
    return overlay;
}

function updateUIStatus(id, statusClass, text) {
    const el = document.getElementById(`stat-${id}`);
    if (el) {
        el.className = `badge-status ${statusClass}`;
        el.innerText = text;
    }
}

// Pantau perubahan DOM (karena Datadik menggunakan navigasi dinamis/AJAX)
const observer = new MutationObserver(() => injectButton());
observer.observe(document.body, { childList: true, subtree: true });

// Inisialisasi awal
injectButton();