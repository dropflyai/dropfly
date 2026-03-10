# Contract Review and Negotiation Pattern

> A structured workflow for reviewing, analyzing, risk-assessing, and negotiating commercial contracts -- from initial intake through execution and post-signature management.

> **DISCLAIMER:** This pattern is for educational and informational purposes only. It does not constitute legal advice. Always consult qualified legal counsel for specific contract matters.

---

## Context

This pattern applies when you need to review any commercial contract -- vendor agreements, customer contracts, partnership agreements, licensing deals, or employment agreements. It provides a systematic approach that ensures no critical clause is overlooked and that risk is assessed consistently.

**Use this pattern for:**
- SaaS/software license agreements
- Vendor and service provider contracts
- Customer master service agreements (MSAs)
- Partnership and channel agreements
- Employment and contractor agreements
- Licensing and IP agreements

---

## Challenge

Contract review fails when it is ad-hoc: reviewers skip clauses, miss liability exposure, fail to identify non-standard terms, or negotiate without clear authority. This pattern ensures comprehensive coverage, consistent risk assessment, and structured negotiation.

---

## Phase 1: Intake and Triage (Day 1)

### 1.1 Contract Intake

Collect the following information before review begins:

| Field | Input |
|-------|-------|
| Contract type | MSA, SaaS, vendor, employment, NDA, licensing, other |
| Counterparty | Company name, jurisdiction of incorporation |
| Contract value | Total value over term, annual commitment |
| Term | Initial term, renewal provisions |
| Urgency | Requested execution date, business deadline |
| Business sponsor | Internal stakeholder requesting the contract |
| Existing relationship | New relationship or renewal/amendment |
| Template source | Our paper, their paper, negotiated |

### 1.2 Risk Triage

Classify the contract risk level immediately:

| Risk Level | Criteria | Review SLA |
|------------|----------|-----------|
| LOW | Value under $25K, standard terms, known counterparty | 3 business days |
| MEDIUM | Value $25K-$250K, some non-standard terms | 5 business days |
| HIGH | Value over $250K, material non-standard terms, new counterparty | 7-10 business days |
| CRITICAL | Unlimited liability, regulatory implications, IP assignment | Expedited senior review |

### 1.3 Authority Check

Before review, confirm:
- [ ] Who has signing authority for this contract value?
- [ ] Has the business case been approved?
- [ ] Are there budget approvals in place?
- [ ] Is procurement involved (for vendor contracts)?
- [ ] Are there related contracts that must be considered?

---

## Phase 2: Substantive Review (Days 2-5)

### 2.1 Clause-by-Clause Analysis

Review each section systematically. For every clause, assess:

| Assessment | Question |
|-----------|----------|
| Market standard? | Is this term typical for this contract type? |
| Risk exposure | What is the worst-case scenario under this clause? |
| Acceptable? | Can we accept as-is, or does it need modification? |
| Priority | Is this a deal-breaker, important, or minor? |

### 2.2 Critical Clauses Checklist

**Commercial Terms:**
- [ ] **Scope of services/deliverables** -- Is the scope clearly defined? Are deliverables measurable?
- [ ] **Pricing and payment** -- Are pricing terms clear? Payment schedule? Price escalation provisions?
- [ ] **Term and renewal** -- Auto-renewal? Notice period for non-renewal? Early termination rights?

**Risk Allocation:**
- [ ] **Indemnification** -- Who indemnifies whom? Scope of indemnification? Carve-outs?
- [ ] **Limitation of liability** -- Cap amount? Exclusions from cap? Consequential damages waiver?
- [ ] **Insurance requirements** -- Adequate coverage? Certificate of insurance required?
- [ ] **Warranties and representations** -- What warranties are made? Disclaimer of implied warranties?

**Intellectual Property:**
- [ ] **IP ownership** -- Who owns work product? Pre-existing IP protected?
- [ ] **License grants** -- Scope of license? Sublicensing rights? Territorial restrictions?
- [ ] **IP indemnification** -- Who bears risk of IP infringement claims?

**Data and Privacy:**
- [ ] **Data ownership** -- Who owns the data? Data portability rights?
- [ ] **Data protection** -- DPA required? GDPR/CCPA compliance? Data breach notification?
- [ ] **Confidentiality** -- Scope of confidential information? Duration? Permitted disclosures?

**Termination and Exit:**
- [ ] **Termination for cause** -- What constitutes cause? Cure period?
- [ ] **Termination for convenience** -- Available? Notice period? Termination fees?
- [ ] **Post-termination obligations** -- Data return/destruction? Transition assistance? Survival clauses?

**Dispute Resolution:**
- [ ] **Governing law** -- Which jurisdiction's law governs?
- [ ] **Dispute mechanism** -- Litigation, arbitration, or mediation? Venue?
- [ ] **Escalation process** -- Executive escalation before formal proceedings?

**Compliance:**
- [ ] **Assignment** -- Can either party assign without consent?
- [ ] **Force majeure** -- Scope of force majeure events? Notice requirements?
- [ ] **Compliance with laws** -- General compliance representation? Specific regulations?
- [ ] **Anti-corruption** -- FCPA/UK Bribery Act representations?

