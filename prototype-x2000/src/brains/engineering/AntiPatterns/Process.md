# Process Anti-Patterns

## What This Prevents

Process anti-patterns are dysfunctions in how teams organize, communicate, plan, and
deliver software. Unlike code or architecture anti-patterns, process anti-patterns are
sociotechnical: they emerge from the interaction between human behavior, organizational
incentives, and engineering practice. Their effects are measured not in cyclomatic
complexity but in burnout rates, attrition, delivery predictability, and the slow erosion
of institutional knowledge.

This document catalogs six canonical process anti-patterns, drawing on three foundational
works: Brooks (1975) *The Mythical Man-Month*, DeMarco and Lister (1987) *Peopleware*,
and Forsgren, Humble, and Kim (2018) *Accelerate*, which introduced the DORA metrics
framework (deployment frequency, lead time for changes, mean time to restore, change
failure rate) as empirical measures of software delivery performance.

Each anti-pattern is analyzed through: description, root causes, detection signals,
measured harm (referencing DORA metrics where applicable), recovery path, and prevention
strategy.

---

## 1. Cowboy Coding

### Description

Cowboy coding is the absence of process: no code review, no branching strategy, no
testing requirements, no deployment gates. Engineers commit directly to the main branch,
deploy without verification, and debug in production. The term evokes the lone gunslinger
who needs no rules -- a romantic self-image that collapses at scale.

### Root Causes

- **Early-stage speed worship.** Startups and prototyping phases reward shipping speed
  above all else. Process is perceived as bureaucracy, not as a quality accelerator.
- **Founder-engineer culture.** When the original author of the codebase is still the
  primary contributor, they resist review because "I know this code better than anyone."
- **Absence of incidents.** Until a cowboy commit causes a production outage, the cost
  of the anti-pattern is invisible. The first incident is often catastrophic.

### Detection Signals

- No pull request or merge request process exists, or it exists on paper but is routinely
  bypassed.
- The main branch has direct commits from multiple engineers (no feature branches).
- There is no CI pipeline, or the pipeline exists but does not gate merges.
- Deployments happen from local machines rather than from a controlled CI/CD system.
- No post-deployment verification (smoke tests, canary analysis) is performed.
- DORA metric: change failure rate exceeds 30%.

### Measured Harm

- Forsgren et al. (2018) demonstrate that teams without peer review have 3-5x higher
  change failure rates than teams with mandatory review.
- Brooks (1975) observes that the cost of fixing a defect increases by an order of
  magnitude at each stage (design, implementation, testing, production). Cowboy coding
  defers all defect detection to production, the most expensive stage.
- DeMarco and Lister (1987) note that cowboy culture drives away methodical engineers,
  creating a selection bias toward risk-tolerant (and error-prone) team composition.

### Recovery Path

1. **Introduce trunk-based development with short-lived branches.** Require feature
   branches with a maximum lifetime of 48 hours.
2. **Mandate code review.** Every change requires at least one reviewer. Start with
   lightweight review (approve within 4 hours) to reduce friction.
3. **Implement CI gates.** No merge without green tests. Start with a minimal test
   suite and expand incrementally.
4. **Add post-deployment verification.** Smoke tests, health checks, and automated
   rollback on failure.

### Prevention Strategy

- Encode process in tooling: branch protection rules, required reviewers, CI pipelines
  that cannot be bypassed.
- Frame process as speed multiplier, not speed limiter: review catches defects before
  they reach production, where they are 10-100x more expensive to fix.

---

## 2. Cargo Cult Agile

### Description

Cargo cult agile adopts the ceremonies of agile (standups, sprints, retrospectives,
story points) without understanding or implementing the principles. Teams perform the
rituals -- they stand up every morning, they estimate in Fibonacci numbers, they have a
board with columns -- but they do not achieve the outcomes: they do not deliver working
software incrementally, they do not adapt based on feedback, and they do not empower
teams to self-organize.

