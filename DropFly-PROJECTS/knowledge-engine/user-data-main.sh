#!/bin/bash

# DropFly Knowledge Engine - Main Server Setup Script
echo "🚀 DropFly Knowledge Engine Main Server Setup Starting..."

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git vim htop tree unzip python3 python3-pip nodejs npm docker.io nginx

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Start and enable Docker
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

# Install Python packages for AI processing
pip3 install --upgrade pip
pip3 install fastapi uvicorn openai anthropic pinecone-client weaviate-client
pip3 install scrapy beautifulsoup4 pandas numpy requests aiohttp
pip3 install sqlalchemy psycopg2-binary redis celery
pip3 install streamlit plotly dash

# Install Node.js packages
npm install -g pm2 @nestjs/cli

# Create application directories
mkdir -p /opt/dropfly-knowledge/{api,processors,scrapers,dashboard,logs}
mkdir -p /opt/dropfly-knowledge/data/{raw,processed,embeddings}
chown -R ubuntu:ubuntu /opt/dropfly-knowledge

# Create API service
cat > /opt/dropfly-knowledge/api/main.py << 'EOF'
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from datetime import datetime

app = FastAPI(title="DropFly Knowledge Engine API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "DropFly Knowledge Engine API",
        "status": "online",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "api": "online",
            "database": "connecting",
            "ai_processor": "initializing"
        }
    }

@app.post("/api/v1/analyze")
async def analyze_content(content: dict):
    # Placeholder for AI analysis
    return {
        "status": "analysis_complete",
        "insights": "Strategic analysis pending full AI integration",
        "confidence": 0.85
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# Create startup script
cat > /opt/dropfly-knowledge/start.sh << 'EOF'
#!/bin/bash
cd /opt/dropfly-knowledge/api
python3 main.py &
echo "DropFly Knowledge Engine API started on port 8000"
EOF

chmod +x /opt/dropfly-knowledge/start.sh
chown ubuntu:ubuntu /opt/dropfly-knowledge/start.sh

# Configure Nginx
cat > /etc/nginx/sites-available/dropfly-knowledge << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://localhost:8000/health;
    }
}
EOF

ln -s /etc/nginx/sites-available/dropfly-knowledge /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
systemctl restart nginx
systemctl enable nginx

# Create systemd service
cat > /etc/systemd/system/dropfly-knowledge.service << 'EOF'
[Unit]
Description=DropFly Knowledge Engine API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/dropfly-knowledge/api
ExecStart=/usr/bin/python3 main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl enable dropfly-knowledge
systemctl start dropfly-knowledge

# Create completion marker
echo "DropFly Knowledge Engine Main Server Setup Complete - $(date)" > /home/ubuntu/setup-complete.txt
echo "🎉 Main Server Setup Complete!"