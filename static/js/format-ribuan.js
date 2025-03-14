// Function untuk memformat angka dengan pemisah ribuan
function formatRibuan(angka) {
    // Hapus semua karakter non-digit
    const numberOnly = angka.replace(/\D/g, '');
    
    // Format dengan pemisah ribuan
    return new Intl.NumberFormat('id-ID').format(numberOnly);
}

// Function untuk mengatur format ribuan pada input
function setupFormatRibuan() {
    // Ambil referensi ke input amount
    const incomeAmountInput = document.getElementById('income-amount');
    const expenseAmountInput = document.getElementById('expense-amount');
    
    // Konversi input number menjadi text dan tambahkan event listener untuk format ribuan
    if (incomeAmountInput) {
        incomeAmountInput.type = 'text';
        incomeAmountInput.pattern = '[0-9\\.]*'; // Hanya terima angka dan titik

        incomeAmountInput.addEventListener('input', function() {
            // Simpan posisi kursor
            const cursorPos = this.selectionStart;
            const originalLength = this.value.length;
            
            // Format angka
            const value = this.value.replace(/\./g, ''); // Hapus titik yang sudah ada
            this.value = formatRibuan(value);
            
            // Sesuaikan posisi kursor setelah pemformatan
            const newLength = this.value.length;
            const posDiff = newLength - originalLength;
            this.setSelectionRange(cursorPos + (posDiff > 0 ? posDiff : 0), cursorPos + (posDiff > 0 ? posDiff : 0));
        });
    }
    
    if (expenseAmountInput) {
        expenseAmountInput.type = 'text';
        expenseAmountInput.pattern = '[0-9\\.]*'; // Hanya terima angka dan titik
        
        expenseAmountInput.addEventListener('input', function() {
            // Simpan posisi kursor
            const cursorPos = this.selectionStart;
            const originalLength = this.value.length;
            
            // Format angka
            const value = this.value.replace(/\./g, ''); // Hapus titik yang sudah ada
            this.value = formatRibuan(value);
            
            // Sesuaikan posisi kursor setelah pemformatan
            const newLength = this.value.length;
            const posDiff = newLength - originalLength;
            this.setSelectionRange(cursorPos + (posDiff > 0 ? posDiff : 0), cursorPos + (posDiff > 0 ? posDiff : 0));
        });
    }
}

// Saat form submit, tambahkan preprocessor untuk membersihkan format ribuan
function setupFormSubmitInterceptors() {
    // Intercept income form
    const incomeForm = document.getElementById('income-form');
    if (incomeForm) {
        incomeForm.addEventListener('submit', function() {
            const amountInput = document.getElementById('income-amount');
            // Simpan nilai numerik asli dalam hidden field
            const numericValue = amountInput.value.replace(/\./g, '');
            
            // Simpan nilai asli (hidden) dan tampilkan nilai yang diformat
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'amount_numeric';
            hiddenInput.value = numericValue;
            this.appendChild(hiddenInput);
            
            // Juga update nilai input asli untuk dijadikan nilai numerik
            amountInput.value = numericValue;
        }, true); // Gunakan fase capturing agar dijalankan sebelum handler asli
    }
    
    // Intercept expense form
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', function() {
            const amountInput = document.getElementById('expense-amount');
            // Simpan nilai numerik asli dalam hidden field
            const numericValue = amountInput.value.replace(/\./g, '');
            
            // Simpan nilai asli (hidden) dan tampilkan nilai yang diformat
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'amount_numeric';
            hiddenInput.value = numericValue;
            this.appendChild(hiddenInput);
            
            // Juga update nilai input asli untuk dijadikan nilai numerik
            amountInput.value = numericValue;
        }, true); // Gunakan fase capturing agar dijalankan sebelum handler asli
    }
}

// Patch untuk metode editIncome dan editExpense agar mengkonversi angka ke format ribuan
function patchEditMethods() {
    // Simpan referensi ke fungsi original
    const originalEditIncome = window.editIncome;
    if (originalEditIncome) {
        window.editIncome = function(id) {
            // Panggil fungsi original terlebih dahulu
            originalEditIncome(id).then(() => {
                // Setelah form diisi, format amountnya
                const amountInput = document.getElementById('income-amount');
                if (amountInput && amountInput.value) {
                    amountInput.value = formatRibuan(amountInput.value);
                }
            });
        };
    }
    
    const originalEditExpense = window.editExpense;
    if (originalEditExpense) {
        window.editExpense = function(id) {
            // Panggil fungsi original terlebih dahulu
            originalEditExpense(id).then(() => {
                // Setelah form diisi, format amountnya
                const amountInput = document.getElementById('expense-amount');
                if (amountInput && amountInput.value) {
                    amountInput.value = formatRibuan(amountInput.value);
                }
            });
        };
    }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    // Setup format ribuan untuk input
    setupFormatRibuan();
    
    // Setup preprocessor untuk form submit
    setupFormSubmitInterceptors();
    
    // Patch metode edit
    patchEditMethods();
});