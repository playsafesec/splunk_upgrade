import { create } from 'zustand';
import type {
    UpgradeState,
    UpgradePhase,
    WorkflowRun,
    WorkflowJob,
    WorkflowLog,
    HealthMetrics,
    HostInventory,
    PackageInventory
} from '../types';
import {
    createInitialPhases,
    calculateOverallProgress,
    saveStateToLocalStorage,
    loadStateFromLocalStorage,
    clearSavedState,
    calculateEstimatedEndTime
} from '../services/workflowService';

interface UpgradeStore extends UpgradeState {
    // Actions
    startUpgrade: (hostClass: string, packageId: string, mode: 'single_server' | 'all_servers_in_class', serverName?: string) => void;
    pauseUpgrade: () => void;
    resumeUpgrade: () => void;
    resetUpgrade: () => void;
    updatePhase: (phaseId: string, updates: Partial<UpgradePhase>) => void;
    setCurrentWorkflowRun: (run: WorkflowRun | undefined) => void;
    setWorkflowJobs: (jobs: WorkflowJob[]) => void;
    addLog: (log: WorkflowLog) => void;
    addLogs: (logs: WorkflowLog[]) => void;
    clearLogs: () => void;
    setHealthMetrics: (metrics: HealthMetrics) => void;
    setInventories: (host: HostInventory, packages: PackageInventory) => void;
    updateHostInventory: (inventory: HostInventory) => void;
    updatePackageInventory: (inventory: PackageInventory) => void;
    loadSavedState: () => void;
    nextPhase: () => void;
}

const initialState: UpgradeState = {
    isRunning: false,
    isPaused: false,
    currentPhaseIndex: 0,
    overallProgress: 0,
    phases: createInitialPhases(),
    upgradeMode: 'single_server',
    workflowJobs: [],
    logs: [],
};

export const useUpgradeStore = create<UpgradeStore>((set, get) => ({
    ...initialState,

    startUpgrade: (hostClass, packageId, mode, serverName) => {
        const startTime = new Date();
        const phases = createInitialPhases();
        const estimatedEndTime = calculateEstimatedEndTime(phases, 0, startTime);

        const newState = {
            isRunning: true,
            isPaused: false,
            currentPhaseIndex: 0,
            overallProgress: 0,
            startTime,
            estimatedEndTime,
            selectedHostClass: hostClass,
            selectedPackage: packageId,
            selectedServer: serverName,
            upgradeMode: mode,
            phases,
            logs: [],
            currentWorkflowRun: undefined,
            workflowJobs: [],
        };

        set(newState);
        saveStateToLocalStorage(get());
    },

    pauseUpgrade: () => {
        set({ isPaused: true });
        saveStateToLocalStorage(get());
    },

    resumeUpgrade: () => {
        set({ isPaused: false });
        saveStateToLocalStorage(get());
    },

    resetUpgrade: () => {
        const resetState = {
            ...initialState,
            phases: createInitialPhases(),
            hostInventory: get().hostInventory,
            packageInventory: get().packageInventory,
            healthMetrics: get().healthMetrics,
        };
        set(resetState);
        clearSavedState();
    },

    updatePhase: (phaseId, updates) => {
        const phases = get().phases.map((phase) =>
            phase.id === phaseId ? { ...phase, ...updates } : phase
        );

        const overallProgress = calculateOverallProgress(phases);

        // Update current phase index if needed
        let currentPhaseIndex = get().currentPhaseIndex;
        const updatedPhaseIndex = phases.findIndex((p) => p.id === phaseId);

        if (updates.status === 'in-progress' && updatedPhaseIndex > currentPhaseIndex) {
            currentPhaseIndex = updatedPhaseIndex;
        }

        // Recalculate estimated end time
        const { startTime } = get();
        const estimatedEndTime = startTime
            ? calculateEstimatedEndTime(phases, currentPhaseIndex, startTime)
            : undefined;

        set({
            phases,
            overallProgress,
            currentPhaseIndex,
            estimatedEndTime
        });
        saveStateToLocalStorage(get());
    },

    nextPhase: () => {
        const { currentPhaseIndex, phases } = get();
        if (currentPhaseIndex < phases.length - 1) {
            const newIndex = currentPhaseIndex + 1;
            set({ currentPhaseIndex: newIndex });

            // Auto-start next phase
            const nextPhaseId = phases[newIndex].id;
            get().updatePhase(nextPhaseId, {
                status: 'in-progress',
                startTime: new Date()
            });
        } else {
            // All phases complete
            set({ isRunning: false });
        }
        saveStateToLocalStorage(get());
    },

    setCurrentWorkflowRun: (run) => {
        set({ currentWorkflowRun: run });
        saveStateToLocalStorage(get());
    },

    setWorkflowJobs: (jobs) => {
        set({ workflowJobs: jobs });
        saveStateToLocalStorage(get());
    },

    addLog: (log) => {
        const logs = [...get().logs, log];
        set({ logs });
        // Don't save logs to localStorage to avoid bloat
    },

    addLogs: (logs) => {
        const existingLogs = get().logs;
        set({ logs: [...existingLogs, ...logs] });
    },

    clearLogs: () => {
        set({ logs: [] });
    },

    setHealthMetrics: (metrics) => {
        set({ healthMetrics: metrics });
        saveStateToLocalStorage(get());
    },

    setInventories: (host, packages) => {
        set({
            hostInventory: host,
            packageInventory: packages
        });
    },

    updateHostInventory: (inventory) => {
        set({ hostInventory: inventory });
    },

    updatePackageInventory: (inventory) => {
        set({ packageInventory: inventory });
    },

    loadSavedState: () => {
        const saved = loadStateFromLocalStorage();
        if (saved) {
            // Preserve inventories and health metrics
            const { hostInventory, packageInventory, healthMetrics } = get();
            set({
                ...saved,
                hostInventory: saved.hostInventory || hostInventory,
                packageInventory: saved.packageInventory || packageInventory,
                healthMetrics: saved.healthMetrics || healthMetrics,
                // Convert date strings back to Date objects
                startTime: saved.startTime ? new Date(saved.startTime) : undefined,
                estimatedEndTime: saved.estimatedEndTime ? new Date(saved.estimatedEndTime) : undefined,
                phases: saved.phases?.map((phase: any) => ({
                    ...phase,
                    startTime: phase.startTime ? new Date(phase.startTime) : undefined,
                    endTime: phase.endTime ? new Date(phase.endTime) : undefined,
                })) || createInitialPhases(),
            });
        }
    },
}));
