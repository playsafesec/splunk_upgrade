import { useUpgradeStore } from '../stores/upgradeStore';
import { getStatusColor } from '../services/workflowService';
import type { UpgradePhase } from '../types';

interface PhaseChecklistProps {
    phaseId?: string;
}

export default function PhaseChecklist({ phaseId }: PhaseChecklistProps) {
    const { phases, currentPhaseIndex } = useUpgradeStore();

    const displayPhase: UpgradePhase | undefined = phaseId
        ? phases.find(p => p.id === phaseId)
        : phases[currentPhaseIndex];

    if (!displayPhase) {
        return (
            <div className="card">
                <h2 className="card-header">Phase Checklist</h2>
                <p className="text-gray-400">No phase selected</p>
            </div>
        );
    }

    const completedTasks = displayPhase.tasks.filter(t => t.status === 'completed').length;
    const totalTasks = displayPhase.tasks.length;

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="card-header mb-1">{displayPhase.name} - Checklist</h2>
                    <p className="text-sm text-gray-400">
                        {completedTasks} of {totalTasks} tasks completed
                    </p>
                </div>
                <span className={`px-3 py-1 rounded capitalize text-sm ${getStatusColor(displayPhase.status)}`}>
                    {displayPhase.status === 'in-progress' ? 'In Progress' : displayPhase.status}
                </span>
            </div>

            <div className="progress-bar h-2 mb-6">
                <div
                    className={`h-full transition-all duration-500 ${displayPhase.status === 'completed' ? 'bg-success-500' :
                            displayPhase.status === 'in-progress' ? 'bg-primary-500' :
                                displayPhase.status === 'failed' ? 'bg-danger-500' :
                                    'bg-gray-600'
                        }`}
                    style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                />
            </div>

            <div className="space-y-2">
                {displayPhase.tasks.map((task, index) => (
                    <div
                        key={task.id}
                        className={`
              glass p-4 rounded-lg transition-all duration-200
              ${task.status === 'in-progress' ? 'border-l-4 border-primary-500' : ''}
              ${task.status === 'completed' ? 'border-l-4 border-success-500' : ''}
              ${task.status === 'failed' ? 'border-l-4 border-danger-500' : ''}
            `}
                    >
                        <div className="flex items-start gap-3">
                            {/* Checkbox/Status Icon */}
                            <div className="flex-shrink-0 mt-1">
                                {task.status === 'completed' && <span className="text-success-500 text-xl">✅</span>}
                                {task.status === 'in-progress' && (
                                    <div className="w-5 h-5 border-2 border-primary-500 rounded animate-spin border-t-transparent" />
                                )}
                                {task.status === 'failed' && <span className="text-danger-500 text-xl">❌</span>}
                                {task.status === 'pending' && (
                                    <div className="w-5 h-5 border-2 border-gray-600 rounded" />
                                )}
                            </div>

                            {/* Task Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <h4 className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-white'
                                            }`}>
                                            {index + 1}. {task.title}
                                        </h4>
                                        {task.description && (
                                            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                                        )}
                                    </div>

                                    {task.required && (
                                        <span className="flex-shrink-0 px-2 py-0.5 bg-warning-900/50 text-warning-300 rounded text-xs">
                                            Required
                                        </span>
                                    )}
                                </div>

                                {/* Subtasks */}
                                {task.subtasks && task.subtasks.length > 0 && (
                                    <div className="mt-3 ml-4 space-y-1">
                                        {task.subtasks.map((subtask) => (
                                            <div key={subtask.id} className="flex items-center gap-2 text-sm">
                                                <span className={
                                                    subtask.status === 'completed' ? 'text-success-500' :
                                                        subtask.status === 'in-progress' ? 'text-primary-500' :
                                                            'text-gray-600'
                                                }>
                                                    {subtask.status === 'completed' ? '✓' : '○'}
                                                </span>
                                                <span className={subtask.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-400'}>
                                                    {subtask.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
