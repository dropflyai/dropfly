# TradeFly: Roadmap to 10/10
**Current Score:** 6.5/10
**Target Score:** 10/10
**Timeline:** 12 weeks
**Date Created:** 2025-12-29

---

## MISSION STATEMENT

Transform TradeFly from a functional MVP to a production-grade, institutionally-secure algorithmic trading platform that demonstrates excellence in engineering quality, design clarity, and user trust.

---

## GUIDING PRINCIPLES

### Engineering Standards
- **Quality Gate:** Every deliverable must score ≥4 in all 7 categories (Correctness, Verification, Automation, Maintainability, Cleanup, Security, Regression Resistance)
- **Triple Verification:** All claims require automated evidence (no manual verification)
- **Mode Declaration:** Every artifact declares MODE (APP/API/AGENTIC) and PRODUCT_TARGET
- **Security P0:** No exceptions - security violations block all other work

### Design Standards
- **Design Intent Required:** User type, primary decision, exclusions, failure definition, UI mode
- **Five States Mandatory:** Default, Loading, Empty, Error, Success
- **Hierarchy First:** If hierarchy is unclear, design has failed
- **No Generic SaaS:** Reject centered layouts, card overuse, symmetry without purpose

### Success Metrics
- Engineering Score: 10/10 (all categories ≥4)
- UX Score: 10/10 (all categories ≥4)
- Security Audit: 0 P0/P1 vulnerabilities
- Signal Validation: 90-day backtested win rate ≥60%
- Accessibility: WCAG AA compliant
- Performance: <1s signal retrieval, <100ms UI interactions

---

## PHASE 1: SECURITY HARDENING (Weeks 1-2)
**Goal:** Eliminate all P0/P1 security vulnerabilities
**Engineering Mode:** MODE: API + MODE: APP
**Product Target:** API_SERVICE + WEB_APP
**Quality Gate:** Security score must be 5/5

### 1.1 Authentication & Authorization (Week 1, Days 1-3)
**Priority:** P0 - CRITICAL
**Artifact Type:** Full Document (auth system)

#### Backend Tasks
- [ ] **Install Supabase Auth SDK**
  ```bash
  pip install supabase==2.0.0
  ```

- [ ] **Create auth middleware** (`/backend/middleware/auth.py`)
  ```python
  from fastapi import Depends, HTTPException, status
  from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
  from supabase import create_client

  security = HTTPBearer()

  async def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
      token = credentials.credentials
      user = supabase.auth.get_user(token)
      if not user:
          raise HTTPException(status_code=401, detail="Invalid token")
      return user
  ```

- [ ] **Protect all endpoints**
  ```python
  @app.get("/api/options/signals", dependencies=[Depends(verify_jwt)])
  async def get_signals(...):
  ```

- [ ] **Create user role system**
  - FREE tier: 10 signals/day
  - PRO tier: Unlimited signals
  - ADMIN tier: All features + analytics

#### Frontend Tasks
- [ ] **Install Supabase Auth client**
  ```bash
  npm install @supabase/supabase-js @supabase/auth-ui-react
  ```

- [ ] **Create auth context** (`/webapp/lib/auth/AuthProvider.tsx`)
- [ ] **Build login page** (`/webapp/app/login/page.tsx`)
- [ ] **Build signup page** (`/webapp/app/signup/page.tsx`)
- [ ] **Add protected route wrapper**
- [ ] **Implement token refresh logic**

#### Verification
- [ ] **Playwright test:** Unauthenticated user cannot access `/api/options/signals`
- [ ] **Playwright test:** User can sign up, login, access signals, logout
- [ ] **Manual security test:** Attempt API access with invalid JWT (must fail)
- [ ] **Evidence:** Screenshots of auth flow + Playwright trace

**Completion Criteria:**
- All API endpoints require valid JWT
- Signup/login flows work end-to-end
- Token refresh prevents session expiration
- Playwright verification passes

---

### 1.2 CORS & CSP Hardening (Week 1, Day 4)
**Priority:** P0 - CRITICAL
**Artifact Type:** Fragment (security config)

#### Tasks
- [ ] **Fix CORS wildcard** (`/backend/main_options.py:164`)
  ```python
  # BEFORE (INSECURE):
  allow_origins=["*"]

  # AFTER (SECURE):
  allow_origins=[
      "https://tradeflyai.com",
      "https://app.tradeflyai.com",
      "http://localhost:3006"  # Dev only
  ]
  ```

- [ ] **Add security headers middleware**
  ```python
  @app.middleware("http")
  async def add_security_headers(request, call_next):
      response = await call_next(request)
      response.headers["X-Content-Type-Options"] = "nosniff"
      response.headers["X-Frame-Options"] = "DENY"
      response.headers["X-XSS-Protection"] = "1; mode=block"
      response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
      response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
      return response
  ```

- [ ] **Configure environment-based CORS**
  ```python
  ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3006").split(",")
  ```

#### Verification
- [ ] **Curl test:** Request from `evil.com` origin must be rejected
- [ ] **Browser test:** CSP blocks inline scripts
- [ ] **Header inspection:** All security headers present in response

**Completion Criteria:**
- CORS restricted to specific domains
- All security headers present
- CSP policy active

---

### 1.3 HTTPS & SSL Certificate (Week 1, Day 5)
**Priority:** P0 - CRITICAL
**Artifact Type:** Automation (deployment)

#### Tasks
- [ ] **Install Certbot on EC2**
  ```bash
  sudo apt-get update
  sudo apt-get install certbot python3-certbot-nginx
  ```

- [ ] **Obtain SSL certificate**
  ```bash
  sudo certbot --nginx -d api.tradeflyai.com
  ```

- [ ] **Configure Nginx for HTTPS**
  ```nginx
  server {
      listen 443 ssl http2;
      server_name api.tradeflyai.com;

      ssl_certificate /etc/letsencrypt/live/api.tradeflyai.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/api.tradeflyai.com/privkey.pem;

      # Force HTTPS
      add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

      location / {
          proxy_pass http://127.0.0.1:8002;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
      }
  }

  # Redirect HTTP to HTTPS
  server {
      listen 80;
      server_name api.tradeflyai.com;
      return 301 https://$server_name$request_uri;
  }
  ```

- [ ] **Update frontend API URL** (`/webapp/lib/api/client.ts`)
  ```typescript
  const API_CONFIG = {
      BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.tradeflyai.com"
  }
  ```

- [ ] **Setup auto-renewal cron job**
  ```bash
  sudo crontab -e
  # Add: 0 12 * * * /usr/bin/certbot renew --quiet
  ```

#### Verification
- [ ] **SSL test:** https://www.ssllabs.com/ssltest/ (must score A+)
- [ ] **HTTP test:** `curl http://api.tradeflyai.com` redirects to HTTPS
- [ ] **Frontend test:** API calls use HTTPS

**Completion Criteria:**
- SSL certificate installed and valid
- HTTP→HTTPS redirect works
- A+ rating on SSL Labs
- Auto-renewal configured

---

### 1.4 Rate Limiting (Week 2, Days 1-2)
**Priority:** P1 - HIGH
**Artifact Type:** Component (middleware)

#### Tasks
- [ ] **Install rate limiting library**
  ```bash
  pip install slowapi==0.1.9
  ```

- [ ] **Configure rate limiter** (`/backend/middleware/rate_limit.py`)
  ```python
  from slowapi import Limiter, _rate_limit_exceeded_handler
  from slowapi.util import get_remote_address
  from slowapi.errors import RateLimitExceeded

  limiter = Limiter(key_func=get_remote_address, storage_uri="redis://localhost:6379")
  app.state.limiter = limiter
  app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
  ```

