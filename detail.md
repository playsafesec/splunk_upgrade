# Splunk Enterprise Upgrade Automation
## Infrastructure Implementation Report

---

## Executive Summary

This document outlines the enterprise automation infrastructure developed to standardize and streamline Splunk Enterprise upgrade processes across distributed server environments. The implementation leverages GitHub Actions for continuous integration and delivery, combined with robust shell scripting for safe, repeatable upgrade procedures.

**Key Benefits:**
- Automated deployment reducing manual intervention and human error
- Consistent upgrade procedures across all target servers
- Comprehensive logging and verification mechanisms
- Rapid deployment capability for emergency patches
- Zero-downtime upgrade orchestration with rollback capability

---

## 1. Introduction

### 1.1 Project Objective

The primary objective of this initiative is to establish an automated, enterprise-grade solution for managing Splunk Enterprise upgrades across our infrastructure. Previously, upgrades required manual SSH sessions and error-prone shell commands, introducing significant operational risk and consuming substantial IT resources.

### 1.2 Scope

This implementation encompasses:

\begin{itemize}
\item GitHub Actions workflow configuration for automated deployment
\item Bash-based upgrade scripts with comprehensive error handling
\item SSH-based secure remote execution
\item Integration with GitHub repository for version control
\item Automated verification and rollback procedures
\item Complete documentation and troubleshooting guides
\end{itemize}

### 1.3 Target Environment

\begin{table}
\begin{tabular}{|l|l|}
\hline
Component & Specification \\
\hline
Splunk Version & 9.2.5 and higher \\
Operating System & Linux (Ubuntu/RedHat) x86\_64 \\
Installation Path & /opt/splunk \\
Default Target Server & 20.84.40.194 \\
Runner Environment & Ubuntu-latest (GitHub Actions) \\
\hline
\end{tabular}
\caption{Target Environment Specifications}
\end{table}

---

## 2. Architecture Overview

### 2.1 System Components

The automation infrastructure consists of three primary components:

#### GitHub Actions Workflow
The central orchestration engine (`splunk-upgrade.yml`) manages the entire upgrade process through a series of coordinated steps executed on GitHub-hosted runners. This provides:

\begin{itemize}
\item Event-driven automation (manual triggers or push-based)
\item Secure credential management through GitHub Secrets
\item Comprehensive audit logging and execution history
\item Parallel execution capability for multiple servers
\end{itemize}

#### Upgrade Script (upgrade\_splunk\_uf.sh)
A production-grade bash script executed on target servers that performs:

\begin{itemize}
\item Pre-upgrade validation and health checks
\item Automated Splunk service shutdown
\item Safe backup creation with timestamped directories
\item Binary extraction and configuration preservation
\item Post-upgrade verification and startup
\item Detailed status reporting with color-coded output
\end{itemize}

#### Git Management Utility (update\_github.sh)
A helper script for developers to streamline repository updates with:

\begin{itemize}
\item Interactive commit message collection
\item Optional branch creation workflows
\item Automated push operations
\item User-friendly feedback and error handling
\end{itemize}

### 2.2 Workflow Architecture

\begin{figure}
\centering
\includegraphics[width=0.9\textwidth]{workflow-diagram.png}
\caption{Splunk Upgrade Automation Workflow}
\end{figure}

The automated upgrade process follows this sequence:

1. **Trigger Phase**: Manual workflow dispatch or automatic trigger on code changes
2. **Preparation Phase**: SSH key setup and installer download from Splunk.com
3. **Transfer Phase**: Secure file transfer to target server via SCP
4. **Execution Phase**: Remote script execution with environment variables
5. **Verification Phase**: Health checks and version confirmation
6. **Cleanup Phase**: Temporary file removal and SSH credential purge

---

## 3. Technical Implementation

### 3.1 GitHub Actions Workflow Configuration

The workflow file (`splunk-upgrade.yml`) defines the complete automation sequence using YAML syntax. Key features include:

#### Workflow Inputs

The workflow accepts two parameterized inputs:

\begin{table}
\begin{tabular}{|l|c|l|}
\hline
Input Parameter & Default Value & Description \\
\hline
target\_server & 20.84.40.194 & Target server IP or hostname \\
splunk\_version & 9.2.8 & Target Splunk version for upgrade \\
\hline
\end{tabular}
\caption{Workflow Input Parameters}
\end{table}

#### Environment Configuration

