# DropFly Agent — Terraform Main
# AWS infrastructure: VPC, Secrets Manager, ECR

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment to use S3 backend for remote state
  # backend "s3" {
  #   bucket = "dropfly-terraform-state"
  #   key    = "agent/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = merge(var.tags, {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    })
  }
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# -------------------------------------------------------------------
# VPC
# -------------------------------------------------------------------

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${local.name_prefix}-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${local.name_prefix}-igw"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.name_prefix}-public"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${local.name_prefix}-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# -------------------------------------------------------------------
# Secrets Manager  (never plain text)
# -------------------------------------------------------------------

resource "aws_secretsmanager_secret" "agent_secrets" {
  name                    = "${local.name_prefix}/secrets"
  description             = "DropFly Agent API keys and credentials"
  recovery_window_in_days = 7

  tags = {
    Name = "${local.name_prefix}-secrets"
  }
}

resource "aws_secretsmanager_secret_version" "agent_secrets" {
  secret_id = aws_secretsmanager_secret.agent_secrets.id
  secret_string = jsonencode({
    ANTHROPIC_API_KEY    = var.anthropic_api_key
    OPENAI_API_KEY       = var.openai_api_key
    SUPABASE_URL         = var.supabase_url
    SUPABASE_SERVICE_KEY = var.supabase_service_key
    GATEWAY_SECRET_KEY   = var.gateway_secret_key
    TWILIO_ACCOUNT_SID   = var.twilio_account_sid
    TWILIO_AUTH_TOKEN     = var.twilio_auth_token
    TWILIO_PHONE_NUMBER  = var.twilio_phone_number
    ELEVENLABS_API_KEY   = var.elevenlabs_api_key
    TAVILY_API_KEY       = var.tavily_api_key
  })
}

# -------------------------------------------------------------------
# ECR Repository  (Docker image registry)
# -------------------------------------------------------------------

resource "aws_ecr_repository" "agent" {
  name                 = var.project_name
  image_tag_mutability = "MUTABLE"
  force_delete         = var.environment != "production"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${local.name_prefix}-ecr"
  }
}

resource "aws_ecr_lifecycle_policy" "agent" {
  repository = aws_ecr_repository.agent.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# -------------------------------------------------------------------
# CloudWatch Log Group
# -------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "agent" {
  name              = "/dropfly/${var.environment}/agent"
  retention_in_days = 30

  tags = {
    Name = "${local.name_prefix}-logs"
  }
}
