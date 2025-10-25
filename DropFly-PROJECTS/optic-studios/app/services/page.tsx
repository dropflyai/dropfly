"use client";

import { motion } from "framer-motion";
import {
  Film,
  Camera,
  Tv2,
  Video,
  Brain,
  Sparkles,
  Cpu,
  Palette,
  Volume2,
  Eye,
  ArrowRight,
  CheckCircle,
  Play,
  Award,
  Zap,
  Users
} from "lucide-react";
import Link from "next/link";
import { Logo } from "../components/Logo";
import { useEffect, useState } from "react";

export default function Services() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  const traditionalServices = [
    {
      icon: Film,
      title: "Feature Film Production",
      description: "End-to-end film production from script to screen",
      features: [
        "Pre-production planning",
        "Principal photography",
        "Post-production",
        "Distribution strategy"
      ],
      pricing: "From $500K",
      duration: "6-18 months"
    },
    {
      icon: Tv2,
      title: "Television & Streaming",
      description: "Series, pilots, and episodic content for all platforms",
      features: [
        "Series development",
        "Pilot production",
        "Multi-episode filming",
        "Streaming optimization"
      ],
      pricing: "From $100K/episode",
      duration: "3-12 months"
    },
    {
      icon: Camera,
      title: "Commercial Production",
      description: "High-impact branded content and advertising",
      features: [
        "Concept development",
        "Brand storytelling",
        "Multi-format delivery",
        "Social media optimization"
      ],
      pricing: "From $50K",
      duration: "2-8 weeks"
    },
    {
      icon: Video,
      title: "Post-Production",
      description: "Professional editing, color, VFX, and audio",
      features: [
        "Editorial services",
        "Color grading",
        "Visual effects",
        "Sound design & mixing"
      ],
      pricing: "From $25K",
      duration: "4-16 weeks"
    }
  ];

  const aiServices = [
    {
      icon: Brain,
      title: "Neural Scene Generation",
      description: "Create photorealistic environments from text descriptions",
      features: [
        "Text-to-scene generation",
        "Real-time environment creation",
        "Infinite location possibilities",
        "Weather & lighting control"
      ],
      pricing: "From $15K",
      duration: "1-2 weeks"
    },
    {
      icon: Sparkles,
      title: "AI Actor Synthesis",
      description: "Digital humans indistinguishable from real performers",
      features: [
        "Digital twin creation",
        "Emotion & expression synthesis",
        "Multi-language lip-sync",
        "Age progression/regression"
      ],
      pricing: "From $30K",
      duration: "2-4 weeks"
    },
    {
      icon: Palette,
      title: "Intelligent Color Grading",
      description: "AI-powered color science that adapts to narrative",
      features: [
        "Scene-aware grading",
        "Style transfer",
        "Automated masking",
        "Mood enhancement"
      ],
      pricing: "From $10K",
      duration: "3-5 days"
    },
    {
      icon: Eye,
      title: "Deep Compositing",
      description: "Seamless integration of real and generated elements",
      features: [
        "Smart rotoscoping",
        "Depth-based compositing",
        "Shadow generation",
        "Reflection synthesis"
      ],
      pricing: "From $20K",
      duration: "1-3 weeks"
    }
  ];

  const packages = [
    {
      name: "Traditional Excellence",
      description: "Classic filmmaking with premium quality",
      price: "From $100K",
      features: [
        "Full production crew",
        "Professional equipment",
        "Location scouting",
        "Post-production",
        "Color grading",
        "Sound design",
        "Final delivery"
      ],
      gradient: "from-gray-600 to-gray-800"
    },
    {
      name: "AI-Enhanced Production",
      description: "Best of both worlds - AI + human creativity",
      price: "From $75K",
      features: [
        "AI pre-visualization",
        "Neural scene generation",
        "Smart color grading",
        "Automated VFX",
        "Enhanced post-production",
        "Multiple format delivery",
        "Cost optimization"
      ],
      gradient: "from-orange-500 to-orange-400",
      popular: true
    },
    {
      name: "Full AI Production",
      description: "Cutting-edge AI cinematography",
      price: "From $25K",
      features: [
        "Complete AI pipeline",
        "Generated environments",
        "Synthetic performers",
        "AI-powered editing",
        "Automated color grading",
        "Multi-language versions",
        "Rapid delivery"
      ],
      gradient: "from-orange-600 to-orange-500"
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
              <Link href="/services" className="text-orange-400">Services</Link>
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
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full mb-8">
              <Cpu className="text-orange-400" size={20} />
              <span className="text-orange-300 text-sm font-medium">Full-Service Production</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              Our
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-white">
                Services
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              From traditional excellence to AI revolution - we offer every level of production to bring your vision to life
            </p>
          </motion.div>
        </div>
      </section>

      {/* Traditional Services */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-4">Traditional Excellence</h2>
            <p className="text-xl text-gray-400 mb-16 max-w-3xl">
              Award-winning craftsmanship with decades of experience in film and television production
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {traditionalServices.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition group"
                >
                  <service.icon size={48} className="mb-6 text-white group-hover:scale-110 transition" />
                  <h3 className="text-3xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-gray-400 mb-6">{service.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Starting Price</p>
                      <p className="text-lg font-bold text-white">{service.pricing}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Timeline</p>
                      <p className="text-lg font-bold text-white">{service.duration}</p>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Services */}
      <section className="py-16 px-6 bg-gradient-to-b from-black via-orange-500/5 to-black">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-4">
              AI-Powered
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300"> Innovation</span>
            </h2>
            <p className="text-xl text-gray-400 mb-16 max-w-3xl">
              Cutting-edge artificial intelligence tools that revolutionize every aspect of production
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {aiServices.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8 hover:border-orange-400/40 transition group"
                >
                  <service.icon size={48} className="mb-6 text-orange-400 group-hover:scale-110 transition" />
                  <h3 className="text-3xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-gray-400 mb-6">{service.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Starting Price</p>
                      <p className="text-lg font-bold text-orange-400">{service.pricing}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Timeline</p>
                      <p className="text-lg font-bold text-orange-400">{service.duration}</p>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-orange-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Production Packages */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6 text-center">Production Packages</h2>
            <p className="text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto">
              Choose the perfect blend of traditional and AI-powered production for your project
            </p>

            <div className="grid lg:grid-cols-3 gap-8">
              {packages.map((pkg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative bg-gradient-to-br ${pkg.gradient} p-8 rounded-3xl ${
                    pkg.popular ? 'ring-2 ring-orange-400 scale-105' : ''
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                    <p className="text-gray-200 mb-4">{pkg.description}</p>
                    <div className="text-4xl font-bold">{pkg.price}</div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-white mt-1 flex-shrink-0" />
                        <span className="text-white">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/contact"
                    className="block w-full bg-black/20 backdrop-blur text-white text-center py-4 rounded-xl font-medium hover:bg-black/30 transition"
                  >
                    Get Started
                  </Link>
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
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Vision?</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Let's discuss how our services can bring your project to life with the perfect blend of artistry and technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-8 py-4 rounded-full font-medium text-lg hover:from-orange-600 hover:to-orange-500 transition inline-flex items-center justify-center"
              >
                Start Your Project <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                href="/work"
                className="border border-white px-8 py-4 rounded-full font-medium text-lg hover:bg-white hover:text-black transition inline-flex items-center justify-center"
              >
                <Play className="mr-2" size={20} /> View Our Work
              </Link>
            </div>
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