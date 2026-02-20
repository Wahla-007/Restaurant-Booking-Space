import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Megaphone } from "lucide-react";

// Generate or retrieve a persistent anonymous ID for non-logged-in users
const getAnonId = () => {
 const key = "rk_anon_id";
 let id = localStorage.getItem(key);
 if (!id) {
  id = "anon_" + crypto.randomUUID();
  localStorage.setItem(key, id);
 }
 return id;
};

const AdBanner = () => {
 const { user } = useAuth();
 const [banner, setBanner] = useState(null);
 const impressionTracked = useRef(false);

 useEffect(() => {
  const fetchBanner = async () => {
   const { data } = await supabase
    .from("banner_ads")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

   if (data) {
    setBanner(data);
   }
  };
  fetchBanner();
 }, []);

 // Track impression — once per user per banner (localStorage dedup)
 useEffect(() => {
  if (!banner || impressionTracked.current) return;
  impressionTracked.current = true;

  const viewerId = user ? `user_${user.id}` : getAnonId();
  const storageKey = `rk_banner_seen_${banner.id}`;

  // Check if this viewer already counted
  const seenBy = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (seenBy.includes(viewerId)) return;

  // Mark as seen and increment
  seenBy.push(viewerId);
  localStorage.setItem(storageKey, JSON.stringify(seenBy));

  const trackImpression = async () => {
   await supabase
    .from("banner_ads")
    .update({ impressions: (banner.impressions || 0) + 1 })
    .eq("id", banner.id);
  };
  trackImpression();
 }, [banner, user]);

 const handleClick = async () => {
  if (!banner) return;

  // Track click
  await supabase
   .from("banner_ads")
   .update({ clicks: (banner.clicks || 0) + 1 })
   .eq("id", banner.id);

  // Open link
  if (banner.link_url) {
   window.open(banner.link_url, "_blank", "noopener,noreferrer");
  }
 };

 if (!banner) return null;

 return (
  <motion.section
   initial={{ opacity: 0, y: 20 }}
   whileInView={{ opacity: 1, y: 0 }}
   viewport={{ once: true }}
   transition={{ duration: 0.5 }}
   className="py-6 sm:py-8 bg-white">
   <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div
     onClick={handleClick}
     className="relative w-full rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-shadow duration-300">
     {/* "AD" pill label */}
     <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-[#002b11]/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
      <Megaphone size={12} />
      <span>Sponsored</span>
     </div>

     {/* Banner image */}
     <img
      src={banner.image_url}
      alt={banner.title || "Advertisement"}
      className="w-full h-auto min-h-[120px] max-h-[320px] object-cover group-hover:scale-[1.01] transition-transform duration-500"
     />

     {/* Gradient overlay with title */}
     {banner.title && (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-6 pt-16">
       <h3 className="text-white text-lg sm:text-xl font-bold tracking-tight drop-shadow-lg">
        {banner.title}
       </h3>
      </div>
     )}
    </div>
   </div>
  </motion.section>
 );
};

export default AdBanner;
