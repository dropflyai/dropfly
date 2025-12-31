# Icon System — Authoritative

Icons support text. They do not replace it.
Every icon must be instantly recognizable or it has failed.

---

## Core Principles

1. **Icons support, not replace** — always pair with text for actions
2. **Familiar over clever** — use universal conventions
3. **Consistent style** — single icon library per product
4. **Functional, not decorative** — every icon must communicate

---

## Recommended Icon Libraries

### Primary Recommendation
**Lucide Icons** (lucide.dev)
- Clean, consistent line style
- MIT licensed
- React components available
- 1000+ icons

### Alternatives
- Heroicons (heroicons.com) — Tailwind ecosystem
- Phosphor Icons — More variants
- Radix Icons — Minimal set

Do not mix icon libraries within a product.

---

## Icon Sizes

Use this scale exclusively.

```
xs    12px    Inline indicators, badges
sm    16px    Compact UI, table cells
md    20px    Default, buttons, inputs
lg    24px    Emphasis, navigation
xl    32px    Large indicators, empty states
2xl   48px    Feature highlights (rare)
```

### Size Usage

| Context | Size |
|---------|------|
| Inline with text-sm | 16px |
| Inline with text-base | 20px |
| Buttons | 16-20px |
| Navigation items | 20-24px |
| Status indicators | 16-20px |
| Empty states | 32-48px |

---

## Icon Spacing

| Context | Gap to Text |
|---------|-------------|
| Buttons | 8px |
| List items | 8-12px |
| Navigation | 12px |
| Inline | 4-8px |

Icons should never touch text directly.

---

## Semantic Icons (Standard Meanings)

### Actions
| Icon | Meaning | Use |
|------|---------|-----|
| Plus | Add/Create | New item buttons |
| Pencil | Edit | Modify existing |
| Trash | Delete | Remove (destructive) |
| Copy | Duplicate | Clone item |
| Download | Export/Save | Get file |
| Upload | Import | Add file |
| Search | Find | Search inputs |
| Filter | Refine | Filter controls |
| Settings/Cog | Configure | Settings access |
| Refresh | Reload | Refresh data |

### Navigation
| Icon | Meaning | Use |
|------|---------|-----|
| Home | Dashboard/Home | Main entry |
| ChevronRight | Navigate | Go to detail |
| ChevronDown | Expand | Dropdown/accordion |
| ArrowLeft | Back | Return navigation |
| ExternalLink | New window | Opens external |
| Menu | Navigation | Mobile menu toggle |
| X/Close | Dismiss | Close modal/drawer |

### Status
| Icon | Meaning | Use |
|------|---------|-----|
| Check/CheckCircle | Success | Completed state |
| AlertTriangle | Warning | Caution needed |
| AlertCircle | Error | Failed state |
| Info | Information | Neutral info |
| Clock | Pending/Time | Waiting state |
| Loader/Spinner | Loading | In progress |
| Ban/Slash | Blocked | Not allowed |

### Communication
| Icon | Meaning | Use |
|------|---------|-----|
| Bell | Notifications | Alerts |
| Mail | Email | Messages |
| MessageSquare | Comment | Discussions |
| User | Account | Profile |
| Users | Team | Multiple people |
| Lock | Security | Protected |
| Eye | View | Visibility toggle |
| EyeOff | Hidden | Private |

---

## Color Rules

### Default
- Icons inherit text color
- Use `currentColor` for SVG fill/stroke

### Semantic Colors
| State | Color |
|-------|-------|
| Default | neutral-500 to neutral-600 |
| Interactive hover | neutral-700 or primary-500 |
| Success | success-500 |
| Warning | warning-500 |
| Error | error-500 |
| Info | info-500 |
| Disabled | neutral-300 |

### Rules
- Never use color alone to convey meaning
- Pair colored icons with text or shape
- Maintain contrast ratios

---

## Accessibility Requirements

### Icon-Only Buttons (Use Sparingly)
- Must have `aria-label`
- Must have visible tooltip on hover/focus
- Must be keyboard accessible

```html
<button aria-label="Delete item" title="Delete">
  <TrashIcon />
</button>
```

### Decorative Icons
- Hide from screen readers with `aria-hidden="true"`
- Do not make focusable

```html
<span aria-hidden="true">
  <StarIcon />
</span>
<span>Favorites</span>
```

### Informational Icons
- Include accessible text
- Or use `role="img"` with `aria-label`

---

## Usage Patterns

### Button with Icon
```html
<!-- Icon left (default) -->
<button>
  <PlusIcon class="w-5 h-5 mr-2" />
  Create workflow
</button>

<!-- Icon right (navigation hint) -->
<button>
  View details
  <ChevronRightIcon class="w-5 h-5 ml-2" />
</button>
```

### Icon-Only Button
```html
<!-- Must have aria-label -->
<button
  aria-label="Settings"
  class="p-2 hover:bg-neutral-100 rounded"
>
  <SettingsIcon class="w-5 h-5" />
</button>
```

### Status with Icon
```html
<div class="flex items-center gap-2 text-success-600">
  <CheckCircleIcon class="w-5 h-5" />
  <span>Completed</span>
</div>
```

### List Item with Icon
```html
<li class="flex items-center gap-3 p-3">
  <FileIcon class="w-5 h-5 text-neutral-400" />
  <span>Document.pdf</span>
</li>
```

---

## Mode-Specific Rules

### MODE_SAAS
- Always pair icons with text
- Larger icons (20-24px)
- Status icons prominent
- Avoid icon-only actions

### MODE_INTERNAL
- Icon-only allowed for common actions
- Smaller icons acceptable (16-20px)
- Density through icons
- Tooltips required for icon-only

### MODE_AGENTIC
- Status icons critical
- Progress indicators needed
- Clear success/failure icons
- Timeline markers

---

## Anti-Patterns (Disallowed)

- Icon-only actions without labels (except well-known like close)
- Custom icons that require explanation
- Decorative icons that add no meaning
- Mixing icon libraries
- Icons that look clickable but aren't
- Using color alone for icon meaning
- Oversized icons that dominate content
- Animated icons (except loading)

---

## Icon Selection Checklist

Before using an icon, ask:
1. Is this icon universally understood?
2. Does it add meaning or just decoration?
3. Is it paired with text (if actionable)?
4. Does it have proper accessibility attributes?
5. Is it the right size for context?

If any answer is "no," reconsider.

---

## END OF ICON SYSTEM
