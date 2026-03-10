# Cap Table Template — Ownership, Dilution, and Waterfall Analysis

## Instructions

A capitalization table (cap table) records the equity ownership of a company.
It must be maintained with precision because errors compound across rounds and
affect every financial and legal document. This template covers the ownership
ledger, option pool tracking, dilution modeling, and the liquidation waterfall
that determines payout in an exit. Build this in a spreadsheet (Carta, Google
Sheets, or Excel) and reconcile after every equity-affecting event.

---

## Section 1: Ownership Summary [UPDATE AFTER EVERY EVENT]

### Current Ownership (Fully Diluted)

```
Shareholder / Class    | Shares      | % Ownership | Invested  | Price/Share
──────────────────────────────────────────────────────────────────────────────
FOUNDERS
  Founder 1 (Common)   | [X,XXX,XXX] | [XX.X]%     | $[XXX]    | $[X.XXXX]
  Founder 2 (Common)   | [X,XXX,XXX] | [XX.X]%     | $[XXX]    | $[X.XXXX]

SEED INVESTORS
  Angel 1 (SAFE->Pref) | [XXX,XXX]   | [X.X]%      | $[XXX]K   | $[X.XX]
  Angel 2 (SAFE->Pref) | [XXX,XXX]   | [X.X]%      | $[XXX]K   | $[X.XX]
  Seed Fund (Seed Pref) | [X,XXX,XXX]| [X.X]%      | $[X.X]M   | $[X.XX]

SERIES A INVESTORS
  Lead VC (Series A)    | [X,XXX,XXX] | [XX.X]%     | $[X]M     | $[X.XX]
  Follow VC (Series A)  | [XXX,XXX]  | [X.X]%      | $[X]M     | $[X.XX]

OPTION POOL
  Granted (exercised)   | [XXX,XXX]   | [X.X]%      |           |
  Granted (unexercised) | [X,XXX,XXX] | [X.X]%      |           |
  Unallocated           | [X,XXX,XXX] | [X.X]%      |           |
  Total option pool     | [X,XXX,XXX] | [XX.X]%     |           |

──────────────────────────────────────────────────────────────────────────────
TOTAL (Fully Diluted)  | [XX,XXX,XXX]| 100.0%      | $[XX.X]M  |
```

---

## Section 2: Round History

### Round Summary

```
Round     | Date     | Pre-$   | Raise    | Post-$   | Price/Sh | New Shares | Pool %
─────────────────────────────────────────────────────────────────────────────────────
Founding  | [date]   | $0      | $[X]K    |          | $0.001   | [X,XXX,XXX]| 0%
Seed SAFE | [date]   | N/A     | $[X]M    | $[X]M cap| N/A      | N/A (SAFE) | 0%
Seed Prcd | [date]   | $[X]M   | $[X]M    | $[X]M    | $[X.XX]  | [X,XXX,XXX]| 15%
Series A  | [date]   | $[XX]M  | $[X]M    | $[XX]M   | $[X.XX]  | [X,XXX,XXX]| 10%*
─────────────────────────────────────────────────────────────────────────────────────

*Option pool expanded as part of Series A (included in pre-money)
```

### SAFE Conversion Tracker

```
SAFE        | Amount  | Cap     | Discount | Conversion | Conv Price | Shares
                                             Round
──────────────────────────────────────────────────────────────────────────────
SAFE 1      | $250K   | $8M     | -        | Seed       | $[X.XX]    | [XXX,XXX]
SAFE 2      | $500K   | $10M    | 20%      | Seed       | $[X.XX]    | [XXX,XXX]
SAFE 3      | $100K   | $10M    | -        | Seed       | $[X.XX]    | [XXX,XXX]

Conversion price = MIN(cap price, discount price)
  Cap price = valuation cap / pre-money shares
  Discount price = round price * (1 - discount %)
```

---

## Section 3: Option Pool Detail

### Pool Summary

```
Total pool authorized:       [X,XXX,XXX] shares ([XX]% of fully diluted)
Granted and outstanding:     [X,XXX,XXX] shares ([XX]% of fully diluted)
Exercised:                   [XXX,XXX] shares
Cancelled/expired:           [XXX,XXX] shares
Available for grant:         [X,XXX,XXX] shares ([XX]% of fully diluted)
```

### Option Grant Ledger

```
Name        | Grant Date | Shares  | Strike | Vesting    | Status      | Vested
──────────────────────────────────────────────────────────────────────────────────
[Employee 1]| [date]     | [XX,XXX]| $[X.XX]| 4yr/1cliff | Active      | [XX,XXX]
[Employee 2]| [date]     | [XX,XXX]| $[X.XX]| 4yr/1cliff | Active      | [XX,XXX]
[Employee 3]| [date]     | [XX,XXX]| $[X.XX]| 4yr/1cliff | Terminated  | [XX,XXX]
[Employee 4]| [date]     | [XX,XXX]| $[X.XX]| 4yr/1cliff | Exercised   | [XX,XXX]
...
──────────────────────────────────────────────────────────────────────────────────
Total grants:              [X,XXX,XXX]
Total vested:              [XXX,XXX]
Total exercised:           [XXX,XXX]
```

### 409A History

