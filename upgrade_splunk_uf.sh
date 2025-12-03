#!/bin/bash
#
# Splunk Enterprise Upgrade Script
# This script performs an in-place upgrade of Splunk Enterprise
#

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Required environment variables
SPLUNK_VERSION="${SPLUNK_VERSION:-9.2.8}"
SPLUNK_INSTALLER_PATH="${SPLUNK_INSTALLER_PATH:-/opt/splunk_installer.tgz}"
SPLUNK_HOME="${SPLUNK_HOME:-/opt/splunk}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Splunk Enterprise Upgrade Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Target Version: $SPLUNK_VERSION"
echo "Installer Path: $SPLUNK_INSTALLER_PATH"
echo "Splunk Home: $SPLUNK_HOME"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root or with sudo${NC}"
    exit 1
fi

# Check if Splunk is installed
if [ ! -d "$SPLUNK_HOME" ]; then
    echo -e "${RED}Error: Splunk not found at $SPLUNK_HOME${NC}"
    exit 1
fi

# Check if installer exists
if [ ! -f "$SPLUNK_INSTALLER_PATH" ]; then
    echo -e "${RED}Error: Installer not found at $SPLUNK_INSTALLER_PATH${NC}"
    exit 1
fi

# Get current Splunk version
echo -e "${YELLOW}Getting current Splunk version...${NC}"
CURRENT_VERSION=$($SPLUNK_HOME/bin/splunk version --accept-license --answer-yes 2>/dev/null | grep "^Splunk" | awk '{print $2}')
echo "Current Version: $CURRENT_VERSION"

# Stop Splunk
echo -e "${YELLOW}Stopping Splunk...${NC}"
$SPLUNK_HOME/bin/splunk stop

# Backup current installation (optional but recommended)
BACKUP_DIR="/opt/splunk_backup_$(date +%Y%m%d_%H%M%S)"
echo -e "${YELLOW}Creating backup at $BACKUP_DIR...${NC}"
mkdir -p "$BACKUP_DIR"
cp -r "$SPLUNK_HOME/etc" "$BACKUP_DIR/" || {
    echo -e "${RED}Warning: Failed to backup etc directory${NC}"
}

# Extract new Splunk version directly to /opt/
# This will preserve the etc directory and upgrade the binaries
echo -e "${YELLOW}Extracting and upgrading Splunk...${NC}"
tar xvzf "$SPLUNK_INSTALLER_PATH" -C /opt/

# Set correct permissions BEFORE starting Splunk
echo -e "${YELLOW}Setting permissions...${NC}"
chown -R splunkadmin:splunkadmin "$SPLUNK_HOME"

# Start Splunk as splunkadmin user
echo -e "${YELLOW}Starting Splunk as splunkadmin user...${NC}"
sudo -u splunkadmin $SPLUNK_HOME/bin/splunk start --accept-license --answer-yes

# Verify upgrade
echo -e "${YELLOW}Verifying upgrade...${NC}"
NEW_VERSION=$($SPLUNK_HOME/bin/splunk version 2>/dev/null | grep "^Splunk" | awk '{print $2}')
echo "New Version: $NEW_VERSION"

# Check if Splunk is running
if $SPLUNK_HOME/bin/splunk status >/dev/null 2>&1; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Upgrade completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo "Previous Version: $CURRENT_VERSION"
    echo "Current Version: $NEW_VERSION"
    echo "Backup Location: $BACKUP_DIR"
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}Error: Splunk failed to start${NC}"
    echo -e "${RED}========================================${NC}"
    echo "Backup is available at: $BACKUP_DIR"
    exit 1
fi

echo -e "${GREEN}Done!${NC}"
