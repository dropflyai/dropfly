# Financial Model Template — SaaS Three-Statement Model

## Instructions

This template provides the structure for building a SaaS financial model.
Copy this template and populate each section with your company's data and
assumptions. All blue-font values are inputs; all black-font values are
formulas. The model should be built in a spreadsheet (Google Sheets or Excel)
following this structure. Sections marked [INPUT] require your data.

---

## Tab 1: Cover Sheet

```
Model Name:           [Company Name] Financial Model
Version:              [v1.0]
Prepared by:          [Name, Title]
Date:                 [YYYY-MM-DD]
Last updated:         [YYYY-MM-DD]
Reviewed by:          [Name, Title]
Time horizon:         [3-5 years, monthly for Y1-Y2, quarterly for Y3-Y5]
Base currency:        [USD]
Fiscal year end:      [December 31]
```

---

## Tab 2: Assumptions [INPUT]

### Revenue Assumptions

```
Growth Drivers:
  New customer acquisition rate (monthly):   [_] customers/month
  New customer growth rate (MoM):            [_]%
  Average ACV (new customers):               $[_]
  ACV annual increase:                       [_]%
  Monthly logo churn rate:                   [_]%
  Monthly revenue contraction rate:          [_]%
  Monthly expansion rate:                    [_]%
  Professional services as % of new ACV:     [_]%

Pricing:
  Plan 1 (Starter):     $[_]/month
  Plan 2 (Professional): $[_]/month
  Plan 3 (Enterprise):  $[_]/month
  Plan mix assumption:   [_]% / [_]% / [_]%

Contract terms:
  Monthly vs annual mix:        [_]% / [_]%
  Annual discount:              [_]%
  Average payment terms:        Net [_] days
  Multi-year discount:          [_]%
```

### Expense Assumptions

```
Headcount:
  Department    | Start HC | End HC | Avg Salary | Benefits % | Hiring Month
  Engineering   | [_]      | [_]    | $[_]       | [_]%       | [months]
  Sales         | [_]      | [_]    | $[_]       | [_]%       | [months]
  Marketing     | [_]      | [_]    | $[_]       | [_]%       | [months]
  CS/Support    | [_]      | [_]    | $[_]       | [_]%       | [months]
  G&A           | [_]      | [_]    | $[_]       | [_]%       | [months]

Commission structure:
  AE commission on new business:    [_]% of ACV
  AE commission on renewals:        [_]% of ACV
  SDR bonus per qualified meeting:  $[_]
  Accelerator above quota:          [_]x rate

Non-headcount:
  Hosting/infrastructure:    $[_]/month base + $[_] per customer
  Marketing spend:           $[_]/month (or % of revenue: [_]%)
  Office/rent:               $[_]/month
  Software/tools:            $[_]/month
  Legal/professional:        $[_]/month
  Insurance:                 $[_]/year
  Travel:                    $[_]/employee/month
```

### Capital Assumptions

```
  Current cash:              $[_]
  Planned fundraise:         $[_] in [month/year]
  CapEx (annual):            $[_]
  Tax rate:                  [_]%
  R&D credit (annual):      $[_]
```

---

## Tab 3: Revenue Model

### ARR Waterfall (Monthly)

```
Month          | Jan    | Feb    | Mar    | ... | Dec
──────────────────────────────────────────────────────
Beginning ARR  | [calc] | [calc] | [calc] |     | [calc]
+ New ARR      | [calc] | [calc] | [calc] |     | [calc]
+ Expansion    | [calc] | [calc] | [calc] |     | [calc]
- Contraction  | [calc] | [calc] | [calc] |     | [calc]
- Churned ARR  | [calc] | [calc] | [calc] |     | [calc]
= Ending ARR   | [calc] | [calc] | [calc] |     | [calc]
──────────────────────────────────────────────────────
Net New ARR    | [calc] | [calc] | [calc] |     | [calc]
YoY Growth     | [calc] | [calc] | [calc] |     | [calc]

Formulas:
  New ARR = new_customers * avg_ACV
  Expansion = beginning_ARR * monthly_expansion_rate
  Contraction = beginning_ARR * monthly_contraction_rate
  Churned ARR = beginning_ARR * monthly_churn_rate
  Ending ARR = Beginning + New + Expansion - Contraction - Churn
```

