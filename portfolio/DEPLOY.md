# Deploy Your Portfolio in 5 Minutes

## Step 1: Update Your Info (2 mins)

Open `app/page.tsx` and search/replace:
- `your-email@example.com` → your real email
- `linkedin.com/in/yourprofile` → your LinkedIn username
- `github.com/yourusername` → your GitHub username

## Step 2: Install & Test (1 min)

```bash
cd portfolio
npm install
npm run dev
```

Open http://localhost:3000 - looks good? Continue.

## Step 3: Deploy to Vercel (2 mins)

### Option A: Vercel CLI (Fastest)

```bash
# Install Vercel CLI (one time)
npm install -g vercel

# Deploy
vercel

# Follow prompts (all defaults are fine)
# When done: vercel --prod
```

Your site is live! URL will be shown in terminal.

### Option B: Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Drag the `portfolio` folder into the browser
3. Click "Deploy"
4. Done!

---

## What to Do After Deployment

### 1. Update LinkedIn (CRITICAL)
- Add portfolio URL to "Website" section
- Add to "Featured" section
- Mention in your About section
- Post: "Just launched my portfolio! Check it out: [URL]"

### 2. Update Resume
Add this line:
```
Portfolio: https://your-site.vercel.app
```

### 3. Email Signature
```
Rio Allen
AI Automation Specialist
Portfolio: https://your-site.vercel.app
LinkedIn: https://linkedin.com/in/yourprofile
```

### 4. Job Applications
Include portfolio link in every application and cover letter.

---

## Custom Domain (Optional)

Want `rioallen.com` instead of `your-site.vercel.app`?

1. Buy domain ($10-15/year):
   - Namecheap.com
   - Google Domains
   - Cloudflare

2. In Vercel dashboard:
   - Go to Project → Settings → Domains
   - Add your domain
   - Copy DNS records shown

3. In domain registrar:
   - Add the DNS records
   - Wait 5-60 minutes

4. Done! SSL auto-configured.

---

## Making Updates

After initial deploy, just:

```bash
# Make changes to app/page.tsx
# Then deploy:
vercel --prod
```

Updates are live in ~30 seconds.

---

## Common Questions

**Q: Can I add videos of my projects?**
Yes! Add `.mp4` files to `public/demos/` and embed them. Use your film skills!

**Q: Should I add a photo?**
Optional. Text-based hero is clean and professional. If you want a photo, add it to `public/` and update the hero section.

**Q: What if I don't have demo links?**
That's fine! The projects still showcase what you built. Consider recording 30-second demos (you have film skills!).

**Q: Can recruiters see my portfolio without applying?**
YES! That's the point. Share it everywhere - LinkedIn, resume, email signature, applications.

**Q: Should I add my full address?**
No. "United States (Remote)" is enough.

**Q: How do I add analytics?**
See README.md for Google Analytics setup.

---

## Next Level (After Basic Deploy)

1. **Create Demo Videos** (use your film skills!)
   - 15-30 seconds per project
   - Show the app in action
   - Add voiceover or music
   - Embed in portfolio

2. **Add Case Studies**
   - Pick 2 best projects
   - Write detailed breakdown
   - Show before/after
   - Explain technical decisions

3. **Build in Public**
   - Tweet about your projects
   - LinkedIn posts with portfolio link
   - Show your process

4. **Start a Blog**
   - "How I Built TradeFly in 6 Weeks"
   - "AI-Assisted Development Tips"
   - "Film to Tech: Lessons Learned"

---

## You're Done!

Your portfolio is now:
- ✅ Live on the internet
- ✅ Fast and professional
- ✅ Mobile responsive
- ✅ SEO optimized
- ✅ Ready to send to recruiters

**Now go apply to jobs and include this URL everywhere.**

Good luck! 🚀
