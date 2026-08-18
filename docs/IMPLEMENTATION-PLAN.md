# CMND Analytics — Implementation Plan

**Project:** Mandatory LOG+ & VR Learning 2026 Analytics Dashboard  
**Client:** CIMB Niaga (Permata Bank)  
**Stack:** React (Vite) + Node.js (Express) + PostgreSQL + Docker  
**Repo:** https://github.com/agungNCC/cmnd-analytics  
**Target:** Production-ready dalam 4 minggu  

---

## 📊 STATUS AWAL

| Item | Status |
|------|--------|
| Repo GitHub | ✅ Sudah ada |
| Dokumentasi (docs/) | ✅ Lengkap (11 file) |
| Konfigurasi (docker-compose, nginx) | ✅ Sudah ada |
| Backend folder & source code | ❌ Belum dibuat |
| Frontend folder & source code | ❌ Belum dibuat |
| Database migrations | ❌ Belum dibuat |
| `.env.example` | ❌ Belum ada |
| `scripts/` | ❌ Belum dibuat |

---

## 🗓️ RINGKASAN TIMELINE

```
Minggu 1  ─── Fondasi: folder structure, infra, DB schema, auth
Minggu 2  ─── Backend: API, file upload, ETL pipeline, Excel export
Minggu 3  ─── Frontend: semua halaman, integrasi API, responsive
Minggu 4  ─── Testing, polish, deployment ke production
```

---

## MINGGU 1: FONDASI & INFRASTRUKTUR

### Fase 1.1 — Folder Structure & Konfigurasi (Hari 1)

**Tujuan:** Repo siap di-clone dan langsung bisa dijalankan lokal.

**Task:**

1. Buat struktur folder:
   ```
   backend/
     src/
       config/       ← database.js, redis.js, constants.js
       routes/       ← auth.js, data.js, upload.js, export.js, admin.js
       middleware/   ← auth.js, errorHandler.js, requestLogger.js
       services/     ← etl.js, excelExport.js, audit.js, userService.js, fileParser.js
       jobs/         ← uploadProcessor.js
       utils/        ← logger.js, validation.js, helpers.js
       migrations/   ← 001_init_schema.sql, 002_audit_logs.sql, 003_indexes.sql, seed.sql, run.js
     Dockerfile
     .dockerignore
     .env.example

   frontend/
     src/
       pages/        ← Login.jsx, Dashboard.jsx, Upload.jsx, Export.jsx, Admin.jsx
       components/   ← Layout/, Dashboard/, Upload/, Export/, Admin/
       hooks/        ← useAuth.js, useDataTable.js, useFileUpload.js, useExport.js
       services/     ← api.js, auth.js, storage.js
       styles/       ← tailwind.css, globals.css
     index.html
     vite.config.js
     tailwind.config.js
     postcss.config.js
     Dockerfile.dev
     .dockerignore
     .env.example

   scripts/
     init-db.sql
     seed-users.sql
     backup-db.sh
     health-check.sh

   .env.example     ← root-level untuk docker-compose
   ```

2. Pindahkan `backend-package.json` → `backend/package.json`
3. Pindahkan `frontend-package.json` → `frontend/package.json`
4. Buat `.env.example` root dengan variabel:
   - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
   - `JWT_SECRET`, `JWT_EXPIRES_IN`
   - `REDIS_URL`
   - `NODE_ENV`, `PORT`
   - `FRONTEND_URL`

**Referensi:** `docs/SETUP-SUMMARY.md` → Repository Structure

---

### Fase 1.2 — Database Schema & Migrations (Hari 1–2)

**Tujuan:** Semua tabel siap, bisa di-migrate dengan satu command.

**Task:**

1. Buat `backend/src/migrations/001_init_schema.sql`:
   - Tabel `users` (id, username, email, password_hash, role, department, is_active)
   - Tabel `user_sessions` (id, user_id, token_hash, expires_at)
   - Tabel `raw_log_plus` (per upload_id)
   - Tabel `raw_vr_learning` (per upload_id)
   - Tabel `processed_mandatory_2026` (agregat per employee_id)
   - Tabel `processed_summary_all` (agregat per directorate)

2. Buat `backend/src/migrations/002_audit_logs.sql`:
   - Tabel `audit_logs` (user_id, action, resource_type, details JSONB, status, ip_address)
   - Tabel `upload_history` (upload_id, uploaded_by, processing_status)
   - Tabel `export_configs`

3. Buat `backend/src/migrations/003_indexes.sql`:
   - Index pada `email`, `upload_id`, `created_at DESC`, `action`

