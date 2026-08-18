# CMND Analytics - Mandatory LOG+ & VR Learning 2026

**VR Learning Analytics Dashboard untuk CIMB Niaga**

Data visualization, management, dan export application untuk tracking completion status Mandatory LOG+ dan VR Learning training programs dengan authentication, audit logging, dan advanced Excel export dengan formulas.

![GitHub](https://img.shields.io/badge/github-cmnd--analytics-blue?logo=github)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-development-yellow)

---

## 📋 QUICK OVERVIEW

| Aspek | Detail |
|-------|--------|
| **Repository** | https://github.com/agungNCC/cmnd-analytics |
| **Stack** | React (Vite) + Node.js (Express) + PostgreSQL + Docker |
| **Auth** | JWT + httpOnly cookies |
| **Database Rows** | 11,414 employees × 2 training types |
| **Key Features** | Upload, ETL processing, dashboard, advanced Excel export |
| **Deployment** | Docker Compose (local) → Docker (production) |
| **Timeline** | MVP: 2 weeks, Full: 1 month |

---

## 🚀 LOCAL SETUP (5 Minutes)

### Prerequisites
```bash
Node.js 18+
PostgreSQL 13+ (or use Docker)
Docker & Docker Compose
Git
```

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/agungNCC/cmnd-analytics.git
cd cmnd-analytics

# 2. Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# 3. Start all services (Docker)
docker-compose up -d

# Wait ~30s for services to be healthy

# 4. Setup database
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed:users

# 5. Access applications
Frontend:  http://localhost:3000
Backend:   http://localhost:5000
Adminer:   http://localhost:8080 (DB admin)
```

### Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin@cimb.local | password123 |
| Uploader | uploader@cimb.local | password123 |
| Viewer | viewer@cimb.local | password123 |

---

## 📁 REPOSITORY STRUCTURE

```
cmnd-analytics/
│
├── backend/                           # Node.js/Express backend
│   ├── src/
│   │   ├── app.js                    # Express setup
│   │   ├── server.js                 # Entry point
│   │   ├── config/
│   │   │   ├── database.js           # PostgreSQL connection
│   │   │   ├── redis.js              # Redis client
│   │   │   └── constants.js          # App constants
│   │   ├── routes/
│   │   │   ├── auth.js               # POST /auth/login, /logout, /refresh
│   │   │   ├── data.js               # GET /api/data/* endpoints
│   │   │   ├── upload.js             # POST /api/upload, GET /upload-history
│   │   │   ├── export.js             # GET /api/export/xlsx
│   │   │   └── admin.js              # GET /api/logs, /users (admin only)
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification & role checking
│   │   │   ├── errorHandler.js       # Global error handling
│   │   │   └── requestLogger.js      # Request/response logging
│   │   ├── services/
│   │   │   ├── etl.js                # ETL pipeline functions
│   │   │   ├── excelExport.js        # XLSX generation with formulas
│   │   │   ├── audit.js              # Audit log functions
│   │   │   ├── userService.js        # User management
│   │   │   └── fileParser.js         # XLSX/CSV parsing
│   │   ├── jobs/
│   │   │   └── uploadProcessor.js    # Bull queue worker for async upload
│   │   ├── utils/
│   │   │   ├── logger.js             # Winston logger
│   │   │   ├── validation.js         # Input validation
│   │   │   └── helpers.js            # Utility functions
│   │   └── migrations/
│   │       ├── 001_init_schema.sql   # Initial database schema
│   │       ├── 002_audit_logs.sql    # Audit logging tables
│   │       ├── 003_indexes.sql       # Performance indexes
│   │       └── seed.sql              # Test data & users
│   ├── Dockerfile                     # Backend container config
│   ├── .dockerignore
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── frontend/                          # React/Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx             # /login
│   │   │   ├── Dashboard.jsx         # / (protected, 4 tabs)
│   │   │   ├── Upload.jsx            # /upload (protected)
│   │   │   ├── Export.jsx            # /export (protected)
│   │   │   └── Admin.jsx             # /admin (protected, admin only)
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Navbar.jsx        # Top navigation
│   │   │   │   ├── Sidebar.jsx       # Left nav (role-based)
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── TabContainer.jsx
│   │   │   │   ├── SummaryAllTable.jsx
│   │   │   │   ├── Mandatory2026Table.jsx
│   │   │   │   ├── LogPlusTable.jsx
│   │   │   │   └── VRLearningTable.jsx
│   │   │   ├── Upload/
│   │   │   │   ├── FileDropZone.jsx
│   │   │   │   ├── UploadProgress.jsx
│   │   │   │   ├── UploadHistory.jsx
│   │   │   │   └── ValidationAlert.jsx
│   │   │   ├── Export/
│   │   │   │   ├── ExportCheckboxes.jsx
│   │   │   │   ├── FilterPanel.jsx
│   │   │   │   ├── DownloadButton.jsx
│   │   │   │   └── ExportStatus.jsx
│   │   │   └── Admin/
│   │   │       ├── UserManagement.jsx
│   │   │       ├── AuditLogViewer.jsx
│   │   │       └── SystemHealth.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js            # Auth state & JWT handling
│   │   │   ├── useDataTable.js       # Query, pagination, filters
│   │   │   ├── useFileUpload.js      # File upload state
│   │   │   └── useExport.js          # Export functionality
│   │   ├── services/
│   │   │   ├── api.js                # Axios instance with interceptors
│   │   │   ├── auth.js               # Auth service functions
│   │   │   └── storage.js            # Token & session management
│   │   ├── styles/
│   │   │   ├── tailwind.css          # Tailwind config
│   │   │   ├── globals.css           # Global styles
│   │   │   └── components.css        # Component styles
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # React entry point
│   │   └── index.html
│   ├── Dockerfile.dev                 # Development container
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── scripts/
│   ├── init-db.sql                   # Database initialization
│   ├── seed-users.sql                # Create test users
│   ├── backup-db.sh                  # Database backup script
│   └── health-check.sh               # System health verification
│
├── .github/
│   └── workflows/
│       ├── test.yml                  # Run tests on push
│       ├── build.yml                 # Build Docker images
│       └── deploy.yml                # Deploy to server
│
├── docker-compose.yml                 # Local development setup
├── docker-compose.prod.yml            # Production setup
├── nginx.conf                         # Nginx configuration
├── .dockerignore
├── .gitignore
├── .env.example
├── plan.md                            # Comprehensive development plan
├── README.md                          # This file
└── LICENSE
```

---

## 🏗️ SYSTEM ARCHITECTURE

### Data Flow

```
┌──────────────┐
│   Browser    │ (User login & interact)
└──────┬───────┘
       │ API calls (JSON)
       ↓
┌──────────────────────┐
│ React Frontend Vite  │ Auth state, tables, forms
└──────┬───────────────┘
       │ HTTP/REST
       ↓
┌──────────────────────┐
│ Node.js Backend      │ Auth, routing, ETL, export
│ - Auth middleware    │
│ - Data routes        │
│ - Upload handler     │
│ - ETL pipeline       │
│ - Excel generation   │
└──────┬───────────────┘
       │ SQL/JSON
       ↓
┌──────────────────────┐
│ PostgreSQL Database  │
│ - Users & sessions   │
│ - Raw data tables    │
│ - Processed tables   │
│ - Audit logs         │
└──────────────────────┘
```

### Technology Choices

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 + Vite | Fast HMR, modern tooling, optimal bundle size |
| **State Management** | TanStack Query v5 | Server state caching, pagination, sync |
| **Tables** | TanStack Table v8 | Virtualization for 11k+ rows, flexible |
| **CSS** | Tailwind CSS | Utility-first, responsive, rapid development |
| **Backend** | Node.js + Express | JavaScript full-stack, event-driven |
| **Database** | PostgreSQL | Relational, JSON support, powerful aggregations |
| **File Export** | exceljs | Formula preservation, styling, lookup support |
| **Auth** | JWT + httpOnly | Secure, stateless, CSRF-protected |
| **Async Queue** | Bull + Redis | Background job processing, retry logic |
| **Logging** | Winston + PostgreSQL | Structured logs, audit trail, searchable |
| **Containerization** | Docker Compose | Local parity with production |

---

## 🔐 AUTHENTICATION & ROLES

### Role-Based Access Control (RBAC)

```
┌─────────┬───────────┬──────────┬─────────┐
│ Feature │ Admin     │ Uploader │ Viewer  │
├─────────┼───────────┼──────────┼─────────┤
│ Upload  │ ✅        │ ✅       │ ❌      │
│ View    │ ✅        │ ✅       │ ✅      │
│ Export  │ ✅        │ ✅       │ ✅      │
│ Manage  │ ✅        │ ❌       │ ❌      │
│ Logs    │ ✅        │ ❌       │ ❌      │
└─────────┴───────────┴──────────┴─────────┘
```

### Login Flow

```
1. User enters credentials
   ↓
2. POST /api/auth/login
   ↓
3. Server validates & creates JWT
   ↓
4. Response: Set httpOnly cookie + return user info
   ↓
5. Frontend stores token in memory (not localStorage)
   ↓
6. Every API call: Authorization: Bearer <token>
   ↓
7. Middleware verifies token on every request
```

---

## 🗄️ DATABASE SCHEMA

### Core Tables

**users** - User authentication
```sql
id, username, email, password_hash, full_name, role, department, 
is_active, created_at, updated_at
```

**user_sessions** - Token management
```sql
id, user_id, token_hash, expires_at, created_at
```

**raw_log_plus** - Unmodified LOG+ data
```sql
id, upload_id, employee_id, employee_name, directorate, 
sub_directorate, course_name, completion_status, 
completion_percentage, completion_date, score, created_at
```

**raw_vr_learning** - Unmodified VR Learning data
```sql
id, upload_id, employee_id, employee_name, directorate, 
region, branch, forward_30_score, completion_status, 
completion_time, created_at
```

**processed_mandatory_2026** - Aggregated employee data
```sql
employee_id, employee_name, directorate, 
log_plus_status, log_plus_completion, 
vr_learning_status, vr_learning_completion,
overall_status (FORMULA), overall_completion (FORMULA),
last_processed
```

**processed_summary_all** - Department-level aggregates
```sql
directorate, total_employees,
log_plus_completed, log_plus_incompleted, 
log_plus_completion_rate (FORMULA),
vr_learning_completed, vr_learning_incompleted,
vr_learning_completion_rate (FORMULA),
combined_completion_rate (FORMULA), last_processed
```

**audit_logs** - User activity tracking
```sql
id, user_id, username, action, resource_type, resource_name,
status, error_message, details (JSON), ip_address, user_agent,
created_at
```

See `backend/src/migrations/` for complete SQL.

---

## 📤 UPLOAD & ETL PROCESS

### Upload Flow with Logging

```
User uploads 2 files
    ↓
POST /api/upload (with auth)
    ↓
✓ Files validated & stored temporarily
✓ Log audit entry: "upload_started"
    ↓
Queue background job (Bull + Redis)
    ↓
Worker process:
  1. Parse XLSX → JSON
  2. Insert into raw_log_plus table
  3. Insert into raw_vr_learning table
  4. Calculate processed_mandatory_2026
  5. Calculate processed_summary_all
  6. Update upload_history
    ↓
✓ Log audit entry: "upload_completed" (success/failure)
    ↓
Frontend polls /api/upload-history for status
```

### ETL Calculations

**processed_mandatory_2026:**
- Outer join LOG+ and VR data on employee_id
- overall_status = IF(both 'Completed' then 'Completed', else 'Incompleted')
- overall_completion = AVG(log_plus_completion, vr_learning_completion)

**processed_summary_all:**
- GROUP BY directorate
- log_plus_completion_rate = COUNT(completed) / COUNT(*) * 100
- vr_learning_completion_rate = COUNT(completed) / COUNT(*) * 100
- combined_completion_rate = AVG of both rates

---

## 📊 EXCEL EXPORT WITH FORMULAS

### Features

✅ **4 Sheets in one workbook:**
- Summary All (with completion rate formulas)
- Mandatory 2026 (with overall status formulas)
- LOG+ (raw data)
- VR Learning (raw data)

✅ **Dynamic Formulas:**
```excel
Summary All:
  LOG+ Completion % = C2/B2*100
  Combined Rate = (E2+H2)/2

Mandatory 2026:
  Overall Status = IF(AND(D2="Completed",F2="Completed"),"Completed","Incompleted")
  Overall Completion = (E2+G2)/2
```

✅ **Conditional Formatting:**
- Green: > 80% completion
- Yellow: 50-80%
- Red: < 50%

✅ **Styling:**
- Frozen header rows
- Column auto-sizing
- Currency/percentage formatting
- Bold headers

### Export Flow

```
User selects sheets & filters
    ↓
POST /api/export/xlsx
    ↓
Generate workbook using exceljs
  1. Query data with filters applied
  2. Add sheets with formulas
  3. Apply conditional formatting
  4. Save to stream
    ↓
Response: Binary XLSX file (download)
    ↓
✓ Log audit entry: "download" (success, file size, sheets used)
```

---

## 📝 AUDIT LOGGING

### Logged Events

| Action | Details | User Visible |
|--------|---------|--------------|
| login | timestamp, IP, user-agent | Audit log |
| logout | timestamp | Audit log |
| upload_started | file names, sizes | Audit log |
| upload_completed | rows processed, time taken | Audit log |
| upload_failed | error message | Audit log |
| download | sheets, filters, file size | Audit log |
| user_created | new user details | Audit log |
| user_deleted | deleted user | Audit log |

### Audit Log Viewer (Admin)

- Filter by: action, user, date range, status
- Search: username, resource name
- Export: audit logs to CSV
- Details: JSON blob with full context

---

## 🚀 DEPLOYMENT

### Docker Compose (Local Development)

```bash
docker-compose up -d
# Starts: PostgreSQL, Redis, Backend, Frontend, Adminer
```

### Production Deployment

```bash
# 1. Build images
docker build -t cmnd-analytics-backend:latest ./backend
docker build -t cmnd-analytics-frontend:latest ./frontend

# 2. Push to registry (Docker Hub, ECR, etc)
docker push cmnd-analytics-backend:latest
docker push cmnd-analytics-frontend:latest

# 3. SSH to server & deploy
ssh user@server
docker-compose -f docker-compose.prod.yml up -d

# 4. Setup SSL with Let's Encrypt
sudo certbot certonly --webroot -w /var/www/html -d yourdomain.com

# 5. Restart Nginx
sudo systemctl restart nginx
```

### Server Requirements

- **RAM**: 2GB minimum (4GB recommended)
- **CPU**: 2 cores
- **Storage**: 20GB (for database + logs)
- **OS**: Ubuntu 20.04+ or similar
- **Software**: Docker, Docker Compose, Nginx

---

## 📚 DOCUMENTATION

| Document | Purpose |
|----------|---------|
| **plan.md** | Comprehensive development plan, schema, API specs |
| **backend/README.md** | Backend setup, API docs, environment variables |
| **frontend/README.md** | Frontend setup, component docs, styling guide |
| **ARCHITECTURE.md** | System design decisions, data flow diagrams |
| **API.md** | Complete API endpoint documentation |
| **DEPLOYMENT.md** | Server setup, SSL, monitoring, backups |

---

## 🧪 TESTING

### Run Tests

```bash
# Backend unit tests
docker-compose exec backend npm test

# Backend integration tests
docker-compose exec backend npm run test:integration

# Frontend unit tests
docker-compose exec frontend npm test

# Frontend E2E tests
docker-compose exec frontend npm run test:e2e
```

### Coverage

```bash
# Generate coverage report
docker-compose exec backend npm run test:coverage
docker-compose exec frontend npm run test:coverage

# View reports
open coverage/lcov-report/index.html
```

---

## 🔧 DEVELOPMENT COMMANDS

### Backend

```bash
# Start dev server (hot reload)
docker-compose exec backend npm run dev

# Run migrations
docker-compose exec backend npm run migrate

# Seed test data
docker-compose exec backend npm run seed

# View logs
docker-compose logs backend -f

# Database shell
docker-compose exec postgres psql -U vr_learning -d vr_learning_db
```

### Frontend

```bash
# Start dev server with hot reload
docker-compose exec frontend npm run dev

# Build for production
docker-compose exec frontend npm run build

# Preview production build
docker-compose exec frontend npm run preview

# View logs
docker-compose logs frontend -f
```

### Database

```bash
# Backup database
docker-compose exec postgres pg_dump -U vr_learning vr_learning_db > backup.sql

# Restore database
docker-compose exec postgres psql -U vr_learning -d vr_learning_db < backup.sql

# Connect to database
docker-compose exec postgres psql -U vr_learning -d vr_learning_db

# View data in Adminer
# Open: http://localhost:8080
# Server: postgres
# User: vr_learning
# Pass: (from .env)
# Database: vr_learning_db
```

---

## 📋 TROUBLESHOOTING

### Services not starting?

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache

# Full restart
docker-compose down
docker-compose up -d
```

### Database connection error?

```bash
# Check PostgreSQL is healthy
docker-compose exec postgres pg_isready

# Reset database
docker-compose down
docker volume rm cmnd-analytics_postgres_data
docker-compose up -d postgres
docker-compose exec backend npm run migrate
```

### Port already in use?

```bash
# Change ports in docker-compose.yml or .env:
# 3000 → 3001
# 5000 → 5001
# 5432 → 5433
```

---

## 🤝 CONTRIBUTING

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push branch: `git push origin feature/your-feature`
4. Create Pull Request

### Code Style

- **Backend**: ESLint + Prettier
- **Frontend**: ESLint + Prettier + Tailwind
- **Commits**: Conventional commits

---

## 📄 LICENSE

MIT License - See LICENSE file for details

---

## 📞 SUPPORT

For issues or questions:
1. Check existing GitHub issues
2. Create new issue with description & steps to reproduce
3. Include: Node version, OS, Docker version, error logs

---

## 🎯 ROADMAP

### Phase 1: MVP (Week 1-2) ✅
- Database schema
- Authentication
- File upload & ETL
- Dashboard with 4 tabs
- Basic Excel export
- Docker setup

### Phase 2: Enhancement (Week 3)
- Advanced filtering & search
- Audit log viewer
- User management
- Excel formulas & conditional formatting
- Performance optimization

### Phase 3: Production (Week 4+)
- SSL/TLS certificates
- Monitoring & alerting
- Database backups
- API rate limiting
- Advanced analytics

---

**Repository**: https://github.com/agungNCC/cmnd-analytics  
**Last Updated**: January 2026  
**Maintained By**: Agung (AI-assisted development)
