import { useState, useEffect } from 'react';
import { useUpgradeStore } from '../stores/upgradeStore';
import { getGitHubAPI } from '../services/githubApi';
import type { UpgradeReport } from '../types';

export default function ControlPanel() {
    const {
        isRunning,
        isPaused,
        selectedHostClass,
        selectedServer,
        selectedPackage,
        upgradeMode,
        startUpgrade,
        pauseUpgrade,
        resumeUpgrade,
        resetUpgrade,
        hostInventory,
        packageInventory,
        phases,
        logs,
        healthMetrics,
        startTime,
        overallProgress,
    } = useUpgradeStore();

    const [localHostClass, setLocalHostClass] = useState('');
    const [localServer, setLocalServer] = useState('');
    const [localPackage, setLocalPackage] = useState('');
    const [localMode, setLocalMode] = useState<'single_server' | 'all_servers_in_class'>('single_server');
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        if (selectedHostClass) setLocalHostClass(selectedHostClass);
        if (selectedPackage) setLocalPackage(selectedPackage);
        if (selectedServer) setLocalServer(selectedServer);
    }, [selectedHostClass, selectedPackage, selectedServer]);

    const handleStartUpgrade = async () => {
        if (!localHostClass || !localPackage) {
            alert('Please select host class and package');
            return;
        }

        if (localMode === 'single_server' && !localServer) {
            alert('Please select a server for single server mode');
            return;
        }

        setIsStarting(true);
        try {
            // Trigger GitHub workflow
            const api = getGitHubAPI();
            await api.triggerWorkflow({
                target_mode: localMode,
                host_class: localHostClass,
                server_name: localMode === 'single_server' ? localServer : undefined,
                package_id: localPackage,
            });

            // Start local upgrade tracking
            startUpgrade(localHostClass, localPackage, localMode, localServer);

            alert('Upgrade workflow started successfully!');
        } catch (error) {
            console.error('Failed to start upgrade:', error);
            alert('Failed to start upgrade. Please check your GitHub token and try again.');
        } finally {
            setIsStarting(false);
        }
    };

    const handleGenerateReport = () => {
        const report: UpgradeReport = {
            metadata: {
                exportedAt: new Date(),
                upgradeMode: upgradeMode,
                targetServers: selectedServer ? [selectedServer] : hostInventory?.classes
                    .find(c => c.name === selectedHostClass)?.servers.map(s => s.name) || [],
                packageVersion: packageInventory?.packages.find(p => p.id === selectedPackage)?.version || 'Unknown',
            },
            summary: {
                startTime: startTime || new Date(),
                endTime: isRunning ? undefined : new Date(),
                totalDuration: startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 60000) : 0,
                overallStatus: phases.every(p => p.status === 'completed') ? 'completed' :
                    phases.some(p => p.status === 'failed') ? 'failed' :
                        phases.some(p => p.status === 'in-progress') ? 'in-progress' : 'pending',
                phasesCompleted: phases.filter(p => p.status === 'completed').length,
                totalPhases: phases.length,
            },
            phases,
            logs,
            healthMetrics,
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `splunk-upgrade-report-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="card">
            <h2 className="card-header">Control Panel</h2>

            {!isRunning ? (
                <div className="space-y-6">
                    {/* Mode Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Upgrade Mode
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="single_server"
                                    checked={localMode === 'single_server'}
                                    onChange={(e) => setLocalMode(e.target.value as any)}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-gray-300">Single Server</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="all_servers_in_class"
                                    checked={localMode === 'all_servers_in_class'}
                                    onChange={(e) => setLocalMode(e.target.value as any)}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-gray-300">All Servers in Class</span>
                            </label>
                        </div>
                    </div>

                    {/* Host Class Selection */}
                    <div>
                        <label htmlFor="host-class" className="block text-sm font-medium text-gray-300 mb-2">
                            Host Class
                        </label>
                        <select
                            id="host-class"
                            value={localHostClass}
                            onChange={(e) => setLocalHostClass(e.target.value)}
                            className="select w-full"
                        >
                            <option value="">Select host class...</option>
                            {hostInventory?.classes.map((cls) => (
                                <option key={cls.name} value={cls.name}>
                                    {cls.name} ({cls.servers.length} servers)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Server Selection (only for single mode) */}
                    {localMode === 'single_server' && localHostClass && (
                        <div>
                            <label htmlFor="server" className="block text-sm font-medium text-gray-300 mb-2">
                                Server
                            </label>
                            <select
                                id="server"
                                value={localServer}
                                onChange={(e) => setLocalServer(e.target.value)}
                                className="select w-full"
                            >
                                <option value="">Select server...</option>
                                {hostInventory?.classes
                                    .find((c) => c.name === localHostClass)
                                    ?.servers.map((server) => (
                                        <option key={server.name} value={server.name}>
                                            {server.name} ({server.ip}) - {server.role}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}

                    {/* Package Selection */}
                    <div>
                        <label htmlFor="package" className="block text-sm font-medium text-gray-300 mb-2">
                            Package Version
                        </label>
                        <select
                            id="package"
                            value={localPackage}
                            onChange={(e) => setLocalPackage(e.target.value)}
                            className="select w-full"
                        >
                            <option value="">Select package...</option>
                            {packageInventory?.packages.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name} {pkg.version} ({pkg.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={handleStartUpgrade}
                        disabled={isStarting || !localHostClass || !localPackage || (localMode === 'single_server' && !localServer)}
                        className="btn-success w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isStarting ? '⏳ Starting Upgrade...' : '🚀 Start Upgrade'}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Running Controls */}
                    <div className="glass p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-white mb-1">Upgrade in Progress</h3>
                                <p className="text-sm text-gray-400">
                                    {upgradeMode === 'single_server' ? `Server: ${selectedServer}` : `Class: ${selectedHostClass}`}
                                </p>
                                <p className="text-sm text-gray-400">
                                    Package: {packageInventory?.packages.find(p => p.id === selectedPackage)?.version}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-gradient">{overallProgress}%</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {isPaused ? (
                                <button onClick={resumeUpgrade} className="btn-success flex-1">
                                    ▶️ Resume
                                </button>
                            ) : (
                                <button onClick={pauseUpgrade} className="btn-secondary flex-1">
                                    ⏸️ Pause
                                </button>
                            )}
                            <button onClick={handleGenerateReport} className="btn-secondary flex-1">
                                📄 Generate Report
                            </button>
                        </div>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to reset the upgrade progress? This cannot be undone.')) {
                                resetUpgrade();
                            }
                        }}
                        className="btn-danger w-full"
                    >
                        🔄 Reset Progress
                    </button>
                </div>
            )}

            {/* Quick Actions */}
            {!isRunning && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button className="btn-secondary justify-center">
                            📊 View Reports
                        </button>
                        <button className="btn-secondary justify-center">
                            ⚙️ Settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
