#!/usr/bin/env bash
# DropFly Agent — Deploy to AWS EC2 via ECR
#
# Usage:
#   ./infrastructure/scripts/deploy.sh              # Deploy latest
#   ./infrastructure/scripts/deploy.sh v1.2.3       # Deploy specific tag
#
# Prerequisites:
#   - AWS CLI configured with appropriate credentials
#   - Docker installed
#   - Terraform outputs available (or set ECR_REPO and INSTANCE_IP env vars)

set -euo pipefail

TAG="${1:-latest}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TF_DIR="$SCRIPT_DIR/../terraform"

echo "=== DropFly Agent Deploy ==="
echo "Tag: $TAG"
echo "Project: $PROJECT_ROOT"
echo ""

# -------------------------------------------------------------------
# 1. Get infrastructure details from Terraform or env vars
# -------------------------------------------------------------------

if [ -z "${ECR_REPO:-}" ]; then
    echo "→ Reading Terraform outputs..."
    cd "$TF_DIR"
    ECR_REPO=$(terraform output -raw ecr_repository_url 2>/dev/null || echo "")
    INSTANCE_IP=$(terraform output -raw public_ip 2>/dev/null || echo "")
    AWS_REGION=$(terraform output -raw aws_region 2>/dev/null || echo "us-east-1")
    cd "$PROJECT_ROOT"
fi

if [ -z "$ECR_REPO" ]; then
    echo "ERROR: ECR_REPO not set and Terraform outputs unavailable."
    echo "Either run 'terraform apply' first or set ECR_REPO env var."
    exit 1
fi

AWS_REGION="${AWS_REGION:-us-east-1}"
echo "→ ECR Repo: $ECR_REPO"
echo "→ Instance: ${INSTANCE_IP:-not set}"
echo "→ Region:   $AWS_REGION"
echo ""

# -------------------------------------------------------------------
# 2. Build Docker image
# -------------------------------------------------------------------

echo "→ Building Docker image..."
docker build -t "dropfly-agent:$TAG" "$PROJECT_ROOT"

# Also build sandbox image
echo "→ Building sandbox image..."
docker build -t "dropfly-sandbox:latest" -f "$PROJECT_ROOT/infrastructure/docker/Dockerfile.sandbox" "$PROJECT_ROOT/infrastructure/docker"

# -------------------------------------------------------------------
# 3. Tag and push to ECR
# -------------------------------------------------------------------

echo "→ Authenticating with ECR..."
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REPO"

echo "→ Tagging image..."
docker tag "dropfly-agent:$TAG" "$ECR_REPO:$TAG"
docker tag "dropfly-agent:$TAG" "$ECR_REPO:latest"

echo "→ Pushing to ECR..."
docker push "$ECR_REPO:$TAG"
docker push "$ECR_REPO:latest"

echo "→ Image pushed: $ECR_REPO:$TAG"

# -------------------------------------------------------------------
# 4. Deploy to EC2 (restart the service)
# -------------------------------------------------------------------

if [ -n "${INSTANCE_IP:-}" ]; then
    KEY_FILE="${SSH_KEY_FILE:-~/.ssh/dropfly-key.pem}"

    if [ -f "$KEY_FILE" ]; then
        echo "→ Restarting service on EC2..."
        ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" "ubuntu@$INSTANCE_IP" << 'REMOTE'
            # Pull latest image
            ECR_REPO=$(docker inspect --format='{{.Config.Image}}' dropfly-agent 2>/dev/null | cut -d: -f1 || echo "")
            if [ -n "$ECR_REPO" ]; then
                aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "$ECR_REPO"
            fi

            # Restart via systemd
            sudo systemctl restart dropfly-agent

            # Wait for health check
            echo "Waiting for service to start..."
            for i in $(seq 1 30); do
                if curl -sf http://localhost:8420/status > /dev/null 2>&1; then
                    echo "Service is healthy!"
                    exit 0
                fi
                sleep 2
            done
            echo "WARNING: Service did not become healthy within 60s"
            sudo journalctl -u dropfly-agent --no-pager -n 20
REMOTE
        echo "→ Deploy complete!"
    else
        echo "→ SSH key not found at $KEY_FILE — skipping remote restart."
        echo "  Manually restart: ssh -i KEY ubuntu@$INSTANCE_IP 'sudo systemctl restart dropfly-agent'"
    fi
else
    echo "→ No instance IP — image pushed to ECR only."
    echo "  Manually restart the service on the EC2 instance."
fi

echo ""
echo "=== Deploy finished ==="
echo "API:       http://${INSTANCE_IP:-<instance-ip>}:8420"
echo "WebSocket: ws://${INSTANCE_IP:-<instance-ip>}:8420/ws"
echo "Health:    http://${INSTANCE_IP:-<instance-ip>}:8420/status"
