# IP Protection Pattern

> A structured pattern for identifying, securing, and defending intellectual property assets -- covering trade secrets, copyrights, trademarks, patents, and software-specific IP strategy.

> **DISCLAIMER:** This pattern is for educational and informational purposes only. It does not constitute legal advice. IP law varies significantly by jurisdiction. Always consult qualified IP counsel for specific matters.

---

## Context

This pattern applies when you need to develop or strengthen an intellectual property protection strategy. It covers the full spectrum of IP types relevant to technology and software companies, with emphasis on practical protection mechanisms.

**Use this pattern for:**
- Startups establishing initial IP protection
- Companies conducting an IP audit
- Pre-funding or pre-acquisition IP review
- New product launches requiring IP clearance
- Employee onboarding IP protocols
- Open source compliance strategy
- IP dispute preparation

---

## Challenge

IP protection fails when companies treat it as an afterthought: trade secrets leak through poor employee practices, copyrights go unregistered, trademarks go unmonitored, and patent opportunities expire before filing. The cost of reactive IP protection is 10-100x the cost of proactive protection. This pattern ensures systematic coverage.

---

## Phase 1: IP Audit and Inventory (Weeks 1-3)

### 1.1 IP Asset Identification

Catalog all IP assets across four categories:

**Trade Secrets:**

| Asset Type | Examples | Current Protection |
|-----------|---------|-------------------|
| Algorithms and methods | Recommendation engines, scoring models, proprietary processes | |
| Source code | Core codebase, proprietary libraries, custom tools | |
| Business data | Customer lists, pricing models, supplier terms | |
| Know-how | Processes, configurations, operational playbooks | |

**Copyrights:**

| Asset Type | Examples | Registration Status |
|-----------|---------|-------------------|
| Software code | Application code, scripts, configuration files | |
| Content | Blog posts, documentation, marketing materials, training | |
| Design assets | UI designs, icons, illustrations, brand materials | |
| Databases | Original compilations, curated datasets | |

**Trademarks:**

| Asset Type | Examples | Registration Status |
|-----------|---------|-------------------|
| Word marks | Company name, product names, feature names | |
| Logos | Company logo, product logos, app icons | |
| Slogans | Taglines, campaign phrases | |
| Trade dress | Distinctive product appearance, packaging | |

**Patents (if applicable):**

| Asset Type | Examples | Filing Status |
|-----------|---------|--------------|
| Utility patents | Novel methods, systems, processes | |
| Design patents | Ornamental designs, UI elements | |
| Provisional filings | Early-stage inventions, placeholder protection | |

### 1.2 IP Ownership Verification

For every IP asset, verify clean ownership:

| Check | Question | Risk if No |
|-------|----------|-----------|
| Employee assignment | Do all employees have signed IP assignment agreements? | Employee may claim ownership of work product |
| Contractor assignment | Do all contractor agreements include IP assignment (not just license)? | Contractor retains ownership of deliverables |
| Prior employer clearance | Did founders/key employees have IP restrictions from prior employers? | Prior employer may claim ownership |
| Joint development | Was any IP co-developed with a third party? | Joint ownership creates complications |
| Open source contamination | Does any proprietary code incorporate open source under copyleft licenses? | May trigger open source disclosure obligations |
| University/government funding | Was any IP developed with university or government funding? | May create march-in rights or ownership claims |

### 1.3 IP Risk Assessment

| Risk Category | Risk Level | Description |
|--------------|-----------|-------------|
| Ownership gaps | HIGH/MED/LOW | IP assets without clear ownership documentation |
| Trade secret leakage | HIGH/MED/LOW | Inadequate confidentiality measures |
| Trademark exposure | HIGH/MED/LOW | Unregistered or unmonitored marks |
| Open source compliance | HIGH/MED/LOW | Copyleft contamination risk |
| Third-party infringement risk | HIGH/MED/LOW | Risk that our IP infringes others |
| Competitive copying risk | HIGH/MED/LOW | Risk that others copy our unprotected IP |

---

## Phase 2: Protection Strategy (Weeks 3-6)

