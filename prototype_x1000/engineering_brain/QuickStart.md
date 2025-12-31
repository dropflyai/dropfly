# ENGINEERING BRAIN QUICK START

New to the Engineering Brain? Answer these 3 questions to get started.

---

## 1. What are you building?

Choose the option that best describes your work:

- **Customer-facing web app** → `Product Target: WEB_SAAS`
- **Internal tool or web app** → `Product Target: WEB_APP`
- **iOS mobile app** → `Product Target: MOBILE_IOS`
- **Android mobile app** → `Product Target: MOBILE_ANDROID`
- **Backend API or service** → `Product Target: API_SERVICE`
- **Automation or agent** → `Product Target: AGENT_SYSTEM`
- **One-off script or utility** → `Product Target: SCRIPT`

---

## 2. What phase are you in?

- **Just trying something / experimenting** → `Gear: EXPLORE` (lightweight)
- **Building a real feature** → `Gear: BUILD` (normal rigor, default)
- **Shipping to production** → `Gear: SHIP` (full rigor)
- **Fixing production emergency** → `Gear: HOTFIX` (minimal safe set)

---

## 3. What are you working on?

- **User-facing UI** → `Mode: APP`
- **Backend or API** → `Mode: API`
- **Automation or workflow** → `Mode: AGENTIC`
- **Shared library or package** → `Mode: LIB`

---

## You're Ready!

Once you answer these 3 questions, the agent will handle the rest.

### Example

**User:** "I'm building a login page for our internal tool"

**Agent infers:**
- Product Target: `WEB_APP` (internal tool)
- Gear: `BUILD` (real feature)
- Mode: `APP` (user-facing UI)

**Agent confirms:**
"Inferred: TARGET=WEB_APP | GEAR=BUILD | MODE=APP. Confirm or correct."

---

## Shortcuts (Experienced Users)

**Standard:**
```
TARGET: WEB_APP | GEAR: BUILD | MODE: APP | ARTIFACT: Component
```

**Ultra-short (BUILD only):**
```
WEB_APP / APP / Component
```

---

## What Happens Next?

The agent will:
1. Confirm your Product Target, Gear, and Mode
2. Apply the appropriate checklist (EXPLORE / BUILD / SHIP / HOTFIX)
3. Follow the Engineering Constitution for verification and cleanup

---

**Need more details?** See `Engineering/Checklist.md` or `Engineering/Constitution.md`.
