# Quick Reference: Workflow Logging System

## 📂 Directory Structure

```
splunk_upgrade/
├── .github/workflows/
│   └── splunk-upgrade.yml          # Updated with logging
├── dashboard/
│   ├── index.html                  # Dashboard UI
│   ├── dashboard.css               # Styling
│   ├── dashboard.js                # Functionality
│   └── README.md                   # Documentation
├── logs/
│   └── run_*.json                  # Auto-generated logs
└── scripts/
    └── log_helper.sh               # Logging utilities
```

## 🔑 Key Components

### 1. Log Helper Functions

```bash
# Source the helper
source scripts/log_helper.sh

# Initialize log
init_log "RUN_ID" "Workflow Name" '{"key":"value"}'

# Update job
update_job_status "RUN_ID" "job_name" "status" '{"outputs":"..."}'

# Track server
update_server_status "RUN_ID" "server" "ip" "status" "step" "output"

# Add error
add_error "RUN_ID" "error message" "context"

# Finalize
finalize_log "RUN_ID" "final_status"
```

### 2. Workflow Jobs

| Job | Purpose | Logging Actions |
|-----|---------|----------------|
| `init_logging` | Create log file | Generate run ID, initialize JSON |
| `prepare` | Parse inventory | Update job status, log outputs |
| `upgrade` | Upgrade servers | Track each server step-by-step |
| `summary` | Finalize workflow | Calculate summary, commit logs |

### 3. Log Structure

```json
{
  "run_id": "run_20251204_155300",
  "status": "success|failure|in_progress",
  "inputs": { /* workflow parameters */ },
  "jobs": { /* job execution details */ },
  "summary": {
    "total_servers": 1,
    "successful": 1,
    "failed": 0,
    "duration_seconds": 1350
  }
}
```

### 4. Dashboard Features

| Feature | Description | Shortcut |
|---------|-------------|----------|
| Search | Filter logs | Type in search box |
| Filter | Status-based | Click filter buttons |
| Details | Full run info | Click "View Details" |
| Theme | Dark/Light | Click theme toggle |
| Refresh | Reload logs | Click refresh button |

## 🎨 Status Colors

| Status | Color | Hex | Icon |
|--------|-------|-----|------|
| Success | Green | #10b981 | ✅ |
| Failure | Red | #ef4444 | ❌ |
| In Progress | Yellow | #f59e0b | ⏳ |
| Running | Blue | #3b82f6 | ▶️ |

## 🚀 Quick Start

### View Dashboard Locally
```bash
cd dashboard
python3 -m http.server 8000
# Open http://localhost:8000
```

### Test Workflow
1. Go to Actions tab in GitHub
2. Click "Splunk Upgrade"
3. Click "Run workflow"
4. Select inputs and run
5. After completion, check `logs/` for new JSON file
6. Refresh dashboard to see the run

## 📊 Log File Naming

Format: `run_YYYYMMDD_HHMMSS.json`

Example: `run_20251204_155300.json`
- Date: 2025-12-04
- Time: 15:53:00 UTC

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| No logs appearing | Check `logs/` directory exists and contains .json files |
| Dashboard won't load | Run local server, don't open HTML directly |
| Logs not committing | Verify GitHub Actions has write permissions |
| Search not working | Clear browser cache and reload |
| Theme not saving | Check browser allows localStorage |

## 📝 Common Queries

### Find Failed Runs
```bash
cd logs
jq -r 'select(.status == "failure") | .run_id' *.json
```

### Get Summary Stats
```bash
jq -r '.summary' logs/run_20251204_155300.json
```

### List All Servers in a Run
```bash
jq -r '.jobs.upgrade.servers[].name' logs/run_20251204_155300.json
```

### Count Total Runs
```bash
ls -1 logs/run_*.json | wc -l
```

## 🎯 Best Practices

1. **Regular Cleanup**: Archive old logs to keep repository size manageable
2. **Monitor Disk Space**: JSON logs can accumulate over time
3. **Error Review**: Check error sections after failed runs
4. **Pattern Analysis**: Use dashboard filters to identify trends
5. **Documentation**: Keep server names and IPs consistent

## 🔗 Related Files

- Workflow: [.github/workflows/splunk-upgrade.yml](file:///Users/asimakram/Desktop/Asim/Splunk%20Projects/WK/splunk_upgrade/.github/workflows/splunk-upgrade.yml)
- Dashboard: [dashboard/index.html](file:///Users/asimakram/Desktop/Asim/Splunk%20Projects/WK/splunk_upgrade/dashboard/index.html)
- Helper: [scripts/log_helper.sh](file:///Users/asimakram/Desktop/Asim/Splunk%20Projects/WK/splunk_upgrade/scripts/log_helper.sh)
- Sample Log: [logs/run_20251204_155300_sample.json](file:///Users/asimakram/Desktop/Asim/Splunk%20Projects/WK/splunk_upgrade/logs/run_20251204_155300_sample.json)
- Full Docs: [dashboard/README.md](file:///Users/asimakram/Desktop/Asim/Splunk%20Projects/WK/splunk_upgrade/dashboard/README.md)

## 💡 Tips

- Use dark theme for extended viewing sessions
- Export logs to CSV for spreadsheet analysis (can add this feature)
- Set up alerts for failed runs using GitHub Actions notifications
- Consider log rotation for production environments
- Customize CSS variables for company branding
