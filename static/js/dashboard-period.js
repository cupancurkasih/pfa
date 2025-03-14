// JavaScript untuk fitur ringkasan bulanan dan tahunan

// Variabel global untuk menyimpan data
let dashboardData = {
    monthly: null,
    yearly: null,
    currentPeriod: 'monthly',
    currentMonth: new Date().getMonth() + 1,
    currentYear: new Date().getFullYear()
};

// Function untuk inisialisasi fitur periode
function initPeriodSelector() {
    // Atur bulan aktif pada dropdown
    const monthSelector = document.getElementById('month-selector');
    if (monthSelector) {
        monthSelector.value = dashboardData.currentMonth;
        
        // Event listener untuk perubahan bulan
        monthSelector.addEventListener('change', function() {
            dashboardData.currentMonth = parseInt(this.value);
            loadMonthlyData(dashboardData.currentMonth, dashboardData.currentYear);
        });
    }
    
    // Isi dropdown tahun
    const yearSelector = document.getElementById('year-selector');
    if (yearSelector) {
        // Tambahkan opsi untuk 5 tahun terakhir hingga tahun depan
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 4; year <= currentYear + 1; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelector.appendChild(option);
        }
        
        // Set tahun aktif
        yearSelector.value = dashboardData.currentYear;
        
        // Event listener untuk perubahan tahun
        yearSelector.addEventListener('change', function() {
            dashboardData.currentYear = parseInt(this.value);
            
            if (dashboardData.currentPeriod === 'monthly') {
                loadMonthlyData(dashboardData.currentMonth, dashboardData.currentYear);
            } else {
                loadYearlyData(dashboardData.currentYear);
            }
        });
    }
    
    // Event listener untuk tombol periode
    const monthlyViewBtn = document.getElementById('monthly-view');
    const yearlyViewBtn = document.getElementById('yearly-view');
    
    if (monthlyViewBtn && yearlyViewBtn) {
        monthlyViewBtn.addEventListener('click', function() {
            switchToPeriod('monthly');
        });
        
        yearlyViewBtn.addEventListener('click', function() {
            switchToPeriod('yearly');
        });
    }
    
    // Muat data awal
    loadInitialData();
}

// Function untuk berganti periode (bulanan/tahunan)
function switchToPeriod(period) {
    // Update status aktif tombol
    const monthlyViewBtn = document.getElementById('monthly-view');
    const yearlyViewBtn = document.getElementById('yearly-view');
    
    if (period === 'monthly') {
        monthlyViewBtn.classList.add('active');
        yearlyViewBtn.classList.remove('active');
        
        // Tampilkan dropdown bulanan, sembunyikan dropdown tahunan
        document.getElementById('monthly-dropdown').style.display = 'inline-block';
        document.getElementById('yearly-dropdown').style.display = 'none';
        
        // Tampilkan chart bulanan, sembunyikan chart tahunan
        document.getElementById('monthly-chart-container').style.display = 'block';
        document.getElementById('yearly-chart-container').style.display = 'none';
        
        // Tampilkan label bulanan, sembunyikan label tahunan
        document.querySelectorAll('.monthly-label').forEach(el => el.style.display = 'inline');
        document.querySelectorAll('.yearly-label').forEach(el => el.style.display = 'none');
        
        // Sembunyikan ringkasan tahunan
        document.getElementById('yearly-summary').style.display = 'none';
        
        // Muat data bulanan
        loadMonthlyData(dashboardData.currentMonth, dashboardData.currentYear);
    } else {
        yearlyViewBtn.classList.add('active');
        monthlyViewBtn.classList.remove('active');
        
        // Tampilkan dropdown tahunan, sembunyikan dropdown bulanan
        document.getElementById('yearly-dropdown').style.display = 'inline-block';
        document.getElementById('monthly-dropdown').style.display = 'none';
        
        // Tampilkan chart tahunan, sembunyikan chart bulanan
        document.getElementById('yearly-chart-container').style.display = 'block';
        document.getElementById('monthly-chart-container').style.display = 'none';
        
        // Tampilkan label tahunan, sembunyikan label bulanan
        document.querySelectorAll('.yearly-label').forEach(el => el.style.display = 'inline');
        document.querySelectorAll('.monthly-label').forEach(el => el.style.display = 'none');
        
        // Tampilkan ringkasan tahunan
        document.getElementById('yearly-summary').style.display = 'block';
        
        // Muat data tahunan
        loadYearlyData(dashboardData.currentYear);
    }
    
    dashboardData.currentPeriod = period;
}

