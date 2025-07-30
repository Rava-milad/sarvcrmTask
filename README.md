# 🛒 SarvCRM Task – Shopping List System

این پروژه به‌عنوان یک تسک فنی برای شرکت **SarvCRM** توسعه داده شده است و شامل سه پیاده‌سازی مختلف از یک سیستم مدیریت لیست خرید می‌باشد.

This repository is a technical task for **SarvCRM**, implementing a simple shopping list system in three different approaches.

---

## 🗂️ Structure

root/
│
├── sarvcrm/ → Backend (Pure PHP)
├── frontend/ → Frontend (React.js)
└── htmlpure/ → Frontend (HTML + CSS + JS)


---

## 🛠 Technologies Used

| Version      | Tech Stack               |
|--------------|--------------------------|
| Backend      | PHP 8.0 (No framework)   |
| Frontend     | React.js pure            |
| htmlpure     | HTML + CSS + Vanilla JS  |
| DB           | MySQL                    |
| Dev Env      | Devilbox (Linux)         |

---

## ⚙️ Setup Instructions

### 1️⃣ Database Setup (MySQL)

در محیط توسعه خود، این کوئری SQL را اجرا کنید:

```sql
CREATE DATABASE IF NOT EXISTS shopping_list_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shopping_list_db;

CREATE TABLE shopping_lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    INDEX idx_is_completed (is_completed),
    INDEX idx_item_name (item_name)
);

INSERT INTO shopping_lists (item_name, is_completed) VALUES
('نان بربری', FALSE), ('شیر کم چرب', FALSE), ('تخم‌مرغ محلی', TRUE),
('برنج هاشمی', FALSE), ('گوشت گوساله', FALSE), ('سیب قرمز', FALSE),
('پنیر سفید', TRUE), ('ماست کم چرب', FALSE), ('نان تست', FALSE), ('آب معدنی', FALSE);

CREATE VIEW shopping_stats AS
SELECT 
    COUNT(*) as total_items,
    COUNT(CASE WHEN is_completed = 1 THEN 1 END) as completed_items,
    COUNT(CASE WHEN is_completed = 0 THEN 1 END) as pending_items,
    ROUND((COUNT(CASE WHEN is_completed = 1 THEN 1 END) / COUNT(*)) * 100, 1) as completion_percentage
FROM shopping_lists;


2️⃣ Backend (PHP)
cd sarvcrm
# در Devilbox یا هر وب‌سرور دیگر، آن را در روت قرار دهید. و در یک آدرس این پوشه را لانچ کنید 
Ensure your PHP server (e.g. Devilbox or XAMPP) is routing requests to /sarvcrm/public/index.php.


3️⃣ Frontend (React)

cd frontend
npm install
npm start or npm run build
🛠 Important:
Before running, edit the following file and change the API base URL from development (http://sarvcrm.loc/api) to your own:

File: frontend/src/api/ShoppingListAPI.js
Line: 3
Change: const API_BASE = "http://sarvcrm.loc/api"; //Change it to your backend url

To:    const API_BASE = "http://your-backend-address/api";


4️⃣ Frontend (HTML + CSS + JS)

# به سادگی فایل index.html را در مرورگر باز کنید یا روی localhost میزبانی کنید.
🛠 Important:
Edit the following file to point to your backend API:

File: htmlpure/assets/js/script.js
Line: 3
Change: const API_BASE = "http://sarvcrm.loc/api";
To:    const API_BASE = "http://your-backend-address/api";

🧪 Test Queries
-- View all items
SELECT * FROM shopping_lists ORDER BY created_at DESC;

-- View statistics
SELECT * FROM shopping_stats;

-- Table schema
DESCRIBE shopping_lists;
📤 Deployment Notes
This project was developed and tested using Devilbox (a Docker-based development environment on Linux).
devilbox url = "https://devilbox.org"

Replace the development domain sarvcrm.loc with your real backend domain or IP.

🧑‍💻 Developer Info
Milad Rahimi
Email: milad.rahimi2266@gmail.com
GitHub: @rava-milad

📝 License
This project is for technical evaluation only and not intended for commercial use.