### 2.3 Risk Summary

After clause-by-clause review, create a risk summary:

| Issue # | Clause | Risk Level | Issue Description | Recommended Action |
|---------|--------|-----------|------------------|-------------------|
| 1 | | HIGH/MED/LOW | | Accept / Modify / Reject |
| 2 | | HIGH/MED/LOW | | Accept / Modify / Reject |
| 3 | | HIGH/MED/LOW | | Accept / Modify / Reject |

---

## Phase 3: Negotiation Strategy (Days 3-7)

### 3.1 Negotiation Priorities

Categorize all issues into three tiers:

| Tier | Definition | Approach |
|------|-----------|----------|
| Must-have | Deal-breakers; walk away if not resolved | Hold firm, explain business rationale |
| Important | Significant risk but negotiable | Propose alternative language, be willing to compromise |
| Nice-to-have | Improvements but not essential | Request but concede if needed for must-haves |

### 3.2 Redline Preparation

For each issue requiring modification:
- Draft proposed alternative language.
- Prepare a brief explanation of why the change is needed (business rationale, not legal posturing).
- Identify acceptable fallback positions.
- Note market-standard terms as evidence for your position.

### 3.3 Negotiation Principles

- **Lead with business rationale** -- "We need this because..." is more persuasive than "Our policy requires..."
- **Propose solutions, not just objections** -- For every rejection, offer alternative language.
- **Trade strategically** -- Concede nice-to-haves to win must-haves.
- **Document everything** -- Track all changes and who proposed them.
- **Know your BATNA** -- Best Alternative To a Negotiated Agreement. What happens if this deal does not close?
- **Set deadlines** -- Open-ended negotiations drag. Establish a timeline for resolution.

### 3.4 Escalation Path

If negotiation stalls:
1. Business sponsor-to-business sponsor discussion.
2. Executive-to-executive escalation.
3. Outside counsel consultation (for HIGH/CRITICAL issues).
4. Walk-away decision (if must-haves cannot be met).

---

## Phase 4: Execution and Close (Days 7-10)

### 4.1 Pre-Execution Checklist

- [ ] All negotiated changes reflected in the final document.
- [ ] All exhibits, schedules, and attachments are complete.
- [ ] Order of precedence clause checked (which document controls in case of conflict).
- [ ] Signature blocks are correct (entity name, authorized signatory).
- [ ] Effective date is correct.
- [ ] All referenced documents are attached or incorporated.
- [ ] Insurance certificates obtained (if required).
- [ ] Internal approvals documented.

### 4.2 Execution Process

1. Generate the final execution version (clean copy, no tracked changes).
2. Obtain internal signature from authorized signatory.
3. Deliver to counterparty for signature.
4. Confirm receipt of fully-executed copy from counterparty.
5. Distribute executed copies to business sponsor and file in contract management system.

### 4.3 Post-Execution Actions

- [ ] Calendar key dates (renewal, termination notice deadlines, milestone dates).
- [ ] Set up performance monitoring (SLAs, deliverables).
- [ ] Brief relevant teams on obligations (operations, finance, IT).
- [ ] File in contract management system with metadata (counterparty, value, term, key dates).
- [ ] Schedule mid-term review (for contracts over 12 months).

---

## Phase 5: Contract Lifecycle Management

### 5.1 Ongoing Monitoring

- Track counterparty performance against contract terms.
- Monitor compliance with regulatory obligations.
- Review contract 90 days before renewal/expiration.
- Document any amendments, change orders, or waivers.

### 5.2 Renewal/Termination Decision

At contract review date, assess:
- Has the counterparty performed as agreed?
- Have business needs changed since execution?
- Are there better alternatives in the market?
- Should terms be renegotiated?
- Should the contract be renewed, renegotiated, or terminated?

---

## Anti-Patterns

| Anti-Pattern | Consequence | Better Approach |
|-------------|-------------|-----------------|
| Signing without review | Unknown risk exposure | Every contract gets at least a triage review |
| Reviewing only "their paper" | Missing favorable terms in "our paper" | Review all contracts regardless of source |
| Over-negotiating immaterial terms | Delays deal, damages relationship | Focus on must-haves, concede nice-to-haves |
| No post-signature management | Missed deadlines, auto-renewals | Calendar all key dates at execution |
| Verbal amendments | Unenforceable modifications | All changes in writing, signed by authorized parties |
| Skipping authority verification | Unauthorized commitments | Verify signing authority before execution |

---

## References

- `Templates/contract_review_template.md` -- Review checklist
- `Templates/nda_template.md` -- NDA with annotations
- `02_contracts/` -- Contract law foundations
- `01_foundations/` -- Legal reasoning framework

---

*Pattern version: 1.0*
*Risk level: MEDIUM (pattern itself is educational; individual reviews may be HIGH/CRITICAL)*
*Brain: Legal Brain*
*Cross-brain dependencies: MBA Brain (business context), Engineering Brain (technical contract terms), Finance Brain (financial terms)*
