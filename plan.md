# VR Learning Analytics App - Development Plan

**Project:** Mandatory LOG+ & VR Learning 2026 Analytics Dashboard  
**Client:** CIMB Niaga (Permata Bank)  
**Stack:** React (Vite) + Node.js (Express) + PostgreSQL  
**Deployment:** Docker (compose for local, K8s-ready for server)  
**Timeline:** 2-3 weeks MVP → Production

---

## 📋 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [File Upload & ETL](#file-upload--etl)
8. [Excel Export with Formulas](#excel-export-with-formulas)
9. [Logging System](#logging-system)
10. [Docker Setup](#docker-setup)
11. [Deployment Guide](#deployment-guide)
12. [Testing Strategy](#testing-strategy)

---

## 🚀 QUICK START

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- Docker & Docker Compose
- Git

### Local Development

```bash
# Clone & setup
git clone <repo>
cd vr-learning-analytics
npm install

# Copy env files
cp .env.example .env
cp .env.example .env.local

# Start services (Docker)
docker-compose up -d

# Run migrations
npm run migrate

# Create test user (manual)
npm run seed:users

# Start dev servers
npm run dev  # Frontend + Backend concurrent
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Adminer (DB): http://localhost:8080
- Default user: admin@cimb.local / password123

---

## 🏗️ SYSTEM ARCHITECTURE

### High-Level Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    USER ACCESS (Login Required)               │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Upload Page  │  │  Dashboard   │  │ Export Page  │        │
│  │ (Drag-drop)  │  │ (4 tabs)     │  │ (Checkboxes) │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└──────────────────────────────────────────────────────────────┘
                           ↓↑ API (JSON)
┌──────────────────────────────────────────────────────────────┐
│                  Node.js/Express Backend                      │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Auth Routes  │  Data Routes  │  Upload  │  Export   │    │
│  │ /auth/login  │  /api/data/*  │  /upload │  /export  │    │
│  └──────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ ETL Pipeline  │  File Parser  │  Logging  │ Formulas │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                           ↓↑ SQL
┌──────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                        │
│  ┌─────────────┐  ┌────────────┐  ┌─────────────┐  ┌──────┐ │
│  │ Raw Data    │  │ Processed  │  │ Users       │  │ Logs │ │
│  │ (LOG+, VR)  │  │ (2026, SA) │  │ (Auth)      │  │      │ │
│  └─────────────┘  └────────────┘  └─────────────┘  └──────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Technology Choices

| Component | Tech | Rationale |
|-----------|------|-----------|
| **Frontend** | React 18 + Vite | Fast HMR, optimal bundle size |
| **State Mgmt** | TanStack Query v5 | Server state sync, pagination, caching |
| **Tables** | TanStack Table v8 | Virtualization for 11k rows, column filters |
| **File Export** | exceljs | Formula preservation, styling, lookup support |
| **Auth** | JWT + httpOnly cookies | Secure, stateless, CSRF-protected |
| **Logging** | winston + PostgreSQL | Structured logs, searchable audit trail |
| **File Upload** | multer + xlsx | Stream parsing, validation |
| **ETL** | Bull queue | Async processing, retry logic |
| **Container** | Docker Compose | Local parity with production |

---

## 🗄️ DATABASE SCHEMA

### Authentication & Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'viewer',  -- 'admin', 'uploader', 'viewer'
  department VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_session_user_id ON user_sessions(user_id);
```

### Raw Data Tables

```sql
CREATE TABLE raw_log_plus (
  id SERIAL PRIMARY KEY,
  upload_id UUID NOT NULL,
  employee_id VARCHAR(50),
  employee_name VARCHAR(255),
  directorate VARCHAR(255),
  sub_directorate VARCHAR(255),
  course_name VARCHAR(255),
  completion_status VARCHAR(50),
  completion_percentage DECIMAL(5,2),
  completion_date TIMESTAMP,
  score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE raw_vr_learning (
  id SERIAL PRIMARY KEY,
  upload_id UUID NOT NULL,
  employee_id VARCHAR(50),
  employee_name VARCHAR(255),
  directorate VARCHAR(255),
  sub_directorate VARCHAR(255),
  region VARCHAR(100),
  branch VARCHAR(255),
  forward_30_score INT,
  completion_time VARCHAR(50),
  completion_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_raw_log_upload ON raw_log_plus(upload_id);
CREATE INDEX idx_raw_vr_upload ON raw_vr_learning(upload_id);
```

### Processed Data Tables

```sql
CREATE TABLE processed_mandatory_2026 (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE,
  employee_name VARCHAR(255),
  directorate VARCHAR(255),
  sub_directorate VARCHAR(255),
  hire_date DATE,
  email VARCHAR(255),
  log_plus_status VARCHAR(50),
  log_plus_completion DECIMAL(5,2),
  log_plus_last_updated TIMESTAMP,
  vr_learning_status VARCHAR(50),
  vr_learning_completion DECIMAL(5,2),
  vr_learning_last_updated TIMESTAMP,
  overall_status VARCHAR(50),  -- FORMULA: IF all 'Completed' then 'Completed'
  overall_completion DECIMAL(5,2),  -- FORMULA: AVG(log_plus_completion, vr_learning_completion)
  last_processed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE processed_summary_all (
  id SERIAL PRIMARY KEY,
  directorate VARCHAR(255) UNIQUE,
  total_employees INT,
  log_plus_completed INT,
  log_plus_incompleted INT,
  log_plus_completion_rate DECIMAL(5,2),  -- FORMULA: completed / total * 100
  vr_learning_completed INT,
  vr_learning_incompleted INT,
  vr_learning_completion_rate DECIMAL(5,2),  -- FORMULA: completed / total * 100
  combined_completed INT,
  combined_incompleted INT,
  combined_completion_rate DECIMAL(5,2),  -- FORMULA: (log_plus + vr_learning) / 2 / total * 100
  last_processed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Logging Tables

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  username VARCHAR(100),
  action VARCHAR(100) NOT NULL,  -- 'login', 'logout', 'upload_started', 'upload_completed', 'download'
  resource_type VARCHAR(100),  -- 'file_upload', 'data_export', 'user_management'
  resource_name VARCHAR(255),  -- 'log_plus_vr_2026_01.xlsx', 'Summary All Report'
  details JSONB,  -- { upload_id, rows_processed, file_size, filters_applied, etc }
  status VARCHAR(50),  -- 'success', 'failure', 'in_progress'
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE upload_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  log_plus_filename VARCHAR(255),
  log_plus_rows INT,
  vr_learning_filename VARCHAR(255),
  vr_learning_rows INT,
  processing_status VARCHAR(50),  -- 'pending', 'processing', 'complete', 'error'
  error_message TEXT,
  completed_at TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_upload_history_date ON upload_history(upload_date DESC);
```

### XLSX Export Metadata

```sql
CREATE TABLE export_configs (
  id SERIAL PRIMARY KEY,
  config_name VARCHAR(255) UNIQUE,
  sheets_included TEXT[],  -- ARRAY['summary_all', 'mandatory_2026', 'log_plus', 'vr_learning']
  include_formulas BOOLEAN DEFAULT true,
  include_charts BOOLEAN DEFAULT false,
  formula_definitions JSONB,  -- Store formula templates
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### User Roles

| Role | Permissions |
|------|-------------|
| **admin** | Upload files, delete uploads, manage users, view all logs |
| **uploader** | Upload files, download exports, view own uploads |
| **viewer** | View dashboard, download exports (filter-based) |

### Authentication Flow

```
┌─────────────────────────────────────────────┐
│ 1. User enters username + password           │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│ 2. POST /auth/login (backend validates)      │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│ 3. Generate JWT token + httpOnly cookie      │
│    Set-Cookie: auth_token=<JWT>; HttpOnly  │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│ 4. Store JWT in memory (not localStorage)    │
│    On every API call: Authorization header   │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│ 5. Token refresh on /auth/refresh (24h TTL) │
└─────────────────────────────────────────────┘
```

### Implementation

**Backend Auth Middleware:**

```javascript
// middleware/auth.js
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};
```

**Frontend Auth:**

```javascript
// hooks/useAuth.js
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if token exists (from httpOnly cookie)
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => setUser(data.user))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, []);
  
  return { user, loading };
};

// ProtectedRoute wrapper
export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Spinner />;
  if (!user || (requiredRole && !requiredRole.includes(user.role))) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

---

## 🔌 API ENDPOINTS

### Authentication

```http
POST /api/auth/login
  Content-Type: application/json
  Body: { username, password }
  Response: { token, user: { id, username, role, email } }
  Sets: httpOnly cookie with JWT

POST /api/auth/logout
  Response: { message: 'Logged out' }
  Clears: httpOnly cookie

GET /api/auth/me
  Authorization: Bearer <token>
  Response: { user: {...} }

POST /api/auth/refresh
  Response: { token }
```

### Data Retrieval

```http
GET /api/data/mandatory-2026?page=1&limit=100&directorate=xxx&status=Completed
  Authorization: Bearer <token>
  Response: { 
    data: [...], 
    total: 11414, 
    page: 1, 
    pageSize: 100,
    filters: { applied_directorate, applied_status }
  }

GET /api/data/summary-all
  Authorization: Bearer <token>
  Response: [
    { directorate, total_employees, log_plus_rate, vr_learning_rate, ... },
    ...
  ]

GET /api/data/log-plus?search=employee_id&course=BCM&date_from=2026-01-01
  Authorization: Bearer <token>
  Response: { data: [...], total, pagination }

GET /api/data/vr-learning?region=Jakarta&status=Completed
  Authorization: Bearer <token>
  Response: { data: [...], total, pagination }
```

### File Upload

```http
POST /api/upload
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
  Body:
    log_plus: <file>
    vr_learning: <file>
  Response: { 
    upload_id, 
    status: 'processing', 
    message: 'Files received, processing in background',
    log_plus_rows: 1200,
    vr_learning_rows: 1100
  }
  Logs: audit_logs (action: 'upload_started')

GET /api/upload-history
  Authorization: Bearer <token>
  Response: [
    { 
      id, 
      uploaded_by, 
      upload_date, 
      log_plus_rows, 
      vr_learning_rows,
      processing_status, 
      completed_at 
    },
    ...
  ]
```

### Export

```http
POST /api/export/xlsx
  Authorization: Bearer <token>
  Content-Type: application/json
  Body: {
    sheets: ['summary_all', 'mandatory_2026', 'log_plus', 'vr_learning'],
    include_formulas: true,
    filters: { directorate: 'xxx', status: 'xxx' }
  }
  Response: Binary stream (file download)
  Headers: Content-Disposition: attachment; filename="Report_2026_01_15.xlsx"
  Logs: audit_logs (action: 'download', details: { sheets, file_size, filters })

GET /api/export/status/:exportId
  Response: { status: 'processing'|'ready'|'failed', progress: 0-100 }
```

### Logging & Admin

```http
GET /api/logs/audit?action=upload&user_id=xxx&from=2026-01-01&to=2026-01-31
  Authorization: Bearer <token> (admin only)
  Response: [
    { 
      user_id, 
      username, 
      action, 
      resource_name,
      status, 
      created_at, 
      details: { upload_id, rows_processed } 
    },
    ...
  ]

GET /api/users
  Authorization: Bearer <token> (admin only)
  Response: [{ id, username, email, role, department, created_at }, ...]

POST /api/users
  Authorization: Bearer <token> (admin only)
  Body: { username, email, password, role, full_name, department }
  Response: { id, username, email, role }
  Logs: audit_logs (action: 'user_created')

DELETE /api/users/:userId
  Authorization: Bearer <token> (admin only)
  Response: { message: 'User deleted' }
  Logs: audit_logs (action: 'user_deleted')
```

---

## 💻 FRONTEND COMPONENTS

### Page Structure

```
src/
├── pages/
│   ├── Login.jsx              # /login
│   ├── Dashboard.jsx          # / (protected)
│   ├── Upload.jsx             # /upload (protected)
│   ├── Export.jsx             # /export (protected)
│   └── Admin.jsx              # /admin (protected, admin only)
├── components/
│   ├── Layout/
│   │   ├── Navbar.jsx         # Auth user, logout button
│   │   ├── Sidebar.jsx        # Nav links based on role
│   │   └── ProtectedRoute.jsx
│   ├── Dashboard/
│   │   ├── TabContainer.jsx   # 4 tabs switcher
│   │   ├── SummaryAllTable.jsx
│   │   ├── Mandatory2026Table.jsx
│   │   ├── LogPlusTable.jsx
│   │   └── VRLearningTable.jsx
│   ├── Upload/
│   │   ├── FileDropZone.jsx
│   │   ├── UploadProgress.jsx
│   │   ├── UploadHistory.jsx
│   │   └── ValidationAlert.jsx
│   ├── Export/
│   │   ├── ExportCheckboxes.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── DownloadButton.jsx
│   │   └── ExportStatus.jsx
│   └── Admin/
│       ├── UserManagement.jsx
│       ├── AuditLogViewer.jsx
│       └── SystemHealth.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useDataTable.js        # Query, pagination, filters
│   ├── useFileUpload.js
│   └── useExport.js
├── services/
│   ├── api.js                 # Axios instance with auth
│   ├── auth.js
│   └── storage.js             # JWT token management
└── styles/
    └── tailwind.css
```

### Key Components Detail

**Dashboard Tabs:**
```jsx
// pages/Dashboard.jsx
export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const { user } = useAuth();
  
  return (
    <div className="dashboard">
      <Tabs active={activeTab} onChange={setActiveTab}>
        <Tab name="summary" label="Summary All">
          <SummaryAllTable />
        </Tab>
        <Tab name="mandatory" label="Mandatory 2026">
          <Mandatory2026Table />
        </Tab>
        <Tab name="logplus" label="LOG+">
          <LogPlusTable />
        </Tab>
        <Tab name="vr" label="VR Learning">
          <VRLearningTable />
        </Tab>
      </Tabs>
    </div>
  );
};
```

**Data Table with Filters:**
```jsx
// components/Dashboard/LogPlusTable.jsx
import { useQuery } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel } from '@tanstack/react-table';

export const LogPlusTable = () => {
  const [filters, setFilters] = useState({ search: '', course: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 100 });
  
  const { data, isLoading } = useQuery({
    queryKey: ['log-plus', filters, pagination],
    queryFn: () => api.get('/api/data/log-plus', { params: { ...filters, ...pagination } })
  });
  
  const table = useReactTable({
    data: data?.data || [],
    columns: LOG_PLUS_COLUMNS,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination }
  });
  
  return (
    <div>
      <FilterBar onFiltersChange={setFilters} />
      <TableComponent table={table} />
      <Pagination table={table} />
    </div>
  );
};
```

**Upload Component:**
```jsx
// components/Upload/FileDropZone.jsx
export const FileDropZone = () => {
  const [files, setFiles] = useState({ log_plus: null, vr_learning: null });
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('log_plus', files.log_plus);
    formData.append('vr_learning', files.vr_learning);
    
    try {
      setUploading(true);
      const res = await api.post('/api/upload', formData);
      
      toast.success('Upload started! Processing in background.');
      // Log action
      api.post('/api/logs/audit', {
        action: 'upload_started',
        resource_name: files.log_plus.name,
        upload_id: res.data.upload_id
      });
      
      // Poll for completion
      pollUploadStatus(res.data.upload_id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="dropzone">
      <DropArea onFiles={(f) => setFiles(prev => ({ ...prev, log_plus: f[0] }))} />
      <DropArea onFiles={(f) => setFiles(prev => ({ ...prev, vr_learning: f[0] }))} />
      <button onClick={handleUpload} disabled={!files.log_plus || !files.vr_learning}>
        {uploading ? 'Uploading...' : 'Upload Files'}
      </button>
    </div>
  );
};
```

---

## 📤 FILE UPLOAD & ETL

### Upload Flow with Logging

```javascript
// routes/upload.js
app.post('/api/upload', auth, requireRole(['admin', 'uploader']), 
  upload.fields([
    { name: 'log_plus', maxCount: 1 },
    { name: 'vr_learning', maxCount: 1 }
  ]), 
  async (req, res) => {
    const uploadId = uuid();
    const user = req.user;
    
    try {
      // Log upload start
      await logAudit({
        user_id: user.id,
        action: 'upload_started',
        resource_type: 'file_upload',
        resource_name: `${req.files.log_plus[0].originalname} + ${req.files.vr_learning[0].originalname}`,
        status: 'in_progress',
        details: { upload_id, file_sizes: { ... } },
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      // Queue background job
      await processingQueue.add({
        uploadId,
        userId: user.id,
        logPlusPath: req.files.log_plus[0].path,
        vrLearningPath: req.files.vr_learning[0].path,
        uploadedFilenames: {
          log_plus: req.files.log_plus[0].originalname,
          vr_learning: req.files.vr_learning[0].originalname
        }
      });
      
      res.json({
        upload_id: uploadId,
        status: 'processing',
        message: 'Files received, processing in background'
      });
      
    } catch (err) {
      await logAudit({
        user_id: user.id,
        action: 'upload_started',
        status: 'failure',
        error_message: err.message,
        details: { upload_id }
      });
      res.status(400).json({ error: err.message });
    }
  }
);

// Worker process
processingQueue.process(async (job) => {
  const { uploadId, userId, logPlusPath, vrLearningPath } = job.data;
  
  try {
    // Parse files
    const logPlusWorkbook = XLSX.readFile(logPlusPath);
    const logPlusSheet = logPlusWorkbook.Sheets['LOG+'] || logPlusWorkbook.Sheets[0];
    const logPlusData = XLSX.utils.sheet_to_json(logPlusSheet);
    
    const vrWorkbook = XLSX.readFile(vrLearningPath);
    const vrSheet = vrWorkbook.Sheets['VR Learning'] || vrWorkbook.Sheets[0];
    const vrData = XLSX.utils.sheet_to_json(vrSheet);
    
    // Validate
    validateData(logPlusData, 'log_plus');
    validateData(vrData, 'vr_learning');
    
    // Insert raw data
    await db.query(
      `INSERT INTO raw_log_plus (upload_id, employee_id, employee_name, ...) 
       VALUES ($1, $2, $3, ...) ON CONFLICT DO NOTHING`,
      logPlusData.map(row => [uploadId, row.NIK || row.employee_id, ...])
    );
    
    await db.query(
      `INSERT INTO raw_vr_learning (upload_id, employee_id, ...) 
       VALUES ($1, $2, ...) ON CONFLICT DO NOTHING`,
      vrData.map(row => [uploadId, row.NIK || row.employee_id, ...])
    );
    
    // Run ETL - Calculate Mandatory 2026
    await calculateMandatory2026();
    
    // Run ETL - Calculate Summary All
    await calculateSummaryAll();
    
    // Update upload history
    await db.query(
      `UPDATE upload_history 
       SET processing_status = 'complete', completed_at = NOW()
       WHERE id = $1`,
      [uploadId]
    );
    
    // Log success
    await logAudit({
      user_id: userId,
      action: 'upload_completed',
      resource_type: 'file_upload',
      resource_name: job.data.uploadedFilenames.log_plus,
      status: 'success',
      details: {
        upload_id: uploadId,
        rows_processed: { log_plus: logPlusData.length, vr_learning: vrData.length },
        processing_time_seconds: job.progress() / 100 * 300  // estimate
      }
    });
    
  } catch (err) {
    await logAudit({
      user_id: userId,
      action: 'upload_completed',
      status: 'failure',
      error_message: err.message,
      details: { upload_id: uploadId }
    });
    throw err;
  }
});
```

### ETL Calculations

```javascript
// services/etl.js

async function calculateMandatory2026() {
  const query = `
    INSERT INTO processed_mandatory_2026 
      (employee_id, employee_name, directorate, log_plus_status, log_plus_completion, 
       vr_learning_status, vr_learning_completion, overall_status, overall_completion)
    SELECT 
      COALESCE(lp.employee_id, vr.employee_id),
      COALESCE(lp.employee_name, vr.employee_name),
      COALESCE(lp.directorate, vr.directorate),
      lp.completion_status as log_plus_status,
      lp.completion_percentage as log_plus_completion,
      vr.completion_status as vr_learning_status,
      CAST(SUBSTRING(vr.forward_30_score, 1, 2) AS DECIMAL(5,2)) as vr_learning_completion,
      CASE WHEN lp.completion_status = 'Completed' AND vr.completion_status = 'Completed' 
           THEN 'Completed' ELSE 'Incompleted' END as overall_status,
      ROUND((COALESCE(lp.completion_percentage, 0) + COALESCE(CAST(SUBSTRING(vr.forward_30_score, 1, 2) AS INT), 0)) / 2, 2) as overall_completion
    FROM (
      SELECT DISTINCT ON (employee_id) * FROM raw_log_plus 
      ORDER BY employee_id, completion_date DESC
    ) lp
    FULL OUTER JOIN (
      SELECT DISTINCT ON (employee_id) * FROM raw_vr_learning 
      ORDER BY employee_id, created_at DESC
    ) vr ON lp.employee_id = vr.employee_id
    ON CONFLICT (employee_id) DO UPDATE SET
      log_plus_status = EXCLUDED.log_plus_status,
      log_plus_completion = EXCLUDED.log_plus_completion,
      vr_learning_status = EXCLUDED.vr_learning_status,
      vr_learning_completion = EXCLUDED.vr_learning_completion,
      overall_status = EXCLUDED.overall_status,
      overall_completion = EXCLUDED.overall_completion,
      last_processed = NOW();
  `;
  
  await db.query(query);
}

async function calculateSummaryAll() {
  const query = `
    INSERT INTO processed_summary_all
      (directorate, total_employees, log_plus_completed, log_plus_incompleted, 
       log_plus_completion_rate, vr_learning_completed, vr_learning_incompleted,
       vr_learning_completion_rate, combined_completed, combined_incompleted, combined_completion_rate)
    SELECT 
      directorate,
      COUNT(*) as total_employees,
      SUM(CASE WHEN log_plus_status = 'Completed' THEN 1 ELSE 0 END) as log_plus_completed,
      SUM(CASE WHEN log_plus_status = 'Incompleted' THEN 1 ELSE 0 END) as log_plus_incompleted,
      ROUND(SUM(CASE WHEN log_plus_status = 'Completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as log_plus_completion_rate,
      SUM(CASE WHEN vr_learning_status = 'Completed' THEN 1 ELSE 0 END) as vr_learning_completed,
      SUM(CASE WHEN vr_learning_status = 'Incompleted' THEN 1 ELSE 0 END) as vr_learning_incompleted,
      ROUND(SUM(CASE WHEN vr_learning_status = 'Completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as vr_learning_completion_rate,
      SUM(CASE WHEN overall_status = 'Completed' THEN 1 ELSE 0 END) as combined_completed,
      SUM(CASE WHEN overall_status = 'Incompleted' THEN 1 ELSE 0 END) as combined_incompleted,
      ROUND(SUM(CASE WHEN overall_status = 'Completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as combined_completion_rate
    FROM processed_mandatory_2026
    WHERE directorate IS NOT NULL
    GROUP BY directorate
    ON CONFLICT (directorate) DO UPDATE SET
      total_employees = EXCLUDED.total_employees,
      log_plus_completed = EXCLUDED.log_plus_completed,
      log_plus_completion_rate = EXCLUDED.log_plus_completion_rate,
      vr_learning_completed = EXCLUDED.vr_learning_completed,
      vr_learning_completion_rate = EXCLUDED.vr_learning_completion_rate,
      combined_completion_rate = EXCLUDED.combined_completion_rate,
      last_processed = NOW();
  `;
  
  await db.query(query);
}
```

---

## 📊 EXCEL EXPORT WITH FORMULAS

### XLSX Structure with Formulas & Lookups

```javascript
// services/excelExport.js
import ExcelJS from 'exceljs';

async function generateExportWorkbook(selectedSheets, filters = {}) {
  const workbook = new ExcelJS.Workbook();
  
  // ====== Sheet 1: Summary All (with formulas) ======
  if (selectedSheets.includes('summary_all')) {
    const summarySheet = workbook.addWorksheet('Summary All', { state: 'visible' });
    
    // Headers
    summarySheet.columns = [
      { header: 'Directorate', key: 'directorate', width: 30 },
      { header: 'Total Employees', key: 'total_employees', width: 15 },
      { header: 'LOG+ Completed', key: 'log_plus_completed', width: 15 },
      { header: 'LOG+ Incompleted', key: 'log_plus_incompleted', width: 15 },
      { header: 'LOG+ Completion %', key: 'log_plus_rate', width: 18 },
      { header: 'VR Completed', key: 'vr_completed', width: 15 },
      { header: 'VR Incompleted', key: 'vr_incompleted', width: 15 },
      { header: 'VR Completion %', key: 'vr_rate', width: 18 },
      { header: 'Combined Completion %', key: 'combined_rate', width: 20 }
    ];
    
    // Get data
    const summaryData = await db.query(`SELECT * FROM processed_summary_all ORDER BY directorate`);
    
    // Add rows
    let rowNum = 2;
    summaryData.rows.forEach((row) => {
      summarySheet.addRow({
        directorate: row.directorate,
        total_employees: row.total_employees,
        log_plus_completed: row.log_plus_completed,
        log_plus_incompleted: { formula: `=B${rowNum}-C${rowNum}` },  // FORMULA
        log_plus_rate: { formula: `=C${rowNum}/B${rowNum}*100` },  // FORMULA
        vr_completed: row.vr_learning_completed,
        vr_incompleted: { formula: `=B${rowNum}-F${rowNum}` },  // FORMULA
        vr_rate: { formula: `=F${rowNum}/B${rowNum}*100` },  // FORMULA
        combined_rate: { formula: `=(E${rowNum}+H${rowNum})/2` }  // FORMULA: AVG of both rates
      });
      
      // Conditional formatting
      const cell = summarySheet.getCell(`E${rowNum}`);
      if (cell.value > 80) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };  // Green
        cell.font = { color: { argb: 'FF006100' } };
      } else if (cell.value > 50) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };  // Yellow
        cell.font = { color: { argb: 'FF9C6500' } };
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };  // Red
        cell.font = { color: { argb: 'FF9C0006' } };
      }
      
      rowNum++;
    });
    
    // Freeze panes
    summarySheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  }
  
  // ====== Sheet 2: Mandatory 2026 (with formulas) ======
  if (selectedSheets.includes('mandatory_2026')) {
    const mandatorySheet = workbook.addWorksheet('Mandatory 2026', { state: 'visible' });
    
    mandatorySheet.columns = [
      { header: 'Employee ID', key: 'employee_id', width: 15 },
      { header: 'Employee Name', key: 'employee_name', width: 25 },
      { header: 'Directorate', key: 'directorate', width: 25 },
      { header: 'LOG+ Status', key: 'log_plus_status', width: 15 },
      { header: 'LOG+ %', key: 'log_plus_completion', width: 12 },
      { header: 'VR Status', key: 'vr_learning_status', width: 15 },
      { header: 'VR %', key: 'vr_learning_completion', width: 12 },
      { header: 'Overall Status', key: 'overall_status', width: 15 },
      { header: 'Overall %', key: 'overall_completion', width: 12 }
    ];
    
    const mandatoryData = await db.query(
      `SELECT * FROM processed_mandatory_2026 
       WHERE directorate = COALESCE($1, directorate)
       AND overall_status = COALESCE($2, overall_status)
       ORDER BY employee_name`,
      [filters.directorate || null, filters.status || null]
    );
    
    let rowNum = 2;
    mandatoryData.rows.forEach((row) => {
      mandatorySheet.addRow({
        employee_id: row.employee_id,
        employee_name: row.employee_name,
        directorate: row.directorate,
        log_plus_status: row.log_plus_status,
        log_plus_completion: row.log_plus_completion,
        vr_learning_status: row.vr_learning_status,
        vr_learning_completion: row.vr_learning_completion,
        overall_status: { formula: `=IF(AND(D${rowNum}="Completed",F${rowNum}="Completed"),"Completed","Incompleted")` },  // FORMULA
        overall_completion: { formula: `=(E${rowNum}+G${rowNum})/2` }  // FORMULA: AVG
      });
      rowNum++;
    });
    
    mandatorySheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  }
  
  // ====== Sheet 3: LOG+ (raw data) ======
  if (selectedSheets.includes('log_plus')) {
    const logSheet = workbook.addWorksheet('LOG+', { state: 'visible' });
    
    logSheet.columns = [
      { header: 'Employee ID', key: 'employee_id', width: 15 },
      { header: 'Name', key: 'employee_name', width: 20 },
      { header: 'Directorate', key: 'directorate', width: 25 },
      { header: 'Course', key: 'course_name', width: 30 },
      { header: 'Status', key: 'completion_status', width: 15 },
      { header: 'Completion %', key: 'completion_percentage', width: 15 },
      { header: 'Completed Date', key: 'completion_date', width: 15 },
      { header: 'Score', key: 'score', width: 10 }
    ];
    
    const logData = await db.query(`SELECT * FROM raw_log_plus ORDER BY completion_date DESC LIMIT 5000`);
    logData.rows.forEach((row) => {
      logSheet.addRow(row);
    });
    
    logSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  }
  
  // ====== Sheet 4: VR Learning (raw data) ======
  if (selectedSheets.includes('vr_learning')) {
    const vrSheet = workbook.addWorksheet('VR Learning', { state: 'visible' });
    
    vrSheet.columns = [
      { header: 'Employee ID', key: 'employee_id', width: 15 },
      { header: 'Name', key: 'employee_name', width: 20 },
      { header: 'Directorate', key: 'directorate', width: 25 },
      { header: 'Region', key: 'region', width: 20 },
      { header: 'Branch', key: 'branch', width: 25 },
      { header: 'Forward 30 Score', key: 'forward_30_score', width: 15 },
      { header: 'Status', key: 'completion_status', width: 15 },
      { header: 'Completion Time', key: 'completion_time', width: 15 }
    ];
    
    const vrData = await db.query(`SELECT * FROM raw_vr_learning ORDER BY created_at DESC LIMIT 5000`);
    vrData.rows.forEach((row) => {
      vrSheet.addRow(row);
    });
    
    vrSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  }
  
  return workbook;
}

// Export route
app.get('/api/export/xlsx', auth, async (req, res) => {
  const { sheets, filters } = req.query;
  const user = req.user;
  
  try {
    const workbook = await generateExportWorkbook(
      sheets ? sheets.split(',') : ['summary_all', 'mandatory_2026', 'log_plus', 'vr_learning'],
      filters ? JSON.parse(filters) : {}
    );
    
    // Generate filename
    const now = new Date();
    const filename = `VR_Learning_Report_${now.toISOString().split('T')[0]}_${user.username}.xlsx`;
    
    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    await workbook.xlsx.write(res);
    
    // Log download
    await logAudit({
      user_id: user.id,
      username: user.username,
      action: 'download',
      resource_type: 'data_export',
      resource_name: filename,
      status: 'success',
      details: {
        sheets: sheets ? sheets.split(',') : 'all',
        file_size: res.get('content-length'),
        filters: filters || {}
      }
    });
    
    res.end();
    
  } catch (err) {
    await logAudit({
      user_id: user.id,
      action: 'download',
      status: 'failure',
      error_message: err.message,
      details: { sheets }
    });
    res.status(400).json({ error: err.message });
  }
});
```

---

## 📝 LOGGING SYSTEM

### Audit Log Implementation

```javascript
// services/audit.js
export async function logAudit(logData) {
  const {
    user_id,
    username,
    action,
    resource_type,
    resource_name,
    status,
    error_message,
    details,
    ip_address,
    user_agent
  } = logData;
  
  const query = `
    INSERT INTO audit_logs 
    (user_id, username, action, resource_type, resource_name, status, error_message, details, ip_address, user_agent, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
  `;
  
  await db.query(query, [
    user_id,
    username,
    action,
    resource_type,
    resource_name,
    status,
    error_message,
    JSON.stringify(details),
    ip_address,
    user_agent
  ]);
}

// Winston logger for application logs
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export default logger;
```

### Audit Log Viewer (Admin Panel)

```jsx
// components/Admin/AuditLogViewer.jsx
export const AuditLogViewer = () => {
  const [filters, setFilters] = useState({
    action: '',
    user_id: '',
    from_date: '',
    to_date: '',
    status: ''
  });
  const [page, setPage] = useState(1);
  
  const { data: logs } = useQuery({
    queryKey: ['audit-logs', filters, page],
    queryFn: () => api.get('/api/logs/audit', { params: { ...filters, page } })
  });
  
  return (
    <div className="audit-viewer">
      <h2>Audit Logs</h2>
      
      <FilterPanel onChange={setFilters} />
      
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Status</th>
            <th>Date/Time</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs?.data.map(log => (
            <tr key={log.id}>
              <td>{log.username}</td>
              <td>{log.action}</td>
              <td>{log.resource_name}</td>
              <td className={`status-${log.status}`}>{log.status}</td>
              <td>{new Date(log.created_at).toLocaleString()}</td>
              <td>
                <DetailsButton details={log.details} error={log.error_message} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Pagination current={page} total={logs?.total_pages} onChange={setPage} />
    </div>
  );
};
```

---

## 🐳 DOCKER SETUP

### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: vr_learning
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: vr_learning_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - '5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U vr_learning']
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: development
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: vr_learning
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: vr_learning_db
      JWT_SECRET: ${JWT_SECRET}
      REDIS_URL: redis://redis:6379
      LOG_LEVEL: debug
    ports:
      - '5000:5000'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - '3000:3000'
    environment:
      VITE_API_URL: http://localhost:5000
      VITE_ENV: development
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  adminer:
    image: adminer
    ports:
      - '8080:8080'
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Build (if TypeScript)
RUN npm run build || true

# Create uploads directory
RUN mkdir -p uploads logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 5000

CMD ["npm", "start"]
```

### Frontend Dockerfile (Development)

```dockerfile
# frontend/Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

### Environment Files

```bash
# .env.example
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=vr_learning
DB_PASSWORD=your_secure_password_here
DB_NAME=vr_learning_db

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Redis
REDIS_URL=redis://redis:6379

# Application
NODE_ENV=development
VITE_API_URL=http://localhost:5000
LOG_LEVEL=info

# File Upload
MAX_FILE_SIZE=50000000
UPLOAD_DIR=/app/uploads
```

---

## 🚀 DEPLOYMENT GUIDE

### Recommended Infrastructure

**Option 1: VPS + Docker (Simple)**
- DigitalOcean App Platform or Linode
- Docker Compose for orchestration
- Let's Encrypt for SSL
- GitHub Actions for CI/CD

**Option 2: Kubernetes (Scalable)**
- GKE, EKS, or DigitalOcean K8s
- Helm charts for deployment
- Ingress for routing
- Persistent volumes for DB

### Deployment Steps (VPS)

```bash
# 1. SSH into server
ssh user@server_ip

# 2. Clone repo
git clone <repo> /opt/vr-learning-app
cd /opt/vr-learning-app

# 3. Setup environment
cp .env.production .env
# Edit .env with production secrets

# 4. Start services
docker-compose -f docker-compose.prod.yml up -d

# 5. Run migrations
docker-compose exec backend npm run migrate

# 6. Create admin user
docker-compose exec backend npm run seed:admin-user

# 7. Setup nginx reverse proxy
sudo cp nginx.conf /etc/nginx/sites-available/vr-learning
sudo ln -s /etc/nginx/sites-available/vr-learning /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# 8. Setup SSL (Let's Encrypt)
sudo certbot certonly --webroot -w /var/www/html -d yourdomain.com

# 9. Verify running
docker-compose ps
curl https://yourdomain.com/api/health
```

### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: vr_learning_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/backup.sh:/usr/local/bin/backup.sh
    ports:
      - '5432:5432'

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - '5000:5000'
    depends_on:
      - postgres
      - redis

  frontend:
    image: node:18-alpine AS build
    working_dir: /app
    copy: ["./frontend", "."]
    run: npm ci && npm run build
    ---
    image: nginx:alpine
    restart: always
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./frontend/dist:/usr/share/nginx/html
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - backend

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

### Nginx Configuration

```nginx
# nginx.prod.conf
upstream backend {
  server backend:5000;
}

server {
  listen 80;
  server_name yourdomain.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  client_max_body_size 100M;

  # Frontend
  location / {
    root /usr/share/nginx/html;
    try_files $uri /index.html;
  }

  # API proxy
  location /api/ {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cookie_secure on;
    proxy_cookie_httponly on;
  }
}
```

---

## ✅ TESTING STRATEGY

### Unit Tests

```javascript
// __tests__/etl.test.js
import { calculateMandatory2026, calculateSummaryAll } from '../services/etl';

describe('ETL Pipeline', () => {
  test('calculateMandatory2026 should aggregate LOG+ and VR data', async () => {
    const result = await calculateMandatory2026();
    expect(result).toHaveProperty('rowsAffected');
    expect(result.rowsAffected).toBeGreaterThan(0);
  });

  test('calculateSummaryAll should compute completion rates', async () => {
    const result = await calculateSummaryAll();
    expect(result).toHaveProperty('directorates');
    expect(result.directorates[0]).toHaveProperty('completion_rate');
  });
});
```

### Integration Tests

```javascript
// __tests__/api.integration.test.js
import request from 'supertest';
import app from '../app';

describe('API Integration', () => {
  let authToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });
    authToken = res.body.token;
  });

  test('POST /api/upload should process files and return upload_id', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('log_plus', './test/fixtures/sample_log_plus.xlsx')
      .attach('vr_learning', './test/fixtures/sample_vr.xlsx');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('upload_id');
    expect(res.body.status).toBe('processing');
  });

  test('GET /api/data/mandatory-2026 should return paginated data', async () => {
    const res = await request(app)
      .get('/api/data/mandatory-2026?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.length).toBeLessThanOrEqual(10);
  });

  test('GET /api/export/xlsx should return workbook with formulas', async () => {
    const res = await request(app)
      .get('/api/export/xlsx?sheets=summary_all,mandatory_2026')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/spreadsheet/);
  });
});
```

### E2E Tests (Cypress)

```javascript
// cypress/e2e/workflow.cy.js
describe('Complete User Workflow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should login, upload files, and download report', () => {
    // Login
    cy.get('input[name="username"]').type('admin@cimb.local');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Upload files
    cy.visit('/upload');
    cy.get('[data-testid="dropzone"]').selectFile('cypress/fixtures/log_plus.xlsx', { force: true });
    cy.get('[data-testid="dropzone"]').selectFile('cypress/fixtures/vr_learning.xlsx', { force: true });
    cy.get('button:contains("Upload Files")').click();
    cy.contains('Upload started').should('be.visible');

    // Wait for processing
    cy.wait(3000);

    // Export
    cy.visit('/export');
    cy.get('input[value="summary_all"]').check();
    cy.get('input[value="mandatory_2026"]').check();
    cy.get('button:contains("Download XLSX")').click();

    // Verify download
    cy.readFile('cypress/downloads/VR_Learning_Report_*.xlsx').should('exist');
  });
});
```

---

## 📌 KEY FILES STRUCTURE

```
vr-learning-analytics/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Express app setup
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── constants.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── data.js
│   │   │   ├── upload.js
│   │   │   └── export.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── logger.js
│   │   ├── services/
│   │   │   ├── etl.js
│   │   │   ├── excelExport.js
│   │   │   ├── audit.js
│   │   │   └── userService.js
│   │   ├── jobs/
│   │   │   └── uploadProcessor.js    # Bull queue worker
│   │   └── migrations/
│   │       ├── 001_init_schema.js
│   │       ├── 002_add_audit_logs.js
│   │       └── 003_add_indexes.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── Export.jsx
│   │   │   └── Admin.jsx
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   ├── Dashboard/
│   │   │   ├── Upload/
│   │   │   ├── Export/
│   │   │   └── Admin/
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useDataTable.js
│   │   │   └── useExport.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile.dev
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
├── scripts/
│   ├── init.sql                      # Database initialization
│   ├── seed-users.sql                # Create test users
│   └── backup.sh                     # DB backup script
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── nginx.prod.conf
├── plan.md                           # This file
├── README.md
├── .gitignore
└── .env.example
```

---

## 🎯 SUMMARY: WHY DOCKER FOR SERVER DEPLOYMENT

### ✅ YES, Docker is Highly Recommended

**Benefits:**
1. **Consistency**: Dev env = Production env (no "it works on my machine")
2. **Scalability**: Easy horizontal scaling with K8s or Docker Compose
3. **Isolation**: Database, app, cache run in separate containers
4. **Versioning**: Every build is immutable, easy rollback
5. **CI/CD**: Automated builds & deployments via GitHub Actions
6. **Monitoring**: Use Prometheus + Grafana for observability

**Deployment Path:**
```
Local Dev (docker-compose up -d)
    ↓
GitHub Actions (auto-build on push)
    ↓
Docker Registry (store images)
    ↓
VPS/K8s (pull & run images)
    ↓
Production (with SSL, monitoring, backups)
```

---

## 🚀 NEXT STEPS

1. **Setup local environment**: `docker-compose up -d`
2. **Create initial admin user**: `npm run seed:admin-user`
3. **Run migrations**: `npm run migrate`
4. **Start development**: `npm run dev`
5. **Test login**: admin@cimb.local / password123
6. **Upload sample files** and verify ETL
7. **Export & verify formulas** in XLSX
8. **Check audit logs**

---

**Questions? Use this plan as your prompt for vibe coding with any AI assistant or team member.**

**Estimated Timeline:**
- Phase 1 (MVP): 2 weeks
- Phase 2 (Polish): 1 week
- Phase 3 (Deploy): 3-5 days
- **Total: ~1 month to production**

---

*Generated for CIMB Niaga VR Learning Analytics | January 2026*