// Function untuk memuat data awal
function loadInitialData() {
    // Muat data bulanan terlebih dahulu (default view)
    loadMonthlyData(dashboardData.currentMonth, dashboardData.currentYear);
    
    // Muat data tahunan di background
    loadYearlyData(dashboardData.currentYear);
}

// Function untuk memuat data bulanan
function loadMonthlyData(month, year) {
    // Format bulan untuk API (dengan leading zero jika diperlukan)
    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString();
    const periodStart = `${yearStr}-${monthStr}-01`;
    
    // Hitung hari terakhir dari bulan
    const lastDay = new Date(year, month, 0).getDate();
    const periodEnd = `${yearStr}-${monthStr}-${lastDay}`;
    
    // Panggil API untuk mendapatkan data
    fetch(`/api/dashboard-summary?period=monthly&start_date=${periodStart}&end_date=${periodEnd}`)
        .then(response => response.json())
        .then(data => {
            // Simpan data ke variabel global
            dashboardData.monthly = data;
            
            // Update UI
            updateDashboardStats(data);
            updateMonthlyChart(data);
            updatePieChart(data.category_data);
            updateCategoryTable(data.category_data);
        })
        .catch(error => {
            console.error('Error loading monthly data:', error);
            alert('Terjadi kesalahan saat memuat data bulanan.');
        });
}

// Function untuk memuat data tahunan
function loadYearlyData(year) {
    // Format periode untuk API
    const periodStart = `${year}-01-01`;
    const periodEnd = `${year}-12-31`;
    
    // Panggil API untuk mendapatkan data
    fetch(`/api/dashboard-summary?period=yearly&start_date=${periodStart}&end_date=${periodEnd}`)
        .then(response => response.json())
        .then(data => {
            // Simpan data ke variabel global
            dashboardData.yearly = data;
            
            // Jika view aktif adalah tahunan, update UI
            if (dashboardData.currentPeriod === 'yearly') {
                updateDashboardStats(data);
                updateYearlyChart(data);
                updatePieChart(data.category_data);
                updateCategoryTable(data.category_data);
            }
            
            // Update ringkasan tahunan (Top Income/Expense Months)
            updateYearlySummary(data);
        })
        .catch(error => {
            console.error('Error loading yearly data:', error);
            alert('Terjadi kesalahan saat memuat data tahunan.');
        });
}

// Function untuk update statistik dashboard
function updateDashboardStats(data) {
    // Format currency
    const formatCurrency = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });
    
    // Update nilai statistik
    document.getElementById('total-income-value').textContent = formatCurrency.format(data.total_income || 0);
    document.getElementById('total-expense-value').textContent = formatCurrency.format(data.total_expense || 0);
    document.getElementById('balance-value').textContent = formatCurrency.format(data.balance || 0);
    
    // Update persentase saldo
    const balancePercentage = data.total_income > 0 ? ((data.balance / data.total_income) * 100).toFixed(0) : 0;
    document.getElementById('balance-percentage').textContent = `${balancePercentage}%`;
    
    // Update tren pendapatan
    const incomeTrendEl = document.getElementById('income-trend');
    if (data.total_income > 0) {
        if (data.income_trend > 0) {
            incomeTrendEl.innerHTML = `<i class="fas fa-arrow-up" style="color: #51cf66;"></i> +${data.income_trend}% dari periode sebelumnya`;
        } else if (data.income_trend < 0) {
            incomeTrendEl.innerHTML = `<i class="fas fa-arrow-down" style="color: #ff6b6b;"></i> ${data.income_trend}% dari periode sebelumnya`;
        } else {
            incomeTrendEl.innerHTML = `<i class="fas fa-minus" style="color: #6c757d;"></i> Tidak ada perubahan`;
        }
    } else {
        incomeTrendEl.innerHTML = `<i class="fas fa-minus" style="color: #6c757d;"></i> Belum ada pendapatan`;
    }
    
    // Update tren pengeluaran
    const expenseTrendEl = document.getElementById('expense-trend');
    if (data.total_expense > 0) {
        if (data.expense_trend > 0) {
            expenseTrendEl.innerHTML = `<i class="fas fa-arrow-up" style="color: #ff6b6b;"></i> +${data.expense_trend}% dari periode sebelumnya`;
        } else if (data.expense_trend < 0) {
            expenseTrendEl.innerHTML = `<i class="fas fa-arrow-down" style="color: #51cf66;"></i> ${data.expense_trend}% dari periode sebelumnya`;
        } else {
            expenseTrendEl.innerHTML = `<i class="fas fa-minus" style="color: #6c757d;"></i> Tidak ada perubahan`;
        }
    } else {
        expenseTrendEl.innerHTML = `<i class="fas fa-minus" style="color: #6c757d;"></i> Belum ada pengeluaran`;
    }
}

