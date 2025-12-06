// Dashboard JavaScript - Handles fetching, displaying, and interacting with workflow logs

let allLogs = [];
let filteredLogs = [];
let currentFilter = 'all';

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    loadWorkflowLogs();
});

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadWorkflowLogs();
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    });

    // Search input
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterLogs(e.target.value);
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            filterLogs(document.getElementById('searchInput').value);
        });
    });

    // Close modal on outside click
    document.getElementById('detailsModal').addEventListener('click', (e) => {
        if (e.target.id === 'detailsModal') {
            closeModal();
        }
    });
}

// Initialize dashboard with saved preferences
function initializeDashboard() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
}

// Load workflow logs directly from the logs folder
// Dynamically fetches logs-index.json to discover available log files
async function loadWorkflowLogs() {
    showLoading(true);

    try {
        console.log('🔍 Loading workflow logs...');

        // Fetch the logs index file to get the list of available log files
        let logFiles = [];
        try {
            const indexResponse = await fetch('logs/logs-index.json');
            if (indexResponse.ok) {
                const indexData = await indexResponse.json();
                logFiles = indexData.files || [];
                console.log(`📋 Found ${logFiles.length} log files in index`);
            } else {
                console.warn('⚠️ logs-index.json not found, falling back to empty list');
            }
        } catch (error) {
            console.error('❌ Error fetching logs index:', error);
        }

        // Fetch all logs directly
        const logPromises = logFiles.map(async (filename) => {
            try {
                const response = await fetch(`logs/${filename}`);
                if (response.ok) {
                    const logData = await response.json();
                    console.log(`✅ Loaded: ${filename}`);
                    return logData;
                }
                return null;
            } catch (error) {
                console.error(`❌ Error loading ${filename}:`, error);
                return null;
            }
        });

        const logs = await Promise.all(logPromises);
        allLogs = logs.filter(log => log !== null);

        console.log(`📊 Successfully loaded ${allLogs.length} workflow runs`);

        // Sort by started_at (most recent first)
        allLogs.sort((a, b) => {
            const dateA = new Date(a.started_at);
            const dateB = new Date(b.started_at);
            return dateB - dateA;
        });

        updateStats();
        filterLogs('');

    } catch (error) {
        console.error('❌ Error loading workflow logs:', error);
        console.log('📭 No logs found - showing sample data');
        showSampleData();
    } finally {
        showLoading(false);
    }
}

// Update statistics cards
function updateStats() {
    const total = allLogs.length;
    const successful = allLogs.filter(log => log.status === 'success').length;
    const failed = allLogs.filter(log => log.status === 'failure').length;
    const inProgress = allLogs.filter(log => log.status === 'in_progress').length;

    document.getElementById('totalRuns').textContent = total;
    document.getElementById('successfulRuns').textContent = successful;
    document.getElementById('failedRuns').textContent = failed;
    document.getElementById('inProgressRuns').textContent = inProgress;
}

// Filter logs based on search query and status filter
function filterLogs(searchQuery) {
    const query = searchQuery.toLowerCase();

    filteredLogs = allLogs.filter(log => {
        // Status filter
        if (currentFilter !== 'all' && log.status !== currentFilter) {
            return false;
        }

        // Search filter
        if (query) {
            const searchableText = `
                ${log.run_id}
                ${log.inputs?.package_id || ''}
                ${log.inputs?.server_name || ''}
                ${log.inputs?.host_class || ''}
            `.toLowerCase();

            if (!searchableText.includes(query)) {
                return false;
            }
        }

        return true;
    });

    renderWorkflowTable();
}

