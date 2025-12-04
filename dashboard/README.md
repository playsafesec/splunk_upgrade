# Splunk Upgrade Orchestration Dashboard

A modern, full-stack web application for managing and monitoring Splunk upgrade workflows with real-time progress tracking, health monitoring, and GitHub Actions integration.

![Dashboard Screenshot](https://via.placeholder.com/800x400/1a1a1a/3b82f6?text=Splunk+Upgrade+Dashboard)

## 🚀 Features

### Core Functionality
- **Real-time Upgrade Progress Tracker** - Monitor upgrade progress with percentage completion and estimated time remaining
- **Five-Phase Workflow Visualization** - Visual pipeline showing: Preparation → Cluster Manager → Search Heads → Indexers → Validation
- **Pre-upgrade Health Check Panel** - System metrics dashboard (CPU, Memory, Disk Space, License Capacity)
- **Interactive Phase Checklists** - Color-coded task lists for each upgrade phase
- **Timeline View** - Estimated upgrade duration and phase milestones
- **Workflow Execution** - Trigger GitHub Actions workflows directly from the dashboard
- **Real-time Log Streaming** - View live logs from running workflows
- **Inventory Management** - View and update host and package inventories
- **Report Generation** - Export detailed JSON reports of upgrade sessions

### Technical Features
- **GitHub Actions Integration** - Trigger and monitor workflows via GitHub API
- **LocalStorage Persistence** - Save and restore upgrade state across sessions
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode UI** - Modern glassmorphism design with smooth animations
- **TypeScript** - Full type safety throughout the application

## 📋 Prerequisites

- Node.js 18+ and npm
- GitHub Personal Access Token with `repo` and `workflow` scopes
- GitHub repository with Splunk upgrade workflow configured

## 🔧 Setup

### 1. Install Dependencies

```bash
cd dashboard
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `dashboard` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
VITE_GITHUB_TOKEN=your_personal_access_token_here
VITE_GITHUB_OWNER=your_github_username
VITE_GITHUB_REPO=splunk_upgrade
VITE_WORKFLOW_FILE=splunk-upgrade.yml
```

### 3. Create GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
4. Generate token and copy it to your `.env` file

### 4. Run Development Server

```bash
npm run dev
```

The dashboard will open at `http://localhost:5173`

## 🌐 Deployment to GitHub Pages

### Automatic Deployment

The dashboard automatically deploys to GitHub Pages when you push changes to the `main` branch.

### Manual Deployment

1. Ensure GitHub Pages is enabled in your repository settings
2. Set the source to "GitHub Actions"
3. Push changes or manually trigger the "Deploy Dashboard" workflow

Your dashboard will be available at: `https://<username>.github.io/splunk_upgrade/`

### Configure GitHub Secrets

Add your GitHub Personal Access Token as a repository secret:

1. Go to Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `GH_PAT`
4. Value: Your personal access token
5. Click "Add secret"

## 📖 Usage

### Starting an Upgrade

1. Navigate to the Dashboard view
2. Select upgrade mode (Single Server or All Servers in Class)
3. Choose host class from the dropdown
4. Select server (if single server mode)
5. Select package version to install
6. Click "🚀 Start Upgrade"

The dashboard will:
- Trigger the GitHub Actions workflow
- Monitor workflow progress in real-time
- Display logs as they're generated
- Track phase completion
- Show health metrics

### Monitoring Progress

- **Dashboard Overview**: See all components at a glance
- **Workflow Visualization**: Track which phase is currently executing
- **Phase Checklist**: View detailed task progress for each phase
- **Logs Tab**: Real-time workflow output with filtering

### Managing Inventory

1. Navigate to "Inventory" tab
2. Switch between Hosts and Packages tabs
3. View current inventory configurations
4. Changes are saved directly to GitHub (requires permissions)

### Generating Reports

Click "📄 Generate Report" to export a comprehensive JSON report including:
- Upgrade metadata (servers, package version, mode)
- Summary statistics (duration, phases completed, status)
- Detailed phase information
- All workflow logs
- Health metrics

## 🏗️ Project Structure

```
dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── Sidebar.tsx
│   │   ├── ProgressTracker.tsx
│   │   ├── WorkflowVisualization.tsx
│   │   ├── HealthCheckPanel.tsx
│   │   ├── PhaseChecklist.tsx
│   │   ├── ControlPanel.tsx
│   │   ├── WorkflowLogs.tsx
│   │   └── InventoryManager.tsx
│   ├── services/            # API and business logic
│   │   ├── githubApi.ts
│   │   └── workflowService.ts
│   ├── stores/              # State management
│   │   └── upgradeStore.ts
│   ├── types/               # TypeScript definitions
│   │   └── index.ts
│   ├── App.tsx              # Main application
│   └── index.css            # Global styles
├── public/
├── .env.example             # Environment template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: { ... },
      success: { ... },
      warning: { ... },
      danger: { ... },
    },
  },
},
```

### Workflow Phases

Modify `src/services/workflowService.ts` to customize phases and tasks:

```typescript
export const createInitialPhases = (): UpgradePhase[] => [
  // Add or modify phases here
];
```

## 🔍 Troubleshooting

### "GitHub token not configured" Error

- Ensure `.env` file exists in the `dashboard` directory
- Verify `VITE_GITHUB_TOKEN` is set correctly
- Restart the development server after changing `.env`

### Workflow Not Triggering

- Check GitHub token has `workflow` scope
- Verify repository name and owner in `.env`
- Ensure workflow file name matches `VITE_WORKFLOW_FILE`

### Inventory Files Not Loading

- Verify inventory files exist at `inventory/host.json` and `inventory/package.json`
- Check GitHub token has `repo` scope
- Ensure repository is accessible with the token

## 🧪 Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Type Check

```bash
npm run type-check
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📞 Support

For issues and questions, please open a GitHub issue in this repository.
