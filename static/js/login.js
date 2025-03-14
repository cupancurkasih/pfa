// Script untuk validasi formulir login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    
    loginForm.addEventListener('submit', function(e) {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Validasi dasar sisi klien
        if (username === '') {
            e.preventDefault();
            alert('Silakan masukkan username Anda');
            return;
        }
        
        if (password === '') {
            e.preventDefault();
            alert('Silakan masukkan password Anda');
            return;
        }
    });
});