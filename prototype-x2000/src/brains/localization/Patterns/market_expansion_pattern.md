# Pattern: Market Expansion

## Context

You are expanding your product into a new geographic market. This goes
beyond translation — it requires market research, cultural adaptation,
legal compliance, local payment methods, support infrastructure, and
go-to-market strategy. This pattern covers the full lifecycle from
market evaluation through post-launch optimization.

---

## When to Use

- Entering a new country or region with your product
- Expanding from single-market to multi-market presence
- Relaunching in a market after a previous failed attempt
- Evaluating whether a market warrants full localization investment

---

## Phase 1: Market Evaluation

### Objective
Determine if the market opportunity justifies the localization investment.

### Market Scoring

```
Market Opportunity Assessment:
├── Total Addressable Market (TAM)
│   ├── Population with internet access
│   ├── Target demographic size
│   └── Willingness to pay for category
│
├── Product-Market Signals
│   ├── Existing organic traffic from market
│   ├── Existing sign-ups from market (English)
│   ├── Competitor presence in market
│   └── App store search volume in local language
│
├── Localization Complexity
│   ├── Linguistic distance from source (EN)
│   ├── Script complexity (Latin, CJK, Arabic, Devanagari)
│   ├── Legal/regulatory burden
│   ├── Cultural adaptation required
│   └── RTL requirement
│
├── Infrastructure Readiness
│   ├── Payment methods available
│   ├── CDN/hosting coverage
│   ├── Support language capability
│   └── Partner/vendor availability
│
└── Strategic Alignment
    ├── Board/investor priority
    ├── Competitive moat potential
    └── Revenue timeline expectations
```

### Decision Framework

| Score Range | Recommendation | Next Step |
|------------|---------------|-----------|
| 8.0-10.0 | Strong go | Proceed to Phase 2 immediately |
| 6.0-7.9 | Conditional go | MVL validation first |
| 4.0-5.9 | Explore | Community translation or MT-only |
| Below 4.0 | Not now | Revisit in 6-12 months |

---

## Phase 2: Market Preparation

### Objective
Prepare all non-product requirements for market entry.

### Legal and Compliance

```
Legal Readiness:
├── [ ] Privacy policy compliant with local regulation
├── [ ] Terms of service valid in jurisdiction
├── [ ] Cookie consent mechanism appropriate for market
├── [ ] Data residency requirements assessed
├── [ ] Tax registration completed (VAT, GST, etc.)
├── [ ] Local entity or representation (if required)
├── [ ] Age rating obtained (if applicable)
├── [ ] Industry-specific regulations reviewed
├── [ ] Export control compliance verified
└── [ ] Intellectual property protection filed
```

### Payment Infrastructure

| Market | Essential Payment Methods | Notes |
|--------|-------------------------|-------|
| Germany | SEPA Direct Debit, PayPal, Klarna | Germans prefer direct debit |
| Japan | Credit card, Conbini, bank transfer | Convenience store payment essential |
| Brazil | Boleto, PIX, credit card (installments) | Installments expected for >$20 |
| India | UPI, credit card, wallets (Paytm, PhonePe) | UPI now dominant |
| South Korea | Credit card, KakaoPay, Naver Pay | Local wallets important |
| Netherlands | iDEAL, credit card | iDEAL dominates |
| China | Alipay, WeChat Pay | Western cards rarely accepted |
| Middle East | Cash on delivery, credit card, STC Pay | COD still significant |

### Support Infrastructure

```
Support Setup:
├── [ ] Support in target language available
│   ├── Native language agents (hire or outsource)
│   ├── Translated knowledge base (priority articles)
│   └── Chatbot/AI support in target language
│
├── [ ] Support channels appropriate for market
│   ├── Email (universal)
│   ├── Chat (preferred in Asia)
│   ├── Phone (expected in some B2B markets)
│   ├── WhatsApp (Latin America, Middle East)
│   └── LINE (Japan), WeChat (China), KakaoTalk (Korea)
│
├── [ ] Support hours aligned with market timezone
│   └── Minimum: business hours in local timezone
│
└── [ ] Escalation path for locale-specific issues
```

---

## Phase 3: Product Localization

### Objective
Localize the product for the target market with appropriate depth.

### Localization Scope by Market Tier

| Component | Full Market | MVL Market |
|-----------|-----------|-----------|
| Core UI | 100% translated | Core flows only (30-40%) |
| Onboarding | Fully localized + adapted | Translated |
| Marketing site | Full localization + SEO | Landing page only |
| Help/docs | Top 20 articles | FAQ only |
| Legal | Full local compliance | Privacy + ToS |
| Email | All lifecycle emails | Welcome + billing only |
| Support | Native language | English + MT assist |
| Payment | Local methods | International methods + currency |

