const columns = [
    "Nama", "NIK", "NUPTK", "NIP", "L/P", "Tempat Lahir", "Tanggal Lahir",
    "Status Tugas", "Tempat Tugas", "NPSN", "Kecamatan", "Kabupaten/Kota",
    "Nomor HP", "SK CPNS", "Tanggal CPNS", "SK Pengangkatan", "TMT Pengangkatan",
    "Jenis PTK", "Jabatan PTK", "Pendidikan", "Bidang Studi Pendidikan",
    "Bidang Studi Sertifikasi", "Status Kepegawaian", "Pangkat/Gol",
    "TMT Pangkat", "Masa Kerja Tahun", "Masa Kerja Bulan",
    "Mata Pelajaran Diajarkan", "Jam Mengajar Perminggu", "Jabatan Kepsek"
];

let isScrapingCancelled = false; 

function injectButton() {
    const originalBtn = document.getElementById('tampil');
    if (originalBtn && !document.getElementById('btn-scraper-ciamis')) {
        const scraperBtn = document.createElement('button');
        scraperBtn.id = 'btn-scraper-ciamis';
        scraperBtn.className = 'btn btn-primary'; 
        scraperBtn.style.marginLeft = '10px';
        scraperBtn.innerHTML = '<i class="icon-cloud-download"></i> Download Semua Kecamatan';
        
        originalBtn.parentNode.appendChild(scraperBtn);
        scraperBtn.addEventListener('click', showConfirmationModal);
    }
}

function getProcessingText(index) {
    const dots = ['.', '..', '...'];
    return `Memproses${dots[index % 3]}`;
}

// Menampilkan modal konfirmasi Bootstrap 3
function showConfirmationModal() {
    const selectKec = document.getElementById('kec');
    const options = Array.from(selectKec.options).filter(opt => opt.value !== "");

    if (options.length === 0) {
        showBootstrapAlert("Peringatan", "Pilih kabupaten terlebih dahulu agar daftar kecamatan muncul.", "warning");
        return;
    }

    // Bersihkan backdrop sebelumnya untuk mencegah layar unclickable
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

    let confirmModal = document.getElementById('confirmScraperModal');
    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.id = 'confirmScraperModal';
        confirmModal.className = 'modal fade';
        confirmModal.setAttribute('tabindex', '-1');
        confirmModal.setAttribute('role', 'dialog');
        confirmModal.style.zIndex = '1050';
        
        confirmModal.innerHTML = `
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">Konfirmasi Download</h4>
                    </div>
                    <div class="modal-body">
                        <p>Apakah Anda ingin mendownload data dari <strong id="modal-kec-count">0</strong> kecamatan?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="btn-confirm-yes">Ya, Lanjutkan</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
    }

    document.getElementById('modal-kec-count').innerText = options.length;

    document.getElementById('btn-confirm-yes').onclick = function() {
        if (typeof $ !== 'undefined' && $('#confirmScraperModal').modal) {
            $('#confirmScraperModal').modal('hide');
        } else {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
            confirmModal.classList.remove('in');
            confirmModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
        
        runBulkScraper();
    };

    if (typeof $ !== 'undefined' && $('#confirmScraperModal').modal) {
        $('#confirmScraperModal').modal('show');
    } else {
        confirmModal.classList.add('in');
        confirmModal.style.display = 'block';
        document.body.classList.add('modal-open');
        
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade in';
        document.body.appendChild(backdrop);
        
        confirmModal.querySelector('.close').onclick = function() {
            backdrop.remove();
            confirmModal.classList.remove('in');
            confirmModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        };
    }
}

function showBootstrapAlert(title, message, type = 'info') {
    let alertDiv = document.getElementById('bootstrapScraperAlert');
    if (!alertDiv) {
        alertDiv = document.createElement('div');
        alertDiv.id = 'bootstrapScraperAlert';
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        document.body.appendChild(alertDiv);
    }

    alertDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible" role="alert" style="box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <strong>${title}</strong><br>${message}
        </div>
    `;

    setTimeout(() => {
        if (alertDiv) {
            alertDiv.innerHTML = '';
        }
    }, 6000);
}

