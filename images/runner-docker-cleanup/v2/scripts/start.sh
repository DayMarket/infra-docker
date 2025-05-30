#!/bin/bash

# Load the crontab file

crontab crontab.cleanup
echo "Starting cron..."

# Start cron
# crond -b -l 8
crond -f
