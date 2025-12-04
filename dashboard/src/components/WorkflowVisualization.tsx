import { useUpgradeStore } from '../stores/upgradeStore';
import { getStatusColor } from '../services/workflowService';

export default function WorkflowVisualization() {
    const { phases, currentPhaseIndex } = useUpgradeStore();

    return (
        <div className="card">
            <h2 className="card-header">Workflow Phases</h2>

            {/* Desktop: Horizontal Layout */}
            <div className="hidden lg:block">
                <div className="flex items-center justify-between gap-4">
                    {phases.map((phase, index) => {
                        const isActive = index === currentPhaseIndex;
                        const isPast = index < currentPhaseIndex;

                        return (
                            <div key={phase.id} className="flex-1 flex items-center gap-4">
                                {/* Phase Card */}
                                <div className={`
                  flex-1 glass-hover p-4 rounded-lg border-2 transition-all duration-300
                  ${isActive ? 'border-primary-500 shadow-lg shadow-primary-900/50 scale-105' : 'border-gray-800'}
                `}>
                                    <div className="flex flex-col items-center text-center gap-2">
                                        {/* Icon */}
                                        <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-2xl
                      transition-all duration-300
                      ${phase.status === 'completed' ? 'bg-success-900/50 border-2 border-success-500' :
                                                phase.status === 'in-progress' ? 'bg-primary-900/50 border-2 border-primary-500 animate-pulse' :
                                                    phase.status === 'failed' ? 'bg-danger-900/50 border-2 border-danger-500' :
                                                        'bg-gray-800 border-2 border-gray-700'}
                    `}>
                                            {index === 0 && '📋'}
                                            {index === 1 && '🎯'}
                                            {index === 2 && '🔍'}
                                            {index === 3 && '💾'}
                                            {index === 4 && '✅'}
                                        </div>

                                        {/* Phase Name */}
                                        <h3 className={`
                      font-semibold text-sm
                      ${isActive ? 'text-primary-300' : 'text-gray-300'}
                    `}>
                                            {phase.name}
                                        </h3>

                                        {/* Status Badge */}
                                        <span className={`
                      px-2 py-0.5 rounded text-xs capitalize
                      ${getStatusColor(phase.status)}
                    `}>
                                            {phase.status === 'in-progress' ? 'In Progress' : phase.status}
                                        </span>

                                        {/* Progress */}
                                        <div className="w-full">
                                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                <span>{phase.progress}%</span>
                                            </div>
                                            <div className="progress-bar h-1.5">
                                                <div
                                                    className={`
                            h-full transition-all duration-500
                            ${phase.status === 'completed' ? 'bg-success-500' :
                                                            phase.status === 'in-progress' ? 'bg-primary-500' :
                                                                phase.status === 'failed' ? 'bg-danger-500' :
                                                                    'bg-gray-600'}
                          `}
                                                    style={{ width: `${phase.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Task Count */}
                                        <div className="text-xs text-gray-500">
                                            {phase.tasks.filter(t => t.status === 'completed').length} / {phase.tasks.length} tasks
                                        </div>
                                    </div>
                                </div>

                                {/* Arrow Connector */}
                                {index < phases.length - 1 && (
                                    <div className={`
                    flex-shrink-0 text-2xl transition-colors
                    ${isPast ? 'text-success-500' : 'text-gray-700'}
                  `}>
                                        →
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile/Tablet: Vertical Layout */}
            <div className="lg:hidden space-y-4">
                {phases.map((phase, index) => {
                    const isActive = index === currentPhaseIndex;

                    return (
                        <div key={phase.id}>
                            <div className={`
                glass-hover p-4 rounded-lg border-2 transition-all duration-300
                ${isActive ? 'border-primary-500 shadow-lg shadow-primary-900/50' : 'border-gray-800'}
              `}>
                                <div className="flex items-center gap-4">
                                    {/* Icon */}
                                    <div className={`
                    w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center text-2xl
                    ${phase.status === 'completed' ? 'bg-success-900/50 border-2 border-success-500' :
                                            phase.status === 'in-progress' ? 'bg-primary-900/50 border-2 border-primary-500 animate-pulse' :
                                                phase.status === 'failed' ? 'bg-danger-900/50 border-2 border-danger-500' :
                                                    'bg-gray-800 border-2 border-gray-700'}
                  `}>
                                        {index === 0 && '📋'}
                                        {index === 1 && '🎯'}
                                        {index === 2 && '🔍'}
                                        {index === 3 && '💾'}
                                        {index === 4 && '✅'}
                                    </div>

                                    {/* Phase Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-semibold ${isActive ? 'text-primary-300' : 'text-white'}`}>
                                                {phase.name}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded text-xs capitalize ${getStatusColor(phase.status)}`}>
                                                {phase.status === 'in-progress' ? 'In Progress' : phase.status}
                                            </span>
                                        </div>

                                        <div className="progress-bar h-2 mb-2">
                                            <div
                                                className={`
                          h-full transition-all duration-500
                          ${phase.status === 'completed' ? 'bg-success-500' :
                                                        phase.status === 'in-progress' ? 'bg-primary-500' :
                                                            phase.status === 'failed' ? 'bg-danger-500' :
                                                                'bg-gray-600'}
                        `}
                                                style={{ width: `${phase.progress}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>{phase.progress}% complete</span>
                                            <span>{phase.tasks.filter(t => t.status === 'completed').length} / {phase.tasks.length} tasks</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vertical Connector */}
                            {index < phases.length - 1 && (
                                <div className="flex justify-center py-2">
                                    <div className={`
                    w-0.5 h-4 transition-colors
                    ${index < currentPhaseIndex ? 'bg-success-500' : 'bg-gray-700'}
                  `} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
