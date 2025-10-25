"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Sparkles, Brain, Cpu, Zap, Award, TrendingUp, Users, Globe } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./components/Logo";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const stats = [
    { icon: Award, value: "50+", label: "Industry Awards" },
    { icon: Users, value: "200+", label: "Global Clients" },
    { icon: TrendingUp, value: "85%", label: "AI-Enhanced Projects" },
    { icon: Globe, value: "30+", label: "Countries Served" }
  ];

  const services = [
    {
      title: "AI Cinematography",
      description: "Revolutionary visual storytelling powered by neural networks",
    },
    {
      title: "Traditional Excellence",
      description: "Award-winning craftsmanship meets cutting-edge technology",
    },
    {
      title: "Hybrid Production",
      description: "Seamlessly blend real-world footage with AI-generated content",
    }
  ];

  const featuredWork = [
    {
      title: "Neural Dreams",
      category: "AI Feature Film",
      client: "Netflix",
      awards: ["Cannes Innovation Award"],
    },
    {
      title: "Quantum Reality",
      category: "AI Commercial",
      client: "Apple",
      awards: ["Gold Lion"],
    },
    {
      title: "Digital Consciousness",
      category: "AI Documentary",
      client: "Discovery+",
      awards: ["Sundance Selection"],
    }
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
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-xl border-b border-orange-500/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link href="/services" className="hover:text-orange-400 transition">Services</Link>
              <Link href="/work" className="hover:text-orange-400 transition">Work</Link>
              <Link href="/photography" className="hover:text-orange-400 transition">Photography</Link>
              <Link href="/ai-studio" className="hover:text-orange-400 transition">AI Studio</Link>
              <Link href="/about" className="hover:text-orange-400 transition">About</Link>
              <Link href="/contact" className="hover:text-orange-400 transition">Contact</Link>
            </div>
            <Link
              href="/contact"
              className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-6 py-2 rounded-full font-medium hover:from-orange-600 hover:to-orange-500 transition"
            >
              Start AI Project
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
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

        <motion.div
          style={{ y, opacity }}
          className="relative z-20 text-center px-6 max-w-7xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full mb-8"
          >
            <Brain className="text-orange-400" size={20} />
            <span className="text-orange-300 text-sm font-medium">AI-Powered Creative Studio</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="block">STORIES THAT</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-white animate-gradient">
              CAPTIVATE
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-300 leading-relaxed"
          >
            Premium film and television production services that bring your vision to life using cutting-edge
            <span className="text-orange-400 font-semibold"> AI technology</span> and
            <span className="text-white font-semibold"> traditional excellence</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link
              href="/contact"
              className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-10 py-4 rounded-full font-medium text-lg hover:from-orange-600 hover:to-orange-500 transition inline-flex items-center justify-center transform hover:scale-105"
            >
              Start Your Project <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link
              href="/work"
              className="border-2 border-orange-500/50 backdrop-blur px-10 py-4 rounded-full font-medium text-lg hover:bg-orange-500/10 hover:border-orange-400 transition inline-flex items-center justify-center transform hover:scale-105"
            >
              <Play className="mr-2" size={20} /> View Our Work
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="mx-auto mb-2 text-orange-400" size={24} />
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-6 relative border-t border-orange-500/20">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/50 to-black" />

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Pioneering
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-white">
                AI + Human Creativity
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              The world's first studio to seamlessly blend artificial intelligence with traditional filmmaking excellence
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl" />
                <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-10 hover:border-orange-400/40 transition">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 mb-6">
                    <Cpu size={32} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{service.title}</h3>
                  <p className="text-gray-300 text-lg mb-6">{service.description}</p>
                  <Link href="/services" className="text-orange-400 hover:text-orange-300 transition inline-flex items-center">
                    Learn more <ArrowRight className="ml-2" size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Innovation Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-orange-500/20 to-zinc-900/50 backdrop-blur-xl border border-orange-500/30 rounded-3xl p-12 text-center"
          >
            <Zap className="mx-auto mb-4 text-orange-400" size={48} />
            <h3 className="text-3xl font-bold mb-4">10x Faster Production • 70% Cost Reduction • Infinite Possibilities</h3>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Our proprietary AI pipeline revolutionizes every stage of production, from pre-visualization to final render
            </p>
            <Link
              href="/ai-studio"
              className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-8 py-4 rounded-full font-medium text-lg hover:from-orange-600 hover:to-orange-500 transition inline-flex items-center"
            >
              Discover Our AI Technology <Sparkles className="ml-2" size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Work Section */}
      <section className="py-32 px-6 border-t border-orange-500/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full mb-6"
              >
                <Award className="text-orange-400" size={20} />
                <span className="text-orange-300 text-sm font-medium">Award-Winning Productions</span>
              </motion.div>

              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Featured
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-white">
                  AI-Enhanced Work
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Groundbreaking projects where AI and human creativity converge
              </p>
              <Link href="/work" className="text-orange-400 hover:text-orange-300 transition inline-flex items-center text-lg">
                View Full Portfolio <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>

            {/* Featured Projects Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredWork.map((work, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl overflow-hidden mb-4">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                      <Play size={48} className="text-white" />
                    </div>

                    {/* AI Badge */}
                    <div className="absolute top-4 left-4 bg-orange-500/80 backdrop-blur px-3 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">AI-Enhanced</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{work.title}</h3>
                  <p className="text-orange-400 mb-2">{work.category} • {work.client}</p>
                  <div className="flex flex-wrap gap-2">
                    {work.awards.map((award, i) => (
                      <span key={i} className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded text-xs text-orange-300">
                        {award}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-24 px-6 border-t border-orange-500/20">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">Ready to Create Something Amazing?</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Let's collaborate to bring your vision to life with the power of AI-enhanced storytelling.
            </p>
            <Link
              href="/contact"
              className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-12 py-5 rounded-full font-medium text-xl hover:from-orange-600 hover:to-orange-500 transition inline-flex items-center transform hover:scale-105"
            >
              Start Your Project <ArrowRight className="ml-3" size={24} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-orange-500/20 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">OPTIC STUDIOS</h3>
              <p className="text-gray-400">Leading the AI Cinematography Revolution</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-orange-400">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/services" className="hover:text-white transition">Film Production</Link></li>
                <li><Link href="/services" className="hover:text-white transition">Television</Link></li>
                <li><Link href="/services" className="hover:text-white transition">AI Cinematography</Link></li>
                <li><Link href="/services" className="hover:text-white transition">Post-Production</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-orange-400">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/work" className="hover:text-white transition">Portfolio</Link></li>
                <li><Link href="/ai-studio" className="hover:text-white transition">AI Studio</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-orange-400">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition">Vimeo</a></li>
                <li><a href="#" className="hover:text-white transition">YouTube</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-orange-500/20 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>&copy; 2024 Optic Studios LLC. Leading the AI Cinematography Revolution.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}