#!/bin/bash
# backup-db.sh — Backup PostgreSQL database
# Jadwalkan via cron: 0 2 * * * /path/to/scripts/backup-db.sh

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-/backups}"
CONTAINER="${DB_CONTAINER:-cmnd-postgres}"
DB_USER="${DB_USER:-vr_learning}"
DB_NAME="${DB_NAME:-vr_learning_db}"
FILENAME="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup: $FILENAME"
docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$FILENAME"
gzip "$FILENAME"
echo "[$(date)] Backup complete: ${FILENAME}.gz"

# Hapus backup lebih dari 30 hari
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
echo "[$(date)] Old backups cleaned"