// Function untuk update chart bulanan
function updateMonthlyChart(data) {
    const ctx = document.getElementById('monthly-bar-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.monthlyChart) {
        window.monthlyChart.destroy();
    }
    
    // Create new chart
    window.monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.daily_labels || [],
            datasets: [
                {
                    label: 'Pendapatan',
                    data: data.daily_income || [],
                    backgroundColor: 'rgba(90, 129, 250, 0.6)',
                    borderColor: 'rgba(90, 129, 250, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Pengeluaran',
                    data: data.daily_expense || [],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + value.toLocaleString('id-ID');
                        }
                    }
                }
            }
        }
    });
}

// Function untuk update chart tahunan
function updateYearlyChart(data) {
    const ctx = document.getElementById('yearly-bar-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.yearlyChart) {
        window.yearlyChart.destroy();
    }
    
    // Create new chart
    window.yearlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
            datasets: [
                {
                    label: 'Pendapatan',
                    data: data.monthly_income || Array(12).fill(0),
                    backgroundColor: 'rgba(90, 129, 250, 0.6)',
                    borderColor: 'rgba(90, 129, 250, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Pengeluaran',
                    data: data.monthly_expense || Array(12).fill(0),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + value.toLocaleString('id-ID');
                        }
                    }
                }
            }
        }
    });
}

