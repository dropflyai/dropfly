# DropFly Agent — EC2 Instance

# -------------------------------------------------------------------
# AMI (latest Amazon Linux 2023 or Ubuntu 24.04)
# -------------------------------------------------------------------

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# -------------------------------------------------------------------
# User Data  (bootstrap script)
# -------------------------------------------------------------------

locals {
  user_data = <<-EOF
    #!/bin/bash
    set -euo pipefail

    # Log everything
    exec > >(tee /var/log/dropfly-setup.log) 2>&1
    echo "=== DropFly Agent Setup: $(date) ==="

    # System updates
    apt-get update -y
    apt-get upgrade -y

    # Install Docker
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Install AWS CLI v2
    curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
    apt-get install -y unzip
    unzip -q /tmp/awscliv2.zip -d /tmp
    /tmp/aws/install
    rm -rf /tmp/aws /tmp/awscliv2.zip

    # Install Tailscale
    curl -fsSL https://tailscale.com/install.sh | sh

    # Create app user
    useradd -m -s /bin/bash -G docker dropfly

    # Create directories
    mkdir -p /opt/dropfly /opt/dropfly/workspaces /opt/dropfly/logs
    chown -R dropfly:dropfly /opt/dropfly

    # Pull secrets from AWS Secrets Manager and write .env
    SECRET_ARN="${aws_secretsmanager_secret.agent_secrets.arn}"
    SECRETS=$(aws secretsmanager get-secret-value --secret-id "$SECRET_ARN" --query SecretString --output text --region ${var.aws_region})

    # Write .env file
    echo "$SECRETS" | python3 -c "
    import json, sys
    secrets = json.load(sys.stdin)
    with open('/opt/dropfly/.env', 'w') as f:
        for k, v in secrets.items():
            if v:
                f.write(f'{k}={v}\n')
        f.write('GATEWAY_HOST=0.0.0.0\n')
        f.write('GATEWAY_PORT=8420\n')
        f.write('WORKSPACE_ROOT=/opt/dropfly/workspaces\n')
        f.write('SANDBOX_ENABLED=true\n')
    "
    chmod 600 /opt/dropfly/.env
    chown dropfly:dropfly /opt/dropfly/.env

    # Login to ECR and pull image
    ECR_REPO="${aws_ecr_repository.agent.repository_url}"
    aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin "$ECR_REPO"
    docker pull "$ECR_REPO:latest" || echo "No image yet — deploy first"

    # Create systemd service
    cat > /etc/systemd/system/dropfly-agent.service << 'SYSTEMD'
    [Unit]
    Description=DropFly Agent
    After=docker.service
    Requires=docker.service

    [Service]
    Type=simple
    User=dropfly
    WorkingDirectory=/opt/dropfly
    ExecStartPre=/usr/bin/docker pull ${aws_ecr_repository.agent.repository_url}:latest
    ExecStart=/usr/bin/docker run --rm \
      --name dropfly-agent \
      --env-file /opt/dropfly/.env \
      -p 8420:8420 \
      -v /opt/dropfly/workspaces:/app/workspaces \
      -v /var/run/docker.sock:/var/run/docker.sock \
      ${aws_ecr_repository.agent.repository_url}:latest
    ExecStop=/usr/bin/docker stop dropfly-agent
    Restart=always
    RestartSec=10

    [Install]
    WantedBy=multi-user.target
    SYSTEMD

    systemctl daemon-reload
    systemctl enable dropfly-agent

    echo "=== DropFly Agent Setup Complete ==="
  EOF
}

# -------------------------------------------------------------------
# EC2 Instance
# -------------------------------------------------------------------

resource "aws_instance" "agent" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.agent.id]
  iam_instance_profile   = aws_iam_instance_profile.agent.name

  user_data = base64encode(locals.user_data)

  root_block_device {
    volume_size           = var.volume_size
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  metadata_options {
    http_tokens                 = "required"  # IMDSv2 only
    http_put_response_hop_limit = 1
  }

  tags = {
    Name = "${local.name_prefix}-instance"
  }
}

# -------------------------------------------------------------------
# Elastic IP  (static public IP)
# -------------------------------------------------------------------

resource "aws_eip" "agent" {
  instance = aws_instance.agent.id
  domain   = "vpc"

  tags = {
    Name = "${local.name_prefix}-eip"
  }
}