\begin{itemize}
\item SPLUNK\_HOME: /opt/splunk (installation directory)
\item SPLUNK\_INSTALLER\_URL: Version-specific Splunk download URL
\item Runner Environment: ubuntu-latest
\end{itemize}

#### Trigger Mechanisms

The workflow supports two trigger methods:

1. **Manual Trigger (workflow\_dispatch)**: Operators can manually initiate upgrades with custom parameters via the GitHub Actions UI
2. **Automatic Trigger (push-based)**: Changes to configuration files automatically trigger validation and deployment

### 3.2 Security Implementation

#### Credential Management

GitHub Secrets securely store sensitive credentials:

\begin{table}
\begin{tabular}{|l|l|}
\hline
Secret Name & Purpose \\
\hline
SSH\_PRIVATE\_KEY & Private SSH key for server authentication \\
SSH\_USER & System user account for remote execution \\
\hline
\end{tabular}
\caption{GitHub Secrets Configuration}
\end{table}

**Security Features:**
\begin{itemize}
\item Encrypted secret storage (AES-256)
\item SSH key isolation per deployment
\item Automatic credential cleanup post-execution
\item No credential exposure in logs or outputs
\item Role-based access control via GitHub organization
\end{itemize}

#### SSH Implementation

The workflow establishes secure remote connections using:

\begin{itemize}
\item RSA-based public key authentication
\item Host key verification via ssh-keyscan
\item Secure file transfer via SCP protocol
\item Session-based execution with timeout protection
\end{itemize}

### 3.3 Upgrade Script Implementation

The `upgrade_splunk_uf.sh` script implements sophisticated upgrade logic with comprehensive error handling.

#### Pre-Upgrade Validation

\begin{enumerate}
\item Root/sudo privilege verification
\item Splunk installation detection at configured SPLUNK\_HOME
\item Installer package validation and availability
\item Current version detection and logging
\end{enumerate}

#### Safe Upgrade Procedure

\begin{enumerate}
\item Graceful Splunk service shutdown
\item Automated backup creation with timestamps
\item Binary extraction with configuration preservation
\item Permission management (splunkadmin user/group)
\item Service restart with verification
\end{enumerate}

#### Post-Upgrade Verification

\begin{enumerate}
\item Version comparison (pre vs. post-upgrade)
\item Service status validation
\item Process health verification
\item Backup location reporting for recovery capability
\end{enumerate}

---

## 4. Operational Procedures

### 4.1 Initial Setup

#### Repository Configuration

1. Clone the upgrade automation repository
2. Configure GitHub organization secrets
3. Grant repository Actions permissions
4. Enable workflow_dispatch triggers

#### Secret Configuration

Navigate to **Settings → Secrets and variables → Actions** and add:

\begin{itemize}
\item SSH\_PRIVATE\_KEY: (Your RSA private key)
\item SSH\_USER: splunkadmin (or equivalent service account)
\end{itemize}

#### Verification

Test SSH connectivity before production use:

ssh -i private_key splunkadmin@target_server "splunk version"

### 4.2 Deployment Operations

#### Manual Upgrade Procedure

1. Navigate to repository **Actions** tab
2. Select **Splunk Enterprise Upgrade** workflow
3. Click **Run workflow**
4. Enter target server IP (e.g., 20.84.40.194)
5. Enter target Splunk version (e.g., 9.2.8)
6. Click **Run workflow** and monitor execution

#### Execution Time Estimates

\begin{table}
\begin{tabular}{|l|r|}
\hline
Operation Phase & Estimated Duration \\
\hline
Installer Download & 2-5 minutes \\
SSH Setup & 1 minute \\
File Transfer & 3-8 minutes \\
Upgrade Execution & 5-10 minutes \\
Verification & 2 minutes \\
Total Process & 13-26 minutes \\
\hline
\end{tabular}
\caption{Typical Upgrade Timeline}
\end{table}

#### Monitoring and Logging

The workflow provides real-time execution logs accessible via:
- GitHub Actions run history
- Detailed step-by-step output
- SSH command execution logs
- Splunk service status reports

### 4.3 Recovery and Rollback

#### Backup Location

Each upgrade creates timestamped backups:
/opt/splunk_backup_YYYYMMDD_HHMMSS/

#### Rollback Procedure

If upgrade verification fails:

1. Restore from backup: `cp -r /opt/splunk_backup_*/etc /opt/splunk/`
2. Restart Splunk service: `sudo systemctl start splunk`
3. Verify restoration: `splunk version`