- [ ] **Apply rate limits to endpoints**
  ```python
  @app.get("/api/options/signals")
  @limiter.limit("100/minute")  # 100 requests per minute per IP
  async def get_signals(...):

  @app.post("/api/paper/quick-add-signal")
  @limiter.limit("10/minute")  # 10 paper trades per minute
  async def quick_add_signal(...):
  ```

- [ ] **Create rate limit tiers by user role**
  ```python
  def get_rate_limit(user):
      if user.role == "FREE":
          return "10/minute"
      elif user.role == "PRO":
          return "100/minute"
      elif user.role == "ADMIN":
          return "1000/minute"
  ```

#### Verification
- [ ] **Playwright test:** Make 101 requests in 1 minute, 101st returns 429
- [ ] **Evidence:** Rate limit headers in response (`X-RateLimit-Remaining`)
- [ ] **Load test:** Simulate 1000 concurrent users (must not crash)

**Completion Criteria:**
- Rate limits enforced on all endpoints
- Different limits for FREE/PRO/ADMIN
- Graceful 429 responses
- Verification passes

---

### 1.5 Input Validation & Sanitization (Week 2, Days 3-4)
**Priority:** P1 - HIGH
**Artifact Type:** Component (validation layer)

#### Tasks
- [ ] **Install sanitization library**
  ```bash
  pip install bleach==6.1.0
  ```

- [ ] **Create validation schemas** (`/backend/schemas/validation.py`)
  ```python
  from pydantic import BaseModel, validator, constr, confloat
  import bleach

  class SignalFilters(BaseModel):
      strategies: list[str] = []
      min_confidence: confloat(ge=0.0, le=1.0) = 0.7
      max_results: int = Field(ge=1, le=100, default=20)
      symbols: list[constr(regex=r'^[A-Z]{1,5}$')] = []

      @validator('symbols', each_item=True)
      def sanitize_symbol(cls, v):
          return bleach.clean(v, strip=True)

  class PaperTradeRequest(BaseModel):
      signal_id: constr(regex=r'^[A-Z0-9_]+$')
      notes: str = ""

      @validator('notes')
      def sanitize_notes(cls, v):
          # Strip all HTML tags, keep text only
          return bleach.clean(v, tags=[], strip=True)[:500]
  ```

- [ ] **Add XSS protection to frontend**
  ```typescript
  // Install DOMPurify
  npm install dompurify @types/dompurify

  // Use in components
  import DOMPurify from 'dompurify';

  function SafeContent({ html }: { html: string }) {
      const clean = DOMPurify.sanitize(html);
      return <div dangerouslySetInnerHTML={{ __html: clean }} />;
  }
  ```

- [ ] **Validate all user inputs**
  - Symbol watchlists
  - Paper trade notes
  - Filter parameters
  - Search queries (when social features added)

#### Verification
- [ ] **Security test:** Submit `<script>alert('XSS')</script>` in notes field (must be sanitized)
- [ ] **Playwright test:** Malformed symbol names rejected
- [ ] **Evidence:** Pydantic validation errors logged

**Completion Criteria:**
- All user input validated server-side
- HTML sanitization prevents XSS
- Malicious input rejected gracefully
- Verification passes

---

### 1.6 Secrets Management (Week 2, Day 5)
**Priority:** P1 - HIGH
**Artifact Type:** Automation (deployment)

#### Tasks
- [ ] **Move secrets to AWS Secrets Manager**
  ```bash
  # Store Polygon API key
  aws secretsmanager create-secret \
      --name tradefly/prod/polygon-api-key \
      --secret-string "YOUR_API_KEY"

  # Store Supabase credentials
  aws secretsmanager create-secret \
      --name tradefly/prod/supabase-url \
      --secret-string "YOUR_SUPABASE_URL"
  ```

- [ ] **Update backend to fetch secrets**
  ```python
  import boto3
  from functools import lru_cache

  @lru_cache(maxsize=1)
  def get_secret(secret_name: str) -> str:
      client = boto3.client('secretsmanager', region_name='us-east-2')
      response = client.get_secret_value(SecretId=secret_name)
      return response['SecretString']

  POLYGON_API_KEY = get_secret('tradefly/prod/polygon-api-key')
  ```

- [ ] **Remove all secrets from `.env` files**
- [ ] **Add `.env` to `.gitignore` (if not already)
- [ ] **Audit git history for exposed secrets**
  ```bash
  git log --all --full-history --source -- **/.env
  ```

- [ ] **Rotate all API keys**
  - Polygon.io API key
  - Supabase keys
  - Redis password
  - AWS access keys

#### Verification
- [ ] **Grep test:** Search codebase for hardcoded secrets (must find 0)
- [ ] **Git history scan:** No secrets in commit history
- [ ] **Application test:** App works with secrets from AWS Secrets Manager

**Completion Criteria:**
- All secrets in AWS Secrets Manager
- No secrets in git history
- Keys rotated
- Application functional

---

## PHASE 2: SIGNAL VALIDATION SYSTEM (Weeks 3-5)
**Goal:** Implement institutional-grade signal validation with 90-day backtesting
**Engineering Mode:** MODE: API + MODE: AGENTIC
**Product Target:** API_SERVICE + AGENT_SYSTEM
**Quality Gate:** Correctness score ≥5, Verification score ≥5

### 2.1 Signal Validation Architecture (Week 3, Days 1-2)
**Priority:** P0 - CRITICAL for reliability
**Artifact Type:** Full Document (validation engine)

#### Design Intent Declaration
- **User type:** System (automated validation), Traders (trust signals)
- **Primary decision:** Is this signal safe to trade?
- **Excluded on purpose:** Subjective factors (news sentiment, human intuition)
- **Failure definition:** Bad signal passes validation, good signal rejected
- **UI Mode:** MODE_AGENTIC (transparency, explainability)

#### Validation Rules Engine
Create `/backend/signal_validator.py`:

