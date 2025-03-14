-- Skema Database untuk Personal Financial Assistant (PFA) by CUPK

-- Database untuk pengguna
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Database untuk masing-masing pengguna (akan dibuat dengan format: username_pfa.db)

-- Tabel untuk pendapatan
CREATE TABLE income (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,  -- Format: YYYY-MM-DD
    category TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk pengeluaran
CREATE TABLE expense (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,  -- Format: YYYY-MM-DD
    category TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeks untuk meningkatkan performa query
CREATE INDEX idx_income_date ON income(date);
CREATE INDEX idx_expense_date ON expense(date);
CREATE INDEX idx_income_category ON income(category);
CREATE INDEX idx_expense_category ON expense(category);

-- Contoh kategori pendapatan
-- 1. Gaji
-- 2. Bonus
-- 3. Investasi
-- 4. Lain-lain

-- Contoh kategori pengeluaran (berdasarkan alokasi 40:30:20:10)
-- 1. Kebutuhan Pokok (40%)
-- 2. Keinginan (30%)
-- 3. Tabungan/Investasi (20%)
-- 4. Amal/Donasi (10%)

-- Contoh data dummy untuk income
INSERT INTO income (date, category, description, amount) VALUES
('2025-03-01', 'Gaji', 'Gaji Bulanan Maret', 5000000),
('2025-03-10', 'Bonus', 'Komisi Penjualan', 500000),
('2025-02-01', 'Gaji', 'Gaji Bulanan Februari', 5000000),
('2025-02-15', 'Investasi', 'Dividen Saham', 100000),
('2025-01-01', 'Gaji', 'Gaji Bulanan Januari', 4800000);

-- Contoh data dummy untuk expense
INSERT INTO expense (date, category, description, amount) VALUES
('2025-03-02', 'Kebutuhan Pokok', 'Belanja Bulanan', 1200000),
('2025-03-05', 'Keinginan', 'Makan di Restoran', 350000),
('2025-03-10', 'Tabungan/Investasi', 'Tabungan Bulanan', 1000000),
('2025-03-15', 'Amal/Donasi', 'Sumbangan', 200000),
('2025-03-20', 'Kebutuhan Pokok', 'Listrik & Internet', 500000),
('2025-03-22', 'Keinginan', 'Beli Baju', 400000),
('2025-03-25', 'Kebutuhan Pokok', 'Transportasi', 150000),
('2025-02-03', 'Kebutuhan Pokok', 'Belanja Bulanan', 1100000),
('2025-02-10', 'Tabungan/Investasi', 'Tabungan Bulanan', 1000000),
('2025-02-15', 'Keinginan', 'Nonton Bioskop', 200000),
('2025-02-20', 'Kebutuhan Pokok', 'Listrik & Internet', 480000),
('2025-02-25', 'Amal/Donasi', 'Sumbangan', 180000),
('2025-01-05', 'Kebutuhan Pokok', 'Belanja Bulanan', 1050000),
('2025-01-10', 'Tabungan/Investasi', 'Tabungan Bulanan', 950000),
('2025-01-15', 'Keinginan', 'Makan di Restoran', 300000),
('2025-01-20', 'Kebutuhan Pokok', 'Listrik & Internet', 470000),
('2025-01-25', 'Amal/Donasi', 'Sumbangan', 170000);