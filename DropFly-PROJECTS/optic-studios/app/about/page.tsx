"use client";

import { motion } from "framer-motion";
import { Award, Users, Target, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "../components/Logo";

export default function About() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  const teamMembers = [
    {
      name: "Michael Chen",
      role: "Creative Director",
      bio: "15+ years in film production with Emmy-nominated work",
    },
    {
      name: "Sarah Martinez",
      role: "Executive Producer",
      bio: "Led productions for major studios and streaming platforms",
    },
    {
      name: "James Wilson",
      role: "Director of Photography",
      bio: "Award-winning cinematographer with a unique visual style",
    },
    {
      name: "Emma Thompson",
      role: "Post-Production Head",
      bio: "Expert in VFX and color grading for premium content",
    },
  ];

  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "We pursue perfection in every frame, every cut, every story we tell",
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Great films are made by great teams working in perfect harmony",
    },
    {
      icon: Target,
      title: "Vision",
      description: "We bring bold ideas to life with precision and purpose",
    },
    {
      icon: Sparkles,
      title: "Innovation",
      description: "Pushing boundaries with cutting-edge technology and creative techniques",
    },
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
              <Link href="/about" className="text-orange-400">About</Link>
              <Link href="/contact" className="hover:text-orange-400 transition">Contact</Link>
            </div>
            <Link
              href="/#contact"
              className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-6 py-2 rounded-full font-medium hover:from-orange-600 hover:to-orange-500 transition"
            >
              Start AI Project
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              We Are
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-white">
                OPTIC STUDIOS
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              A collective of visionary filmmakers, storytellers, and creative technologists
              dedicated to crafting unforgettable visual experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <div>
              <h2 className="text-5xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl text-gray-300 mb-6">
                To transform ideas into cinematic masterpieces that resonate with audiences worldwide.
                We believe every project has a unique story waiting to be told, and we're here to tell it
                with unparalleled artistry and technical excellence.
              </p>
              <p className="text-xl text-gray-300">
                Since our founding, we've partnered with brands, agencies, and visionaries to produce
                award-winning content that doesn't just meet expectations—it exceeds them.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="text-5xl font-bold mb-2">150+</h3>
                <p className="text-gray-400">Projects Completed</p>
              </div>
              <div className="text-center">
                <h3 className="text-5xl font-bold mb-2">25+</h3>
                <p className="text-gray-400">Industry Awards</p>
              </div>
              <div className="text-center">
                <h3 className="text-5xl font-bold mb-2">50+</h3>
                <p className="text-gray-400">Happy Clients</p>
              </div>
              <div className="text-center">
                <h3 className="text-5xl font-bold mb-2">10</h3>
                <p className="text-gray-400">Years of Excellence</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-16 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <value.icon size={48} className="mx-auto mb-6 text-white" />
                  <h3 className="text-2xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-400">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">Meet the Team</h2>
            <p className="text-xl text-gray-400 mb-16 max-w-3xl">
              Our diverse team brings together decades of experience in film, television, and digital media.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500/50 to-orange-600 rounded-full mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold mb-2 text-center">{member.name}</h3>
                  <p className="text-gray-400 text-center mb-4">{member.role}</p>
                  <p className="text-gray-500 text-sm text-center">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">Ready to Create Something Amazing?</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Let's collaborate to bring your vision to life with the power of exceptional storytelling.
            </p>
            <Link
              href="/#contact"
              className="bg-white text-black px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-200 transition inline-flex items-center"
            >
              Start Your Project
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">OPTIC STUDIOS</h3>
              <p className="text-gray-400">Premium film and television production</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/#services" className="hover:text-white transition">Film Production</Link></li>
                <li><Link href="/#services" className="hover:text-white transition">Television</Link></li>
                <li><Link href="/#services" className="hover:text-white transition">Commercials</Link></li>
                <li><Link href="/#services" className="hover:text-white transition">Post-Production</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/portfolio" className="hover:text-white transition">Portfolio</Link></li>
                <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
                <li><Link href="/#contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition">Vimeo</a></li>
                <li><a href="#" className="hover:text-white transition">YouTube</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>&copy; 2024 Optic Studios LLC. All rights reserved.</p>
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