```python
from dataclasses import dataclass
from enum import Enum
from typing import Optional
import logging

class ValidationSeverity(Enum):
    CRITICAL = "critical"  # Auto-reject
    WARNING = "warning"    # Flag for review
    INFO = "info"          # Log only

@dataclass
class ValidationResult:
    is_valid: bool
    severity: ValidationSeverity
    rule_name: str
    message: str
    signal_id: str
    timestamp: str

class SignalValidator:
    """
    Institutional-grade signal validation system.

    Validates signals across 5 dimensions:
    1. Data Quality - Is the data reliable?
    2. Risk Parameters - Are Greeks/IV within safe ranges?
    3. Liquidity - Can the trade be executed?
    4. Market Conditions - Is the market environment suitable?
    5. Strategy Coherence - Does the signal match strategy rules?
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.validation_rules = self._initialize_rules()

    def validate_signal(self, signal: dict) -> tuple[bool, list[ValidationResult]]:
        """
        Validate a signal across all dimensions.
        Returns (is_valid, list of validation results)
        """
        results = []

        # 1. Data Quality Validation
        results.extend(self._validate_data_quality(signal))

        # 2. Risk Parameter Validation
        results.extend(self._validate_risk_parameters(signal))

        # 3. Liquidity Validation
        results.extend(self._validate_liquidity(signal))

        # 4. Market Conditions Validation
        results.extend(self._validate_market_conditions(signal))

        # 5. Strategy Coherence Validation
        results.extend(self._validate_strategy_coherence(signal))

        # Determine overall validity
        critical_failures = [r for r in results if r.severity == ValidationSeverity.CRITICAL]
        is_valid = len(critical_failures) == 0

        return is_valid, results

    def _validate_data_quality(self, signal: dict) -> list[ValidationResult]:
        """Validate data freshness, completeness, and accuracy."""
        results = []

        # Rule 1: Data freshness (<45 seconds old)
        data_age = time.time() - signal.get('timestamp', 0)
        if data_age > 45:
            results.append(ValidationResult(
                is_valid=False,
                severity=ValidationSeverity.CRITICAL,
                rule_name="DATA_FRESHNESS",
                message=f"Data is {data_age:.1f}s old (max 45s)",
                signal_id=signal['signal_id'],
                timestamp=datetime.now().isoformat()
            ))

        # Rule 2: Required fields present
        required_fields = ['signal_id', 'contract', 'entry_price', 'confidence', 'strategy']
        missing = [f for f in required_fields if f not in signal]
        if missing:
            results.append(ValidationResult(
                is_valid=False,
                severity=ValidationSeverity.CRITICAL,
                rule_name="REQUIRED_FIELDS",
                message=f"Missing required fields: {missing}",
                signal_id=signal.get('signal_id', 'UNKNOWN'),
                timestamp=datetime.now().isoformat()
            ))

        # Rule 3: Greeks completeness
        greeks = signal.get('contract', {}).get('greeks', {})
        required_greeks = ['delta', 'gamma', 'theta', 'vega', 'iv']
        missing_greeks = [g for g in required_greeks if greeks.get(g) is None]
        if missing_greeks:
            results.append(ValidationResult(
                is_valid=False,
                severity=ValidationSeverity.WARNING,
                rule_name="GREEKS_COMPLETENESS",
                message=f"Missing Greeks: {missing_greeks}",
                signal_id=signal['signal_id'],
                timestamp=datetime.now().isoformat()
            ))

        return results

    def _validate_risk_parameters(self, signal: dict) -> list[ValidationResult]:
        """Validate Greeks and risk metrics are within safe ranges."""
        results = []
        contract = signal.get('contract', {})
        greeks = contract.get('greeks', {})

        # Rule 4: Delta range (0.3 to 0.8 for directional trades)
        delta = abs(greeks.get('delta', 0))
        if delta < 0.3 or delta > 0.8:
            results.append(ValidationResult(
                is_valid=False,
                severity=ValidationSeverity.WARNING,
                rule_name="DELTA_RANGE",
                message=f"Delta {delta:.2f} outside safe range [0.3, 0.8]",
                signal_id=signal['signal_id'],
                timestamp=datetime.now().isoformat()
            ))

        # Rule 5: IV Rank validation (prefer IV rank > 30)
        iv_rank = contract.get('iv_metrics', {}).get('iv_rank', 0)
        if iv_rank < 30:
            results.append(ValidationResult(
                is_valid=True,
                severity=ValidationSeverity.INFO,
                rule_name="IV_RANK_LOW",
                message=f"IV rank {iv_rank} is low (prefer >30 for premium selling)",
                signal_id=signal['signal_id'],
                timestamp=datetime.now().isoformat()
            ))

        # Rule 6: Theta decay validation
        theta = greeks.get('theta', 0)
        dte = self._calculate_days_to_expiration(contract.get('expiration'))
        if dte < 7 and abs(theta) > 0.1:
            results.append(ValidationResult(
                is_valid=False,
                severity=ValidationSeverity.WARNING,
                rule_name="HIGH_THETA_DECAY",
                message=f"High theta decay {theta:.3f} with only {dte} DTE",
                signal_id=signal['signal_id'],
                timestamp=datetime.now().isoformat()
            ))

        return results

    def _validate_liquidity(self, signal: dict) -> list[ValidationResult]:
        """Validate trade can be executed with acceptable slippage."""
        results = []
        contract = signal.get('contract', {})
        volume_metrics = contract.get('volume_metrics', {})

        # Rule 7: Minimum volume (100 contracts/day)
        volume = volume_metrics.get('volume', 0)
        if volume < 100:
            results.append(ValidationResult(
                is_valid=False,
                severity=ValidationSeverity.CRITICAL,
                rule_name="MINIMUM_VOLUME",
                message=f"Volume {volume} below minimum 100 contracts",
                signal_id=signal['signal_id'],
                timestamp=datetime.now().isoformat()
            ))

        # Rule 8: Minimum open interest (50 contracts)
        open_interest = volume_metrics.get('open_interest', 0)
        if open_interest < 50:
            results.append(ValidationResult(
                is_valid=False,
                severity=ValidationSeverity.WARNING,
                rule_name="LOW_OPEN_INTEREST",
                message=f"Open interest {open_interest} below recommended 50",
                signal_id=signal['signal_id'],
                timestamp=datetime.now().isoformat()
            ))

        # Rule 9: Bid-ask spread (<20% for liquid options)
        pricing = contract.get('pricing', {})
        bid = pricing.get('bid', 0)
        ask = pricing.get('ask', 0)
        if bid > 0:
            spread_pct = ((ask - bid) / bid) * 100
            if spread_pct > 20:
                results.append(ValidationResult(
                    is_valid=False,
                    severity=ValidationSeverity.WARNING,
                    rule_name="WIDE_SPREAD",
                    message=f"Bid-ask spread {spread_pct:.1f}% exceeds 20%",
                    signal_id=signal['signal_id'],
                    timestamp=datetime.now().isoformat()
                ))

        return results

    def _validate_market_conditions(self, signal: dict) -> list[ValidationResult]:
        """Validate market environment is suitable for trading."""
        results = []

        # Rule 10: Market hours (no signals outside 9:30am-4pm ET)
        now = datetime.now(timezone('US/Eastern'))
        market_open = now.replace(hour=9, minute=30, second=0)
        market_close = now.replace(hour=16, minute=0, second=0)

        if not (market_open <= now <= market_close):
            results.append(ValidationResult(
                is_valid=False,
                severity=ValidationSeverity.CRITICAL,
                rule_name="MARKET_HOURS",
                message=f"Signal generated outside market hours ({now.strftime('%H:%M')} ET)",
                signal_id=signal['signal_id'],
                timestamp=datetime.now().isoformat()
            ))

        # Rule 11: VIX spike protection (halt signals if VIX > 40)
        # This would require real-time VIX data
        vix = self._get_current_vix()  # Implement this
        if vix and vix > 40:
            results.append(ValidationResult(
                is_valid=False,
                severity=ValidationSeverity.WARNING,
                rule_name="HIGH_VOLATILITY_ENVIRONMENT",
                message=f"VIX at {vix:.1f} indicates extreme volatility",
                signal_id=signal['signal_id'],
                timestamp=datetime.now().isoformat()
            ))

        return results

    def _validate_strategy_coherence(self, signal: dict) -> list[ValidationResult]:
        """Validate signal matches declared strategy rules."""
        results = []
        strategy = signal.get('strategy')

        if strategy == "SCALPING":
            # Scalping rules: High volume, tight stops, quick exits
            target = signal.get('target_price', 0)
            entry = signal.get('entry_price', 0)
            if entry > 0:
                target_gain_pct = ((target - entry) / entry) * 100
                if target_gain_pct > 25:
                    results.append(ValidationResult(
                        is_valid=False,
                        severity=ValidationSeverity.WARNING,
                        rule_name="SCALPING_TARGET_TOO_HIGH",
                        message=f"Scalping target {target_gain_pct:.1f}% exceeds typical 10-20% range",
                        signal_id=signal['signal_id'],
                        timestamp=datetime.now().isoformat()
                    ))

        elif strategy == "MOMENTUM":
            # Momentum rules: Strong directional movement, higher targets
            contract = signal.get('contract', {})
            delta = abs(contract.get('greeks', {}).get('delta', 0))
            if delta < 0.5:
                results.append(ValidationResult(
                    is_valid=False,
                    severity=ValidationSeverity.WARNING,
                    rule_name="MOMENTUM_LOW_DELTA",
                    message=f"Momentum trade should have delta ≥0.5, got {delta:.2f}",
                    signal_id=signal['signal_id'],
                    timestamp=datetime.now().isoformat()
                ))

        return results

    def _calculate_days_to_expiration(self, expiration_date: str) -> int:
        """Calculate days to expiration from date string."""
        exp_date = datetime.strptime(expiration_date, '%Y-%m-%d')
        today = datetime.now()
        return (exp_date - today).days

    def _get_current_vix(self) -> Optional[float]:
        """Get current VIX level (implement with real-time data)."""
        # TODO: Implement with actual VIX data source
        return None
```