4. Buat `backend/src/migrations/seed.sql`:
   - 3 user default: `admin@cimb.local`, `uploader@cimb.local`, `viewer@cimb.local`
   - Password: `password123` (bcrypt hash)

5. Buat `backend/src/migrations/run.js`:
   - Script yang menjalankan semua migration file secara berurutan

**Referensi:** `docs/plan.md` → Section 3 (Database Schema)

---

### Fase 1.3 — Backend Foundation: Config & Auth (Hari 2–3)

**Tujuan:** Backend bisa login, return JWT, dan protect routes.

**Task:**

1. **`backend/src/config/database.js`** — pool connection PostgreSQL via `pg`
2. **`backend/src/config/redis.js`** — connection Redis via `ioredis`
3. **`backend/src/config/constants.js`** — roles, status values, pagination defaults

4. **`backend/src/app.js`** — setup Express:
   - `cors`, `helmet`, `cookie-parser`, `express.json()`
   - Rate limiter pada `/api/auth/*`
   - Mount semua routes

5. **`backend/src/server.js`** — entry point, listen port

6. **`backend/src/middleware/auth.js`**:
   - `verifyToken` — validasi JWT dari header
   - `requireRole(roles)` — cek role user

7. **`backend/src/routes/auth.js`**:
   - `POST /api/auth/login` — validasi credentials, generate JWT, set httpOnly cookie
   - `POST /api/auth/logout` — clear cookie
   - `GET /api/auth/me` — return user dari token
   - `POST /api/auth/refresh` — renew token

8. **`backend/src/services/userService.js`**:
   - `findByEmail(email)`
   - `validatePassword(plain, hash)`
   - `createUser(data)`

**Referensi:** `docs/plan.md` → Section 4 (Authentication & Authorization)

---

### Fase 1.4 — Docker Compose & Test Local (Hari 3)

**Tujuan:** `docker-compose up -d` jalan sempurna, auth endpoint bisa di-test.

**Task:**

1. Verifikasi `docker-compose.yml` sudah include: `postgres`, `redis`, `backend`, `frontend`, `adminer`, `redis-commander`
2. Update Dockerfile backend untuk `npm run dev` (hot reload via nodemon)
3. Jalankan: `docker-compose up -d`
4. Jalankan: `docker-compose exec backend npm run migrate`
5. Jalankan: `docker-compose exec backend npm run seed:users`
6. Test: `curl http://localhost:5000/api/auth/login` → dapat token

**Referensi:** `docs/QUICKSTART.md`

---

## MINGGU 2: BACKEND — API, UPLOAD, ETL, EXPORT

### Fase 2.1 — Data API Endpoints (Hari 1–2)

**Tujuan:** Dashboard bisa fetch semua data dengan pagination & filter.

**Task:**

1. **`backend/src/routes/data.js`**:
   - `GET /api/data/summary-all` — agregat per direktorat
   - `GET /api/data/mandatory-2026` — paginasi 100/req, filter: `directorate`, `status`, `search`
   - `GET /api/data/log-plus` — filter: `course`, `employee_id`, `date_from`, `date_to`
   - `GET /api/data/vr-learning` — filter: `region`, `branch`, `status`

2. **`backend/src/middleware/requestLogger.js`** — log setiap request ke winston

3. Format response standar:
   ```json
   {
     "data": [...],
     "total": 11414,
     "page": 1,
     "pageSize": 100,
     "totalPages": 115
   }
   ```

**Referensi:** `docs/plan.md` → Section 5 (API Endpoints — Data Retrieval)

---

### Fase 2.2 — File Upload & ETL Pipeline (Hari 2–3)

**Tujuan:** User bisa upload 2 file XLSX, data diproses di background, tersimpan ke DB.

**Task:**

1. **`backend/src/routes/upload.js`**:
   - `POST /api/upload` — terima 2 file (`log_plus`, `vr_learning`) via multer
   - Validasi: format XLSX, max size 50MB, required columns ada
   - Queue job ke Bull, return `upload_id` + status `processing`
   - `GET /api/upload-history` — riwayat upload

2. **`backend/src/services/fileParser.js`**:
   - Parse XLSX ke array of objects menggunakan `xlsx`
   - Validasi required columns
   - Normalize data (trim whitespace, format tanggal, dll.)

3. **`backend/src/jobs/uploadProcessor.js`** — Bull worker:
   - Step 1: Insert ke `raw_log_plus` dan `raw_vr_learning`
   - Step 2: Jalankan ETL queries (lihat Fase 2.3)
   - Step 3: Update `upload_history.processing_status` → `complete`
   - Step 4: Log ke `audit_logs` (action: `upload_completed`)

