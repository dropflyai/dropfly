#!/bin/bash
# ============================================================
# DEPLOY N8N AUTO-UPDATER TO EC2 VIA AWS SSM
# Usage: ./deploy-to-ec2.sh
#
# Prerequisites:
# - AWS CLI configured with credentials
# - EC2 instance has SSM Agent running
# - S3 bucket for file transfer
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load AWS credentials if available
if [ -f "$SCRIPT_DIR/../credentials/.env" ]; then
    source "$SCRIPT_DIR/../credentials/.env"
fi

# Configuration - UPDATE THESE
EC2_INSTANCE_ID="${AWS_EC2_INSTANCE_ID:-i-YOUR_INSTANCE_ID}"
S3_BUCKET="${AWS_S3_BUCKET:-your-deployment-bucket}"
AWS_REGION="${AWS_DEFAULT_REGION:-us-east-2}"
REMOTE_DIR="/opt/n8n"

echo "=========================================="
echo "Deploying n8n Auto-Updater via AWS SSM"
echo "=========================================="
echo "Instance: $EC2_INSTANCE_ID"
echo "Region: $AWS_REGION"
echo "S3 Bucket: $S3_BUCKET"
echo ""

# Step 1: Upload files to S3
echo "[1/4] Uploading files to S3..."
aws s3 sync "$SCRIPT_DIR" "s3://$S3_BUCKET/n8n-auto-updater/" \
    --exclude "*.git*" \
    --exclude "backups/*" \
    --exclude "logs/*"

echo "Files uploaded to s3://$S3_BUCKET/n8n-auto-updater/"

# Step 2: Create remote directory and download from S3
echo "[2/4] Setting up remote directory..."
SETUP_COMMAND_ID=$(aws ssm send-command \
    --instance-ids "$EC2_INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=[
        'sudo mkdir -p $REMOTE_DIR',
        'sudo chown ubuntu:ubuntu $REMOTE_DIR',
        'mkdir -p $REMOTE_DIR/backups $REMOTE_DIR/logs $REMOTE_DIR/scripts $REMOTE_DIR/config'
    ]" \
    --query 'Command.CommandId' \
    --output text \
    --region "$AWS_REGION")

echo "Setup command sent: $SETUP_COMMAND_ID"
sleep 5

# Step 3: Download files from S3 to EC2
echo "[3/4] Downloading files to EC2..."
DOWNLOAD_COMMAND_ID=$(aws ssm send-command \
    --instance-ids "$EC2_INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=[
        'aws s3 sync s3://$S3_BUCKET/n8n-auto-updater/ $REMOTE_DIR/',
        'chmod +x $REMOTE_DIR/scripts/*.sh',
        'ls -la $REMOTE_DIR/',
        'ls -la $REMOTE_DIR/scripts/'
    ]" \
    --query 'Command.CommandId' \
    --output text \
    --region "$AWS_REGION")

echo "Download command sent: $DOWNLOAD_COMMAND_ID"
echo "Waiting for completion..."
sleep 10

# Get output
aws ssm get-command-invocation \
    --command-id "$DOWNLOAD_COMMAND_ID" \
    --instance-id "$EC2_INSTANCE_ID" \
    --query 'StandardOutputContent' \
    --output text \
    --region "$AWS_REGION" 2>/dev/null || echo "(waiting for command to complete...)"

# Step 4: Set up cron job
echo ""
echo "[4/4] Setting up cron job..."
CRON_COMMAND_ID=$(aws ssm send-command \
    --instance-ids "$EC2_INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=[
        '(crontab -l 2>/dev/null | grep -v n8n-updater; echo \"0 3 * * 0 $REMOTE_DIR/scripts/n8n-updater.sh >> $REMOTE_DIR/logs/cron.log 2>&1\") | crontab -',
        'crontab -l'
    ]" \
    --query 'Command.CommandId' \
    --output text \
    --region "$AWS_REGION")

echo "Cron command sent: $CRON_COMMAND_ID"
sleep 5

# Get cron output
echo ""
echo "Current crontab:"
aws ssm get-command-invocation \
    --command-id "$CRON_COMMAND_ID" \
    --instance-id "$EC2_INSTANCE_ID" \
    --query 'StandardOutputContent' \
    --output text \
    --region "$AWS_REGION" 2>/dev/null || echo "(waiting for command to complete...)"

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure Discord webhook via SSM:"
echo "   aws ssm send-command \\"
echo "     --instance-ids \"$EC2_INSTANCE_ID\" \\"
echo "     --document-name \"AWS-RunShellScript\" \\"
echo "     --parameters 'commands=[\"nano $REMOTE_DIR/config/updater-config.sh\"]'"
echo ""
echo "2. Set up .env file:"
echo "   aws ssm send-command \\"
echo "     --instance-ids \"$EC2_INSTANCE_ID\" \\"
echo "     --document-name \"AWS-RunShellScript\" \\"
echo "     --parameters 'commands=[\"cp $REMOTE_DIR/.env.example $REMOTE_DIR/.env\"]'"
echo ""
echo "3. Start n8n:"
echo "   aws ssm send-command \\"
echo "     --instance-ids \"$EC2_INSTANCE_ID\" \\"
echo "     --document-name \"AWS-RunShellScript\" \\"
echo "     --parameters 'commands=[\"cd $REMOTE_DIR && docker compose up -d\"]'"
echo ""
echo "4. Run health check:"
echo "   aws ssm send-command \\"
echo "     --instance-ids \"$EC2_INSTANCE_ID\" \\"
echo "     --document-name \"AWS-RunShellScript\" \\"
echo "     --parameters 'commands=[\"$REMOTE_DIR/scripts/n8n-health-check.sh\"]'"
echo ""