#### Tasks
- [ ] **Implement SignalValidator class** (code above)
- [ ] **Create validation results database table**
  ```sql
  CREATE TABLE signal_validations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      signal_id VARCHAR(255) NOT NULL,
      is_valid BOOLEAN NOT NULL,
      critical_failures INT DEFAULT 0,
      warnings INT DEFAULT 0,
      info_messages INT DEFAULT 0,
      validation_results JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      INDEX idx_signal_id (signal_id),
      INDEX idx_created_at (created_at)
  );
  ```

- [ ] **Integrate validator into signal generation pipeline**
  ```python
  # In options_signal_detector.py
  validator = SignalValidator()

  def generate_signals(...):
      raw_signals = self._scan_for_signals()

      validated_signals = []
      for signal in raw_signals:
          is_valid, results = validator.validate_signal(signal)

          # Log validation results
          self._log_validation(signal['signal_id'], results)

          if is_valid:
              validated_signals.append(signal)
          else:
              critical_failures = [r for r in results if r.severity == ValidationSeverity.CRITICAL]
              logger.warning(f"Signal {signal['signal_id']} rejected: {critical_failures}")

      return validated_signals
  ```

#### Verification
- [ ] **Unit tests:** Each validation rule has 3 tests (pass, fail, edge case)
- [ ] **Integration test:** Generate 100 signals, validate all, check results logged
- [ ] **Evidence:** Validation metrics dashboard shows pass/fail rates

**Completion Criteria:**
- All 11 validation rules implemented
- Validation results logged to database
- Only valid signals reach frontend
- 100% test coverage for validation rules

---

### 2.2 90-Day Backtesting Engine (Week 3, Days 3-5 + Week 4)
**Priority:** P0 - CRITICAL for trust
**Artifact Type:** Full Document (backtest system)

#### Architecture

Create `/backend/backtest_validator.py`:

```python
from datetime import datetime, timedelta
import pandas as pd
from typing import List, Dict
import asyncio

class BacktestValidator:
    """
    90-day rolling backtest to validate signal quality.

    Tracks:
    - Win rate by strategy
    - Average P&L per signal
    - Max drawdown
    - Sharpe ratio
    - Signal accuracy vs. declared confidence
    """

    def __init__(self, supabase_client):
        self.db = supabase_client
        self.lookback_days = 90

    async def run_backtest(self, strategy: str = None) -> Dict:
        """
        Run backtest on last 90 days of signals.

        Returns:
        - win_rate: % of profitable signals
        - avg_pnl: Average profit/loss per signal
        - sharpe_ratio: Risk-adjusted return
        - confidence_accuracy: How well confidence predicts outcomes
        - max_drawdown: Largest losing streak
        """
        # Fetch historical signals
        signals = await self._fetch_historical_signals(strategy)

        # Simulate trades
        trades = await self._simulate_trades(signals)

        # Calculate metrics
        metrics = self._calculate_metrics(trades)

        # Store backtest results
        await self._store_backtest_results(metrics, strategy)

        return metrics

    async def _fetch_historical_signals(self, strategy: str = None) -> List[Dict]:
        """Fetch all signals from last 90 days."""
        cutoff_date = datetime.now() - timedelta(days=self.lookback_days)

        query = self.db.table('signals') \
            .select('*') \
            .gte('timestamp', cutoff_date.isoformat())

        if strategy:
            query = query.eq('strategy', strategy)

        response = query.execute()
        return response.data

    async def _simulate_trades(self, signals: List[Dict]) -> List[Dict]:
        """
        Simulate trading each signal using historical price data.

        For each signal:
        1. Enter at entry_price (or next available price)
        2. Check if target_price hit within 24 hours
        3. Check if stop_loss hit
        4. Calculate actual P&L
        """
        trades = []

        for signal in signals:
            # Fetch historical price data for the contract
            price_data = await self._fetch_historical_prices(
                signal['contract']['symbol'],
                signal['contract']['strike'],
                signal['contract']['expiration'],
                signal['timestamp']
            )

            # Simulate trade execution
            trade_result = self._execute_simulated_trade(signal, price_data)
            trades.append(trade_result)

        return trades

    def _execute_simulated_trade(self, signal: Dict, price_data: pd.DataFrame) -> Dict:
        """
        Execute one simulated trade.

        Rules:
        - Enter at entry_price (or next tick if not available)
        - Exit at target_price (win) or stop_loss (loss)
        - If neither hit within 24 hours, exit at current price
        - Track slippage vs. ideal execution
        """
        entry_price = signal['entry_price']
        target_price = signal['target_price']
        stop_loss = signal['stop_loss']
        entry_time = pd.to_datetime(signal['timestamp'])
        exit_time = entry_time + timedelta(hours=24)

        # Filter price data to trade window
        trade_window = price_data[
            (price_data.index >= entry_time) &
            (price_data.index <= exit_time)
        ]

        # Find actual entry (first price after signal)
        actual_entry = trade_window.iloc[0]['price'] if len(trade_window) > 0 else entry_price

        # Check for target hit
        target_hit = (trade_window['price'] >= target_price).any()

        # Check for stop hit
        stop_hit = (trade_window['price'] <= stop_loss).any()

        # Determine outcome
        if target_hit and not stop_hit:
            outcome = 'WIN'
            exit_price = target_price
        elif stop_hit:
            outcome = 'LOSS'
            exit_price = stop_loss
        else:
            outcome = 'TIMEOUT'
            exit_price = trade_window.iloc[-1]['price'] if len(trade_window) > 0 else entry_price

        # Calculate P&L
        pnl = (exit_price - actual_entry) / actual_entry * 100

        return {
            'signal_id': signal['signal_id'],
            'strategy': signal['strategy'],
            'confidence': signal['confidence'],
            'entry_price_ideal': entry_price,
            'entry_price_actual': actual_entry,
            'exit_price': exit_price,
            'target_price': target_price,
            'stop_loss': stop_loss,
            'outcome': outcome,
            'pnl_percent': pnl,
            'slippage': (actual_entry - entry_price) / entry_price * 100,
            'duration_minutes': (exit_time - entry_time).total_seconds() / 60
        }

    def _calculate_metrics(self, trades: List[Dict]) -> Dict:
        """Calculate backtest performance metrics."""
        df = pd.DataFrame(trades)

        # Win rate
        wins = len(df[df['outcome'] == 'WIN'])
        losses = len(df[df['outcome'] == 'LOSS'])
        total = len(df)
        win_rate = wins / total if total > 0 else 0

        # Average P&L
        avg_pnl = df['pnl_percent'].mean()

        # Average win vs. average loss
        avg_win = df[df['outcome'] == 'WIN']['pnl_percent'].mean() if wins > 0 else 0
        avg_loss = df[df['outcome'] == 'LOSS']['pnl_percent'].mean() if losses > 0 else 0

        # Profit factor (total wins / total losses)
        total_wins = df[df['outcome'] == 'WIN']['pnl_percent'].sum()
        total_losses = abs(df[df['outcome'] == 'LOSS']['pnl_percent'].sum())
        profit_factor = total_wins / total_losses if total_losses > 0 else float('inf')

        # Sharpe ratio (assuming 252 trading days)
        returns = df['pnl_percent'] / 100
        sharpe = (returns.mean() / returns.std()) * np.sqrt(252) if returns.std() > 0 else 0

        # Max drawdown
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.cummax()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min()

        # Confidence calibration (are 70% confidence signals actually winning 70%?)
        confidence_accuracy = {}
        for conf_level in [0.7, 0.75, 0.8, 0.85, 0.9]:
            conf_trades = df[df['confidence'] >= conf_level]
            if len(conf_trades) > 0:
                actual_win_rate = len(conf_trades[conf_trades['outcome'] == 'WIN']) / len(conf_trades)
                confidence_accuracy[conf_level] = {
                    'expected_win_rate': conf_level,
                    'actual_win_rate': actual_win_rate,
                    'sample_size': len(conf_trades),
                    'accuracy_error': abs(actual_win_rate - conf_level)
                }

        # Strategy breakdown
        strategy_metrics = {}
        for strategy in df['strategy'].unique():
            strat_df = df[df['strategy'] == strategy]
            strategy_metrics[strategy] = {
                'win_rate': len(strat_df[strat_df['outcome'] == 'WIN']) / len(strat_df),
                'avg_pnl': strat_df['pnl_percent'].mean(),
                'sample_size': len(strat_df)
            }

        return {
            'backtest_period_days': self.lookback_days,
            'total_signals': total,
            'win_rate': win_rate,
            'avg_pnl_percent': avg_pnl,
            'avg_win_percent': avg_win,
            'avg_loss_percent': avg_loss,
            'profit_factor': profit_factor,
            'sharpe_ratio': sharpe,
            'max_drawdown_percent': max_drawdown * 100,
            'confidence_accuracy': confidence_accuracy,
            'strategy_breakdown': strategy_metrics,
            'timestamp': datetime.now().isoformat()
        }

    async def _store_backtest_results(self, metrics: Dict, strategy: str = None):
        """Store backtest results in database."""
        await self.db.table('backtest_results').insert({
            'strategy': strategy,
            'metrics': metrics,
            'created_at': datetime.now().isoformat()
        }).execute()
```

