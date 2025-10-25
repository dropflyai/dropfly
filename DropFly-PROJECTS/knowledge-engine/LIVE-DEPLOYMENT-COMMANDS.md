# DropFly Knowledge Engine™ - LIVE DEPLOYMENT COMMANDS 🚀

**EXECUTE THESE COMMANDS NOW - INFRASTRUCTURE DEPLOYMENT**

---

## 🔥 **STEP 1: AWS INFRASTRUCTURE (Execute in Terminal)**

### **1.1 Configure AWS CLI (If not already done)**
```bash
# Install AWS CLI (if needed)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# Enter your Access Key, Secret Key, us-east-1, json
```

### **1.2 Create Core VPC Infrastructure**
```bash
# Create VPC for DropFly Knowledge Engine
VPC_ID=$(aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=DropFly-Knowledge-VPC}]' \
  --query 'Vpc.VpcId' --output text)

echo "VPC Created: $VPC_ID"

# Create Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=DropFly-Knowledge-IGW}]' \
  --query 'InternetGateway.InternetGatewayId' --output text)

# Attach Internet Gateway to VPC
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

echo "Internet Gateway Created and Attached: $IGW_ID"

# Create Public Subnet
SUBNET_ID=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=DropFly-Knowledge-Public-Subnet}]' \
  --query 'Subnet.SubnetId' --output text)

echo "Public Subnet Created: $SUBNET_ID"

# Create Route Table
ROUTE_TABLE_ID=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=DropFly-Knowledge-RT}]' \
  --query 'RouteTable.RouteTableId' --output text)

# Add route to Internet Gateway
aws ec2 create-route \
  --route-table-id $ROUTE_TABLE_ID \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW_ID

# Associate Route Table with Subnet
aws ec2 associate-route-table \
  --subnet-id $SUBNET_ID \
  --route-table-id $ROUTE_TABLE_ID

echo "Route Table Created and Associated: $ROUTE_TABLE_ID"
```

### **1.3 Create Security Groups**
```bash
# Create Security Group for Knowledge Engine
SG_ID=$(aws ec2 create-security-group \
  --group-name DropFly-Knowledge-SG \
  --description "Security group for DropFly Knowledge Engine" \
  --vpc-id $VPC_ID \
  --tag-specifications 'ResourceType=security-group,Tags=[{Key=Name,Value=DropFly-Knowledge-SG}]' \
  --query 'GroupId' --output text)

echo "Security Group Created: $SG_ID"

# Add inbound rules
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 8080 \
  --cidr 0.0.0.0/0

echo "Security Group Rules Added"
```

### **1.4 Launch EC2 Instances**
```bash
# Create Key Pair (if doesn't exist)
aws ec2 create-key-pair \
  --key-name dropfly-knowledge-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/dropfly-knowledge-key.pem

chmod 400 ~/.ssh/dropfly-knowledge-key.pem

# Get latest Ubuntu 24.04 AMI ID
AMI_ID=$(aws ssm get-parameters \
  --names /aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id \
  --query 'Parameters[0].[Value]' --output text)

echo "Using AMI: $AMI_ID"

# Launch Main Application Server
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --count 1 \
  --instance-type t3.large \
  --key-name dropfly-knowledge-key \
  --security-group-ids $SG_ID \
  --subnet-id $SUBNET_ID \
  --associate-public-ip-address \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=DropFly-Knowledge-Main}]' \
  --user-data file://user-data-script.sh \
  --query 'Instances[0].InstanceId' --output text)

echo "Main Instance Launched: $INSTANCE_ID"

# Launch Database Server
DB_INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --count 1 \
  --instance-type t3.xlarge \
  --key-name dropfly-knowledge-key \
  --security-group-ids $SG_ID \
  --subnet-id $SUBNET_ID \
  --associate-public-ip-address \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=DropFly-Knowledge-DB}]' \
  --query 'Instances[0].InstanceId' --output text)

echo "Database Instance Launched: $DB_INSTANCE_ID"

# Wait for instances to be running
aws ec2 wait instance-running --instance-ids $INSTANCE_ID $DB_INSTANCE_ID

echo "Instances are now running!"
```

---

## 🔥 **STEP 2: GET INSTANCE DETAILS**

```bash
# Get Public IP addresses
MAIN_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)

DB_IP=$(aws ec2 describe-instances \
  --instance-ids $DB_INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)

echo "Main Server IP: $MAIN_IP"
echo "Database Server IP: $DB_IP"

# Save instance details
cat > instance-details.txt << EOF
DropFly Knowledge Engine - Instance Details
==========================================
VPC ID: $VPC_ID
Security Group ID: $SG_ID
Subnet ID: $SUBNET_ID

Main Server:
- Instance ID: $INSTANCE_ID
- Public IP: $MAIN_IP
- SSH Command: ssh -i ~/.ssh/dropfly-knowledge-key.pem ubuntu@$MAIN_IP

Database Server:
- Instance ID: $DB_INSTANCE_ID
- Public IP: $DB_IP
- SSH Command: ssh -i ~/.ssh/dropfly-knowledge-key.pem ubuntu@$DB_IP
EOF

echo "Instance details saved to instance-details.txt"
```

