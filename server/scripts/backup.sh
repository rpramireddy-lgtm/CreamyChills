#!/bin/bash
# Creamy Chills - Daily MongoDB Backup
# Add to crontab: 0 3 * * * /home/bitnami/app/server/scripts/backup.sh

BACKUP_DIR="/home/bitnami/backups"
DB_NAME="creamychills"
DATE=$(date +%Y-%m-%d_%H%M)
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR

echo "[$DATE] Starting backup..."

# Dump database
mongodump --db $DB_NAME --out $BACKUP_DIR/$DATE 2>/dev/null

if [ $? -eq 0 ]; then
  # Compress
  cd $BACKUP_DIR
  tar -czf "${DATE}.tar.gz" $DATE
  rm -rf $DATE
  
  echo "[$DATE] Backup created: ${BACKUP_DIR}/${DATE}.tar.gz"
  
  # Remove old backups
  find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
  echo "[$DATE] Old backups cleaned (keeping ${RETENTION_DAYS} days)"
else
  echo "[$DATE] ERROR: Backup failed!"
  exit 1
fi