#### Tasks
- [ ] **Implement BacktestValidator class** (code above)
- [ ] **Create database tables**
  ```sql
  CREATE TABLE backtest_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      strategy VARCHAR(50),
      metrics JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      INDEX idx_strategy (strategy),
      INDEX idx_created_at (created_at)
  );

  CREATE TABLE simulated_trades (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      signal_id VARCHAR(255) NOT NULL,
      strategy VARCHAR(50) NOT NULL,
      outcome VARCHAR(20) NOT NULL,
      pnl_percent DECIMAL(10, 2),
      created_at TIMESTAMP DEFAULT NOW(),
      INDEX idx_signal_id (signal_id),
      INDEX idx_outcome (outcome)
  );
  ```

- [ ] **Schedule daily backtest runs** (Celery task)
  ```python
  from celery import Celery
  from celery.schedules import crontab

  @celery.task
  def run_daily_backtest():
      """Run at 6pm ET daily (after market close)."""
      validator = BacktestValidator(supabase)

      # Run for each strategy
      for strategy in ['SCALPING', 'MOMENTUM', 'VOLUME_SPIKE']:
          results = await validator.run_backtest(strategy)
          logger.info(f"Backtest {strategy}: Win rate {results['win_rate']:.1%}")

      # Run overall backtest
      overall = await validator.run_backtest()
      logger.info(f"Overall backtest: Win rate {overall['win_rate']:.1%}")

  # Schedule in celeryconfig.py
  beat_schedule = {
      'daily-backtest': {
          'task': 'tasks.run_daily_backtest',
          'schedule': crontab(hour=18, minute=0)  # 6pm ET
      }
  }
  ```

- [ ] **Create backtest results API endpoint**
  ```python
  @app.get("/api/backtest/results")
  async def get_backtest_results(strategy: str = None):
      """Get latest backtest results."""
      query = supabase.table('backtest_results') \
          .select('*') \
          .order('created_at', desc=True) \
          .limit(1)

      if strategy:
          query = query.eq('strategy', strategy)

      result = await query.execute()
      return result.data[0] if result.data else None
  ```

#### Verification
- [ ] **Unit test:** Simulate 100 trades with known outcomes, verify metrics calculated correctly
- [ ] **Integration test:** Run backtest on real historical signals (30-day sample)
- [ ] **Performance test:** Backtest must complete in <5 minutes for 90 days of data
- [ ] **Evidence:** Backtest report showing win rate ≥60% for each strategy

**Completion Criteria:**
- Backtest runs daily at 6pm ET
- Results stored in database
- API endpoint returns latest metrics
- Win rate ≥60% across 90 days
- Confidence accuracy error <10%

---

### 2.3 Signal Quality Dashboard (Week 5, Days 1-3)
**Priority:** P1 - HIGH (transparency)
**Artifact Type:** Full Document (UI page)

#### Design Intent Declaration
- **User type:** Traders evaluating signal reliability
- **Primary decision:** Should I trust these signals with real money?
- **Excluded on purpose:** Individual trade details, real-time monitoring
- **Failure definition:** User can't quickly assess signal quality
- **UI Mode:** MODE_SAAS (balanced density, clear value framing)

#### Required UI States
- **Default:** Show 90-day backtest metrics
- **Loading:** "Calculating signal metrics..."
- **Empty:** "No backtest data yet (requires 30 days of signals)"
- **Error:** "Failed to load metrics. Try refreshing."
- **Success:** Full metrics dashboard displayed

#### Tasks
- [ ] **Create page** `/webapp/app/signal-quality/page.tsx`
- [ ] **Implement UI components:**
  - Overall win rate card (big number, trend line)
  - Strategy breakdown table (win rate by strategy)
  - Confidence calibration chart (expected vs. actual)
  - Recent validation failures log
  - Signal volume over time chart

- [ ] **Add to navigation**
  ```tsx
  <nav>
    <Link href="/">Signals</Link>
    <Link href="/paper-trading">Paper Trading</Link>
    <Link href="/signal-quality">Signal Quality</Link>
  </nav>
  ```

#### Verification
- [ ] **Playwright test:** Navigate to /signal-quality, verify metrics displayed
- [ ] **Screenshot test:** Compare before/after for regressions
- [ ] **Accessibility test:** Keyboard navigation works, screen reader compatible

**Completion Criteria:**
- Dashboard shows all key metrics
- Updates daily with new backtest results
- All 5 UI states implemented
- Playwright verification passes

---

### 2.4 Real-Time Signal Monitoring (Week 5, Days 4-5)
**Priority:** P2 - MEDIUM
**Artifact Type:** Component (monitoring system)

