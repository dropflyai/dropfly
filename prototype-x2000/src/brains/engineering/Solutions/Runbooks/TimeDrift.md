# Time Drift -- Operational Runbook

**Purpose:** Structured response procedure for time synchronization issues across systems.
**Owner:** Engineering Brain
**Severity Range:** SEV-3 (cosmetic timestamp issues) to SEV-1 (authentication or data integrity failures)
**Cross-reference:** `Solutions/SolutionIndex.md`

---

## 1. Common Causes

### 1.1 NTP Misconfiguration

**Description:** The Network Time Protocol (NTP) client is not running, is configured with unreachable servers, or is not syncing properly.
**Environments affected:** Bare metal servers, VMs, long-running cloud instances.
**Symptoms:**
- Clock gradually drifts from actual time (seconds to minutes per day)
- `ntpstat` shows "unsynchronised"
- `timedatectl` shows "NTP synchronized: no"

### 1.2 VM Clock Drift

**Description:** Virtual machines can lose time synchronization with the host, especially under heavy CPU load or after VM suspension/resume.
**Environments affected:** VirtualBox, VMware, Hyper-V, KVM.
**Symptoms:**
- Time jumps forward or backward after VM resume
- Guest clock diverges from host clock under load
- Periodic time corrections cause log timestamp jumps

### 1.3 Container Time Isolation

**Description:** Containers share the host kernel clock but can have timezone mismatches or stale time if the host drifts.
**Environments affected:** Docker, Kubernetes, containerd.
**Symptoms:**
- Container logs show different timestamps than host
- Timezone inside container differs from expected
- After host suspend/resume, containers show wrong time

### 1.4 Timezone Confusion

**Description:** Application code mixes local time, UTC, and named timezones without consistent conversion.
**Environments affected:** All.
**Symptoms:**
- Events appear at the wrong time in UI
- Scheduled jobs fire at unexpected times
- Database timestamps do not match API response timestamps
- Daylight saving transitions cause duplicate or missing events

---

## 2. Detection Signals

### 2.1 Test Timing Failures

```
FAIL: Expected token to be valid, but it expired 37 seconds ago
FAIL: Cache entry should exist but TTL expired
FAIL: Event ordering assertion failed -- event B timestamp before event A
```

If tests fail with small time-window violations, suspect clock drift before suspecting logic bugs.

### 2.2 Log Timestamp Anomalies

Look for these patterns in logs:

```
# Time flowing backward (clock correction)
2024-01-15T10:00:05Z INFO Starting process
2024-01-15T09:59:58Z INFO Process step 2    <-- time went backward

# Large gap followed by burst (VM resume)
2024-01-15T10:00:00Z INFO Heartbeat
2024-01-15T10:15:23Z INFO Heartbeat          <-- 15-minute gap
2024-01-15T10:15:23Z INFO Heartbeat          <-- immediate duplicate
```

### 2.3 Certificate Validation Errors

```
ERROR: x509: certificate is not yet valid
ERROR: SSL certificate problem: certificate is not yet valid
ERROR: certificate has expired (but it hasn't according to wall clock)
```

TLS certificates are time-sensitive. If the system clock is ahead, certs appear expired. If behind, certs appear not-yet-valid.

### 2.4 Cron Job Drift

- Scheduled job runs at 2:05 instead of 2:00 and the drift increases daily.
- Job fires twice during daylight saving "fall back" hour.
- Job does not fire during daylight saving "spring forward" gap.

---

## 3. Distributed Systems Impact

Time drift in distributed systems causes subtle and dangerous failures.

### 3.1 Token Expiration

**Problem:** JWT tokens and session tokens include `exp` (expiration) and `iat` (issued at) claims. If the server clock is ahead of the auth server clock, tokens appear expired prematurely.

**Impact:** Users get logged out, API calls fail with 401, service-to-service auth breaks.

**Threshold:** Even 30 seconds of drift can cause intermittent auth failures if token lifetimes are short.

### 3.2 Cache TTL

**Problem:** Cache entries are stored with an absolute expiration timestamp. If the cache server's clock is ahead of the application server's clock, entries expire early. If behind, stale data is served longer than intended.