### Revenue Recognition

```
Month          | Jan    | Feb    | Mar    | ... | Dec
──────────────────────────────────────────────────────
Subscription   | [calc] | [calc] | [calc] |     | [calc]
Prof Services  | [calc] | [calc] | [calc] |     | [calc]
Total Revenue  | [calc] | [calc] | [calc] |     | [calc]

Formula:
  Monthly subscription revenue = average of beginning and ending MRR
  (or more precise: sum of each customer's monthly recognized amount)
```

---

## Tab 4: Headcount Model

```
Department | Role        | Jan | Feb | Mar | ... | Dec | Avg Cost
──────────────────────────────────────────────────────────────────
Engineering| Sr Engineer | [#] | [#] | [#] |     | [#] | $[_]
           | Engineer    | [#] | [#] | [#] |     | [#] | $[_]
           | QA          | [#] | [#] | [#] |     | [#] | $[_]
Sales      | AE          | [#] | [#] | [#] |     | [#] | $[_]
           | SDR         | [#] | [#] | [#] |     | [#] | $[_]
Marketing  | Growth      | [#] | [#] | [#] |     | [#] | $[_]
CS         | CSM         | [#] | [#] | [#] |     | [#] | $[_]
G&A        | Finance     | [#] | [#] | [#] |     | [#] | $[_]
──────────────────────────────────────────────────────────────────
Total HC                 | [#] | [#] | [#] |     | [#] |

Monthly cost = headcount * (monthly_salary * (1 + benefits_load))
New hire ramp: 50% productive month 1, 75% month 2, 100% month 3+
```

---

## Tab 5: Income Statement

```
Line Item              | Jan    | Feb    | ... | Dec    | FY Total
─────────────────────────────────────────────────────────────────────
Subscription Revenue   | [calc] | [calc] |     | [calc] | [calc]
Professional Services  | [calc] | [calc] |     | [calc] | [calc]
Total Revenue          | [calc] | [calc] |     | [calc] | [calc]

Subscription COGS      | [calc] | [calc] |     | [calc] | [calc]
PS COGS                | [calc] | [calc] |     | [calc] | [calc]
Total COGS             | [calc] | [calc] |     | [calc] | [calc]

Gross Profit           | [calc] | [calc] |     | [calc] | [calc]
Gross Margin %         | [calc] | [calc] |     | [calc] | [calc]

Sales & Marketing      | [calc] | [calc] |     | [calc] | [calc]
Research & Development | [calc] | [calc] |     | [calc] | [calc]
General & Administrative| [calc]| [calc] |     | [calc] | [calc]
Total OPEX             | [calc] | [calc] |     | [calc] | [calc]

GAAP Operating Income  | [calc] | [calc] |     | [calc] | [calc]
+ SBC                  | [calc] | [calc] |     | [calc] | [calc]
Non-GAAP Operating Inc | [calc] | [calc] |     | [calc] | [calc]

Interest income/expense| [calc] | [calc] |     | [calc] | [calc]
Pre-tax income         | [calc] | [calc] |     | [calc] | [calc]
Tax                    | [calc] | [calc] |     | [calc] | [calc]
Net Income             | [calc] | [calc] |     | [calc] | [calc]
```

---

## Tab 6: Balance Sheet

```
Line Item              | Jan    | Feb    | ... | Dec
───────────────────────────────────────────────────────
ASSETS
  Cash                 | [calc] | [calc] |     | [calc]
  Accounts Receivable  | [calc] | [calc] |     | [calc]
  Prepaid Expenses     | [calc] | [calc] |     | [calc]
Total Current Assets   | [calc] | [calc] |     | [calc]
  PP&E (net)           | [calc] | [calc] |     | [calc]
Total Assets           | [calc] | [calc] |     | [calc]

LIABILITIES
  Accounts Payable     | [calc] | [calc] |     | [calc]
  Deferred Revenue     | [calc] | [calc] |     | [calc]
  Accrued Expenses     | [calc] | [calc] |     | [calc]
Total Current Liabilities| [calc]| [calc]|     | [calc]
Total Liabilities      | [calc] | [calc] |     | [calc]

EQUITY
  Common Stock + APIC  | [calc] | [calc] |     | [calc]
  Retained Earnings    | [calc] | [calc] |     | [calc]
Total Equity           | [calc] | [calc] |     | [calc]

CHECK: Assets - Liabilities - Equity = 0
```

