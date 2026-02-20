import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
 ChevronDown,
 Check,
 Star,
 BarChart3,
 CalendarCheck,
 Bell,
 Shield,
 Users,
 TrendingUp,
 Clock,
 Sparkles,
 ArrowRight,
 Zap,
 MessageSquare,
 Settings,
 Menu,
 X,
} from "lucide-react";

const navLinks = [
 { label: "Features", href: "#features" },
 { label: "How It Works", href: "#how-it-works" },
 { label: "Pricing", href: "#pricing" },
 { label: "FAQs", href: "#faqs" },
];

const features = [
 {
  icon: CalendarCheck,
  title: "Smart Reservations",
  description:
   "Manage all bookings in one dashboard. Accept, decline, or reschedule with real-time updates sent to diners instantly.",
  image:
   "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80",
 },
 {
  icon: BarChart3,
  title: "Analytics & Insights",
  description:
   "Track footfall, peak hours, revenue trends, and customer preferences with rich visual dashboards.",
  image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
 },
 {
  icon: Bell,
  title: "Instant Notifications",
  description:
   "Get real-time alerts for new bookings, reviews, and support tickets. Never miss an opportunity.",
  image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
 },
 {
  icon: Star,
  title: "Review Management",
  description:
   "Monitor and respond to customer reviews. Build your reputation with verified diner feedback.",
  image:
   "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
 },
 {
  icon: Settings,
  title: "Full Control",
  description:
   "Update your menu, hours, images, and profile anytime. Your restaurant, your rules.",
  image:
   "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
 },
 {
  icon: Users,
  title: "Reach More Diners",
  description:
   "Get discovered by thousands of hungry customers searching for restaurants in your city.",
  image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&q=80",
 },
];

const pricingPlans = [
 {
  name: "Starter",
  price: 0,
  period: "forever",
  description: "Perfect for trying out ReserveKaru",
  features: [
   "Up to 20 reservations/month",
   "Basic restaurant profile",
   "Email notifications",
   "Community support",
  ],
  cta: "Start Free",
  popular: false,
 },
 {
  name: "Professional",
  price: 10,
  originalPrice: 17,
  period: "month",
  description: "Everything you need to grow your business",
  discount: "RAMADAN2026",
  discountPercent: 40,
  features: [
   "Unlimited reservations",
   "Advanced analytics dashboard",
   "Real-time push notifications",
   "Review management tools",
   "Priority support",
   "Menu management",
   "Custom branding",
  ],
  cta: "Get Started",
  popular: true,
 },
 {
  name: "Enterprise",
  price: 29,
  period: "month",
  description: "For restaurant chains & premium venues",
  features: [
   "Everything in Professional",
   "Multi-location support",
   "Dedicated account manager",
   "API access",
   "Custom integrations",
   "White-label options",
   "SLA guarantee",
  ],
  cta: "Contact Sales",
  popular: false,
 },
];

const faqs = [
 {
  question: "How do I list my restaurant on ReserveKaru?",
  answer:
   "Simply sign up with a business account, fill in your restaurant details, upload photos, and set your availability. Our team will verify your listing within 24 hours and you'll be live on the platform.",
 },
 {
  question: "Is there a free trial available?",
  answer:
   "Yes! Our Starter plan is completely free forever with up to 20 reservations per month. You can upgrade to Professional anytime to unlock unlimited features.",
 },
 {
  question: "How does the Ramadan 2026 discount work?",
  answer:
   "Use code RAMADAN2026 at checkout to get 40% off the Professional plan — just $10/month instead of $17. This special offer is valid throughout the holy month of Ramadan 2026.",
 },
 {
  question: "Can I manage multiple restaurant locations?",
  answer:
   "Absolutely! Our Enterprise plan supports multi-location management with a unified dashboard to oversee all your venues from one place.",
 },
 {
  question: "What kind of analytics do I get?",
  answer:
   "You'll see booking trends, peak hours, customer demographics, revenue analytics, review sentiment analysis, and traffic sources — all in beautiful visual charts.",
 },
 {
  question: "How do customers find my restaurant?",
  answer:
   "Your restaurant appears in search results based on cuisine, location, and ratings. Featured listings get premium placement on the homepage and in search results.",
 },
 {
  question: "Can I cancel my subscription anytime?",
  answer:
   "Yes, you can cancel anytime with no hidden fees. Your account will continue until the end of your billing cycle, and you can downgrade to the free Starter plan.",
 },
];