// Function untuk update pie chart kategori pengeluaran
function updatePieChart(categoryData) {
    // Check if we have category data
    if (!categoryData || categoryData.length === 0) {
        document.getElementById('expense-distribution-chart').innerHTML = 
            "<p style='text-align: center; padding: 20px;'>Belum ada data pengeluaran</p>";
        return;
    }
    
    // First, check if there's an existing chart and destroy it
    if (window.pieChart) {
        window.pieChart.destroy();
    }
    
    // Clear the container and create a new canvas
    const container = document.getElementById('expense-distribution-chart');
    container.innerHTML = '<canvas id="pie-chart"></canvas>';
    
    // Get the new canvas and its context
    const pieCanvas = document.getElementById('pie-chart');
    const pieCtx = pieCanvas.getContext('2d');
    
    // Extract data for pie chart
    const pieLabels = categoryData.map(item => item.category);
    const pieValues = categoryData.map(item => item.amount);
    
    // Create new chart
    window.pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: pieLabels,
            datasets: [{
                data: pieValues,
                backgroundColor: [
                    'rgba(90, 129, 250, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Function untuk update tabel kategori
function updateCategoryTable(categoryData) {
    const tableBody = document.getElementById('category-table-body');
    if (!tableBody) return;
    
    // Format uang
    const formatCurrency = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });
    
    // Kosongkan tabel
    tableBody.innerHTML = '';
    
    // Icon dan warna untuk tiap kategori
    const categoryIcons = {
        'Kebutuhan Pokok': { icon: 'fa-home', color: 'var(--primary-color)' },
        'Keinginan': { icon: 'fa-coffee', color: '#ff6b6b' },
        'Tabungan/Investasi': { icon: 'fa-chart-line', color: '#20c997' },
        'Amal/Donasi': { icon: 'fa-hand-holding-heart', color: '#9775fa' }
    };
    
    // Isi tabel dengan data kategori
    if (categoryData && categoryData.length > 0) {
        categoryData.forEach(category => {
            const row = document.createElement('tr');
            const icon = categoryIcons[category.category] || { icon: 'fa-money-bill-wave', color: 'var(--primary-color)' };
            
            row.innerHTML = `
                <td>
                    <i class="fas ${icon.icon}" style="color: ${icon.color}; margin-right: 10px;"></i>
                    ${category.category}
                </td>
                <td>${formatCurrency.format(category.amount || 0)}</td>
                <td>${(category.percentage || 0).toFixed(1)}%</td>
            `;
            
            tableBody.appendChild(row);
        });
    } else {
        // Tampilkan pesan jika tidak ada data
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="3" style="text-align: center;">Belum ada data kategori pengeluaran</td>`;
        tableBody.appendChild(row);
    }
}

// Function untuk update ringkasan tahunan
function updateYearlySummary(data) {
    // Jika tidak ada data bulanan, tampilkan pesan
    if (!data.monthly_income || !data.monthly_expense || 
        data.monthly_income.every(val => val === 0) && 
        data.monthly_expense.every(val => val === 0)) {
        
        document.getElementById('top-income-months').innerHTML = `
            <div style="text-align: center; padding: 1rem;">Belum ada data pendapatan tahun ini</div>
        `;
        
        document.getElementById('top-expense-months').innerHTML = `
            <div style="text-align: center; padding: 1rem;">Belum ada data pengeluaran tahun ini</div>
        `;
        
        return;
    }
    
    // Format uang
    const formatCurrency = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });
    
    // Nama bulan
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    // Siapkan data untuk sorting
    const monthlyData = monthNames.map((name, index) => ({
        name: name,
        income: data.monthly_income[index] || 0,
        expense: data.monthly_expense[index] || 0
    }));
    
    // Sort data berdasarkan pendapatan (tertinggi ke terendah)
    const topIncomeMonths = [...monthlyData]
        .filter(m => m.income > 0)
        .sort((a, b) => b.income - a.income)
        .slice(0, 3);
    
    // Sort data berdasarkan pengeluaran (tertinggi ke terendah)
    const topExpenseMonths = [...monthlyData]
        .filter(m => m.expense > 0)
        .sort((a, b) => b.expense - a.expense)
        .slice(0, 3);
    
    // Update UI untuk bulan dengan pendapatan tertinggi
    const topIncomeEl = document.getElementById('top-income-months');
    if (topIncomeMonths.length > 0) {
        topIncomeEl.innerHTML = '';
        
        topIncomeMonths.forEach((month, index) => {
            const item = document.createElement('div');
            item.className = 'top-month-item';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.padding = '0.5rem 0';
            item.style.borderBottom = index < topIncomeMonths.length - 1 ? '1px solid #eee' : 'none';
            
            item.innerHTML = `
                <div>
                    <span class="rank">${index + 1}.</span> 
                    <span class="month">${month.name}</span>
                </div>
                <div class="amount" style="font-weight: 500; color: var(--primary-color);">
                    ${formatCurrency.format(month.income)}
                </div>
            `;
            
            topIncomeEl.appendChild(item);
        });
    } else {
        topIncomeEl.innerHTML = `
            <div style="text-align: center; padding: 1rem;">Belum ada data pendapatan tahun ini</div>
        `;
    }
    
    // Update UI untuk bulan dengan pengeluaran tertinggi
    const topExpenseEl = document.getElementById('top-expense-months');
    if (topExpenseMonths.length > 0) {
        topExpenseEl.innerHTML = '';
        
        topExpenseMonths.forEach((month, index) => {
            const item = document.createElement('div');
            item.className = 'top-month-item';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.padding = '0.5rem 0';
            item.style.borderBottom = index < topExpenseMonths.length - 1 ? '1px solid #eee' : 'none';
            
            item.innerHTML = `
                <div>
                    <span class="rank">${index + 1}.</span> 
                    <span class="month">${month.name}</span>
                </div>
                <div class="amount" style="font-weight: 500; color: #ff6b6b;">
                    ${formatCurrency.format(month.expense)}
                </div>
            `;
            
            topExpenseEl.appendChild(item);
        });
    } else {
        topExpenseEl.innerHTML = `
            <div style="text-align: center; padding: 1rem;">Belum ada data pengeluaran tahun ini</div>
        `;
    }
}

// Tambahkan inisialisasi fitur periode ke function initDashboardCharts
function extendDashboardInit() {
    // Init period selector setelah chart diinisialisasi
    initPeriodSelector();
    
    // Style untuk tombol periode aktif
    document.querySelector('.period-btn.active').style.backgroundColor = 'var(--background)';
    document.querySelector('.period-btn.active').style.boxShadow = '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)';
    
    // Event listener untuk tombol periode
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Reset style semua tombol
            document.querySelectorAll('.period-btn').forEach(b => {
                b.style.backgroundColor = 'transparent';
                b.style.boxShadow = 'none';
            });
            
            // Set style tombol aktif
            this.style.backgroundColor = 'var(--background)';
            this.style.boxShadow = '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)';
        });
    });
}

// Tambahkan inisialisasi period selector ke document.ready
document.addEventListener('DOMContentLoaded', function() {
    const originalInitFunction = window.initDashboardCharts;
    
    // Override inisialisasi dashboard
    window.initDashboardCharts = function() {
        // Panggil fungsi asli
        if (typeof originalInitFunction === 'function') {
            originalInitFunction();
        }
        
        // Tambahkan inisialisasi fitur periode
        extendDashboardInit();
    };
    
    // Jika halaman sudah dimuat dan initDashboardCharts sudah dipanggil
    if (document.getElementById('dashboard-page') && 
        !document.getElementById('dashboard-page').classList.contains('hidden')) {
        extendDashboardInit();
    }
});