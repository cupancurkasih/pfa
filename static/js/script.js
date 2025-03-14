// DOM Elements
const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const app = document.getElementById('app');
const registerLink = document.getElementById('register-link');
const loginLink = document.getElementById('login-link');
const logoutBtn = document.getElementById('logout-btn');
const usernameDisplay = document.getElementById('username-display');
const navItems = document.querySelectorAll('.nav-item');
const pages = {
    dashboard: document.getElementById('dashboard-page'),
    income: document.getElementById('income-page'),
    expense: document.getElementById('expense-page'),
    reports: document.getElementById('reports-page')
};
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const incomeForm = document.getElementById('income-form');
const expenseForm = document.getElementById('expense-form');

// Authentication
registerLink.addEventListener('click', function(e) {
    e.preventDefault();
    loginPage.classList.add('hidden');
    registerPage.classList.remove('hidden');
});

loginLink.addEventListener('click', function(e) {
    e.preventDefault();
    registerPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
});

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    // Mock login logic (replace with actual backend call)
    if (username && password) {
        // Store user info in session
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('isLoggedIn', 'true');
        
        // Update UI
        usernameDisplay.textContent = username;
        loginPage.classList.add('hidden');
        app.classList.remove('hidden');
        
        // Load user data
        loadUserData();
    }
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    // Mock registration logic (replace with actual backend call)
    if (username && email && password && password === confirmPassword) {
        alert('Registrasi berhasil! Silakan login dengan akun Anda.');
        registerPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    } else if (password !== confirmPassword) {
        alert('Password dan konfirmasi password tidak cocok!');
    }
});

logoutBtn.addEventListener('click', function() {
    // Clear session
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('isLoggedIn');
    
    // Reset UI
    app.classList.add('hidden');
    loginPage.classList.remove('hidden');
    loginForm.reset();
});

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', function() {
        const pageName = this.getAttribute('data-page');
        
        // Update active state
        navItems.forEach(navItem => navItem.classList.remove('active'));
        this.classList.add('active');
        
        // Show selected page
        Object.keys(pages).forEach(key => {
            if (key === pageName) {
                pages[key].classList.remove('hidden');
            } else {
                pages[key].classList.add('hidden');
            }
        });
    });
});

// Form submissions
incomeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const category = document.getElementById('income-category').value;
    const description = document.getElementById('income-desc').value;
    const amount = document.getElementById('income-amount').value;
    const date = document.getElementById('income-date').value;
    
    // Add to income records (replace with actual data storage)
    addIncomeRecord({
        date: formatDate(date),
        category,
        description,
        amount: formatCurrency(amount)
    });
    
    // Reset form
    this.reset();
});

expenseForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const category = document.getElementById('expense-category').value;
    const description = document.getElementById('expense-desc').value;
    const amount = document.getElementById('expense-amount').value;
    const date = document.getElementById('expense-date').value;
    
    // Add to expense records (replace with actual data storage)
    addExpenseRecord({
        date: formatDate(date),
        category,
        description,
        amount: formatCurrency(amount)
    });
    
    // Reset form
    this.reset();
});

// Functions to handle data display
function addIncomeRecord(record) {
    const tableBody = document.getElementById('income-table-body');
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${record.date}</td>
        <td>${record.category}</td>
        <td>${record.description}</td>
        <td>${record.amount}</td>
        <td>
            <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
        </td>
    `;
    
    // Add event listeners for edit and delete
    row.querySelector('.edit-btn').addEventListener('click', function() {
        // Edit functionality would go here
        alert('Edit fitur akan segera hadir!');
    });
    
    row.querySelector('.delete-btn').addEventListener('click', function() {
        if (confirm('Anda yakin ingin menghapus data ini?')) {
            row.remove();
        }
    });
    
    tableBody.appendChild(row);
}

function addExpenseRecord(record) {
    const tableBody = document.getElementById('expense-table-body');
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${record.date}</td>
        <td>${record.category}</td>
        <td>${record.description}</td>
        <td>${record.amount}</td>
        <td>
            <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
        </td>
    `;
    
    // Add event listeners for edit and delete
    row.querySelector('.edit-btn').addEventListener('click', function() {
        // Edit functionality would go here
        alert('Edit fitur akan segera hadir!');
    });
    
    row.querySelector('.delete-btn').addEventListener('click', function() {
        if (confirm('Anda yakin ingin menghapus data ini?')) {
            row.remove();
        }
    });
    
    tableBody.appendChild(row);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

function formatCurrency(amount) {
    return `Rp ${Number(amount).toLocaleString('id-ID')}`;
}

function loadUserData() {
    // This would fetch user data from the backend
    // Mock implementation with Chart.js for demo
    initCharts();
}

// Initialize charts
function initCharts() {
    // Bar chart - Income vs Expense
    const barChart = new Chart(document.getElementById('bar-chart'), {
        type: 'bar',
        data: {
            labels: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'],
            datasets: [
                {
                    label: 'Pendapatan',
                    data: [4800000, 5100000, 5500000, 0, 0, 0],
                    backgroundColor: 'rgba(90, 129, 250, 0.6)',
                    borderColor: 'rgba(90, 129, 250, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Pengeluaran',
                    data: [4000000, 3600000, 3800000, 0, 0, 0],
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
    
    // Pie chart - Expense Distribution
    const pieChart = new Chart(document.getElementById('pie-chart'), {
        type: 'pie',
        data: {
            labels: ['Kebutuhan Pokok (40%)', 'Keinginan (30%)', 'Tabungan/Investasi (20%)', 'Amal/Donasi (10%)'],
            datasets: [{
                data: [40, 30, 20, 10],
                backgroundColor: [
                    'rgba(90, 129, 250, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
    
    // Line chart - Expense Trend
    const lineChart = new Chart(document.getElementById('line-chart'), {
        type: 'line',
        data: {
            labels: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
            datasets: [{
                label: 'Pengeluaran 2025',
                data: [4000000, 3600000, 3800000, null, null, null, null, null, null, null, null, null],
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1
            },
            {
                label: 'Pendapatan 2025',
                data: [4800000, 5100000, 5500000, null, null, null, null, null, null, null, null, null],
                fill: false,
                borderColor: 'rgba(90, 129, 250, 1)',
                tension: 0.1
            }]
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

// Check if user is already logged in
window.addEventListener('load', function() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const username = sessionStorage.getItem('username');
    
    if (isLoggedIn && username) {
        usernameDisplay.textContent = username;
        loginPage.classList.add('hidden');
        app.classList.remove('hidden');
        loadUserData();
    }
});

// Export functionality
document.getElementById('export-xls').addEventListener('click', function() {
    alert('File XLS berhasil diekspor!');
});

document.getElementById('export-pdf').addEventListener('click', function() {
    alert('File PDF berhasil diekspor!');
});

// Report generation
document.getElementById('generate-report').addEventListener('click', function() {
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    
    if (startDate && endDate) {
        alert(`Laporan dari ${formatDate(startDate)} hingga ${formatDate(endDate)} telah dibuat!`);
    } else {
        alert('Silakan isi tanggal mulai dan tanggal akhir!');
    }
});