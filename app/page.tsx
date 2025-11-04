"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CreditCard, ArrowRight, Check, Users, Zap, Shield, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Landing() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    setIsLoggedIn(!!token)
  }, [])

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push("/dashboard")
    } else {
      router.push("/auth/signup")
    }
  }

  const accountTiers = [
    {
      name: "Premier Checking",
      description: "Perfect for everyday banking",
      features: ["No monthly fees", "Unlimited transactions", "Mobile deposits", "Real-time alerts"],
      icon: "💳",
    },
    {
      name: "Premier Business",
      description: "Built for entrepreneurs",
      features: ["Business checking", "Team management", "Invoicing tools", "Advanced analytics"],
      icon: "🏢",
    },
    {
      name: "Premier Invest",
      description: "Grow your wealth",
      features: ["Brokerage access", "Low-cost investments", "Portfolio tracking", "Expert guidance"],
      icon: "📈",
    },
    {
      name: "Premier Joint",
      description: "Banking together",
      features: ["Shared accounts", "Equal access", "Combined goals", "Transparent tracking"],
      icon: "👥",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "Small Business Owner",
      quote:
        "Premier America made managing my finances incredibly simple. The mobile app is intuitive and the support team is fantastic.",
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      title: "Freelancer",
      quote: "Love the instant transfers and zero fees. This is exactly what I needed for my business.",
      avatar: "MC",
    },
    {
      name: "Emily Rodriguez",
      title: "Financial Advisor",
      quote: "I recommend Premier America to all my clients. The platform is secure, transparent, and user-friendly.",
      avatar: "ER",
    },
  ]

  const faqs = [
    {
      q: "Is my money safe with Premier America?",
      a: "Yes. We use bank-level encryption, are FDIC insured up to $250,000 per account, and comply with all federal banking regulations.",
    },
    {
      q: "How long does account setup take?",
      a: "You can set up an account in under 5 minutes. Verification typically completes within 24 hours.",
    },
    {
      q: "Are there any hidden fees?",
      a: "Absolutely not. We're transparent about all fees. Most accounts have zero monthly maintenance fees.",
    },
    {
      q: "Can I link external accounts?",
      a: "Yes, you can link external accounts for transfers, bill pay, and more.",
    },
    {
      q: "What's your customer support like?",
      a: "Available 24/7 via chat, phone, or email. Average response time is under 2 minutes.",
    },
    {
      q: "Is the mobile app available on all devices?",
      a: "Yes, the mobile app works on iOS and Android, and you can also use our web platform.",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <CreditCard className="w-7 h-7 text-blue-600" />
            <span className="font-bold text-xl text-slate-900">Premier America</span>
          </motion.div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#accounts" className="text-slate-600 hover:text-slate-900 transition">
              Accounts
            </a>
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition">
              Features
            </a>
            <a href="#faq" className="text-slate-600 hover:text-slate-900 transition">
              FAQ
            </a>
            <a href="#support" className="text-slate-600 hover:text-slate-900 transition">
              Support
            </a>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => router.push("/auth/login")}>
                  Sign In
                </Button>
                <Button onClick={() => router.push("/auth/signup")} className="bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center space-y-8">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-700">Now Available in 50 States</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
            Modern Banking
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Without the Hassle
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Experience banking that actually works. Zero fees, instant transfers, and support when you need it. Join
            over 500,000 customers already banking smarter.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-base"
            >
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-slate-300 bg-transparent">
              Watch Demo
            </Button>
          </motion.div>

          {/* App Screenshot Mockup */}
          <motion.div variants={itemVariants} className="pt-12">
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-slate-900 rounded-3xl shadow-2xl p-6">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-center">
                  <CreditCard className="w-16 h-16 text-white mx-auto mb-4" />
                  <p className="text-white font-semibold text-lg">Your banking on your terms</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Account Tiers Section */}
      <section id="accounts" className="bg-slate-900 text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Account</h2>
            <p className="text-xl text-slate-400">The right banking solution for every life stage</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {accountTiers.map((tier, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group bg-slate-800/50 border border-slate-700 hover:border-blue-500 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="text-4xl mb-4">{tier.icon}</div>
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-teal-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push("/auth/signup")}
                >
                  Learn More
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Why Choose Premier America?</h2>
          <p className="text-xl text-slate-600">Everything you need for modern banking</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { icon: Zap, title: "Instant Transfers", desc: "Send money to anyone, instantly and for free" },
            { icon: Shield, title: "Bank-Level Security", desc: "256-bit encryption and FDIC insurance up to $250K" },
            { icon: Users, title: "24/7 Support", desc: "Award-winning customer service, always available" },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="p-8 bg-slate-50 border border-slate-200 rounded-2xl hover:shadow-lg transition"
            >
              <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-slate-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Loved by Thousands</h2>
            <p className="text-xl text-slate-600">Join customers who've switched and never looked back</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.title}</p>
                  </div>
                </div>
                <p className="text-slate-700 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setActiveTab(activeTab === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition text-left"
              >
                <span className="font-semibold text-slate-900">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-600 transition-transform ${activeTab === idx ? "rotate-180" : ""}`}
                />
              </button>
              {activeTab === idx && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-slate-700">{faq.a}</div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Ready to bank better?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl mb-8 text-white/90"
          >
            Join thousands of customers who've already made the switch.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-slate-50 h-12 px-8 text-base font-semibold"
            >
              Get Started Today <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12"
          >
            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Products</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Checking
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Savings
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Investing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Business
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Feedback
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Disclosures
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    FDIC Insurance
                  </a>
                </li>
              </ul>
            </div>
          </motion.div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <CreditCard className="w-5 h-5" />
              <span className="font-semibold text-white">Premier America Credit Union</span>
            </div>
            <p className="text-sm">© 2025 Premier America Credit Union. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
