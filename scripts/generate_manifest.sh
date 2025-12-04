#!/bin/bash

# Generate manifest file for dashboard to consume
# This script creates a JSON file listing all available log files

LOGS_DIR="logs"
MANIFEST_FILE="dashboard/logs-manifest.json"

echo "📝 Generating logs manifest..."

# Create JSON array of log files
echo "[" > "$MANIFEST_FILE"

# Find all JSON files in logs directory (excluding the manifest itself)
first=true
for logfile in "$LOGS_DIR"/*.json; do
    if [ -f "$logfile" ]; then
        filename=$(basename "$logfile")
        
        # Add comma for all but first entry
        if [ "$first" = true ]; then
            first=false
        else
            echo "," >> "$MANIFEST_FILE"
        fi
        
        # Add filename to manifest
        echo -n "  \"$filename\"" >> "$MANIFEST_FILE"
    fi
done

echo "" >> "$MANIFEST_FILE"
echo "]" >> "$MANIFEST_FILE"

echo "✅ Manifest generated: $MANIFEST_FILE"

# Count log files
log_count=$(ls -1 "$LOGS_DIR"/*.json 2>/dev/null | wc -l)
echo "📊 Total log files: $log_count"
