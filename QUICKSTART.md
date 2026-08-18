# CMND Analytics - Quick Start Guide

**Get up and running in 5 minutes**

---

## ⚡ 5-MINUTE SETUP

### 1️⃣ Clone Repository

```bash
git clone https://github.com/agungNCC/cmnd-analytics.git
cd cmnd-analytics
```

### 2️⃣ Setup Environment

```bash
cp .env.example .env
# Default values are fine for local development
```

### 3️⃣ Start Services

```bash
docker-compose up -d

# Wait ~30 seconds for services to be healthy
docker-compose ps
```

### 4️⃣ Initialize Database

```bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed:users
```

### 5️⃣ Access Application

| Application | URL | Purpose |
|-------------|-----|---------|
| **Frontend** | http://localhost:3000 | React app |
| **Backend API** | http://localhost:5000 | REST API |
| **Database Admin** | http://localhost:8080 | Adminer (SQL client) |
| **Redis Admin** | http://localhost:8081 | Redis Commander |

---

## 🔓 DEFAULT LOGIN CREDENTIALS

```
Role      | Email                | Password
──────────┼──────────────────────┼──────────
Admin     | admin@cimb.local     | password123
Uploader  | uploader@cimb.local  | password123
Viewer    | viewer@cimb.local    | password123
```

---

## 🧪 VERIFY EVERYTHING WORKS

```bash
# Check all services are running
docker-compose ps
# Expected: All green ✓

# Test backend health
curl http://localhost:5000/health
# Expected: {"status":"ok"}

# Test database connection
docker-compose exec postgres psql -U vr_learning -d vr_learning_db -c "SELECT 1;"
# Expected: 1 (single row)

# View logs
docker-compose logs -f
# Press Ctrl+C to exit
```

---

## 📝 COMMON COMMANDS

### Start/Stop

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild images
docker-compose build --no-cache
```

### Development

```bash
# Backend only (hot reload)
docker-compose exec backend npm run dev

# Frontend only (hot reload)
docker-compose exec frontend npm run dev

# Both in separate terminals (recommended)
# Terminal 1: docker-compose exec backend npm run dev
# Terminal 2: docker-compose exec frontend npm run dev
```

### Database

```bash
# Connect to database
docker-compose exec postgres psql -U vr_learning -d vr_learning_db

# Backup database
docker-compose exec postgres pg_dump -U vr_learning vr_learning_db > backup.sql

# Reset database
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend npm run migrate
```

### File Upload Test

```bash
# Generate sample files
docker-compose exec backend npm run generate:samples

# Upload via API
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "log_plus=@sample_log_plus.xlsx" \
  -F "vr_learning=@sample_vr_learning.xlsx"
```

---

## 🐛 TROUBLESHOOTING

### Services won't start?

```bash
# Full reset
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs
```

### Port already in use?

```bash
# Find what's using the port
lsof -i :3000  # Frontend
lsof -i :5000  # Backend
lsof -i :5432  # Database

# Kill the process (if needed)
kill -9 <PID>
```

### Database connection error?

```bash
# Check PostgreSQL is healthy
docker-compose logs postgres

# Reset database
docker-compose exec postgres dropdb -U vr_learning -f vr_learning_db
docker-compose exec postgres createdb -U vr_learning vr_learning_db
docker-compose exec backend npm run migrate
```

### Memory issues?

```bash
# Clean up Docker
docker system prune -a

# Check resource usage
docker stats
```

---

## 📂 PROJECT STRUCTURE

```
cmnd-analytics/
├── backend/          # Node.js/Express
├── frontend/         # React/Vite
├── scripts/          # Utility scripts
├── docker-compose.yml     # Local dev setup
├── plan.md           # Comprehensive development plan
├── README.md         # Full documentation
└── DEPLOYMENT.md     # Production deployment guide
```

---

## 🚀 NEXT STEPS

1. **Explore Dashboard**: Navigate to http://localhost:3000
2. **Read plan.md**: Understand the architecture: `cat plan.md | less`
3. **Test Upload**: Try uploading sample XLSX files
4. **Check Logs**: `docker-compose logs -f backend`
5. **Run Tests**: `docker-compose exec backend npm test`

---

## 📚 DOCUMENTATION

| Document | Purpose |
|----------|---------|
| **README.md** | Full overview & setup |
| **plan.md** | Architecture & specifications |
| **DEPLOYMENT.md** | Production deployment guide |
| **QUICKSTART.md** | This file - quick reference |

---

## 🆘 NEED HELP?

```bash
# Check backend logs
docker-compose logs backend -f --tail=50

# Check frontend logs
docker-compose logs frontend -f --tail=50

# Check database logs
docker-compose logs postgres -f --tail=50

# Full system logs
docker-compose logs --tail=100

# Check container health
docker-compose ps
docker stats
```

---

**That's it!** 🎉 You're ready to develop.

For production deployment, see **DEPLOYMENT.md**.  
For detailed architecture, see **plan.md**.
