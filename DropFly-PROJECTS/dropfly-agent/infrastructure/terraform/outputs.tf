# DropFly Agent — Terraform Outputs

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.agent.id
}

output "public_ip" {
  description = "Elastic IP (static public IP)"
  value       = aws_eip.agent.public_ip
}

output "api_url" {
  description = "API Gateway URL"
  value       = "http://${aws_eip.agent.public_ip}:8420"
}

output "ws_url" {
  description = "WebSocket URL"
  value       = "ws://${aws_eip.agent.public_ip}:8420/ws"
}

output "ecr_repository_url" {
  description = "ECR repository URL for Docker images"
  value       = aws_ecr_repository.agent.repository_url
}

output "secrets_arn" {
  description = "ARN of the Secrets Manager secret"
  value       = aws_secretsmanager_secret.agent_secrets.arn
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.agent.id
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.agent.name
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_eip.agent.public_ip}"
}