#### Tasks
- [ ] **Create monitoring agent** `/backend/signal_monitor.py`
  ```python
  class SignalMonitor:
      """Monitor signal performance in real-time."""

      def monitor_active_signals(self):
          """Check all open paper trades for outcome updates."""
          active_trades = supabase.table('paper_trades') \
              .select('*') \
              .is_('closed_at', 'null') \
              .execute()

          for trade in active_trades.data:
              # Check if target or stop hit
              current_price = self._get_current_price(trade['contract'])

              if current_price >= trade['target_price']:
                  self._close_trade(trade['id'], current_price, 'TARGET_HIT')
              elif current_price <= trade['stop_price']:
                  self._close_trade(trade['id'], current_price, 'STOP_HIT')
  ```

- [ ] **Schedule monitoring every 1 minute** (Celery beat)
- [ ] **Create alert system for anomalies**
  - Win rate drops below 50%
  - 5 consecutive losing signals
  - Data validation failures spike

#### Verification
- [ ] **Integration test:** Create paper trade, simulate price movement, verify auto-close
- [ ] **Alert test:** Trigger anomaly condition, verify alert sent

**Completion Criteria:**
- Active trades monitored every minute
- Auto-close on target/stop hit
- Anomaly alerts working

---

## PHASE 3: UI/UX EXCELLENCE (Weeks 6-7)
**Goal:** Transform generic SaaS dashboard into decision-oriented trading interface
**Engineering Mode:** MODE: APP
**Product Target:** WEB_APP
**Quality Gate:** UX Score must be ≥4 in all 8 categories

### 3.1 Design System Audit & Refactor (Week 6, Days 1-2)
**Priority:** P1 - HIGH
**Artifact Type:** Full Document (design system)

#### Current UI Violations (From CLAUDE.md)
1. ❌ Generic SaaS dashboard layout
2. ❌ Everything in cards
3. ❌ Centered content with no hierarchy
4. ❌ Symmetry without purpose
5. ❌ 15+ data points per signal card (information overload)

#### Refactor Checklist Application
Apply 10-point refactor checklist to main dashboard:

**1. Intent & Job Check**
- Current: "Show options signals"
- Should be: "Help trader decide: Buy this signal or skip?"

**2. Hierarchy Check**
- Current: All signals equal visual weight
- Should be: High-confidence signals visually dominant

**3. Layout & Spacing Check**
- Current: Symmetric 3-column grid
- Should be: Asymmetric layout, primary content 60% width

**4. Affordance & Interaction Check**
- Current: Paper Trade button same size as Expand
- Should be: Paper Trade primary action, larger and prominent

**5. State Completeness Check**
- Missing: Empty state when filters return 0 results
- Missing: Degraded state when API slow

**6. Copy & Language Check**
- Current: "Paper Trade" (action unclear)
- Should be: "Add to Paper Portfolio" (outcome clear)

**7. Cognitive Load Check**
- Current: 15 data points visible simultaneously
- Should be: 5 critical points, progressive disclosure for rest

**8. Accessibility Check**
- Missing: Keyboard shortcuts for common actions
- Missing: Focus visible on all interactive elements

**9. Visual Noise Check**
- Current: Borders on every card, dividers everywhere
- Should be: Spacing creates separation, minimal borders

**10. Senior Designer Test**
- Would a senior designer approve? **NO**
- Reason: Generic template, no design decisions evident

#### Tasks
- [ ] **Create design system document** (`/webapp/docs/DESIGN_SYSTEM.md`)
  ```markdown
  # TradeFly Design System

  ## Visual Hierarchy Levels
  1. Primary Action (Paper Trade) - 48px height, blue accent
  2. Secondary Actions (Expand, View Details) - 32px height, neutral
  3. Tertiary (Filters, Settings) - 24px height, subtle

  ## Spacing Scale (Strict)
  4px / 8px / 12px / 16px / 24px / 32px / 48px / 64px

  ## Typography Scale
  - Display: 32px/40px (page titles)
  - Heading: 24px/32px (section headers)
  - Body: 16px/24px (content)
  - Caption: 14px/20px (metadata)
  - Label: 12px/16px (form labels)

  ## Color Semantic Meaning
  - Blue (#3B82F6): Primary actions, links
  - Green (#10B981): Profit, bullish, success
  - Red (#EF4444): Loss, bearish, destructive
  - Yellow (#F59E0B): Warning, caution
  - Neutral (#A3A3A3): Inactive, metadata
  ```

- [ ] **Redesign signal card** (reduce from 15 to 5 data points)
  ```tsx
  // OLD (information overload):
  <SignalCard>
    <Symbol>AAPL</Symbol>
    <Strike>$170</Strike>
    <Expiration>2025-01-17</Expiration>
    <Side>CALL</Side>
    <EntryPrice>$5.50</EntryPrice>
    <TargetPrice>$8.25</TargetPrice>
    <StopLoss>$4.95</StopLoss>
    <Confidence>85%</Confidence>
    <Delta>0.65</Delta>
    <Gamma>0.05</Gamma>
    <Theta>-0.12</Theta>
    <Vega>0.25</Vega>
    <IV>45%</IV>
    <Volume>2,500</Volume>
    <OpenInterest>10,000</OpenInterest>
  </SignalCard>

  // NEW (essential only, progressive disclosure):
  <SignalCard>
    <Header>
      <Symbol size="lg">AAPL $170 Call</Symbol>
      <Confidence level="high">85% confidence</Confidence>
    </Header>

    <PrimaryMetrics>
      <Entry>$5.50</Entry>
      <Target gain="+50%">$8.25</Target>
      <Risk loss="-10%">$4.95</Risk>
    </PrimaryMetrics>

    <ActionBar>
      <Button size="lg" variant="primary">Add to Paper Portfolio</Button>
      <IconButton onClick={expand}>↓ See Greeks & Analysis</IconButton>
    </ActionBar>

    {expanded && (
      <ExpandedSection>
        <GreeksTable />
        <TechnicalIndicators />
        <VolumeMetrics />
      </ExpandedSection>
    )}
  </SignalCard>
  ```

#### Verification
- [ ] **UX Score:** Run eval on new design, must score ≥4 in all categories
- [ ] **Refactor Checklist:** All 10 items pass
- [ ] **User test:** 3 users can complete "Add signal to paper trading" in <10 seconds

**Completion Criteria:**
- Design system document created
- Signal card redesigned (5 primary metrics)
- UX Score ≥4 all categories
- User test passes

---

### 3.2 Dashboard Redesign (Week 6, Days 3-5)
**Priority:** P1 - HIGH
**Artifact Type:** Full Document (main page)

#### Design Intent Declaration
- **User type:** Active trader scanning for high-probability setups
- **Primary decision:** Which signal(s) to add to paper portfolio right now?
- **Excluded on purpose:** Historical analysis, educational content, social features
- **Failure definition:** Trader can't quickly identify best signals
- **UI Mode:** MODE_SAAS (customer-facing, balanced density)

