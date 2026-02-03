# DropFly Agent — Security Groups & IAM

# -------------------------------------------------------------------
# Security Group
# -------------------------------------------------------------------

resource "aws_security_group" "agent" {
  name_prefix = "${local.name_prefix}-"
  description = "DropFly Agent instance security group"
  vpc_id      = aws_vpc.main.id

  # API Gateway (port 8420)
  ingress {
    description = "API Gateway"
    from_port   = 8420
    to_port     = 8420
    protocol    = "tcp"
    cidr_blocks = var.allowed_api_cidrs
  }

  # SSH — only if CIDRs are specified (prefer Tailscale)
  dynamic "ingress" {
    for_each = length(var.allowed_ssh_cidrs) > 0 ? [1] : []
    content {
      description = "SSH access"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = var.allowed_ssh_cidrs
    }
  }

  # Tailscale (UDP 41641)
  ingress {
    description = "Tailscale WireGuard"
    from_port   = 41641
    to_port     = 41641
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name_prefix}-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# -------------------------------------------------------------------
# IAM Role for EC2
# -------------------------------------------------------------------

resource "aws_iam_role" "agent" {
  name = "${local.name_prefix}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${local.name_prefix}-role"
  }
}

# Secrets Manager read access
resource "aws_iam_role_policy" "secrets_access" {
  name = "${local.name_prefix}-secrets"
  role = aws_iam_role.agent.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
        ]
        Resource = [aws_secretsmanager_secret.agent_secrets.arn]
      }
    ]
  })
}

# ECR pull access
resource "aws_iam_role_policy" "ecr_access" {
  name = "${local.name_prefix}-ecr"
  role = aws_iam_role.agent.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:GetAuthorizationToken",
        ]
        Resource = ["*"]
      }
    ]
  })
}

# CloudWatch Logs write access
resource "aws_iam_role_policy" "cloudwatch_access" {
  name = "${local.name_prefix}-cloudwatch"
  role = aws_iam_role.agent.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = ["${aws_cloudwatch_log_group.agent.arn}:*"]
      }
    ]
  })
}

# S3 access for deployments (optional)
resource "aws_iam_role_policy" "s3_deploy" {
  name = "${local.name_prefix}-s3"
  role = aws_iam_role.agent.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetObject", "s3:ListBucket", "s3:DeleteObject"]
        Resource = ["arn:aws:s3:::dropfly-*", "arn:aws:s3:::dropfly-*/*"]
      }
    ]
  })
}

# Instance profile
resource "aws_iam_instance_profile" "agent" {
  name = "${local.name_prefix}-profile"
  role = aws_iam_role.agent.name
}
