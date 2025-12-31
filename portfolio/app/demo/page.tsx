'use client';

import { ArrowUpRight, Github, Linkedin, Mail, Play, Code2, Zap, Film, Briefcase, ArrowRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Hero Project Component (Smooth Inline Carousel)
function ProjectShowcase({ title, category, description, tech, weeks, impact, screenshots, featured }: any) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play slideshow when hovered
  useEffect(() => {
    if (!isHovered || screenshots.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % screenshots.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, screenshots.length]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImage(0);
      }}
    >
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-amber-500/30 hover:border-amber-500 transition-all overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/20">
        {/* Large Hero Image */}
        <div className="aspect-[21/9] bg-slate-950 relative overflow-hidden">
          <img
            src={screenshots[currentImage]}
            alt={title}
            className="w-full h-full object-cover object-top transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-4xl">
              <div className="text-cyan-400 text-sm font-bold mb-2 uppercase tracking-wider">{category}</div>
              <h3 className="text-5xl font-bold text-white mb-4">{title}</h3>
              <p className="text-xl text-slate-300 mb-6 max-w-3xl leading-relaxed">{description}</p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tech.map((t: string) => (
                  <span key={t} className="px-4 py-2 bg-slate-950/80 backdrop-blur-sm text-cyan-400 rounded-lg text-sm border border-cyan-500/30 font-medium">
                    {t}
                  </span>
                ))}
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-8 text-sm">
                <div>
                  <div className="text-slate-500 uppercase tracking-wider mb-1">Build Time</div>
                  <div className="text-amber-500 font-bold text-2xl">{weeks} weeks</div>
                </div>
                <div className="h-12 w-px bg-slate-700"></div>
                <div>
                  <div className="text-slate-500 uppercase tracking-wider mb-1">Impact</div>
                  <div className="text-white font-bold text-lg">{impact}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hover Indicator */}
          {screenshots.length > 1 && (
            <div className="absolute top-4 right-4 px-4 py-2 bg-amber-500/90 backdrop-blur-sm text-slate-900 rounded-lg text-sm font-bold">
              {isHovered ? `${currentImage + 1}/${screenshots.length}` : `${screenshots.length} screenshots`}
            </div>
          )}
        </div>

        {/* Thumbnail Strip (shows on hover) */}
        {isHovered && screenshots.length > 1 && (
          <div className="bg-slate-950 p-4 border-t border-amber-500/30 animate-in slide-in-from-bottom duration-200">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {screenshots.map((screenshot: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentImage ? 'border-amber-500 scale-105' : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <img src={screenshot} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Secondary Project Card (Smooth Inline Expansion)
function ProjectCard({ title, category, description, tech, weeks, impact, screenshots }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // Auto-play slideshow when expanded
  useEffect(() => {
    if (!isExpanded || screenshots.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % screenshots.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [isExpanded, screenshots.length]);

  return (
    <div
      className={`relative transition-all duration-300 ${
        isExpanded ? 'md:col-span-2 md:row-span-2 z-50' : ''
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        setCurrentImage(0);
      }}
    >
      <div className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 hover:border-cyan-500/60 transition-all overflow-hidden ${
        isExpanded ? 'shadow-2xl shadow-cyan-500/20' : ''
      }`}>
        {/* Collapsed State - Compact */}
        {!isExpanded && (
          <div className="relative">
            <div className="aspect-video bg-slate-950 relative overflow-hidden">
              <img
                src={screenshots[0]}
                alt={title}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-amber-500 text-xs font-bold uppercase mb-1">{category}</div>
                <div className="text-white text-lg font-bold mb-2">{title}</div>
                <div className="text-slate-400 text-xs mb-3 line-clamp-2">{description}</div>

                <div className="flex items-center justify-between text-xs">
                  <div className="text-amber-500 font-bold">{weeks} weeks</div>
                  <div className="text-slate-500">{screenshots.length} screenshots</div>
                </div>
              </div>

              {/* Hover Hint */}
              <div className="absolute top-2 right-2 px-3 py-1 bg-cyan-500/90 backdrop-blur-sm text-slate-900 rounded-lg text-xs font-bold">
                Hover to expand
              </div>
            </div>
          </div>
        )}

        {/* Expanded State - Inline Carousel */}
        {isExpanded && (
          <div className="p-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">{category}</div>
                <h3 className="text-white text-2xl font-bold mb-2">{title}</h3>
                <p className="text-slate-400 text-sm mb-3">{description}</p>
              </div>
              {screenshots.length > 1 && (
                <div className="text-slate-400 text-sm whitespace-nowrap ml-4">
                  {currentImage + 1}/{screenshots.length}
                </div>
              )}
            </div>

            {/* Large Image Display */}
            <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden mb-4 relative">
              <img
                src={screenshots[currentImage]}
                alt={`${title} screenshot ${currentImage + 1}`}
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Thumbnails */}
            {screenshots.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {screenshots.map((screenshot: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`flex-shrink-0 w-20 h-12 rounded overflow-hidden border-2 transition-all ${
                      idx === currentImage ? 'border-cyan-500' : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <img src={screenshot} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tech.map((t: string) => (
                <span key={t} className="px-2 py-1 bg-slate-950 text-cyan-400 rounded text-xs border border-cyan-500/30">
                  {t}
                </span>
              ))}
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-6 text-xs pt-4 border-t border-slate-700">
              <div>
                <div className="text-slate-500 uppercase mb-1">Build Time</div>
                <div className="text-amber-500 font-bold">{weeks} weeks</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase mb-1">Impact</div>
                <div className="text-white font-bold">{impact}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DemoPortfolio() {
  const [countApps, setCountApps] = useState(0);
  const [countYears, setCountYears] = useState(0);
  const [countIncidents, setCountIncidents] = useState(0);
  const [countFilm, setCountFilm] = useState(0);

  useEffect(() => {
    // Animated count-up for stats
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCountApps(Math.floor(40 * progress));
      setCountYears(Math.floor(3 * progress));
      setCountIncidents(0); // Always 0
      setCountFilm(Math.floor(15 * progress));

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const projects = [
    {
      title: "TradeFly AI",
      category: "Algorithmic Trading Platform",
      description: "Real-time options trading platform with Black-Scholes pricing, technical analysis, and iOS app.",
      tech: ["Python", "Next.js", "Swift", "AWS", "PostgreSQL"],
      impact: "14,779 lines • iOS App Store • Institutional-grade",
      weeks: 6,
      screenshot: "/screenshots/tradefly/live-dashboard.png",
    },
    {
      title: "CodeFly",
      category: "AI-Powered Education Platform",
      description: "Gamified Python curriculum with 87% completion rate vs 42% industry average.",
      tech: ["Next.js", "Claude AI", "PostgreSQL", "Supabase"],
      impact: "4.8★ rating • 95% teacher confidence • Deployed to schools",
      weeks: 8,
      screenshot: "/screenshots/codefly/game-ide.png",
    },
    {
      title: "LeadFly AI",
      category: "Lead Intelligence Platform",
      description: "Multi-source data enrichment pipeline with AI-powered competitive intelligence.",
      tech: ["Python", "Claude API", "PostgreSQL", "Weaviate"],
      impact: "99.2% accuracy • 1000+ leads per batch",
      weeks: 4,
      screenshot: "/screenshots/leadfly/dashboard.png",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950">
      {/* Film Countdown Animation */}
      <div className="fixed top-8 right-8 z-50">
        <div className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg text-sm font-bold shadow-xl">
          🎬 DEMO MODE
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">
            <span className="text-white">Rio</span>
            <span className="text-amber-500">Allen</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm font-medium text-slate-300 hover:text-amber-500 transition-colors">
              ← Back to Original
            </a>
            <a href="#projects" className="text-sm font-medium text-slate-300 hover:text-amber-500 transition-colors">
              Projects
            </a>
            <a href="#contact" className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg text-sm font-bold hover:bg-amber-400 transition-all hover:scale-105">
              Hire Me
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section - Asymmetric Layout */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_300px] gap-12 items-start">
            {/* Left: Main Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full text-sm font-medium mb-6">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                Available for Remote Work
              </div>

              <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
                <span className="text-white">AI-Powered</span>
                <br />
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                  Product Builder
                </span>
              </h1>

              <p className="text-2xl md:text-3xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
                From <span className="text-amber-500 font-bold">film sets</span> to{' '}
                <span className="text-cyan-400 font-bold">tech products</span>.
                <br />
                I ship in <span className="text-white font-bold">weeks</span>, not months.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#projects"
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 rounded-xl font-bold hover:from-amber-400 hover:to-orange-400 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-2xl shadow-amber-500/30"
                >
                  View My Work
                  <ArrowRight size={20} />
                </a>
                <a
                  href="#contact"
                  className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all border-2 border-amber-500/30 flex items-center justify-center gap-2"
                >
                  <Mail size={20} />
                  Contact Me
                </a>
              </div>
            </div>

            {/* Right: Stats (Vertical, Asymmetric) */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all">
                <div className="text-6xl font-bold text-amber-500 mb-2">{countApps}+</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider">Production Apps</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                <div className="text-6xl font-bold text-cyan-400 mb-2">{countYears}</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider">Years Shipping</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all group cursor-pointer">
                <div className="text-7xl font-bold text-green-400 mb-2">{countIncidents}</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider">Prod Incidents</div>
                <div className="mt-2 text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  🟢 100% uptime record
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-orange-500/20 hover:border-orange-500/40 transition-all">
                <div className="text-6xl font-bold text-orange-400 mb-2">{countFilm}</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider">Years in Film</div>
              </div>
            </div>
          </div>

          {/* Film Strip Timeline */}
          <div className="mt-16 pt-12 border-t border-amber-500/20">
            <h3 className="text-amber-500 font-bold mb-6 uppercase tracking-wider text-sm">The Journey</h3>
            <div className="relative">
              {/* Timeline Bar */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-cyan-500"></div>

              {/* Timeline Frames */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 border-2 border-orange-500 rounded-lg flex items-center justify-center relative z-10">
                    <Film size={32} className="text-orange-500" />
                  </div>
                  <div className="text-white font-bold mb-1">2010-2023</div>
                  <div className="text-slate-400 text-sm">15 Years Film</div>
                </div>

                <div className="text-center relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-amber-500/20 border-2 border-amber-500 rounded-lg flex items-center justify-center relative z-10">
                    <Zap size={32} className="text-amber-500" />
                  </div>
                  <div className="text-white font-bold mb-1">2023</div>
                  <div className="text-slate-400 text-sm">The Pivot</div>
                </div>

                <div className="text-center relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/20 border-2 border-cyan-500 rounded-lg flex items-center justify-center relative z-10">
                    <Code2 size={32} className="text-cyan-500" />
                  </div>
                  <div className="text-white font-bold mb-1">2023-2025</div>
                  <div className="text-slate-400 text-sm">40+ Apps Built</div>
                </div>

                <div className="text-center relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 border-2 border-green-500 rounded-lg flex items-center justify-center relative z-10 animate-pulse">
                    <Briefcase size={32} className="text-green-500" />
                  </div>
                  <div className="text-white font-bold mb-1">Now</div>
                  <div className="text-slate-400 text-sm">Seeking Remote Role</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Speed Comparison Section */}
      <section className="py-20 px-6 bg-slate-950/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">How Long Does It Take?</h2>
          <p className="text-slate-400 text-center mb-12">Industry average vs. AI-native workflow</p>

          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 font-medium">Traditional Team</span>
                <span className="text-slate-500 font-bold">6 months</span>
              </div>
              <div className="h-12 bg-slate-800 rounded-lg overflow-hidden">
                <div className="h-full bg-gradient-to-r from-slate-600 to-slate-500 w-full flex items-center px-4 text-slate-900 font-bold">
                  Plan → Design → Dev → Test → Deploy
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-amber-500 font-bold">Rio + AI</span>
                <span className="text-amber-500 font-bold">6 weeks</span>
              </div>
              <div className="h-12 bg-slate-800 rounded-lg overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 w-1/4 flex items-center px-4 text-slate-900 font-bold shadow-xl shadow-amber-500/50 relative">
                  All Phases ✓
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-cyan-400 font-bold text-xl">Same quality. 10x faster.</p>
          </div>
        </div>
      </section>

      {/* Projects - Progressive Disclosure with Hover Carousel */}
      <section id="projects" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">Featured Work</h2>
          <p className="text-slate-400 mb-12">
            Hover any project to see screenshots. 40+ production apps built in 3 years.
          </p>

          {/* ONE Dominant Hero Project (70% attention) */}
          <ProjectShowcase
            title="TradeFly AI"
            category="Algorithmic Trading Platform"
            description="Real-time options trading with Black-Scholes pricing, technical analysis, and iOS app. Institutional-grade infrastructure processing 20+ stocks with automated signal generation."
            tech={["Python", "Next.js", "Swift", "AWS EC2", "PostgreSQL", "WebSocket"]}
            weeks={6}
            impact="14,779 lines • iOS App Store • Zero downtime"
            screenshots={[
              "/screenshots/tradefly/live-dashboard.png",
              "/screenshots/tradefly/dashboard-current.png",
              "/screenshots/tradefly/demo-screenshot.png",
            ]}
            featured
          />

          {/* Secondary Projects Grid (ALL projects shown) */}
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectCard
              title="CodeFly"
              category="AI Education Platform"
              description="Gamified Python curriculum with 87% completion vs 42% industry average. AI tutor, spy-themed adventure, deployed to schools."
              tech={["Next.js", "Claude AI", "PostgreSQL", "Supabase"]}
              weeks={8}
              impact="4.8★ • 95% teacher confidence"
              screenshots={[
                "/screenshots/codefly/game-ide.png",
                "/screenshots/codefly/demo-lesson.png",
                "/screenshots/codefly/curriculum.png",
                "/screenshots/codefly/teacher-dashboard.png",
              ]}
            />
            <ProjectCard
              title="LeadFly AI"
              category="Lead Intelligence"
              description="Multi-source data enrichment with AI competitive intelligence. Apollo, Clay, Clearbit, Proxycurl APIs."
              tech={["Python", "Claude API", "PostgreSQL", "Weaviate"]}
              weeks={4}
              impact="99.2% accuracy • 1000+ leads/batch"
              screenshots={[
                "/screenshots/leadfly/dashboard.png",
                "/screenshots/leadfly/leads.png",
                "/screenshots/leadfly/analytics.png",
                "/screenshots/leadfly/voice-agent.png",
              ]}
            />
            <ProjectCard
              title="WatermarkRemover"
              category="AI Video Processing"
              description="Computer vision watermark removal with social media cropper for 40+ platforms. Freemium SaaS."
              tech={["Python", "OpenCV", "FFmpeg", "Next.js", "AWS S3"]}
              weeks={3}
              impact="5 algorithms • 6 cloud providers"
              screenshots={[
                "/screenshots/watermark/home.png",
                "/screenshots/watermark/upload.png",
                "/screenshots/watermark/editor.png",
                "/screenshots/watermark/features.png",
              ]}
            />
            <ProjectCard
              title="PDF Doc Sign"
              category="PDF Editor & E-Signature"
              description="Full-featured PDF editor with legally binding e-signature, form filling, annotation, and team collaboration."
              tech={["Next.js", "PDF.js", "TypeScript", "Supabase", "Stripe"]}
              weeks={5}
              impact="Complete PDF toolkit • Multi-user"
              screenshots={[
                "/screenshots/pdf-doc-sign/dashboard.png",
                "/screenshots/pdf-doc-sign/editor.png",
                "/screenshots/pdf-doc-sign/signature.png",
                "/screenshots/pdf-doc-sign/documents.png",
              ]}
            />
            <ProjectCard
              title="VoiceFly"
              category="AI Voice Agents"
              description="Voice appointment scheduling across industries using Vapi AI and n8n automation workflows."
              tech={["Next.js", "Vapi AI", "n8n", "TypeScript"]}
              weeks={7}
              impact="258 files • Multi-industry"
              screenshots={[
                "/screenshots/voicefly/dashboard.png",
                "/screenshots/voicefly/agents.png",
                "/screenshots/voicefly/analytics.png",
                "/screenshots/voicefly/settings.png",
              ]}
            />
            <ProjectCard
              title="Mobile Apps"
              category="iOS Applications"
              description="TradeFly iOS (Swift) and FitFly (React Native) - App Store approved with real users and production infrastructure."
              tech={["Swift", "SwiftUI", "React Native", "Expo", "Firebase"]}
              weeks={4}
              impact="App Store • Push notifications"
              screenshots={[
                "/screenshots/tradefly/live-dashboard.png",
              ]}
            />
            <ProjectCard
              title="SocialSync"
              category="Social Media Management"
              description="Multi-platform social media scheduler and analytics. Schedule posts, track engagement, manage multiple accounts from one dashboard."
              tech={["Next.js", "React", "PostgreSQL", "OAuth", "Vercel"]}
              weeks={5}
              impact="Multi-platform • Scheduled posts"
              screenshots={[
                "/screenshots/socialsync/dashboard.png",
                "/screenshots/socialsync/schedule.png",
                "/screenshots/socialsync/analytics.png",
                "/screenshots/socialsync/accounts.png",
              ]}
            />
            <ProjectCard
              title="LawFly Pro"
              category="Legal Practice Management"
              description="Case management, client portal, document automation, and billing for law firms. Streamlines legal workflows end-to-end."
              tech={["Next.js", "TypeScript", "Supabase", "Stripe", "PDF.js"]}
              weeks={6}
              impact="Case management • Client portal"
              screenshots={[
                "/screenshots/lawfly/dashboard.png",
                "/screenshots/lawfly/cases.png",
                "/screenshots/lawfly/clients.png",
                "/screenshots/lawfly/billing.png",
              ]}
            />
            <ProjectCard
              title="10+ More SaaS Products"
              category="Various Industries"
              description="TipFly AI, HomeFly AI, MathFly, Curriculum Pilot, and more. Complete products with auth, payments, deployment."
              tech={["Next.js", "React", "Supabase", "Vercel", "Stripe"]}
              weeks={3}
              impact="Zero incidents • Full lifecycle"
              screenshots={[
                "/screenshots/codefly/game-ide.png",
              ]}
            />
          </div>

          {/* Next Action (Clear and Prominent) */}
          <div className="mt-16 text-center border-t border-amber-500/20 pt-12">
            <p className="text-slate-400 mb-6 text-lg">
              Ready to ship fast? Let's talk.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 rounded-xl font-bold text-lg hover:from-amber-400 hover:to-orange-400 transition-all hover:scale-105 shadow-2xl shadow-amber-500/30"
            >
              Hire Me
              <ArrowRight size={24} />
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">Let's Build Something</h2>
          <p className="text-xl text-amber-100 mb-12 max-w-2xl mx-auto">
            Open to remote opportunities: Solutions Engineer, AI Automation, Product Engineer, DevRel.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:rio.allen@dropflyai.com"
              className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all hover:scale-105 flex items-center gap-2 shadow-2xl"
            >
              <Mail size={20} />
              rio.allen@dropflyai.com
            </a>
            <a
              href="https://www.linkedin.com/in/rioallen"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-all border-2 border-white/40 flex items-center gap-2"
            >
              <Linkedin size={20} />
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-950 border-t border-amber-500/20">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-400">
          <p className="text-amber-500 font-bold mb-2">🎬 This is a demo of the redesigned portfolio</p>
          <p>© 2026 Rio Allen. Built with Next.js, Tailwind CSS, and AI assistance.</p>
        </div>
      </footer>
    </div>
  );
}
