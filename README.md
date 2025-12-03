# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automating Splunk Enterprise operations.

## Available Workflows

### Splunk Enterprise Upgrade
**File**: `workflows/splunk-upgrade.yml`

Automates Splunk Enterprise upgrades on target servers.

**Quick Start**:
1. Configure GitHub secrets (`SSH_PRIVATE_KEY`, `SSH_USER`)
2. Go to Actions tab → Splunk Enterprise Upgrade
3. Click "Run workflow"
4. Enter server details and run

**Documentation**: See [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md) for detailed setup and usage instructions.

## Repository Setup

### Required Secrets

Navigate to **Settings → Secrets and variables → Actions**:

- `SSH_PRIVATE_KEY` - Private SSH key for server authentication
- `SSH_USER` - SSH username for server login

### Permissions

Ensure Actions are enabled:
- **Settings → Actions → General**
- Allow "All actions and reusable workflows"

## Usage

All workflows support manual triggering via `workflow_dispatch`. Some may also trigger automatically on code changes.

## Documentation

- [GitHub Actions Guide](GITHUB_ACTIONS_GUIDE.md) - Detailed setup and troubleshooting

## Related Files

The workflows reference the upgrade script:
- `../upgrade_splunk_uf.sh` - Splunk upgrade script
