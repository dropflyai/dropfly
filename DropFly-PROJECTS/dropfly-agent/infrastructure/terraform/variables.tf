# DropFly Agent — Terraform Variables
# All configurable parameters for the AWS infrastructure.

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "dropfly-agent"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
  validation {
    condition     = contains(["production", "staging", "dev"], var.environment)
    error_message = "Environment must be production, staging, or dev."
  }
}

variable "aws_region" {
  description = "AWS region to deploy to"
  type        = string
  default     = "us-east-1"
}

# -------------------------------------------------------------------
# EC2
# -------------------------------------------------------------------

variable "instance_type" {
  description = "EC2 instance type (t3.xlarge recommended for production)"
  type        = string
  default     = "t3.xlarge"
}

variable "volume_size" {
  description = "Root EBS volume size in GB"
  type        = number
  default     = 100
}

variable "key_pair_name" {
  description = "Name of the SSH key pair for EC2 access"
  type        = string
}

# -------------------------------------------------------------------
# Networking
# -------------------------------------------------------------------

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "Public subnet CIDR"
  type        = string
  default     = "10.0.1.0/24"
}

variable "allowed_ssh_cidrs" {
  description = "CIDR blocks allowed to SSH into the instance"
  type        = list(string)
  default     = []  # Empty = no direct SSH; use Tailscale instead
}

variable "allowed_api_cidrs" {
  description = "CIDR blocks allowed to access the API (port 8420)"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # Lock down in production
}

# -------------------------------------------------------------------
# Secrets
# -------------------------------------------------------------------

variable "anthropic_api_key" {
  description = "Anthropic API key (stored in AWS Secrets Manager)"
  type        = string
  sensitive   = true
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  sensitive   = true
}

variable "supabase_service_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
}

variable "gateway_secret_key" {
  description = "Secret key for JWT signing"
  type        = string
  sensitive   = true
}

# Optional API keys — pass empty string to skip
variable "openai_api_key" {
  description = "OpenAI API key (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "twilio_account_sid" {
  description = "Twilio account SID (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "twilio_auth_token" {
  description = "Twilio auth token (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "twilio_phone_number" {
  description = "Twilio phone number (optional)"
  type        = string
  default     = ""
}

variable "elevenlabs_api_key" {
  description = "ElevenLabs API key (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "tavily_api_key" {
  description = "Tavily search API key (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

# -------------------------------------------------------------------
# Tags
# -------------------------------------------------------------------

variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}
