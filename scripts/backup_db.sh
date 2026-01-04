#!/bin/bash

# Configuration
# Replace these with your actual database details
DB_NAME="event_solution_db"
DB_USER="postgres"
BACKUP_DIR="/home/your_user/backups" # Change this to your desired backup path
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="$BACKUP_DIR/$DB_NAME-$DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform Backup
# We use pg_dump to export the database and pipe it to gzip for compression
echo "Starting backup for $DB_NAME..."
PGPASSWORD="your_db_password" pg_dump -U "$DB_USER" -h "localhost" "$DB_NAME" | gzip > "$FILENAME"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup successfully created: $FILENAME"
  
  # Optional: Delete backups older than 7 days to save space
  find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -delete
  
  # Sync to Google Drive (Requires rclone setup)
  # Replace 'gdrive:backups' with your actual rclone remote and folder
  # echo "Syncing to Google Drive..."
  # rclone copy "$FILENAME" gdrive:backups
else
  echo "Backup failed!"
  exit 1
fi