4. **`backend/src/services/etl.js`** — ETL calculations:
   - `calculateMandatory2026()` — join LOG+ dan VR, hitung `overall_status` dan `overall_completion`
   - `calculateSummaryAll()` — GROUP BY directorate, hitung completion rate tiap direktorat

5. **`backend/src/services/audit.js`** — `logAudit(data)` helper

**Referensi:** `docs/plan.md` → Section 7–8 (File Upload & ETL)

---

### Fase 2.3 — Excel Export dengan Formula (Hari 4)

**Tujuan:** User bisa download report XLSX dengan 4 sheet, formula Excel aktif.

**Task:**

1. **`backend/src/routes/export.js`**:
   - `POST /api/export/xlsx` — terima body `{ sheets, include_formulas, filters }`
   - Stream binary ke response dengan header `Content-Disposition`
   - Log ke `audit_logs` (action: `download`, detail: sheets dan filters yang dipilih)

2. **`backend/src/services/excelExport.js`** menggunakan `exceljs`:
   - Sheet **Summary All**: completion rate per direktorat + formula `=C2/B2*100`
   - Sheet **Mandatory 2026**: status per karyawan + formula `=IF(AND(...),"Completed","Not Completed")`
   - Sheet **LOG+**: data mentah dengan filter
   - Sheet **VR Learning**: data mentah dengan filter
   - Frozen header row pada setiap sheet
   - Conditional formatting: hijau = Completed, merah = Not Completed

**Referensi:** `docs/plan.md` → Section 9 (Excel Export with Formulas)

---

### Fase 2.4 — Admin & Audit Log API (Hari 4–5)

**Tujuan:** Admin bisa manage user dan lihat semua activity log.

**Task:**

1. **`backend/src/routes/admin.js`** (role: admin only):
   - `GET /api/admin/users` — daftar semua user
   - `POST /api/admin/users` — buat user baru
   - `PUT /api/admin/users/:id` — update user (role, is_active)
   - `DELETE /api/admin/users/:id` — soft delete (is_active = false)
   - `GET /api/admin/audit-logs` — filter: action, user_id, date_from, date_to

**Referensi:** `docs/plan.md` → Section 5 (Logging & Admin Endpoints)

---

## MINGGU 3: FRONTEND

### Fase 3.1 — Setup & Shared Components (Hari 1)

**Tujuan:** Frontend boilerplate jalan, routing ready, komponen shared tersedia.

**Task:**

1. Setup Vite + React + TailwindCSS:
   - `vite.config.js` — proxy `/api` ke `http://localhost:5000`
   - `tailwind.config.js` — custom color palette dari `docs/DESIGN-PROMPTS.md`
   - `postcss.config.js`

2. **`src/services/api.js`** — Axios instance:
   - `baseURL` dari env
   - Interceptor: attach token dari memory ke setiap request
   - Interceptor response: handle 401 → redirect ke `/login`

3. **`src/services/auth.js`** — `login()`, `logout()`, `getMe()`

4. **`src/hooks/useAuth.js`** — React context + hook untuk auth state

5. **`src/components/Layout/`**:
   - `Navbar.jsx` — nama user, role badge, tombol logout
   - `Sidebar.jsx` — nav links berdasarkan role
   - `ProtectedRoute.jsx` — redirect ke `/login` jika tidak auth

6. **`src/App.jsx`** — React Router: `/login`, `/`, `/upload`, `/export`, `/admin`

**Referensi:** `docs/plan.md` → Section 5 (Frontend Components), `docs/DESIGN-TO-IMPLEMENTATION-GUIDE.md`

---

### Fase 3.2 — Halaman Login (Hari 1)

**Tujuan:** User bisa login, token tersimpan, redirect ke dashboard.

**Task:**

1. **`src/pages/Login.jsx`**:
   - Form: email + password
   - Submit → `POST /api/auth/login`
   - Simpan token ke memory (bukan localStorage)
   - Redirect ke `/` setelah berhasil
   - Show error jika credentials salah

**Referensi:** `docs/DESIGN-PROMPTS.md` → Login Page spec

---

### Fase 3.3 — Dashboard & 4 Tabs (Hari 2–3)

**Tujuan:** Semua data tampil dengan tabel, pagination, search, dan filter.

**Task:**

1. **`src/hooks/useDataTable.js`** — TanStack Query:
   - Fetch data dengan pagination
   - Debounced search
   - Filter state management

