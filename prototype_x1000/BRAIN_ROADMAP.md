# BRAIN ROADMAP — Build Order & Specifications

This document defines all specialist brains to be built and their priority order.

---

## Current Status

| Brain | Status | Location |
|-------|--------|----------|
| Engineering Brain | ✅ COMPLETE | `/prototype_x1000/engineering_brain/` |
| Design Brain | ✅ COMPLETE | `/prototype_x1000/design_brain/` |
| Options Trading Brain | 🔨 IN PROGRESS | `/prototype_x1000/options_trading_brain/` |
| CEO Brain | 📋 PLACEHOLDER | `/prototype_x1000/ceo_brain/` |

**Total Brains: 37** (2 complete, 1 in progress, 34 placeholder)

---

## Build Order (Priority)

### Phase 1: Foundation (Current)
*Core brains needed for building any product*

| # | Brain | Priority | Why First |
|---|-------|----------|-----------|
| 1 | Engineering Brain | ✅ Done | Builds everything |
| 2 | Design Brain | ✅ Done | Designs everything |
| 3 | Product Brain | 🔴 HIGH | Defines what to build |
| 4 | Data Brain | 🔴 HIGH | Analytics, ML, decisions |

### Phase 2: Growth Engine
*Brains needed to acquire and retain customers*

| # | Brain | Priority | Why |
|---|-------|----------|-----|
| 5 | Marketing Brain | 🔴 HIGH | Acquisition |
| 6 | Sales Brain | 🔴 HIGH | Revenue |
| 7 | Content Brain | 🟡 MEDIUM | Feeds marketing |
| 8 | Growth Brain | 🟡 MEDIUM | Viral loops, PLG |
| 9 | Customer Success Brain | 🟡 MEDIUM | Retention |

### Phase 3: Business Operations
*Brains needed to run the business*

| # | Brain | Priority | Why |
|---|-------|----------|-----|
| 10 | MBA Brain | 🟡 MEDIUM | Strategy |
| 11 | Finance Brain | 🟡 MEDIUM | Money management |
| 12 | Legal Brain | 🟡 MEDIUM | Protection |
| 13 | Operations Brain | 🟡 MEDIUM | Efficiency |
| 14 | HR Brain | 🟡 MEDIUM | Team building |

### Phase 4: Technical Specialists
*Deep expertise brains*

| # | Brain | Priority | Why |
|---|-------|----------|-----|
| 15 | Security Brain | 🟡 MEDIUM | Cybersecurity |
| 16 | Cloud Brain | 🟡 MEDIUM | Infrastructure |
| 17 | Mobile Brain | 🟡 MEDIUM | iOS/Android |
| 18 | QA Brain | 🟡 MEDIUM | Quality |
| 19 | AI Brain | 🟡 MEDIUM | LLMs, ML, AI strategy |
| 20 | Automation Brain | 🟡 MEDIUM | n8n, Zapier, workflows |
| 21 | Analytics Brain | 🟡 MEDIUM | Metrics, dashboards |
| 22 | DevRel Brain | 🟢 LOW | Developer community |

### Phase 5: Domain Specialists
*Industry/domain specific brains*

| # | Brain | Priority | Why |
|---|-------|----------|-----|
| 23 | Game Design Brain | 🟢 LOW | Games only |
| 24 | Localization Brain | 🟢 LOW | International |
| 25 | Partnership Brain | 🟢 LOW | BD |
| 26 | Research Brain | 🟢 LOW | Market intel |
| 27 | Options Trading Brain | 🔨 Building | Trading systems |

### Phase 6: Marketing Channels
*Specialized channel brains*

| # | Brain | Priority | Why |
|---|-------|----------|-----|
| 28 | Branding Brain | 🟡 MEDIUM | Brand identity |
| 29 | Email Brain | 🟡 MEDIUM | Email marketing |
| 30 | Social Media Brain | 🟡 MEDIUM | Social platforms |
| 31 | Video Brain | 🟡 MEDIUM | Video content |
| 32 | Community Brain | 🟡 MEDIUM | Community building |

### Phase 7: Business Operations
*Additional business brains*

