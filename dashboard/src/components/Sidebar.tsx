import { useState } from 'react';
import type { SidebarItem } from '../types';

const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/' },
    { id: 'progress', label: 'Upgrade Progress', icon: '🚀', path: '/progress' },
    { id: 'health', label: 'Health Check', icon: '❤️', path: '/health' },
    { id: 'inventory', label: 'Inventory', icon: '📦', path: '/inventory' },
    { id: 'logs', label: 'Workflow Logs', icon: '📝', path: '/logs' },
    { id: 'reports', label: 'Reports', icon: '📄', path: '/reports' },
];

interface SidebarProps {
    activeItem?: string;
    onItemClick?: (item: SidebarItem) => void;
}

export default function Sidebar({ activeItem = 'dashboard', onItemClick }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <>
            {/* Mobile overlay */}
            {!isCollapsed && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-20"
                    onClick={() => setIsCollapsed(true)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-30
          flex flex-col
          bg-gray-900/95 backdrop-blur-lg border-r border-gray-800
          transition-all duration-300 ease-in-out
          ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-64'}
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">S</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-white">Splunk</h1>
                                <p className="text-xs text-gray-400">Upgrade Dashboard</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? '→' : '←'}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {sidebarItems.map((item) => {
                        const isActive = activeItem === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onItemClick?.(item)}
                                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${isActive ? 'sidebar-link-active' : 'sidebar-link'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {!isCollapsed && (
                                    <span className="font-medium">{item.label}</span>
                                )}
                                {!isCollapsed && item.badge && (
                                    <span className="ml-auto px-2 py-0.5 text-xs bg-primary-600 text-white rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                {!isCollapsed && (
                    <div className="p-4 border-t border-gray-800">
                        <div className="flex items-center gap-3 px-2 py-2">
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-sm">👤</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">Administrator</p>
                                <p className="text-xs text-gray-400">Logged in</p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Mobile menu button */}
            <button
                onClick={() => setIsCollapsed(false)}
                className="lg:hidden fixed bottom-4 right-4 z-10 p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                aria-label="Open menu"
            >
                ☰
            </button>
        </>
    );
}
