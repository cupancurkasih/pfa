import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import json
from datetime import datetime
import pandas as pd
import calendar



app = Flask(__name__)
app.secret_key = 'pfa_cupk_secret_key'  # Gunakan secret key yang aman untuk produksi

# Konfigurasi Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Direktori untuk menyimpan database
DB_DIR = 'databases'
if not os.path.exists(DB_DIR):
    os.makedirs(DB_DIR)

# Model User untuk Flask-Login
class User(UserMixin):
    def __init__(self, id, username, email, password_hash):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash

# Database untuk user
def init_user_db():
    conn = sqlite3.connect(os.path.join(DB_DIR, 'users.db'))
    c = conn.cursor()
    c.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    )
    ''')
    conn.commit()
    conn.close()

# Inisialisasi database untuk user
init_user_db()

# Helper untuk user database
def get_user_by_username(username):
    conn = sqlite3.connect(os.path.join(DB_DIR, 'users.db'))
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username = ?", (username,))
    user_data = c.fetchone()
    conn.close()
    if user_data:
        return User(id=user_data[0], username=user_data[1], email=user_data[2], password_hash=user_data[3])
    return None

def get_user_by_id(user_id):
    conn = sqlite3.connect(os.path.join(DB_DIR, 'users.db'))
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user_data = c.fetchone()
    conn.close()
    if user_data:
        return User(id=user_data[0], username=user_data[1], email=user_data[2], password_hash=user_data[3])
    return None

@login_manager.user_loader
def load_user(user_id):
    return get_user_by_id(user_id)

# Inisialisasi database PFA untuk user
def init_pfa_db(username):
    db_path = os.path.join(DB_DIR, f"{username}_pfa.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Tabel untuk pendapatan
    c.execute('''
    CREATE TABLE IF NOT EXISTS income (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL
    )
    ''')
    
    # Tabel untuk pengeluaran
    c.execute('''
    CREATE TABLE IF NOT EXISTS expense (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL
    )
    ''')
    
    conn.commit()
    conn.close()

# Helper functions untuk data pengguna
def get_income_data(username):
    db_path = os.path.join(DB_DIR, f"{username}_pfa.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM income ORDER BY date DESC")
    rows = c.fetchall()
    conn.close()
    
    income_data = []
    for row in rows:
        income_data.append({
            'id': row['id'],
            'date': row['date'],
            'category': row['category'],
            'description': row['description'],
            'amount': row['amount']
        })
    
    return income_data

def get_expense_data(username):
    db_path = os.path.join(DB_DIR, f"{username}_pfa.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM expense ORDER BY date DESC")
    rows = c.fetchall()
    conn.close()
    
    expense_data = []
    for row in rows:
        expense_data.append({
            'id': row['id'],
            'date': row['date'],
            'category': row['category'],
            'description': row['description'],
            'amount': row['amount']
        })
    
    return expense_data

# Routes
@app.route('/')
@login_required
def index():
    username = current_user.username
    
    try:
        # Ambil data pendapatan dan pengeluaran
        income_data = get_income_data(username)
        expense_data = get_expense_data(username)
        
        # Inisialisasi nilai default
        total_income = 0
        total_expense = 0
        balance = 0
        balance_percentage = 0
        category_data = []
        months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
        monthly_income = [0] * 12
        monthly_expense = [0] * 12
        
        # Menghitung statistik untuk dashboard jika ada data
        if income_data and expense_data:
            current_month = datetime.now().strftime('%Y-%m')
            
            # Filter data untuk bulan saat ini
            current_month_income = [inc for inc in income_data if inc['date'].startswith(current_month)]
            current_month_expense = [exp for exp in expense_data if exp['date'].startswith(current_month)]
            
            # Hitung total pendapatan dan pengeluaran bulan ini
            total_income = sum(inc['amount'] for inc in current_month_income)
            total_expense = sum(exp['amount'] for exp in current_month_expense)
            balance = total_income - total_expense
            
            # Hitung persentase saldo dari pendapatan
            balance_percentage = (balance / total_income * 100) if total_income > 0 else 0
            
            # Hitung persentase pengeluaran berdasarkan kategori
            expense_by_category = {}
            for exp in current_month_expense:
                category = exp['category']
                if category not in expense_by_category:
                    expense_by_category[category] = 0
                expense_by_category[category] += exp['amount']
            
            # Persiapkan data kategori untuk tampilan
            for category, amount in expense_by_category.items():
                percentage = (amount / total_expense * 100) if total_expense > 0 else 0
                category_data.append({
                    'category': category,
                    'amount': amount,
                    'percentage': round(percentage, 2)
                })
            
            # Data untuk chart bulanan
            current_year = datetime.now().year
            
            # Hitung pendapatan dan pengeluaran per bulan
            for inc in income_data:
                if inc['date'].startswith(str(current_year)):
                    try:
                        month_idx = int(inc['date'].split('-')[1]) - 1
                        if 0 <= month_idx < 12:  # Pastikan indeks dalam rentang valid
                            monthly_income[month_idx] += inc['amount']
                    except (IndexError, ValueError):
                        continue  # Lewati jika format tanggal tidak valid
            
            for exp in expense_data:
                if exp['date'].startswith(str(current_year)):
                    try:
                        month_idx = int(exp['date'].split('-')[1]) - 1
                        if 0 <= month_idx < 12:  # Pastikan indeks dalam rentang valid
                            monthly_expense[month_idx] += exp['amount']
                    except (IndexError, ValueError):
                        continue  # Lewati jika format tanggal tidak valid
        
        # Siapkan data chart dalam format JSON untuk menghindari masalah template
        chart_data = {
            'labels': months,
            'income': monthly_income,
            'expense': monthly_expense
        }
        
        # Konversi ke JSON string untuk digunakan di JavaScript
        chart_data_json = json.dumps(chart_data)
        category_data_json = json.dumps(category_data)

        return render_template('index.html', 
                            total_income=total_income,
                            total_expense=total_expense,
                            balance=balance,
                            balance_percentage=balance_percentage,
                            category_data=category_data,
                            months=months,
                            monthly_income=monthly_income,
                            monthly_expense=monthly_expense,
                            chart_data_json=chart_data_json,
                            category_data_json=category_data_json,
                            income_data=income_data,
                            expense_data=expense_data)
                            
    except Exception as e:
        # Log error untuk debugging
        print(f"Error in index route: {str(e)}")
        # Tampilkan pesan error kepada pengguna
        flash(f"Terjadi kesalahan saat memuat dashboard: {str(e)}", 'error')
        # Inisialisasi nilai default jika terjadi error
        return render_template('index.html', 
                            total_income=0,
                            total_expense=0,
                            balance=0,
                            balance_percentage=0,
                            category_data=[],
                            chart_data_json=json.dumps({
                                'labels': ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                                         'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
                                'income': [0] * 12,
                                'expense': [0] * 12
                            }),
                            category_data_json=json.dumps([]),
                            income_data=[],
                            expense_data=[])

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    error = None
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = get_user_by_username(username)
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('index'))
        else:
            error = 'Login gagal. Periksa username dan password Anda.'
    
    return render_template('login.html', error=error)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    error = None
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if password != confirm_password:
            error = 'Password dan konfirmasi password tidak cocok.'
        elif get_user_by_username(username):
            error = 'Username sudah digunakan.'
        else:
            # Buat user baru
            conn = sqlite3.connect(os.path.join(DB_DIR, 'users.db'))
            c = conn.cursor()
            c.execute("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                     (username, email, generate_password_hash(password)))
            conn.commit()
            conn.close()
            
            # Buat database PFA untuk user baru
            init_pfa_db(username)
            
            flash('Registrasi berhasil. Silakan login.', 'success')
            return redirect(url_for('login'))
    
    return render_template('register.html', error=error)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# API Endpoints
@app.route('/api/add_income', methods=['POST'])
@login_required
def api_add_income():
    username = current_user.username
    data = request.json
    
    try:
        date = data.get('date')
        category = data.get('category')
        description = data.get('description')
        amount = float(data.get('amount'))
        
        # Simpan data pendapatan
        db_path = os.path.join(DB_DIR, f"{username}_pfa.db")
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("INSERT INTO income (date, category, description, amount) VALUES (?, ?, ?, ?)",
                 (date, category, description, amount))
        conn.commit()
        income_id = c.lastrowid
        conn.close()
        
        return jsonify({'success': True, 'id': income_id})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/add_expense', methods=['POST'])
@login_required
def api_add_expense():
    username = current_user.username
    data = request.json
    
    try:
        date = data.get('date')
        category = data.get('category')
        description = data.get('description')
        amount = float(data.get('amount'))
        
        # Simpan data pengeluaran
        db_path = os.path.join(DB_DIR, f"{username}_pfa.db")
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("INSERT INTO expense (date, category, description, amount) VALUES (?, ?, ?, ?)",
                 (date, category, description, amount))
        conn.commit()
        expense_id = c.lastrowid
        conn.close()
        
        return jsonify({'success': True, 'id': expense_id})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/income/<int:income_id>', methods=['GET'])
@login_required
def api_get_income(income_id):
    username = current_user.username
    db_path = os.path.join(DB_DIR, f"{username}_pfa.db")
    
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM income WHERE id = ?", (income_id,))
        row = c.fetchone()
        conn.close()
        
        if row:
            income = {
                'id': row['id'],
                'date': row['date'],
                'category': row['category'],
                'description': row['description'],
                'amount': row['amount']
            }
            
            return jsonify({'success': True, 'income': income})
        else:
            return jsonify({'success': False, 'error': 'Data pendapatan tidak ditemukan.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/expense/<int:expense_id>', methods=['GET'])
@login_required
def api_get_expense(expense_id):
    username = current_user.username
    db_path = os.path.join(DB_DIR, f"{username}_pfa.db")
    
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM expense WHERE id = ?", (expense_id,))
        row = c.fetchone()
        conn.close()
        
        if row:
            expense = {
                'id': row['id'],
                'date': row['date'],
                'category': row['category'],
                'description': row['description'],
                'amount': row['amount']
            }
            
            return jsonify({'success': True, 'expense': expense})
        else:
            return jsonify({'success': False, 'error': 'Data pengeluaran tidak ditemukan.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/update_income/<int:income_id>', methods=['POST'])
@login_required
def api_update_income(income_id):
    username = current_user.username
    data = request.json
    
    try:
        date = data.get('date')
        category = data.get('category')
        description = data.get('description')
        amount = float(data.get('amount'))
        
        db_path = os.path.join(DB_DIR, f"{username}_pfa.db")
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("UPDATE income SET date = ?, category = ?, description = ?, amount = ? WHERE id = ?",
                 (date, category, description, amount, income_id))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/update_expense/<int:expense_id>', methods=['POST'])
@login_required
def api_update_expense(expense_id):
    username = current_user.username
    data = request.json
    
    try:
        date = data.get('date')
        category = data.get('category')
        description = data.get('description')
        amount = float(data.get('amount'))
        
        db_path = os.path.join(DB_DIR, f"{username}_pfa.db")
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("UPDATE expense SET date = ?, category = ?, description = ?, amount = ? WHERE id = ?",
                 (date, category, description, amount, expense_id))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/delete_income/<int:income_id>', methods=['POST'])
@login_required
def api_delete_income(income_id):
    username = current_user.username
    
    try:
        db_path = os.path.join(DB_DIR, f"{username}_pfa.db")
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("DELETE FROM income WHERE id = ?", (income_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/delete_expense/<int:expense_id>', methods=['POST'])
@login_required
def api_delete_expense(expense_id):
    username = current_user.username
    
    try:
        db_path = os.path.join(DB_DIR, f"{username}_pfa.db")
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("DELETE FROM expense WHERE id = ?", (expense_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
    
# Tambahkan endpoint untuk dashboard summary
@app.route('/api/dashboard-summary', methods=['GET'])
@login_required
def api_dashboard_summary():
    username = current_user.username
    
    # Get period type and date range from request
    period = request.args.get('period', 'monthly')  # 'monthly' or 'yearly'
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Check if date parameters are provided
    if not start_date or not end_date:
        return jsonify({'success': False, 'error': 'Parameter tanggal tidak lengkap.'})
    
    try:
        # Get income and expense data
        income_data = get_income_data(username)
        expense_data = get_expense_data(username)
        
        # Filter data by date range
        filtered_income = [inc for inc in income_data if start_date <= inc['date'] <= end_date]
        filtered_expense = [exp for exp in expense_data if start_date <= exp['date'] <= end_date]
        
        # Calculate total income and expense
        total_income = sum(inc['amount'] for inc in filtered_income)
        total_expense = sum(exp['amount'] for exp in filtered_expense)
        balance = total_income - total_expense
        
        # Calculate expense by category
        expense_by_category = {}
        for exp in filtered_expense:
            category = exp['category']
            if category not in expense_by_category:
                expense_by_category[category] = 0
            expense_by_category[category] += exp['amount']
        
        # Prepare category data
        category_data = []
        for category, amount in expense_by_category.items():
            percentage = (amount / total_expense * 100) if total_expense > 0 else 0
            category_data.append({
                'category': category,
                'amount': amount,
                'percentage': round(percentage, 2)
            })
        
        # Calculate previous period data for trend comparison
        income_trend = 0
        expense_trend = 0
        
        # Parse date strings to datetime objects
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        # For monthly data
        if period == 'monthly':
            # Calculate previous month's date range
            if start_dt.month == 1:
                prev_month = 12
                prev_year = start_dt.year - 1
            else:
                prev_month = start_dt.month - 1
                prev_year = start_dt.year
                
            prev_month_str = str(prev_month).zfill(2)
            prev_year_str = str(prev_year)
            
            # Get days in previous month
            prev_month_last_day = calendar.monthrange(prev_year, prev_month)[1]
            
            prev_start_date = f"{prev_year_str}-{prev_month_str}-01"
            prev_end_date = f"{prev_year_str}-{prev_month_str}-{prev_month_last_day}"
            
            # Calculate previous month's totals
            prev_income = sum(inc['amount'] for inc in income_data if prev_start_date <= inc['date'] <= prev_end_date)
            prev_expense = sum(exp['amount'] for exp in expense_data if prev_start_date <= exp['date'] <= prev_end_date)
            
            # Calculate trends
            if prev_income > 0:
                income_trend = ((total_income - prev_income) / prev_income * 100)
            if prev_expense > 0:
                expense_trend = ((total_expense - prev_expense) / prev_expense * 100)
            
            # Prepare daily data for chart
            daily_labels = []
            daily_income = []
            daily_expense = []
            
            # Get number of days in current month
            days_in_month = (end_dt - start_dt).days + 1
            
            # Initialize data for each day
            for day in range(1, days_in_month + 1):
                # Format date label
                day_str = str(day).zfill(2)
                day_date = f"{start_dt.year}-{start_dt.month:02d}-{day_str}"
                day_label = f"{day}"
                
                # Add to labels
                daily_labels.append(day_label)
                
                # Calculate daily income and expense
                day_income = sum(inc['amount'] for inc in filtered_income if inc['date'].endswith(f"-{day_str}"))
                day_expense = sum(exp['amount'] for exp in filtered_expense if exp['date'].endswith(f"-{day_str}"))
                
                daily_income.append(day_income)
                daily_expense.append(day_expense)
            
            # Prepare response data
            response_data = {
                'success': True,
                'total_income': total_income,
                'total_expense': total_expense,
                'balance': balance,
                'income_trend': round(income_trend, 1),
                'expense_trend': round(expense_trend, 1),
                'category_data': category_data,
                'daily_labels': daily_labels,
                'daily_income': daily_income,
                'daily_expense': daily_expense
            }
            
        # For yearly data
        else:
            # Calculate previous year
            prev_year = start_dt.year - 1
            prev_start_date = f"{prev_year}-01-01"
            prev_end_date = f"{prev_year}-12-31"
            
            # Calculate previous year's totals
            prev_income = sum(inc['amount'] for inc in income_data if prev_start_date <= inc['date'] <= prev_end_date)
            prev_expense = sum(exp['amount'] for exp in expense_data if prev_start_date <= exp['date'] <= prev_end_date)
            
            # Calculate trends
            if prev_income > 0:
                income_trend = ((total_income - prev_income) / prev_income * 100)
            if prev_expense > 0:
                expense_trend = ((total_expense - prev_expense) / prev_expense * 100)
            
            # Prepare monthly data for chart
            monthly_income = [0] * 12
            monthly_expense = [0] * 12
            
            # Calculate monthly totals
            for inc in filtered_income:
                month_idx = int(inc['date'].split('-')[1]) - 1
                monthly_income[month_idx] += inc['amount']
            
            for exp in filtered_expense:
                month_idx = int(exp['date'].split('-')[1]) - 1
                monthly_expense[month_idx] += exp['amount']
            
            # Prepare response data
            response_data = {
                'success': True,
                'total_income': total_income,
                'total_expense': total_expense,
                'balance': balance,
                'income_trend': round(income_trend, 1),
                'expense_trend': round(expense_trend, 1),
                'category_data': category_data,
                'monthly_income': monthly_income,
                'monthly_expense': monthly_expense
            }
        
        return jsonify(response_data)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)})
    
# Tambahkan endpoint API berikut ke app.py

@app.route('/api/reports', methods=['GET'])
@login_required
def api_reports():
    username = current_user.username
    income_data = get_income_data(username)
    expense_data = get_expense_data(username)
    
    # Filter berdasarkan rentang tanggal jika ada
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date and end_date:
        income_data = [inc for inc in income_data if start_date <= inc['date'] <= end_date]
        expense_data = [exp for exp in expense_data if start_date <= exp['date'] <= end_date]
    
    # Hitung total pendapatan dan pengeluaran
    total_income = sum(inc['amount'] for inc in income_data)
    total_expense = sum(exp['amount'] for exp in expense_data)
    
    # Hitung pengeluaran berdasarkan kategori
    expense_by_category = {}
    for exp in expense_data:
        category = exp['category']
        if category not in expense_by_category:
            expense_by_category[category] = 0
        expense_by_category[category] += exp['amount']
    
    # Persiapkan data rasio 40:30:20:10
    ideal_ratio = {
        'Kebutuhan Pokok': 0.4,
        'Keinginan': 0.3,
        'Tabungan/Investasi': 0.2,
        'Amal/Donasi': 0.1
    }
    
    # Hitung realisasi rasio berdasarkan kategori
    actual_ratio = {}
    for category, ideal in ideal_ratio.items():
        actual_amount = expense_by_category.get(category, 0)
        ideal_amount = total_income * ideal if total_income > 0 else 0
        actual_ratio[category] = {
            'actual_amount': actual_amount,
            'ideal_amount': ideal_amount,
            'percentage': (actual_amount / total_expense * 100) if total_expense > 0 else 0
        }
    
    # Data untuk chart tren
    months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    
    # Ambil data 12 bulan terakhir atau filter sesuai parameter
    monthly_income = [0] * 12
    monthly_expense = [0] * 12
    
    # Organize data by month
    for inc in income_data:
        try:
            month_idx = int(inc['date'].split('-')[1]) - 1
            if 0 <= month_idx < 12:
                monthly_income[month_idx] += inc['amount']
        except (IndexError, ValueError):
            continue
    
    for exp in expense_data:
        try:
            month_idx = int(exp['date'].split('-')[1]) - 1
            if 0 <= month_idx < 12:
                monthly_expense[month_idx] += exp['amount']
        except (IndexError, ValueError):
            continue
    
    report_data = {
        'total_income': total_income,
        'total_expense': total_expense,
        'expense_by_category': expense_by_category,
        'actual_ratio': actual_ratio,
        'chart_data': {
            'labels': months,
            'income': monthly_income,
            'expense': monthly_expense
        }
    }
    
    return jsonify(report_data)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5123, debug=True)