**Impact:** Cache misses spike (clock ahead) or stale data is served (clock behind).

### 3.3 Event Ordering

**Problem:** In event-driven systems, event timestamps determine processing order. Clock drift between producers causes events to be ordered incorrectly.

**Impact:** State machines process events out of order, causing incorrect state transitions. Financial transactions may be applied in the wrong sequence.

**Mitigation:** Use logical clocks (Lamport timestamps, vector clocks) instead of wall clocks for ordering when possible.

### 3.4 Rate Limiting Windows

**Problem:** Rate limiters use time windows (e.g., 100 requests per minute). If the rate limiter's clock differs from the client's clock, the effective window shifts.

**Impact:** Legitimate requests are rate-limited, or the rate limit is ineffective.

### 3.5 Consensus Protocols

**Problem:** Raft, Paxos, and similar protocols use timeouts for leader election. Clock drift can cause premature elections or split-brain scenarios.

**Impact:** Cluster instability, data inconsistency.

---

## 4. NTP / Chrony Configuration

### 4.1 Check Current Synchronization Status

```bash
# Check if NTP is active
timedatectl status

# Check NTP sync details (systemd-timesyncd)
timedatectl timesync-status

# Check chrony status (if using chrony)
chronyc tracking
chronyc sources -v

# Check ntpd status (if using classic ntpd)
ntpq -p
ntpstat
```

### 4.2 Configure chrony (Recommended)

Chrony is the recommended NTP implementation for modern Linux systems. It handles intermittent connectivity and VM environments better than classic ntpd.

```bash
# Install chrony
sudo apt install chrony   # Debian/Ubuntu
sudo yum install chrony   # RHEL/CentOS

# Edit configuration
sudo vi /etc/chrony/chrony.conf
```

Recommended `/etc/chrony/chrony.conf`:

```
# Use multiple NTP servers for reliability
pool 0.pool.ntp.org iburst
pool 1.pool.ntp.org iburst
pool 2.pool.ntp.org iburst
pool 3.pool.ntp.org iburst

# Allow large initial correction on startup
makestep 1.0 3

# Record drift rate for faster sync after restart
driftfile /var/lib/chrony/drift

# Enable kernel time discipline
rtcsync

# Log statistics for monitoring
logdir /var/log/chrony
log measurements statistics tracking
```

```bash
# Restart and enable
sudo systemctl restart chrony
sudo systemctl enable chrony

# Verify synchronization
chronyc tracking
```

### 4.3 Configure for Cloud Instances

Cloud providers offer internal NTP servers with lower latency:

```
# AWS
server 169.254.169.123 prefer iburst

# GCP
server metadata.google.internal prefer iburst

# Azure
server time.windows.com prefer iburst
```

---

## 5. Resolution Steps by Environment

### 5.1 Docker Containers

Docker containers share the host kernel clock. Fix the host and containers follow.

```bash
# Check host time
date -u

# Check container time
docker exec <container> date -u

# If they differ, the host clock is drifting
# Fix NTP on the host (see Section 4)

# Force timezone in container (if timezone is wrong but clock is correct)
docker run -e TZ=UTC <image>

# Or mount the host timezone
docker run -v /etc/localtime:/etc/localtime:ro <image>
```

For Docker Desktop (macOS/Windows), the VM running Docker can drift:

```bash
# Docker Desktop: restart the VM to resync clock
# macOS
osascript -e 'quit app "Docker"' && open -a Docker

# Or force NTP sync inside the Docker VM
docker run --privileged --rm alpine hwclock -s
```

### 5.2 Virtual Machines

```bash
# VirtualBox: Enable time synchronization with host
VBoxManage guestcontrol <vm-name> execute --image "/usr/sbin/ntpdate" -- pool.ntp.org

# VMware: Ensure VMware Tools is installed and time sync is enabled
vmware-toolbox-cmd timesync status
vmware-toolbox-cmd timesync enable

# KVM/libvirt: Use kvm-clock (default on modern kernels)
cat /sys/devices/system/clocksource/clocksource0/current_clocksource
# Should show "kvm-clock"
```

