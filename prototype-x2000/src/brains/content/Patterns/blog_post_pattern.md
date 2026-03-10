# Blog Post Pattern — Repeatable Framework for High-Performance Blog Content

## Context

Use this pattern whenever creating a blog post of any type. Blog posts
are the highest-volume content format in most content programs and the
primary driver of organic search traffic. This pattern ensures every
blog post meets strategic, editorial, and SEO standards regardless of
who writes it.

---

## Pattern Overview

Every blog post follows the same meta-structure, regardless of type:

```
HOOK → CONTEXT → BODY → CONCLUSION → CTA
```

The implementation varies by post type, but this structure is invariant.

---

## Step 1: Post Type Selection

Before writing, classify the post by type. Each type has distinct
objectives, structures, and quality criteria.

**Informational (How-To / Guide / Tutorial)**
- Objective: Teach the reader how to accomplish something
- SEO target: Informational intent keywords
- Funnel position: Top-of-funnel awareness
- Structure: Problem → Step-by-step solution → Examples → Summary
- Quality signal: Can the reader complete the task after reading?

**Thought Leadership (Opinion / Analysis)**
- Objective: Differentiate the brand with a unique perspective
- SEO target: Low-volume, high-share potential
- Funnel position: Brand preference
- Structure: Thesis → Supporting arguments → Implications → CTA
- Quality signal: Does this say something no one else is saying?

**Data-Driven (Research / Study / Benchmark)**
- Objective: Earn backlinks and citations through original data
- SEO target: Link building, brand queries
- Funnel position: Authority building
- Structure: Methodology → Findings → Analysis → Implications
- Quality signal: Would a journalist cite this?

**Listicle (Best-of / Comparison / Curated)**
- Objective: Capture commercial investigation intent
- SEO target: "Best," "top," comparison keywords
- Funnel position: Mid-funnel consideration
- Structure: Introduction → Ranked items with analysis → Summary
- Quality signal: Does each item have genuine analysis, not just
  descriptions?

**Case Study (Customer Story / Success Narrative)**
- Objective: Provide social proof for sales enablement
- SEO target: Brand + customer name, solution keywords
- Funnel position: Bottom-of-funnel
- Structure: Challenge → Solution → Results → Quote
- Quality signal: Are the results quantified and verifiable?

---

## Step 2: Hook Design

The first 2–3 sentences determine whether the reader continues or
bounces. Select a hook formula based on the post type:

**Statistical Hook** (best for data-driven and informational)
"[Surprising statistic] — and most [audience] have no idea why."

**Narrative Hook** (best for thought leadership and case studies)
"When [person/company] faced [specific challenge], they tried [common
approach]. It failed. Here's what worked instead."

**Question Hook** (best for informational and listicles)
"What would you do if [relatable scenario]? Most [audience] get it
wrong."

**Contrarian Hook** (best for thought leadership)
"Everyone says [common belief]. They're wrong, and here's why."

**Promise Hook** (best for how-to and guides)
"By the end of this post, you'll know exactly how to [specific outcome]
— even if you've never [prerequisite]."

**Hook Testing Protocol**
Write 3–5 hook variants for every post. If the post will be promoted
on social, test hooks as social posts before publication. The hook that
earns the highest engagement becomes the blog post opening.

---

## Step 3: Body Structure

### Heading Hierarchy

Every blog post must use proper heading hierarchy:
- H1: Post title (one per page, defined in CMS)
- H2: Main sections (4–8 per post, keyword-inclusive where natural)
- H3: Sub-sections within H2 blocks (as needed for depth)
- H4: Rarely used, only for deeply nested sub-topics

### Section Architecture

Each H2 section follows this internal pattern:
1. **Context sentence**: Why this section matters (1–2 sentences)
2. **Core content**: The teaching, argument, or analysis (3–10 paragraphs)
3. **Evidence**: Data, examples, screenshots, or quotes
4. **Takeaway**: What the reader should do with this information

### Paragraph and Sentence Standards

- Maximum paragraph length: 4 sentences (web reading is scanning)
- Average sentence length: 15–20 words
- Mix sentence lengths for rhythm (short declarative sentences create
  emphasis; longer sentences carry complex ideas)
- One idea per paragraph (readers scan by paragraph, not by sentence)

### Evidence Integration

