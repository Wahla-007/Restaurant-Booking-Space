import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
 Phone,
 Mail,
 MapPin,
 Clock,
 Send,
 MessageSquare,
 ArrowRight,
 Headphones,
} from "lucide-react";
import { useState } from "react";

const contactMethods = [
 {
  icon: Phone,
  title: "Call Us",
  description: "Speak directly with our team for immediate assistance.",
  details: [
   { label: "Primary", value: "0328 0562360", href: "tel:03280562360" },
   { label: "Support", value: "0325 2337074", href: "tel:03252337074" },
  ],
  accent: "bg-[#00aa6c]/10 text-[#00aa6c]",
 },
 {
  icon: Mail,
  title: "Email Us",
  description: "Get thoughtful responses within 24 hours.",
  details: [
   {
    label: "General",
    value: "contact@reservekaru.com",
    href: "mailto:contact@reservekaru.com",
   },
   {
    label: "Partnerships",
    value: "discussion@reservekaru.com",
    href: "mailto:discussion@reservekaru.com",
   },
  ],
  accent: "bg-[#002b11]/10 text-[#002b11]",
 },
 {
  icon: MapPin,
  title: "Visit Us",
  description: "Drop by our office during working hours.",
  details: [
   {
    label: "Address",
    value: "Lahore, Punjab, Pakistan",
   },
  ],
  accent: "bg-[#00eb5b]/10 text-[#002b11]",
 },
 {
  icon: Clock,
  title: "Working Hours",
  description: "Our team is available during these hours.",
  details: [
   { label: "Mon – Fri", value: "9:00 AM – 6:00 PM" },
   { label: "Sat – Sun", value: "10:00 AM – 4:00 PM" },
  ],
  accent: "bg-amber-50 text-amber-600",
 },
];

const fadeUp = {
 hidden: { opacity: 0, y: 24 },
 visible: (i = 0) => ({
  opacity: 1,
  y: 0,
  transition: { duration: 0.5, delay: i * 0.1 },
 }),
};