| # | Brain | Priority | Why |
|---|-------|----------|-----|
| 33 | Support Brain | 🟡 MEDIUM | Customer support |
| 34 | Investor Brain | 🟡 MEDIUM | Fundraising, IR |
| 35 | Pricing Brain | 🟡 MEDIUM | Pricing strategy |
| 36 | Innovation Brain | 🟢 LOW | R&D, new ventures |

### Phase 8: Orchestration
*The master brain*

| # | Brain | Priority | Why |
|---|-------|----------|-----|
| 37 | CEO Brain | 🔴 HIGH | Orchestrates all |

---

## Brain Specification Template

Each brain MUST have:

```
brain_name/
├── CLAUDE.md              # Self-governing instructions
├── README.md              # Overview and quick start
├── Constitution.md        # Core laws (optional, for complex brains)
├── Patterns/              # Domain patterns
├── Recipes/               # How-to guides
├── Memory/                # Learning system
│   ├── ExperienceLog.md
│   ├── Patterns.md
│   └── Failures.md
└── [domain-specific]/     # Unique to each brain
```

---

## Brain Specifications

### Product Brain
```
Specialty: Product strategy, roadmapping, prioritization
Key Files:
- ProductStrategy.md
- Roadmapping.md
- Prioritization.md (RICE, ICE, etc.)
- PRDTemplate.md
- UserStoryTemplate.md
- FeatureSpecTemplate.md
Calls: Design, Engineering, Data, Research
```

### Marketing Brain
```
Specialty: Growth, acquisition, retention, brand positioning
Key Files:
- GrowthStrategy.md
- AcquisitionChannels.md
- RetentionPlaybook.md
- BrandPositioning.md
- CampaignTemplates.md
- MetricsAndKPIs.md
Calls: Content, Design, Data, Sales
```

### Sales Brain
```
Specialty: Sales process, objection handling, closing
Key Files:
- SalesProcess.md
- ObjectionHandling.md
- ClosingTechniques.md
- PricingStrategy.md
- ProposalTemplates.md
- CRMWorkflows.md
Calls: Marketing, Product, Legal, Customer Success
```

### MBA Brain
```
Specialty: Business strategy, finance, operations, scaling
Key Files:
- BusinessStrategy.md
- CompetitiveAnalysis.md
- FinancialModeling.md
- ScalingPlaybook.md
- BoardDecks.md
- InvestorRelations.md
Calls: Finance, Legal, Product, Marketing
```

### Finance Brain
```
Specialty: Accounting, budgeting, financial modeling, fundraising
Key Files:
- Accounting.md
- Budgeting.md
- FinancialModeling.md
- FundraisingPlaybook.md
- UnitEconomics.md
- CashFlowManagement.md
Calls: MBA, Legal, Operations
```

### Legal Brain
```
Specialty: Contracts, compliance, IP protection
Key Files:
- ContractTemplates.md
- Compliance.md
- IPProtection.md
- PrivacyPolicy.md
- TermsOfService.md
- EmploymentLaw.md
Calls: HR, Finance, MBA
```

### Data Brain
```
Specialty: Analytics, ML/AI, data pipelines
Key Files:
- AnalyticsStrategy.md
- DataPipelines.md
- MLPatterns.md
- ExperimentFramework.md
- DashboardDesign.md
- DataGovernance.md
Calls: Engineering, Product, Marketing
```

### Security Brain
```
Specialty: Cybersecurity, compliance, risk management
Key Files:
- SecurityFramework.md
- ThreatModeling.md
- PenTestingGuide.md
- ComplianceFrameworks.md (SOC2, GDPR, etc.)
- IncidentResponse.md
- SecurityAudits.md
Calls: Engineering, Legal, Cloud
```

### Content Brain
```
Specialty: Copywriting, content strategy, SEO, storytelling
Key Files:
- ContentStrategy.md
- Copywriting.md
- SEOPlaybook.md
- StorytellingFramework.md
- ContentCalendar.md
- StyleGuide.md
Calls: Marketing, Design, Product
```

### Growth Brain
```
Specialty: Growth hacking, viral loops, referrals, PLG
Key Files:
- GrowthFramework.md
- ViralLoops.md
- ReferralPrograms.md
- PLGPlaybook.md
- ExperimentVelocity.md
- GrowthMetrics.md
Calls: Marketing, Product, Data, Engineering
```