```
Date          | FMV/Share | Method           | Provider     | Triggering Event
────────────────────────────────────────────────────────────────────────────────
[date]        | $[X.XX]   | OPM backsolve    | [provider]   | Post-seed
[date]        | $[X.XX]   | OPM backsolve    | [provider]   | Post-Series A
[date]        | $[X.XX]   | PWERM            | [provider]   | Annual refresh
```

---

## Section 4: Dilution Modeling

### Pro Forma Next Round

```
Current fully diluted shares:     [XX,XXX,XXX]
Proposed Series B:
  Pre-money valuation:            $[XXX]M
  Raise amount:                   $[XX]M
  Post-money valuation:           $[XXX]M
  Price per share:                $[XX.XX]
  New shares issued:              [X,XXX,XXX]
  Option pool increase:           [X,XXX,XXX] (to [XX]% post)

Post-round ownership:
  Shareholder    | Pre-Round %  | Post-Round % | Dilution
  ──────────────────────────────────────────────────────
  Founder 1      | [XX.X]%      | [XX.X]%      | [X.X]pp
  Founder 2      | [XX.X]%      | [XX.X]%      | [X.X]pp
  Seed investors | [X.X]%       | [X.X]%       | [X.X]pp
  Series A       | [XX.X]%      | [XX.X]%      | [X.X]pp
  Series B (new) | 0%           | [XX.X]%      | N/A
  Option pool    | [XX.X]%      | [XX.X]%      | [X.X]pp
  ──────────────────────────────────────────────────────
  Total          | 100%         | 100%         |
```

---

## Section 5: Liquidation Waterfall

### Waterfall at Various Exit Values

```
Assumptions:
  Series A: $10M invested, 1x non-participating preferred
  Seed: $2M invested, 1x non-participating preferred
  Total liquidation preferences: $12M

Exit Value:        $10M     $20M     $50M     $100M    $200M    $500M
──────────────────────────────────────────────────────────────────────
Series A pref:     $10M     $10M     --       --       --       --
Seed pref:         $0       $2M      --       --       --       --
Common:            $0       $8M      --       --       --       --

OR (as-converted):
Series A pro-rata: $[X]M    $[X]M    $[XX]M   $[XX]M   $[XX]M   $[XX]M
Seed pro-rata:     $[X]M    $[X]M    $[X]M    $[X]M    $[X]M    $[XX]M
Founders:          $[X]M    $[X]M    $[XX]M   $[XX]M   $[XX]M   $[XXX]M
Options:           $[X]M    $[X]M    $[X]M    $[X]M    $[XX]M   $[XX]M

PAYOUT (greater of preference or as-converted):
Series A:          $10M     $10M     $[XX]M   $[XX]M   $[XX]M   $[XX]M
Seed:              $0       $2M      $[X]M    $[X]M    $[X]M    $[XX]M
Founders:          $0       $8M      $[XX]M   $[XX]M   $[XX]M   $[XXX]M
Options (net):     $0       $0       $[X]M    $[X]M    $[XX]M   $[XX]M

CONVERSION POINT:
  Series A converts to common when exit > $[XX]M
  (Exit value where pro-rata > 1x preference)
  Formula: preference / ownership % = $10M / [XX]% = $[XX]M
```

### Participation Analysis (if applicable)

```
If Series A had participating preferred (1x + pro-rata):

Exit at $50M:
  Non-participating: Series A gets MAX($10M, 25% * $50M) = $12.5M
  Participating:     Series A gets $10M + 25% * ($50M - $10M) = $20M

Difference: $7.5M more to Series A investors with participation
Impact on founders: $7.5M less

This is why non-participating preferred is strongly preferred by founders.
```

---

## Section 6: Cap Table Reconciliation

### Monthly Reconciliation Checklist

```
[ ] Total shares = sum of all shareholder shares + pool
[ ] Fully diluted count matches legal records
[ ] Option grants reconcile with board approvals
[ ] 409A valuation is current (< 12 months old)
[ ] SAFE conversions properly calculated and recorded
[ ] Exercise events properly recorded
[ ] Cancelled/expired options returned to pool
[ ] Ownership percentages sum to 100%
[ ] Investor rights (pro-rata, information) mapped to shareholders
[ ] Vesting schedules current for all active grants
```

### Event Log

```
Date       | Event                    | Impact           | Approved By
──────────────────────────────────────────────────────────────────────────
[date]     | Series A close           | [X]M new shares  | Board
[date]     | SAFE conversion          | [X]K shares      | Automatic
[date]     | Option grant: [Name]     | [XX]K options    | Board
[date]     | Exercise: [Name]         | [XX]K shares     | N/A
[date]     | Termination: [Name]      | [XX]K cancelled  | HR
[date]     | 409A valuation           | FMV: $[X.XX]     | Board
[date]     | Pool increase            | [XXX]K shares    | Board
```

---

## Tools

| Tool | Purpose | Best For |
|------|---------|---------|
| Carta | Cap table management, 409A, equity plans | Series A+ companies |
| Pulley | Cap table, modeling, SAFE tracking | Seed-stage companies |
| Shareworks (Morgan Stanley) | Equity admin | Late-stage/public |
| Google Sheets / Excel | Custom modeling | Early-stage, ad hoc analysis |
| Capshare | Cap table management | Mid-stage companies |

---

## Sign-Off

| Role | Name | Date | Verified |
|------|------|------|----------|
| CFO | [name] | [date] | [verified] |
| Legal counsel | [name] | [date] | [verified] |
| CEO | [name] | [date] | [acknowledged] |