#### Data Integrity

\begin{itemize}
\item All configuration files backed up pre-upgrade
\item Etc directory preservation during binary extraction
\item No data loss risk due to backup-before-replace strategy
\item Timestamp-based backup isolation for multiple recovery points
\end{itemize}

---

## 5. Advanced Features

### 5.1 GitHub Actions Advantages

#### vs. Azure DevOps Comparison

\begin{table}
\begin{tabular}{|l|c|c|}
\hline
Feature & GitHub Actions & Azure DevOps \\
\hline
Free Minutes (Private Repo) & 2,000/month & Limited \\
Parallelism Restrictions & None & Yes \\
Workflow Syntax & YAML & YAML \\
Manual Triggers & Native & Dashboard \\
Public Repo Cost & Free & Free \\
SSH Integration & Native Secrets & Service Connections \\
\hline
\end{tabular}
\caption{GitHub Actions vs. Azure DevOps}
\end{table}

#### Cost Efficiency

- Public repositories: Unlimited free minutes
- Private repositories: 2,000 free minutes/month
- No parallelism costs or restrictions
- Minimal overhead compared to enterprise CI/CD platforms

### 5.2 Scalability Considerations

#### Multi-Server Upgrades

The architecture supports multiple deployment patterns:

\begin{itemize}
\item Sequential execution for controlled rollout
\item Parallel execution for rapid deployment
\item Staged rollout with validation gates
\item Environment-specific targeting (dev, staging, prod)
\end{itemize}

#### Customization Options

Key variables for environment adaptation:

\begin{itemize}
\item SPLUNK\_HOME: Installation directory path
\item SPLUNK\_INSTALLER\_URL: Custom mirror or local hosting
\item SPLUNK\_VERSION: Target version specification
\item SSH\_USER: Service account for execution
\end{itemize}

---

## 6. Risk Assessment and Mitigation

### 6.1 Identified Risks

\begin{table}
\begin{tabular}{|l|l|l|}
\hline
Risk & Impact & Mitigation \\
\hline
SSH Authentication Failure & Deployment blocked & Verify secrets configuration \\
Network Connectivity Issues & Transfer timeout & Redundant server placement \\
Installer Download Failure & Process aborted & Local mirror hosting \\
Service Start Failure & Rollback required & Pre-upgrade health checks \\
Insufficient Disk Space & Extraction failure & Disk space validation \\
\hline
\end{tabular}
\caption{Risk Assessment Matrix}
\end{table}

### 6.2 Mitigation Strategies

#### Pre-Upgrade Validation

- System prerequisites verification
- Available disk space confirmation
- Network connectivity testing
- SSH access validation

#### Automated Recovery

- Comprehensive error detection
- Automatic rollback triggering
- Backup restoration capability
- Status reporting and alerting

#### Monitoring and Alerting

- GitHub Actions workflow notifications
- Email alerts on failure
- Slack integration available
- Splunk service health monitoring

---

## 7. Troubleshooting Guide

### 7.1 Common Issues and Solutions

#### SSH Connection Failures

**Error**: `Permission denied (publickey)`

**Resolution**:
1. Verify SSH\_PRIVATE\_KEY secret is correctly configured
2. Ensure public key exists in target server `~/.ssh/authorized_keys`
3. Confirm SSH\_USER secret matches actual system username
4. Test manual SSH connection for verification

#### Installer Download Failures

**Error**: `Failed to download installer`

**Solutions**:
- Verify SPLUNK\_INSTALLER\_URL is accessible and correct
- Check network connectivity from GitHub runner to Splunk.com
- Consider hosting installer on internal mirror
- Add retry logic for transient failures

#### Upgrade Script Execution Failures

**Error**: Script execution timeout or permission errors

**Solutions**:
- Verify sudo privileges for SSH user
- Check file permissions on upgrade script
- Review workflow logs for detailed error messages
- Increase timeout thresholds if needed

### 7.2 Debugging Techniques

1. **Enable verbose logging**: Add `-x` flag to bash scripts
2. **SSH test connection**: Manual SSH to validate connectivity
3. **Check GitHub runner logs**: Full execution transcript available
4. **Splunk service logs**: `/opt/splunk/var/log/splunk/splunkd.log`
5. **System logs**: `/var/log/syslog` or `/var/log/messages`

---

## 8. Maintenance and Best Practices

