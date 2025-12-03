# Splunk Enterprise Upgrade - GitHub Actions

This directory contains GitHub Actions workflows for upgrading Splunk Enterprise on target servers.

## Quick Start

### 1. Configure GitHub Secrets

Navigate to your repository **Settings → Secrets and variables → Actions** and add:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SSH_PRIVATE_KEY` | SSH private key for server access | (Your private key content) |
| `SSH_USER` | SSH username | `root` or `splunk` |

### 2. Trigger Workflow

You can trigger the workflow in two ways:

#### Manual Trigger (Recommended)
1. Go to **Actions** tab in your GitHub repository
2. Select **Splunk Enterprise Upgrade** workflow
3. Click **Run workflow**
4. Enter target server IP (default: `20.84.40.194`)
5. Enter Splunk version (default: `9.2.5`)
6. Click **Run workflow**

#### Automatic Trigger
The workflow automatically runs when you push changes to:
- `.github/workflows/splunk-upgrade.yml`
- `upgrade_splunk_uf.sh`

## Configuration

### Workflow Inputs

- **target_server**: Target server IP or hostname (default: `20.84.40.194`)
- **splunk_version**: Target Splunk version (default: `9.2.5`)

### Environment Variables

Edit `.github/workflows/splunk-upgrade.yml` to customize:

```yaml
env:
  SPLUNK_HOME: '/opt/splunk'
  SPLUNK_INSTALLER_URL: 'https://download.splunk.com/products/splunk/releases/9.2.5/linux/splunk-9.2.5-7bfc9a4ed6ba-Linux-x86_64.tgz'
```

## Workflow Steps

The workflow performs the following steps:

1. **Download Installer**: Downloads Splunk Enterprise installer from Splunk.com
2. **Setup SSH**: Configures SSH key for server access
3. **Copy Script**: Copies upgrade script to target server
4. **Copy Installer**: Transfers installer to target server
5. **Execute Upgrade**: Runs upgrade script on target server
6. **Verify**: Confirms Splunk is running and displays version
7. **Cleanup**: Removes temporary files from target server

## Files

- `.github/workflows/splunk-upgrade.yml` - GitHub Actions workflow
- `upgrade_splunk_uf.sh` - Upgrade script (located in repo root or azure-devops folder)

## Troubleshooting

### SSH Connection Failed

**Error**: `Permission denied (publickey)`

**Solutions**:
- Verify `SSH_PRIVATE_KEY` secret is correctly set
- Ensure public key is in `~/.ssh/authorized_keys` on target server
- Check `SSH_USER` secret matches the actual SSH username

### Installer Download Failed

**Error**: `Failed to download installer`

**Solutions**:
- Verify `SPLUNK_INSTALLER_URL` is correct and accessible
- Check if Splunk.com is reachable from GitHub runners
- Consider hosting installer on your own server

### Upgrade Script Failed

**Error**: Upgrade script execution errors

**Solutions**:
- Check script has correct permissions
- Verify sudo access for SSH user
- Review workflow logs for detailed error messages

## Requirements

- GitHub repository with Actions enabled
- SSH access to target servers
- Sudo privileges on target servers
- Splunk Enterprise pre-installed on target servers

## Security Notes

- SSH private keys are stored as GitHub secrets (encrypted)
- Private key is removed from runner after each workflow execution
- Consider using deployment environments for additional approval gates

## Comparison with Azure DevOps

### Advantages of GitHub Actions
- ✅ Free minutes for public repositories
- ✅ Free for private repositories (2,000 minutes/month)
- ✅ No parallelism restrictions
- ✅ Simpler workflow syntax
- ✅ Built-in manual trigger support

### Setup Differences
- **SSH Authentication**: GitHub Actions uses secrets instead of service connections
- **Artifact Handling**: No need for pipeline artifacts (downloads directly in workflow)
- **Triggers**: Uses `workflow_dispatch` for manual runs instead of Azure DevOps UI

## Further Reading

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
