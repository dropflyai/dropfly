'use client';

import { ArrowUpRight, Github, Linkedin, Mail, Play, Code2, Zap, Film, Briefcase } from 'lucide-react';

export default function Portfolio() {
  const projects = [
    {
      title: "TradeFly AI",
      category: "Algorithmic Trading Platform",
      description: "Real-time options trading platform with Black-Scholes pricing, technical analysis, and iOS app. Processes 20+ stocks with automated signal generation.",
      tech: ["Python", "Next.js", "Swift", "AWS EC2", "PostgreSQL", "WebSocket"],
      impact: "14,779 lines of production code • iOS App Store • Institutional-grade system",
      metrics: "Built in 6 weeks",
      demoLink: null,
      githubLink: null,
      gallery: [
        "/screenshots/tradefly/live-dashboard.png",
        "/screenshots/tradefly/dashboard-current.png",
        "/screenshots/tradefly/demo-screenshot.png",
      ],
    },
    {
      title: "CodeFly",
      category: "AI-Powered Education Platform",
      description: "Gamified Python curriculum disrupting K-12 CS education. 18-week program with AI tutor (Coach Nova), Black Cipher spy-themed adventure, teacher dashboard with full AI control. 87% completion rate vs 42% industry average - transforming how students learn to code.",
      tech: ["Next.js", "Claude AI", "PostgreSQL", "Supabase", "Gamification", "TypeScript"],
      impact: "4.8★ student rating • 95% teacher confidence • CPALMS-aligned • Deployed to schools",
      metrics: "Built in 8 weeks",
      demoLink: null,
      githubLink: null,
      gallery: [
        "/screenshots/codefly/game-ide.png",
        "/screenshots/codefly/demo-lesson.png",
        "/screenshots/codefly/curriculum.png",
        "/screenshots/codefly/teacher-dashboard.png",
      ],
    },
    {
      title: "LeadFly AI",
      category: "Lead Intelligence Platform",
      description: "Multi-source data enrichment pipeline with AI-powered competitive intelligence. Integrates Apollo, Clay, Clearbit, and Proxycurl APIs.",
      tech: ["Python", "Claude API", "PostgreSQL", "Weaviate", "Redis"],
      impact: "99.2% duplicate detection accuracy • 1000+ leads per batch",
      metrics: "Built in 4 weeks",
      demoLink: null,
      githubLink: null,
      gallery: [
        "/screenshots/leadfly/dashboard.png",
        "/screenshots/leadfly/leads.png",
        "/screenshots/leadfly/analytics.png",
        "/screenshots/leadfly/voice-agent.png",
      ],
    },
    {
      title: "WatermarkRemover",
      category: "AI Video Processing Suite",
      description: "Computer vision-based watermark removal with social media cropper supporting 40+ platforms. Freemium SaaS with cloud storage integration.",
      tech: ["Python", "OpenCV", "FFmpeg", "Next.js", "AWS S3"],
      impact: "5 removal methods • 6 cloud providers • Production SaaS",
      metrics: "Built in 3 weeks",
      demoLink: null,
      githubLink: null,
      gallery: [
        "/screenshots/watermark/home.png",
        "/screenshots/watermark/upload.png",
        "/screenshots/watermark/editor.png",
        "/screenshots/watermark/features.png",
      ],
    },
    {
      title: "PDF Doc Sign",
      category: "PDF Editor & E-Signature Platform",
      description: "Full-featured PDF editor with e-signature, form filling, annotation, and document collaboration. Freemium SaaS with secure cloud storage and team workflows.",
      tech: ["Next.js", "PDF.js", "TypeScript", "Supabase", "Stripe"],
      impact: "Complete PDF toolkit • E-signature legally binding • Multi-user collaboration",
      metrics: "Built in 5 weeks",
      demoLink: null,
      githubLink: null,
      gallery: [
        "/screenshots/pdf-doc-sign/dashboard.png",
        "/screenshots/pdf-doc-sign/editor.png",
        "/screenshots/pdf-doc-sign/signature.png",
        "/screenshots/pdf-doc-sign/documents.png",
      ],
    },
    {
      title: "VoiceFly",
      category: "AI Voice Agent Platform",
      description: "Voice appointment scheduling across multiple industries using Vapi AI and n8n automation workflows.",
      tech: ["Next.js", "Vapi AI", "n8n", "TypeScript"],
      impact: "258 production files • Multi-industry support",
      metrics: "Built in 7 weeks",
      demoLink: null,
      githubLink: null,
      gallery: [
        "/screenshots/voicefly/dashboard.png",
        "/screenshots/voicefly/agents.png",
        "/screenshots/voicefly/analytics.png",
        "/screenshots/voicefly/settings.png",
      ],
    },
    {
      title: "Mobile Apps",
      category: "iOS Applications",
      description: "TradeFly iOS (Swift) and FitFly (React Native) - both deployed to App Store with real users and production infrastructure.",
      tech: ["Swift", "SwiftUI", "React Native", "Expo", "Firebase"],
      impact: "App Store approved • Real users • Push notifications",
      metrics: "Built in 4 weeks each",
      demoLink: null,
      githubLink: null,
      screenshot: null,
    },
    {
      title: "15+ SaaS Products",
      category: "Various Industries",
      description: "TipFly AI, LawFly, HomeFly AI, MathFly, Curriculum Pilot, and more - complete products with auth, payments, and deployment.",
      tech: ["Next.js", "React", "Supabase", "Vercel", "Stripe"],
      impact: "Zero production incidents • Full product lifecycle",
      metrics: "2-5 weeks average",
      demoLink: null,
      githubLink: null,
      screenshot: null,
    },
  ];

  const skills = [
    {
      category: "AI & Automation",
      items: ["Claude Code", "Claude API", "GPT-4", "n8n", "Zapier", "AI Agents", "Workflow Orchestration"]
    },
    {
      category: "Development",
      items: ["Python", "TypeScript", "React", "Next.js 15", "Node.js", "Swift/SwiftUI", "React Native"]
    },
    {
      category: "Infrastructure",
      items: ["AWS (EC2, S3)", "Vercel", "Supabase", "PostgreSQL", "Redis", "Docker", "CI/CD"]
    },
    {
      category: "Creative",
      items: ["Cinematography", "Video Production", "Motion Graphics", "UI/UX Design", "Copywriting"]
    },
    {
      category: "Integration",
      items: ["20+ APIs", "WebSocket", "REST", "Stripe", "Firebase", "Cloud Storage", "Real-time Systems"]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Rio Allen
          </div>
          <div className="flex items-center gap-4">
            <a href="#projects" className="text-sm font-medium hover:text-blue-600 transition-colors hidden md:inline">
              Projects
            </a>
            <a href="#skills" className="text-sm font-medium hover:text-blue-600 transition-colors hidden md:inline">
              Skills
            </a>
            <a href="#contact" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Get in Touch
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-1.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Available for Remote Work
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              AI-Powered Product Builder
            </span>
          </h1>

          <p className="text-2xl md:text-3xl text-slate-600 dark:text-slate-400 mb-8 text-balance max-w-3xl">
            From <span className="text-blue-600 font-semibold">film sets</span> to <span className="text-purple-600 font-semibold">tech products</span>.
            I ship complete applications in <span className="font-semibold text-slate-900 dark:text-white">weeks, not months</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a
              href="#projects"
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              View My Work
              <ArrowUpRight size={20} />
            </a>
            <a
              href="#contact"
              className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              Contact Me
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-1">40+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Production Apps</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-1">3</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Years in Tech</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-1">0</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Production Incidents</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-1">15</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Years in Film</div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Me Different */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">What Makes Me Different</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Not your typical developer. I'm an AI-native builder with a creative background.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-xl flex items-center justify-center mb-4">
                <Zap className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">10x Speed</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Ship complete products in 3-6 weeks using AI agents and automation. What takes teams months, I deliver in weeks.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950 rounded-xl flex items-center justify-center mb-4">
                <Code2 className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Full-Stack Ownership</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Frontend, backend, mobile, infrastructure, testing, deployment, and marketing. I handle the complete product lifecycle.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950 rounded-xl flex items-center justify-center mb-4">
                <Film className="text-orange-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Creative + Technical</h3>
              <p className="text-slate-600 dark:text-slate-400">
                15 years cinematography background. I create demo videos, marketing materials, and understand visual storytelling for UX.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-950 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Business-Minded</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Built products with freemium models, payment integration, and real users. I understand products, not just code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">
            40+ production applications built in 3 years. Here are the highlights.
          </p>

          <div className="grid gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all group"
              >
                {project.gallery && project.gallery.length > 0 && (
                  <div className="relative bg-slate-50 dark:bg-slate-950">
                    <div className="overflow-x-auto scrollbar-hide">
                      <div className="flex gap-2 p-4">
                        {project.gallery.map((screenshot, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="flex-shrink-0 w-80 h-48 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform"
                          >
                            <img
                              src={screenshot}
                              alt={`${project.title} screenshot ${imgIndex + 1}`}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                      {project.gallery.length} screenshots
                    </div>
                  </div>
                )}
                <div className="p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                        {project.category}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {project.description}
                      </p>
                    </div>
                    {project.demoLink && (
                      <a
                        href={project.demoLink}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 self-start"
                      >
                        <Play size={16} />
                        Demo
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Impact</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">{project.impact}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Timeline</div>
                      <div className="text-sm font-bold text-green-600">{project.metrics}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Want to see more? These are just the highlights from 40+ production applications.
            </p>
            <a
              href="https://github.com/dropflyai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Github size={20} />
              View All on GitHub
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-20 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Technical Capabilities</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">
            Modern tech stack with AI-native workflows.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skillGroup, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                <h3 className="text-lg font-bold mb-4 text-blue-600 dark:text-blue-400">
                  {skillGroup.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">IBM Certified in Generative AI</h3>
                <p className="text-blue-100">
                  Professional certification in AI agents, prompt engineering, and practical AI application development.
                </p>
              </div>
              <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl font-bold text-xl whitespace-nowrap">
                Certified ✓
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Journey */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Film → Tech</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-12">
            How a cinematographer became an AI-powered product builder.
          </p>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center text-orange-600 font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">15 Years in Film (2010-2025)</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Professional cinematographer, lighting, editing, and post-production. Worked on film sets, commercials, music videos, and client projects. Learned: visual storytelling, client management, deadline-driven delivery, and creative problem-solving under pressure.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center text-blue-600 font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">The Bet (2023)</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Made a career pivot: "What if I could use AI to build tech products as fast as I could shoot and edit videos?" Started learning with AI assistance - Claude, GPT-4, automation tools. No traditional coding bootcamp, just building real products from day one.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-950 rounded-full flex items-center justify-center text-purple-600 font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">40+ Apps in 3 Years (2023-Present)</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Built production apps across algorithmic trading, AI platforms, video processing, mobile apps, and SaaS products. Got IBM certified in Generative AI. Developed systematic processes for AI-assisted development. Zero production incidents across 15+ deployed applications. Proved that AI-native workflows enable 10x speed without sacrificing quality.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center text-green-600 font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">What's Next</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Looking for remote roles where speed, versatility, and AI-native workflows are valued. Want to join a team, learn from experienced engineers, and contribute to products with real impact. Ideal roles: Solutions Engineer, AI Automation Specialist, Product Engineer, Developer Relations, or Founding Engineer at AI-first startups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Let's Build Something</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Open to remote opportunities: Solutions Engineer, AI Automation Specialist, Product Engineer, Growth Engineer, Developer Relations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="mailto:rio.allen@dropflyai.com"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all hover:scale-105 flex items-center gap-2 shadow-xl"
            >
              <Mail size={20} />
              rio.allen@dropflyai.com
            </a>
            <a
              href="https://www.linkedin.com/in/rioallen"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border-2 border-white/30 flex items-center gap-2"
            >
              <Linkedin size={20} />
              LinkedIn
            </a>
            <a
              href="https://github.com/dropflyai"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border-2 border-white/30 flex items-center gap-2"
            >
              <Github size={20} />
              GitHub
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="font-bold mb-2">Location</h3>
              <p className="text-blue-100">United States (Remote)</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="font-bold mb-2">Availability</h3>
              <p className="text-blue-100">Immediate / 2-week notice</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="font-bold mb-2">Preferred</h3>
              <p className="text-blue-100">Full-time Remote</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-600 dark:text-slate-400">
          <p>© 2026 Rio Allen. Built with Next.js, Tailwind CSS, and AI assistance.</p>
          <p className="mt-2">AI-Powered Product Builder • Former Cinematographer • 40+ Production Apps</p>
        </div>
      </footer>
    </div>
  );
}
