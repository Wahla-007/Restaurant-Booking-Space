import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
 User,
 Mail,
 Lock,
 CalendarCheck,
 Star,
 ChevronRight,
 Clock,
 MapPin,
 Gift,
 Trophy,
 Percent,
 Flame,
 ShieldCheck,
 Eye,
 EyeOff,
 Save,
 ArrowLeft,
 Utensils,
 MessageSquare,
 Award,
 Zap,
 Ticket,
 Crown,
} from "lucide-react";

const LOYALTY_TIERS = [
 {
  name: "Bronze",
  min: 0,
  max: 99,
  color: "from-amber-600 to-amber-800",
  bg: "bg-amber-50",
  border: "border-amber-200",
  text: "text-amber-700",
  icon: Award,
 },
 {
  name: "Silver",
  min: 100,
  max: 299,
  color: "from-gray-400 to-gray-600",
  bg: "bg-gray-50",
  border: "border-gray-200",
  text: "text-gray-600",
  icon: Trophy,
 },
 {
  name: "Gold",
  min: 300,
  max: 599,
  color: "from-yellow-400 to-yellow-600",
  bg: "bg-yellow-50",
  border: "border-yellow-200",
  text: "text-yellow-700",
  icon: Crown,
 },
 {
  name: "Platinum",
  min: 600,
  max: Infinity,
  color: "from-emerald-500 to-emerald-700",
  bg: "bg-emerald-50",
  border: "border-emerald-200",
  text: "text-emerald-700",
  icon: Zap,
 },
];

const DEALS = [
 {
  id: 1,
  title: "First Timer Bonus",
  description: "Get 50 bonus points on your first completed reservation",
  points: 50,
  icon: Gift,
  color: "bg-purple-500",
  condition: "First booking",
 },
 {
  id: 2,
  title: "Weekend Warrior",
  description: "Earn 2x points on Friday & Saturday reservations",
  points: "2x",
  icon: Flame,
  color: "bg-orange-500",
  condition: "Fri-Sat bookings",
 },
 {
  id: 3,
  title: "Loyal Diner",
  description: "5 completed bookings = 100 bonus loyalty points",
  points: 100,
  icon: Trophy,
  color: "bg-blue-500",
  condition: "5 bookings",
 },
 {
  id: 4,
  title: "Review Reward",
  description: "Write a review after dining and earn 25 points",
  points: 25,
  icon: Star,
  color: "bg-yellow-500",
  condition: "Per review",
 },
 {
  id: 5,
  title: "Referral Bonus",
  description: "Invite a friend who completes a booking — both earn 75 points",
  points: 75,
  icon: Ticket,
  color: "bg-pink-500",
  condition: "Per referral",
 },
 {
  id: 6,
  title: "On-Time Arrival",
  description:
   "Arrive within 10 min of your reservation time and earn bonus points",
  points: 15,
  icon: Clock,
  color: "bg-emerald-500",
  condition: "Per visit",
 },
];