async function runBulkScraper() {
    const selectKec = document.getElementById('kec');
    const options = Array.from(selectKec.options).filter(opt => opt.value !== "");

    isScrapCancelled = false; 
    
    const oldModal = document.getElementById('scraper-modal-overlay');
    if (oldModal) oldModal.remove();
    
    const modal = createModal(options);
    document.body.appendChild(modal);

    let finalData = [];
    const total = options.length;

    for (let i = 0; i < total; i++) {
        if (isScrapCancelled) {
            updateGlobalProgress('Dibatalkan', 'custom-progress-danger', null);
            break; 
        }

        const opt = options[i];
        updateUIStatus(opt.value, 'loading', 'Loading...');
        
        const percent = Math.round((i / total) * 100);
        updateGlobalProgress(`${percent}% - ${getProcessingText(i)}`, 'custom-progress-animated', percent);
        
        try {
            const response = await fetch(`https://datadik.kemendikdasmen.go.id/ma74/xindividuguru/${opt.value}`);
            const data = await response.json();

            let dataRows = [];
            if (Array.isArray(data)) {
                dataRows = data;
            } else if (data && typeof data === 'object') {
                let dataSource = data.sppg ? data.sppg : data;
                dataRows = Array.isArray(dataSource) ? dataSource : Object.values(dataSource);
            }

            if (dataRows.length > 0) {
                dataRows.forEach(row => {
                    let entry = {};
                    columns.forEach((colName, index) => {
                        entry[colName] = (row[index] === null || row[index] === undefined) ? "" : row[index];
                    });
                    finalData.push(entry);
                });
                updateUIStatus(opt.value, 'success', `${dataRows.length} Data`);
            } else {
                updateUIStatus(opt.value, 'error', 'Kosong');
            }
        } catch (err) {
            console.error(`Error ID ${opt.value}:`, err);
            updateUIStatus(opt.value, 'error', 'Gagal');
        }

        await new Promise(r => setTimeout(r, 400));
    }

    if (isScrapCancelled) return; 

    updateGlobalProgress('100% - Menyusun Excel...', 'custom-progress-animated', 100);

    if (finalData.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(finalData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Guru");
        
        const fileName = `Data_Guru_Kab_Ciamis_${new Date().toLocaleDateString().replace(/\//g,'-')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        showBootstrapAlert("Berhasil", "Scraping Selesai! File Excel telah diunduh.", "success");
        updateGlobalProgress('Selesai!', 'custom-progress-success', 100);
        setTimeout(() => closeScraperModal(), 3000);
    } else {
        showBootstrapAlert("Informasi", "Tidak ada data yang berhasil ditarik.", "info");
        updateGlobalProgress('Selesai (Tanpa Data)', 'custom-progress-danger', 100);
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
            <h4><i class="icon-download-alt"></i> Progress Penarikan Data</h4>
            <div style="font-size: 12px; color: #666; margin-bottom: 10px;">Mohon jangan tutup halaman ini sampai proses selesai.</div>
            
            <div class="custom-progress-container">
                <div id="main-progress-bar" class="custom-progress-bar custom-progress-animated" style="width: 0%;">0%</div>
            </div>

            <div class="scraper-list-container">
                ${listHtml}
            </div>
            
            <button id="btn-cancel-scraper" class="btn-close-scraper">Batalkan & Tutup</button>
        </div>
    `;

    // Pastikan listener untuk tombol cancel terpasang saat elemen dibuat
    setTimeout(() => {
        const btnCancel = overlay.querySelector('#btn-cancel-scraper');
        if (btnCancel) {
            btnCancel.addEventListener('click', cancelScraping);
        }
    }, 100);

    return overlay;
}

function updateUIStatus(id, customClass, text) {
    const el = document.getElementById(`stat-${id}`);
    if (el) {
        el.className = `badge-status ${customClass}`;
        el.innerText = text;
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function updateGlobalProgress(text, stateClass, percent = null) {
    const bar = document.getElementById('main-progress-bar');
    if (bar) {
        bar.innerText = text;
        bar.className = `custom-progress-bar ${stateClass}`;
        if (percent !== null) {
            bar.style.width = `${percent}%`;
        }
    }
}

function cancelScraping() {
    isScrapCancelled = true;
    updateGlobalProgress('Membatalkan...', 'custom-progress-danger', null);
    
    // Hapus backdrop atau elemen modal apabila ada sisa-sisa di DOM
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.remove();
    }
    document.body.classList.remove('modal-open');

    setTimeout(() => {
        closeScraperModal();
    }, 800);
}

function closeScraperModal() {
    const modal = document.getElementById('scraper-modal-overlay');
    if (modal) modal.remove();
}

const observer = new MutationObserver(() => injectButton());
observer.observe(document.body, { childList: true, subtree: true });

injectButton();