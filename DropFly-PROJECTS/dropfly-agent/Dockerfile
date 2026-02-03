# DropFly Agent — Production Dockerfile
# Multi-stage build: dependencies → runtime

# ============================================================
# Stage 1: Build dependencies
# ============================================================
FROM python:3.12-slim AS builder

WORKDIR /build

# Install build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml ./
RUN pip install --no-cache-dir --prefix=/install .

# ============================================================
# Stage 2: Runtime
# ============================================================
FROM python:3.12-slim AS runtime

# System deps for Playwright, git, Docker CLI
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    gnupg \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22 (for project builds)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /install /usr/local

# Install Playwright browsers
RUN playwright install --with-deps chromium

# Create non-root user
RUN useradd -m -s /bin/bash dropfly \
    && mkdir -p /app/workspaces /app/logs \
    && chown -R dropfly:dropfly /app

WORKDIR /app

# Copy application code
COPY --chown=dropfly:dropfly src/ ./src/
COPY --chown=dropfly:dropfly pyproject.toml ./
COPY --chown=dropfly:dropfly CLAUDE.md ./

# Ensure the package is importable
RUN pip install --no-cache-dir -e .

# Switch to non-root
USER dropfly

# Expose gateway port
EXPOSE 8420

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -sf http://localhost:8420/status || exit 1

# Default command: run the gateway
CMD ["python", "-m", "src.gateway.server"]
