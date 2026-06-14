#!/bin/bash
# Creamy Chills - Health Monitor
# Add to crontab: */5 * * * * /home/bitnami/app/server/scripts/health-check.sh

URL="http://localhost:3001/api/health"
LOG_FILE="/home/bitnami/app/server/logs/health.log"
mkdir -p /home/bitnami/app/server/logs

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL --max-time 10)
DATE=$(date '+%Y-%m-%d %H:%M:%S')

if [ "$RESPONSE" != "200" ]; then
  echo "[$DATE] ALERT: Server DOWN (HTTP $RESPONSE)" >> $LOG_FILE
  
  # Attempt restart via PM2
  export PATH=/opt/bitnami/node/bin:$PATH
  pm2 restart creamychills 2>/dev/null
  
  echo "[$DATE] Auto-restart attempted" >> $LOG_FILE
else
  # Only log every hour to keep file small
  MINUTE=$(date +%M)
  if [ "$MINUTE" == "00" ]; then
    echo "[$DATE] OK" >> $LOG_FILE
  fi
fi

# Keep log file under 1MB
if [ -f $LOG_FILE ] && [ $(wc -c < $LOG_FILE) -gt 1048576 ]; then
  tail -100 $LOG_FILE > ${LOG_FILE}.tmp
  mv ${LOG_FILE}.tmp $LOG_FILE
fi
