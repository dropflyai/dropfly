# Reference DNA Storage

This folder stores Design DNA files for each project to ensure consistency across screens.

---

## Purpose

When a project has an established Design DNA:
- All subsequent screens must follow it
- Changes require documentation
- Handoffs include the DNA file

---

## Folder Structure

```
ReferenceDNA/
├── README.md (this file)
├── [ProjectName]/
│   ├── DesignDNA.md       # Core design language
│   ├── references/        # Original reference images (if stored)
│   └── changelog.md       # DNA modifications over time
├── [AnotherProject]/
│   └── ...
```

---

## Creating a Project DNA

1. Complete reference analysis via `ReferenceLab/`
2. Generate Design DNA using `ReferenceLab/DesignDNA.md` template
3. Save to `Memory/ReferenceDNA/[ProjectName]/DesignDNA.md`
4. Reference in `Memory/ExperienceLog.md` entry

---

## Using Stored DNA

Before designing additional screens for a project:

1. Check if DNA exists: `Memory/ReferenceDNA/[ProjectName]/`
2. Read the DNA file
3. Apply established tokens, components, interactions
4. Maintain signature move consistency
5. Log any necessary deviations

---

## Modifying DNA

If DNA needs to change mid-project:

1. Document the change in `changelog.md`
2. Update the main `DesignDNA.md`
3. Note which screens may need updates
4. Log in `Memory/ExperienceLog.md`

---

## Handoff

When handing off to Engineering Brain:

1. Include `DesignDNA.md` in handoff packet
2. Highlight any deviations from standard `ComponentSpec.md`
3. Note custom tokens
4. Provide interaction specifications

---

## END OF README
