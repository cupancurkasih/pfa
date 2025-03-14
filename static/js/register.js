// Script untuk validasi formulir registrasi
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('form');
    
    registerForm.addEventListener('submit', function(e) {
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        
        // Validasi dasar sisi klien
        if (username === '') {
            e.preventDefault();
            alert('Silakan masukkan username');
            return;
        }
        
        if (email === '') {
            e.preventDefault();
            alert('Silakan masukkan email');
            return;
        }
        
        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            e.preventDefault();
            alert('Silakan masukkan email yang valid');
            return;
        }
        
        if (password === '') {
            e.preventDefault();
            alert('Silakan masukkan password');
            return;
        }
        
        if (password !== confirmPassword) {
            e.preventDefault();
            alert('Password dan konfirmasi password tidak cocok');
            return;
        }
    });
});