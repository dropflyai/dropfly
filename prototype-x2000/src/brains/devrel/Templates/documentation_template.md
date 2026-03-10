# Documentation Page Template

## Template Information

| Field | Value |
|-------|-------|
| **Page Type** | [Tutorial / How-To Guide / Reference / Explanation] |
| **Title** | [Clear, descriptive title] |
| **Author** | [Name] |
| **Date** | [YYYY-MM-DD] |
| **Last Updated** | [YYYY-MM-DD] |
| **API Version** | [Version this page covers] |
| **SDK Version** | [Minimum SDK version required] |
| **Difficulty** | [Beginner / Intermediate / Advanced] |
| **Time to Complete** | [Estimated minutes] |

---

## Tutorial Template

Use this template when creating learning-oriented content that takes a developer through a guided experience.

### [Tutorial Title: "Build a [Thing] with [Product]"]

#### What You Will Build

[1-2 sentences describing the end result. Include a screenshot or diagram of the finished product.]

#### What You Will Learn

- [Specific skill or concept 1]
- [Specific skill or concept 2]
- [Specific skill or concept 3]

#### Prerequisites

- [Prerequisite 1, e.g., "Node.js 18 or later installed"]
- [Prerequisite 2, e.g., "A free [Product] account with an API key"]
- [Link to account creation if needed]

**Estimated time:** [X] minutes

---

#### Step 1: [Setup / Installation]

[Brief explanation of what this step accomplishes.]

```bash
# Install the SDK
npm install @company/sdk
```

[Explain what happened after running the command. What should the developer see?]

---

#### Step 2: [Configuration / Initialize]

[Brief explanation of what this step accomplishes.]

```javascript
// Initialize the client
const { Client } = require("@company/sdk");

const client = new Client({
  apiKey: process.env.API_KEY,
});
```

[Explain the key decisions made in this code. Why this configuration?]

---

#### Step 3: [Core Functionality]

[Brief explanation of what this step accomplishes.]

```javascript
// Create your first [resource]
const result = await client.resources.create({
  name: "My First Resource",
  type: "example",
});

console.log("Created:", result.id);
```

**Expected output:**
```
Created: res_abc123
```

[Explain what happened. What was created? Where can they see it?]

---

#### Step 4: [Verification / Next Steps]

[Brief explanation of what this step accomplishes.]

```javascript
// Verify the resource was created
const resource = await client.resources.get(result.id);
console.log("Status:", resource.status);
```

**Expected output:**
```
Status: active
```

---

#### What You Built

[1-2 sentences summarizing what the developer accomplished.]

#### Next Steps

- [Link to more advanced tutorial]
- [Link to relevant how-to guide]
- [Link to API reference for the resources used]

---

## How-To Guide Template

Use this template when providing step-by-step instructions for accomplishing a specific task. Assumes the reader is already familiar with the product.

### How to [Specific Task]

#### Overview

[1-2 sentences: What this guide helps you accomplish and when you would need it.]

#### Prerequisites

- [What must be in place before starting]
- [Required access, permissions, or configuration]

#### Steps

**1. [First action verb phrase]**

```bash
[Command or code]
```

[Brief explanation if non-obvious.]

**2. [Second action verb phrase]**

```bash
[Command or code]
```

[Brief explanation if non-obvious.]

**3. [Third action verb phrase]**

```bash
[Command or code]
```

**4. Verify**

[How to confirm the task was completed successfully.]

#### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|---------|
| [Error message or symptom] | [Why it happens] | [How to fix it] |
| [Error message or symptom] | [Why it happens] | [How to fix it] |

#### Related

- [Link to related how-to guide]
- [Link to relevant reference page]

---

## Reference Template

Use this template for information-oriented pages that describe APIs, parameters, and technical specifications.

### [Resource Name] API Reference

#### Overview

[1-2 sentences describing what this resource is and when you use it.]

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/resources` | Create a new resource |
| GET | `/v1/resources/{id}` | Retrieve a resource |
| PATCH | `/v1/resources/{id}` | Update a resource |
| DELETE | `/v1/resources/{id}` | Delete a resource |
| GET | `/v1/resources` | List all resources |

#### Create a Resource

```
POST /v1/resources
```

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | The resource name (1-255 characters) |
| `type` | string | Yes | Resource type. One of: `example`, `test`, `production` |
| `metadata` | object | No | Arbitrary key-value pairs (max 50 keys) |

**Example Request:**

```bash
curl -X POST https://api.example.com/v1/resources \
  -H "Authorization: Bearer sk_test_abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Resource",
    "type": "example"
  }'
```

```python
resource = client.resources.create(
    name="My Resource",
    type="example"
)
```

```javascript
const resource = await client.resources.create({
  name: "My Resource",
  type: "example",
});
```

**Response:**

```json
{
  "id": "res_abc123",
  "name": "My Resource",
  "type": "example",
  "status": "active",
  "created_at": "2024-03-15T10:30:00Z",
  "metadata": {}
}
```

**Errors:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | `invalid_request` | Missing required parameter or invalid value |
| 401 | `authentication_error` | Invalid or missing API key |
| 429 | `rate_limit_exceeded` | Too many requests. Retry after the time in the `Retry-After` header |

---

## Explanation Template

Use this template for understanding-oriented content that explains concepts, architecture, and design decisions.

### [Concept Name]

#### What is [Concept]?

[2-3 paragraphs explaining the concept at a high level. Use analogies if helpful.]

#### How [Concept] Works

[Technical explanation with diagrams.]

```
[ASCII diagram showing the concept]
```

#### Why We Designed It This Way

[Explain the design decisions and tradeoffs. This is where opinions and rationale belong.]

#### When to Use [Concept]

| Use Case | Recommended Approach | Why |
|----------|---------------------|-----|
| [Scenario 1] | [Approach] | [Rationale] |
| [Scenario 2] | [Approach] | [Rationale] |

#### When NOT to Use [Concept]

[Honest guidance about when this is not the right choice.]

#### Further Reading

- [Link to related concepts]
- [Link to relevant how-to guide]
- [Link to external resource]

---

## Quality Checklist

Before publishing any documentation page:

- [ ] Page is categorized into exactly one Diataxis type
- [ ] All code examples are tested (compile and produce expected output)
- [ ] All links are valid (internal and external)
- [ ] Prerequisites are complete and accurate
- [ ] Expected output is shown for all code examples
- [ ] Technical terms are defined or linked to glossary
- [ ] Page has been reviewed by someone who was not the author
- [ ] Meta description and page title are set for SEO
- [ ] Page is accessible (proper headings, alt text, color contrast)

---

*This template follows the DevRel Brain documentation standards. See `02_documentation/documentation_strategy.md` for strategy and `eval/ReviewChecklist.md` for quality gates.*