Every substantive claim must be supported by one of:
- Data (statistic with source and year)
- Example (specific, concrete instance)
- Expert quote (named authority with credentials)
- Case study (named company with measurable results)
- Research citation (study with methodology description)

Unsupported claims weaken authority. The standard: if a reader asks
"says who?", you should be able to answer.

---

## Step 4: SEO Integration

### Keyword Placement

- Title tag: Primary keyword within the first 60 characters
- H1: Primary keyword, naturally phrased
- First 100 words: Primary keyword appears in the opening paragraph
- H2 headings: Secondary keywords where natural (not forced)
- Body text: Primary keyword 3–5 times per 1,000 words (density is
  secondary to natural language)
- Meta description: Primary keyword + compelling CTA in 155 characters
- URL slug: Primary keyword, hyphen-separated, concise

### Internal Linking

Every blog post must include:
- 1 link to the parent pillar page (topic cluster connection)
- 2–3 links to related cluster posts (lateral discovery)
- 1 link to a conversion page when relevant (product, pricing, demo)
- Descriptive anchor text for all links (not "click here")

### Schema Markup

Apply appropriate schema based on content:
- All posts: Article schema (headline, author, datePublished, image)
- How-to posts: HowTo schema (steps with names and descriptions)
- Posts with FAQ sections: FAQPage schema (question/answer pairs)
- Posts with videos: VideoObject schema (name, description, thumbnailUrl)

---

## Step 5: Conclusion and CTA

### Conclusion Pattern

The conclusion must:
1. Summarize the 3–5 key takeaways in 2–3 sentences
2. Restate the benefit promised in the hook
3. Transition naturally to the CTA

**Do not** introduce new information in the conclusion. It synthesizes,
it does not expand.

### CTA Selection

Match the CTA to the post type and funnel position:

| Post Type | Primary CTA | Secondary CTA |
|-----------|-------------|---------------|
| Informational | Subscribe to newsletter | Related guide link |
| Thought Leadership | Share on LinkedIn | Comment with opinion |
| Data-Driven | Download full report | Share the statistic |
| Listicle | Try recommended tool | Read related comparison |
| Case Study | Request demo | View more case studies |

---

## Quality Criteria

Before publication, every blog post must pass:

| Criterion | Standard | Check Method |
|-----------|----------|-------------|
| Readability | Flesch-Kincaid 8 or lower (general) | Hemingway Editor |
| Word count | Within target range from brief | Word count tool |
| Heading structure | Logical H1→H2→H3, no skips | Manual review |
| Evidence density | 1+ evidence per H2 section | Manual review |
| Internal links | 3–5 minimum | Screaming Frog or manual |
| Meta tags | Title (60 char), description (155 char) | CMS check |
| Images | Alt text, compressed, responsive | CMS check |
| Schema | Appropriate type implemented | Google Rich Results Test |
| Grammar | Zero errors | Grammarly or equivalent |
| Brand voice | Matches voice guidelines | Editor review |

---

## Anti-Patterns

**The Wall of Text**
No images, no bullet points, no subheadings, 300-word paragraphs.
Even excellent content fails if it looks unreadable.

**The Keyword Stuffer**
Primary keyword forced into every paragraph, destroying readability.
If it sounds unnatural when read aloud, it is stuffed.

**The Linkless Island**
No internal links to related content. The reader consumes one page and
leaves. Every post must connect to the broader content ecosystem.

**The Missing CTA**
Post ends abruptly with no next step for the reader. Every post must
tell the reader what to do after reading.

**The Me-Too Post**
Content that says exactly what every competitor's post says, with no
unique angle, data, or insight. If you cannot identify what makes your
post different, it should not be published.

**The Undated Post**
No publish date visible. Readers distrust undated content, especially
for topics that evolve. Always display the publication date.

---

## Examples of Pattern Application

Reference published content that exemplifies this pattern (update as
new exemplars are published):
- [Link to best-performing informational post]
- [Link to best-performing thought leadership post]
- [Link to best-performing data-driven post]

---

## References

- Ann Handley, *Everybody Writes*
- Orbit Media Studios: Annual Blogging Survey
- Backlinko: SEO content study (analyzed 11.8M Google results)
- Nielsen Norman Group: How Users Read on the Web
- Content Marketing Institute: B2B Content Marketing Report

---

**This pattern is the default starting point for every blog post.
Deviation is acceptable when justified; ignorance is not.**
