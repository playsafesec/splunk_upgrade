import { useUpgradeStore } from '../stores/upgradeStore';
import { formatDuration } from '../services/workflowService';
import { format } from 'date-fns';

export default function ProgressTracker() {
    const {
        overallProgress,
        isRunning,
        isPaused,
        currentPhaseIndex,
        phases,
        startTime,
        estimatedEndTime
    } = useUpgradeStore();

    const currentPhase = phases[currentPhaseIndex];
    const totalPhases = phases.length;
    const completedPhases = phases.filter(p => p.status === 'completed').length;

    // Calculate time remaining
    const getTimeRemaining = () => {
        if (!estimatedEndTime) return 'Calculating...';
        const now = new Date();
        const diff = estimatedEndTime.getTime() - now.getTime();
        if (diff <= 0) return 'Almost done';
        const minutes = Math.round(diff / 60000);
        return formatDuration(minutes);
    };

    // Calculate elapsed time
    const getElapsedTime = () => {
        if (!startTime) return '0m';
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const minutes = Math.round(diff / 60000);
        return formatDuration(minutes);
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <h2 className="card-header mb-0">Upgrade Progress</h2>
                {isRunning && (
                    <div className="flex items-center gap-2">
                        {isPaused ? (
                            <span className="px-3 py-1 bg-warning-900/50 text-warning-300 border border-warning-600 rounded-full text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-warning-500 rounded-full"></span>
                                Paused
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-primary-900/50 text-primary-300 border border-primary-600 rounded-full text-sm flex items-center gap-2 animate-pulse-slow">
                                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                                In Progress
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-gradient">{overallProgress}%</span>
                    <span className="text-sm text-gray-400">
                        {completedPhases} of {totalPhases} phases completed
                    </span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${overallProgress}%` }}
                    >
                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                            {overallProgress > 10 && (
                                <span className="text-xs font-bold text-white drop-shadow">
                                    {overallProgress}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Phase */}
            {currentPhase && (
                <div className="glass p-4 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                            {currentPhaseIndex === 0 && '📋'}
                            {currentPhaseIndex === 1 && '🎯'}
                            {currentPhaseIndex === 2 && '🔍'}
                            {currentPhaseIndex === 3 && '💾'}
                            {currentPhaseIndex === 4 && '✅'}
                        </span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white">{currentPhase.name}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs ${currentPhase.status === 'in-progress' ? 'status-in-progress' :
                                        currentPhase.status === 'completed' ? 'status-completed' :
                                            currentPhase.status === 'failed' ? 'status-failed' :
                                                'status-pending'
                                    }`}>
                                    {currentPhase.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400">
                                Phase {currentPhaseIndex + 1} of {totalPhases}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-primary-400">{currentPhase.progress}%</p>
                            <p className="text-xs text-gray-400">Phase Progress</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Time Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">⏱️</span>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Elapsed</p>
                    </div>
                    <p className="text-lg font-bold text-white">{getElapsedTime()}</p>
                </div>

                <div className="glass p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">⏳</span>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Remaining</p>
                    </div>
                    <p className="text-lg font-bold text-white">{getTimeRemaining()}</p>
                </div>

                <div className="glass p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🎯</span>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Est. Completion</p>
                    </div>
                    <p className="text-lg font-bold text-white">
                        {estimatedEndTime ? format(estimatedEndTime, 'HH:mm') : '--:--'}
                    </p>
                </div>
            </div>

            {/* Start Time */}
            {startTime && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500">
                        Started at {format(startTime, 'MMM dd, yyyy HH:mm:ss')}
                    </p>
                </div>
            )}
        </div>
    );
}
