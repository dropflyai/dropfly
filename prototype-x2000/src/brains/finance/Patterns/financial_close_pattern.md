# Financial Close Pattern — Monthly Close Process

## Context

The monthly financial close is the recurring process of finalizing a company's
financial records for a period, producing accurate financial statements, and
delivering variance analysis and management reports. A disciplined close process
builds financial credibility with investors, enables data-driven decisions, and
prepares the company for audit and IPO readiness.

---

## Problem Statement

Monthly close processes fail when they:
- Take too long (> 15 business days erodes relevance)
- Produce inconsistent numbers (different reports show different figures)
- Skip reconciliations (errors compound over months)
- Lack variance analysis (numbers without explanation are useless)
- Have no clear ownership (tasks fall through cracks)

---

## Solution Architecture

```
┌─────────────────────────────────────────────────────────┐
│               MONTHLY CLOSE PROCESS                      │
│                                                          │
│  Day 1-3      Day 4-6       Day 7-8       Day 9-10     │
│  ┌──────────┐ ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Record & │ │ Reconcile│  │ Analyze  │  │ Report & │ │
│  │ Accrue   │ │ & Review │  │ Variance │  │ Deliver  │ │
│  └──────────┘ └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Day 1-3: Record and Accrue

```
Revenue:
  [ ] All invoices for the period issued in billing system
  [ ] Revenue recognized per ASC 606 policy
  [ ] Deferred revenue schedule updated
  [ ] MRR/ARR reconciled to billing system

  SQL check:
    SELECT SUM(revenue_recognized)
    FROM revenue_journal
    WHERE period = 'YYYY-MM'
    -- Must match P&L revenue line

Expenses:
  [ ] All vendor invoices received and posted
  [ ] Payroll journal entry posted (with proper period allocation)
  [ ] Accruals estimated for incurred-not-invoiced expenses
  [ ] Prepaid expenses amortized (insurance, software, rent)
  [ ] Depreciation posted (straight-line schedule)
  [ ] Stock-based compensation expense recorded (ASC 718)

Cash:
  [ ] Bank reconciliation completed (check vs bank statement)
  [ ] Outstanding checks and deposits in transit identified
  [ ] Credit card transactions categorized and posted
```

### Day 4-6: Reconcile and Review

```
Balance sheet reconciliations:
  [ ] Cash: GL balance = bank statement + reconciling items
  [ ] Accounts receivable: GL = AR aging report total
  [ ] Prepaid expenses: GL = amortization schedule
  [ ] Fixed assets: GL = depreciation schedule
  [ ] Accounts payable: GL = AP aging report total
  [ ] Deferred revenue: GL = deferred revenue schedule
  [ ] Accrued expenses: GL = accrual detail

Cross-checks:
  [ ] Balance sheet balances (Assets = Liabilities + Equity)
  [ ] Cash flow statement: beginning + net change = ending cash
  [ ] Revenue: billing system = GL = P&L
  [ ] Headcount: HRIS count = payroll count = budget
  [ ] ARR: subscription billing = ARR tracking spreadsheet
```

### Day 7-8: Analyze Variance

```
Variance analysis framework:
  For each P&L line item:
    Variance = Actual - Budget
    Variance % = Variance / |Budget|

  Materiality thresholds:
    < 5%: note in commentary
    5-10%: department head explanation required
    > 10%: VP-level review required
    > 20%: CFO review and board communication

  Root cause decomposition:
    Revenue: volume * price * mix
    Expenses: headcount * rate + non-headcount spending
    See variance_analysis.md for detailed methodology
```

### Day 9-10: Report and Deliver

```
Deliverables:
  [ ] P&L: actual vs budget, with YTD
  [ ] Balance sheet
  [ ] Cash flow statement
  [ ] ARR bridge and SaaS metrics
  [ ] Variance commentary (every material line explained)
  [ ] 13-week cash flow forecast (updated)
  [ ] Dashboard refresh (Looker/Tableau/Mosaic)

Distribution:
  Day 10: Management report to leadership team
  Day 12: Board package prepared
  Day 14: Board package distributed (if board meeting month)
```

---

## Close Calendar Template

```
Business Day | Task                              | Owner         | Status
─────────────────────────────────────────────────────────────────────────
BD 1         | Revenue recognized and posted      | Controller    | [ ]
BD 1         | Bank reconciliation completed      | Staff Acct    | [ ]
BD 2         | Payroll posted                     | Controller    | [ ]
BD 2         | AP invoices posted                 | AP Clerk      | [ ]
BD 3         | Accruals and prepaids posted        | Controller    | [ ]
BD 3         | SBC expense posted                 | Controller    | [ ]
BD 4         | AR reconciliation                   | Staff Acct    | [ ]
BD 4         | Deferred revenue reconciliation     | Controller    | [ ]
BD 5         | Full BS reconciliation              | Controller    | [ ]
BD 5         | Preliminary P&L to CFO              | Controller    | [ ]
BD 6         | Variance analysis drafted           | FP&A          | [ ]
BD 7         | Management review meeting           | CFO           | [ ]
BD 8         | Final adjustments posted            | Controller    | [ ]
BD 9         | Management report distributed       | FP&A          | [ ]
BD 10        | Board package prepared              | CFO           | [ ]
BD 12        | Board package distributed           | CFO           | [ ]
```

---

## Quality Gates

| Gate | Check | Owner |
|------|-------|-------|
| Balance sheet balances | A = L + E, variance = 0 | Controller |
| Cash reconciles | GL = bank statement | Staff Accountant |
| Revenue reconciles | Billing = GL = P&L | Controller |
| ARR reconciles | Billing = ARR tracker | FP&A |
| Variance explained | All material items have commentary | FP&A |
| Board package reviewed | CFO sign-off | CFO |

---

## Trade-offs

| Gain | Sacrifice |
|------|----------|
| Accurate financials | 3-5 days of team effort per month |
| Fast close (10 days) | May miss late-arriving invoices |
| Detailed variance analysis | Requires FP&A capacity |
| Board-ready package | Formatting and review time |

---

## Anti-patterns

- Closing without bank reconciliation
- Posting journal entries without supporting documentation
- Skipping deferred revenue reconciliation
- Delivering P&L without variance commentary
- Close taking > 15 business days
- Different numbers in management report vs board report
- Not reconciling ARR to billing system

---

## Checklist

- [ ] All journal entries posted with supporting documentation
- [ ] Bank reconciliation completed and reviewed
- [ ] All balance sheet accounts reconciled
- [ ] Revenue reconciled: billing = GL = P&L
- [ ] Deferred revenue schedule reconciled
- [ ] Variance analysis completed for all material line items
- [ ] Management report distributed by BD 10
- [ ] Board package distributed by BD 12
- [ ] 13-week cash flow forecast updated
- [ ] Close retrospective: identify improvements for next month

---

## References

- Bragg (2018). Financial Analysis: A Controller's Guide.
- CFO Connect: Monthly Close Best Practices.
- NetSuite: Month-End Close Checklist.
