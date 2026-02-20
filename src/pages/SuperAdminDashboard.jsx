import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useToast } from "../context/ToastContext";
import { playNotificationSound, warmUpAudio } from "../utils/notificationSound";
import NotificationBell from "../components/dashboard/NotificationBell";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminOverview from "../components/admin/AdminOverview";
import AdminRestaurants from "../components/admin/AdminRestaurants";
import AdminReservations from "../components/admin/AdminReservations";
import AdminUsers from "../components/admin/AdminUsers";
import AdminReviews from "../components/admin/AdminReviews";
import AdminWebReviews from "../components/admin/AdminWebReviews";
import AdminSupportTickets from "../components/admin/AdminSupportTickets";
import AdminBannerAds from "../components/admin/AdminBannerAds";
import AdminPayments from "../components/admin/AdminPayments";

// Super admin email — change this to your admin email
const SUPER_ADMIN_EMAIL = "khizarsyed4294@gmail.com";

export default function SuperAdminDashboard() {
 const { user, authLoading, logout } = useAuth();
 const navigate = useNavigate();
 const { addToast } = useToast();

 const [activeTab, setActiveTab] = useState("Overview");
 const [loading, setLoading] = useState(true);

 // Data
 const [restaurants, setRestaurants] = useState([]);
 const [users, setUsers] = useState([]);
 const [bookings, setBookings] = useState([]);
 const [toggling, setToggling] = useState(null);
 const [notifications, setNotifications] = useState([]);

 // Warm up audio on mount
 useEffect(() => {
  warmUpAudio();
 }, []);

 // Auth guard — wait for session to be restored from localStorage first
 useEffect(() => {
  if (authLoading) return; // Still loading session, don't redirect yet

  if (!user) {
   navigate("/login");
   return;
  }

  const isAdmin = user.role === "admin" || user.email === SUPER_ADMIN_EMAIL;

  if (!isAdmin) {
   navigate("/");
   addToast("Access denied. Super admin only.", "error");
   return;
  }

  // Re-sync session role from DB so refresh works
  const syncRole = async () => {
   try {
    const { data } = await supabase
     .from("users")
     .select("role")
     .eq("email", user.email)
     .single();

    if (data && data.role !== user.role) {
     const updatedUser = { ...user, role: data.role };
     localStorage.setItem("session_v1", JSON.stringify(updatedUser));
    }
   } catch (err) {
    console.error("Role sync error:", err);
   }
  };
  syncRole();

  fetchAllData();
 }, [user, authLoading]);

 const fetchAllData = async () => {
  setLoading(true);
  try {
   const [resRes, resUsers, resBookings] = await Promise.all([
    supabase
     .from("restaurants")
     .select("*")
     .order("created_at", { ascending: false }),
    supabase
     .from("users")
     .select("id, name, email, role, avatar, is_verified, created_at")
     .order("created_at", { ascending: false }),
    supabase
     .from("bookings")
     .select("*, users ( name, email )")
     .order("created_at", { ascending: false }),
   ]);

   if (resRes.data) setRestaurants(resRes.data);
   if (resUsers.data) setUsers(resUsers.data);
   if (resBookings.data) setBookings(resBookings.data);
  } catch (err) {
   console.error("Error loading admin data:", err);
   addToast("Failed to load data", "error");
  } finally {
   setLoading(false);
  }
 };

 // Polling for new bookings & reviews (every 10 seconds)
 const lastCheckedRef = useRef(null);
 const knownBookingIdsRef = useRef(new Set());
 const knownReviewIdsRef = useRef(new Set());

 // Initialize known IDs when bookings first load
 useEffect(() => {
  if (bookings.length > 0 && knownBookingIdsRef.current.size === 0) {
   knownBookingIdsRef.current = new Set(bookings.map((b) => b.id));
  }
 }, [bookings]);

 useEffect(() => {
  if (!user || authLoading) return;

  const isAdmin = user.role === "admin" || user.email === SUPER_ADMIN_EMAIL;
  if (!isAdmin) return;

  lastCheckedRef.current = new Date().toISOString();

  const pollInterval = setInterval(async () => {
   try {
    // Poll for new bookings
    const { data: newBookings } = await supabase
     .from("bookings")
     .select("*, users ( name, email )")
     .gt("created_at", lastCheckedRef.current)
     .order("created_at", { ascending: false });

    if (newBookings && newBookings.length > 0) {
     const trulyNew = newBookings.filter(
      (b) => !knownBookingIdsRef.current.has(b.id),
     );
     if (trulyNew.length > 0) {
      playNotificationSound();
      trulyNew.forEach((booking) => {
       knownBookingIdsRef.current.add(booking.id);
       setNotifications((prev) => [
        {
         id: Date.now() + Math.random(),
         type: "booking",
         title: "New Reservation",
         message: `${booking.user_name || "A customer"} booked a table for ${booking.guests || "?"} guests`,
         time: new Date().toISOString(),
        },
        ...prev,
       ]);
      });
      addToast(
       `🔔 ${trulyNew.length} new booking${trulyNew.length > 1 ? "s" : ""}!`,
       "success",
      );
      fetchAllData();
     }
    }

    // Poll for new reviews
    const { data: newReviews } = await supabase
     .from("reviews")
     .select("*")
     .gt("created_at", lastCheckedRef.current)
     .order("created_at", { ascending: false });

    if (newReviews && newReviews.length > 0) {
     const trulyNewReviews = newReviews.filter(
      (r) => !knownReviewIdsRef.current.has(r.id),
     );
     if (trulyNewReviews.length > 0) {
      playNotificationSound();
      trulyNewReviews.forEach((review) => {
       knownReviewIdsRef.current.add(review.id);
       setNotifications((prev) => [
        {
         id: Date.now() + Math.random(),
         type: "review",
         title: "New Review",
         message: `${review.user_name || "Someone"} left a ${review.rating}-star review`,
         time: new Date().toISOString(),
        },
        ...prev,
       ]);
      });
      addToast(
       `⭐ ${trulyNewReviews.length} new review${trulyNewReviews.length > 1 ? "s" : ""}!`,
       "info",
      );
     }
    }

    lastCheckedRef.current = new Date().toISOString();
   } catch (err) {
    console.warn("Polling error:", err);
   }
  }, 10000);

  return () => clearInterval(pollInterval);
 }, [user, authLoading]);

 // Toggle restaurant active/inactive
 const handleToggleActive = async (restaurantId, currentlyActive) => {
  setToggling(restaurantId);
  try {
   const { error } = await supabase
    .from("restaurants")
    .update({ is_active: !currentlyActive })
    .eq("id", restaurantId);

   if (error) throw error;

   setRestaurants((prev) =>
    prev.map((r) =>
     r.id === restaurantId ? { ...r, is_active: !currentlyActive } : r,
    ),
   );

   addToast(
    `Restaurant ${!currentlyActive ? "activated" : "deactivated"} successfully`,
    "success",
   );
  } catch (err) {
   console.error("Toggle error:", err);
   addToast("Failed to update restaurant status", "error");
  } finally {
   setToggling(null);
  }
 };

 // Delete user
 const handleDeleteUser = async (userId) => {
  try {
   // First, get all restaurants owned by this user
   const { data: ownedRestaurants } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", userId);

   const restaurantIds = (ownedRestaurants || []).map((r) => r.id);

   // Delete bookings for those restaurants
   if (restaurantIds.length > 0) {
    await supabase.from("bookings").delete().in("restaurant_id", restaurantIds);

    // Delete reviews for those restaurants
    await supabase.from("reviews").delete().in("restaurant_id", restaurantIds);

    // Delete the restaurants themselves
    await supabase.from("restaurants").delete().eq("owner_id", userId);
   }

   // Delete user's own bookings (as a customer)
   await supabase.from("bookings").delete().eq("user_id", userId);

   // Delete user's reviews
   await supabase.from("reviews").delete().eq("user_id", userId);

   // Delete user's web reviews
   await supabase.from("web_reviews").delete().eq("user_id", userId);

   // Finally delete the user
   const { error } = await supabase.from("users").delete().eq("id", userId);

   if (error) throw error;

   setUsers((prev) => prev.filter((u) => u.id !== userId));
   addToast("User deleted successfully", "success");
  } catch (err) {
   console.error("Delete user error:", err);
   addToast("Failed to delete user: " + err.message, "error");
  }
 };

 // Change user role
 const handleChangeRole = async (userId, newRole) => {
  try {
   const { error } = await supabase
    .from("users")
    .update({ role: newRole })
    .eq("id", userId);

   if (error) throw error;

   setUsers((prev) =>
    prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
   );
   addToast(`User role changed to ${newRole}`, "success");
  } catch (err) {
   console.error("Change role error:", err);
   addToast("Failed to change role: " + err.message, "error");
  }
 };

 // Toggle restaurant featured status
 const handleToggleFeatured = async (restaurantId, currentlyFeatured) => {
  setToggling(restaurantId);
  try {
   const { error } = await supabase
    .from("restaurants")
    .update({ is_featured: !currentlyFeatured })
    .eq("id", restaurantId);

   if (error) throw error;

   setRestaurants((prev) =>
    prev.map((r) =>
     r.id === restaurantId ? { ...r, is_featured: !currentlyFeatured } : r,
    ),
   );

   addToast(
    `Restaurant ${!currentlyFeatured ? "featured" : "unfeatured"} successfully`,
    "success",
   );
  } catch (err) {
   console.error("Toggle featured error:", err);
   addToast("Failed to update featured status", "error");
  } finally {
   setToggling(null);
  }
 };

 // Today's bookings
 const todayStr = new Date().toISOString().split("T")[0];
 const todayBookings = useMemo(
  () => bookings.filter((b) => b.date === todayStr),
  [bookings, todayStr],
 );

 const renderContent = () => {
  if (loading) {
   return (
    <div className="flex items-center justify-center py-32">
     <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-500 text-sm font-medium">
       Loading admin data...
      </p>
     </div>
    </div>
   );
  }

  switch (activeTab) {
   case "Overview":
    return (
     <AdminOverview
      restaurants={restaurants}
      users={users}
      bookings={bookings}
      todayBookings={todayBookings}
     />
    );
   case "Restaurants":
    return (
     <AdminRestaurants
      restaurants={restaurants}
      onToggleActive={handleToggleActive}
      onToggleFeatured={handleToggleFeatured}
      toggling={toggling}
     />
    );
   case "Reservations":
    return <AdminReservations bookings={bookings} restaurants={restaurants} />;
   case "Users":
    return (
     <AdminUsers
      users={users}
      bookings={bookings}
      onDeleteUser={handleDeleteUser}
      onChangeRole={handleChangeRole}
      adminEmail={SUPER_ADMIN_EMAIL}
     />
    );
   case "Reviews":
    return <AdminReviews restaurants={restaurants} />;
   case "Web Reviews":
    return <AdminWebReviews />;
   case "Banner Ads":
    return <AdminBannerAds />;
   case "Payments":
    return <AdminPayments />;
   case "Support":
    return <AdminSupportTickets />;
   default:
    return <div>Select a tab</div>;
  }
 };

 return (
  <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
   <AdminSidebar
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    onLogout={() => {
     logout();
     navigate("/login");
    }}
   />

   <main className="flex-1 p-8 overflow-y-auto h-screen">
    <div className="mx-auto">
     {/* Top bar with notification bell */}
     <div className="flex items-center justify-end mb-6">
      <NotificationBell
       notifications={notifications}
       onClear={(id) =>
        setNotifications((prev) => prev.filter((n) => n.id !== id))
       }
       onClearAll={() => setNotifications([])}
      />
     </div>
     {renderContent()}
    </div>
   </main>
  </div>
 );
}