2. **`src/pages/Dashboard.jsx`** — tab container

3. **`src/components/Dashboard/SummaryAllTable.jsx`**:
   - Kolom: Directorate, Total, LOG+ Rate, VR Rate, Combined Rate
   - Tanpa pagination (data kecil)

4. **`src/components/Dashboard/Mandatory2026Table.jsx`**:
   - Kolom: Employee ID, Name, Directorate, LOG+ Status, VR Status, Overall
   - Pagination 100 baris/halaman
   - Filter: Directorate, Status
   - Global search

5. **`src/components/Dashboard/LogPlusTable.jsx`**:
   - Filter: Course, Date range, Status
   - Pagination

6. **`src/components/Dashboard/VRLearningTable.jsx`**:
   - Filter: Region, Branch, Status
   - Pagination

**Referensi:** `docs/plan.md` → Section 5 (Frontend Components — Key Components Detail)

---

### Fase 3.4 — Halaman Upload (Hari 3)

**Tujuan:** User bisa upload 2 file XLSX, lihat progress, dan riwayat upload.

**Task:**

1. **`src/hooks/useFileUpload.js`** — handle upload state

2. **`src/components/Upload/FileDropZone.jsx`**:
   - Drag-and-drop + click to browse
   - 2 slot terpisah: LOG+ file dan VR Learning file
   - Validasi format XLSX di client

3. **`src/components/Upload/UploadProgress.jsx`**:
   - Progress bar saat upload
   - Status polling ke `GET /api/upload-history` setiap 2 detik

4. **`src/components/Upload/UploadHistory.jsx`**:
   - Tabel riwayat upload: filename, rows, status, tanggal
   - Badge status: Processing / Complete / Error

**Referensi:** `docs/DESIGN-PROMPTS.md` → Upload Page spec

---

### Fase 3.5 — Halaman Export (Hari 4)

**Tujuan:** User bisa pilih sheet, set filter, download XLSX.

**Task:**

1. **`src/hooks/useExport.js`**

2. **`src/components/Export/ExportCheckboxes.jsx`**:
   - Checkbox untuk 4 sheet: Summary All, Mandatory 2026, LOG+, VR Learning
   - Toggle "Include Formulas"

3. **`src/components/Export/FilterPanel.jsx`**:
   - Filter: Directorate, Status, Date range

4. **`src/components/Export/DownloadButton.jsx`**:
   - Trigger `POST /api/export/xlsx`
   - Otomatis download file binary dari response

**Referensi:** `docs/DESIGN-PROMPTS.md` → Export Page spec

---

### Fase 3.6 — Admin Panel (Hari 4–5)

**Tujuan:** Admin bisa manage user dan lihat audit log. Hanya accessible oleh role `admin`.

**Task:**

1. **`src/components/Admin/UserManagement.jsx`**:
   - Tabel user: name, email, role, status
   - Modal: tambah user / edit role / deactivate

2. **`src/components/Admin/AuditLogViewer.jsx`**:
   - Tabel log: timestamp, user, action, resource, status
   - Filter: action, user, date range

**Referensi:** `docs/DESIGN-PROMPTS.md` → Admin pages spec

---

## MINGGU 4: TESTING, POLISH & DEPLOYMENT

### Fase 4.1 — Testing (Hari 1–2)

**Task:**

| Layer | Tool | Target Coverage |
|-------|------|----------------|
| Backend unit | Jest | Services: etl.js, fileParser.js, excelExport.js |
| Backend integration | Supertest | Semua API endpoints |
| Frontend unit | Vitest | Hooks dan utility functions |
| E2E | Cypress | Login → Upload → Dashboard → Export flow |

**Command:**
```bash
docker-compose exec backend npm test
docker-compose exec frontend npm test
docker-compose exec frontend npm run test:e2e
```

---

### Fase 4.2 — Bug Fix & Polish (Hari 2–3)

**Checklist:**
- [ ] Semua error state ditampilkan dengan UI yang jelas (bukan blank/crash)
- [ ] Loading skeleton saat fetch data
- [ ] Empty state saat data kosong
- [ ] Responsive di mobile (min. 768px)
- [ ] Contrast warna sesuai WCAG AA
- [ ] Semua halaman cocok dengan mockup di `docs/DESIGN-PROMPTS.md`
- [ ] Validasi form lengkap (required fields, format email, file size)

---

### Fase 4.3 — Production Deployment (Hari 3–5)

**Task:**

