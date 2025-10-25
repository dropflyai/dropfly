"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Cpu,
  Zap,
  Film,
  Layers,
  Bot,
  Palette,
  Volume2,
  Eye,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AIStudio() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  const aiServices = [
    {
      icon: Brain,
      title: "Neural Scene Generation",
      description: "Create entire cinematic worlds from text prompts using advanced AI models",
      features: [
        "Text-to-scene generation",
        "Real-time environment creation",
        "Photorealistic rendering",
        "Infinite variations"
      ]
    },
    {
      icon: Bot,
      title: "AI Actor Synthesis",
      description: "Generate digital humans indistinguishable from real actors",
      features: [
        "Digital twin creation",
        "Emotion synthesis",
        "Lip-sync automation",
        "Age & appearance modification"
      ]
    },
    {
      icon: Palette,
      title: "Intelligent Color Grading",
      description: "AI-powered color science that adapts to mood and narrative",
      features: [
        "Scene-aware grading",
        "Style transfer",
        "Automated masking",
        "Real-time preview"
      ]
    },
    {
      icon: Volume2,
      title: "Sonic AI Design",
      description: "Generate immersive soundscapes and original scores with AI",
      features: [
        "Adaptive music composition",
        "Foley generation",
        "Voice synthesis",
        "Spatial audio design"
      ]
    },
    {
      icon: Layers,
      title: "Deep Compositing",
      description: "Seamlessly blend real and AI-generated elements",
      features: [
        "Smart rotoscoping",
        "AI-powered keying",
        "Depth estimation",
        "Shadow generation"
      ]
    },
    {
      icon: Eye,
      title: "Predictive Analytics",
      description: "AI insights for audience engagement and content optimization",
      features: [
        "Viewer behavior prediction",
        "Scene impact analysis",
        "A/B testing automation",
        "ROI forecasting"
      ]
    }
  ];

  const process = [
    {
      step: "01",
      title: "Vision Analysis",
      description: "Our AI analyzes your creative brief and generates initial concepts"
    },
    {
      step: "02",
      title: "Neural Creation",
      description: "Advanced models generate assets, scenes, and preliminary edits"
    },
    {
      step: "03",
      title: "Human Refinement",
      description: "Expert artists enhance and perfect AI-generated content"
    },
    {
      step: "04",
      title: "Delivery & Scale",
      description: "Export in any format with unlimited variations and versions"
    }
  ];

  const stats = [
    { value: "10x", label: "Faster Production" },
    { value: "70%", label: "Cost Reduction" },
    { value: "∞", label: "Creative Possibilities" },
    { value: "99.9%", label: "Render Accuracy" }
  ];

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Mouse follower gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(196, 97, 42, 0.15), transparent 40%)`,
        }}
      />
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              OPTIC STUDIOS
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link href="/services" className="hover:text-brand-orange transition">Services</Link>
              <Link href="/work" className="hover:text-brand-orange transition">Work</Link>
              <Link href="/photography" className="hover:text-brand-orange transition">Photography</Link>
              <Link href="/ai-studio" className="text-brand-orange">AI Studio</Link>
              <Link href="/about" className="hover:text-brand-orange transition">About</Link>
              <Link href="/contact" className="hover:text-brand-orange transition">Contact</Link>
            </div>
            <Link
              href="/contact"
              className="bg-gradient-to-r from-brand-orange to-brand-light text-white px-6 py-2 rounded-full font-medium hover:from-brand-dark hover:to-brand-orange transition"
            >
              Start AI Project
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-20">
        {/* Background Video */}
        <video
          autoPlay={true}
          muted={true}
          loop={true}
          playsInline={true}
          preload="auto"
          controls={false}
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={(e) => console.error('Video failed to load:', e)}
          onLoadStart={() => console.log('Video loading started')}
          onCanPlay={() => console.log('Video can play')}
          onPlay={() => console.log('Video started playing')}
          onLoadedData={() => console.log('Video data loaded')}
          onCanPlayThrough={() => console.log('Video can play through')}
        >
          <source src="/videos/ai-studio-background-web.mp4" type="video/mp4" />
          <source src="/videos/hero-background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Overlay */}
        <div className="absolute inset-0 bg-black/70 z-10" />

        {/* Background gradients */}
        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-zinc-900/30 to-black/50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,97,42,0.2),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,138,61,0.15),transparent_50%)]" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 opacity-30 z-15">
          {[
            { left: 15, top: 25, delay: 0.5, duration: 3 },
            { left: 85, top: 15, delay: 1.2, duration: 2.5 },
            { left: 35, top: 75, delay: 2.1, duration: 3.5 },
            { left: 65, top: 45, delay: 0.8, duration: 2.8 },
            { left: 25, top: 85, delay: 1.8, duration: 3.2 },
            { left: 75, top: 35, delay: 0.3, duration: 2.2 },
            { left: 95, top: 65, delay: 2.5, duration: 3.8 },
            { left: 45, top: 10, delay: 1.5, duration: 2.9 },
            { left: 55, top: 90, delay: 0.9, duration: 3.1 },
            { left: 10, top: 55, delay: 2.2, duration: 2.6 },
            { left: 80, top: 20, delay: 1.1, duration: 3.4 },
            { left: 30, top: 70, delay: 0.6, duration: 2.4 },
            { left: 70, top: 50, delay: 1.9, duration: 3.7 },
            { left: 20, top: 30, delay: 2.8, duration: 2.7 },
            { left: 90, top: 80, delay: 0.4, duration: 3.3 }
          ].map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-400 rounded-full animate-pulse"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-20 container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center max-w-5xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="px-4 py-2 bg-gradient-to-r from-brand-orange/20 to-brand-light/20 border border-brand-orange/30 rounded-full inline-flex items-center gap-2">
                <Sparkles className="text-brand-orange" size={20} />
                <span className="text-brand-light">The Future is Now</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              AI
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-white animate-gradient">
                CINEMATOGRAPHY
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
              Where artificial intelligence meets artistic vision to create
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-white"> impossible worlds</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="#capabilities"
                className="bg-gradient-to-r from-brand-orange to-brand-light text-white px-8 py-4 rounded-full font-medium text-lg hover:from-brand-dark hover:to-brand-orange transition inline-flex items-center justify-center"
              >
                Explore Capabilities <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                href="/contact"
                className="border border-white/30 px-8 py-4 rounded-full font-medium text-lg hover:bg-white hover:text-black transition inline-flex items-center justify-center backdrop-blur"
              >
                <Zap className="mr-2" size={20} /> Start AI Project
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <h3 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-white">
                    {stat.value}
                  </h3>
                  <p className="text-gray-400 mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section id="capabilities" className="py-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Revolutionary AI
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-white">
                  Cinematography Tools
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Industry-leading AI tools that transform creative visions into cinematic reality
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {aiServices.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4 hover:border-orange-400/40 transition group"
                >
                  <service.icon size={32} className="mb-3 text-orange-400 group-hover:scale-110 transition" />
                  <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-400 mb-4 text-sm">{service.description}</p>
                  <ul className="space-y-1">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle size={12} className="text-orange-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-black via-orange-500/5 to-black">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-12 text-center">
              AI Development Process
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {process.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4 hover:border-orange-400/40 transition text-center"
                >
                  <div className="text-3xl font-bold text-orange-400 mb-2">{item.step}</div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-t from-orange-500/10 to-black">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to Pioneer the Future?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join the AI revolution in filmmaking. Be among the first to create with tomorrow's technology.
            </p>
            <Link
              href="/contact"
              className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-12 py-5 rounded-full font-medium text-xl hover:from-orange-600 hover:to-orange-500 transition inline-flex items-center"
            >
              Launch Your AI Project <Sparkles className="ml-3" size={24} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2024 Optic Studios LLC. Leading the AI Cinematography Revolution.</p>
        </div>
      </footer>
    </main>
  );
}