### 2.1 Trade Secret Protection

Trade secrets are protected by maintaining secrecy, not by registration. Protection requires affirmative measures:

**Technical controls:**
- [ ] Access controls (role-based, need-to-know)
- [ ] Encryption at rest and in transit
- [ ] Code repository access restrictions
- [ ] Database access logging and monitoring
- [ ] Source code obfuscation for distributed software
- [ ] Secure development environments (no code on personal devices)

**Administrative controls:**
- [ ] Confidentiality agreements (all employees, contractors, partners)
- [ ] Trade secret identification and marking program
- [ ] Employee training on trade secret obligations
- [ ] Exit interview process with trade secret reminder
- [ ] Visitor access procedures
- [ ] Document retention and destruction policies

**Contractual controls:**
- [ ] NDAs before any disclosure to third parties
- [ ] Non-compete agreements (where enforceable)
- [ ] Non-solicitation agreements
- [ ] Customer and vendor confidentiality provisions
- [ ] Partner and integration confidentiality provisions

### 2.2 Copyright Protection

**Registration strategy (US):**
- Register all commercially significant software within 3 months of publication (preserves statutory damages).
- Register major content assets (white papers, reports, courses).
- Register architectural works, compilations, and databases where original.

**Notice and marking:**
- Include copyright notice on all published works.
- Format: Copyright [Year] [Owner]. All rights reserved.
- Include in source code headers, website footers, documentation.

**Licensing:**
- Define clear licensing terms for all software and content.
- Choose appropriate open source licenses for publicly released code.
- Maintain a license inventory for all third-party code incorporated.

### 2.3 Trademark Protection

**Clearance before use:**
1. Conduct a preliminary search (USPTO TESS, state databases, domain names).
2. Conduct a comprehensive search (common law, international) for critical marks.
3. Assess the risk of confusion with existing marks.
4. Obtain a clearance opinion from trademark counsel for primary marks.

**Registration strategy:**
- File federal trademark applications for core brand names and logos.
- Consider international filing (Madrid Protocol) for marks used globally.
- File intent-to-use applications for planned future marks.
- Register domain names corresponding to all trademarks.

**Ongoing monitoring:**
- Set up trademark watch services for registered marks.
- Monitor app stores, domain registrations, and social media for infringement.
- Monitor competitor branding for potential conflicts.
- Establish a process for responding to infringement.

### 2.4 Patent Strategy (If Applicable)

**Patent decision framework:**

| Factor | Favors Patent | Disfavors Patent |
|--------|-------------|-----------------|
| Inventiveness | Truly novel method or system | Incremental improvement |
| Competitive advantage | Blocks competitors for 20 years | Trade secret offers better protection |
| Disclosure trade-off | Comfortable disclosing the method | Method is better kept secret |
| Enforcement cost | Can afford to enforce ($300K-$3M per suit) | Budget constraints |
| Revenue potential | Licensing opportunity | Defensive use only |
| Speed to market | Long lead time allows patent prosecution | First-mover advantage more important |

**Provisional patent applications:**
- Low cost ($1,500-$5,000) placeholder for novel inventions.
- Provides 12-month priority date.
- Use for inventions with commercial potential while assessing full patent value.
- Must file non-provisional within 12 months or lose priority.

---

## Phase 3: Open Source Compliance (Ongoing)

### 3.1 Open Source Policy

| License Category | Risk Level | Action Required |
|-----------------|-----------|-----------------|
| Permissive (MIT, BSD, Apache 2.0) | LOW | Attribution required, include license text |
| Weak copyleft (LGPL, MPL) | MEDIUM | Modifications to library must be disclosed; application code protected if properly linked |
| Strong copyleft (GPL, AGPL) | HIGH | Incorporating GPL code may require disclosing your source code |
| Network copyleft (AGPL) | CRITICAL | Even server-side use triggers disclosure obligations |
| Proprietary | VARIES | Must comply with specific license terms |

### 3.2 Open Source Compliance Process