### 8.1 Operational Guidelines

#### Version Management

\begin{itemize}
\item Test upgrades on development environment first
\item Maintain documented upgrade history
\item Implement staged rollout strategy
\item Validate compatibility before production deployment
\end{itemize}

#### Backup Strategy

\begin{itemize}
\item Retain timestamped backups for 30 days minimum
\item Archive critical configurations externally
\item Test backup restoration procedures quarterly
\item Document recovery procedures for all operators
\end{itemize}

#### Security Hygiene

\begin{itemize}
\item Rotate SSH keys annually
\item Review access logs regularly
\item Implement approval gates for production
\item Maintain audit trail of all deployments
\end{itemize}

### 8.2 Continuous Improvement

#### Monitoring Metrics

Track key performance indicators:

\begin{itemize}
\item Upgrade success rate (target: 99%+)
\item Average deployment time
\item Number of rollbacks required
\item MTTR (Mean Time To Recovery)
\end{itemize}

#### Feedback Loop

1. Document all issues encountered
2. Analyze root causes
3. Implement preventive measures
4. Update runbooks based on lessons learned

---

## 9. Compliance and Governance

### 9.1 Change Management

This automation integrates with enterprise change management:

\begin{itemize}
\item GitHub repository serves as change control system
\item Pull requests enable review and approval workflow
\item Commit history provides complete audit trail
\item Branch protection rules enforce quality gates
\end{itemize}

### 9.2 Audit and Compliance

#### Records Retained

\begin{itemize}
\item Workflow execution logs (GitHub Actions history)
\item SSH connection logs (target server authentication)
\item Version change records (Git commit history)
\item Backup creation timestamps and locations
\end{itemize}

#### Regulatory Alignment

- Meets SOC 2 requirements for change management
- Provides audit trail for compliance reviews
- Implements encryption for data in transit
- Supports role-based access control

---

## 10. Recommendations and Future Roadmap

### 10.1 Short-term Recommendations

1. **Deploy to staging environment** for validation
2. **Conduct training** for operations team
3. **Establish runbooks** for common procedures
4. **Implement monitoring** for workflow health

### 10.2 Medium-term Enhancements

1. **Multi-environment support** (dev, staging, production)
2. **Automated scheduling** for monthly patches
3. **Integration with ServiceNow** for change tracking
4. **Enhanced alerting** with Slack/email notifications
5. **Disaster recovery automation** for cluster failover

### 10.3 Long-term Vision

1. **Enterprise-wide deployment automation**
2. **Kubernetes-based Splunk containerization**
3. **GitOps implementation** for full infrastructure
4. **AI-driven anomaly detection** for upgrade validation
5. **Zero-touch production deployments** with approval gates

---

## 11. Conclusion

The Splunk Enterprise Upgrade Automation infrastructure represents a significant advancement in operational maturity and reliability. By combining GitHub Actions with robust shell scripting, we have created an enterprise-grade deployment system that:

- **Reduces operational risk** through automated procedures
- **Improves consistency** across infrastructure
- **Enhances visibility** with comprehensive logging
- **Accelerates deployment** for faster time-to-value
- **Maintains compliance** with audit trails and governance

This implementation positions the organization to rapidly respond to security updates, feature releases, and operational requirements while maintaining strict quality and reliability standards.

---

## Appendix A: File Manifest

The implementation includes the following files:

| File | Purpose | Maintainer |
|------|---------|-----------|
| `.github/workflows/splunk-upgrade.yml` | GitHub Actions workflow | DevOps Team |
| `upgrade_splunk_uf.sh` | Upgrade execution script | DevOps Team |
| `update_github.sh` | Git management utility | Development Team |
| `README.md` | Quick start guide | Documentation |
| `GITHUB_ACTIONS_GUIDE.md` | Detailed setup guide | DevOps Team |

---

## Appendix B: Quick Reference

### Repository Secrets Required

SSH_PRIVATE_KEY = [Your RSA private key content]
SSH_USER = splunkadmin

### Common Workflow Inputs

\begin{itemize}
\item target\_server: 20.84.40.194 (default)
\item splunk\_version: 9.2.8 (default)
\end{itemize}

### Key Directories

\begin{itemize}
\item Splunk Installation: /opt/splunk
\item Backup Location: /opt/splunk\_backup\_YYYYMMDD\_HHMMSS
\item Workflow Directory: .github/workflows/
\end{itemize}

---
