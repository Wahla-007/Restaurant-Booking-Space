import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const sections = [
 {
  title: "1. Information We Collect",
  content: [
   "When you use ReserveKaru, we may collect the following types of information:",
   "**Personal Information:** Name, email address, phone number, and other details you provide when creating an account or making a reservation.",
   "**Booking Information:** Restaurant preferences, reservation dates, party sizes, and special requests associated with your bookings.",
   "**Location Data:** With your permission, we collect approximate location data to show nearby restaurants and personalize your experience.",
   "**Usage Data:** Pages visited, search queries, clicks, device type, browser, and IP address collected automatically through cookies and similar technologies.",
   "**Communications:** Messages, feedback, and correspondence sent to our support team.",
  ],
 },
 {
  title: "2. How We Use Your Information",
  content: [
   "We use the information we collect to:",
   "• Process and manage your restaurant reservations",
   "• Personalize your experience with relevant recommendations",
   "• Send booking confirmations, reminders, and receipts via email",
   "• Improve our platform's performance, features, and user experience",
   "• Respond to your inquiries and provide customer support",
   "• Detect and prevent fraud, abuse, and security threats",
   "• Comply with legal obligations and enforce our terms",
  ],
 },
 {
  title: "3. Information Sharing",
  content: [
   "We do not sell your personal information. We may share your data in limited circumstances:",
   "**With Restaurants:** We share your name, contact details, and booking preferences with restaurants to fulfill your reservation.",
   "**Service Providers:** Trusted third-party services that help us operate (e.g., email delivery, analytics, payment processing) may access data as needed to perform their functions.",
   "**Legal Requirements:** We may disclose information if required by law, regulation, legal process, or governmental request.",
   "**Business Transfers:** In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.",
  ],
 },
 {
  title: "4. Data Security",
  content: [
   "We implement industry-standard security measures to protect your information, including:",
   "• Encrypted data transmission using SSL/TLS protocols",
   "• Secure server infrastructure with regular security audits",
   "• Access controls limiting data access to authorized personnel only",
   "• Regular monitoring for unauthorized access or suspicious activity",
   "While we strive to protect your data, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security but are committed to continuously improving our protections.",
  ],
 },
 {
  title: "5. Cookies & Tracking",
  content: [
   "We use cookies and similar technologies to:",
   "• Remember your preferences and login sessions",
   "• Analyze platform usage and traffic patterns",
   "• Deliver relevant content and advertisements",
   "• Improve site performance and functionality",
   "You can manage cookie preferences through your browser settings. Disabling cookies may affect some platform features.",
  ],
 },
 {
  title: "6. Your Rights & Choices",
  content: [
   "You have the right to:",
   "• **Access** the personal data we hold about you",
   "• **Correct** inaccurate or incomplete information",
   "• **Delete** your account and associated data",
   "• **Opt-out** of marketing communications at any time",
   "• **Withdraw consent** for location tracking via your device settings",
   "To exercise any of these rights, contact us at contact@reservekaru.com.",
  ],
 },
 {
  title: "7. Data Retention",
  content: [
   "We retain your personal information for as long as your account is active or as needed to provide our services. After account deletion, we may retain certain data for up to 90 days for backup and legal compliance purposes, after which it is permanently deleted.",
  ],
 },
 {
  title: "8. Children's Privacy",
  content: [
   "ReserveKaru is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will take steps to delete it promptly.",
  ],
 },
 {
  title: "9. Changes to This Policy",
  content: [
   'We may update this Privacy Policy from time to time. When we do, we will revise the "Last Updated" date at the top of this page. We encourage you to review this policy periodically. Continued use of our platform after changes constitutes acceptance of the updated policy.',
  ],
 },
 {
  title: "10. Contact Us",
  content: [
   "If you have questions about this Privacy Policy or how we handle your data, reach out to us:",
   "**Email:** contact@reservekaru.com",
   "**Phone:** 0328 0562360",
   "**Address:** Lahore, Punjab, Pakistan",
  ],
 },
];

function renderText(text) {
 // Handle bold markdown **text**
 const parts = text.split(/(\*\*[^*]+\*\*)/g);
 return parts.map((part, i) => {
  if (part.startsWith("**") && part.endsWith("**")) {
   return (
    <strong key={i} className="font-semibold text-[#002b11]">
     {part.slice(2, -2)}
    </strong>
   );
  }
  return part;
 });
}

export default function Privacy() {
 return (
  <div className="min-h-screen bg-white">
   {/* Hero */}
   <section className="bg-[#002b11] pt-32 pb-16 sm:pb-20 relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.04]">
     <div className="absolute top-10 right-20 w-72 h-72 rounded-full bg-[#00eb5b] blur-[120px]" />
    </div>
    <div className="relative max-w-3xl mx-auto px-6 text-center">
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#00eb5b] text-sm font-medium mb-5">
      <Shield size={14} />
      Your privacy matters
     </motion.div>
     <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 }}
      className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
      Privacy Policy
     </motion.h1>
     <motion.p
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.16 }}
      className="text-sm sm:text-base text-white/50">
      Last updated: February 21, 2026
     </motion.p>
    </div>
   </section>

   {/* Content */}
   <section className="max-w-3xl mx-auto px-6 py-14 sm:py-20">
    <motion.p
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     transition={{ delay: 0.2 }}
     className="text-sm sm:text-base text-gray-500 leading-relaxed mb-12">
     At ReserveKaru, we are committed to protecting your privacy and ensuring
     transparency about how we collect, use, and safeguard your personal
     information. This policy explains our practices when you use our platform,
     website, and services.
    </motion.p>

    <div className="space-y-10">
     {sections.map((section, i) => (
      <motion.div
       key={section.title}
       initial={{ opacity: 0, y: 16 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true, margin: "-40px" }}
       transition={{ duration: 0.4, delay: i * 0.03 }}>
       <h2 className="text-lg sm:text-xl font-extrabold text-[#002b11] tracking-tight mb-3">
        {section.title}
       </h2>
       <div className="space-y-2.5">
        {section.content.map((text, j) => (
         <p key={j} className="text-sm text-gray-500 leading-relaxed pl-0">
          {renderText(text)}
         </p>
        ))}
       </div>
      </motion.div>
     ))}
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
