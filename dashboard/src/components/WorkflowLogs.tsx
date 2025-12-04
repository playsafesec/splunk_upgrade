import { useRef, useEffect, useState } from 'react';
import { useUpgradeStore } from '../stores/upgradeStore';
import type { WorkflowLog } from '../types';

export default function WorkflowLogs() {
    const { logs } = useUpgradeStore();
    const logsEndRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');

    useEffect(() => {
        if (autoScroll) {
            logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, autoScroll]);

    const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter);

    const getLevelIcon = (level: WorkflowLog['level']) => {
        switch (level) {
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'success': return '✅';
            default: return 'ℹ️';
        }
    };

    const getLevelColor = (level: WorkflowLog['level']) => {
        switch (level) {
            case 'error': return 'text-danger-400';
            case 'warning': return 'text-warning-400';
            case 'success': return 'text-success-400';
            default: return 'text-gray-400';
        }
    };

    const downloadLogs = () => {
        const content = logs.map(log =>
            `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`
        ).join('\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workflow-logs-${new Date().toISOString()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h2 className="card-header mb-0">Workflow Logs</h2>
                <div className="flex items-center gap-3">
                    {/* Filter */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="select text-sm py-1"
                    >
                        <option value="all">All ({logs.length})</option>
                        <option value="info">Info ({logs.filter(l => l.level === 'info').length})</option>
                        <option value="success">Success ({logs.filter(l => l.level === 'success').length})</option>
                        <option value="warning">Warning ({logs.filter(l => l.level === 'warning').length})</option>
                        <option value="error">Error ({logs.filter(l => l.level === 'error').length})</option>
                    </select>

                    {/* Auto-scroll toggle */}
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="w-4 h-4"
                        />
                        Auto-scroll
                    </label>

                    {/* Download button */}
                    <button
                        onClick={downloadLogs}
                        className="btn-secondary text-sm py-1"
                        disabled={logs.length === 0}
                    >
                        💾 Download
                    </button>
                </div>
            </div>

            {/* Logs container */}
            <div className="glass p-4 h-96 overflow-y-auto custom-scrollbar font-mono text-sm">
                {filteredLogs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No logs available. Start an upgrade to see logs here.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredLogs.map((log, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 py-1 px-2 rounded hover:bg-white/5 transition-colors ${getLevelColor(log.level)}`}
                            >
                                <span className="flex-shrink-0 mt-0.5">{getLevelIcon(log.level)}</span>
                                <span className="flex-shrink-0 text-gray-500 text-xs">
                                    {log.timestamp.toLocaleTimeString()}
                                </span>
                                {log.phase && (
                                    <span className="flex-shrink-0 px-2 py-0.5 bg-primary-900/50 text-primary-300 rounded text-xs">
                                        {log.phase}
                                    </span>
                                )}
                                {log.server && (
                                    <span className="flex-shrink-0 px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                                        {log.server}
                                    </span>
                                )}
                                <span className="flex-1 break-all">{log.message}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                )}
            </div>
        </div>
    );
}