1. **Discovery:** Maintain an inventory of all open source components (use SCA tools like Snyk, FOSSA, or Black Duck).
2. **Review:** Assess license compatibility before incorporating any new open source.
3. **Approval:** Require legal sign-off for MEDIUM and above risk licenses.
4. **Attribution:** Maintain a NOTICES file with all required attributions.
5. **Monitoring:** Scan regularly for new open source introductions and license changes.

---

## Phase 4: Employee and Contractor IP Protocols

### 4.1 Employee IP Framework

**At hiring:**
- [ ] Signed invention assignment agreement (present assignment, not promise to assign)
- [ ] Signed confidentiality agreement
- [ ] Prior invention disclosure form (employee lists pre-existing IP)
- [ ] Prior employer obligation review (non-compete, IP restrictions)
- [ ] IP policies training acknowledgment

**During employment:**
- [ ] Invention disclosure process (how to report new inventions)
- [ ] Code of conduct regarding confidential information
- [ ] Periodic training on IP obligations
- [ ] Clean room procedures when necessary (working near competitor IP)

**At departure:**
- [ ] Exit interview with IP obligations reminder
- [ ] Return of all company property and information
- [ ] Acknowledgment of continuing confidentiality obligations
- [ ] Access revocation across all systems
- [ ] Post-employment restriction reminder (non-compete, non-solicit if applicable)

### 4.2 Contractor IP Framework

**Critical contract provisions:**
- Work-for-hire clause (where applicable under copyright law).
- Express assignment of all IP created during engagement.
- Representation that work is original and does not infringe third-party IP.
- Pre-existing IP carve-out (contractor retains their existing tools/libraries).
- Confidentiality obligations.
- Return of materials at termination.

---

## Phase 5: IP Enforcement and Defense (As Needed)

### 5.1 Infringement Detection

- Monitor trademark watch services for mark conflicts.
- Conduct periodic web searches for unauthorized use of content.
- Use code scanning tools to detect unauthorized distribution of proprietary software.
- Monitor competitor products for potential patent or trade secret misappropriation.
- Review app stores and marketplaces for lookalike products.

### 5.2 Enforcement Escalation

| Step | Action | When |
|------|--------|------|
| 1 | Document the infringement (screenshots, downloads, timestamps) | Immediately upon detection |
| 2 | Assess materiality and risk | Within 48 hours |
| 3 | Cease and desist letter | For clear infringements worth protecting |
| 4 | DMCA takedown or platform complaint | For online infringements |
| 5 | Formal demand with counsel | For material infringements after C&D fails |
| 6 | Litigation | Last resort for significant damage (consult counsel) |

### 5.3 Defensive Measures

- Maintain records of IP creation dates and development history.
- Preserve evidence of prior art if patent claims are made against you.
- Consider defensive patent pledges or cross-licensing arrangements.
- Maintain IP insurance for litigation costs (E&O or IP-specific policies).

---

## Anti-Patterns

| Anti-Pattern | Consequence | Better Approach |
|-------------|-------------|-----------------|
| No IP assignment agreements | Employees/contractors may own the IP | Assignment agreements before any work starts |
| Ignoring open source licenses | Copyleft contamination of proprietary code | SCA scanning, license review process |
| Treating IP as only a legal problem | Misses technical and operational controls | Cross-functional IP program |
| Filing patents for everything | Expensive and discloses methods | Strategic filing, use trade secret where appropriate |
| Not monitoring trademarks | Lose ability to enforce through acquiescence | Active monitoring and enforcement |
| Verbal NDAs | Unenforceable, no evidence | Written agreements before disclosure |

---

## References

- `Templates/nda_template.md` -- NDA with annotations
- `Templates/contract_review_template.md` -- Reviewing IP-related contracts
- `03_intellectual_property/` -- IP law foundations
- `02_contracts/` -- Contract drafting for IP provisions

---

*Pattern version: 1.0*
*Risk level: MEDIUM to HIGH (IP matters frequently require qualified counsel)*
*Brain: Legal Brain*
*Cross-brain dependencies: Engineering Brain (technical controls, SCA tools), Security Brain (access controls), HR Brain (employee agreements)*