export default function UserProfile() {
 const { user, logout } = useAuth();
 const { addToast } = useToast();
 const navigate = useNavigate();

 const [activeSection, setActiveSection] = useState("profile");
 const [loading, setLoading] = useState(true);

 // Profile form
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [currentPassword, setCurrentPassword] = useState("");
 const [newPassword, setNewPassword] = useState("");
 const [showCurrentPass, setShowCurrentPass] = useState(false);
 const [showNewPass, setShowNewPass] = useState(false);
 const [saving, setSaving] = useState(false);

 // Data
 const [bookings, setBookings] = useState([]);
 const [reviews, setReviews] = useState([]);
 const [loyaltyPoints, setLoyaltyPoints] = useState(0);

 useEffect(() => {
  if (!user) {
   navigate("/login");
   return;
  }
  setName(user.name || "");
  setEmail(user.email || "");
  loadUserData();
 }, [user]);

 const loadUserData = async () => {
  if (!user) return;
  setLoading(true);
  try {
   // Fetch bookings
   const { data: bookingData } = await supabase
    .from("bookings")
    .select("*, restaurants(name, images, city, cuisine)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

   setBookings(bookingData || []);

   // Calculate loyalty points from completed bookings
   const completedBookings = (bookingData || []).filter(
    (b) => b.status === "completed",
   );
   const reviewBonus = reviews.length * 25;
   const basePoints = completedBookings.length * 15;
   const firstTimerBonus = completedBookings.length > 0 ? 50 : 0;
   const loyaltyMilestone = Math.floor(completedBookings.length / 5) * 100;
   const totalPoints =
    basePoints + firstTimerBonus + loyaltyMilestone + reviewBonus;

   // Fetch user's loyalty_points from DB (if stored)
   const { data: userData } = await supabase
    .from("users")
    .select("loyalty_points")
    .eq("id", user.id)
    .single();

   setLoyaltyPoints(userData?.loyalty_points || totalPoints);

   // Fetch reviews
   const { data: reviewData } = await supabase
    .from("reviews")
    .select("*, restaurants(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

   setReviews(reviewData || []);
  } catch (err) {
   console.error("Error loading user data:", err);
  } finally {
   setLoading(false);
  }
 };

 const getCurrentTier = () => {
  return (
   LOYALTY_TIERS.find(
    (t) => loyaltyPoints >= t.min && loyaltyPoints <= t.max,
   ) || LOYALTY_TIERS[0]
  );
 };

 const getNextTier = () => {
  const currentIndex = LOYALTY_TIERS.findIndex(
   (t) => loyaltyPoints >= t.min && loyaltyPoints <= t.max,
  );
  return currentIndex < LOYALTY_TIERS.length - 1
   ? LOYALTY_TIERS[currentIndex + 1]
   : null;
 };

 const handleSaveProfile = async () => {
  if (!name.trim()) {
   addToast("Name cannot be empty.", "error");
   return;
  }
  setSaving(true);
  try {
   const updates = { name: name.trim() };

   // If changing password
   if (newPassword) {
    if (!currentPassword) {
     addToast("Enter current password to change password.", "error");
     setSaving(false);
     return;
    }
    // Verify current password
    const { data: verifyData } = await supabase
     .from("users")
     .select("password")
     .eq("id", user.id)
     .single();

    if (verifyData?.password !== currentPassword) {
     addToast("Current password is incorrect.", "error");
     setSaving(false);
     return;
    }

    if (newPassword.length < 8) {
     addToast("New password must be at least 8 characters.", "error");
     setSaving(false);
     return;
    }
    updates.password = newPassword;
   }

   // Update avatar if name changed
   if (name.trim() !== user.name) {
    updates.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=random`;
   }

   const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id);

   if (error) throw error;

   // Update local session
   const updatedUser = { ...user, ...updates };
   delete updatedUser.password;
   localStorage.setItem("session_v1", JSON.stringify(updatedUser));
   window.location.reload();
  } catch (err) {
   addToast("Failed to update profile.", "error");
  } finally {
   setSaving(false);
  }
 };

 const getStatusColor = (status) => {
  switch (status) {
   case "confirmed":
    return "bg-blue-50 text-blue-700 border-blue-200";
   case "completed":
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
   case "cancelled":
    return "bg-red-50 text-red-700 border-red-200";
   case "no-show":
    return "bg-orange-50 text-orange-700 border-orange-200";
   default:
    return "bg-gray-50 text-gray-700 border-gray-200";
  }
 };

 const upcomingBookings = bookings.filter(
  (b) => b.status === "confirmed" && new Date(b.date) >= new Date(),
 );
 const pastBookings = bookings.filter(
  (b) => b.status !== "confirmed" || new Date(b.date) < new Date(),
 );

 const tier = getCurrentTier();
 const nextTier = getNextTier();
 const TierIcon = tier.icon;
 const progressToNext = nextTier
  ? ((loyaltyPoints - tier.min) / (nextTier.min - tier.min)) * 100
  : 100;

 const sidebarItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "reservations", label: "Reservations", icon: CalendarCheck },
  { id: "reviews", label: "My Reviews", icon: MessageSquare },
  { id: "loyalty", label: "Loyalty & Deals", icon: Trophy },
 ];

 if (!user) return null;

 return (
  <div className="min-h-screen bg-[#f7f7f7] pt-[68px]">
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Back Button */}
    <button
     onClick={() => navigate("/")}
     className="flex items-center gap-2 text-sm font-semibold text-[#002b11]/60 hover:text-[#002b11] transition-colors mb-6 cursor-pointer">
     <ArrowLeft size={16} />
     Back to Home
    </button>

    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
     {/* Sidebar */}
     <div className="space-y-4">
      {/* User Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
       <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-[#002b11]/10 mx-auto mb-3">
        <img
         src={user.avatar}
         alt={user.name}
         className="w-full h-full object-cover"
        />
       </div>
       <h3 className="text-lg font-bold text-[#002b11]">{user.name}</h3>
       <p className="text-sm text-gray-400">{user.email}</p>
       <div
        className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full ${tier.bg} ${tier.border} border`}>
        <TierIcon size={14} className={tier.text} />
        <span className={`text-xs font-bold ${tier.text}`}>
         {tier.name} Member
        </span>
       </div>
       <p className="text-xs text-gray-400 mt-2">
        {loyaltyPoints} points earned
       </p>
      </div>

      {/* Nav */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
       {sidebarItems.map((item) => {
        const Icon = item.icon;
        return (
         <button
          key={item.id}
          onClick={() => setActiveSection(item.id)}
          className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-all cursor-pointer ${
           activeSection === item.id
            ? "bg-[#002b11]/[0.05] text-[#002b11] border-l-3 border-[#002b11]"
            : "text-gray-500 hover:text-[#002b11] hover:bg-gray-50"
          }`}>
          <Icon size={18} />
          {item.label}
         </button>
        );
       })}
      </div>
     </div>

     {/* Main Content */}
     <div className="min-w-0">
      {/* ── Profile Section ── */}
      {activeSection === "profile" && (
       <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
         <h2 className="text-xl font-bold text-[#002b11]">Account Settings</h2>
         <p className="text-sm text-gray-400 mt-1">
          Update your personal information
         </p>
        </div>
        <div className="p-6 space-y-6 max-w-lg">
         {/* Name */}
         <div className="space-y-2">
          <label className="text-sm font-semibold text-[#002b11] flex items-center gap-1.5">
           <User size={14} /> Full Name
          </label>
          <input
           type="text"
           value={name}
           onChange={(e) => setName(e.target.value)}
           className="w-full px-4 py-3 bg-white text-[#002b11] rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00aa6c]/20 focus:border-[#00aa6c] outline-none transition-all"
          />
         </div>

         {/* Email (read-only) */}
         <div className="space-y-2">
          <label className="text-sm font-semibold text-[#002b11] flex items-center gap-1.5">
           <Mail size={14} /> Email Address
          </label>
          <input
           type="email"
           value={email}
           disabled
           className="w-full px-4 py-3 bg-gray-50 text-gray-500 rounded-xl border border-gray-200 cursor-not-allowed outline-none"
          />
          <p className="text-xs text-gray-400">
           Email cannot be changed for security reasons
          </p>
         </div>

         {/* Current Password */}
         <div className="space-y-2">
          <label className="text-sm font-semibold text-[#002b11] flex items-center gap-1.5">
           <Lock size={14} /> Current Password
          </label>
          <div className="relative">
           <input
            type={showCurrentPass ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full px-4 py-3 bg-white text-[#002b11] placeholder:text-gray-400 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00aa6c]/20 focus:border-[#00aa6c] outline-none transition-all pr-11"
           />
           <button
            type="button"
            onClick={() => setShowCurrentPass(!showCurrentPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
            {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
           </button>
          </div>
         </div>

         {/* New Password */}
         <div className="space-y-2">
          <label className="text-sm font-semibold text-[#002b11] flex items-center gap-1.5">
           <Lock size={14} /> New Password
          </label>
          <div className="relative">
           <input
            type={showNewPass ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            className="w-full px-4 py-3 bg-white text-[#002b11] placeholder:text-gray-400 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00aa6c]/20 focus:border-[#00aa6c] outline-none transition-all pr-11"
           />
           <button
            type="button"
            onClick={() => setShowNewPass(!showNewPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
            {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
           </button>
          </div>
         </div>

         <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#002b11] text-white rounded-xl font-bold text-sm hover:bg-[#004d1f] transition-colors disabled:opacity-50 cursor-pointer">
          <Save size={16} />
          {saving ? "Saving..." : "Save Changes"}
         </button>
        </div>
       </motion.div>
      )}

      {/* ── Reservations Section ── */}
      {activeSection === "reservations" && (
       <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6">
        {/* Upcoming */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
         <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#002b11] flex items-center gap-2">
           <CalendarCheck size={20} className="text-[#00aa6c]" />
           Upcoming Reservations
          </h2>
         </div>
         <div className="divide-y divide-gray-100">
          {loading ? (
           <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#00aa6c] border-t-transparent rounded-full animate-spin mx-auto" />
           </div>
          ) : upcomingBookings.length === 0 ? (
           <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
             <CalendarCheck size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">No upcoming reservations</p>
            <button
             onClick={() => navigate("/")}
             className="mt-3 text-sm font-semibold text-[#00aa6c] hover:underline cursor-pointer">
             Browse restaurants
            </button>
           </div>
          ) : (
           upcomingBookings.map((booking) => (
            <div
             key={booking.id}
             className="p-5 hover:bg-gray-50/50 transition-colors">
             <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
               {booking.restaurants?.images?.[0] ? (
                <img
                 src={booking.restaurants.images[0]}
                 alt=""
                 className="w-full h-full object-cover"
                />
               ) : (
                <div className="w-full h-full flex items-center justify-center">
                 <Utensils size={20} className="text-gray-300" />
                </div>
               )}
              </div>
              <div className="flex-1 min-w-0">
               <div className="flex items-start justify-between gap-2">
                <div>
                 <h4 className="font-bold text-[#002b11] text-[15px]">
                  {booking.restaurant_name ||
                   booking.restaurants?.name ||
                   "Restaurant"}
                 </h4>
                 <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={11} />
                  {booking.restaurants?.city || "—"}
                 </p>
                </div>
                <span
                 className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(booking.status)}`}>
                 {booking.status}
                </span>
               </div>
               <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                 <CalendarCheck size={13} /> {booking.date}
                </span>
                <span className="flex items-center gap-1">
                 <Clock size={13} /> {booking.time}
                </span>
                <span>{booking.party_size} guests</span>
               </div>
               {booking.booking_code && (
                <p className="text-xs text-gray-400 mt-1.5 font-mono">
                 Code: {booking.booking_code}
                </p>
               )}
              </div>
             </div>
            </div>
           ))
          )}
         </div>
        </div>

        {/* Past */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
         <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#002b11] flex items-center gap-2">
           <Clock size={20} className="text-gray-400" />
           Past Reservations
          </h2>
         </div>
         <div className="divide-y divide-gray-100">
          {loading ? (
           <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#00aa6c] border-t-transparent rounded-full animate-spin mx-auto" />
           </div>
          ) : pastBookings.length === 0 ? (
           <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">No past reservations yet</p>
           </div>
          ) : (
           pastBookings.map((booking) => (
            <div
             key={booking.id}
             className="p-5 hover:bg-gray-50/50 transition-colors">
             <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
               {booking.restaurants?.images?.[0] ? (
                <img
                 src={booking.restaurants.images[0]}
                 alt=""
                 className="w-full h-full object-cover"
                />
               ) : (
                <div className="w-full h-full flex items-center justify-center">
                 <Utensils size={20} className="text-gray-300" />
                </div>
               )}
              </div>
              <div className="flex-1 min-w-0">
               <div className="flex items-start justify-between gap-2">
                <div>
                 <h4 className="font-bold text-[#002b11] text-[15px]">
                  {booking.restaurant_name ||
                   booking.restaurants?.name ||
                   "Restaurant"}
                 </h4>
                 <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={11} />
                  {booking.restaurants?.city || "—"}
                 </p>
                </div>
                <span
                 className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(booking.status)}`}>
                 {booking.status}
                </span>
               </div>
               <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                 <CalendarCheck size={13} /> {booking.date}
                </span>
                <span className="flex items-center gap-1">
                 <Clock size={13} /> {booking.time}
                </span>
                <span>{booking.party_size} guests</span>
               </div>
               {booking.booking_code && (
                <p className="text-xs text-gray-400 mt-1.5 font-mono">
                 Code: {booking.booking_code}
                </p>
               )}
               {booking.status === "completed" && (
                <div className="flex items-center gap-1 mt-2">
                 <ShieldCheck size={13} className="text-[#00aa6c]" />
                 <span className="text-xs font-semibold text-[#00aa6c]">
                  +15 loyalty points earned
                 </span>
                </div>
               )}
              </div>
             </div>
            </div>
           ))
          )}
         </div>
        </div>
       </motion.div>
      )}

      {/* ── Reviews Section ── */}
      {activeSection === "reviews" && (
       <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
         <h2 className="text-xl font-bold text-[#002b11] flex items-center gap-2">
          <MessageSquare size={20} className="text-[#00aa6c]" />
          My Reviews
         </h2>
         <p className="text-sm text-gray-400 mt-1">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""} posted
         </p>
        </div>
        <div className="divide-y divide-gray-100">
         {loading ? (
          <div className="p-12 text-center">
           <div className="w-8 h-8 border-2 border-[#00aa6c] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
         ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
           <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={24} className="text-gray-300" />
           </div>
           <p className="text-gray-400 text-sm">
            You haven't written any reviews yet
           </p>
           <p className="text-xs text-gray-300 mt-1">
            Dine at a restaurant and share your experience
           </p>
          </div>
         ) : (
          reviews.map((review) => (
           <div key={review.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
             <div className="flex-1">
              <h4 className="font-bold text-[#002b11] text-[15px]">
               {review.restaurants?.name || "Restaurant"}
              </h4>
              <div className="flex gap-0.5 mt-1.5">
               {[...Array(5)].map((_, i) => (
                <div
                 key={i}
                 className={`w-[13px] h-[13px] rounded-full ${
                  i < review.rating ? "bg-[#00aa6c]" : "bg-gray-200"
                 }`}
                />
               ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">
               {review.comment}
              </p>
              <p className="text-xs text-gray-400 mt-2">
               {review.created_at
                ? new Date(review.created_at).toLocaleDateString("en-US", {
                   year: "numeric",
                   month: "long",
                   day: "numeric",
                  })
                : "Recently"}
              </p>
             </div>
            </div>

            {/* Owner Reply */}
            {review.owner_reply && (
             <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200">
              <div className="bg-[#f7f7f7] rounded-lg p-3">
               <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-[#00aa6c]">
                 Restaurant replied
                </span>
                {review.replied_at && (
                 <span className="text-[10px] text-gray-400">
                  · {new Date(review.replied_at).toLocaleDateString()}
                 </span>
                )}
               </div>
               <p className="text-sm text-gray-600 leading-relaxed">
                {review.owner_reply}
               </p>
              </div>
             </div>
            )}
           </div>
          ))
         )}
        </div>
       </motion.div>
      )}

      {/* ── Loyalty & Deals Section ── */}
      {activeSection === "loyalty" && (
       <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6">
        {/* Points Overview Card */}
        <div
         className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${tier.color} p-8 text-white`}>
         <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-12 translate-x-12" />
         <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
         <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
           <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <TierIcon size={24} />
           </div>
           <div>
            <p className="text-white/70 text-sm font-medium">
             {tier.name} Member
            </p>
            <p className="text-3xl font-black">{loyaltyPoints}</p>
           </div>
          </div>
          <p className="text-white/60 text-sm mb-1">Loyalty Points</p>

          {nextTier && (
           <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1.5">
             <span className="text-white/70">{tier.name}</span>
             <span className="text-white/70">
              {nextTier.min - loyaltyPoints} pts to {nextTier.name}
             </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
             <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressToNext, 100)}%` }}
             />
            </div>
           </div>
          )}
         </div>
        </div>

        {/* Tier Progress */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
         <h3 className="text-lg font-bold text-[#002b11] mb-4">
          Membership Tiers
         </h3>
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LOYALTY_TIERS.map((t) => {
           const isActive = t.name === tier.name;
           const TIcon = t.icon;
           return (
            <div
             key={t.name}
             className={`text-center p-4 rounded-xl border-2 transition-all ${
              isActive
               ? `${t.border} ${t.bg} scale-105 shadow-sm`
               : "border-gray-100"
             }`}>
             <TIcon
              size={24}
              className={`mx-auto mb-2 ${isActive ? t.text : "text-gray-300"}`}
             />
             <p
              className={`text-sm font-bold ${isActive ? t.text : "text-gray-400"}`}>
              {t.name}
             </p>
             <p className="text-[11px] text-gray-400 mt-0.5">
              {t.max === Infinity ? `${t.min}+` : `${t.min}-${t.max}`} pts
             </p>
            </div>
           );
          })}
         </div>
        </div>

        {/* How to Earn */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
         <h3 className="text-lg font-bold text-[#002b11] mb-1">
          How to Earn Points
         </h3>
         <p className="text-sm text-gray-400 mb-5">
          Complete these actions to earn loyalty points and climb tiers
         </p>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
           {
            action: "Complete a reservation",
            pts: "+15 pts",
            icon: CalendarCheck,
           },
           { action: "Write a review", pts: "+25 pts", icon: Star },
           { action: "Arrive on time", pts: "+15 pts", icon: Clock },
           { action: "First booking bonus", pts: "+50 pts", icon: Gift },
           { action: "Every 5 bookings", pts: "+100 pts", icon: Trophy },
           { action: "Refer a friend", pts: "+75 pts", icon: Ticket },
          ].map((item) => {
           const IIcon = item.icon;
           return (
            <div
             key={item.action}
             className="flex items-center gap-3 p-3 rounded-xl bg-[#f7f7f7] hover:bg-gray-100 transition-colors">
             <div className="w-9 h-9 rounded-full bg-[#002b11]/[0.06] flex items-center justify-center shrink-0">
              <IIcon size={16} className="text-[#002b11]/60" />
             </div>
             <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#002b11]">
               {item.action}
              </p>
             </div>
             <span className="text-xs font-bold text-[#00aa6c] shrink-0">
              {item.pts}
             </span>
            </div>
           );
          })}
         </div>
        </div>

        {/* Deals & Offers */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
         <div className="flex items-center gap-2 mb-1">
          <Gift size={20} className="text-[#00aa6c]" />
          <h3 className="text-lg font-bold text-[#002b11]">
           Exclusive Deals & Offers
          </h3>
         </div>
         <p className="text-sm text-gray-400 mb-5">
          Special offers to make your dining experience even better
         </p>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEALS.map((deal) => {
           const DIcon = deal.icon;
           return (
            <div
             key={deal.id}
             className="group relative border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all">
             <div
              className={`w-10 h-10 rounded-xl ${deal.color} flex items-center justify-center mb-3`}>
              <DIcon size={18} className="text-white" />
             </div>
             <h4 className="font-bold text-[#002b11] text-[15px] mb-1">
              {deal.title}
             </h4>
             <p className="text-xs text-gray-500 leading-relaxed mb-3">
              {deal.description}
             </p>
             <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">
               {deal.condition}
              </span>
              <span className="text-sm font-black text-[#00aa6c]">
               +{deal.points} pts
              </span>
             </div>
            </div>
           );
          })}
         </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
         {[
          {
           label: "Total Bookings",
           value: bookings.length,
           icon: CalendarCheck,
           color: "text-blue-500",
          },
          {
           label: "Completed",
           value: bookings.filter((b) => b.status === "completed").length,
           icon: ShieldCheck,
           color: "text-emerald-500",
          },
          {
           label: "Reviews Written",
           value: reviews.length,
           icon: Star,
           color: "text-yellow-500",
          },
          {
           label: "Points Earned",
           value: loyaltyPoints,
           icon: Trophy,
           color: "text-purple-500",
          },
         ].map((stat) => {
          const SIcon = stat.icon;
          return (
           <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <SIcon size={20} className={`${stat.color} mx-auto mb-2`} />
            <p className="text-2xl font-black text-[#002b11]">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
           </div>
          );
         })}
        </div>
       </motion.div>
      )}
     </div>
    </div>
   </div>
  </div>
 );
}
