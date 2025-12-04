# Splunk Upgrade Dashboard

A modern, responsive dashboard for monitoring and tracking Splunk upgrade workflow executions.

## 📋 Overview

This dashboard provides real-time visualization of your GitHub Actions workflow runs for Splunk upgrades. It displays comprehensive logging data including:

- **Workflow Run Status**: Success, failure, or in-progress states
- **Server-Level Details**: Individual server upgrade progress and results
- **Step-by-Step Tracking**: Detailed logs for each upgrade step
- **Statistics**: Aggregate metrics across all workflow runs
- **Search & Filter**: Easy navigation through historical runs

## 🚀 Features

### Dashboard Components

1. **Stats Cards**
   - Total workflow runs
   - Successful upgrades
   - Failed upgrades
   - In-progress operations

2. **Workflow Runs Table**
   - Run ID with timestamp
   - Status badges (color-coded)
   - Target mode and package information
   - Server count with success/failure breakdown
   - Duration tracking

3. **Detailed Run View**
   - Complete run information
   - Job execution timeline
   - Server-by-server upgrade progress
   - Step outputs and verification results
   - Error tracking and diagnostics

4. **Interactive Features**
   - Live search across all fields
   - Status-based filtering
   - Auto-refresh for in-progress runs
   - Dark/Light theme toggle
   - Collapsible step outputs

## 📁 File Structure

```
dashboard/
├── index.html          # Main dashboard page
├── dashboard.css       # Styling and themes
└── dashboard.js        # Data fetching and rendering logic

logs/
└── run_*.json          # Workflow run logs (auto-generated)

scripts/
└── log_helper.sh       # Logging utility functions
```

## 🎨 Log Format

Logs are stored as JSON files in the `logs/` directory with the naming convention `run_YYYYMMDD_HHMMSS.json`.

### Structure

```json
{
  "run_id": "unique-run-identifier",
  "workflow_name": "Splunk Upgrade",
  "started_at": "ISO-8601-timestamp",
  "completed_at": "ISO-8601-timestamp",
  "status": "success|failure|in_progress",
  "inputs": {
    "target_mode": "single_server|all_servers_in_class",
    "host_class": "azure_hf|azure_uf",
    "server_name": "server-name",
    "package_id": "package-identifier"
  },
  "jobs": {
    "prepare": {
      "status": "success|failure|running",
      "started_at": "timestamp",
      "completed_at": "timestamp",
      "outputs": { /* job outputs */ },
      "logs": [ /* log entries */ ]
    },
    "upgrade": {
      "servers": [
        {
          "name": "server-name",
          "ip": "server-ip",
          "status": "success|failure|running",
          "started_at": "timestamp",
          "completed_at": "timestamp",
          "steps": [
            {
              "name": "step-name",
              "status": "success|failure|running",
              "timestamp": "timestamp",
              "output": "step output"
            }
          ]
        }
      ]
    }
  },
  "summary": {
    "total_servers": 0,
    "successful": 0,
    "failed": 0,
    "duration_seconds": 0
  },
  "errors": [
    {
      "timestamp": "timestamp",
      "message": "error message",
      "context": "error context"
    }
  ]
}
```

## 🔧 Usage

### Viewing the Dashboard

1. **Local Development**:
   ```bash
   cd dashboard
   python3 -m http.server 8000
   # Open http://localhost:8000 in your browser
   ```

2. **GitHub Pages**:
   - The dashboard is automatically deployed to GitHub Pages
   - Access at: `https://<username>.github.io/<repository>/dashboard/`

### Understanding the Dashboard

#### Stats Overview
- Shows aggregate statistics across all workflow runs
- Updates automatically when new logs are loaded

#### Workflow Runs Table
- Click "View Details" on any run to see comprehensive information
- Use the search box to filter by run ID, package, or server name
- Use filter buttons to show only specific statuses

#### Detailed View Modal
- **Run Information**: Basic metadata about the workflow run
- **Jobs**: Status and logs for each job in the workflow
- **Server Upgrades**: Detailed timeline for each server
- **Errors**: Any errors encountered during execution

### Theme Toggle
Click the "Toggle Theme" button to switch between dark and light modes. Your preference is saved automatically.

### Auto-Refresh
The dashboard automatically refreshes every 30 seconds when there are in-progress workflows.

## 🛠️ Logging System

### Workflow Integration

The GitHub Actions workflow automatically:
1. Initializes a log file at workflow start
2. Updates the log as each step completes
3. Tracks server-level progress
4. Captures step outputs and errors
5. Finalizes the log with summary statistics
6. Commits logs to the repository

### Log Helper Functions

The `scripts/log_helper.sh` provides these functions:

- `init_log`: Initialize a new log file
- `update_job_status`: Update job execution status
- `add_job_log`: Add log entries to a job
- `update_server_status`: Track server upgrade progress
- `add_error`: Record errors
- `finalize_log`: Complete the log with summary

### Example Usage

```bash
# Source the helper
source scripts/log_helper.sh

# Initialize log
init_log "run_20251204_155300" "Splunk Upgrade" '{"target_mode":"single_server"}'

# Update job status
update_job_status "run_20251204_155300" "prepare" "running"

# Update server status
update_server_status "run_20251204_155300" "azure_hf_1" "10.0.0.5" "success" "Upgrade verified" "Version 9.3.2"

# Finalize
finalize_log "run_20251204_155300" "success"
```

## 🎯 Benefits

1. **Complete Visibility**: Track every step of your upgrade process
2. **Historical Analysis**: Review past upgrades to identify patterns
3. **Quick Debugging**: Detailed error logs for troubleshooting
4. **Compliance**: Audit trail of all upgrade activities
5. **Accessibility**: User-friendly interface for non-technical stakeholders

## 🚦 Status Indicators

- 🟢 **Success**: Upgrade completed without errors
- 🔴 **Failure**: Upgrade encountered errors
- 🟡 **In Progress**: Upgrade currently running
- ⚪ **Running**: Individual step in progress

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🔐 Security Notes

- Logs may contain sensitive information (IPs, server names)
- Ensure proper repository access controls
- Consider using private repositories for production environments
- Review logs before sharing externally

## 🐛 Troubleshooting

### Dashboard shows "No workflow runs found"
- Ensure logs directory contains JSON files
- Check that log files follow the naming convention
- Verify JSON format is valid

### Logs not updating
- Check GitHub Actions workflow status
- Verify the workflow has permissions to commit
- Check for errors in the summary job

### Theme not saving
- Ensure browser allows localStorage
- Clear browser cache and try again

## 📝 License

This dashboard is part of the Splunk Upgrade Workflow project.
