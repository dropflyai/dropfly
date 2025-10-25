import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import productAdsConfig from '@/config/product-ads.json';
import { getBrandVoice } from '@/lib/brand-voice';

export async function POST(request: Request) {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_PRODUCT_ADS_TABLE_ID = process.env.AIRTABLE_PRODUCT_ADS_TABLE_ID;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  const body = await request.json();
  const {
    product = 'all', // 'maya', 'codefly', 'hoa', 'fitfly', 'contentcreator', or 'all'
    count = 1,
    adType = 'mixed' // 'featureDemo', 'caseStudy', 'pricingOffer', etc., or 'mixed'
  } = body;

  try {
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    // Generate product ad prompt
    const promptContent = generateProductAdPrompt(product, count, adType);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: promptContent
        }
      ]
    });

    // Parse Claude's response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Extract JSON from response
    let productAds;
    try {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      productAds = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse Claude response:', content.text);
      throw new Error('Failed to parse product ads from Claude response');
    }

    // Add product ads to Airtable
    const airtablePromises = productAds.map((ad: any) =>
      fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_PRODUCT_ADS_TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              Topic: ad.Topic,
              Product: ad.Product,
              'Ad Type': ad['Ad Type'],
              Content: ad.Content,
              'Call to Action': ad['Call to Action'],
              'CTA Link': ad['CTA Link'] || '',
              Hashtags: ad.Hashtags,
              'Post Format': ad['Post Format'],
              Tone: ad.Tone || 'Professional',
              'Target Audience': ad['Target Audience'],
              'Value Proposition': ad['Value Proposition'],
              Status: 'Ready for Review',
              'Media Status': 'Pending',
              Platform: ['Instagram'], // Default, can be updated
            },
          }),
        }
      )
    );

    await Promise.all(airtablePromises);

    return NextResponse.json({
      success: true,
      count: productAds.length,
      message: `Successfully generated and added ${productAds.length} product ads to Airtable`,
      productAds,
    });
  } catch (error) {
    console.error('Error generating product ads:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate product ads',
      },
      { status: 500 }
    );
  }
}

function generateProductAdPrompt(productFilter: string, count: number, adType: string): string {
  const brand = getBrandVoice();
  const config = productAdsConfig;

  // Determine which products to generate ads for
  let selectedProducts: any[] = [];

  if (productFilter === 'all') {
    // Generate 1 ad for each product
    selectedProducts = Object.values(config.products);
  } else {
    // Generate ads for specific product
    const product = config.products[productFilter as keyof typeof config.products];
    if (product) {
      selectedProducts = Array(count).fill(product);
    }
  }

  // Build product descriptions
  const productDescriptions = selectedProducts.map(p => {
    return `
PRODUCT: ${p.name}
Target Audience: ${p.targetAudience}
Tagline: "${p.tagline}"
Key Features:
${p.keyFeatures.map((f: string) => `- ${f}`).join('\n')}
Pricing: ${p.pricing}
Value Proposition: ${p.valueProp}
Call to Action: "${p.cta}"
CTA Link: ${p.ctaLink}
Tone: ${config.toneGuidelines[p.id as keyof typeof config.toneGuidelines]}
Hashtags: ${config.hashtagStrategy[p.id as keyof typeof config.hashtagStrategy].join(' ')}
`;
  }).join('\n---\n');

  // Build ad type descriptions
  const adTypeText = adType === 'mixed'
    ? 'Mix of Feature Demos, Case Studies, Before/After scenarios, and Pricing Offers'
    : config.adTypes[adType as keyof typeof config.adTypes]?.description || 'Feature demonstration or case study';

  return `You are an expert copywriter creating PRODUCT ADVERTISING content in proper English for ${brand.company.location} AI automation company.

CRITICAL: Write all content in clear, persuasive, grammatically correct English. No gibberish, no random characters, no nonsense words.

IMPORTANT: This is direct product marketing, NOT educational content. Focus on selling the product.

BRAND IDENTITY:
- Company: ${brand.company.tagline}
- Voice: ${brand.brandVoice.core}
- Location: Inglewood / View Park / South LA

${productDescriptions}

AD TYPE FOCUS: ${adTypeText}

Generate exactly ${selectedProducts.length} product advertising post${selectedProducts.length > 1 ? 's' : ''}.

For each ad, provide:
1. Topic (compelling headline that hooks the target audience)
2. Product (exact product name from list above)
3. Ad Type (Feature Demo, Case Study, Before/After, Pricing Offer, Testimonial, or Walkthrough)
4. Content (2-4 sentences selling the product - focus on benefits, ROI, and transformation)
5. Call to Action (use the CTA from product info above)
6. CTA Link (use the link from product info above)
7. Post Format (Carousel for comparisons/features, Reel for demos/stories, Static for quotes)
8. Target Audience (from the product's target audience above)
9. Value Proposition (key benefit in one punchy line)
10. Hashtags (5-7 relevant hashtags from product's hashtag strategy)

CRITICAL RULES FOR PRODUCT ADS:
- Include specific product features and benefits
- Use real numbers and metrics where possible (hypothetical case studies are OK)
- Always include a clear call to action
- Focus on ROI and transformation (before → after)
- Use LA/South LA examples when relevant
- Make it conversion-focused, not just educational
- Speak directly to the pain points of the target audience

EXAMPLES OF GOOD PRODUCT AD HEADLINES:
- "What Happens When Your Salon Phone Rings at 2am? Maya Answers."
- "120 Students, Zero Coding Experience → 18-Week Transformation with CodeFly"
- "Still Collecting HOA Dues by Check? This Board President Went Digital"
- "$19.99/mo vs $200/Session Trainer: Same Results, 1/10th the Cost"
- "From 2 Posts/Week to 15: How LA Businesses Automate Content"

AVOID:
- Generic educational content (that's for the other content stream)
- Soft-selling or indirect messaging
- Missing or weak calls to action
- Forgetting to mention the actual product name
- Technical jargon that confuses the target audience
- Gibberish, random characters, or non-English words
- Placeholder text like "[insert text]"

QUALITY REQUIREMENTS:
- Use proper English grammar and spelling
- Write complete, persuasive sentences
- Make specific claims with real benefits
- Sound natural and conversational
- Include clear, actionable CTAs

Return ONLY a valid JSON array. No other text before or after.

Example format:
[
  {
    "Topic": "Never Miss Another Booking: Meet Maya, Your 24/7 AI Receptionist",
    "Product": "Maya - Voice AI Receptionist",
    "Ad Type": "Feature Demo",
    "Content": "Stop losing money to voicemail. Maya answers every call, books appointments, and syncs with your Google Calendar automatically. View Park salon owners are capturing thousands in after-hours bookings they used to miss. Setup takes 5 minutes.",
    "Call to Action": "Book a Demo",
    "CTA Link": "https://dropfly.ai/maya-demo",
    "Post Format": "Reel",
    "Target Audience": "Salon & Spa Owners",
    "Value Proposition": "Never miss revenue from after-hours calls",
    "Hashtags": "#AIReceptionist #SalonTech #NailSalonOwner #BeautyBusiness #MissedCalls"
  }
]`;
}