// Render workflow runs table
function renderWorkflowTable() {
    const tbody = document.getElementById('workflowTableBody');
    const noResults = document.getElementById('noResults');

    if (filteredLogs.length === 0) {
        tbody.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    tbody.innerHTML = filteredLogs.map(log => {
        const serverCount = log.summary?.total_servers || 0;
        const duration = formatDuration(log.summary?.duration_seconds || 0);
        const startedAt = formatDateTime(log.started_at);

        return `
            <tr>
                <td>
                    <code style="background: var(--bg-tertiary); padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem;">
                        ${log.run_id}
                    </code>
                </td>
                <td>${startedAt}</td>
                <td>
                    <span class="status-badge ${log.status}">
                        ${getStatusIcon(log.status)} ${formatStatus(log.status)}
                    </span>
                </td>
                <td>${log.inputs?.target_mode || 'N/A'}</td>
                <td>${log.inputs?.package_id || 'N/A'}</td>
                <td>
                    <span style="font-weight: 600;">
                        ${serverCount} server${serverCount !== 1 ? 's' : ''}
                    </span>
                    ${log.summary?.successful ? `<span style="color: var(--success-color); margin-left: 0.5rem;">✓ ${log.summary.successful}</span>` : ''}
                    ${log.summary?.failed ? `<span style="color: var(--error-color); margin-left: 0.5rem;">✗ ${log.summary.failed}</span>` : ''}
                </td>
                <td>${duration}</td>
                <td>
                    <button class="action-btn" onclick='viewDetails(${JSON.stringify(log.run_id)})'>
                        View Details
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// View detailed information for a workflow run
function viewDetails(runId) {
    const log = allLogs.find(l => l.run_id === runId);
    if (!log) return;

    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="detail-section">
            <h3>📋 Run Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Run ID</label>
                    <div class="value"><code>${log.run_id}</code></div>
                </div>
                <div class="detail-item">
                    <label>Status</label>
                    <div class="value">
                        <span class="status-badge ${log.status}">
                            ${getStatusIcon(log.status)} ${formatStatus(log.status)}
                        </span>
                    </div>
                </div>
                <div class="detail-item">
                    <label>Started At</label>
                    <div class="value">${formatDateTime(log.started_at)}</div>
                </div>
                <div class="detail-item">
                    <label>Completed At</label>
                    <div class="value">${log.completed_at ? formatDateTime(log.completed_at) : 'In Progress'}</div>
                </div>
                <div class="detail-item">
                    <label>Duration</label>
                    <div class="value">${formatDuration(log.summary?.duration_seconds || 0)}</div>
                </div>
                <div class="detail-item">
                    <label>Target Mode</label>
                    <div class="value">${log.inputs?.target_mode || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <label>Host Class</label>
                    <div class="value">${log.inputs?.host_class || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <label>Package ID</label>
                    <div class="value">${log.inputs?.package_id || 'N/A'}</div>
                </div>
            </div>
        </div>
        
        ${renderJobDetails(log)}
        ${renderServerDetails(log)}
        ${renderErrors(log)}
    `;

    document.getElementById('detailsModal').classList.add('active');
}

// Render job details section
function renderJobDetails(log) {
    if (!log.jobs || Object.keys(log.jobs).length === 0) {
        return '';
    }

    let html = '<div class="detail-section"><h3>⚙️ Jobs</h3>';

    for (const [jobName, jobData] of Object.entries(log.jobs)) {
        if (jobName === 'upgrade') continue; // Handle separately

        html += `
            <div class="server-card">
                <div class="server-header">
                    <span class="server-name">${jobName}</span>
                    <span class="status-badge ${jobData.status}">
                        ${getStatusIcon(jobData.status)} ${formatStatus(jobData.status)}
                    </span>
                </div>
                ${jobData.logs && jobData.logs.length > 0 ? `
                    <div class="step-timeline">
                        ${jobData.logs.map(logEntry => `
                            <div class="step-item">
                                <strong>${formatDateTime(logEntry.timestamp)}</strong><br>
                                ${logEntry.message}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    html += '</div>';
    return html;
}

// Render server upgrade details
function renderServerDetails(log) {
    const servers = log.jobs?.upgrade?.servers;
    if (!servers || servers.length === 0) {
        return '';
    }

    let html = '<div class="detail-section"><h3>🖥️ Server Upgrades</h3>';

    servers.forEach(server => {
        html += `
            <div class="server-card">
                <div class="server-header">
                    <div>
                        <span class="server-name">${server.name}</span>
                        <div style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">
                            IP: ${server.ip}
                        </div>
                    </div>
                    <span class="status-badge ${server.status}">
                        ${getStatusIcon(server.status)} ${formatStatus(server.status)}
                    </span>
                </div>
                
                ${server.steps && server.steps.length > 0 ? `
                    <div class="step-timeline">
                        ${server.steps.map(step => `
                            <div class="step-item ${step.status}">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                    <strong>${step.name}</strong>
                                    <span class="status-badge ${step.status}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                                        ${getStatusIcon(step.status)}
                                    </span>
                                </div>
                                <div style="color: var(--text-secondary); font-size: 0.875rem;">
                                    ${formatDateTime(step.timestamp)}
                                </div>
                                ${step.output ? `
                                    <details style="margin-top: 0.5rem;">
                                        <summary style="cursor: pointer; color: var(--primary-color);">View Output</summary>
                                        <pre style="background: var(--bg-primary); padding: 0.5rem; border-radius: 0.25rem; margin-top: 0.5rem; overflow-x: auto; font-size: 0.75rem;">${escapeHtml(step.output)}</pre>
                                    </details>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// Render errors section
function renderErrors(log) {
    if (!log.errors || log.errors.length === 0) {
        return '';
    }

    let html = '<div class="detail-section"><h3>❌ Errors</h3>';

    log.errors.forEach(error => {
        html += `
            <div class="server-card" style="border-left: 4px solid var(--error-color);">
                <div style="margin-bottom: 0.5rem;">
                    <strong style="color: var(--error-color);">${error.message}</strong>
                </div>
                <div style="color: var(--text-secondary); font-size: 0.875rem;">
                    ${formatDateTime(error.timestamp)}
                </div>
                ${error.context ? `
                    <div style="margin-top: 0.5rem; padding: 0.5rem; background: var(--bg-primary); border-radius: 0.25rem;">
                        ${error.context}
                    </div>
                ` : ''}
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// Close modal
function closeModal() {
    document.getElementById('detailsModal').classList.remove('active');
}

// Show/hide loading indicator
function showLoading(show) {
    const loading = document.getElementById('loadingIndicator');
    const noResults = document.getElementById('noResults');
    const tbody = document.getElementById('workflowTableBody');

    if (show) {
        loading.style.display = 'block';
        noResults.style.display = 'none';
        tbody.innerHTML = '';
    } else {
        loading.style.display = 'none';
    }
}

// Show sample data for testing (when no logs directory is accessible)
function showSampleData() {
    allLogs = [
        {
            run_id: "run_20251204_152300",
            workflow_name: "Splunk Upgrade",
            started_at: "2025-12-04T15:23:00Z",
            completed_at: "2025-12-04T15:45:30Z",
            status: "success",
            inputs: {
                target_mode: "single_server",
                host_class: "azure_hf",
                server_name: "azure_hf_1",
                package_id: "splunk_enterprise_9.3.2"
            },
            jobs: {
                prepare: {
                    status: "success",
                    started_at: "2025-12-04T15:23:00Z",
                    completed_at: "2025-12-04T15:23:45Z"
                }
            },
            summary: {
                total_servers: 1,
                successful: 1,
                failed: 0,
                duration_seconds: 1350
            }
        }
    ];

    updateStats();
    filterLogs('');
}

// Utility Functions

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatDuration(seconds) {
    if (!seconds || seconds === 0) return 'N/A';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

function formatStatus(status) {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getStatusIcon(status) {
    const icons = {
        success: '✅',
        failure: '❌',
        in_progress: '⏳',
        running: '▶️'
    };
    return icons[status] || '❓';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-refresh every 30 seconds if there are in-progress runs
setInterval(() => {
    const hasInProgress = allLogs.some(log => log.status === 'in_progress');
    if (hasInProgress) {
        loadWorkflowLogs();
    }
}, 30000);
