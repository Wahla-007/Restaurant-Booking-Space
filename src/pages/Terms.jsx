import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const sections = [
 {
  title: "1. Acceptance of Terms",
  content: [
   "By accessing or using the ReserveKaru platform, website, or mobile application, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you should not use our services.",
   "We reserve the right to modify these terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms.",
  ],
 },
 {
  title: "2. Description of Service",
  content: [
   "ReserveKaru is an online restaurant reservation and discovery platform that allows users to:",
   "• Browse and search for restaurants based on location, cuisine, ratings, and other criteria",
   "• Make and manage table reservations at participating restaurants",
   "• View menus, photos, reviews, and restaurant information",
   "• Leave reviews and ratings for restaurants they have visited",
   "We act as an intermediary between diners and restaurant partners. We do not own, operate, or control any restaurant listed on our platform.",
  ],
 },
 {
  title: "3. User Accounts",
  content: [
   "To access certain features, you must create an account. When registering, you agree to:",
   "• Provide accurate, current, and complete information",
   "• Maintain and update your account information as needed",
   "• Keep your password secure and confidential",
   "• Accept responsibility for all activity under your account",
   "• Notify us immediately of any unauthorized access or security breach",
   "We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent or abusive activity.",
  ],
 },
 {
  title: "4. Reservations & Bookings",
  content: [
   "When you make a reservation through ReserveKaru:",
   "• You agree to honor your booking or cancel within the restaurant's cancellation policy timeframe",
   "• Restaurant availability, pricing, and seating are managed by the restaurant, not ReserveKaru",
   "• We send confirmation and reminder emails but cannot guarantee restaurant performance or service quality",
   "• Repeated no-shows may result in restrictions on your ability to make future reservations",
   "ReserveKaru does not charge diners for making reservations unless explicitly stated. Any charges related to dining are between you and the restaurant.",
  ],
 },
 {
  title: "5. Reviews & User Content",
  content: [
   "By submitting reviews, ratings, photos, or other content, you agree that:",
   "• Your content is truthful, based on genuine experience, and not misleading",
   "• You grant ReserveKaru a non-exclusive, royalty-free, worldwide license to use, display, and distribute your content on our platform",
   "• Your content does not contain hate speech, profanity, personal attacks, or discriminatory language",
   "• You will not post fake reviews, spam, or promotional content disguised as reviews",
   "We reserve the right to remove, edit, or moderate any user content that violates these guidelines at our sole discretion.",
  ],
 },
 {
  title: "6. Restaurant Partners",
  content: [
   "Restaurants using ReserveKaru's business tools agree to:",
   "• Provide accurate information about their establishment, including hours, menu, pricing, and availability",
   "• Honor reservations made through the platform in good faith",
   "• Comply with all applicable food safety, licensing, and business regulations",
   "• Not discriminate against guests who book through ReserveKaru",
   "Restaurant partner accounts are subject to additional terms outlined in the partner agreement.",
  ],
 },
 {
  title: "7. Advertising",
  content: [
   "ReserveKaru may display banner advertisements and sponsored content on the platform. Advertisers agree to:",
   "• Provide truthful and non-misleading ad content",
   "• Comply with applicable advertising laws and regulations",
   "• Not submit content that is offensive, harmful, or inappropriate",
   "ReserveKaru reserves the right to reject, remove, or modify ad content at any time. Advertising pricing and terms are governed by separate advertising agreements.",
  ],
 },
 {
  title: "8. Prohibited Conduct",
  content: [
   "You agree not to:",
   "• Use the platform for any unlawful purpose or in violation of any applicable laws",
   "• Attempt to gain unauthorized access to our systems, servers, or other users' accounts",
   "• Interfere with or disrupt the platform's operation, security, or infrastructure",
   "• Scrape, crawl, or use automated tools to collect data from the platform without prior written consent",
   "• Impersonate another person, entity, or falsely represent your affiliation",
   "• Upload malicious code, viruses, or any harmful software",
   "• Engage in any activity that could damage ReserveKaru's reputation or business operations",
  ],
 },
 {
  title: "9. Intellectual Property",
  content: [
   "All content on the ReserveKaru platform — including but not limited to the logo, design, text, graphics, software, and trademarks — is the property of ReserveKaru or its licensors and is protected by intellectual property laws.",
   "You may not copy, modify, distribute, sell, or create derivative works from any part of our platform without explicit written permission from ReserveKaru.",
  ],
 },
 {
  title: "10. Limitation of Liability",
  content: [
   'ReserveKaru is provided on an "as is" and "as available" basis. To the fullest extent permitted by law:',
   "• We make no warranties regarding the accuracy, reliability, or completeness of any restaurant information, reviews, or availability",
   "• We are not liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the platform",
   "• We are not responsible for the actions, services, food quality, or conduct of restaurants listed on our platform",
   "• Our total liability for any claim shall not exceed the amount you paid to ReserveKaru (if any) in the 12 months preceding the claim",
  ],
 },
 {
  title: "11. Indemnification",
  content: [
   "You agree to indemnify and hold harmless ReserveKaru, its officers, employees, and partners from any claims, damages, losses, or expenses (including legal fees) arising from your use of the platform, violation of these terms, or infringement of any third-party rights.",
  ],
 },
 {
  title: "12. Governing Law",
  content: [
   "These Terms of Service are governed by and construed in accordance with the laws of Pakistan. Any disputes arising from these terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts located in Lahore, Punjab.",
  ],
 },
 {
  title: "13. Contact Information",
  content: [
   "For questions or concerns regarding these Terms of Service, please contact us:",
   "**Email:** contact@reservekaru.com",
   "**Phone:** 0328 0562360",
   "**Address:** Lahore, Punjab, Pakistan",
  ],
 },
];

function renderText(text) {
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

export default function Terms() {
 return (
  <div className="min-h-screen bg-white">
   {/* Hero */}
   <section className="bg-[#002b11] pt-32 pb-16 sm:pb-20 relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.04]">
     <div className="absolute bottom-10 left-20 w-72 h-72 rounded-full bg-[#00aa6c] blur-[120px]" />
    </div>
    <div className="relative max-w-3xl mx-auto px-6 text-center">
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#00eb5b] text-sm font-medium mb-5">
      <FileText size={14} />
      Legal
     </motion.div>
     <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 }}
      className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
      Terms of Service
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
     Welcome to ReserveKaru. These Terms of Service govern your access to and
     use of our platform, including our website, mobile applications, and all
     associated services. Please read these terms carefully before using
     ReserveKaru.
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
         <p key={j} className="text-sm text-gray-500 leading-relaxed">
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