The term derives from Feynman's "cargo cult science" analogy: Pacific island communities
built replica airstrips after World War II, hoping to attract cargo planes. They
reproduced the form perfectly but lacked the substance that made airstrips functional.

### Root Causes

- **Top-down mandate without education.** Management decrees "we are agile now" without
  investing in training, coaching, or organizational change.
- **Tool-driven adoption.** Teams adopt Jira or Azure DevOps and equate tool usage with
  agile practice.
- **Waterfall in disguise.** Requirements are still gathered upfront, scope is still
  fixed, deadlines are still immovable -- but the work is now divided into two-week
  increments called "sprints."
- **Metric gaming.** Velocity becomes a performance measure rather than a planning tool.
  Teams inflate estimates to show increasing velocity, destroying the metric's utility.

### Detection Signals

- Sprint scope changes less than 10% between planning and delivery (indicating that
  scope is fixed, not adaptive).
- Retrospective action items are not tracked or implemented. The same issues recur
  across multiple retrospectives.
- Standups exceed 15 minutes and devolve into status reports to a manager rather than
  peer coordination.
- Story points are used for performance evaluation, comparison between teams, or
  executive reporting.
- DORA metric: lead time for changes does not improve over six months despite "being
  agile."
- Working software is not demonstrated to stakeholders at the end of each sprint.

### Measured Harm

- Forsgren et al. (2018) found no correlation between adopting agile labels and improved
  delivery performance. Only the underlying practices (small batches, fast feedback,
  continuous delivery) correlate with DORA improvements.
- Cargo cult agile creates cynicism: engineers who experience agile-in-name-only
  conclude that agile itself is flawed, becoming resistant to genuine process improvement.
- Management loses the feedback signal that working agile provides, making decisions
  based on story points and velocity charts that do not reflect reality.

### Recovery Path

1. **Return to first principles.** Re-read the Agile Manifesto's four values and twelve
   principles. Evaluate current practice against principles, not ceremonies.
2. **Measure outcomes, not output.** Replace velocity tracking with DORA metrics:
   deployment frequency, lead time, MTTR, change failure rate.
3. **Empower teams.** Give teams authority over their process. Let them choose which
   ceremonies are valuable and which are waste.
4. **Hire an experienced coach.** An external agile coach with hands-on engineering
   experience can identify cargo cult patterns that insiders have normalized.

### Prevention Strategy

