import type { UpgradePhase, WorkflowLog, PhaseStatus } from '../types';


// Define the five-phase workflow
export const createInitialPhases = (): UpgradePhase[] => [
    {
        id: 'preparation',
        name: 'Preparation',
        status: 'pending',
        progress: 0,
        estimatedDuration: 5,
        tasks: [
            {
                id: 'prep-1',
                title: 'Validate inventory configuration',
                status: 'pending',
                required: true,
            },
            {
                id: 'prep-2',
                title: 'Download Splunk installer package',
                status: 'pending',
                required: true,
            },
            {
                id: 'prep-3',
                title: 'Verify package integrity',
                status: 'pending',
                required: true,
            },
            {
                id: 'prep-4',
                title: 'Setup SSH connectivity',
                status: 'pending',
                required: true,
            },
            {
                id: 'prep-5',
                title: 'Run pre-upgrade health check',
                status: 'pending',
                required: true,
            },
        ],
    },
    {
        id: 'cluster-manager',
        name: 'Cluster Manager',
        status: 'pending',
        progress: 0,
        estimatedDuration: 15,
        tasks: [
            {
                id: 'cm-1',
                title: 'Stop Cluster Manager service',
                status: 'pending',
                required: true,
            },
            {
                id: 'cm-2',
                title: 'Backup current configuration',
                status: 'pending',
                required: true,
            },
            {
                id: 'cm-3',
                title: 'Extract and install new version',
                status: 'pending',
                required: true,
            },
            {
                id: 'cm-4',
                title: 'Migrate configuration files',
                status: 'pending',
                required: true,
            },
            {
                id: 'cm-5',
                title: 'Start Cluster Manager service',
                status: 'pending',
                required: true,
            },
            {
                id: 'cm-6',
                title: 'Verify cluster health',
                status: 'pending',
                required: true,
            },
        ],
    },
    {
        id: 'search-heads',
        name: 'Search Heads',
        status: 'pending',
        progress: 0,
        estimatedDuration: 20,
        tasks: [
            {
                id: 'sh-1',
                title: 'Put search heads in detention',
                status: 'pending',
                required: true,
            },
            {
                id: 'sh-2',
                title: 'Stop search head services',
                status: 'pending',
                required: true,
            },
            {
                id: 'sh-3',
                title: 'Backup search head configurations',
                status: 'pending',
                required: true,
            },
            {
                id: 'sh-4',
                title: 'Install upgraded version',
                status: 'pending',
                required: true,
            },
            {
                id: 'sh-5',
                title: 'Start search head services',
                status: 'pending',
                required: true,
            },
            {
                id: 'sh-6',
                title: 'Remove from detention',
                status: 'pending',
                required: true,
            },
            {
                id: 'sh-7',
                title: 'Verify search functionality',
                status: 'pending',
                required: true,
            },
        ],
    },
    {
        id: 'indexers',
        name: 'Indexers',
        status: 'pending',
        progress: 0,
        estimatedDuration: 30,
        tasks: [
            {
                id: 'idx-1',
                title: 'Put indexers offline (rolling)',
                status: 'pending',
                required: true,
            },
            {
                id: 'idx-2',
                title: 'Stop indexer services',
                status: 'pending',
                required: true,
            },
            {
                id: 'idx-3',
                title: 'Backup indexer configurations',
                status: 'pending',
                required: true,
            },
            {
                id: 'idx-4',
                title: 'Install upgraded version',
                status: 'pending',
                required: true,
            },
            {
                id: 'idx-5',
                title: 'Start indexer services',
                status: 'pending',
                required: true,
            },
            {
                id: 'idx-6',
                title: 'Bring indexers online',
                status: 'pending',
                required: true,
            },
            {
                id: 'idx-7',
                title: 'Verify indexing functionality',
                status: 'pending',
                required: true,
            },
            {
                id: 'idx-8',
                title: 'Check replication factor',
                status: 'pending',
                required: true,
            },
        ],
    },
    {
        id: 'validation',
        name: 'Validation',
        status: 'pending',
        progress: 0,
        estimatedDuration: 10,
        tasks: [
            {
                id: 'val-1',
                title: 'Verify all services are running',
                status: 'pending',
                required: true,
            },
            {
                id: 'val-2',
                title: 'Check cluster status',
                status: 'pending',
                required: true,
            },
            {
                id: 'val-3',
                title: 'Run post-upgrade health check',
                status: 'pending',
                required: true,
            },
            {
                id: 'val-4',
                title: 'Verify data flow',
                status: 'pending',
                required: true,
            },
            {
                id: 'val-5',
                title: 'Test search functionality',
                status: 'pending',
                required: true,
            },
            {
                id: 'val-6',
                title: 'Generate upgrade report',
                status: 'pending',
                required: true,
            },
        ],
    },
];

