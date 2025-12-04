import { useState } from 'react';
import { useUpgradeStore } from '../stores/upgradeStore';
import { getGitHubAPI } from '../services/githubApi';

export default function InventoryManager() {
    const { hostInventory, packageInventory } = useUpgradeStore();
    const [activeTab, setActiveTab] = useState<'hosts' | 'packages'>('hosts');
    const [isSaving, setIsSaving] = useState(false);

    const saveChanges = async () => {
        setIsSaving(true);
        try {
            const api = getGitHubAPI();
            if (activeTab === 'hosts' && hostInventory) {
                await api.updateHostInventory(hostInventory);
                alert('Host inventory updated successfully!');
            } else if (activeTab === 'packages' && packageInventory) {
                await api.updatePackageInventory(packageInventory);
                alert('Package inventory updated successfully!');
            }
        } catch (error) {
            alert('Failed to save changes. Please try again.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <h2 className="card-header mb-0">Inventory Management</h2>
                <button
                    onClick={saveChanges}
                    disabled={isSaving}
                    className="btn-primary disabled:opacity-50"
                >
                    {isSaving ? '💾 Saving...' : '💾 Save to GitHub'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-800">
                <button
                    onClick={() => setActiveTab('hosts')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'hosts'
                        ? 'text-primary-400 border-primary-500'
                        : 'text-gray-400 border-transparent hover:text-gray-300'
                        }`}
                >
                    🖥️ Hosts ({hostInventory?.classes.reduce((sum, c) => sum + c.servers.length, 0) || 0})
                </button>
                <button
                    onClick={() => setActiveTab('packages')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'packages'
                        ? 'text-primary-400 border-primary-500'
                        : 'text-gray-400 border-transparent hover:text-gray-300'
                        }`}
                >
                    📦 Packages ({packageInventory?.packages.length || 0})
                </button>
            </div>

            {/* Content */}
            {activeTab === 'hosts' && hostInventory && (
                <div className="space-y-6">
                    {hostInventory.classes.map((cls) => (

                        <div key={cls.name} className="glass p-4">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <span>📁</span>
                                {cls.name}
                                <span className="text-sm text-gray-400">({cls.servers.length} servers)</span>
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-2 px-3 text-gray-400 font-medium">Name</th>
                                            <th className="text-left py-2 px-3 text-gray-400 font-medium">IP Address</th>
                                            <th className="text-left py-2 px-3 text-gray-400 font-medium">Role</th>
                                            <th className="text-left py-2 px-3 text-gray-400 font-medium">OS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cls.servers.map((server) => (

                                            <tr key={server.name} className="border-b border-gray-800 hover:bg-white/5">
                                                <td className="py-2 px-3 text-gray-300">{server.name}</td>
                                                <td className="py-2 px-3 text-gray-300">{server.ip}</td>
                                                <td className="py-2 px-3">
                                                    <span className="px-2 py-1 bg-primary-900/50 text-primary-300 rounded text-xs">
                                                        {server.role}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 text-gray-300">{server.os}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'packages' && packageInventory && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Version</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Build</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Platform</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packageInventory.packages.map((pkg) => (
                                <tr key={pkg.id} className="border-b border-gray-800 hover:bg-white/5">
                                    <td className="py-3 px-4 text-gray-300 font-mono text-xs">{pkg.id}</td>
                                    <td className="py-3 px-4 text-gray-300">{pkg.name}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded text-xs ${pkg.type === 'enterprise'
                                            ? 'bg-primary-900/50 text-primary-300'
                                            : 'bg-success-900/50 text-success-300'
                                            }`}>
                                            {pkg.type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-300 font-semibold">{pkg.version}</td>
                                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">{pkg.build}</td>
                                    <td className="py-3 px-4 text-gray-400 text-xs">{pkg.platform}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
                💡 Changes are saved directly to the GitHub repository
            </div>
        </div>
    );
}