- Never mandate specific ceremonies. Mandate outcomes (e.g., "ship to production at
  least weekly") and let teams choose the process that achieves them.
- Track DORA metrics as the objective measure of delivery health.
- Require that retrospective action items have owners and deadlines.

---

## 3. Death March

### Description

Yourdon (2003, *Death March*) defines a death march project as one whose parameters
exceed reasonable norms by at least 50%: the schedule is half of what is needed, the
staff is half of what is required, the budget is insufficient, or the requirements are
at least twice what can be delivered. The team knows the project will fail but continues
because of political pressure, sunk cost fallacy, or contractual obligation.

### Root Causes

- **Planning fallacy.** Kahneman and Tversky's (1979) work on cognitive bias explains
  why estimates are systematically optimistic: humans anchor on best-case scenarios.
- **Management by deadline.** Dates are set by business commitments (trade shows,
  investor milestones, regulatory deadlines) and then treated as immovable, regardless
  of scope or staffing realities.
- **Sunk cost escalation.** After investing six months, stakeholders are reluctant to
  cancel or rescope, even when the evidence shows the project is undeliverable.
- **Adding people to a late project.** Brooks' Law (1975): "Adding manpower to a late
  software project makes it later," because new engineers require onboarding from
  existing engineers, reducing the productive capacity of the team.

### Detection Signals

- Sustained overtime exceeds two weeks. Any overtime beyond two consecutive weeks
  produces net negative productivity (Robinson, 2005, IGDA Quality of Life survey).
- Scope has not been reduced despite schedule slippage.
- Team members are visibly fatigued, disengaged, or have begun interviewing elsewhere.
- Status reports consistently show "on track" while the backlog grows and the deadline
  approaches -- a symptom of normalization of deviance (Vaughan, 1996).
- Defect rate is rising because tired engineers make more mistakes, but testing is
  being cut to "save time."

### Measured Harm

- DeMarco and Lister (1987) found that overtime beyond 40 hours per week for more than
  four weeks produces a net decrease in total output due to defect introduction, rework,
  and cognitive degradation.
- Attrition spikes 3-6 months after a death march ends, as burned-out engineers leave
  once the immediate crisis passes. Replacement cost per engineer: 50-200% of annual
  salary (SHRM, 2022).
- Technical debt accumulated during a death march often exceeds the value of the
  features delivered, creating a negative-value outcome.

### Recovery Path

1. **Acknowledge reality.** The first step is honest assessment: present stakeholders
   with the scope-schedule-quality triangle and force explicit tradeoff decisions.
2. **Cut scope aggressively.** Identify the minimum viable delivery and defer everything
   else. Use the MoSCoW method (Must, Should, Could, Won't) with ruthless honesty.
3. **Stop adding people.** Per Brooks' Law, stabilize the team. If additional help is
   needed, bring in people who can contribute independently (e.g., experienced
   contractors for well-defined, isolated tasks).
4. **Restore sustainable pace.** Mandate maximum 40-hour weeks. Short-term productivity
   may drop; medium-term productivity will recover and exceed the death march baseline.

### Prevention Strategy

- Require evidence-based estimation (reference class forecasting, historical velocity).
- Build schedule buffers explicitly: 20% minimum for known risks, 40% for novel work.
- Establish a "red flag" protocol: any team member can raise a concern about schedule
  feasibility without political consequences.

---

## 4. Hero Culture

### Description

Hero culture is an organizational pattern where critical work depends on one or two
individuals who consistently work extraordinary hours, possess irreplaceable knowledge,
and are celebrated for "saving" projects. The hero is simultaneously the team's greatest
asset and its greatest liability: a single point of failure disguised as a star performer.

### Root Causes

- **Reward misalignment.** Organizations reward firefighting (visible, dramatic) more
  than fire prevention (invisible, mundane). The engineer who prevents outages through
  careful design receives less recognition than the engineer who fixes them at 2 AM.
- **Knowledge hoarding (intentional or unintentional).** Heroes may gatekeep knowledge
  to maintain their indispensable status, or they may simply be too busy to document
  and share.
- **Understaffing rationalization.** Management observes that the hero "gets it done"
  and concludes that additional headcount is unnecessary.

### Detection Signals

- One or two engineers are involved in more than 60% of production incident resolutions.
- On-call escalations consistently route to the same person regardless of the rotation
  schedule.
- Knowledge silos exist: specific systems or domains can only be modified by one person.
- The team's velocity drops dramatically when the hero takes vacation.
- The hero's code review queue is a bottleneck because they are the only qualified
  reviewer for certain areas.

### Measured Harm

- Bus factor of 1 (see next section) is the quantitative expression of hero culture.
- Forsgren et al. (2018) found that high-performing teams distribute knowledge broadly;
  hero-dependent teams consistently cluster in the low-performance category.
- Hero burnout is inevitable. When the hero leaves (and they will), the team faces a
  knowledge cliff that can take 6-12 months to recover from.
- DeMarco and Lister (1987) identify hero culture as a symptom of organizational
  dysfunction that discourages teamwork and sustainable engineering practice.

### Recovery Path

1. **Pair programming and rotation.** Require that the hero pair with another engineer
   on all critical-path work. Rotate pairs weekly.
2. **Document tribal knowledge.** Dedicate sprint time to extracting the hero's
   undocumented knowledge into runbooks, architecture diagrams, and decision records.
3. **Distribute on-call.** Restructure on-call rotations so that the hero is not the
   default escalation. Invest in training other engineers to handle escalations.
4. **Reward prevention.** Change recognition criteria to celebrate reliability
   engineering, documentation, mentoring, and knowledge sharing -- not just heroic
   incident response.

### Prevention Strategy

- Track the "hero index": the percentage of critical-path work attributable to a single
  individual. Investigate when it exceeds 30%.
- Make knowledge sharing a promotion criterion.
- Require that no system has fewer than two qualified maintainers.

---

## 5. Bus Factor of One

### Description

The bus factor (also truck factor) is the minimum number of team members whose sudden
departure would render the project unable to proceed. A bus factor of one means that if
a single person leaves, is incapacitated, or simply takes vacation, critical work stops.
The metric was formalized by Zazworka et al. (2010) and is now a standard engineering
health indicator.

### Root Causes

- **Specialization without cross-training.** Deep expertise is valuable, but when it
  exists in only one person with no transfer mechanism, it becomes a liability.
- **Hero culture (see above).** The hero accumulates knowledge that no one else acquires.
- **Rapid growth.** Teams that scale quickly often assign new systems to new engineers
  one-to-one, creating single-owner silos.
- **Inadequate documentation.** When the only documentation is in someone's head, the
  bus factor for that knowledge is literally one.

### Detection Signals

- Git contribution analysis shows that more than 80% of commits to a critical module
  come from a single author.
- Code review requests for certain areas can only be assigned to one person.
- Sprint planning is constrained by one individual's availability.
- The team cannot answer basic operational questions (e.g., "How do we deploy X?" or
  "What are the credentials for Y?") when a specific person is absent.
- DORA metric: lead time for changes spikes when a specific team member is unavailable.

### Measured Harm

- Teams with a bus factor of one experience 2-4x longer recovery times from key-person
  departures compared to teams with a bus factor of three or higher.
- Recruitment pressure is extreme: the single expert must participate in every hiring
  loop to evaluate domain competence, consuming their already-scarce time.
- The team's throughput has an artificial ceiling: the single expert's capacity becomes
  the bottleneck regardless of total team size.

### Recovery Path

1. **Measure it.** Use tools like `git-fame`, `git-truck`, or custom scripts to
   calculate the bus factor per module.
2. **Cross-training sprints.** Dedicate 10-20% of sprint capacity to cross-training.
   Have the sole expert pair with a second engineer on every task in the silo area.
3. **Rotate ownership.** Every quarter, rotate primary ownership of each module. The
   former owner becomes the reviewer; the new owner becomes the primary contributor.
4. **Write operational runbooks.** For every critical system, create a runbook that
   enables any engineer to perform routine operations (deploy, rollback, debug).

### Prevention Strategy

- Set a minimum bus factor of two for all production systems. Track it as a team health
  metric alongside DORA metrics.
- Require pair programming or mob programming for all work on systems with a bus factor
  of one, until the bus factor reaches two.
- Include bus factor in quarterly engineering health reviews.

---

## 6. Documentation Debt

### Description

Documentation debt is the accumulation of undocumented or outdated documentation for
systems, processes, decisions, and tribal knowledge. Unlike code, which at least exists
in a repository, undocumented knowledge exists only in human memory -- and memory is
volatile, biased, and non-transferable. Documentation debt is the silent partner of
every other process anti-pattern: it enables hero culture, amplifies bus factor risk,
and makes cowboy coding the only viable approach when the "right" approach is unknown.

### Root Causes

- **Documentation is not valued.** It is not measured, not rewarded, and not required.
  Engineers who write documentation are perceived as "not shipping."
- **False economy.** Management calculates that documentation time could be spent
  coding, without accounting for the downstream cost of undocumented systems.
- **Tooling friction.** If documentation requires a separate tool, a different workflow,
  or a different format than code, engineers will not write it.
- **Rapid change.** In fast-moving codebases, documentation becomes outdated quickly,
  creating a vicious cycle: engineers stop writing documentation because it is always
  stale, and it is always stale because no one maintains it.

### Detection Signals

- New engineers require more than two weeks to make their first meaningful contribution
  (onboarding friction).
- Engineers frequently ask the same questions in Slack or chat, indicating that answers
  are not discoverable.
- Architecture Decision Records (ADRs) do not exist, or the most recent one is older
  than six months.
- README files contain setup instructions that no longer work.
- Operational runbooks do not exist for production systems.
- The phrase "ask [person's name]" is the standard answer to "how does X work?"

### Measured Harm

- Onboarding cost scales linearly with documentation debt: each undocumented system
  adds days to new-engineer ramp-up.
- Incident resolution time (MTTR) increases because engineers must reverse-engineer
  system behavior during outages instead of consulting runbooks.
- Forsgren et al. (2018) identify "easy-to-understand and up-to-date documentation"
  as a statistically significant predictor of delivery performance. Teams with good
  documentation have 2x higher deployment frequency and 2.4x lower change failure rate.
- Decision amnesia: without ADRs, teams revisit and re-debate the same decisions every
  6-12 months, wasting senior engineering time.

### Recovery Path

1. **Adopt docs-as-code.** Store documentation in the same repository as the code it
   describes, in the same format (Markdown), reviewed by the same process (pull
   requests). This eliminates tooling friction and keeps documentation close to its
   subject.
2. **Require documentation in the definition of done.** No feature is complete until its
   documentation (user-facing and developer-facing) is updated.
3. **Automate what you can.** API documentation can be generated from code (OpenAPI,
   GraphQL introspection). Architecture diagrams can be generated from dependency graphs.
   Prefer generated documentation over manually maintained documentation where possible.
4. **Documentation sprints.** Dedicate one sprint per quarter to documentation debt
   reduction, focusing on the highest-impact gaps (onboarding guides, operational
   runbooks, ADRs for recent decisions).

### Prevention Strategy

- Include documentation quality in code review checklists.
- Track documentation coverage: percentage of production systems with up-to-date
  operational runbooks.
- Recognize and reward documentation contributions equally with code contributions.
- Make ADRs mandatory for any decision that affects system architecture, data model, or
  third-party dependencies.

---

## Practical Implications

Process anti-patterns are the most expensive category because they multiply the cost of
every other anti-pattern. A death march makes architectural decay inevitable. Cowboy
coding makes code quality anti-patterns undetectable. Hero culture makes tooling
anti-patterns irrelevant (the hero knows the workarounds). Documentation debt ensures
that all of this knowledge is lost when the hero burns out and leaves.

The DORA metrics framework provides objective measurement. Teams exhibiting process
anti-patterns will consistently show:
- Deployment frequency below once per week
- Lead time for changes exceeding one month
- Mean time to restore exceeding one day
- Change failure rate exceeding 30%

The engineering evaluation rubric (see `../eval/`) scores process health on a 1-10 scale.
Scores of 8+ require sustained DORA elite-tier performance. Scores below 4 indicate the
presence of three or more process anti-patterns without active remediation.

---

## Further Reading

- Brooks, F. P. (1975). *The Mythical Man-Month*. Addison-Wesley.
- DeMarco, T., & Lister, T. (1987). *Peopleware: Productive Projects and Teams*. Dorset House.
- Forsgren, N., Humble, J., & Kim, G. (2018). *Accelerate: The Science of Lean Software and DevOps*. IT Revolution.
- Yourdon, E. (2003). *Death March*, 2nd ed. Prentice Hall.
- Beck, K., et al. (2001). "Manifesto for Agile Software Development." agilemanifesto.org.
- Kahneman, D., & Tversky, A. (1979). "Prospect Theory." *Econometrica*, 47(2).
- Vaughan, D. (1996). *The Challenger Launch Decision*. University of Chicago Press.
- Robinson, E. (2005). "Why Crunch Mode Doesn't Work." IGDA Quality of Life White Paper.
- Zazworka, N., et al. (2010). "Investigating the Truck Factor of Software Projects." *CHASE 2010*.
- Kim, G., et al. (2016). *The DevOps Handbook*. IT Revolution.
