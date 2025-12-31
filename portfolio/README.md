# Rio Allen - Portfolio Website

One-page portfolio showcasing 40+ production applications, film-to-tech journey, and AI-powered development skills.

## Features

- ✅ One-page scrolling design
- ✅ Hero section with availability status
- ✅ Project showcases (6 featured projects)
- ✅ Skills breakdown by category
- ✅ Journey timeline (Film → Tech story)
- ✅ Contact section with email/LinkedIn/GitHub
- ✅ Dark mode support
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Fast loading (static export)
- ✅ SEO optimized

## Quick Start

### 1. Install Dependencies

```bash
cd portfolio
npm install
```

### 2. Customize Your Info

Open `app/page.tsx` and update:

**Line 8-15: Contact Info**
```typescript
href="mailto:your-email@example.com"  // Update email
href="https://linkedin.com/in/yourprofile"  // Update LinkedIn
href="https://github.com/yourusername"  // Update GitHub
```

**Projects Section (line 10-80):**
- Add `demoLink` URLs if you have live demos
- Add `githubLink` URLs for public repos
- Update project descriptions as needed

**GitHub Link (line 289):**
```typescript
href="https://github.com/yourusername"  // Update username
```

**Contact Section (line 541-545):**
Update all email/LinkedIn/GitHub links

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
```

Creates static export in `out/` folder.

## Deploy to Vercel (Recommended)

### Option 1: Vercel CLI (Fastest)

```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Deploy from portfolio directory
cd portfolio
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - What's your project's name? rio-allen-portfolio
# - In which directory is your code located? ./
# - Want to modify settings? No

# After first deploy, future deploys:
vercel --prod
```

Your site will be live at: `https://rio-allen-portfolio.vercel.app` (or custom domain)

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository (or drag/drop the `portfolio` folder)
4. Vercel auto-detects Next.js
5. Click "Deploy"

Done! Live in ~2 minutes.

## Customization Guide

### Update Your Photo/Avatar

Currently uses text-based hero. To add a photo:

1. Add image to `public/` folder (e.g., `public/profile.jpg`)
2. In `app/page.tsx`, add image in hero section:

```jsx
<div className="flex items-center gap-8">
  <img
    src="/profile.jpg"
    alt="Rio Allen"
    className="w-32 h-32 rounded-full border-4 border-blue-600"
  />
  <div>
    <h1>...</h1>
  </div>
</div>
```

### Add Project Screenshots

1. Add images to `public/projects/` folder
2. Update project objects in `app/page.tsx`:

```typescript
{
  title: "TradeFly AI",
  image: "/projects/tradefly.png",  // Add this
  // ... rest of project
}
```

3. Update project card JSX to show image:

```jsx
{project.image && (
  <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
)}
```

### Add Demo Videos

Instead of screenshots, embed videos:

```jsx
<video autoPlay loop muted playsInline className="w-full rounded-lg">
  <source src="/demos/tradefly-demo.mp4" type="video/mp4" />
</video>
```

Use your film skills to create 15-30 second demos of each project!

### Change Colors

Update the color scheme in `app/page.tsx`:

- Replace `blue-600` with your preferred color
- Replace `purple-600` with your accent color
- Tailwind colors: slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose

### Add Resume Download

Add button in contact section:

```jsx
<a
  href="/Rio_Allen_Resume.pdf"
  download
  className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center gap-2"
>
  <Download size={20} />
  Download Resume
</a>
```

Place PDF in `public/` folder.

## SEO & Metadata

Already configured in `app/layout.tsx`:
- Title: "Rio Allen - AI Automation Specialist & Product Builder"
- Description for search engines
- Open Graph tags for social media sharing

To customize, edit `app/layout.tsx` metadata object.

## Analytics (Optional)

### Add Google Analytics

1. Get GA4 tracking ID from Google Analytics
2. Install package:
```bash
npm install @next/third-parties
```

3. Add to `app/layout.tsx`:
```typescript
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

## Custom Domain

After deploying to Vercel:

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `rioallen.com`)
3. Update DNS records as instructed by Vercel
4. Done! SSL certificate auto-generated.

## Performance

Current setup is optimized for speed:
- ✅ Static export (no server needed)
- ✅ Tailwind CSS (minimal CSS)
- ✅ No heavy libraries
- ✅ Fast page loads (<1s)

**Lighthouse Score Target:** 95+ on all metrics

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build fails
Check for TypeScript errors:
```bash
npm run lint
```

### Dark mode not working
Clear browser cache and refresh.

### Icons not showing
Lucide-react should be installed. If missing:
```bash
npm install lucide-react
```

## Next Steps After Deployment

1. ✅ Share link on LinkedIn (update your profile)
2. ✅ Add to email signature
3. ✅ Include in job applications
4. ✅ Add to GitHub profile README
5. ✅ Share with your network

## Making It Even Better

### Add a Blog Section
Create `/app/blog/page.tsx` for technical writing (great for dev rel roles)

### Add Testimonials
If you have client feedback, add a testimonials section

### Add Case Studies
Deep dives into 2-3 projects showing your process

### Create Demo Videos
Use your film skills! 30-second project walkthroughs

### Build in Public
Add a "Now" page showing current projects

## File Structure

```
portfolio/
├── app/
│   ├── globals.css          # Styles
│   ├── layout.tsx            # SEO metadata
│   └── page.tsx              # Main portfolio page (UPDATE THIS)
├── public/                   # Add images, PDFs, videos here
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── README.md                 # This file
```

## Support

Questions? Issues? Check:
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vercel Deployment Docs](https://vercel.com/docs)

## Credits

Built with:
- Next.js 15
- Tailwind CSS 4
- Lucide Icons
- TypeScript

Design philosophy: Clear, fast, conversion-focused. No fluff.

---

**Remember:** This portfolio represents you. Update it with YOUR real info, YOUR real projects, and YOUR personality. Make it yours!
