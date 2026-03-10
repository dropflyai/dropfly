# API Reference Template

## Overview

This template provides the structure for a single API endpoint reference page.
Every endpoint in the API must follow this exact structure. Consistency across
all reference pages is non-negotiable — developers learn to navigate one page
and expect all other pages to follow the same pattern.

**Source:** Derived from Stripe API Reference structure and OpenAPI specification
best practices.

---

## Template

```markdown
# [Resource Name] — [Action]

[One sentence description of what this endpoint does.]

## Endpoint

```
[HTTP_METHOD] /v1/[resource]/[action]
```

## Authentication

[Authentication method required. Link to authentication documentation.]

## Request Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The unique identifier for the [resource]. |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 10 | Maximum number of results to return (1-100). |
| `offset` | integer | No | 0 | Number of results to skip for pagination. |
| `expand` | string[] | No | — | Related resources to include in the response. |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | The display name for the resource (1-255 characters). |
| `email` | string | Yes | A valid email address. |
| `metadata` | object | No | Arbitrary key-value pairs for storing additional data. |

### Request Example

```bash
curl -X POST https://api.example.com/v1/resources \
  -H "Authorization: Bearer sk_test_example_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Developer",
    "email": "jane@example.com",
    "metadata": {
      "team": "platform-engineering"
    }
  }'
```

```python
import example_sdk

client = example_sdk.Client(api_key="sk_test_example_key")

resource = client.resources.create(
    name="Jane Developer",
    email="jane@example.com",
    metadata={"team": "platform-engineering"},
)
print(resource.id)
```

```javascript
const Example = require('example-sdk');
const client = new Example('sk_test_example_key');

const resource = await client.resources.create({
  name: 'Jane Developer',
  email: 'jane@example.com',
  metadata: { team: 'platform-engineering' },
});
console.log(resource.id);
```

## Response

### Response Body

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the resource. |
| `object` | string | Always `"resource"`. |
| `name` | string | The display name. |
| `email` | string | The email address. |
| `metadata` | object | The metadata key-value pairs. |
| `created_at` | string (ISO 8601) | When the resource was created. |
| `updated_at` | string (ISO 8601) | When the resource was last updated. |

### Response Example

```json
{
  "id": "res_abc123def456",
  "object": "resource",
  "name": "Jane Developer",
  "email": "jane@example.com",
  "metadata": {
    "team": "platform-engineering"
  },
  "created_at": "2024-01-15T09:30:00Z",
  "updated_at": "2024-01-15T09:30:00Z"
}
```

## Errors

| Status Code | Error Code | Description | Resolution |
|-------------|-----------|-------------|------------|
| 400 | `invalid_request` | Request body is missing required fields. | Check that all required fields are included. |
| 401 | `authentication_failed` | API key is invalid or expired. | Verify your API key in the dashboard. |
| 409 | `duplicate_resource` | A resource with this email already exists. | Use the existing resource or update it. |
| 422 | `validation_error` | One or more fields failed validation. | Check the `errors` array for specific field errors. |
| 429 | `rate_limited` | Too many requests. | Wait and retry using exponential backoff. Check the `Retry-After` header. |
| 500 | `internal_error` | An unexpected error occurred. | Retry the request. If persistent, contact support. |

## Rate Limits

This endpoint is rate-limited to [N] requests per [time period] per API key.
Rate limit headers are included in every response:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests per window. |
| `X-RateLimit-Remaining` | Requests remaining in current window. |
| `X-RateLimit-Reset` | Unix timestamp when the window resets. |

## Related Endpoints

- [List Resources](/api/resources/list) — Retrieve all resources with pagination.
- [Get Resource](/api/resources/get) — Retrieve a single resource by ID.
- [Update Resource](/api/resources/update) — Update an existing resource.
- [Delete Resource](/api/resources/delete) — Delete a resource.

## Changelog

| Date | Change |
|------|--------|
| 2024-01-15 | Endpoint added in API version 2024-01-15. |
```

---

## Usage Notes

1. **Generate from OpenAPI spec** — This template shows the target format; actual
   reference pages should be auto-generated from the API specification.
2. **Include all languages** — Show request examples in at least 3 languages
   (curl, Python, JavaScript/TypeScript).
3. **Use realistic data** — Never use `foo`, `bar`, or `test123` in examples.
4. **Document every error** — Every error code the endpoint can return must be
   documented with a resolution.
5. **Test examples in CI** — Every code example must be extracted and tested.

---

**This template implements the standards in `02_documentation/api_documentation.md`.**