---

## 🔥 **STEP 3: CREATE USER DATA SCRIPT**

```bash
# Create user data script for automatic setup
cat > user-data-script.sh << 'EOF'
#!/bin/bash

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git vim htop tree unzip python3 python3-pip nodejs npm docker.io

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Start Docker
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Python packages
pip3 install fastapi uvicorn openai anthropic pinecone-client weaviate-client scrapy beautifulsoup4 pandas numpy

# Create application directory
mkdir -p /opt/dropfly-knowledge
chown ubuntu:ubuntu /opt/dropfly-knowledge

# Clone repository (when ready)
# cd /opt/dropfly-knowledge
# git clone https://github.com/dropfly/knowledge-engine.git

echo "DropFly Knowledge Engine server setup complete!" > /home/ubuntu/setup-complete.txt
EOF

echo "User data script created!"
```

---

## 🔥 **STEP 4: CREATE S3 BUCKETS**

```bash
# Create S3 buckets for data storage
aws s3 mb s3://dropfly-knowledge-raw-data-$(date +%s)
aws s3 mb s3://dropfly-knowledge-processed-data-$(date +%s)
aws s3 mb s3://dropfly-knowledge-backups-$(date +%s)
aws s3 mb s3://dropfly-knowledge-logs-$(date +%s)

echo "S3 buckets created successfully!"

# List all buckets
aws s3 ls | grep dropfly-knowledge
```

---

## 🔥 **STEP 5: SETUP RDS DATABASE**

```bash
# Create RDS subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name dropfly-knowledge-subnet-group \
  --db-subnet-group-description "Subnet group for DropFly Knowledge Engine" \
  --subnet-ids $SUBNET_ID $(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone us-east-1b --query 'Subnet.SubnetId' --output text) \
  --tags Key=Name,Value=DropFly-Knowledge-Subnet-Group

# Create RDS instance
aws rds create-db-instance \
  --db-name dropflyknowledge \
  --db-instance-identifier dropfly-knowledge-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password DropFly2024Knowledge! \
  --allocated-storage 100 \
  --vpc-security-group-ids $SG_ID \
  --db-subnet-group-name dropfly-knowledge-subnet-group \
  --backup-retention-period 7 \
  --storage-encrypted \
  --tags Key=Name,Value=DropFly-Knowledge-DB

echo "RDS PostgreSQL instance creation initiated..."
echo "This will take 10-15 minutes to complete."
```

---

## 🔥 **STEP 6: CONNECT TO SERVERS**

```bash
# SSH to main server
echo "Connecting to main server..."
ssh -i ~/.ssh/dropfly-knowledge-key.pem ubuntu@$MAIN_IP

# In a new terminal, SSH to database server
# ssh -i ~/.ssh/dropfly-knowledge-key.pem ubuntu@$DB_IP
```

---

## 🎯 **VERIFICATION COMMANDS**

```bash
# Check if instances are running
aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID $DB_INSTANCE_ID \
  --query 'Reservations[].Instances[].[InstanceId,State.Name,PublicIpAddress]' \
  --output table

# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier dropfly-knowledge-db \
  --query 'DBInstances[0].[DBInstanceIdentifier,DBInstanceStatus,Endpoint.Address]' \
  --output table

# Test connectivity
ping -c 3 $MAIN_IP
```

---

## 🚨 **EMERGENCY STOP COMMANDS**

```bash
# If you need to stop everything
aws ec2 terminate-instances --instance-ids $INSTANCE_ID $DB_INSTANCE_ID
aws rds delete-db-instance --db-instance-identifier dropfly-knowledge-db --skip-final-snapshot
aws ec2 delete-vpc --vpc-id $VPC_ID
```

---

## ⚡ **NEXT STEPS AFTER INFRASTRUCTURE IS LIVE**

1. **SSH to main server** and verify setup
2. **Install Docker containers** for services
3. **Deploy initial code** from GitHub
4. **Configure monitoring** and logging
5. **Setup SSL certificates** for HTTPS
6. **Deploy first data ingestion** pipeline

---

**🚀 INFRASTRUCTURE DEPLOYMENT COMPLETE**

**Status Check: All systems should be live within 15 minutes of execution**

**Next Phase: Software deployment and AI pipeline activation**

---

**© 2024 DropFly Technologies. All Rights Reserved.**  
**Live Deployment Commands - Execute Immediately**