#!/bin/bash

# Workflow Logging Helper Script
# Provides functions to create and update structured JSON logs for workflow runs

# Color codes for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize a new log file for a workflow run
# Usage: init_log <run_id> <workflow_name> <inputs_json>
init_log() {
    local run_id="$1"
    local workflow_name="$2"
    local inputs_json="$3"
    local log_file="dashboard/logs/${run_id}.json"
    
    echo -e "${BLUE}📝 Initializing log file: ${log_file}${NC}"
    
    # Create logs directory if it doesn't exist
    mkdir -p dashboard/logs
    
    # Create initial log structure
    cat > "$log_file" <<EOF
{
  "run_id": "${run_id}",
  "workflow_name": "${workflow_name}",
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "completed_at": null,
  "status": "in_progress",
  "inputs": ${inputs_json},
  "jobs": {},
  "summary": {
    "total_servers": 0,
    "successful": 0,
    "failed": 0,
    "duration_seconds": 0
  },
  "errors": []
}
EOF
    
    echo -e "${GREEN}✅ Log file initialized successfully${NC}"
}

# Update job status in the log file
# Usage: update_job_status <run_id> <job_name> <status> [output_json]
update_job_status() {
    local run_id="$1"
    local job_name="$2"
    local status="$3"
    local output_json="${4:-{}}"
    local log_file="dashboard/logs/${run_id}.json"
    
    if [ ! -f "$log_file" ]; then
        echo -e "${RED}❌ Log file not found: ${log_file}${NC}"
        return 1
    fi
    
    local timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    # Use jq to update the log file
    # Redirect to tmp file first, then move if successful
    if jq --arg job "$job_name" \
       --arg status "$status" \
       --arg timestamp "$timestamp" \
       --argjson output "$output_json" \
       '
       .jobs[$job] = {
         "status": $status,
         "started_at": (if .jobs[$job].started_at then .jobs[$job].started_at else $timestamp end),
         "completed_at": (if $status == "success" or $status == "failure" then $timestamp else null end),
         "outputs": $output,
         "logs": (if .jobs[$job].logs then .jobs[$job].logs else [] end)
       }
       ' "$log_file" > "${log_file}.tmp"; then
       mv "${log_file}.tmp" "$log_file"
       echo -e "${BLUE}📊 Updated job '${job_name}' status: ${status}${NC}"
    else
       echo -e "${RED}❌ Failed to update job status (jq error)${NC}"
       rm -f "${log_file}.tmp"
       return 1
    fi
}

# Add a log entry to a specific job
# Usage: add_job_log <run_id> <job_name> <log_message>
add_job_log() {
    local run_id="$1"
    local job_name="$2"
    local log_message="$3"
    local log_file="dashboard/logs/${run_id}.json"
    
    if [ ! -f "$log_file" ]; then
        echo -e "${RED}❌ Log file not found: ${log_file}${NC}"
        return 1
    fi
    
    local timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    jq --arg job "$job_name" \
       --arg message "$log_message" \
       --arg timestamp "$timestamp" \
       '
       .jobs[$job].logs += [{
         "timestamp": $timestamp,
         "message": $message
       }]
       ' "$log_file" > "${log_file}.tmp" && mv "${log_file}.tmp" "$log_file"
}

# Update server upgrade status within the upgrade job
# Usage: update_server_status <run_id> <server_name> <server_ip> <status> <step_name> <step_output>
update_server_status() {
    local run_id="$1"
    local server_name="$2"
    local server_ip="$3"
    local status="$4"
    local step_name="$5"
    local step_output="$6"
    local log_file="dashboard/logs/${run_id}.json"
    
    if [ ! -f "$log_file" ]; then
        echo -e "${RED}❌ Log file not found: ${log_file}${NC}"
        return 1
    fi
    
    local timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    # Escape special characters in output
    step_output=$(echo "$step_output" | jq -Rs .)
    
    jq --arg server "$server_name" \
       --arg ip "$server_ip" \
       --arg status "$status" \
       --arg step "$step_name" \
       --argjson output "$step_output" \
       --arg timestamp "$timestamp" \
       '
       if .jobs.upgrade.servers then
         .jobs.upgrade.servers |= map(
           if .name == $server then
             . + {
               "status": $status,
               "completed_at": (if $status == "success" or $status == "failure" then $timestamp else .completed_at end),
               "steps": (.steps + [{
                 "name": $step,
                 "status": $status,
                 "timestamp": $timestamp,
                 "output": $output
               }])
             }
           else
             .
           end
         )
       else
         .jobs.upgrade.servers = [{
           "name": $server,
           "ip": $ip,
           "status": $status,
           "started_at": $timestamp,
           "completed_at": (if $status == "success" or $status == "failure" then $timestamp else null end),
           "steps": [{
             "name": $step,
             "status": $status,
             "timestamp": $timestamp,
             "output": $output
           }]
         }]
       end
       ' "$log_file" > "${log_file}.tmp" && mv "${log_file}.tmp" "$log_file"
    
    echo -e "${BLUE}🖥️  Updated server '${server_name}' - Step: ${step_name} - Status: ${status}${NC}"
}

# Finalize the log file with completion status and summary
# Usage: finalize_log <run_id> <final_status>
finalize_log() {
    local run_id="$1"
    local final_status="$2"
    local log_file="dashboard/logs/${run_id}.json"
    
    if [ ! -f "$log_file" ]; then
        echo -e "${RED}❌ Log file not found: ${log_file}${NC}"
        return 1
    fi
    
    local timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    jq --arg status "$final_status" \
       --arg timestamp "$timestamp" \
       '
       .completed_at = $timestamp |
       .status = $status |
       .summary.total_servers = (if .jobs.upgrade.servers then (.jobs.upgrade.servers | length) else 0 end) |
       .summary.successful = (if .jobs.upgrade.servers then ([.jobs.upgrade.servers[] | select(.status == "success")] | length) else 0 end) |
       .summary.failed = (if .jobs.upgrade.servers then ([.jobs.upgrade.servers[] | select(.status == "failure")] | length) else 0 end) |
       .summary.duration_seconds = (
         if .started_at and .completed_at then
           ((.completed_at | fromdateiso8601) - (.started_at | fromdateiso8601))
         else
           0
         end
       )
       ' "$log_file" > "${log_file}.tmp" && mv "${log_file}.tmp" "$log_file"
    
    echo -e "${GREEN}🎉 Log finalized with status: ${final_status}${NC}"
    echo -e "${GREEN}📁 Log saved to: ${log_file}${NC}"
}

# Add an error to the log
# Usage: add_error <run_id> <error_message> <error_context>
add_error() {
    local run_id="$1"
    local error_message="$2"
    local error_context="$3"
    local log_file="dashboard/logs/${run_id}.json"
    
    if [ ! -f "$log_file" ]; then
        echo -e "${RED}❌ Log file not found: ${log_file}${NC}"
        return 1
    fi
    
    local timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    jq --arg message "$error_message" \
       --arg context "$error_context" \
       --arg timestamp "$timestamp" \
       '
       .errors += [{
         "timestamp": $timestamp,
         "message": $message,
         "context": $context
       }]
       ' "$log_file" > "${log_file}.tmp" && mv "${log_file}.tmp" "$log_file"
    
    echo -e "${RED}❌ Error logged: ${error_message}${NC}"
}

# Export functions for use in other scripts
export -f init_log
export -f update_job_status
export -f add_job_log
export -f update_server_status
export -f finalize_log
export -f add_error
