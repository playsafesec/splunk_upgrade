// Core data types
export interface Server {
    sn: string;
    ip: string;
    name: string;
    role: string;
    os: string;
}

export interface HostClass {
    name: string;
    servers: Server[];
}

export interface HostInventory {
    classes: HostClass[];
}

export interface Package {
    id: string;
    name: string;
    type: 'enterprise' | 'forwarder';
    version: string;
    build: string;
    platform: string;
    download_url: string;
    filename: string;
    install_path: string;
}

export interface PackageInventory {
    packages: Package[];
}

// Workflow and phase types
export type PhaseStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export interface UpgradePhase {
    id: string;
    name: string;
    status: PhaseStatus;
    progress: number;
    startTime?: Date;
    endTime?: Date;
    estimatedDuration: number; // in minutes
    tasks: ChecklistItem[];
}

export interface ChecklistItem {
    id: string;
    title: string;
    description?: string;
    status: PhaseStatus;
    required: boolean;
    subtasks?: ChecklistItem[];
}

// Health metrics
export interface HealthMetrics {
    cpu: {
        usage: number;
        threshold: number;
        status: 'healthy' | 'warning' | 'critical';
    };
    memory: {
        usage: number;
        total: number;
        threshold: number;
        status: 'healthy' | 'warning' | 'critical';
    };
    disk: {
        usage: number;
        total: number;
        threshold: number;
        status: 'healthy' | 'warning' | 'critical';
    };
    license: {
        usage: number;
        total: number;
        threshold: number;
        status: 'healthy' | 'warning' | 'critical';
    };
    lastChecked: Date;
}

// GitHub workflow types
export interface WorkflowRun {
    id: number;
    name: string;
    status: 'queued' | 'in_progress' | 'completed';
    conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
    created_at: string;
    updated_at: string;
    html_url: string;
    run_number: number;
}

export interface WorkflowJob {
    id: number;
    name: string;
    status: 'queued' | 'in_progress' | 'completed';
    conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
    started_at: string;
    completed_at?: string;
    steps: WorkflowStep[];
}

export interface WorkflowStep {
    name: string;
    status: 'queued' | 'in_progress' | 'completed';
    conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
    number: number;
    started_at?: string;
    completed_at?: string;
}

export interface WorkflowLog {
    timestamp: Date;
    level: 'info' | 'warning' | 'error' | 'success';
    message: string;
    phase?: string;
    server?: string;
}

// Application state
export interface UpgradeState {
    // Current upgrade session
    isRunning: boolean;
    isPaused: boolean;
    currentPhaseIndex: number;
    overallProgress: number;
    startTime?: Date;
    estimatedEndTime?: Date;

    // Phases
    phases: UpgradePhase[];

    // Selected configuration
    selectedHostClass?: string;
    selectedServer?: string;
    selectedPackage?: string;
    upgradeMode: 'single_server' | 'all_servers_in_class';

    // Workflow tracking
    currentWorkflowRun?: WorkflowRun;
    workflowJobs: WorkflowJob[];
    logs: WorkflowLog[];

    // Health metrics
    healthMetrics?: HealthMetrics;

    // Inventory
    hostInventory?: HostInventory;
    packageInventory?: PackageInventory;
}

// GitHub API configuration
export interface GitHubConfig {
    owner: string;
    repo: string;
    token: string;
    workflowFileName: string;
}

// UI types
export interface SidebarItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    badge?: string | number;
}

export interface TimelineEvent {
    id: string;
    phase: string;
    timestamp: Date;
    status: PhaseStatus;
    duration?: number;
}

// Report export types
export interface UpgradeReport {
    metadata: {
        exportedAt: Date;
        upgradeMode: string;
        targetServers: string[];
        packageVersion: string;
    };
    summary: {
        startTime: Date;
        endTime?: Date;
        totalDuration?: number;
        overallStatus: PhaseStatus;
        phasesCompleted: number;
        totalPhases: number;
    };
    phases: UpgradePhase[];
    logs: WorkflowLog[];
    healthMetrics?: HealthMetrics;
    issues?: {
        phase: string;
        description: string;
        severity: 'low' | 'medium' | 'high';
    }[];
}