### Customer Success Brain
```
Specialty: Onboarding, retention, support, churn prevention
Key Files:
- OnboardingPlaybook.md
- RetentionStrategies.md
- SupportWorkflows.md
- ChurnPrevention.md
- CustomerHealth.md
- SuccessMetrics.md
Calls: Product, Sales, Data
```

### HR Brain
```
Specialty: Hiring, culture, team building
Key Files:
- HiringPlaybook.md
- InterviewFramework.md
- CultureBuilding.md
- PerformanceManagement.md
- CompensationStrategy.md
- RemoteWorkPolicy.md
Calls: Legal, Finance, MBA
```

### Operations Brain
```
Specialty: Supply chain, logistics, process optimization
Key Files:
- ProcessOptimization.md
- SupplyChain.md
- VendorManagement.md
- QualityControl.md
- SOPTemplates.md
- OperationalMetrics.md
Calls: Finance, Engineering, Legal
```

### Cloud Brain
```
Specialty: AWS, GCP, Azure, serverless, infrastructure
Key Files:
- CloudArchitecture.md
- AWSPatterns.md
- GCPPatterns.md
- AzurePatterns.md
- ServerlessGuide.md
- CostOptimization.md
- DisasterRecovery.md
Calls: Engineering, Security, Data
```

### Mobile Brain
```
Specialty: iOS, Android, React Native, mobile-first
Key Files:
- MobileArchitecture.md
- iOSPatterns.md
- AndroidPatterns.md
- ReactNativeGuide.md
- AppStoreOptimization.md
- MobileUXPatterns.md
Calls: Engineering, Design, QA
```

### QA Brain
```
Specialty: Testing strategies, automation, quality gates
Key Files:
- TestStrategy.md
- AutomationFramework.md
- QualityGates.md
- RegressionTesting.md
- PerformanceTesting.md
- AccessibilityTesting.md
Calls: Engineering, Product, Design
```

### DevRel Brain
```
Specialty: Developer relations, documentation, community
Key Files:
- DevRelStrategy.md
- DocumentationGuide.md
- CommunityBuilding.md
- DeveloperExperience.md
- APIDocumentation.md
- TechnicalContent.md
Calls: Engineering, Content, Marketing
```

### Game Design Brain
```
Specialty: Game mechanics, level design, player psychology
Key Files:
- GameMechanics.md
- LevelDesign.md
- PlayerPsychology.md
- MonetizationPatterns.md
- BalancingGuide.md
- PlaytestingFramework.md
Calls: Design, Engineering, Data
```

### Localization Brain
```
Specialty: i18n, l10n, regional adaptation, translation
Key Files:
- LocalizationStrategy.md
- i18nPatterns.md
- TranslationWorkflow.md
- RegionalAdaptation.md
- CulturalConsiderations.md
- RTLSupport.md
Calls: Design, Content, Engineering
```

### Partnership Brain
```
Specialty: Business development, alliances, integrations
Key Files:
- PartnershipStrategy.md
- BDPlaybook.md
- IntegrationPatterns.md
- PartnerOnboarding.md
- RevenueSharing.md
- APIPartnership.md
Calls: Sales, Legal, Engineering, Product
```

### Research Brain
```
Specialty: Market research, competitor analysis, trends
Key Files:
- ResearchMethodology.md
- CompetitorAnalysis.md
- MarketSizing.md
- TrendAnalysis.md
- UserResearch.md
- DataSources.md
Calls: Product, Marketing, MBA
```

### CEO Brain (Orchestrator)
```
Specialty: Orchestrates all brains to build businesses
Key Files:
- OrchestrationRules.md
- TaskDecomposition.md
- BrainDelegation.md
- ConflictResolution.md
- QualityAssurance.md
- BusinessTemplates.md
Calls: ALL BRAINS
```

### AI Brain
```
Specialty: LLMs, ML models, AI strategy, prompting
Key Files:
- AIStrategy.md
- PromptEngineering.md
- ModelSelection.md
- RAGPatterns.md
- AgentArchitecture.md
- FineTuning.md
Calls: Engineering, Data, Product
```