const stats = [
 { value: "10K+", label: "Active Diners" },
 { value: "500+", label: "Restaurants" },
 { value: "50K+", label: "Reservations" },
 { value: "4.9", label: "Average Rating" },
];

export default function BusinessPage() {
 const navigate = useNavigate();
 const [openFaq, setOpenFaq] = useState(null);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [scrolled, setScrolled] = useState(false);

 useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 10);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
 }, []);

 const scrollToSection = (href) => {
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (el) {
   el.scrollIntoView({ behavior: "smooth" });
  }
  setMobileMenuOpen(false);
 };

 return (
  <div className="min-h-screen bg-white">
   {/* Business Navbar */}
   <nav
    className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
     scrolled ? "shadow-sm" : ""
    }`}>
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
     <div className="flex items-center justify-between h-[68px]">
      {/* Logo */}
      <button
       onClick={() => navigate("/")}
       className="flex items-center gap-2.5 cursor-pointer">
       <img src="/logo/logo.svg" alt="ReserveKaru" className="w-8 h-8" />
       <div className="flex flex-col leading-tight">
        <span className="text-[18px] font-[900] tracking-tight text-[#002b11]">
         ReserveKaru
        </span>
        <span className="text-[11px] font-semibold text-[#00aa6c] -mt-0.5 tracking-wide">
         for Business
        </span>
       </div>
      </button>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8">
       {navLinks.map((link) => (
        <button
         key={link.label}
         onClick={() => scrollToSection(link.href)}
         className="text-[15px] font-semibold text-[#002b11]/70 hover:text-[#002b11] transition-colors cursor-pointer relative py-1">
         {link.label}
        </button>
       ))}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
       <button
        onClick={() => navigate("/login")}
        className="hidden md:inline-flex px-6 py-2 rounded-full border-2 border-[#002b11] text-[#002b11] font-bold text-sm hover:bg-[#002b11] hover:text-white transition-all cursor-pointer">
        Log in
       </button>

       {/* Mobile Menu Toggle */}
       <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-[#002b11] cursor-pointer">
        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
       </button>
      </div>
     </div>
    </div>

    {/* Mobile Menu */}
    <AnimatePresence>
     {mobileMenuOpen && (
      <motion.div
       initial={{ height: 0, opacity: 0 }}
       animate={{ height: "auto", opacity: 1 }}
       exit={{ height: 0, opacity: 0 }}
       transition={{ duration: 0.25 }}
       className="md:hidden overflow-hidden bg-white border-t border-gray-100">
       <div className="px-6 py-4 space-y-1">
        {navLinks.map((link) => (
         <button
          key={link.label}
          onClick={() => scrollToSection(link.href)}
          className="block w-full text-left px-3 py-3 rounded-lg text-[15px] font-semibold text-[#002b11]/70 hover:text-[#002b11] hover:bg-[#f7f7f7] transition-colors cursor-pointer">
          {link.label}
         </button>
        ))}
        <div className="pt-3 border-t border-gray-100 mt-2">
         <button
          onClick={() => {
           navigate("/login");
           setMobileMenuOpen(false);
          }}
          className="w-full px-3 py-3 rounded-full border-2 border-[#002b11] text-[#002b11] font-bold text-sm hover:bg-[#002b11] hover:text-white transition-all cursor-pointer">
          Log in
         </button>
        </div>
       </div>
      </motion.div>
     )}
    </AnimatePresence>
   </nav>

   {/* Spacer for fixed navbar */}
   <div className="h-[68px]" />
   {/* Hero Section */}
   <section className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-[#002b11] via-[#003d18] to-[#001a0a]" />
    {/* Subtle pattern overlay */}
    <div
     className="absolute inset-0 opacity-[0.03]"
     style={{
      backgroundImage:
       "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
      backgroundSize: "40px 40px",
     }}
    />

    <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
     <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
      {/* Left — Text */}
      <motion.div
       initial={{ opacity: 0, x: -30 }}
       animate={{ opacity: 1, x: 0 }}
       transition={{ duration: 0.6 }}
       className="flex-1 text-center lg:text-left">
       <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
        <Sparkles size={14} className="text-[#00aa6c]" />
        <span className="text-white/80 text-xs font-semibold tracking-wide uppercase">
         For Restaurant Owners
        </span>
       </div>

       <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-[900] text-white leading-[1.05] tracking-tight mb-6">
        Your restaurant
        <br />
        deserves to be
        <br />
        <span className="text-[#00aa6c]">discovered</span>
       </h1>

       <p className="text-white/55 text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
        Join hundreds of restaurants using ReserveKaru to fill tables, manage
        bookings, and grow their business.
       </p>

       <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
        <motion.button
         whileHover={{ scale: 1.03 }}
         whileTap={{ scale: 0.97 }}
         onClick={() => navigate("/signup")}
         className="px-8 py-4 bg-[#00aa6c] hover:bg-[#009960] text-white font-bold text-[15px] rounded-full transition-colors shadow-lg shadow-[#00aa6c]/25 cursor-pointer">
         List Your Restaurant — It's Free
        </motion.button>
        <button
         onClick={() => {
          const el = document.getElementById("pricing");
          el?.scrollIntoView({ behavior: "smooth" });
         }}
         className="flex items-center gap-2 text-white/60 hover:text-white text-[15px] font-semibold transition-colors cursor-pointer">
         View Pricing
         <ArrowRight size={16} />
        </button>
       </div>
      </motion.div>

      {/* Right — Image Grid */}
      <motion.div
       initial={{ opacity: 0, x: 30 }}
       animate={{ opacity: 1, x: 0 }}
       transition={{ duration: 0.6, delay: 0.15 }}
       className="flex-1 w-full max-w-lg lg:max-w-none">
       <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
         <div className="rounded-2xl overflow-hidden aspect-[4/5]">
          <img
           src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80"
           alt="Restaurant interior"
           className="w-full h-full object-cover"
          />
         </div>
         <div className="rounded-2xl overflow-hidden aspect-square bg-[#00aa6c] p-6 flex flex-col justify-end">
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">
           Revenue Growth
          </p>
          <p className="text-white text-3xl font-[900]">+127%</p>
          <p className="text-white/60 text-xs mt-1">Average partner increase</p>
         </div>
        </div>
        <div className="space-y-3 pt-8">
         <div className="rounded-2xl overflow-hidden aspect-square">
          <img
           src="https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&q=80"
           alt="Happy diners"
           className="w-full h-full object-cover"
          />
         </div>
         <div className="rounded-2xl overflow-hidden aspect-[4/5]">
          <img
           src="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80"
           alt="Chef plating food"
           className="w-full h-full object-cover"
          />
         </div>
        </div>
       </div>
      </motion.div>
     </div>
    </div>
   </section>

   {/* Stats Bar */}
   <section className="bg-[#f7f7f7] border-y border-gray-100">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
     <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, i) => (
       <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: i * 0.1 }}
        className="text-center">
        <p className="text-3xl sm:text-4xl font-[900] text-[#002b11] tracking-tight">
         {stat.value}
        </p>
        <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
       </motion.div>
      ))}
     </div>
    </div>
   </section>

   {/* Features Section */}
   <section id="features" className="py-20 sm:py-28">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center mb-16">
      <span className="text-xs font-bold tracking-widest text-[#00aa6c] uppercase mb-2 block">
       Why ReserveKaru
      </span>
      <h2 className="text-3xl sm:text-4xl font-[900] text-[#002b11] tracking-tight mb-4">
       Everything you need to run
       <br className="hidden sm:block" /> a successful restaurant
      </h2>
      <p className="text-gray-500 max-w-xl mx-auto">
       Powerful tools designed specifically for restaurant owners who want to
       focus on what matters — great food and happy customers.
      </p>
     </motion.div>

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, i) => {
       const Icon = feature.icon;
       return (
        <motion.div
         key={feature.title}
         initial={{ opacity: 0, y: 24 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         transition={{ duration: 0.4, delay: i * 0.08 }}
         className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
         <div className="h-44 overflow-hidden">
          <img
           src={feature.image}
           alt={feature.title}
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
         </div>
         <div className="p-6">
          <div className="w-10 h-10 rounded-xl bg-[#002b11]/[0.06] flex items-center justify-center mb-4 group-hover:bg-[#00aa6c]/10 transition-colors">
           <Icon
            size={20}
            className="text-[#002b11]/60 group-hover:text-[#00aa6c] transition-colors"
           />
          </div>
          <h3 className="text-lg font-bold text-[#002b11] mb-2">
           {feature.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
           {feature.description}
          </p>
         </div>
        </motion.div>
       );
      })}
     </div>
    </div>
   </section>

   {/* How It Works */}
   <section id="how-it-works" className="py-20 sm:py-28 bg-[#f7f7f7]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center mb-16">
      <span className="text-xs font-bold tracking-widest text-[#00aa6c] uppercase mb-2 block">
       Simple Setup
      </span>
      <h2 className="text-3xl sm:text-4xl font-[900] text-[#002b11] tracking-tight">
       Go live in 3 easy steps
      </h2>
     </motion.div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
       {
        step: "01",
        icon: Users,
        title: "Create Your Account",
        description:
         "Sign up as a business owner. It takes less than 2 minutes to get started.",
       },
       {
        step: "02",
        icon: Settings,
        title: "Set Up Your Profile",
        description:
         "Add your restaurant details, menu highlights, opening hours, and upload stunning photos.",
       },
       {
        step: "03",
        icon: TrendingUp,
        title: "Start Receiving Bookings",
        description:
         "Go live and watch reservations roll in. Manage everything from your dashboard.",
       },
      ].map((item, i) => {
       const Icon = item.icon;
       return (
        <motion.div
         key={item.step}
         initial={{ opacity: 0, y: 24 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         transition={{ duration: 0.4, delay: i * 0.12 }}
         className="relative bg-white p-8 rounded-2xl border border-gray-100">
         <span className="text-[72px] font-[900] text-[#002b11]/[0.04] leading-none absolute top-4 right-6 select-none">
          {item.step}
         </span>
         <div className="w-12 h-12 rounded-xl bg-[#00aa6c]/10 flex items-center justify-center mb-5">
          <Icon size={22} className="text-[#00aa6c]" />
         </div>
         <h3 className="text-lg font-bold text-[#002b11] mb-2">{item.title}</h3>
         <p className="text-sm text-gray-500 leading-relaxed">
          {item.description}
         </p>
        </motion.div>
       );
      })}
     </div>
    </div>
   </section>

   {/* Pricing Section */}
   <section id="pricing" className="py-20 sm:py-28">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center mb-16">
      <span className="text-xs font-bold tracking-widest text-[#00aa6c] uppercase mb-2 block">
       Pricing
      </span>
      <h2 className="text-3xl sm:text-4xl font-[900] text-[#002b11] tracking-tight mb-4">
       Plans that grow with you
      </h2>
      <p className="text-gray-500 max-w-md mx-auto">
       Start free, upgrade when ready. No hidden fees, cancel anytime.
      </p>
     </motion.div>

     {/* Ramadan Banner */}
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-[#002b11] to-[#004d1f] rounded-2xl p-6 flex items-center gap-5">
      <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
       <span className="text-2xl">🌙</span>
      </div>
      <div>
       <h3 className="text-white font-bold text-lg">
        Ramadan 2026 Special — 40% Off
       </h3>
       <p className="text-white/60 text-sm mt-0.5">
        Use code <span className="text-[#00aa6c] font-bold">RAMADAN2026</span>{" "}
        to get Professional plan at just $10/month
       </p>
      </div>
     </motion.div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {pricingPlans.map((plan, i) => (
       <motion.div
        key={plan.name}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: i * 0.1 }}
        className={`relative rounded-2xl p-8 transition-all duration-300 ${
         plan.popular
          ? "bg-[#002b11] text-white shadow-2xl shadow-[#002b11]/20 scale-[1.03] border-2 border-[#00aa6c]/30"
          : "bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300"
        }`}>
        {plan.popular && (
         <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1.5 bg-[#00aa6c] text-white text-xs font-bold rounded-full shadow-lg">
           Most Popular
          </span>
         </div>
        )}

        {plan.discount && (
         <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00aa6c]/20 text-[#00aa6c] text-xs font-bold">
          🌙 {plan.discountPercent}% OFF — {plan.discount}
         </div>
        )}

        <h3
         className={`text-xl font-bold mb-1 ${plan.popular ? "text-white" : "text-[#002b11]"}`}>
         {plan.name}
        </h3>
        <p
         className={`text-sm mb-6 ${plan.popular ? "text-white/50" : "text-gray-400"}`}>
         {plan.description}
        </p>

        <div className="flex items-baseline gap-1.5 mb-6">
         {plan.originalPrice && (
          <span
           className={`text-lg line-through ${plan.popular ? "text-white/30" : "text-gray-300"}`}>
           ${plan.originalPrice}
          </span>
         )}
         <span
          className={`text-5xl font-[900] tracking-tight ${plan.popular ? "text-white" : "text-[#002b11]"}`}>
          ${plan.price}
         </span>
         <span
          className={`text-sm ${plan.popular ? "text-white/40" : "text-gray-400"}`}>
          /{plan.period}
         </span>
        </div>

        <ul className="space-y-3 mb-8">
         {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
           <Check
            size={16}
            className={`mt-0.5 shrink-0 ${plan.popular ? "text-[#00aa6c]" : "text-[#00aa6c]"}`}
           />
           <span
            className={`text-sm ${plan.popular ? "text-white/70" : "text-gray-600"}`}>
            {feature}
           </span>
          </li>
         ))}
        </ul>

        <motion.button
         whileHover={{ scale: 1.02 }}
         whileTap={{ scale: 0.98 }}
         onClick={() => navigate("/signup")}
         className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
          plan.popular
           ? "bg-[#00aa6c] hover:bg-[#009960] text-white shadow-lg"
           : "bg-[#002b11]/[0.06] hover:bg-[#002b11]/[0.1] text-[#002b11]"
         }`}>
         {plan.cta}
        </motion.button>
       </motion.div>
      ))}
     </div>
    </div>
   </section>

   {/* Testimonial / Social Proof */}
   <section className="py-20 sm:py-28 bg-[#f7f7f7]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
     <div className="max-w-3xl mx-auto">
      <motion.div
       initial={{ opacity: 0, y: 20 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       transition={{ duration: 0.5 }}
       className="text-center">
       <div className="flex items-center justify-center gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
         <Star key={i} size={20} className="text-[#00aa6c] fill-[#00aa6c]" />
        ))}
       </div>
       <p className="text-xl sm:text-2xl text-[#002b11]/80 font-medium leading-relaxed mb-8">
        "Since joining ReserveKaru, our restaurant has seen a 140% increase in
        reservations. The dashboard is incredibly intuitive and the customer
        support is outstanding. Best decision we've made."
       </p>
       <div className="flex items-center justify-center gap-4">
        <img
         src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&q=80"
         alt="Chef Ahmed"
         className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
        />
        <div className="text-left">
         <p className="font-bold text-[#002b11]">Chef Ahmed Raza</p>
         <p className="text-sm text-gray-400">
          Owner, The Spice Route — Lahore
         </p>
        </div>
       </div>
      </motion.div>
     </div>
    </div>
   </section>

   {/* FAQs Section */}
   <section id="faqs" className="py-20 sm:py-28">
    <div className="max-w-3xl mx-auto px-6 lg:px-8">
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center mb-14">
      <span className="text-xs font-bold tracking-widest text-[#00aa6c] uppercase mb-2 block">
       FAQs
      </span>
      <h2 className="text-3xl sm:text-4xl font-[900] text-[#002b11] tracking-tight">
       Frequently asked questions
      </h2>
     </motion.div>

     <div className="space-y-3">
      {faqs.map((faq, i) => (
       <motion.div
        key={i}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: i * 0.05 }}
        className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 transition-colors">
        <button
         onClick={() => setOpenFaq(openFaq === i ? null : i)}
         className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer">
         <span className="text-[15px] font-semibold text-[#002b11] pr-4">
          {faq.question}
         </span>
         <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-300 ${
           openFaq === i ? "rotate-180" : ""
          }`}
         />
        </button>
        <AnimatePresence>
         {openFaq === i && (
          <motion.div
           initial={{ height: 0, opacity: 0 }}
           animate={{ height: "auto", opacity: 1 }}
           exit={{ height: 0, opacity: 0 }}
           transition={{ duration: 0.25 }}
           className="overflow-hidden">
           <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">
            {faq.answer}
           </p>
          </motion.div>
         )}
        </AnimatePresence>
       </motion.div>
      ))}
     </div>
    </div>
   </section>

   {/* Final CTA */}
   <section className="py-20 sm:py-28 bg-[#002b11] relative overflow-hidden">
    {/* Decorative blur */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00aa6c]/10 blur-3xl" />

    <div className="relative max-w-3xl mx-auto px-6 text-center">
     <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}>
      <h2 className="text-3xl sm:text-5xl font-[900] text-white tracking-tight mb-5 leading-tight">
       Ready to fill every table,
       <br />
       every night?
      </h2>
      <p className="text-white/50 mb-10 max-w-lg mx-auto text-lg">
       Join ReserveKaru today and start growing your restaurant business with
       powerful tools and a community of food lovers.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
       <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/signup")}
        className="px-10 py-4 rounded-full bg-[#00aa6c] hover:bg-[#009960] text-white font-bold text-[15px] shadow-lg shadow-[#00aa6c]/25 transition-colors cursor-pointer">
        Get Started for Free
       </motion.button>
       <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/")}
        className="px-10 py-4 rounded-full border-2 border-white/15 text-white/70 hover:text-white hover:border-white/30 font-bold text-[15px] transition-all cursor-pointer">
        Back to Home
       </motion.button>
      </div>
     </motion.div>
    </div>
   </section>

   {/* Footer */}
   <footer className="border-t border-gray-100 py-10 bg-white">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
     <div className="flex flex-col md:flex-row items-center justify-between gap-5">
      <div className="flex items-center gap-2.5">
       <img src="/logo/logo.svg" alt="ReserveKaru" className="w-7 h-7" />
       <span className="text-lg font-bold tracking-tight text-[#002b11]">
        ReserveKaru
       </span>
      </div>
      <p className="text-xs text-gray-400">
       © 2026 ReserveKaru. All rights reserved.
      </p>
     </div>
    </div>
   </footer>
  </div>
 );
}
