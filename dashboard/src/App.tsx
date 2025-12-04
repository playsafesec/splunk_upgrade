import { useEffect, useState } from 'react';
import { useUpgradeStore } from './stores/upgradeStore';
import { initializeGitHubAPI, getGitHubAPI } from './services/githubApi';
import Sidebar from './components/Sidebar';
import ProgressTracker from './components/ProgressTracker';
import WorkflowVisualization from './components/WorkflowVisualization';
import HealthCheckPanel from './components/HealthCheckPanel';
import PhaseChecklist from './components/PhaseChecklist';
import ControlPanel from './components/ControlPanel';
import WorkflowLogs from './components/WorkflowLogs';
import InventoryManager from './components/InventoryManager';
import type { SidebarItem } from './types';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const { setInventories, loadSavedState, isRunning, currentWorkflowRun, setCurrentWorkflowRun, addLogs } = useUpgradeStore();

  // Initialize GitHub API and load inventories
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get GitHub configuration from environment variables
        const token = import.meta.env.VITE_GITHUB_TOKEN;
        const owner = import.meta.env.VITE_GITHUB_OWNER || 'playsafesec';
        const repo = import.meta.env.VITE_GITHUB_REPO || 'splunk_upgrade';
        const workflowFileName = import.meta.env.VITE_WORKFLOW_FILE || 'splunk-upgrade.yml';

        // Initialize GitHub API (token is optional)
        initializeGitHubAPI({
          token: token || '',
          owner,
          repo,
          workflowFileName,
        });

        // Try to load inventories from GitHub, fallback to mock data if it fails
        try {
          const api = getGitHubAPI();
          const [hostInventory, packageInventory] = await Promise.all([
            api.getHostInventory(),
            api.getPackageInventory(),
          ]);
          setInventories(hostInventory, packageInventory);
        } catch (apiError) {
          console.warn('Failed to load from GitHub API, using mock data:', apiError);

          // Fallback to mock data
          const mockHostInventory = {
            classes: [
              {
                name: 'azure_hf',
                servers: [
                  { sn: '1', ip: '20.84.40.194', name: 'azure_hf_1', role: 'HF', os: 'redhat' },
                  { sn: '2', ip: '30.84.50.94', name: 'azure_hf_2', role: 'HF', os: 'redhat' },
                ],
              },
              {
                name: 'azure_uf',
                servers: [
                  { sn: '1', ip: '64.34.40.194', name: 'azure_uf_1', role: 'UF', os: 'redhat' },
                  { sn: '2', ip: '54.84.90.84', name: 'azure_uf_2', role: 'UF', os: 'redhat' },
                ],
              },
            ],
          };

          const mockPackageInventory = {
            packages: [
              {
                id: 'splunk_enterprise_9.3.2',
                name: 'Splunk Enterprise',
                type: 'enterprise' as const,
                version: '9.3.2',
                build: 'd8bb32809498',
                platform: 'Linux-x86_64',
                download_url: 'https://download.splunk.com/products/splunk/releases/9.3.2/linux/splunk-9.3.2-d8bb32809498-Linux-x86_64.tgz',
                filename: 'splunk-9.3.2-d8bb32809498-Linux-x86_64.tgz',
                install_path: '/opt/splunk',
              },
              {
                id: 'splunk_uf_9.4.6',
                name: 'Splunk Universal Forwarder',
                type: 'forwarder' as const,
                version: '9.4.6',
                build: '60284236e579',
                platform: 'linux-amd64',
                download_url: 'https://download.splunk.com/products/universalforwarder/releases/9.4.6/linux/splunkforwarder-9.4.6-60284236e579-linux-amd64.tgz',
                filename: 'splunkforwarder-9.4.6-60284236e579-linux-amd64.tgz',
                install_path: '/opt/splunkforwarder',
              },
            ],
          };

          setInventories(mockHostInventory, mockPackageInventory);
        }

        // Load saved state from localStorage
        loadSavedState();

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError('Failed to initialize dashboard. Please refresh the page.');
      }
    };

    initializeApp();
  }, []);

  // Poll for workflow updates when upgrade is running
  useEffect(() => {
    if (!isRunning || !isInitialized) return;

    const pollInterval = setInterval(async () => {
      try {
        const api = getGitHubAPI();
        const run = await api.getLatestWorkflowRun();

        if (run) {
          setCurrentWorkflowRun(run);

          // Fetch and parse logs
          const logs = await api.getWorkflowLogs(run.id);
          // Parse logs and add to store
          // Note: This is simplified. In production, you'd parse the logs more carefully
          if (logs) {
            const logLines = logs.split('\n').slice(-10); // Get last 10 lines
            const parsedLogs = logLines.map(line => ({
              timestamp: new Date(),
              level: line.includes('ERROR') ? 'error' as const :
                line.includes('WARNING') ? 'warning' as const :
                  line.includes('SUCCESS') ? 'success' as const : 'info' as const,
              message: line,
            }));
            addLogs(parsedLogs);
          }
        }
      } catch (error) {
        console.error('Failed to poll workflow status:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [isRunning, isInitialized]);

  const handleSidebarItemClick = (item: SidebarItem) => {
    setActiveView(item.id);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          {initError ? (
            <div className="card max-w-md">
              <h2 className="text-xl font-bold text-danger-400 mb-4">❌ Initialization Error</h2>
              <p className="text-gray-300 mb-6">{initError}</p>
              <div className="glass p-4 text-left text-sm">
                <p className="text-gray-400 mb-2">To configure the dashboard:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-500">
                  <li>Create a <code className="px-1 bg-gray-800 rounded">.env</code> file in the dashboard directory</li>
                  <li>Add your GitHub Personal Access Token:
                    <pre className="mt-2 p-2 bg-gray-900 rounded text-xs overflow-x-auto">
                      VITE_GITHUB_TOKEN=your_token_here
                      VITE_GITHUB_OWNER=your_username
                      VITE_GITHUB_REPO=splunk_upgrade
                    </pre>
                  </li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="animate-spin-slow text-6xl mb-4">⚙️</div>
              <h2 className="text-xl font-bold text-white mb-2">Initializing Dashboard...</h2>
              <p className="text-gray-400">Loading inventories from GitHub</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar activeItem={activeView} onItemClick={handleSidebarItemClick} />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {activeView === 'dashboard' && '📊 Dashboard Overview'}
                  {activeView === 'progress' && '🚀 Upgrade Progress'}
                  {activeView === 'health' && '❤️ Health Check'}
                  {activeView === 'inventory' && '📦 Inventory Management'}
                  {activeView === 'logs' && '📝 Workflow Logs'}
                  {activeView === 'reports' && '📄 Reports'}
                </h1>
                <p className="text-gray-400">Splunk Upgrade Orchestration Dashboard</p>
              </div>
              {currentWorkflowRun && (
                <a
                  href={currentWorkflowRun.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm"
                >
                  🔗 View on GitHub
                </a>
              )}
            </div>
          </header>

          {/* Content */}
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ProgressTracker />
                </div>
                <div>
                  <ControlPanel />
                </div>
              </div>
              <WorkflowVisualization />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PhaseChecklist />
                <WorkflowLogs />
              </div>
            </div>
          )}

          {activeView === 'progress' && (
            <div className="space-y-6">
              <ProgressTracker />
              <WorkflowVisualization />
              <PhaseChecklist />
            </div>
          )}

          {activeView === 'health' && (
            <div className="space-y-6">
              <HealthCheckPanel />
            </div>
          )}

          {activeView === 'inventory' && (
            <div className="space-y-6">
              <InventoryManager />
            </div>
          )}

          {activeView === 'logs' && (
            <div className="space-y-6">
              <WorkflowLogs />
            </div>
          )}

          {activeView === 'reports' && (
            <div className="card">
              <h2 className="card-header">Reports</h2>
              <p className="text-gray-400">Report generation and history will be displayed here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
