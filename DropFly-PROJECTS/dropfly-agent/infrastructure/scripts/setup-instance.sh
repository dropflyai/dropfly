#!/usr/bin/env bash
# DropFly Agent — Initial EC2 Instance Setup
#
# Run this on a fresh Ubuntu 24.04 EC2 instance to set up the environment.
# Normally called automatically via Terraform user_data, but can be run
# manually if needed.
#
# Usage:
#   ssh -i key.pem ubuntu@<ip> 'bash -s' < infrastructure/scripts/setup-instance.sh

set -euo pipefail

echo "=== DropFly Agent Instance Setup: $(date) ==="

# -------------------------------------------------------------------
# 1. System updates
# -------------------------------------------------------------------

echo "→ Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    unzip \
    jq \
    htop \
    tmux \
    git

# -------------------------------------------------------------------
# 2. Docker
# -------------------------------------------------------------------

echo "→ Installing Docker..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# Add current user to docker group
sudo usermod -aG docker "$USER" || true

# -------------------------------------------------------------------
# 3. AWS CLI v2
# -------------------------------------------------------------------

echo "→ Installing AWS CLI v2..."
if ! command -v aws &> /dev/null; then
    curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
    unzip -q /tmp/awscliv2.zip -d /tmp
    sudo /tmp/aws/install
    rm -rf /tmp/aws /tmp/awscliv2.zip
fi

# -------------------------------------------------------------------
# 4. Tailscale
# -------------------------------------------------------------------

echo "→ Installing Tailscale..."
if ! command -v tailscale &> /dev/null; then
    curl -fsSL https://tailscale.com/install.sh | sh
fi
echo "  Run 'sudo tailscale up' to connect to your tailnet."

# -------------------------------------------------------------------
# 5. Node.js 22 (for agent builds)
# -------------------------------------------------------------------

echo "→ Installing Node.js 22..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
    sudo apt-get install -y nodejs
fi
echo "  Node: $(node --version)"
echo "  npm:  $(npm --version)"

# -------------------------------------------------------------------
# 6. Python 3.12 (should be pre-installed on Ubuntu 24.04)
# -------------------------------------------------------------------

echo "→ Checking Python..."
python3 --version
sudo apt-get install -y python3-pip python3-venv

# -------------------------------------------------------------------
# 7. Application directories
# -------------------------------------------------------------------

echo "→ Setting up application directories..."
sudo mkdir -p /opt/dropfly/workspaces /opt/dropfly/logs

# Create app user if not exists
if ! id -u dropfly &> /dev/null; then
    sudo useradd -m -s /bin/bash -G docker dropfly
fi
sudo chown -R dropfly:dropfly /opt/dropfly

# -------------------------------------------------------------------
# 8. Firewall (UFW)
# -------------------------------------------------------------------

echo "→ Configuring firewall..."
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 8420/tcp    # API gateway
sudo ufw allow 41641/udp   # Tailscale
sudo ufw --force enable

# -------------------------------------------------------------------
# 9. Swap (useful for t3.medium or smaller)
# -------------------------------------------------------------------

echo "→ Setting up swap..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# -------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------

echo ""
echo "=== Setup Complete ==="
echo "Docker:     $(docker --version)"
echo "AWS CLI:    $(aws --version)"
echo "Node.js:    $(node --version)"
echo "Python:     $(python3 --version)"
echo "Tailscale:  $(tailscale version 2>/dev/null || echo 'installed')"
echo ""
echo "Next steps:"
echo "  1. sudo tailscale up                    # Connect to tailnet"
echo "  2. Copy .env to /opt/dropfly/.env       # Or pull from Secrets Manager"
echo "  3. Run deploy.sh to push the Docker image"
echo "  4. sudo systemctl start dropfly-agent   # Start the service"
