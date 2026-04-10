遊戲化全端購物網站 (Gamified E-Commerce)

本專案為一個使用 Vue 3 + Express + Neon (PostgreSQL) 開發的現代化全端購物網站。除了具備完整的電商購物流程外，更導入了「每日簽到」與「刮刮樂」等遊戲化互動機制。

使用技術

前端 (Frontend) - 部署於 Vercel**
* **核心框架:** Vue 3 (Composition API), Vite
* **路由管理:** Vue Router
* **樣式設計:** 原生 CSS (Flexbox / Grid 排版)

**後端 (Backend) - 部署於 Render**
* **核心框架:** Node.js, Express.js
* **資料庫:** PostgreSQL (採用 Neon Serverless Database)

**身分驗證與資安**
* **身分授權:** JWT (JSON Web Token) 機制
* **密碼加密:** bcrypt 密碼雜湊處理

---

專案結構

```text
shopping-site
│
├─ frontend/          # Vue 前端應用程式 (User Interface)
├─ backend/           # Express 後端 API 伺服器 (Business Logic)
└─ README.md
```

---

## 安裝與執行方式

### 1. 下載專案
```bash
git clone [https://github.com/yourusername/shopping-site.git](https://github.com/yourusername/shopping-site.git)
cd shopping-site
```

### 2. 啟動 Backend
**進入 backend 資料夾並安裝套件**
```bash
cd backend
npm install
```

**配置環境變數**
在 `backend` 根目錄建立 `.env` 檔案，並填寫以下資訊：
```env
JWT_SECRET=your_super_secret_key
DATABASE_URL=postgres://[user]:[password]@[neon_hostname]/[dbname]?sslmode=require
PORT=3000
```

**啟動後端開發伺服器**
```bash
npm run dev
# 後端會運行在 http://localhost:3000
```

### 3. 啟動 Frontend (前端)
**開啟全新的終端機視窗，進入 frontend 資料夾並安裝套件**
```bash
cd frontend
npm install
```

**啟動前端開發伺服器**
```bash
npm run dev
# 前端會運行在 http://localhost:5173
```

---

資料庫設計

本專案採用關聯式資料庫設計，以下為核心資料表結構概覽：

### `users` (使用者資訊)
| 欄位 | 型別 | 說明 |
| :--- | :--- | :--- |
| id | SERIAL | 主鍵 (Primary Key) |
| email | VARCHAR(255) | 登入帳號 (Unique) |
| password | VARCHAR(255) | 雜湊密碼 |
| points | INT | 遊戲化積分 / 購物紅利 |
| created_at | TIMESTAMP | 帳號建立時間 |

### `products` (商品資訊)
| 欄位 | 型別 | 說明 |
| :--- | :--- | :--- |
| id | SERIAL | 主鍵 |
| name | VARCHAR(255) | 商品名稱 |
| description | TEXT | 商品詳細描述 |
| price | DECIMAL(10,2) | 商品價格 |
| image_url | TEXT | 圖片連結 |
| stock | INT | 庫存數量 |

### `carts` & `cart_items` 購物車系統
* **carts:** `id` (SERIAL), `user_id` (INT, FK 關聯 users)
* **cart_items:** `id` (SERIAL), `cart_id` (INT, FK), `product_id` (INT, FK), `quantity` (INT)

### `orders` & `order_items` 訂單系統
* **orders:** `id` (SERIAL), `user_id` (INT, FK), `total` (DECIMAL), `created_at` (TIMESTAMP)
* **order_items:** `id` (SERIAL), `order_id` (INT, FK), `product_id` (INT, FK), `quantity` (INT), `price` (DECIMAL 結帳單價)

### `gamification_logs` 遊戲
| 欄位 | 型別 | 說明 |
| :--- | :--- | :--- |
| id | SERIAL | 主鍵 |
| user_id | INT | 關聯 users.id |
| action_type | VARCHAR(50) | 動作類型 (如：check_in, scratch_card) |
| reward | INT | 獲得的積分或獎勵額度 |

---

使用者驗證

本專案使用 JWT 進行無狀態的身分驗證與權限控管：
1. 使用者登入成功後
2. 後端會核發並回傳專屬 JWT Token
3. 前端將 Token 妥善儲存於 `localStorage`
4. 針對需要授權的 API 請求，前端會在 Request Header 中附帶：
   `Authorization: Bearer <token>`

---

系統核心功能

管理者後台 (Admin)
* **測試帳號:** `shop6@gmail.com` / **密碼:** `shop6`
* 具備完整商品管理權限：新增、刪除分類，以及動態修改商品資訊與庫存狀態。

小遊戲功能
* **每日簽到:** 建立連續登入獎勵機制，使用者每日簽到可領取購物積分，培養回訪習慣。
* **互動刮刮樂:** 將傳統的發放折扣碼轉化為「刮刮樂」小遊戲，增加購物過程的隨機盲盒樂趣與期待感。

電商購物流程
* **商品導覽:** 響應式商品列表與詳細圖文介紹。
* **智慧購物車:** 支援加入商品、動態修改數量（自訂 CSS 隱藏原生箭頭優化 UI）、刪除品項與即時總價計算。
* **訂單處理:** 完善的結帳流程，建立正式訂單並同步扣除商品庫存。
* **會員中心:** 提供使用者註冊、登入、密碼修改及查看歷史訂單詳細資訊。
