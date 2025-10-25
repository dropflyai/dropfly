"use client";

import { motion } from "framer-motion";
import { Play, Filter, Award, Clock, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "../components/Logo";

export default function Work() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const projects = [
    {
      id: 1,
      title: "Neural Dreams",
      category: "ai-film",
      type: "AI-Generated Feature Film",
      client: "Netflix",
      year: "2024",
      description: "First fully AI-assisted feature film combining traditional cinematography with neural rendering",
      awards: ["Cannes Innovation Award", "Best Visual Effects - Emmy"],
      thumbnail: "/work/neural-dreams.jpg",
      featured: true,
      stats: {
        views: "15M+",
        duration: "120 min",
        team: "45 professionals"
      }
    },
    {
      id: 2,
      title: "Quantum Reality",
      category: "commercial",
      type: "AI-Enhanced Commercial",
      client: "Apple",
      year: "2024",
      description: "Revolutionary product launch using real-time AI scene generation",
      awards: ["Gold Lion - Cannes"],
      thumbnail: "/work/quantum-reality.jpg",
      featured: true,
      stats: {
        views: "50M+",
        duration: "90 sec",
        team: "20 professionals"
      }
    },
    {
      id: 3,
      title: "Echoes of Tomorrow",
      category: "tv-series",
      type: "Television Series",
      client: "HBO Max",
      year: "2023",
      description: "8-episode sci-fi series with AI-generated environments and characters",
      awards: ["Best Cinematography - Emmy"],
      thumbnail: "/work/echoes.jpg",
      featured: false,
      stats: {
        views: "25M+",
        duration: "8 episodes",
        team: "120 professionals"
      }
    },
    {
      id: 4,
      title: "Digital Consciousness",
      category: "documentary",
      type: "AI Documentary",
      client: "Discovery+",
      year: "2024",
      description: "Exploring the intersection of AI and human creativity in filmmaking",
      awards: ["Sundance Selection"],
      thumbnail: "/work/digital.jpg",
      featured: true,
      stats: {
        views: "8M+",
        duration: "95 min",
        team: "15 professionals"
      }
    },
    {
      id: 5,
      title: "Synthetic Symphony",
      category: "music-video",
      type: "AI Music Video",
      client: "Universal Music",
      year: "2024",
      description: "Groundbreaking music video with AI-choreographed visuals synced to music",
      awards: ["VMA - Best Visual Effects"],
      thumbnail: "/work/symphony.jpg",
      featured: false,
      stats: {
        views: "75M+",
        duration: "4 min",
        team: "12 professionals"
      }
    },
    {
      id: 6,
      title: "Meta Worlds",
      category: "vr-experience",
      type: "VR/AI Experience",
      client: "Meta",
      year: "2023",
      description: "Immersive VR experience with AI-driven narrative adaptation",
      awards: ["Best VR Experience - Venice Film Festival"],
      thumbnail: "/work/meta-worlds.jpg",
      featured: true,
      stats: {
        views: "2M+",
        duration: "30 min",
        team: "35 professionals"
      }
    }
  ];

  const categories = [
    { id: "all", label: "All Projects", count: projects.length },
    { id: "ai-film", label: "AI Films", count: 1 },
    { id: "commercial", label: "Commercials", count: 1 },
    { id: "tv-series", label: "TV Series", count: 1 },
    { id: "documentary", label: "Documentaries", count: 1 },
    { id: "music-video", label: "Music Videos", count: 1 },
    { id: "vr-experience", label: "VR/AR", count: 1 }
  ];

  const filteredProjects = selectedCategory === "all"
    ? projects
    : projects.filter(p => p.category === selectedCategory);

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
              <Link href="/work" className="text-orange-400">Work</Link>
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
      <section className="pt-32 pb-12 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              Our
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-white">
                Portfolio
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
              Pioneering the future of visual storytelling through AI-enhanced cinematography and traditional craftsmanship
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 px-6 border-y border-white/10">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300">150+</h3>
              <p className="text-gray-400">Projects Completed</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-white">85%</h3>
              <p className="text-gray-400">AI-Enhanced Productions</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-400">50+</h3>
              <p className="text-gray-400">Industry Awards</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300">500M+</h3>
              <p className="text-gray-400">Total Views</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-6">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-full border transition ${
                  selectedCategory === cat.id
                    ? "bg-white text-black border-white"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`group relative ${project.featured ? "md:col-span-2" : ""}`}
              >
                <div className="relative aspect-video bg-white/5 backdrop-blur-sm border border-orange-500/20 rounded-2xl overflow-hidden">
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Play size={64} className="text-white" />
                  </div>

                  {/* Featured Badge */}
                  {project.featured && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 rounded-full flex items-center gap-2">
                      <Sparkles size={16} />
                      <span className="text-sm font-medium">Featured</span>
                    </div>
                  )}

                  {/* Awards Badge */}
                  {project.awards.length > 0 && (
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                      <Award size={16} className="text-yellow-400" />
                      <span className="text-sm">{project.awards.length} Awards</span>
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div className="mt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-3xl font-bold mb-2">{project.title}</h3>
                      <p className="text-gray-400 mb-1">{project.type} • {project.client}</p>
                      <p className="text-gray-500 text-sm">{project.year}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4">{project.description}</p>

                  {/* Stats */}
                  <div className="flex gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-400">{project.stats.team}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-400">{project.stats.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-400">{project.stats.views}</span>
                    </div>
                  </div>

                  {/* Awards */}
                  {project.awards.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.awards.map((award, i) => (
                        <span key={i} className="px-3 py-1 bg-yellow-900/20 border border-yellow-700/30 rounded-full text-sm text-yellow-400">
                          {award}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
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
            <h2 className="text-5xl font-bold mb-6">Ready to Create the Future?</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join us in revolutionizing visual storytelling with AI-powered cinematography
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-8 py-4 rounded-full font-medium text-lg hover:from-orange-600 hover:to-orange-500 transition inline-flex items-center justify-center"
              >
                Start Your AI Project
              </Link>
              <Link
                href="/ai-studio"
                className="border border-white px-8 py-4 rounded-full font-medium text-lg hover:bg-white hover:text-black transition inline-flex items-center justify-center"
              >
                Explore AI Capabilities
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="container mx-auto">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Optic Studios LLC. Pioneering AI Cinematography.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}