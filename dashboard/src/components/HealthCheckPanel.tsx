import { useEffect } from 'react';
import { useUpgradeStore } from '../stores/upgradeStore';
import { getHealthColor } from '../services/workflowService';
import type { HealthMetrics } from '../types';

// Mock health check function (in real app, this would call GitHub API or backend)
const runHealthCheck = async (): Promise<HealthMetrics> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        cpu: {
            usage: Math.random() * 100,
            threshold: 80,
            status: Math.random() > 0.7 ? 'healthy' : Math.random() > 0.3 ? 'warning' : 'critical',
        },
        memory: {
            usage: Math.random() * 32,
            total: 32,
            threshold: 80,
            status: Math.random() > 0.7 ? 'healthy' : Math.random() > 0.3 ? 'warning' : 'critical',
        },
        disk: {
            usage: Math.random() * 500,
            total: 500,
            threshold: 85,
            status: Math.random() > 0.7 ? 'healthy' : Math.random() > 0.3 ? 'warning' : 'critical',
        },
        license: {
            usage: Math.random() * 100,
            total: 100,
            threshold: 90,
            status: Math.random() > 0.7 ? 'healthy' : Math.random() > 0.3 ? 'warning' : 'critical',
        },
        lastChecked: new Date(),
    };
};

export default function HealthCheckPanel() {
    const { healthMetrics, setHealthMetrics } = useUpgradeStore();

    useEffect(() => {
        // Run initial health check
        handleHealthCheck();
    }, []);

    const handleHealthCheck = async () => {
        const metrics = await runHealthCheck();
        setHealthMetrics(metrics);
    };

    if (!healthMetrics) {
        return (
            <div className="card">
                <h2 className="card-header">System Health</h2>
                <div className="flex items-center justify-center py-12">
                    <button
                        onClick={handleHealthCheck}
                        className="btn-primary"
                    >
                        🔍 Run Health Check
                    </button>
                </div>
            </div>
        );
    }

    const getPercentage = (usage: number, total: number) => (usage / total) * 100;
    const overallStatus = [
        healthMetrics.cpu.status,
        healthMetrics.memory.status,
        healthMetrics.disk.status,
        healthMetrics.license.status,
    ].includes('critical') ? 'critical' :
        [healthMetrics.cpu.status, healthMetrics.memory.status, healthMetrics.disk.status, healthMetrics.license.status]
            .includes('warning') ? 'warning' : 'healthy';

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <h2 className="card-header mb-0">System Health</h2>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${overallStatus === 'healthy' ? 'bg-success-900/50 text-success-300 border border-success-600' :
                            overallStatus === 'warning' ? 'bg-warning-900/50 text-warning-300 border border-warning-600' :
                                'bg-danger-900/50 text-danger-300 border border-danger-600'
                        }`}>
                        {overallStatus === 'healthy' && '✅ All Systems Healthy'}
                        {overallStatus === 'warning' && '⚠️ Warnings Detected'}
                        {overallStatus === 'critical' && '❌ Critical Issues'}
                    </span>
                    <button
                        onClick={handleHealthCheck}
                        className="btn-secondary text-sm"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CPU Usage */}
                <div className="glass p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⚙️</span>
                            <h3 className="font-semibold text-white">CPU Usage</h3>
                        </div>
                        <span className={`text-lg font-bold ${getHealthColor(healthMetrics.cpu.status)}`}>
                            {healthMetrics.cpu.usage.toFixed(1)}%
                        </span>
                    </div>
                    <div className="progress-bar h-3">
                        <div
                            className={`h-full transition-all duration-500 ${healthMetrics.cpu.status === 'healthy' ? 'bg-success-500' :
                                    healthMetrics.cpu.status === 'warning' ? 'bg-warning-500' :
                                        'bg-danger-500'
                                }`}
                            style={{ width: `${healthMetrics.cpu.usage}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Threshold: {healthMetrics.cpu.threshold}%
                    </p>
                </div>

                {/* Memory Usage */}
                <div className="glass p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🧠</span>
                            <h3 className="font-semibold text-white">Memory Usage</h3>
                        </div>
                        <span className={`text-lg font-bold ${getHealthColor(healthMetrics.memory.status)}`}>
                            {healthMetrics.memory.usage.toFixed(1)} / {healthMetrics.memory.total} GB
                        </span>
                    </div>
                    <div className="progress-bar h-3">
                        <div
                            className={`h-full transition-all duration-500 ${healthMetrics.memory.status === 'healthy' ? 'bg-success-500' :
                                    healthMetrics.memory.status === 'warning' ? 'bg-warning-500' :
                                        'bg-danger-500'
                                }`}
                            style={{ width: `${getPercentage(healthMetrics.memory.usage, healthMetrics.memory.total)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Threshold: {healthMetrics.memory.threshold}%
                    </p>
                </div>

                {/* Disk Space */}
                <div className="glass p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">💽</span>
                            <h3 className="font-semibold text-white">Disk Space</h3>
                        </div>
                        <span className={`text-lg font-bold ${getHealthColor(healthMetrics.disk.status)}`}>
                            {healthMetrics.disk.usage.toFixed(1)} / {healthMetrics.disk.total} GB
                        </span>
                    </div>
                    <div className="progress-bar h-3">
                        <div
                            className={`h-full transition-all duration-500 ${healthMetrics.disk.status === 'healthy' ? 'bg-success-500' :
                                    healthMetrics.disk.status === 'warning' ? 'bg-warning-500' :
                                        'bg-danger-500'
                                }`}
                            style={{ width: `${getPercentage(healthMetrics.disk.usage, healthMetrics.disk.total)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Threshold: {healthMetrics.disk.threshold}%
                    </p>
                </div>

                {/* License Capacity */}
                <div className="glass p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📄</span>
                            <h3 className="font-semibold text-white">License Capacity</h3>
                        </div>
                        <span className={`text-lg font-bold ${getHealthColor(healthMetrics.license.status)}`}>
                            {healthMetrics.license.usage.toFixed(1)} / {healthMetrics.license.total} GB/day
                        </span>
                    </div>
                    <div className="progress-bar h-3">
                        <div
                            className={`h-full transition-all duration-500 ${healthMetrics.license.status === 'healthy' ? 'bg-success-500' :
                                    healthMetrics.license.status === 'warning' ? 'bg-warning-500' :
                                        'bg-danger-500'
                                }`}
                            style={{ width: `${getPercentage(healthMetrics.license.usage, healthMetrics.license.total)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Threshold: {healthMetrics.license.threshold}%
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
                Last checked: {healthMetrics.lastChecked.toLocaleString()}
            </div>
        </div>
    );
}
