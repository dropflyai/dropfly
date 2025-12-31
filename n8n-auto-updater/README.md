# n8n Auto-Updater

Auto-update n8n Docker containers on AWS EC2 with backup, rollback, and Discord notifications.

## Features

- Weekly scheduled updates (Sunday 3 AM)
- Pre-update backup (config + data volume)
- Automatic rollback on health check failure
- Discord notifications for success/failure
- Old backup cleanup (keeps last 10)
- **AWS SSM deployment** (no SSH required)

## Quick Start

### 1. Configure AWS Credentials

```bash
cp credentials/.env.example credentials/.env
nano credentials/.env
```

Add your AWS credentials:
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-2
AWS_EC2_INSTANCE_ID=i-your_instance_id
AWS_S3_BUCKET=your-deployment-bucket
```

### 2. Deploy to EC2 via SSM

```bash
./scripts/deploy-to-ec2.sh
```

This will:
1. Upload files to S3
2. Create `/opt/n8n/` on EC2 via SSM
3. Download files from S3 to EC2
4. Set up weekly cron job

### 3. Configure n8n on EC2

Run these SSM commands to complete setup:

```bash
# Set your Discord webhook
aws ssm send-command \
  --instance-ids "i-YOUR_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["sed -i \"s|DISCORD_WEBHOOK_URL=.*|DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK|\" /opt/n8n/config/updater-config.sh"]'

# Create .env file
aws ssm send-command \
  --instance-ids "i-YOUR_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["cp /opt/n8n/.env.example /opt/n8n/.env"]'

# Start n8n
aws ssm send-command \
  --instance-ids "i-YOUR_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["cd /opt/n8n && docker compose up -d"]'
```

## Manual Commands via SSM

### Check for updates manually
```bash
aws ssm send-command \
  --instance-ids "i-YOUR_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["/opt/n8n/scripts/n8n-updater.sh"]'
```

### Run health check
```bash
aws ssm send-command \
  --instance-ids "i-YOUR_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["/opt/n8n/scripts/n8n-health-check.sh"]'
```

### View logs
```bash
aws ssm send-command \
  --instance-ids "i-YOUR_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["tail -100 /opt/n8n/logs/cron.log"]'
```

### List backups
```bash
aws ssm send-command \
  --instance-ids "i-YOUR_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["ls -la /opt/n8n/backups/"]'
```

### Rollback to backup
```bash
aws ssm send-command \
  --instance-ids "i-YOUR_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["/opt/n8n/scripts/n8n-rollback.sh 20241225_030000"]'
```

## File Structure

```
/opt/n8n/                   # On EC2
├── docker-compose.yml      # n8n container config
├── .env                    # Environment variables
├── config/
│   └── updater-config.sh   # Updater settings
├── scripts/
│   ├── n8n-updater.sh      # Main update script
│   ├── n8n-rollback.sh     # Restore from backup
│   ├── n8n-notify.sh       # Discord notifications
│   └── n8n-health-check.sh # Health verification
├── backups/                # Timestamped backups
└── logs/                   # Update logs
```

## Troubleshooting

### Check SSM command status
```bash
aws ssm get-command-invocation \
  --command-id "COMMAND_ID" \
  --instance-id "i-YOUR_INSTANCE_ID" \
  --query 'StandardOutputContent' \
  --output text
```

### n8n won't start after update
```bash
# Check logs
aws ssm send-command \
  --instance-ids "i-YOUR_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker logs n8n --tail 50"]'

# Rollback
aws ssm send-command \
  --instance-ids "i-YOUR_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["/opt/n8n/scripts/n8n-rollback.sh BACKUP_TIMESTAMP"]'
```

### No notifications
Test Discord webhook:
```bash
aws ssm send-command \
  --instance-ids "i-YOUR_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["/opt/n8n/scripts/n8n-notify.sh success \"Test notification\""]'
```
