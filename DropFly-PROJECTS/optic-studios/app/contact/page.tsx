"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Clock,
  Users,
  Award,
  Zap,
  Send,
  Calendar,
  MessageSquare,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "../components/Logo";

export default function Contact() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    projectType: "",
    budget: "",
    timeline: "",
    message: ""
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      value: "+1 (555) 123-4567",
      description: "Available 9 AM - 6 PM PST"
    },
    {
      icon: Mail,
      title: "Email",
      value: "hello@opticstudios.ai",
      description: "We respond within 4 hours"
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Los Angeles, California",
      description: "By appointment only"
    }
  ];

  const quickStats = [
    { icon: Clock, value: "< 4 Hours", label: "Response Time" },
    { icon: Users, value: "200+", label: "Happy Clients" },
    { icon: Award, value: "50+", label: "Industry Awards" },
    { icon: Zap, value: "10x", label: "Faster Production" }
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
              <Link href="/contact" className="text-orange-400">Contact</Link>
            </div>
            <Link
              href="#form"
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
              <MessageSquare className="text-orange-400" size={20} />
              <span className="text-orange-300 text-sm font-medium">Let's Create Together</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              Start Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-white">
                AI Revolution
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-16">
              Transform your vision into reality with cutting-edge AI cinematography and traditional excellence
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {quickStats.map((stat, index) => (
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

      {/* Contact Form & Info */}
      <section id="form" className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Get Your Custom Quote</h2>
              <p className="text-gray-300 mb-8">
                Tell us about your project and we'll provide a detailed proposal within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-400 transition"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-400 transition"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-400 transition"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-400 transition"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <label className="block text-sm font-medium mb-2">Project Type *</label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-400 transition"
                  >
                    <option value="">Select project type</option>
                    <option value="feature-film">Feature Film</option>
                    <option value="tv-series">TV Series</option>
                    <option value="commercial">Commercial</option>
                    <option value="music-video">Music Video</option>
                    <option value="documentary">Documentary</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Budget Range *</label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-400 transition"
                    >
                      <option value="">Select budget</option>
                      <option value="under-50k">Under $50K</option>
                      <option value="50k-100k">$50K - $100K</option>
                      <option value="100k-250k">$100K - $250K</option>
                      <option value="250k-500k">$250K - $500K</option>
                      <option value="500k-1m">$500K - $1M</option>
                      <option value="over-1m">Over $1M</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Timeline *</label>
                    <select
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-400 transition"
                    >
                      <option value="">Select timeline</option>
                      <option value="asap">ASAP (Rush)</option>
                      <option value="1-month">Within 1 month</option>
                      <option value="3-months">Within 3 months</option>
                      <option value="6-months">Within 6 months</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Project Details *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-400 transition"
                    placeholder="Tell us about your project vision, goals, target audience, and any specific requirements..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white py-4 rounded-full font-medium text-lg hover:from-orange-600 hover:to-orange-500 transition transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Send Project Brief
                  <ArrowRight size={20} />
                </button>
              </form>
            </motion.div>

            {/* Contact Info & Additional Options */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Direct Contact */}
              <div>
                <h3 className="text-3xl font-bold mb-6">Get In Touch Directly</h3>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start gap-4 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition">
                      <info.icon size={24} className="text-orange-400 mt-1" />
                      <div>
                        <h4 className="text-lg font-semibold mb-1">{info.title}</h4>
                        <p className="text-white mb-1">{info.value}</p>
                        <p className="text-sm text-gray-400">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Booking */}
              <div className="bg-white/5 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8">
                <Calendar className="text-orange-400 mb-4" size={32} />
                <h3 className="text-2xl font-bold mb-4">Book a Strategy Call</h3>
                <p className="text-gray-300 mb-6">
                  Schedule a free 30-minute consultation to discuss your project and explore how AI can revolutionize your production.
                </p>
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition"
                >
                  <Calendar size={20} />
                  Schedule Call
                </Link>
              </div>

              {/* Testimonial */}
              <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-500/20 rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-black" />
                  </div>
                  <div>
                    <p className="text-lg italic text-white mb-2">
                      "Working with Optic Studios was game-changing. Their AI technology cut our production time by 75%."
                    </p>
                    <p className="text-sm text-gray-400">
                      - Sarah Chen, Head of Production, Netflix
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-black via-orange-500/5 to-black">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-400">Everything you need to know about working with Optic Studios</p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: "How quickly can you start my project?",
                answer: "For AI-enhanced projects, we can begin within 48-72 hours. Traditional productions typically start within 1-2 weeks depending on complexity and crew availability."
              },
              {
                question: "What's the difference in cost between AI and traditional production?",
                answer: "AI-powered production typically costs 60-70% less than traditional methods while delivering 10x faster turnaround times. We provide detailed cost breakdowns in our proposals."
              },
              {
                question: "Do you work with international clients?",
                answer: "Yes! We serve clients globally and can accommodate different time zones, languages, and cultural requirements. Our AI tools make remote collaboration seamless."
              },
              {
                question: "Can you combine AI with traditional filming?",
                answer: "Absolutely. Our hybrid approach combines the best of both worlds - traditional cinematography for key scenes and AI enhancement for backgrounds, effects, and post-production."
              },
              {
                question: "What if I'm not satisfied with the AI-generated content?",
                answer: "We offer unlimited revisions during the creative process. Our AI tools allow rapid iteration, and we don't finalize anything without your complete approval."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold mb-3 text-white">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
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