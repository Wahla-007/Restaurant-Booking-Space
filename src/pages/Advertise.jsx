import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
 Eye,
 MousePointerClick,
 TrendingUp,
 Users,
 BarChart3,
 Megaphone,
 CheckCircle2,
 ArrowRight,
 Zap,
 Globe,
 Star,
 Shield,
} from "lucide-react";

const plans = [
 {
  name: "Starter",
  price: "4,999",
  period: "/month",
  description: "Perfect for local restaurants looking to boost visibility.",
  highlight: false,
  features: [
   "1 Banner Ad Placement",
   "Up to 5,000 impressions/month",
   "Homepage carousel placement",
   "Basic analytics dashboard",
   "Standard support",
   "7-day free trial",
  ],
  cta: "Get Started",
  stats: { reach: "5K+", ctr: "1.8%", audience: "Local" },
 },
 {
  name: "Growth",
  price: "12,999",
  period: "/month",
  description:
   "Ideal for growing brands that want maximum reach and engagement.",
  highlight: true,
  badge: "Most Popular",
  features: [
   "3 Banner Ad Placements",
   "Up to 25,000 impressions/month",
   "Homepage + Search + Detail pages",
   "Advanced analytics & click tracking",
   "A/B testing support",
   "Priority support",
   "Custom targeting by city & cuisine",
   "14-day free trial",
  ],
  cta: "Start Free Trial",
  stats: { reach: "25K+", ctr: "3.2%", audience: "Regional" },
 },
 {
  name: "Enterprise",
  price: "Custom",
  period: "",
  description:
   "For large chains and brands requiring premium, platform-wide visibility.",
  highlight: false,
  features: [
   "Unlimited Banner Ads",
   "Unlimited impressions",
   "All pages + exclusive placements",
   "Real-time analytics & reports",
   "Dedicated account manager",
   "Custom creatives support",
   "API access for campaign management",
   "White-glove onboarding",
  ],
  cta: "Contact Sales",
  stats: { reach: "100K+", ctr: "4.5%+", audience: "Nationwide" },
 },
];

const metrics = [
 {
  icon: Eye,
  value: "500K+",
  label: "Monthly Impressions",
  description: "Across all pages and placements",
 },
 {
  icon: Users,
  value: "120K+",
  label: "Active Diners",
  description: "Unique monthly visitors",
 },
 {
  icon: MousePointerClick,
  value: "3.2%",
  label: "Avg. Click Rate",
  description: "Industry-leading engagement",
 },
 {
  icon: TrendingUp,
  value: "85%",
  label: "Brand Recall",
  description: "Among frequent platform users",
 },
];

const adPlacements = [
 {
  title: "Homepage Hero Banner",
  description:
   "Premium above-the-fold placement visible to every visitor arriving on ReserveKaru.",
  position: "Top of homepage",
  format: "1200×400 or responsive",
  visibility: "Highest",
 },
 {
  title: "Search Results Banner",
  description:
   "Appears inline within search results, seamlessly integrated with restaurant listings.",
  position: "Between search results",
  format: "728×90 or responsive",
  visibility: "High",
 },
 {
  title: "Restaurant Detail Sidebar",
  description:
   "Shown alongside restaurant details when users are actively browsing a venue.",
  position: "Detail page sidebar",
  format: "300×250 or responsive",
  visibility: "Targeted",
 },
 {
  title: "Category Page Feature",
  description:
   "Featured placement within cuisine or trending category pages for niche targeting.",
  position: "Category sections",
  format: "600×200 or responsive",
  visibility: "Niche",
 },
];

const fadeUp = {
 hidden: { opacity: 0, y: 24 },
 visible: (i = 0) => ({
  opacity: 1,
  y: 0,
  transition: { duration: 0.5, delay: i * 0.08 },
 }),
};

