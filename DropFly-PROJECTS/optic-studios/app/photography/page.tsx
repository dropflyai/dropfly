"use client";

import { motion } from "framer-motion";
import {
  Camera,
  Users,
  Briefcase,
  User,
  Palette,
  BookOpen,
  Award,
  Clock,
  Eye,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Star
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "../components/Logo";

export default function Photography() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const photographyServices = [
    {
      icon: Users,
      title: "Event Photography",
      description: "Capture every precious moment with cinematic storytelling",
      features: [
        "Corporate events & conferences",
        "Weddings & celebrations",
        "Product launches",
        "Awards ceremonies",
        "Real-time editing & delivery"
      ],
      pricing: "From $2,500",
      duration: "Full day coverage",
      category: "event"
    },
    {
      icon: Briefcase,
      title: "Commercial Photography",
      description: "Professional imagery that drives business results",
      features: [
        "Product photography",
        "Architectural shoots",
        "Corporate headshots",
        "Brand lifestyle imagery",
        "E-commerce optimization"
      ],
      pricing: "From $1,500",
      duration: "Half/Full day",
      category: "commercial"
    },
    {
      icon: User,
      title: "Professional Headshots",
      description: "Executive portraits that command attention and respect",
      features: [
        "Executive leadership portraits",
        "LinkedIn profile optimization",
        "Actor/model portfolios",
        "Personal branding imagery",
        "Multiple outfit changes"
      ],
      pricing: "From $750",
      duration: "2-3 hours",
      category: "headshots"
    },
    {
      icon: Palette,
      title: "Fashion Photography",
      description: "High-fashion imagery with editorial sophistication",
      features: [
        "Fashion editorial shoots",
        "Lookbook production",
        "Model portfolio development",
        "Campaign photography",
        "Runway documentation"
      ],
      pricing: "From $3,500",
      duration: "Full day production",
      category: "fashion"
    },
    {
      icon: BookOpen,
      title: "Editorial Photography",
      description: "Storytelling imagery for publications and media",
      features: [
        "Magazine feature stories",
        "Documentary projects",
        "Lifestyle photography",
        "Portrait series",
        "Publication-ready delivery"
      ],
      pricing: "From $2,000",
      duration: "Project-based",
      category: "editorial"
    }
  ];

  const portfolioItems = [
    {
      title: "Tech Conference 2024",
      category: "event",
      description: "3-day conference with 2,000+ attendees",
      image: "/portfolio/tech-conference.jpg",
      client: "TechCorp"
    },
    {
      title: "Luxury Watch Campaign",
      category: "commercial",
      description: "Premium product photography series",
      image: "/portfolio/luxury-watch.jpg",
      client: "Swiss Timepieces"
    },
    {
      title: "CEO Executive Portraits",
      category: "headshots",
      description: "C-suite leadership photography",
      image: "/portfolio/ceo-portraits.jpg",
      client: "Fortune 500 Company"
    },
    {
      title: "Spring Fashion Editorial",
      category: "fashion",
      description: "High-fashion magazine spread",
      image: "/portfolio/fashion-editorial.jpg",
      client: "Vogue Magazine"
    },
    {
      title: "Entrepreneur Feature Story",
      category: "editorial",
      description: "Business magazine cover story",
      image: "/portfolio/entrepreneur-story.jpg",
      client: "Forbes Magazine"
    }
  ];

  const stats = [
    { icon: Camera, value: "10,000+", label: "Photos Delivered" },
    { icon: Award, value: "150+", label: "Events Covered" },
    { icon: Users, value: "500+", label: "Happy Clients" },
    { icon: Clock, value: "24hr", label: "Turnaround Time" }
  ];

  const filteredPortfolio = selectedCategory === "all"
    ? portfolioItems
    : portfolioItems.filter(item => item.category === selectedCategory);

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
              <Link href="/photography" className="text-orange-400">Photography</Link>
              <Link href="/ai-studio" className="hover:text-orange-400 transition">AI Studio</Link>
              <Link href="/about" className="hover:text-orange-400 transition">About</Link>
              <Link href="/contact" className="hover:text-orange-400 transition">Contact</Link>
            </div>
            <Link
              href="/contact"
              className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-6 py-2 rounded-full font-medium hover:from-orange-600 hover:to-orange-500 transition"
            >
              Book Photo Session
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
              <Camera className="text-orange-400" size={20} />
              <span className="text-orange-300 text-sm font-medium">Professional Photography</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              Capture
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-white">
                Perfect Moments
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-16">
              From corporate events to high-fashion editorials, we create stunning photography that tells your story
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="mx-auto mb-2 text-orange-400" size={24} />
                  <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Photography Services */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-4 text-center">Photography Services</h2>
            <p className="text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto">
              Professional photography services powered by years of experience and cutting-edge techniques
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {photographyServices.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8 hover:border-orange-400/40 transition group"
                >
                  <service.icon size={48} className="mb-6 text-orange-400 group-hover:scale-110 transition" />
                  <h3 className="text-2xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-gray-400 mb-6">{service.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Starting Price</p>
                      <p className="text-lg font-bold text-orange-400">{service.pricing}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Duration</p>
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

      {/* Portfolio Gallery */}
      <section className="py-16 px-6 bg-gradient-to-b from-black via-orange-500/5 to-black">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6 text-center">Portfolio Gallery</h2>
            <p className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto">
              Explore our recent photography work across different categories
            </p>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {["all", "event", "commercial", "headshots", "fashion", "editorial"].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition ${
                    selectedCategory === category
                      ? "bg-orange-500 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-orange-500/20"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Portfolio Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPortfolio.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/3] bg-white/5 backdrop-blur-sm border border-orange-500/20 rounded-2xl overflow-hidden">
                    {/* Placeholder for portfolio image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                      <Camera size={48} className="text-orange-400/50" />
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300">
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Star size={16} className="text-orange-400" />
                          <span className="text-sm text-orange-300 uppercase tracking-wide">{item.category}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                        <p className="text-orange-400 text-sm font-medium">{item.client}</p>
                      </div>

                      <div className="absolute top-6 right-6">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Eye size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
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
            <h2 className="text-5xl font-bold mb-6">Ready to Capture Something Amazing?</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Let's discuss your photography needs and create stunning imagery that exceeds your expectations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-8 py-4 rounded-full font-medium text-lg hover:from-orange-600 hover:to-orange-500 transition inline-flex items-center justify-center"
              >
                Book Photo Session <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                href="/work"
                className="border border-white px-8 py-4 rounded-full font-medium text-lg hover:bg-white hover:text-black transition inline-flex items-center justify-center"
              >
                <Play className="mr-2" size={20} /> View Portfolio
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2024 Optic Studios LLC. Capturing Excellence Through Every Lens.</p>
        </div>
      </footer>
    </main>
  );
}