#!/bin/bash

# DropFly Knowledge Engine - Database Server Setup Script
echo "🗄️ DropFly Knowledge Engine Database Server Setup Starting..."

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git vim htop tree unzip python3 python3-pip docker.io

# Start and enable Docker
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create database directories
mkdir -p /opt/dropfly-db/{postgres,weaviate,redis,elasticsearch}
mkdir -p /opt/dropfly-db/backups
chown -R ubuntu:ubuntu /opt/dropfly-db

# Create Docker Compose for databases
cat > /opt/dropfly-db/docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: dropfly-postgres
    environment:
      POSTGRES_DB: dropfly_knowledge
      POSTGRES_USER: dropfly_admin
      POSTGRES_PASSWORD: DropFly2024Knowledge!
    ports:
      - "5432:5432"
    volumes:
      - ./postgres:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    command: postgres -c 'max_connections=1000' -c 'shared_buffers=256MB'

  weaviate:
    image: semitechnologies/weaviate:latest
    container_name: dropfly-weaviate
    ports:
      - "8080:8080"
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'false'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'none'
      CLUSTER_HOSTNAME: 'node1'
    volumes:
      - ./weaviate:/var/lib/weaviate
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: dropfly-redis
    ports:
      - "6379:6379"
    volumes:
      - ./redis:/data
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 2gb --maxmemory-policy allkeys-lru

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: dropfly-elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - ./elasticsearch:/usr/share/elasticsearch/data
    restart: unless-stopped

  neo4j:
    image: neo4j:5.15-community
    container_name: dropfly-neo4j
    environment:
      NEO4J_AUTH: neo4j/DropFly2024Knowledge!
      NEO4J_dbms_memory_pagecache_size: 1G
      NEO4J_dbms_memory_heap_initial__size: 1G
      NEO4J_dbms_memory_heap_max__size: 1G
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - ./neo4j/data:/data
      - ./neo4j/logs:/logs
    restart: unless-stopped

networks:
  default:
    name: dropfly-network
EOF

# Create database initialization script
cat > /opt/dropfly-db/init-databases.py << 'EOF'
#!/usr/bin/env python3

import psycopg2
import weaviate
import redis
import requests
import time
import json

def wait_for_services():
    """Wait for all database services to be ready"""
    print("Waiting for database services to start...")
    
    # Wait for PostgreSQL
    for i in range(30):
        try:
            conn = psycopg2.connect(
                host="localhost",
                database="dropfly_knowledge",
                user="dropfly_admin",
                password="DropFly2024Knowledge!"
            )
            conn.close()
            print("✅ PostgreSQL is ready")
            break
        except:
            time.sleep(2)
    
    # Wait for Weaviate
    for i in range(30):
        try:
            client = weaviate.Client("http://localhost:8080")
            client.schema.get()
            print("✅ Weaviate is ready")
            break
        except:
            time.sleep(2)
    
    # Wait for Redis
    for i in range(30):
        try:
            r = redis.Redis(host='localhost', port=6379, db=0)
            r.ping()
            print("✅ Redis is ready")
            break
        except:
            time.sleep(2)
    
    # Wait for Elasticsearch
    for i in range(30):
        try:
            response = requests.get("http://localhost:9200/_cluster/health")
            if response.status_code == 200:
                print("✅ Elasticsearch is ready")
                break
        except:
            time.sleep(2)

def init_postgresql():
    """Initialize PostgreSQL schema"""
    print("Initializing PostgreSQL schema...")
    
    conn = psycopg2.connect(
        host="localhost",
        database="dropfly_knowledge",
        user="dropfly_admin",
        password="DropFly2024Knowledge!"
    )
    
    cur = conn.cursor()
    
    # Create tables
    cur.execute("""
        CREATE TABLE IF NOT EXISTS knowledge_documents (
            id SERIAL PRIMARY KEY,
            title VARCHAR(500),
            content TEXT,
            source VARCHAR(200),
            url VARCHAR(500),
            category VARCHAR(100),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            embedding_id VARCHAR(100),
            metadata JSONB
        );
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS competitive_intelligence (
            id SERIAL PRIMARY KEY,
            company VARCHAR(200),
            content TEXT,
            insight_type VARCHAR(100),
            threat_level INTEGER,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            source_url VARCHAR(500),
            analysis JSONB
        );
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS market_opportunities (
            id SERIAL PRIMARY KEY,
            opportunity_name VARCHAR(300),
            market_size DECIMAL,
            growth_rate DECIMAL,
            description TEXT,
            score INTEGER,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metadata JSONB
        );
    """)
    
    conn.commit()
    cur.close()
    conn.close()
    print("✅ PostgreSQL schema initialized")

def init_weaviate():
    """Initialize Weaviate schema"""
    print("Initializing Weaviate schema...")
    
    client = weaviate.Client("http://localhost:8080")
    
    schema = {
        "classes": [
            {
                "class": "KnowledgeDocument",
                "description": "A document in the DropFly knowledge base",
                "vectorizer": "none",
                "properties": [
                    {
                        "name": "title",
                        "dataType": ["string"],
                        "description": "Title of the document"
                    },
                    {
                        "name": "content",
                        "dataType": ["text"],
                        "description": "Content of the document"
                    },
                    {
                        "name": "source",
                        "dataType": ["string"],
                        "description": "Source of the document"
                    },
                    {
                        "name": "category",
                        "dataType": ["string"],
                        "description": "Category classification"
                    }
                ]
            },
            {
                "class": "CompetitiveIntel",
                "description": "Competitive intelligence data",
                "vectorizer": "none",
                "properties": [
                    {
                        "name": "company",
                        "dataType": ["string"],
                        "description": "Company name"
                    },
                    {
                        "name": "insight",
                        "dataType": ["text"],
                        "description": "Intelligence insight"
                    },
                    {
                        "name": "threatLevel",
                        "dataType": ["int"],
                        "description": "Threat level 1-10"
                    }
                ]
            }
        ]
    }
    
    try:
        client.schema.create(schema)
        print("✅ Weaviate schema initialized")
    except Exception as e:
        print(f"Weaviate schema may already exist: {e}")

if __name__ == "__main__":
    wait_for_services()
    init_postgresql()
    init_weaviate()
    print("🎉 All databases initialized successfully!")
EOF

chmod +x /opt/dropfly-db/init-databases.py

# Install Python packages for database management
pip3 install psycopg2-binary weaviate-client redis requests

# Start all database services
cd /opt/dropfly-db
docker-compose up -d

# Wait for services to start and initialize
sleep 30
python3 init-databases.py

# Create backup script
cat > /opt/dropfly-db/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/dropfly-db/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL backup
docker exec dropfly-postgres pg_dump -U dropfly_admin dropfly_knowledge > $BACKUP_DIR/postgres_$DATE.sql

# Weaviate backup (export data)
curl -o $BACKUP_DIR/weaviate_$DATE.json http://localhost:8080/v1/objects

echo "Backup completed: $DATE"
EOF

chmod +x /opt/dropfly-db/backup.sh

# Setup daily backup cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/dropfly-db/backup.sh") | crontab -

# Create completion marker
echo "DropFly Knowledge Engine Database Server Setup Complete - $(date)" > /home/ubuntu/db-setup-complete.txt
echo "🎉 Database Server Setup Complete!"