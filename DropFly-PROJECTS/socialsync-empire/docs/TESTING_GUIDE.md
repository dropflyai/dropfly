# 🧪 Testing Guide - Dual Content System

## ✅ What's Been Built

You now have a complete dual content system with:
- **Educational Content** (existing) - General AI tips, builds authority
- **Product Ads** (NEW) - Direct product marketing, drives conversions

---

## 🎯 How to Test the Product Ads System

### Step 1: Start Your Dashboard

```bash
cd content-dashboard
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000)

### Step 2: Look for the New Buttons

You'll see **TWO ROWS** of buttons in the header:

**Row 1 - Educational Content:**
- 📚 **Educational (10)** - Generates 10 educational posts (existing functionality)
- 🎨 **Generate Media** - Generates media for approved posts (existing)

**Row 2 - Product Ads (NEW!):**
- 🎯 **All Products** (blue) - Generates 1 ad for each of your 5 products (5 ads total)
- **Maya** (orange) - Voice AI Receptionist ad
- **CodeFly** (purple) - Education platform ad
- **HOA** (blue) - Management app ad
- **FitFly** (yellow) - Fitness app ad
- **Content Creator** (pink) - Content automation ad

### Step 3: Generate a Test Product Ad

**Option A: Generate All Products (Recommended for first test)**
1. Click the blue **"🎯 All Products"** button
2. Wait for the success message: "✓ Generated 5 product ad(s)!"
3. Go to your Airtable base
4. Open the **"Product Ads"** table
5. You should see 5 new product ads (one per product)

**Option B: Generate Single Product**
1. Click any individual product button (e.g., **"Maya"**)
2. Wait for success message
3. Check Airtable **"Product Ads"** table
4. You should see 1 new ad for that product

---

## 📊 What to Check in Airtable

### In the "Product Ads" Table:

Each generated ad should have:
- ✅ **Topic** - Compelling headline (e.g., "Never Miss Another Booking: Meet Maya")
- ✅ **Product** - Correct product name (e.g., "Maya - Voice AI Receptionist")
- ✅ **Ad Type** - Feature Demo, Case Study, Before/After, etc.
- ✅ **Content** - 2-4 sentences of product-focused copy
- ✅ **Call to Action** - "Book a Demo", "Start Free Trial", etc.
- ✅ **CTA Link** - URL link (e.g., https://dropfly.ai/maya-demo)
- ✅ **Target Audience** - Specific persona (e.g., "Salon & Spa Owners")
- ✅ **Value Proposition** - Key benefit (e.g., "Never miss revenue from after-hours calls")
- ✅ **Hashtags** - Product-specific hashtags
- ✅ **Post Format** - Carousel, Reel, or Static
- ✅ **Status** - "Ready for Review"

---

## 🔍 What the Product Ads Should Look Like

### Example Maya Ad:

**Topic:** "What Happens When Your Salon Phone Rings at 2am? Maya Answers."

**Content:** "Stop losing bookings to voicemail. Maya is your 24/7 AI receptionist that books appointments even when you're closed. Natural voice conversations, automatic Google Calendar sync, instant email confirmations. View Park salon owner: 'Maya captured $15K in after-hours bookings in 3 months.'"

**Call to Action:** "Book a Demo"

**Target Audience:** "Salon & Spa Owners"

**Value Proposition:** "Never miss revenue from after-hours calls"

**Hashtags:** "#AIReceptionist #SalonTech #NailSalonOwner #BeautyBusiness #MissedCalls"

---

### Example CodeFly Ad:

**Topic:** "120 Students, Zero Coding Experience → 18-Week Transformation"

**Content:** "Give every South LA student access to AI-powered coding education. CodeFly's Coach Nova provides 24/7 personalized tutoring, automated grading, and seamless Moodle integration. $200/student/semester includes complete curriculum, setup, and teacher training. Schools without CS teachers: this is your solution."

**Call to Action:** "Schedule Demo"

**Target Audience:** "School Administrators"

**Value Proposition:** "AI tutor levels the playing field for all students"

**Hashtags:** "#CodingEducation #AITutor #STEMEducation #K12Tech #EdTech"

---

## ✨ Key Differences: Educational vs Product Ads

### Educational Content Characteristics:
- General AI tips and tutorials
- Not product-specific
- Teaches concepts
- No direct CTAs
- Builds authority
- **Example:** "5 Free AI Tools Every Small Business Should Use"

### Product Ad Characteristics:
- Specific product features
- Direct sales messaging
- Clear CTAs and links
- Conversion-focused
- Target audience specified
- **Example:** "Maya Never Misses a Call - Book Your Demo Today"

---

## 🧪 Test Checklist

### Test 1: Generate All Products
- [ ] Click "🎯 All Products" button
- [ ] See success message with count (5 ads)
- [ ] Open Airtable Product Ads table
- [ ] Verify 5 new ads (Maya, CodeFly, HOA, FitFly, Content Creator)
- [ ] Check each ad has all required fields populated
- [ ] Verify CTAs are product-appropriate

### Test 2: Generate Individual Product (Maya)
- [ ] Click "Maya" button
- [ ] See success message (1 ad)
- [ ] Open Airtable Product Ads table
- [ ] Verify 1 new Maya ad
- [ ] Check Target Audience = "Salon & Spa Owners"
- [ ] Verify orange/cyan color theme mentioned in content

### Test 3: Generate Another Individual Product (CodeFly)
- [ ] Click "CodeFly" button
- [ ] See success message
- [ ] Verify ad targets "School Administrators"
- [ ] Check for education/equity language
- [ ] Verify pricing ($200/student/semester) mentioned

### Test 4: Content Quality Check
- [ ] Ad headlines are compelling and specific
- [ ] Content includes LA/South LA references where appropriate
- [ ] No technical jargon (no "Vapi", "Supabase", etc.)
- [ ] CTAs are clear and actionable
- [ ] Value propositions are benefit-focused (not feature-focused)
- [ ] Tone matches product (e.g., friendly for Maya, professional for CodeFly)

---

## 🐛 Troubleshooting

### "Error generating product ads"
**Possible causes:**
- Anthropic API key not set or invalid
- Check `.env.local` has `ANTHROPIC_API_KEY`
- Check browser console for error details

### "Error: Failed to parse product ads"
**Possible causes:**
- Claude returned unexpected format
- Check API response in network tab
- May need to retry generation

### Ads not appearing in Airtable
**Possible causes:**
- Wrong table ID in `.env.local`
- Check `AIRTABLE_PRODUCT_ADS_TABLE_ID=tblB8Lg5kKFBKbWkL`
- Verify Airtable API key has write permissions
- Check you're looking at the correct base (appwjIfxiS3Q9hwIc)

### Buttons disabled/grayed out
**Expected behavior:**
- Buttons disable during generation to prevent duplicate requests
- Wait for success message, then buttons re-enable

---

## 📈 Next Steps After Testing

Once you've verified the system works:

1. **Generate a content mix:**
   - 10 educational posts (📚 Educational button)
   - 5 product ads (🎯 All Products button)
   - This gives you your 70/30 educational/advertising mix

2. **Review in Airtable:**
   - Educational content in "Posts" table
   - Product ads in "Product Ads" table
   - Approve/reject as needed

3. **Generate media:**
   - Use 🎨 Generate Media button for approved content
   - Note: Media generation currently only works for "Posts" table
   - Product ads media workflow needs to be added to n8n separately

4. **Publishing:**
   - Approved content in "Posts" table can be published now
   - Product ads will need separate publishing workflow (future enhancement)

---

## 💡 Pro Tips

**Best Practices:**
- Generate educational content in batches of 10
- Generate product ads individually or all at once (5 total)
- Aim for 70% educational, 30% product ads in your calendar
- Rotate products based on priority (Maya and Content Creator get more frequency)

**Weekly Strategy:**
- Monday: Generate 10 educational posts
- Tuesday: Generate 5 product ads (all products)
- Review and approve throughout the week
- Generate media for approved posts
- Schedule publishing strategically

**Content Quality:**
- Educational posts should teach and add value
- Product ads should sell and include clear CTAs
- Both should maintain your LA/South LA brand voice
- Both should avoid the 10 "content to avoid" categories

---

**Ready to test! Start with the "🎯 All Products" button to see your full product suite in action!**