---

## Tab 7: Cash Flow Statement

```
Line Item               | Jan    | Feb    | ... | Dec
────────────────────────────────────────────────────────
OPERATING
  Net Income            | [calc] | [calc] |     | [calc]
  + D&A                 | [calc] | [calc] |     | [calc]
  + SBC                 | [calc] | [calc] |     | [calc]
  - Change in AR        | [calc] | [calc] |     | [calc]
  + Change in Def Rev   | [calc] | [calc] |     | [calc]
  + Change in AP/Accrued| [calc] | [calc] |     | [calc]
Cash from Operations    | [calc] | [calc] |     | [calc]

INVESTING
  - CapEx               | [calc] | [calc] |     | [calc]
Cash from Investing     | [calc] | [calc] |     | [calc]

FINANCING
  + Equity raised       | [calc] | [calc] |     | [calc]
  + Debt raised         | [calc] | [calc] |     | [calc]
  - Debt repayment      | [calc] | [calc] |     | [calc]
Cash from Financing     | [calc] | [calc] |     | [calc]

Net Change in Cash      | [calc] | [calc] |     | [calc]
Beginning Cash          | [calc] | [calc] |     | [calc]
Ending Cash             | [calc] | [calc] |     | [calc]

Free Cash Flow          | [calc] | [calc] |     | [calc]
```

---

## Tab 8: Unit Economics

```
Metric                  | Jan    | Feb    | ... | Dec    | FY
────────────────────────────────────────────────────────────────
New customers           | [calc] | [calc] |     | [calc] | [calc]
Total customers         | [calc] | [calc] |     | [calc] | [calc]
ARPU (monthly)          | [calc] | [calc] |     | [calc] | [calc]
CAC                     | [calc] | [calc] |     | [calc] | [calc]
LTV                     | [calc] | [calc] |     | [calc] | [calc]
LTV:CAC                 | [calc] | [calc] |     | [calc] | [calc]
CAC Payback (months)    | [calc] | [calc] |     | [calc] | [calc]
Magic Number            | [calc] | [calc] |     | [calc] | [calc]
Burn Multiple           | [calc] | [calc] |     | [calc] | [calc]
Rule of 40              | [calc] | [calc] |     | [calc] | [calc]
```

---

## Tab 9: Scenarios

```
Scenario toggle: [Bull / Base / Bear]

Scenario-dependent assumptions:
  Variable               | Bull   | Base   | Bear
  ──────────────────────────────────────────────
  New customer growth    | +20%   | Base   | -25%
  Monthly churn          | -20%   | Base   | +30%
  Expansion rate         | +15%   | Base   | -20%
  Hiring pace            | +5 HC  | Base   | -8 HC
  Marketing spend        | +20%   | Base   | -30%

Summary by scenario:
  Metric                 | Bull   | Base   | Bear
  ──────────────────────────────────────────────
  Ending ARR             | $[_]   | $[_]   | $[_]
  Revenue                | $[_]   | $[_]   | $[_]
  Net Income             | $[_]   | $[_]   | $[_]
  Ending Cash            | $[_]   | $[_]   | $[_]
  Runway (months)        | [_]    | [_]    | [_]
```

---

## Tab 10: Error Checks

```
Check                              | Formula                    | Status
────────────────────────────────────────────────────────────────────────
Balance sheet balances             | A - L - E = 0              | [OK/ERR]
Cash reconciliation                | Begin + Net CF = End       | [OK/ERR]
Revenue build-up                   | Detail sum = P&L revenue   | [OK/ERR]
Headcount cost                     | HC * avg cost = P&L line   | [OK/ERR]
ARR to revenue                     | ARR/12 ~ monthly revenue   | [OK/ERR]
No circular references             | Manual check               | [OK/ERR]
No hardcoded values in formulas    | Audit check                | [OK/ERR]
```

---

## Sign-Off

| Role | Name | Date | Approval |
|------|------|------|----------|
| Model builder | [name] | [date] | [complete] |
| Model reviewer | [name] | [date] | [reviewed] |
| CFO | [name] | [date] | [approved] |