export default function Advertise() {
 return (
  <div className="min-h-screen bg-white">
   {/* Hero */}
   <section className="relative overflow-hidden bg-[#002b11] pt-32 pb-24 sm:pb-32">
    <div className="absolute inset-0 opacity-[0.04]">
     <div className="absolute top-10 left-20 w-80 h-80 rounded-full bg-[#00eb5b] blur-[140px]" />
     <div className="absolute bottom-0 right-10 w-[500px] h-[500px] rounded-full bg-[#00aa6c] blur-[180px]" />
    </div>

    <div className="relative max-w-4xl mx-auto px-6 text-center">
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#00eb5b] text-sm font-medium mb-6">
      <Megaphone size={14} />
      Advertise with ReserveKaru
     </motion.div>
     <motion.h1
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-5">
      Put your brand in front of
      <span className="text-[#00eb5b]"> hungry diners</span>
     </motion.h1>
     <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
      Reach thousands of food enthusiasts actively searching for their next
      meal. Our targeted banner ads deliver real results with measurable ROI.
     </motion.p>
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <a
       href="#pricing"
       className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#00eb5b] hover:bg-[#00d753] text-[#002b11] text-sm font-bold transition-colors">
       View Pricing
       <ArrowRight size={16} />
      </a>
      <Link
       to="/contact"
       className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors border border-white/10">
       Talk to Sales
      </Link>
     </motion.div>
    </div>
   </section>

   {/* Platform Metrics */}
   <section className="max-w-6xl mx-auto px-6 -mt-12 sm:-mt-16 relative z-10">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
     {metrics.map((m, i) => {
      const Icon = m.icon;
      return (
       <motion.div
        key={m.label}
        custom={i}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-center">
        <div className="w-10 h-10 rounded-xl bg-[#00aa6c]/10 flex items-center justify-center mx-auto mb-3">
         <Icon size={20} className="text-[#00aa6c]" />
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-[#002b11] tracking-tight">
         {m.value}
        </p>
        <p className="text-xs font-bold text-[#002b11] mt-1">{m.label}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{m.description}</p>
       </motion.div>
      );
     })}
    </div>
   </section>

   {/* Why Advertise */}
   <section className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
    <div className="text-center mb-14">
     <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl sm:text-4xl font-extrabold text-[#002b11] tracking-tight mb-4">
      Why advertise on ReserveKaru?
     </motion.h2>
     <motion.p
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-gray-500 max-w-2xl mx-auto">
      Your ads reach people who are actively looking to dine out — not passively
      scrolling. That means higher intent, better conversions, and real foot
      traffic to your business.
     </motion.p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
     {[
      {
       icon: Zap,
       title: "High-Intent Audience",
       desc:
        "Every visitor is actively searching for a restaurant. Your ad reaches people ready to make a booking decision right now.",
      },
      {
       icon: BarChart3,
       title: "Transparent Analytics",
       desc:
        "Track impressions, clicks, and conversions in real-time. Know exactly what your ad spend delivers with our detailed dashboard.",
      },
      {
       icon: Globe,
       title: "City-Level Targeting",
       desc:
        "Target diners in specific cities or cuisines. Your budget goes where it matters — reaching your exact customer demographic.",
      },
      {
       icon: Star,
       title: "Premium Placements",
       desc:
        "Your brand appears alongside trusted restaurant listings, inheriting the credibility and attention of our platform.",
      },
      {
       icon: Shield,
       title: "Brand-Safe Environment",
       desc:
        "Every ad is reviewed to maintain quality. Your brand appears in a clean, professional, food-focused context only.",
      },
      {
       icon: Users,
       title: "Growing User Base",
       desc:
        "Our platform is rapidly expanding. Early advertisers lock in rates and build awareness as our audience continues to grow.",
      },
     ].map((item, i) => {
      const Icon = item.icon;
      return (
       <motion.div
        key={item.title}
        custom={i}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="bg-gray-50/60 border border-gray-100 rounded-2xl p-6 hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-shadow duration-300">
        <div className="w-10 h-10 rounded-xl bg-[#002b11]/[0.06] flex items-center justify-center mb-4">
         <Icon size={20} className="text-[#002b11]" />
        </div>
        <h3 className="text-[15px] font-bold text-[#002b11] mb-2">
         {item.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
       </motion.div>
      );
     })}
    </div>
   </section>

   {/* Ad Placements */}
   <section className="bg-gray-50/50 border-y border-gray-100 py-20 sm:py-28">
    <div className="max-w-6xl mx-auto px-6">
     <div className="text-center mb-14">
      <motion.h2
       initial={{ opacity: 0, y: 20 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       className="text-3xl sm:text-4xl font-extrabold text-[#002b11] tracking-tight mb-4">
       Ad Placements
      </motion.h2>
      <motion.p
       initial={{ opacity: 0, y: 16 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       transition={{ delay: 0.1 }}
       className="text-gray-500 max-w-2xl mx-auto">
       Choose from multiple high-visibility placements across our platform, each
       designed to capture attention at the right moment.
      </motion.p>
     </div>

     <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {adPlacements.map((placement, i) => (
       <motion.div
        key={placement.title}
        custom={i}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-3">
         <h3 className="text-[15px] font-bold text-[#002b11]">
          {placement.title}
         </h3>
         <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#00aa6c]/10 text-[10px] font-bold text-[#00aa6c] uppercase tracking-wider">
          {placement.visibility}
         </span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed mb-4">
         {placement.description}
        </p>
        <div className="flex flex-wrap gap-3 text-[12px]">
         <span className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 font-medium">
          📍 {placement.position}
         </span>
         <span className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 font-medium">
          📐 {placement.format}
         </span>
        </div>
       </motion.div>
      ))}
     </div>
    </div>
   </section>

   {/* Pricing */}
   <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
    <div className="text-center mb-14">
     <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl sm:text-4xl font-extrabold text-[#002b11] tracking-tight mb-4">
      Simple, transparent pricing
     </motion.h2>
     <motion.p
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-gray-500 max-w-2xl mx-auto">
      No hidden fees, no long-term commitments. Choose a plan that fits your
      goals and start reaching diners today.
     </motion.p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
     {plans.map((plan, i) => (
      <motion.div
       key={plan.name}
       custom={i}
       initial="hidden"
       whileInView="visible"
       viewport={{ once: true }}
       variants={fadeUp}
       className={`relative rounded-2xl p-7 sm:p-8 transition-shadow duration-300 ${
        plan.highlight
         ? "bg-[#002b11] text-white shadow-[0_12px_48px_rgba(0,43,17,0.25)] ring-1 ring-[#00aa6c]/30 scale-[1.02]"
         : "bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
       }`}>
       {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00eb5b] text-[#002b11] text-xs font-bold">
         {plan.badge}
        </div>
       )}

       <h3
        className={`text-lg font-extrabold tracking-tight mb-1 ${plan.highlight ? "text-white" : "text-[#002b11]"}`}>
        {plan.name}
       </h3>
       <p
        className={`text-sm mb-5 ${plan.highlight ? "text-white/50" : "text-gray-400"}`}>
        {plan.description}
       </p>

       <div className="flex items-baseline gap-1 mb-6">
        <span
         className={`text-4xl font-extrabold tracking-tight ${plan.highlight ? "text-white" : "text-[#002b11]"}`}>
         {plan.price === "Custom" ? "" : "PKR "}
         {plan.price}
        </span>
        {plan.period && (
         <span
          className={`text-sm ${plan.highlight ? "text-white/40" : "text-gray-400"}`}>
          {plan.period}
         </span>
        )}
       </div>

       {/* Stats row */}
       <div
        className={`flex items-center gap-3 mb-6 p-3 rounded-xl ${plan.highlight ? "bg-white/[0.06]" : "bg-gray-50"}`}>
        {Object.entries(plan.stats).map(([key, val]) => (
         <div key={key} className="flex-1 text-center">
          <p
           className={`text-sm font-bold ${plan.highlight ? "text-[#00eb5b]" : "text-[#00aa6c]"}`}>
           {val}
          </p>
          <p
           className={`text-[10px] uppercase tracking-wider font-semibold mt-0.5 ${plan.highlight ? "text-white/30" : "text-gray-300"}`}>
           {key === "ctr"
            ? "Avg CTR"
            : key.charAt(0).toUpperCase() + key.slice(1)}
          </p>
         </div>
        ))}
       </div>

       {/* Features */}
       <ul className="space-y-3 mb-8">
        {plan.features.map((f) => (
         <li key={f} className="flex items-start gap-2.5">
          <CheckCircle2
           size={16}
           className={`shrink-0 mt-0.5 ${plan.highlight ? "text-[#00eb5b]" : "text-[#00aa6c]"}`}
          />
          <span
           className={`text-sm ${plan.highlight ? "text-white/70" : "text-gray-500"}`}>
           {f}
          </span>
         </li>
        ))}
       </ul>

       <Link
        to="/contact"
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-colors ${
         plan.highlight
          ? "bg-[#00eb5b] hover:bg-[#00d753] text-[#002b11]"
          : "bg-[#002b11] hover:bg-[#003d18] text-white"
        }`}>
        {plan.cta}
        <ArrowRight size={15} />
       </Link>
      </motion.div>
     ))}
    </div>
   </section>

   {/* CTA Section */}
   <section className="bg-[#002b11] py-20 sm:py-24">
    <div className="max-w-3xl mx-auto px-6 text-center">
     <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
      Ready to grow your business?
     </motion.h2>
     <motion.p
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-white/50 mb-8 max-w-xl mx-auto">
      Join dozens of restaurants and food brands already reaching thousands of
      diners on ReserveKaru every day.
     </motion.p>
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <Link
       to="/contact"
       className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#00eb5b] hover:bg-[#00d753] text-[#002b11] text-sm font-bold transition-colors">
       Get Started Today
       <ArrowRight size={16} />
      </Link>
      <a
       href="mailto:discussion@reservekaru.com"
       className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors border border-white/10">
       Email Us Directly
      </a>
     </motion.div>
    </div>
   </section>

   {/* Footer */}
   <footer className="border-t border-gray-100 py-10 bg-white">
    <div className="max-w-7xl mx-auto px-6">
     <div className="flex flex-col md:flex-row items-center justify-between gap-5">
      <div className="flex items-center gap-2.5">
       <img src="/logo/logo.svg" alt="ReserveKaru" className="h-8 w-8" />
       <span className="text-lg font-bold tracking-tight text-[#002b11]">
        ReserveKaru
       </span>
      </div>
      <div className="flex items-center gap-8">
       {[
        { label: "Privacy", to: "/privacy" },
        { label: "Terms", to: "/terms" },
        { label: "Advertise", to: "/advertise" },
        { label: "Contact", to: "/contact" },
       ].map((link) => (
        <Link
         key={link.label}
         to={link.to}
         className="text-xs cursor-pointer text-gray-400 hover:text-[#002b11] transition-colors font-medium">
         {link.label}
        </Link>
       ))}
      </div>
      <p className="text-xs text-[#002b11]">
       © 2026 ReserveKaru. All rights reserved.
      </p>
     </div>
    </div>
   </footer>
  </div>
 );
}
