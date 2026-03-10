# Developer Tutorial Template

## Overview

This template provides the structure for a developer tutorial. Tutorials are
learning-oriented content that takes a developer from zero to a working result
through guided steps. Following the Diataxis framework, tutorials teach by
doing — the developer follows explicit steps and achieves a concrete outcome.

**Source:** Derived from Stripe's tutorial structure, Google Codelabs format,
and the Diataxis framework.

---

## Template

```markdown
# Build a [Specific Thing] with [Technology]

**Estimated time:** [X] minutes
**Difficulty:** Beginner | Intermediate | Advanced
**What you will build:** [One sentence describing the end result]

[Screenshot or demo GIF of the completed project]

## Prerequisites

Before starting this tutorial, you need:

- [ ] [Technology] version [X.Y]+ installed ([installation link])
- [ ] A [Platform] account ([signup link] -- free tier is sufficient)
- [ ] An API key (find yours at [dashboard link])
- [ ] Basic familiarity with [language/framework] (no [Platform] experience required)

## What You Will Learn

By the end of this tutorial, you will:

1. [First learning outcome -- specific and verifiable]
2. [Second learning outcome]
3. [Third learning outcome]

---

## Step 1: Set Up Your Project

[Explanation of what this step accomplishes -- 1-2 sentences.]

[Complete terminal command:]

    mkdir my-project && cd my-project
    npm init -y
    npm install example-sdk@3.2.1

[Explanation of what just happened -- 1-2 sentences.]

---

## Step 2: Configure Authentication

[Explanation of what this step accomplishes.]

Create a file named `.env` in your project root:

    EXAMPLE_API_KEY=sk_test_your_api_key_here

[Explanation: where to find the API key, what it does.]

**Important:** Never commit your API key to version control. Add `.env` to
your `.gitignore` file.

---

## Step 3: [First Meaningful Action]

[Explanation of the concept being introduced -- 2-3 sentences maximum.]

Create a file named `index.js`:

    // index.js -- Complete file contents
    require('dotenv').config();
    const Example = require('example-sdk');

    const client = new Example(process.env.EXAMPLE_API_KEY);

    async function main() {
      try {
        const result = await client.resources.create({
          name: 'My First Resource',
          type: 'tutorial-demo',
        });
        console.log('Created resource:', result.id);
      } catch (error) {
        console.error('Error:', error.message);
      }
    }

    main();

Run the code:

    node index.js

**Expected output:**

    Created resource: res_abc123def456

[If the developer does not see this output, explain what might have gone wrong
and how to fix it.]

---

## Step 4: [Second Action -- Building on Step 3]

[Explanation of the new concept.]

Update `index.js` to add the new functionality:

    // index.js -- Complete file contents (updated)
    require('dotenv').config();
    const Example = require('example-sdk');

    const client = new Example(process.env.EXAMPLE_API_KEY);

    async function main() {
      try {
        // Create a resource
        const resource = await client.resources.create({
          name: 'My First Resource',
          type: 'tutorial-demo',
        });
        console.log('Created resource:', resource.id);

        // NEW: List all resources
        const resources = await client.resources.list({ limit: 10 });
        console.log('Total resources:', resources.data.length);

        for (const r of resources.data) {
          console.log(`  - ${r.name} (${r.id})`);
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
    }

    main();

Run the updated code:

    node index.js

**Expected output:**

    Created resource: res_xyz789ghi012
    Total resources: 2
      - My First Resource (res_abc123def456)
      - My First Resource (res_xyz789ghi012)

---

## Step 5: [Final Step -- Completing the Project]

[Explanation.]

[Complete code for the final step -- always show the full file.]

[Run command and expected output.]

---

## What You Built

[Summary of what the developer accomplished -- 2-3 sentences.]

[Final screenshot or output demonstrating the working result.]

## Next Steps

Now that you have a working [thing], you can:

- **[Next tutorial]:** [Brief description] ([link])
- **[How-to guide]:** [Brief description] ([link])
- **[API reference]:** [Brief description] ([link])
- **[Conceptual doc]:** [Brief description] ([link])

## Complete Source Code

The complete source code for this tutorial is available at:
[GitHub repository link]

## Troubleshooting

### "Authentication failed" error
**Cause:** Your API key is invalid or not set.
**Fix:** Verify your API key at [dashboard link] and check that `.env` is in
your project root.

### "Module not found" error
**Cause:** Dependencies are not installed.
**Fix:** Run `npm install` in your project directory.

### [Third common error]
**Cause:** [Explanation]
**Fix:** [Resolution]
```

---

## Usage Notes

1. **Show complete files** -- At every step, show the entire file, not just the
   changed lines.
2. **Test on a clean machine** -- The tutorial must work when followed exactly on
   a fresh environment.
3. **One path only** -- Do not offer alternatives within the tutorial. Language
   tabs are acceptable; architectural alternatives are not.
4. **Include troubleshooting** -- List the top 3 errors developers will encounter.
5. **Link to a repository** -- Every tutorial must have a companion GitHub repository
   with the complete, working code.
6. **State the time** -- Include an estimated completion time in the header.
7. **Test in CI** -- Extract code samples and run them as part of CI.

---

## Testing Protocol

Before publishing, the tutorial must pass:

- [ ] Fresh machine test (follow from Step 1 on clean environment)
- [ ] Peer review (developer who did not write it follows independently)
- [ ] CI test (code examples extracted and tested)
- [ ] Link validation (all internal and external links verified)
- [ ] Content review (spelling, grammar, consistent terminology)

---

**This template implements the standards in `02_documentation/tutorials_and_guides.md`.**
**Reference `05_content/technical_content.md` for writing standards.**