### Automation Brain
```
Specialty: Workflow automation, n8n, Zapier, integrations
Key Files:
- AutomationStrategy.md
- WorkflowPatterns.md
- n8nRecipes.md
- IntegrationHub.md
- TriggerDesign.md
- ErrorHandling.md
Calls: Engineering, Data, Operations
```

### Analytics Brain
```
Specialty: Metrics, dashboards, reporting, insights
Key Files:
- AnalyticsFramework.md
- DashboardDesign.md
- MetricDefinitions.md
- ReportingWorkflows.md
- InsightGeneration.md
- DataVisualization.md
Calls: Data, Product, Marketing
```

### Branding Brain
```
Specialty: Brand identity, visual systems, brand voice
Key Files:
- BrandStrategy.md
- VisualIdentity.md
- BrandGuidelines.md
- VoiceAndTone.md
- BrandAssets.md
- BrandEvolution.md
Calls: Design, Marketing, Content
```

### Email Brain
```
Specialty: Email marketing, drip campaigns, deliverability
Key Files:
- EmailStrategy.md
- CampaignDesign.md
- DripSequences.md
- Deliverability.md
- Segmentation.md
- ABTesting.md
Calls: Marketing, Content, Data
```

### Social Media Brain
```
Specialty: Social platforms, content calendar, engagement
Key Files:
- SocialStrategy.md
- PlatformPlaybooks.md
- ContentCalendar.md
- EngagementTactics.md
- InfluencerRelations.md
- SocialAnalytics.md
Calls: Marketing, Content, Design
```

### Video Brain
```
Specialty: Video content, production, distribution
Key Files:
- VideoStrategy.md
- ProductionWorkflow.md
- EditingGuidelines.md
- DistributionChannels.md
- ThumbnailDesign.md
- YouTubeOptimization.md
Calls: Content, Marketing, Design
```

### Community Brain
```
Specialty: Community building, moderation, engagement
Key Files:
- CommunityStrategy.md
- ModerationGuidelines.md
- EngagementPrograms.md
- AmbassadorProgram.md
- EventPlanning.md
- CommunityMetrics.md
Calls: Marketing, Support, Content
```

### Support Brain
```
Specialty: Customer support, ticketing, knowledge base
Key Files:
- SupportStrategy.md
- TicketingWorkflows.md
- KnowledgeBase.md
- EscalationPaths.md
- MacroLibrary.md
- SupportMetrics.md
Calls: Product, Engineering, Customer Success
```

### Investor Brain
```
Specialty: Fundraising, investor relations, pitch decks
Key Files:
- FundraisingStrategy.md
- PitchDeckTemplate.md
- InvestorOutreach.md
- DueDiligence.md
- TermSheetGuide.md
- InvestorUpdates.md
Calls: MBA, Finance, Legal
```

### Pricing Brain
```
Specialty: Pricing strategy, packaging, monetization
Key Files:
- PricingStrategy.md
- PackagingModels.md
- MonetizationPatterns.md
- PriceOptimization.md
- CompetitivePricing.md
- PricingExperiments.md
Calls: Product, Finance, Sales
```

### Innovation Brain
```
Specialty: R&D, new ventures, experimentation
Key Files:
- InnovationStrategy.md
- IdeationFramework.md
- ExperimentDesign.md
- VentureBuilding.md
- TechnologyRadar.md
- FailFastProtocol.md
Calls: Product, Engineering, Research
```

---

## Next Brain to Build

**Recommended next:** Product Brain

Why:
1. Defines WHAT to build (before Engineering builds it)
2. Creates PRDs, specs, roadmaps
3. Bridges business goals and technical execution
4. High leverage - improves all other work

---

## How to Build a New Brain

1. Create folder: `/prototype_x1000/brain_name/`
2. Create `CLAUDE.md` (use Engineering/Design as template)
3. Add "Calls other brains" section with `/prototype_x1000/` paths
4. Add COMMIT RULE section (mandatory for all brains)
5. Create core pattern files
6. Create Memory/ folder
7. Add to CEO Brain's list
8. Update `.claude/SYSTEM-PROMPT.md`
9. Commit

---

**This roadmap is the source of truth for brain development.**