1. Buat `.env.production` di server (jangan commit ke repo)
2. Verifikasi `docker-compose.prod.yml`:
   - Resource limits untuk setiap service
   - Volume untuk PostgreSQL data persistence
   - Secrets management
3. Setup Nginx via `nginx.conf`:
   - Reverse proxy frontend (port 3000) dan backend (port 5000)
   - SSL certificate via Let's Encrypt (Certbot)
   - Gzip compression + security headers
4. Jalankan di server:
   ```bash
   git clone https://github.com/agungNCC/cmnd-analytics.git
   cd cmnd-analytics
   cp .env.example .env  # Edit dengan nilai production
   docker-compose -f docker-compose.prod.yml up -d
   docker-compose exec backend npm run migrate
   docker-compose exec backend npm run seed:users
   ```
5. Setup cronjob backup database harian:
   ```bash
   0 2 * * * /cmnd-analytics/scripts/backup-db.sh
   ```
6. Verifikasi health check: `curl https://domain.com/health`

**Referensi:** `docs/DEPLOYMENT.md`

---

## 📋 MASTER CHECKLIST

### Minggu 1 — Fondasi
- [ ] Folder structure `backend/` dan `frontend/` dibuat
- [ ] `backend-package.json` dipindah ke `backend/package.json`
- [ ] `frontend-package.json` dipindah ke `frontend/package.json`
- [ ] `.env.example` root tersedia
- [ ] Migration SQL untuk semua tabel dibuat
- [ ] Seed 3 user default
- [ ] `npm run migrate` berhasil
- [ ] Auth endpoint: login, logout, me, refresh
- [ ] `docker-compose up -d` semua service healthy
- [ ] `curl /api/auth/login` → dapat JWT

### Minggu 2 — Backend
- [ ] `GET /api/data/summary-all` dengan data aktual
- [ ] `GET /api/data/mandatory-2026` pagination + filter
- [ ] `GET /api/data/log-plus` filter berjalan
- [ ] `GET /api/data/vr-learning` filter berjalan
- [ ] `POST /api/upload` terima 2 file XLSX
- [ ] ETL pipeline: data tersimpan ke `processed_*` tabel
- [ ] `POST /api/export/xlsx` download file berhasil
- [ ] Formula Excel aktif di file hasil download
- [ ] `audit_logs` terisi setiap upload dan download
- [ ] Admin endpoints CRUD user berjalan

### Minggu 3 — Frontend
- [ ] Login page — form submit, error state, redirect
- [ ] Dashboard tab Summary All — data tampil
- [ ] Dashboard tab Mandatory 2026 — pagination + filter
- [ ] Dashboard tab LOG+ — filter berjalan
- [ ] Dashboard tab VR Learning — filter berjalan
- [ ] Upload page — drag-drop, progress, history
- [ ] Export page — checkbox, filter, download
- [ ] Admin panel — user management
- [ ] Admin panel — audit log viewer
- [ ] ProtectedRoute bekerja (401 redirect ke login)
- [ ] Responsive layout di 768px+

### Minggu 4 — Quality & Deploy
- [ ] Unit tests backend: ≥70% coverage pada services
- [ ] Integration tests: semua endpoint pass
- [ ] E2E: complete upload → export flow pass
- [ ] Tidak ada error state yang kosong/blank
- [ ] Server siap, Nginx berjalan
- [ ] SSL aktif (HTTPS)
- [ ] Backup DB terjadwal
- [ ] Health check production: pass
- [ ] Go live ✅

---

## 🔗 REFERENSI CEPAT

| Butuh apa | Baca di mana |
|-----------|-------------|
| Database schema SQL | `docs/plan.md` → Section 3 |
| Auth code (JWT, middleware) | `docs/plan.md` → Section 4 |
| API endpoint specs | `docs/plan.md` → Section 5 |
| Frontend component structure | `docs/plan.md` → Section 6 |
| Upload & ETL implementation | `docs/plan.md` → Section 7–8 |
| Excel export (exceljs) | `docs/plan.md` → Section 9 |
| Audit logging | `docs/plan.md` → Section 10 |
| Docker & container setup | `docs/plan.md` → Section 11 |
| Production deployment steps | `docs/DEPLOYMENT.md` |
| Design UI specs | `docs/DESIGN-PROMPTS.md` |
| Design-to-code guide | `docs/DESIGN-TO-IMPLEMENTATION-GUIDE.md` |
| Quick troubleshoot | `docs/QUICKSTART.md` |

---

**Dibuat:** August 18, 2026  
**Status:** Ready to implement — mulai dari Fase 1.1
