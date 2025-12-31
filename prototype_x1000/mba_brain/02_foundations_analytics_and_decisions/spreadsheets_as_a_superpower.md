# Spreadsheets as a Superpower

## What This Enables

**Decisions it helps make:**
- What's the unit economics of this initiative?
- At what point does this investment pay off?
- How do different scenarios affect our outcomes?
- What's the sensitivity of our plan to key assumptions?

**Mistakes it prevents:**
- Launching initiatives without understanding the math
- Missing hidden costs that destroy unit economics
- Being surprised by model behavior at scale
- Accepting financial projections you can't interrogate

**Outputs it enables:**
- Quick-turn financial models for any decision
- Sensitivity analyses that reveal what matters
- Scenario comparison tools
- Business cases that can be stress-tested

---

## Why Spreadsheets Still Matter

In an age of dashboards and SQL, spreadsheets remain the operator's primary thinking tool.

**Why:**
- Zero setup cost — start thinking immediately
- Direct manipulation — see cause and effect in real time
- Shareable — anyone can interrogate your logic
- Flexible — reshape for any problem

Dashboards show you what happened. Spreadsheets help you decide what to do next.

---

## Core Spreadsheet Mental Models

### 1. Inputs, Calculations, Outputs

Structure every model the same way:

```
INPUTS (things you assume or control)
   ↓
CALCULATIONS (logic that transforms inputs)
   ↓
OUTPUTS (results you care about)
```

**Inputs** should be in one place, clearly labeled, and easy to change.
**Calculations** should never contain hardcoded numbers — always reference cells.
**Outputs** should be the answers to your questions.

**Why this matters:** When assumptions change, you update one cell and the whole model updates. If inputs are scattered, you'll miss something.

### 2. Rows Are Instances, Columns Are Attributes

Standard structure for any data:
- Each row is one thing (customer, deal, month, product)
- Each column is one attribute (revenue, cost, date, status)

This structure enables sorting, filtering, and pivot tables.

### 3. Time Flows Left to Right

For time-based models:
- Column A/B: labels and inputs
- Column C: Month 1
- Column D: Month 2
- And so on...

Formulas should reference the previous column where applicable (enables drag-to-copy).

---

## The Essential Patterns

### Pattern 1: Cohort Analysis

Track groups of users/customers acquired in the same period through their lifecycle.

**Structure:**
- Rows: Cohort (e.g., Jan 2024, Feb 2024)
- Columns: Time since acquisition (Month 0, Month 1, Month 2...)
- Values: Metric (revenue, retention, usage)

**Why it matters:** Averages hide everything. Cohorts reveal whether you're getting better or worse at retention, monetization, and engagement.

### Pattern 2: Waterfall / Bridge

Explain how you got from point A to point B.

**Example — Revenue Bridge:**
- Starting ARR: $1M
- + New customers: $200K
- + Expansion: $150K
- - Churn: -$100K
- = Ending ARR: $1.25M

**Why it matters:** Waterfalls decompose change into its components. Essential for understanding what's driving results.

### Pattern 3: Sensitivity Table

Show how outputs change as inputs vary.

**Structure:** Use Data Tables (Excel/Sheets feature) or manual grid.

| | CAC $400 | CAC $500 | CAC $600 |
|---|---------|---------|---------|
| LTV $1200 | 3.0x | 2.4x | 2.0x |
| LTV $1500 | 3.75x | 3.0x | 2.5x |
| LTV $1800 | 4.5x | 3.6x | 3.0x |

**Why it matters:** Shows which assumptions matter most. If small changes in CAC dramatically change the outcome, you need to monitor CAC closely.

### Pattern 4: Scenario Toggle

Build one model that can flip between scenarios with a single input.

**Implementation:**
- Cell B1: Scenario selector (dropdown: Base, Downside, Upside)
- Assumption cells use: `=IF(B1="Base", 100, IF(B1="Downside", 80, 120))`

Or better: Create an assumption table and use INDEX/MATCH to pull values based on scenario selection.

**Why it matters:** Compare scenarios instantly without maintaining multiple models.

### Pattern 5: Unit Economics Calculator

For any initiative, calculate the economics of one unit.

**Structure:**
- Revenue per unit
- Variable costs per unit
- Contribution margin per unit
- Fixed costs (to allocate or break even against)
- Break-even units

**Example — SaaS Customer:**
- Monthly revenue: $100
- Monthly hosting cost: $5
- Monthly support cost: $15
- Contribution margin: $80/month
- Acquisition cost: $800
- Payback period: 10 months

**Why it matters:** If unit economics don't work, volume won't save you.

---

## Critical Formulas

Master these and you can model almost anything:

### Lookup and Reference
- `VLOOKUP` / `XLOOKUP` / `INDEX-MATCH`: Pull data from tables
- `OFFSET`: Dynamic ranges (use sparingly — slows calculation)

