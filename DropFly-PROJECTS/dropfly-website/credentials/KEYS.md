# API Keys for dropfly-website

## Required Keys

| Variable | Service | Purpose | How to Get |
|----------|---------|---------|------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | Auth - public key | clerk.com dashboard |
| `CLERK_SECRET_KEY` | Clerk | Auth - server key | clerk.com dashboard |
| `STRIPE_PUBLISHABLE_KEY` | Stripe | Payments - public key | stripe.com dashboard |
| `STRIPE_SECRET_KEY` | Stripe | Payments - server key | stripe.com dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook verification | stripe.com → Webhooks |
| `OPENAI_API_KEY` | OpenAI | AI features | platform.openai.com/api-keys |
| `ANTHROPIC_API_KEY` | Anthropic | Claude AI features | console.anthropic.com |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Database connection | Supabase Dashboard → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Public API key | Supabase Dashboard → API |

## Optional Keys

| Variable | Service | Purpose | How to Get |
|----------|---------|---------|------------|
| `VERCEL_API_TOKEN` | Vercel | Deployment automation | vercel.com → Settings → Tokens |
| `AYRSHARE_API_KEY` | Ayrshare | Social media posting | ayrshare.com dashboard |
| `FAL_AI_KEY` | Fal.ai | AI image generation | fal.ai dashboard |

## Clerk Configuration

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | /sign-in |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | /sign-up |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | /dashboard |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | /dashboard |

## Environment-Specific Notes

- **Local**: Use test keys (pk_test_*, sk_test_*)
- **Production**: Keys in Vercel Environment Variables
- **Deployment**: Vercel at dropfly.com

## Last Updated: 2025-12-31
