# MCP Governance — Tool Usage Rules

This document governs how the Design Brain uses MCP (Model Context Protocol) tools for image analysis and other capabilities.

---

## Purpose

Define clear rules for when and how external tools can be used, ensuring:
- Transparency about tool usage
- No false claims about capabilities
- Proper logging of tool outputs
- Consistent behavior

---

## Image Analysis Rules

### When Image Analysis Tools Can Be Used

| Condition | Tool Usage Allowed |
|-----------|-------------------|
| User uploads image(s) | YES |
| User provides image URL(s) | YES |
| User describes image verbally | NO — ask for actual image |
| No image provided | NO — do not claim to have seen anything |

### Before Using Image Tools

1. **State the tool being used**
   - "I'll analyze this image using [tool name]"
   - "Let me examine the screenshot with [tool name]"

2. **State what will be extracted**
   - "I'll look at the layout, typography, and color system"
   - "I'll identify the component patterns and spacing"

3. **Acknowledge limitations**
   - If image is low resolution: "Image quality may limit detail extraction"
   - If image is partial: "I can only analyze what's visible in this crop"

### After Using Image Tools

1. **Report findings honestly**
   - Only describe what was actually observed
   - Use "UNCLEAR" or "NOT VISIBLE" for uncertain elements
   - Never fill gaps with assumptions

2. **Log to Memory**
   - Save analysis output to `Memory/ReferenceDNA/[Project]/`
   - Include date and source reference

---

## No-Hallucination Rule (Absolute)

### What's Prohibited

| Claim Type | Prohibition |
|------------|-------------|
| "I can see that..." | Only if image was actually provided and analyzed |
| Specific hex colors | Only if tool extracted them, otherwise describe |
| Exact font names | Only if identifiable, otherwise describe style |
| Specific pixel values | Only if measurable, otherwise use ranges |
| Brand identification | Only if clearly visible, otherwise "appears to be" |

### Safe Language Patterns

| Instead of | Say |
|------------|-----|
| "The font is Inter" | "The font appears to be a geometric sans-serif, possibly Inter or similar" |
| "The blue is #3B82F6" | "The primary blue is a medium-saturation blue, approximately in the Tailwind blue-500 range" |
| "The spacing is 16px" | "The spacing appears to follow an 8px base unit, with approximately 16px between elements" |

---

## Tool Availability Handling

### If Tool Access Is Available

```
1. Acknowledge: "I'll use [tool] to analyze this"
2. Execute: Run the tool
3. Report: Share findings with confidence levels
4. Log: Save to Memory
```

### If Tool Access Is Unavailable

```
1. Acknowledge: "I don't have access to image analysis tools right now"
2. Request: "Please describe what you see, or I can provide guidance based on description"
3. Alternative: Offer to analyze if user can provide text description of key elements
```

### Never

- Claim to have analyzed an image without tool access
- Invent details that weren't extracted
- Pretend tool failure didn't happen

---

## MCP Tools Reference

### Image Analysis Tools (When Available)

| Tool | Purpose | Output |
|------|---------|--------|
| Vision/describe | General image description | Text description |
| Vision/extract | Structured data extraction | JSON or structured output |
| OCR tools | Text extraction from images | Extracted text |

### 3D/Game Tools (Reference: `3D-GameDev/`)

| Tool | Purpose | Governance |
|------|---------|------------|
| Blender MCP | 3D modeling control | See `3D-GameDev/BlenderWorkflow.md` |
| Unity MCP | Unity project control | See `3D-GameDev/UnityWorkflow.md` |
| Unreal MCP | Unreal project control | See `3D-GameDev/UnrealWorkflow.md` |

---

## Logging Requirements

### What to Log

Every tool usage must be logged with:

```markdown
### [YYYY-MM-DD] Tool Usage Log

**Tool:** [tool name]
**Purpose:** [what was being extracted/analyzed]
**Input:** [description of input, link if URL]
**Output Summary:** [key findings]
**Confidence:** [HIGH / MEDIUM / LOW]
**Limitations:** [any issues or unclear areas]
**Saved to:** [Memory location]
```

### Where to Log

| Output Type | Location |
|-------------|----------|
| Reference analysis | `Memory/ReferenceDNA/[Project]/` |
| Style extraction | `Memory/StyleDecisions.md` |
| General tool usage | `Memory/ExperienceLog.md` |

---

## Error Handling

### Tool Fails to Execute

1. Acknowledge: "The [tool] didn't return results"
2. Diagnose: Check if image format/URL is accessible
3. Retry: If appropriate, try alternative approach
4. Fallback: Ask user for description or alternative input

### Tool Returns Partial Results

1. Acknowledge: "I was able to extract [X] but not [Y]"
2. Report: Share what was successfully extracted
3. Note: Mark unclear areas in output
4. Proceed: Work with available information

### Tool Returns Unexpected Results

1. Flag: "The analysis returned unexpected results"
2. Show: Share the raw output for user review
3. Verify: Ask user to confirm if results seem accurate
4. Adjust: Revise interpretation based on feedback

---

## Transparency Statements

Use these templates for clarity:

**Tool being used:**
> "I'm using [tool name] to analyze this image. I'll extract [layout/typography/colors/etc]."

**Tool limitations:**
> "Note: My analysis is based on what's visible in the image. Some details may be approximate."

**No tool access:**
> "I don't have direct image analysis available. Based on your description, [proceed with guidance]."

**Uncertain extraction:**
> "I extracted [X], but [Y] was unclear from the reference. Should I proceed with assumptions or do you have additional references?"

---

## Cross-References

- Reference intake: `ReferenceLab/ReferenceIntake.md`
- Visual extraction: `ReferenceLab/VisualTeardownSchema.md`
- Design DNA output: `ReferenceLab/DesignDNA.md`
- 3D tools: `3D-GameDev/MCPSetupGuide.md`
- Memory: `Memory/ExperienceLog.md`

---

## END OF MCP GOVERNANCE
