"""MBA Agent - Business strategy and operations specialist."""

from typing import Any, Optional

from ..core.base_agent import BaseAgent, AgentResponse
from ..core.memory_client import SupabaseMemoryClient


class MBAAgent(BaseAgent):
    """MBA specialist agent.

    Handles:
    - Business strategy and planning
    - Market analysis and competitive intelligence
    - Financial modeling and projections
    - Operations and process optimization
    - Go-to-market strategy
    - Team leadership and management
    - Investment and fundraising
    - Business model design

    Uses the MBA Brain guidance for all decisions.
    """

    AGENT_TYPE = "mba"
    BRAIN_NAME = "mba"
    DEFAULT_MODEL = "claude-sonnet-4-20250514"

    def __init__(
        self,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        memory_client: Optional[SupabaseMemoryClient] = None,
        auto_log: bool = True,
    ):
        """Initialize the MBA agent.

        Args:
            model: Model to use. Defaults to claude-sonnet-4.
            api_key: Anthropic API key.
            memory_client: Supabase client for logging.
            auto_log: Whether to auto-log runs.
        """
        super().__init__(
            model=model,
            api_key=api_key,
            memory_client=memory_client,
            auto_log=auto_log,
        )

        self._register_mba_tools()

    def _get_agent_instructions(self) -> str:
        """Return MBA-specific instructions."""
        return """You are the MBA Agent - a seasoned business strategist and operator.

Your capabilities:
- Develop business strategies and plans
- Analyze markets and competitors
- Create financial models and projections
- Design business models and revenue strategies
- Plan go-to-market strategies
- Optimize operations and processes
- Guide team structure and leadership
- Prepare investor materials

Frameworks you use:
- SWOT Analysis
- Porter's Five Forces
- Business Model Canvas
- Jobs to be Done
- OKRs (Objectives and Key Results)
- Unit Economics (LTV, CAC, etc.)

Rules:
- Recommendations must be actionable
- Include quantifiable metrics where possible
- Consider both short-term and long-term implications
- Account for resource constraints
- Base decisions on data when available

Tools available:
- create_business_model: Generate Business Model Canvas
- create_swot_analysis: Analyze strengths, weaknesses, opportunities, threats
- calculate_unit_economics: Compute LTV, CAC, payback period
- create_go_to_market: Design GTM strategy
- create_competitive_analysis: Analyze competitive landscape
- log_strategic_decision: Save major decisions to memory

Output format:
- Use clear sections and bullet points
- Include key metrics and KPIs
- Provide implementation steps
- Highlight risks and mitigations
"""

    def _register_mba_tools(self) -> None:
        """Register MBA-specific tools."""
        self.register_tool(
            name="create_business_model",
            description="Generate a Business Model Canvas",
            input_schema={
                "type": "object",
                "properties": {
                    "company_name": {
                        "type": "string",
                        "description": "Name of the company/product",
                    },
                    "value_proposition": {
                        "type": "string",
                        "description": "Core value proposition",
                    },
                    "customer_segments": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Target customer segments",
                    },
                },
                "required": ["company_name", "value_proposition"],
            },
            handler=self._create_business_model,
        )

        self.register_tool(
            name="create_swot_analysis",
            description="Perform SWOT analysis",
            input_schema={
                "type": "object",
                "properties": {
                    "subject": {
                        "type": "string",
                        "description": "What to analyze",
                    },
                    "context": {
                        "type": "string",
                        "description": "Industry/market context",
                    },
                },
                "required": ["subject"],
            },
            handler=self._create_swot_analysis,
        )

        self.register_tool(
            name="calculate_unit_economics",
            description="Calculate unit economics metrics",
            input_schema={
                "type": "object",
                "properties": {
                    "average_revenue_per_user": {
                        "type": "number",
                        "description": "Monthly ARPU",
                    },
                    "average_lifespan_months": {
                        "type": "number",
                        "description": "Average customer lifespan in months",
                    },
                    "customer_acquisition_cost": {
                        "type": "number",
                        "description": "Cost to acquire one customer",
                    },
                    "gross_margin_percent": {
                        "type": "number",
                        "description": "Gross margin as percentage",
                    },
                },
                "required": ["average_revenue_per_user", "customer_acquisition_cost"],
            },
            handler=self._calculate_unit_economics,
        )

        self.register_tool(
            name="create_go_to_market",
            description="Design go-to-market strategy",
            input_schema={
                "type": "object",
                "properties": {
                    "product_name": {
                        "type": "string",
                        "description": "Product being launched",
                    },
                    "target_market": {
                        "type": "string",
                        "description": "Target market description",
                    },
                    "budget": {
                        "type": "string",
                        "description": "Available budget (optional)",
                    },
                },
                "required": ["product_name", "target_market"],
            },
            handler=self._create_go_to_market,
        )

        self.register_tool(
            name="log_strategic_decision",
            description="Log a major strategic decision to memory",
            input_schema={
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "Project identifier",
                    },
                    "decision_type": {
                        "type": "string",
                        "description": "Type of decision",
                    },
                    "decision": {
                        "type": "string",
                        "description": "The decision made",
                    },
                    "rationale": {
                        "type": "string",
                        "description": "Why this decision was made",
                    },
                    "alternatives_considered": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Other options that were considered",
                    },
                },
                "required": ["project_id", "decision_type", "decision", "rationale"],
            },
            handler=self._log_strategic_decision,
        )

    def _create_business_model(
        self,
        company_name: str,
        value_proposition: str,
        customer_segments: Optional[list[str]] = None,
    ) -> str:
        """Generate a Business Model Canvas.

        Args:
            company_name: Company or product name.
            value_proposition: Core value proposition.
            customer_segments: Target customer segments.

        Returns:
            Business Model Canvas markdown.
        """
        segments = customer_segments or ["To be defined"]

        return f"""# {company_name} Business Model Canvas

## Value Proposition
{value_proposition}

## Customer Segments
{chr(10).join(f'- {s}' for s in segments)}

## Channels
- [ ] Website / Landing page
- [ ] Content marketing / SEO
- [ ] Social media
- [ ] Paid advertising
- [ ] Partnerships / Referrals
- [ ] Direct sales

## Customer Relationships
- Self-service (scalable)
- Automated onboarding
- Community support
- Premium: dedicated support

## Revenue Streams
- [ ] Subscription (monthly/annual)
- [ ] Usage-based pricing
- [ ] Freemium with premium upsell
- [ ] One-time purchase
- [ ] Transaction fees

## Key Resources
- Technology / Platform
- Team expertise
- Customer data
- Brand reputation

## Key Activities
- Product development
- Customer acquisition
- Customer success
- Operations

## Key Partnerships
- Technology providers
- Distribution partners
- Integration partners

## Cost Structure
- [ ] Personnel (engineering, sales, support)
- [ ] Infrastructure (hosting, tools)
- [ ] Marketing / Customer acquisition
- [ ] Operations

## Key Metrics to Track
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn Rate
- Net Promoter Score (NPS)
"""

    def _create_swot_analysis(
        self,
        subject: str,
        context: Optional[str] = None,
    ) -> str:
        """Perform SWOT analysis.

        Args:
            subject: What to analyze.
            context: Industry context.

        Returns:
            SWOT analysis markdown.
        """
        context_line = f"\n*Context: {context}*\n" if context else ""

        return f"""# SWOT Analysis: {subject}
{context_line}
## Strengths (Internal, Positive)
*What advantages do you have?*

- [ ] Unique technology or IP
- [ ] Strong team expertise
- [ ] Established customer base
- [ ] Cost advantages
- [ ] Brand recognition

## Weaknesses (Internal, Negative)
*What could be improved?*

- [ ] Limited resources
- [ ] Lack of experience in X
- [ ] Dependency on key people
- [ ] Technical debt
- [ ] Weak brand awareness

## Opportunities (External, Positive)
*What trends could you exploit?*

- [ ] Growing market
- [ ] Competitor weakness
- [ ] Regulatory changes
- [ ] Technology shifts
- [ ] Partnership opportunities

## Threats (External, Negative)
*What obstacles do you face?*

- [ ] New competitors
- [ ] Market saturation
- [ ] Economic downturn
- [ ] Technology disruption
- [ ] Regulatory risk

## Strategic Implications

### SO Strategies (Strengths + Opportunities)
Use strengths to capture opportunities.

### WO Strategies (Weaknesses + Opportunities)
Address weaknesses to capture opportunities.

### ST Strategies (Strengths + Threats)
Use strengths to mitigate threats.

### WT Strategies (Weaknesses + Threats)
Minimize weaknesses and avoid threats.
"""

    def _calculate_unit_economics(
        self,
        average_revenue_per_user: float,
        customer_acquisition_cost: float,
        average_lifespan_months: float = 24,
        gross_margin_percent: float = 70,
    ) -> str:
        """Calculate unit economics.

        Args:
            average_revenue_per_user: Monthly ARPU.
            customer_acquisition_cost: CAC.
            average_lifespan_months: Customer lifespan.
            gross_margin_percent: Gross margin %.

        Returns:
            Unit economics analysis.
        """
        ltv = average_revenue_per_user * average_lifespan_months * (gross_margin_percent / 100)
        ltv_cac_ratio = ltv / customer_acquisition_cost if customer_acquisition_cost > 0 else 0
        payback_months = customer_acquisition_cost / (average_revenue_per_user * (gross_margin_percent / 100)) if average_revenue_per_user > 0 else 0
        monthly_churn = (1 / average_lifespan_months) * 100 if average_lifespan_months > 0 else 0

        health = "Healthy" if ltv_cac_ratio >= 3 else "Needs improvement" if ltv_cac_ratio >= 1 else "Unsustainable"

        return f"""# Unit Economics Analysis

## Input Assumptions
| Metric | Value |
|--------|-------|
| Monthly ARPU | ${average_revenue_per_user:.2f} |
| Customer Acquisition Cost (CAC) | ${customer_acquisition_cost:.2f} |
| Average Customer Lifespan | {average_lifespan_months:.0f} months |
| Gross Margin | {gross_margin_percent:.0f}% |

## Calculated Metrics

### Lifetime Value (LTV)
**${ltv:.2f}**

LTV = ARPU × Lifespan × Gross Margin
LTV = ${average_revenue_per_user:.2f} × {average_lifespan_months:.0f} × {gross_margin_percent/100:.2f} = ${ltv:.2f}

### LTV:CAC Ratio
**{ltv_cac_ratio:.1f}x** — {health}

- < 1x: Losing money on each customer
- 1-3x: Sustainable but room to improve
- 3x+: Healthy unit economics
- 5x+: May be under-investing in growth

### CAC Payback Period
**{payback_months:.1f} months**

Time to recover customer acquisition cost.
- < 12 months: Excellent
- 12-18 months: Good
- > 18 months: Consider reducing CAC

### Implied Monthly Churn
**{monthly_churn:.1f}%** (based on {average_lifespan_months:.0f} month lifespan)

## Recommendations

1. **To improve LTV:**
   - Increase ARPU through upsells/cross-sells
   - Reduce churn with better retention
   - Improve gross margin

2. **To reduce CAC:**
   - Optimize marketing channels
   - Improve conversion rates
   - Leverage referrals and word-of-mouth

3. **Target metrics:**
   - LTV:CAC > 3x
   - CAC Payback < 12 months
   - Monthly churn < 5%
"""

    def _create_go_to_market(
        self,
        product_name: str,
        target_market: str,
        budget: Optional[str] = None,
    ) -> str:
        """Design go-to-market strategy.

        Args:
            product_name: Product name.
            target_market: Target market.
            budget: Available budget.

        Returns:
            GTM strategy document.
        """
        budget_line = f"\n**Budget:** {budget}\n" if budget else ""

        return f"""# Go-to-Market Strategy: {product_name}

**Target Market:** {target_market}
{budget_line}

## Phase 1: Foundation (Weeks 1-4)

### Positioning
Define clear positioning statement:
"For [target customer] who [need], {product_name} is a [category] that [key benefit]. Unlike [alternatives], we [key differentiator]."

### Messaging
- **Headline:** [Value proposition in 10 words or less]
- **Supporting points:** 3 key benefits
- **Proof points:** Customer results, data, testimonials

### Pricing Strategy
- [ ] Value-based pricing
- [ ] Competitive pricing
- [ ] Freemium model
- [ ] Trial period

## Phase 2: Launch Prep (Weeks 5-8)

### Content & Assets
- [ ] Landing page
- [ ] Demo video (2 min)
- [ ] One-pager / Sales deck
- [ ] Case study template
- [ ] FAQ document

### Channel Strategy
| Channel | Priority | Action |
|---------|----------|--------|
| Product Hunt | High | Schedule launch |
| LinkedIn | High | Founder posts, ads |
| Content/SEO | Medium | 5 blog posts |
| Email | Medium | Launch sequence |
| Paid ads | Low | Test after organic |

## Phase 3: Launch (Weeks 9-12)

### Launch Week Activities
- Day 1: Product Hunt launch
- Day 1-3: Social media blitz
- Day 1-7: Founder outreach to network
- Day 7: Launch recap post
- Day 14: First metrics review

### KPIs to Track
- Website visitors
- Sign-ups / Trials
- Activation rate
- Trial-to-paid conversion
- CAC by channel

## Phase 4: Scale (Weeks 13+)

### Optimize
- Double down on winning channels
- Cut underperforming channels
- A/B test messaging
- Improve conversion funnel

### Expand
- New customer segments
- New use cases
- Partner channel
- International markets

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Low awareness | Heavy founder-led content |
| Poor conversion | Fast iteration on messaging |
| High CAC | Focus on organic/referral |
| Churn | Invest in onboarding |
"""

    def _log_strategic_decision(
        self,
        project_id: str,
        decision_type: str,
        decision: str,
        rationale: str,
        alternatives_considered: Optional[list[str]] = None,
    ) -> str:
        """Log a strategic decision to Supabase.

        Args:
            project_id: Project identifier.
            decision_type: Type of decision.
            decision: The decision made.
            rationale: Why this decision.
            alternatives_considered: Other options considered.

        Returns:
            Success message or error.
        """
        if not self._memory_client:
            return "Memory client not available - decision not logged"

        try:
            import json
            from uuid import uuid4

            data = {
                "id": str(uuid4()),
                "project_id": project_id,
                "decision_type": decision_type,
                "decision": decision,
                "rationale": rationale,
                "alternatives_considered": json.dumps(alternatives_considered or []),
            }

            self._memory_client.client.table("mba_strategic_decisions").insert(data).execute()
            return f"Strategic decision logged for {project_id}"

        except Exception as e:
            return f"Failed to log decision: {str(e)}"