### 5.3 Cloud Instances

```bash
# AWS EC2: Use the Amazon Time Sync Service
# Check if the link-local NTP is reachable
curl -s http://169.254.169.123/latest/meta-data/ || echo "Not on EC2"

# GCP: Google provides NTP on the metadata server
# Verify with chrony
chronyc sources | grep metadata

# Azure: Use Windows Time Service endpoint
# Configure in chrony.conf (see Section 4.3)
```

### 5.4 macOS (Development Machines)

```bash
# Check current time sync
sntp -d time.apple.com

# Force time resync
sudo sntp -sS time.apple.com

# Ensure automatic time is enabled
sudo systemsetup -setnetworktimeserver time.apple.com
sudo systemsetup -setusingnetworktime on
```

---

## 6. Prevention

### 6.1 Always Use UTC Internally

```typescript
// BAD: Using local time for storage or transmission
const now = new Date().toLocaleString();
const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

// GOOD: Always store and transmit in UTC
const now = new Date().toISOString();               // "2024-01-15T10:00:00.000Z"
const timestamp = Date.now();                         // Unix milliseconds, always UTC

// Convert to local time ONLY at the display layer
const display = new Intl.DateTimeFormat('en-US', {
  timeZone: userTimezone,
}).format(utcDate);
```

Database columns should use `TIMESTAMPTZ` (timestamp with time zone), not `TIMESTAMP`:

```sql
-- BAD
created_at TIMESTAMP DEFAULT now()

-- GOOD
created_at TIMESTAMPTZ DEFAULT now()
```

### 6.2 Use Monotonic Clocks for Duration

Wall clocks can jump (NTP correction, daylight saving, manual adjustment). For measuring elapsed time, use monotonic clocks:

```typescript
// BAD: Wall clock for duration
const start = Date.now();
// ... work ...
const elapsed = Date.now() - start;  // Can be negative if clock adjusts

// GOOD: Monotonic clock (Node.js)
const start = performance.now();
// ... work ...
const elapsed = performance.now() - start;  // Always increases

// GOOD: Monotonic clock (Python)
import time
start = time.monotonic()
# ... work ...
elapsed = time.monotonic() - start
```

### 6.3 NTP Monitoring

Set up alerts for time drift:

```bash
# Check drift and alert if > 100ms
OFFSET=$(chronyc tracking | grep "System time" | awk '{print $4}')
if (( $(echo "$OFFSET > 0.1" | bc -l) )); then
  echo "ALERT: Clock drift exceeds 100ms: ${OFFSET}s"
fi
```

Add to monitoring dashboards:
- Current NTP offset (should be < 100ms)
- NTP sync status (should be "synchronized")
- Number of reachable NTP sources (should be >= 2)
- Last successful sync timestamp

### 6.4 Application-Level Defenses

- Add clock skew tolerance to token validation (e.g., 30-second grace period).
- Use server-generated timestamps for critical operations, not client-supplied ones.
- Log the source of timestamps (which server generated it) for debugging.
- For distributed event ordering, prefer logical clocks over wall clocks.

---

## 7. Post-Incident

### 7.1 Update SolutionIndex.md

```markdown
| TimeDrift-<YYYYMMDD> | [brief description] | Runbooks/TimeDrift.md | [date] |
```

### 7.2 Log to Memory

```markdown
## [Date] -- Time Drift Incident

- **Environment:** [Docker | VM | cloud | dev machine]
- **Drift magnitude:** [how far off the clock was]
- **Impact:** [what broke]
- **Root cause:** [NTP | VM | container | timezone]
- **Fix applied:** [what changed]
- **Prevention added:** [monitoring, config change, code fix]
```

---

## Quick Reference

```
DETECT SIGNAL -> MEASURE DRIFT -> IDENTIFY CAUSE -> FIX CLOCK -> FIX APPLICATION -> MONITOR -> DOCUMENT
```

**Remember:** Always use UTC internally. Use monotonic clocks for duration. Monitor NTP continuously.