export default function Contact() {
 const [form, setForm] = useState({
  name: "",
  email: "",
  subject: "",
  message: "",
 });
 const [submitted, setSubmitted] = useState(false);

 const handleChange = (e) =>
  setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

 const handleSubmit = (e) => {
  e.preventDefault();
  setSubmitted(true);
  setForm({ name: "", email: "", subject: "", message: "" });
  setTimeout(() => setSubmitted(false), 5000);
 };

 return (
  <div className="min-h-screen bg-white">
   {/* Hero Section */}
   <section className="relative overflow-hidden bg-[#002b11] pt-32 pb-20 sm:pb-28">
    {/* Decorative elements */}
    <div className="absolute inset-0 opacity-[0.04]">
     <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#00eb5b] blur-[120px]" />
     <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-[#00aa6c] blur-[140px]" />
    </div>

    <div className="relative max-w-4xl mx-auto px-6 text-center">
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#00eb5b] text-sm font-medium mb-6">
      <Headphones size={14} />
      We're here to help
     </motion.div>
     <motion.h1
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-5">
      Get in Touch
     </motion.h1>
     <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
      Have a question, feedback, or partnership inquiry? We'd love to hear from
      you. Reach out through any of the channels below.
     </motion.p>
    </div>
   </section>

   {/* Contact Cards */}
   <section className="max-w-6xl mx-auto px-6 -mt-12 sm:-mt-16 relative z-10">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
     {contactMethods.map((method, i) => {
      const Icon = method.icon;
      return (
       <motion.div
        key={method.title}
        custom={i}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-shadow duration-300">
        <div
         className={`w-11 h-11 rounded-xl ${method.accent} flex items-center justify-center mb-4`}>
         <Icon size={20} />
        </div>
        <h3 className="text-[15px] font-bold text-[#002b11] mb-1">
         {method.title}
        </h3>
        <p className="text-[13px] text-gray-400 leading-relaxed mb-4">
         {method.description}
        </p>
        <div className="space-y-2.5">
         {method.details.map((d) => (
          <div key={d.value}>
           <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
            {d.label}
           </p>
           {d.href ? (
            <a
             href={d.href}
             className="text-sm font-semibold text-[#002b11] hover:text-[#00aa6c] transition-colors">
             {d.value}
            </a>
           ) : (
            <p className="text-sm font-semibold text-[#002b11]">{d.value}</p>
           )}
          </div>
         ))}
        </div>
       </motion.div>
      );
     })}
    </div>
   </section>

   {/* Contact Form Section */}
   <section className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
     {/* Left - Info */}
     <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002b11] tracking-tight mb-5">
       Send us a message
      </h2>
      <p className="text-gray-500 leading-relaxed mb-8">
       Whether you're a restaurant owner looking to list your venue, a diner
       with feedback, or a partner with a big idea — drop us a line and our team
       will get back to you promptly.
      </p>

      <div className="space-y-5">
       <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#00aa6c]/10 flex items-center justify-center shrink-0 mt-0.5">
         <MessageSquare size={18} className="text-[#00aa6c]" />
        </div>
        <div>
         <h4 className="text-sm font-bold text-[#002b11] mb-1">
          Quick Response
         </h4>
         <p className="text-sm text-gray-400 leading-relaxed">
          We aim to respond to all inquiries within 24 hours during business
          days.
         </p>
        </div>
       </div>
       <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#002b11]/10 flex items-center justify-center shrink-0 mt-0.5">
         <Headphones size={18} className="text-[#002b11]" />
        </div>
        <div>
         <h4 className="text-sm font-bold text-[#002b11] mb-1">
          Dedicated Support
         </h4>
         <p className="text-sm text-gray-400 leading-relaxed">
          Restaurant partners get priority support with a dedicated account
          manager.
         </p>
        </div>
       </div>
      </div>
     </motion.div>

     {/* Right - Form */}
     <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.15 }}>
      {submitted ? (
       <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#00aa6c]/5 border border-[#00aa6c]/20 rounded-2xl p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-[#00aa6c]/10 flex items-center justify-center mx-auto mb-4">
         <Send size={22} className="text-[#00aa6c]" />
        </div>
        <h3 className="text-xl font-bold text-[#002b11] mb-2">Message Sent!</h3>
        <p className="text-sm text-gray-500">
         Thank you for reaching out. We'll get back to you within 24 hours.
        </p>
       </motion.div>
      ) : (
       <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-gray-50/50 border border-gray-100 rounded-2xl p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
          <label className="block text-xs font-semibold text-[#002b11] mb-1.5">
           Full Name
          </label>
          <input
           type="text"
           name="name"
           value={form.name}
           onChange={handleChange}
           required
           placeholder="John Doe"
           className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#002b11] placeholder:text-gray-300 focus:outline-none focus:border-[#00aa6c] focus:ring-2 focus:ring-[#00aa6c]/10 transition-all bg-white"
          />
         </div>
         <div>
          <label className="block text-xs font-semibold text-[#002b11] mb-1.5">
           Email Address
          </label>
          <input
           type="email"
           name="email"
           value={form.email}
           onChange={handleChange}
           required
           placeholder="you@example.com"
           className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#002b11] placeholder:text-gray-300 focus:outline-none focus:border-[#00aa6c] focus:ring-2 focus:ring-[#00aa6c]/10 transition-all bg-white"
          />
         </div>
        </div>
        <div>
         <label className="block text-xs font-semibold text-[#002b11] mb-1.5">
          Subject
         </label>
         <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
          placeholder="How can we help?"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#002b11] placeholder:text-gray-300 focus:outline-none focus:border-[#00aa6c] focus:ring-2 focus:ring-[#00aa6c]/10 transition-all bg-white"
         />
        </div>
        <div>
         <label className="block text-xs font-semibold text-[#002b11] mb-1.5">
          Message
         </label>
         <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={5}
          placeholder="Tell us more about your inquiry..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#002b11] placeholder:text-gray-300 focus:outline-none focus:border-[#00aa6c] focus:ring-2 focus:ring-[#00aa6c]/10 transition-all bg-white resize-none"
         />
        </div>
        <motion.button
         type="submit"
         whileHover={{ scale: 1.02 }}
         whileTap={{ scale: 0.98 }}
         className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#002b11] hover:bg-[#003d18] text-white text-sm font-semibold transition-colors cursor-pointer">
         <Send size={16} />
         Send Message
        </motion.button>
       </form>
      )}
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