// Calculate overall progress across all phases
export const calculateOverallProgress = (phases: UpgradePhase[]): number => {
    if (phases.length === 0) return 0;

    const totalProgress = phases.reduce((sum, phase) => sum + phase.progress, 0);
    return Math.round(totalProgress / phases.length);
};

// Update phase based on workflow status
export const updatePhaseFromWorkflow = (
    phase: UpgradePhase,
    jobStatus: string,
    jobConclusion: string | null
): UpgradePhase => {
    let status: PhaseStatus = phase.status;
    let progress = phase.progress;

    if (jobStatus === 'queued') {
        status = 'pending';
        progress = 0;
    } else if (jobStatus === 'in_progress') {
        status = 'in-progress';
        progress = 50;
    } else if (jobStatus === 'completed') {
        if (jobConclusion === 'success') {
            status = 'completed';
            progress = 100;
        } else if (jobConclusion === 'failure') {
            status = 'failed';
            progress = phase.progress;
        }
    }

    return {
        ...phase,
        status,
        progress,
    };
};

// Parse workflow logs into structured log entries
export const parseWorkflowLogs = (rawLogs: string): WorkflowLog[] => {
    const logs: WorkflowLog[] = [];
    const lines = rawLogs.split('\n');

    lines.forEach((line) => {
        if (!line.trim()) return;

        // Try to extract timestamp and level
        const timestampMatch = line.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        const timestamp = timestampMatch ? new Date(timestampMatch[0]) : new Date();

        let level: WorkflowLog['level'] = 'info';
        if (line.includes('ERROR') || line.includes('❌')) {
            level = 'error';
        } else if (line.includes('WARNING') || line.includes('⚠️')) {
            level = 'warning';
        } else if (line.includes('SUCCESS') || line.includes('✅')) {
            level = 'success';
        }

        // Extract phase information if present
        let phase: string | undefined;
        const phaseMatch = line.match(/\[(preparation|cluster-manager|search-heads|indexers|validation)\]/i);
        if (phaseMatch) {
            phase = phaseMatch[1].toLowerCase();
        }

        // Extract server information if present
        let server: string | undefined;
        const serverMatch = line.match(/Server:\s*(\S+)/i);
        if (serverMatch) {
            server = serverMatch[1];
        }

        logs.push({
            timestamp,
            level,
            message: line.trim(),
            phase,
            server,
        });
    });

    return logs;
};

// Calculate estimated end time
export const calculateEstimatedEndTime = (
    phases: UpgradePhase[],
    currentPhaseIndex: number,
    startTime: Date
): Date => {
    // Calculate remaining time from current phase onwards
    let remainingMinutes = 0;

    for (let i = currentPhaseIndex; i < phases.length; i++) {
        const phase = phases[i];
        const remainingProgress = 100 - phase.progress;
        const estimatedTimeForPhase = (phase.estimatedDuration * remainingProgress) / 100;
        remainingMinutes += estimatedTimeForPhase;
    }

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + remainingMinutes);
    return endTime;
};

// Persist state to localStorage
export const saveStateToLocalStorage = (state: any): void => {
    try {
        localStorage.setItem('splunk_upgrade_state', JSON.stringify(state));
    } catch (error) {
        console.error('Failed to save state to localStorage:', error);
    }
};

// Load state from localStorage
export const loadStateFromLocalStorage = (): any | null => {
    try {
        const saved = localStorage.getItem('splunk_upgrade_state');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error('Failed to load state from localStorage:', error);
    }
    return null;
};

// Clear saved state
export const clearSavedState = (): void => {
    try {
        localStorage.removeItem('splunk_upgrade_state');
    } catch (error) {
        console.error('Failed to clear saved state:', error);
    }
};

// Format duration in minutes to human-readable string
export const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
};

// Get status color class
export const getStatusColor = (status: PhaseStatus): string => {
    switch (status) {
        case 'pending':
            return 'status-pending';
        case 'in-progress':
            return 'status-in-progress';
        case 'completed':
            return 'status-completed';
        case 'failed':
            return 'status-failed';
        default:
            return 'status-pending';
    }
};

// Get health status color
export const getHealthColor = (status: 'healthy' | 'warning' | 'critical'): string => {
    switch (status) {
        case 'healthy':
            return 'text-success-500';
        case 'warning':
            return 'text-warning-500';
        case 'critical':
            return 'text-danger-500';
        default:
            return 'text-gray-500';
    }
};
