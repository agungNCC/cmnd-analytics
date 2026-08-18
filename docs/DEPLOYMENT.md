# CMND Analytics - Deployment Guide

**Production deployment to VPS/Cloud server with SSL, monitoring, and backups**

---

## 📋 TABLE OF CONTENTS

1. [Server Requirements](#server-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Initial Server Setup](#initial-server-setup)
4. [Deploy with Docker](#deploy-with-docker)
5. [SSL/TLS Certificate Setup](#ssltls-certificate-setup)
6. [Monitoring & Logging](#monitoring--logging)
7. [Database Backups](#database-backups)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedure](#rollback-procedure)

---

## 🖥️ SERVER REQUIREMENTS

### Hardware (Recommended)

```
VPS Tier         | CPU    | RAM   | Storage | Monthly Cost
───────────────────────────────────────────────────────────
Small (MVP)      | 2core  | 2GB   | 40GB    | $12-20
Medium (Growth)  | 4core  | 4GB   | 80GB    | $25-40
Large (Scale)    | 8core  | 8GB   | 160GB   | $60-100
```

### Software

```
OS:              Ubuntu 20.04 LTS or Ubuntu 22.04 LTS
Docker:          20.10+
Docker Compose:  2.0+
Git:             2.35+
```

### Providers

- **DigitalOcean** (Recommended for beginners) → $12/month
- **Linode** → $12/month
- **AWS EC2** → Variable, ~$15/month
- **Vultr** → $6/month (budget option)
- **Hetzner** → €5/month (EU)

---

## ☑️ PRE-DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All code pushed to GitHub (`main` branch)
- [ ] Environment variables set in `.env.production`
- [ ] Database migrations tested locally
- [ ] All tests passing (`npm test`)
- [ ] Security audit completed
- [ ] API rate limiting configured
- [ ] CORS properly set
- [ ] JWT secret changed (not default)
- [ ] Database password is strong
- [ ] Backup strategy decided
- [ ] Monitoring plan in place
- [ ] Domain name registered & DNS configured
- [ ] SSL certificate requirements confirmed

---

## 🚀 INITIAL SERVER SETUP

### Step 1: SSH into Server

```bash
# Replace with your server IP
ssh root@your.server.ip

# (Or with specific key)
ssh -i ~/.ssh/id_rsa root@your.server.ip
```

### Step 2: Update System

```bash
apt-get update
apt-get upgrade -y
apt-get install -y curl git wget htop
```

### Step 3: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 4: Configure Firewall

```bash
# Enable UFW firewall
ufw enable

# Allow SSH (important!)
ufw allow 22/tcp

# Allow HTTP & HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# (Optional) Allow PostgreSQL only from specific IP
ufw allow from 10.0.0.0/8 to any port 5432

# Verify
ufw status
```

### Step 5: Create Application Directory

```bash
# Create user for the app (security best practice)
useradd -m -s /bin/bash cmnd

# Create app directory
mkdir -p /opt/cmnd-analytics
cd /opt/cmnd-analytics

# Set permissions
chown -R cmnd:cmnd /opt/cmnd-analytics
chmod -R 755 /opt/cmnd-analytics
```

### Step 6: Clone Repository

```bash
# As cmnd user
su - cmnd
cd /opt/cmnd-analytics

# Clone repository
git clone https://github.com/agungNCC/cmnd-analytics.git .

# Or use SSH key (if configured)
git clone git@github.com:agungNCC/cmnd-analytics.git .
```

---

## 🐳 DEPLOY WITH DOCKER

### Step 1: Prepare Environment

```bash
cd /opt/cmnd-analytics

# Copy and customize environment file
cp .env.example .env

# Edit with production values
nano .env
# Set:
# - NODE_ENV=production
# - JWT_SECRET=<strong-random-string>
# - DB_PASSWORD=<strong-random-password>
# - API_URL=https://yourdomain.com
# - CORS_ORIGIN=https://yourdomain.com
```

### Step 2: Build Docker Images

```bash
# Build images
docker-compose build --no-cache

# Or pull pre-built images from Docker Hub
# docker pull yourusername/cmnd-analytics-backend:latest
# docker pull yourusername/cmnd-analytics-frontend:latest
```

### Step 3: Start Services

```bash
# Start all services in background
docker-compose -f docker-compose.prod.yml up -d

# Wait ~30 seconds for services to be healthy
sleep 30

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 4: Initialize Database

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed initial data (optional)
docker-compose exec backend npm run seed

# Create admin user
docker-compose exec backend npm run seed:admin
```

### Step 5: Verify Services

```bash
# Check if backend is responding
curl http://localhost:5000/health

# Check PostgreSQL
docker-compose exec postgres psql -U vr_learning -d vr_learning_db -c "SELECT version();"

# Check Redis
docker-compose exec redis redis-cli PING

# Check logs for errors
docker-compose logs --tail=20 backend
docker-compose logs --tail=20 postgres
```

---

## 🔐 SSL/TLS CERTIFICATE SETUP

### Using Let's Encrypt with Certbot

#### Step 1: Install Certbot

```bash
# Install certbot
apt-get install -y certbot python3-certbot-nginx

# (For manual renewal without nginx integration)
apt-get install -y certbot
```

#### Step 2: Generate Certificate

```bash
# Stop nginx if running
docker-compose stop frontend

# Generate certificate (standalone mode)
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# This creates certs in: /etc/letsencrypt/live/yourdomain.com/

# Or if you have nginx already running:
certbot certonly --webroot -w /var/www/html -d yourdomain.com -d www.yourdomain.com
```

#### Step 3: Configure Nginx

```bash
# Update nginx.conf with your domain
nano nginx.conf

# Replace "yourdomain.com" with your actual domain:
# - ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
# - ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
# - server_name yourdomain.com;
```

#### Step 4: Restart Frontend

```bash
# Restart frontend with new certificate
docker-compose up -d frontend

# Test SSL
curl -I https://yourdomain.com
```

#### Step 5: Auto-Renewal (Important!)

```bash
# Setup cron job for automatic renewal
echo "0 3 * * * certbot renew --quiet --post-hook 'docker-compose -f /opt/cmnd-analytics/docker-compose.prod.yml restart frontend'" | crontab -

# Verify cron
crontab -l
```

---

## 📊 MONITORING & LOGGING

### Application Health Checks

```bash
# Create monitoring script
cat > /opt/cmnd-analytics/scripts/health-check.sh << 'EOF'
#!/bin/bash

# Check backend health
if ! curl -s http://localhost:5000/health > /dev/null; then
  echo "ERROR: Backend is down" | mail -s "CMND Analytics Alert" admin@example.com
  docker-compose restart backend
fi

# Check database
if ! docker-compose exec postgres pg_isready -U vr_learning &>/dev/null; then
  echo "ERROR: Database is down" | mail -s "CMND Analytics Alert" admin@example.com
  docker-compose restart postgres
fi

# Check Redis
if ! docker-compose exec redis redis-cli ping &>/dev/null; then
  echo "ERROR: Redis is down" | mail -s "CMND Analytics Alert" admin@example.com
  docker-compose restart redis
fi

# Check disk space
disk_usage=$(df /opt/cmnd-analytics | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $disk_usage -gt 90 ]; then
  echo "WARNING: Disk usage is ${disk_usage}%" | mail -s "CMND Analytics Alert" admin@example.com
fi

echo "Health check completed at $(date)" >> /opt/cmnd-analytics/logs/health-check.log
EOF

chmod +x /opt/cmnd-analytics/scripts/health-check.sh

# Setup cron job to run every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/cmnd-analytics/scripts/health-check.sh") | crontab -
```

### View Logs

```bash
# Backend logs
docker-compose logs -f backend --tail=50

# Database logs
docker-compose logs -f postgres --tail=50

# Nginx logs
docker-compose logs -f frontend --tail=50

# All logs
docker-compose logs -f --tail=100

# Save logs to file
docker-compose logs > /tmp/cmnd-logs-$(date +%Y%m%d).log
```

### Setup Email Alerts

```bash
# Edit .env
nano .env

# Add:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@cimb.local
```

---

## 💾 DATABASE BACKUPS

### Manual Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U vr_learning vr_learning_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip backup_*.sql

# List backups
ls -lh backup_*.sql.gz
```

### Automated Daily Backups

```bash
# Create backup script
cat > /opt/cmnd-analytics/scripts/backup-db.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/cmnd-analytics/backups"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$BACKUP_DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
cd /opt/cmnd-analytics
docker-compose exec -T postgres pg_dump -U vr_learning vr_learning_db | gzip > $BACKUP_FILE

# Log backup
echo "Backup created: $BACKUP_FILE ($(du -h $BACKUP_FILE | cut -f1))" >> $BACKUP_DIR/backup.log

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Alert if backup failed
if [ ! -f $BACKUP_FILE ]; then
  echo "ERROR: Backup failed!" | mail -s "CMND Backup Failed" admin@cimb.local
fi
EOF

chmod +x /opt/cmnd-analytics/scripts/backup-db.sh

# Setup cron job for daily backup at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/cmnd-analytics/scripts/backup-db.sh") | crontab -

# Verify cron
crontab -l
```

### Backup to Cloud Storage (S3)

```bash
# Install AWS CLI
apt-get install -y awscli

# Configure AWS credentials
aws configure

# Create backup script with S3 upload
cat > /opt/cmnd-analytics/scripts/backup-to-s3.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/cmnd-analytics/backups"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$BACKUP_DATE.sql.gz"

# Create local backup
cd /opt/cmnd-analytics
docker-compose exec -T postgres pg_dump -U vr_learning vr_learning_db | gzip > $BACKUP_DIR/$BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_DIR/$BACKUP_FILE s3://your-bucket/cmnd-backups/$BACKUP_FILE

# Delete old local backups (keep 7 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup uploaded to S3: $BACKUP_FILE" >> $BACKUP_DIR/backup.log
EOF

chmod +x /opt/cmnd-analytics/scripts/backup-to-s3.sh

# Setup daily S3 backup at 3 AM
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/cmnd-analytics/scripts/backup-to-s3.sh") | crontab -
```

### Restore from Backup

```bash
# List available backups
ls -lh /opt/cmnd-analytics/backups/

# Restore specific backup
docker-compose down
gunzip < /opt/cmnd-analytics/backups/backup_20240115_020000.sql.gz | \
  docker-compose exec -T postgres psql -U vr_learning -d vr_learning_db
docker-compose up -d
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Test Website

```bash
# Test HTTP redirect to HTTPS
curl -I http://yourdomain.com
# Should return: HTTP/1.1 301 (redirect to https)

# Test HTTPS
curl -I https://yourdomain.com
# Should return: HTTP/1.1 200 OK

# Test API
curl https://yourdomain.com/api/data/summary-all \
  -H "Authorization: Bearer <token>"

# Test login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@cimb.local","password":"password123"}'
```

### Security Checks

```bash
# Check SSL configuration
openssl s_client -connect yourdomain.com:443 -tls1_2

# SSL Labs test
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com

# HTTPS Observatory
# Visit: https://observatory.mozilla.org/analyze/yourdomain.com

# Check security headers
curl -I https://yourdomain.com | grep -E "Strict-Transport|X-Content-Type|X-Frame"
```

### Performance Test

```bash
# Install Apache Bench
apt-get install -y apache2-utils

# Run load test
ab -n 1000 -c 10 https://yourdomain.com/

# Expected results:
# - Requests per second: > 50
# - Time per request: < 200ms
# - Failed requests: 0
```

---

## 🔧 TROUBLESHOOTING

### Services not starting?

```bash
# Check Docker status
systemctl status docker

# Check logs
docker-compose logs

# Restart all services
docker-compose down
docker-compose up -d

# Check individual service
docker logs cmnd-backend-prod
```

### Database connection error?

```bash
# Check PostgreSQL
docker-compose logs postgres

# Test connection
docker-compose exec postgres \
  psql -U vr_learning -d vr_learning_db -c "SELECT 1"

# Reset database
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend npm run migrate
```

### Port already in use?

```bash
# Find process using port
lsof -i :5000
lsof -i :3000
lsof -i :5432

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Out of disk space?

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes

# Clean old logs
find /opt/cmnd-analytics/logs -type f -mtime +30 -delete

# Compress backups
gzip /opt/cmnd-analytics/backups/*.sql 2>/dev/null || true
```

### SSL certificate not renewing?

```bash
# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -noout -dates

# Manual renewal
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal

# Check cron log
grep CRON /var/log/syslog | grep certbot
```

---

## 🔄 ROLLBACK PROCEDURE

### Rollback to Previous Version

```bash
# Check Docker image versions
docker image ls cmnd-analytics-*

# Tag current version as backup
docker tag cmnd-analytics-backend:latest cmnd-analytics-backend:backup-20240115
docker tag cmnd-analytics-frontend:latest cmnd-analytics-frontend:backup-20240115

# Pull previous version
docker pull cmnd-analytics-backend:1.0.0
docker tag cmnd-analytics-backend:1.0.0 cmnd-analytics-backend:latest

# Restart with previous version
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs backend
```

### Rollback Database

```bash
# If migrations caused issues, restore from backup
docker-compose down
gunzip < /opt/cmnd-analytics/backups/backup_<timestamp>.sql.gz | \
  docker-compose exec -T postgres psql -U vr_learning -d vr_learning_db

# Restart
docker-compose up -d

# Verify
docker-compose logs postgres
```

---

## 📞 SUPPORT CONTACTS

- **Server Provider Support**: Check your hosting provider dashboard
- **Docker Issues**: https://docs.docker.com
- **GitHub Issues**: https://github.com/agungNCC/cmnd-analytics/issues
- **Security Issues**: security@yourdomain.com

---

## 📝 DEPLOYMENT CHECKLIST (FINAL)

- [ ] Server SSH access working
- [ ] Firewall configured (UFW enabled)
- [ ] Docker & Docker Compose installed
- [ ] Repository cloned
- [ ] `.env.production` configured with strong secrets
- [ ] Services started and healthy
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Domain pointing to server IP
- [ ] SSL certificate installed
- [ ] HTTPS working & HTTP redirects
- [ ] Backup script configured & tested
- [ ] Monitoring script configured
- [ ] Health checks working
- [ ] Load test passed
- [ ] Team notified of deployment
- [ ] Rollback plan documented

---

**Deployment Guide for CMND Analytics**  
*Last Updated: January 2026*