### Conditional Logic
- `IF`: Basic branching
- `IFS` / nested `IF`: Multiple conditions
- `SUMIF` / `COUNTIF` / `AVERAGEIF`: Conditional aggregation
- `SUMIFS`: Multiple conditions

### Time and Dates
- `EOMONTH`: End of month (essential for monthly models)
- `DATEDIF`: Calculate intervals
- `NETWORKDAYS`: Business days between dates

### Financial
- `NPV`: Net present value
- `IRR`: Internal rate of return
- `PMT` / `PPMT` / `IPMT`: Loan amortization

### Aggregation
- `SUMPRODUCT`: Weighted sums, conditional sums without helper columns
- `UNIQUE` / `FILTER`: Dynamic arrays (newer Excel/Sheets)

### Error Handling
- `IFERROR`: Graceful failures
- `ISBLANK` / `ISNA`: Check for missing data

---

## Building Robust Models

### 1. Separate Inputs from Calculations

Never embed numbers in formulas. Always reference cells.

**Bad:** `=B5 * 1.08`
**Good:** `=B5 * (1 + $B$2)` where B2 is labeled "Growth Rate"

### 2. Use Named Ranges

For key inputs, name the cells. `=Revenue * Tax_Rate` is clearer than `=B15 * $C$3`.

### 3. One Formula Per Row

If a row has different formulas in different columns, something is wrong. The model should be consistent — copy across should work.

**Exception:** First column often needs a different formula than subsequent columns (Month 1 vs. Month 2+).

### 4. No Hidden Rows/Columns with Logic

If you hide complexity, you'll forget it exists. Make everything visible or document clearly.

### 5. Error-Check Your Model

Build in sanity checks:
- Does Revenue = Price × Units? Check with a formula.
- Does the balance sheet balance? Check it.
- Are percentages between 0 and 100%? Use conditional formatting.

### 6. Label Everything

Every input cell needs a clear label. Every output needs context. Future you (and your colleagues) will thank you.

---

## Common Spreadsheet Failures

### 1. Hardcoded Numbers Buried in Formulas

"Where does this 15% come from?" *searches for 30 minutes*

### 2. Circular References

Sometimes intentional (goal seek problems), usually bugs. Avoid unless you know what you're doing.

### 3. Broken References After Copy/Paste

Dollar signs matter. `$A$1` is absolute. `A$1` locks row only. `$A1` locks column only. `A1` moves with copy.

### 4. Summing Incompatible Units

Adding revenue in January to revenue in Q1 = double counting. Track units carefully.

### 5. Projecting Without Rationale

Cells that just "assume" 10% growth each month without connection to anything real. Every projection should trace to an input you can defend.

### 6. "Working" Tabs That Became the Model

Scratchwork tabs that never got cleaned up. Now no one knows what's real.

---

## Speed Techniques

| Action | Shortcut (Windows) | Shortcut (Mac) |
|--------|-------------------|----------------|
| Fill down | Ctrl + D | Cmd + D |
| Fill right | Ctrl + R | Cmd + R |
| Select to end of data | Ctrl + Shift + End | Cmd + Shift + End |
| Jump to edge of data | Ctrl + Arrow | Cmd + Arrow |
| Insert row/column | Ctrl + Shift + + | Cmd + Shift + + |
| Paste values only | Ctrl + Shift + V | Cmd + Shift + V |
| Toggle formula view | Ctrl + ` | Ctrl + ` |
| Trace precedents | Ctrl + [ | Cmd + [ |
| Trace dependents | Ctrl + ] | Cmd + ] |

Learn these. The difference between a 10-minute model and a 2-hour model is often just fluency.

---

## When to Upgrade from Spreadsheets

Spreadsheets break down when:
- Data exceeds ~100K rows
- Multiple users need to edit simultaneously (with version control)
- You need real-time data connections
- Calculations take minutes
- Logic is too complex to audit

**Upgrade to:**
- SQL + BI tools for analysis at scale
- Python/R for statistical modeling
- Purpose-built financial planning tools for enterprise FP&A
- Databases for data that changes frequently

But for quick thinking, scenario analysis, and back-of-envelope calculations — spreadsheets remain unmatched.

---

## Summary: The Spreadsheet Mindset

Spreadsheets are not about the tool — they're about structured thinking.

Key principles:
- Separate inputs from calculations from outputs
- Make assumptions visible and changeable
- Build for interrogation — someone should be able to follow your logic
- Use sensitivity analysis to find what matters
- Build unit economics for every major decision
- Speed comes from fluency — learn the shortcuts

A well-built spreadsheet is a thinking tool that lets you ask "what if?" and get answers in seconds. That's the superpower.