#### New Layout Architecture
```
┌─────────────────────────────────────────────────────────┐
│ Header: Market Status + Live Clock + Signal Quality    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌────────────────────┐  ┌─────────────────────────┐   │
│ │                    │  │                         │   │
│ │  HIGH CONFIDENCE   │  │  RECENT ACTIVITY        │   │
│ │  SIGNALS           │  │  - Top Movers           │   │
│ │  (Confidence≥80%)  │  │  - Latest Signals       │   │
│ │                    │  │  - Your Portfolio       │   │
│ │  [3-5 cards]       │  │                         │   │
│ │  60% width         │  │  40% width              │   │
│ │                    │  │                         │   │
│ └────────────────────┘  └─────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │  ALL SIGNALS (Filterable)                       │   │
│ │  [Remaining signals, expandable]                │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Tasks
- [ ] **Implement asymmetric layout** (60/40 split, not symmetric 50/50)
- [ ] **Visual hierarchy:**
  - High-confidence signals: Larger cards, blue accent border
  - Medium confidence: Standard size
  - Low confidence: Collapsed by default

- [ ] **Remove unnecessary borders/dividers**
  - Use spacing (24px/32px) to create visual separation
  - Only use borders for interactive elements

- [ ] **Add empty states:**
  ```tsx
  {signals.length === 0 && (
    <EmptyState>
      <Icon>📊</Icon>
      <Heading>No signals match your filters</Heading>
      <Description>
        Try adjusting your confidence threshold or strategy selection
      </Description>
      <Button onClick={resetFilters}>Reset Filters</Button>
    </EmptyState>
  )}
  ```

#### Verification
- [ ] **Screenshot comparison:** Before/after design
- [ ] **Hierarchy test:** Ask 5 users "What's the most important element?" (should say high-confidence signals)
- [ ] **UX Score:** Must score ≥4 in Hierarchy, Speed to Action, Cognitive Load

**Completion Criteria:**
- Asymmetric layout implemented
- Visual hierarchy clear (high-confidence signals dominant)
- All empty states implemented
- UX Score passes

---

### 3.3 Accessibility Compliance (Week 7, Days 1-2)
**Priority:** P1 - HIGH (correctness requirement)
**Artifact Type:** Component (a11y system)

#### WCAG AA Requirements
1. **Keyboard Navigation**
   - All interactive elements focusable
   - Logical tab order
   - No keyboard traps
   - Visible focus states

2. **Color Contrast**
   - Text: 4.5:1 minimum
   - Large text: 3:1 minimum
   - Interactive elements: 3:1 minimum

3. **Screen Reader Support**
   - Semantic HTML
   - ARIA labels where needed
   - Alternative text for images
   - Status updates announced

4. **No Color-Only Meaning**
   - Use icons + color (not color alone)
   - Patterns in charts (not just color)

#### Tasks
- [ ] **Audit current accessibility** (use axe DevTools)
  ```bash
  npm install -D @axe-core/playwright
  ```

  ```typescript
  // Add to Playwright tests
  import { injectAxe, checkA11y } from 'axe-playwright'

  test('homepage is accessible', async ({ page }) => {
    await page.goto('http://localhost:3006')
    await injectAxe(page)
    await checkA11y(page)
  })
  ```

- [ ] **Fix keyboard navigation**
  ```tsx
  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'p':
            e.preventDefault()
            // Focus on paper trade button
            break
          case 'f':
            e.preventDefault()
            // Focus on filter input
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])
  ```

- [ ] **Add ARIA labels**
  ```tsx
  <button
    aria-label="Add AAPL $170 Call to paper trading portfolio"
    aria-describedby="signal-confidence"
  >
    Add to Portfolio
  </button>
  <span id="signal-confidence" aria-live="polite">
    85% confidence signal
  </span>
  ```

- [ ] **Improve color contrast**
  ```css
  /* Before (fails WCAG): */
  .text-gray-400 { color: #9CA3AF; } /* Only 2.8:1 contrast on #0a0a0a */

  /* After (passes WCAG): */
  .text-gray-300 { color: #D1D5DB; } /* 4.6:1 contrast on #0a0a0a */
  ```

#### Verification
- [ ] **Axe audit:** 0 violations
- [ ] **Keyboard test:** Complete full trading workflow (browse → filter → add to paper trading) using only keyboard
- [ ] **Screen reader test:** VoiceOver/NVDA can navigate and understand all content
- [ ] **Evidence:** Axe report showing 0 violations

**Completion Criteria:**
- 0 Axe violations
- Full keyboard navigation
- WCAG AA compliant contrast
- Screen reader compatible

---

### 3.4 Performance Optimization (Week 7, Days 3-5)
**Priority:** P1 - HIGH
**Artifact Type:** Automation (performance testing)

#### Performance Targets
- **Signal API Response:** <1 second (currently 2-5s)
- **UI Interaction:** <100ms (button click to visual feedback)
- **Page Load:** <2 seconds (First Contentful Paint)
- **Bundle Size:** <500KB gzipped

#### Tasks
- [ ] **Backend optimization: Pre-compute signals**
  ```python
  # Currently: Scan 100 stocks on every API request
  # New: Background task scans every 30s, serves from cache

  from celery import Celery
  from celery.schedules import crontab

  @celery.task
  def precompute_signals():
      """Run every 30 seconds to pre-generate signals."""
      detector = OptionsSignalDetector()
      signals = detector.generate_signals()

      # Store in Redis with 30s TTL
      redis_client.setex(
          'precomputed_signals',
          30,
          json.dumps(signals)
      )

  # API endpoint now just reads from cache
  @app.get("/api/options/signals")
  async def get_signals():
      cached = redis_client.get('precomputed_signals')
      if cached:
          return json.loads(cached)
      else:
          # Fallback: Generate on demand
          return detector.generate_signals()
  ```

- [ ] **Frontend optimization: Code splitting**
  ```typescript
  // Lazy load paper trading page
  const PaperTradingPage = dynamic(() => import('./paper-trading/page'))

  // Lazy load chart library
  const Chart = dynamic(() => import('lightweight-charts-react'))
  ```

- [ ] **Database indexing**
  ```sql
  -- Add indexes for common queries
  CREATE INDEX idx_signals_confidence ON signals(confidence DESC);
  CREATE INDEX idx_signals_timestamp ON signals(timestamp DESC);
  CREATE INDEX idx_signals_strategy ON signals(strategy);
  CREATE INDEX idx_signals_composite ON signals(timestamp DESC, confidence DESC, strategy);
  ```

- [ ] **Image optimization**
  ```typescript
  // Use Next.js Image component
  import Image from 'next/image'

  <Image
    src="/logo.png"
    width={200}
    height={50}
    alt="TradeFly AI"
    priority // Above fold
  />
  ```

#### Verification
- [ ] **Lighthouse audit:** Performance score ≥90
- [ ] **API benchmark:** 100 requests in <10 seconds (avg <100ms each)
- [ ] **Bundle analysis:** `npm run build && npm run analyze`
- [ ] **Evidence:** Lighthouse report + bundle size chart

**Completion Criteria:**
- Signal API <1s response time
- Lighthouse score ≥90
- Bundle size <500KB
- All performance targets met

---

## PHASE 4: PRODUCTION DEPLOYMENT (Week 8)
**Goal:** Deploy to production with zero downtime, full monitoring
**Engineering Mode:** MODE: AGENTIC
**Product Target:** WEB_APP + API_SERVICE
**Execution Gear:** GEAR: SHIP (mandatory automation/verification)

### 4.1 CI/CD Pipeline (Week 8, Days 1-2)
**Priority:** P0 - CRITICAL
**Artifact Type:** Automation (GitHub Actions)

#### Tasks
- [ ] **Create GitHub Actions workflow** `.github/workflows/deploy.yml`
  ```yaml
  name: Deploy to Production

  on:
    push:
      branches: [main]

  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Run Backend Tests
          run: |
            cd TradeFly-Backend
            pip install -r requirements.txt
            pytest tests/ --cov=. --cov-report=xml

        - name: Run Frontend Tests
          run: |
            cd webapp
            npm install
            npm run test
            npm run test:e2e

        - name: Security Scan
          run: |
            npm audit --production
            pip-audit

    deploy-backend:
      needs: test
      runs-on: ubuntu-latest
      steps:
        - name: Deploy to AWS EC2
          uses: appleboy/ssh-action@master
          with:
            host: 18.223.164.188
            username: ubuntu
            key: ${{ secrets.EC2_SSH_KEY }}
            script: |
              cd /opt/tradefly-backend
              git pull origin main
              pip install -r requirements.txt
              sudo systemctl restart tradefly-backend
              sleep 5
              curl -f http://localhost:8002/api/health || exit 1

    deploy-frontend:
      needs: test
      runs-on: ubuntu-latest
      steps:
        - name: Deploy to Vercel
          run: |
            npm install -g vercel
            vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
  ```

- [ ] **Add health checks**
  ```python
  @app.get("/api/health")
  async def health_check():
      return {
          "status": "healthy",
          "version": "1.0.0",
          "redis": await check_redis(),
          "database": await check_database(),
          "polygon_api": await check_polygon_api()
      }
  ```

#### Verification
- [ ] **Pipeline test:** Push to main branch, verify deployment succeeds
- [ ] **Rollback test:** Deploy broken code, verify automatic rollback
- [ ] **Evidence:** GitHub Actions logs showing successful deployment

**Completion Criteria:**
- CI/CD pipeline automated
- Tests run on every commit
- Automatic deployment to production
- Health checks verify deployment

---

### 4.2 Monitoring & Observability (Week 8, Days 3-4)
**Priority:** P0 - CRITICAL
**Artifact Type:** Component (monitoring)

#### Tasks
- [ ] **Install monitoring stack**
  ```bash
  # Prometheus + Grafana for metrics
  docker-compose up -d prometheus grafana

  # Sentry for error tracking
  pip install sentry-sdk[fastapi]
  npm install @sentry/nextjs
  ```

- [ ] **Configure Sentry**
  ```python
  import sentry_sdk
  from sentry_sdk.integrations.fastapi import FastApiIntegration

  sentry_sdk.init(
      dsn=os.getenv("SENTRY_DSN"),
      integrations=[FastApiIntegration()],
      traces_sample_rate=1.0,
      profiles_sample_rate=1.0,
      environment="production"
  )
  ```

- [ ] **Add custom metrics**
  ```python
  from prometheus_client import Counter, Histogram

  signal_generation_duration = Histogram(
      'signal_generation_seconds',
      'Time to generate signals'
  )

  signals_generated_total = Counter(
      'signals_generated_total',
      'Total signals generated',
      ['strategy']
  )

  @signal_generation_duration.time()
  def generate_signals():
      signals = detector.generate_signals()
      signals_generated_total.labels(strategy='SCALPING').inc(len(signals))
      return signals
  ```

- [ ] **Create Grafana dashboards**
  - API response times
  - Signal generation rate
  - Validation pass/fail rates
  - Database query performance
  - Error rates by endpoint

#### Verification
- [ ] **Alert test:** Trigger high error rate, verify alert received
- [ ] **Dashboard test:** All metrics populating correctly
- [ ] **Evidence:** Grafana dashboard screenshots

**Completion Criteria:**
- Sentry tracking errors
- Prometheus collecting metrics
- Grafana dashboards operational
- Alerts configured

---

### 4.3 DNS & Domain Setup (Week 8, Day 5)
**Priority:** P1 - HIGH
**Artifact Type:** Automation (DNS config)

#### Tasks
- [ ] **Configure DNS records**
  ```
  A record:    api.tradeflyai.com → 18.223.164.188
  A record:    app.tradeflyai.com → Vercel IP
  CNAME:       www.tradeflyai.com → app.tradeflyai.com
  ```

- [ ] **Update environment variables**
  ```bash
  # Frontend .env.production
  NEXT_PUBLIC_API_URL=https://api.tradeflyai.com
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

  # Backend .env
  ALLOWED_ORIGINS=https://app.tradeflyai.com,https://www.tradeflyai.com
  ```

#### Verification
- [ ] **DNS test:** `nslookup api.tradeflyai.com` resolves correctly
- [ ] **SSL test:** https://api.tradeflyai.com shows valid certificate
- [ ] **Frontend test:** https://app.tradeflyai.com loads correctly

**Completion Criteria:**
- DNS configured
- SSL certificates valid
- All domains resolve correctly

---

## PHASE 5: FEATURE COMPLETION (Weeks 9-10)
**Goal:** Complete 50% implemented features (backtesting UI, social platform)

### 5.1 Backtesting UI (Week 9)
*[Tasks omitted for brevity - see similar structure to Signal Quality Dashboard]*

### 5.2 Social Platform Phase 2 (Week 10)
*[Tasks omitted for brevity]*

---

## PHASE 6: POLISH & LAUNCH PREP (Weeks 11-12)
**Goal:** Final quality improvements, documentation, launch readiness

### 6.1 User Onboarding Flow (Week 11, Days 1-3)
### 6.2 Documentation & Help Center (Week 11, Days 4-5)
### 6.3 Final QA & Bug Fixes (Week 12, Days 1-3)
### 6.4 Launch Checklist (Week 12, Days 4-5)

---

## SUCCESS METRICS

### Week 2 Checkpoint (Security)
- [ ] 0 P0/P1 security vulnerabilities
- [ ] 100% of API endpoints authenticated
- [ ] HTTPS enabled
- [ ] Rate limiting active

### Week 5 Checkpoint (Signal Validation)
- [ ] Signal validation system live
- [ ] 90-day backtest win rate ≥60%
- [ ] Confidence accuracy error <10%
- [ ] Daily backtest runs automated

### Week 7 Checkpoint (UX)
- [ ] UX Score ≥4 in all 8 categories
- [ ] 0 Axe accessibility violations
- [ ] Performance: <1s API, >90 Lighthouse score
- [ ] Design system documented

### Week 8 Checkpoint (Production)
- [ ] CI/CD pipeline automated
- [ ] Monitoring operational
- [ ] DNS configured, HTTPS live
- [ ] Zero-downtime deployment proven

### Week 12 Checkpoint (Launch Ready)
- [ ] Engineering Score: 10/10
- [ ] UX Score: 10/10
- [ ] All features 100% complete
- [ ] Documentation published
- [ ] Launch checklist: 100% complete

---

## FINAL SCORE PROJECTION

**Current: 6.5/10**

After Phase 1-2 (Weeks 1-5): **8.0/10**
- Security: 3/10 → 10/10
- Validation: 0/10 → 10/10
- Still have UX/feature gaps

After Phase 3 (Weeks 6-7): **9.0/10**
- UX: 5/10 → 9/10
- Accessibility: 3/10 → 10/10
- Performance: 6/10 → 9/10

After Phase 4-6 (Weeks 8-12): **10/10**
- Deployment: 7/10 → 10/10
- Features: 6/10 → 10/10
- Documentation: 4/10 → 10/10
- Polish: 7/10 → 10/10

---

## EXECUTION PRINCIPLES

1. **No Shortcuts**: Every phase must pass quality gate
2. **Evidence Required**: All claims need automated verification
3. **Sequential Dependencies**: Cannot skip security to work on features
4. **Daily Standups**: Review progress against roadmap
5. **Weekly Retros**: Capture failures in FailureArchive
6. **Continuous Deployment**: Merge to main = deploy to production
7. **User Feedback Loop**: Weekly user testing sessions

---

**Document Status:** Draft v1.0
**Next Review:** After Phase 1 completion
**Owner:** Engineering Team
**Stakeholders:** Product, Design, Security