### Cultural Adaptation Checklist

```
Cultural Review:
├── [ ] Color palette culturally appropriate
├── [ ] Imagery reviewed for cultural sensitivity
├── [ ] Iconography checked for local meaning
├── [ ] Date/time format correct for locale
├── [ ] Number format correct for locale
├── [ ] Currency format and symbol correct
├── [ ] Name format accommodates local conventions
├── [ ] Address format matches local standard
├── [ ] Phone format matches local convention
├── [ ] Examples/sample data culturally relevant
├── [ ] Humor/idioms removed or adapted
├── [ ] Social proof adapted (local testimonials)
└── [ ] Seasonal references appropriate
```

---

## Phase 4: Go-to-Market

### Objective
Launch in the market with appropriate marketing and distribution.

### GTM Checklist

```
Marketing:
├── [ ] Landing page live in target language
├── [ ] SEO optimized with local keywords (not translated EN keywords)
├── [ ] App store listing localized (title, description, screenshots)
├── [ ] Press release in local language (if PR strategy)
├── [ ] Social media presence on local platforms
├── [ ] Launch promotion (localized discount, trial, etc.)
└── [ ] Influencer/partner outreach in market

Distribution:
├── [ ] App available in local app store(s)
├── [ ] Website accessible from market (no geo-blocking)
├── [ ] CDN optimized for market (edge location nearby)
├── [ ] DNS/hosting performs well from market
└── [ ] Search engine visibility (Google, Yandex, Baidu, Naver)

Analytics:
├── [ ] Market-specific dashboard configured
├── [ ] Funnel tracking per locale
├── [ ] Revenue tracking in local currency
├── [ ] Conversion rate monitoring
└── [ ] User feedback collection in local language
```

---

## Phase 5: Post-Launch Optimization

### Objective
Monitor market performance and optimize localization quality based
on real user data.

### 30-Day Review

```
Performance Metrics:
├── [ ] Sign-up rate vs. baseline/expectation
├── [ ] Activation rate (first key action)
├── [ ] Conversion rate (free to paid)
├── [ ] Revenue per user (ARPU)
├── [ ] Support ticket volume and sentiment
├── [ ] NPS score from localized users
├── [ ] App store rating in market
└── [ ] Organic search traffic growth

Quality Metrics:
├── [ ] Localization bugs reported and fixed
├── [ ] Translation quality feedback from users
├── [ ] Cultural issues identified and resolved
├── [ ] Missing translations or English leaking through
└── [ ] UI/layout issues in localized screens

Optimization Actions:
├── [ ] Fix critical localization bugs immediately
├── [ ] Update translations based on user feedback
├── [ ] Expand content coverage based on demand
├── [ ] Add local payment methods based on drop-off data
├── [ ] Optimize SEO based on search console data
└── [ ] Document learnings for next market expansion
```

### Tier Promotion Decision (at 90 days)

```
Is the market generating revenue above threshold?
├── Yes → Promote tier (expand localization depth)
│   ├── Translate more content
│   ├── Add local payment methods
│   ├── Invest in local support
│   └── Expand marketing
└── No → Investigate
    ├── Product-market fit issue? → Pause l10n, research
    ├── Quality issue? → Fix localization, add QA
    ├── Distribution issue? → Improve SEO, marketing
    └── Timing issue? → Continue monitoring
```

---

## Anti-Patterns

| Anti-Pattern | Consequence | Prevention |
|-------------|-------------|------------|
| Full localization without validation | Expensive investment in wrong market | MVL first |
| Translation without cultural adaptation | Product feels foreign to local users | Cultural review checklist |
| Ignoring local payment methods | Massive payment drop-off | Payment method research |
| US-centric support | Users frustrated with timezone gaps | Local-hour support |
| Translating SEO keywords | Wrong keywords, no organic traffic | Local keyword research |
| Launching without local legal review | Regulatory non-compliance | Legal checklist per market |

---

## Estimated Timeline

| Phase | Duration | Key Dependency |
|-------|----------|----------------|
| Phase 1: Evaluation | 1-2 weeks | Market data availability |
| Phase 2: Preparation | 2-6 weeks | Legal, payment, support setup |
| Phase 3: Localization | 2-4 weeks | Translation capacity |
| Phase 4: GTM | 1-2 weeks | Marketing readiness |
| Phase 5: Optimization | Ongoing (30-90 day milestones) | User data |
| **Total to launch** | **6-14 weeks** | |
