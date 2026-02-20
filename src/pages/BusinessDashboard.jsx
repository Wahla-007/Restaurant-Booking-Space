import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { playNotificationSound, warmUpAudio } from "../utils/notificationSound";
import NotificationBell from "../components/dashboard/NotificationBell";
import Modal from "../components/ui/Modal";
import Sidebar from "../components/dashboard/Sidebar";
import StatsCard from "../components/dashboard/StatsCard";
import BookingsTable from "../components/dashboard/BookingsTable";
import MenuManagement from "../components/dashboard/MenuManagement";
import RestaurantSettings from "../components/dashboard/RestaurantSettings";
import LeadsTable from "../components/dashboard/LeadsTable";
import CustomerSupport from "../components/dashboard/CustomerSupport";
import ReviewsManagement from "../components/dashboard/ReviewsManagement";
import TrafficAnalytics from "../components/dashboard/TrafficAnalytics";
import DashboardChart from "../components/dashboard/DashboardChart";
import {
 Users,
 DollarSign,
 CalendarCheck,
 Utensils,
 XCircle,
} from "lucide-react";

export default function BusinessDashboard() {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 const { addToast } = useToast();

 // Data States
 const [restaurant, setRestaurant] = useState(null);
 const [bookings, setBookings] = useState([]);
 const [loading, setLoading] = useState(true);

 // UI States
 const [activeTab, setActiveTab] = useState("Overview");
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 const [confirmModal, setConfirmModal] = useState({
  isOpen: false,
  title: "",
  message: "",
  onConfirm: null,
 });
 const [filterStatus, setFilterStatus] = useState("confirmed");
 const [timeRange, setTimeRange] = useState("daily");
 const [menuSaving, setMenuSaving] = useState(false);
 const [notifications, setNotifications] = useState([]);

 // Form State for Settings
 const [formData, setFormData] = useState({
  name: "",
  cuisine: "",
  price: "$$",
  location: "",
  location_link: "",
  description: "",
  images: ["", "", "", ""],
  active_days: [],
  opening_time: "12:00",
  closing_time: "23:00",
  tags: "",
  menu_highlights: [],
 });

 // Ref for ReviewsManagement to trigger refresh
 const reviewsRefreshRef = useRef(null);

 // Warm up audio on mount so notification sound works
 useEffect(() => {
  warmUpAudio();
 }, []);

 useEffect(() => {
  fetchRestaurant();
 }, [user]);

 // Polling for new bookings & reviews (runs every 10 seconds)
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
  if (!restaurant?.id) return;

  // Set initial check time to now
  lastCheckedRef.current = new Date().toISOString();

  const pollInterval = setInterval(async () => {
   try {
    // Poll for new bookings
    const { data: newBookings } = await supabase
     .from("bookings")
     .select("*")
     .eq("restaurant_id", restaurant.id)
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
         message: `${booking.user_name || "A customer"} booked a table for ${booking.guests || "?"} guests on ${booking.date || "upcoming date"}`,
         time: new Date().toISOString(),
        },
        ...prev,
       ]);
      });
      addToast(
       `🔔 ${trulyNew.length} new booking${trulyNew.length > 1 ? "s" : ""}!`,
       "success",
      );
      fetchBookings(restaurant.id);
     }
    }

    // Poll for new reviews
    const { data: newReviews } = await supabase
     .from("reviews")
     .select("*")
     .eq("restaurant_id", restaurant.id)
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
      if (reviewsRefreshRef.current) {
       reviewsRefreshRef.current();
      }
     }
    }

    lastCheckedRef.current = new Date().toISOString();
   } catch (err) {
    console.warn("Polling error:", err);
   }
  }, 10000);

  return () => clearInterval(pollInterval);
 }, [restaurant?.id]);

 const fetchRestaurant = async () => {
  if (!user) return;
  try {
   const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .single();

   if (data) {
    setRestaurant(data);
    fetchBookings(data.id);

    // Populate form data
    setFormData({
     name: data.name || "",
     cuisine: data.cuisine || "",
     price: data.price || "$$",
     location: data.location || "",
     location_link: data.location_link || "",
     description: data.description || "",
     images:
      data.images && data.images.length > 0
       ? [...data.images, "", "", "", ""].slice(0, 4)
       : ["", "", "", ""],
     active_days: data.active_days || [],
     opening_time: data.opening_time || "12:00",
     closing_time: data.closing_time || "23:00",
     tags: (data.tags || []).join(", "),
     menu_highlights: data.menu?.highlights || [],
    });
   }
  } catch (err) {
   console.log("Error loading restaurant:", err);
  } finally {
   setLoading(false);
  }
 };

 const fetchBookings = async (restaurantId) => {
  try {
   const { data, error } = await supabase
    .from("bookings")
    .select(`*, users ( name, email )`)
    .eq("restaurant_id", restaurantId)
    .order("date", { ascending: true }); // Improved sorting logic later if needed

   if (data) setBookings(data);
  } catch (err) {
   console.error("Error fetching bookings:", err);
  }
 };

 const getStats = () => {
  const totalBookings = bookings.length;
  const activeReservations = bookings.filter(
   (b) => b.status === "confirmed",
  ).length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const completed = bookings.filter((b) => b.status === "completed").length;

  // Calculate trends (mock logic for now, or based on dates)
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonthBookings = bookings.filter(
   (b) => new Date(b.date) >= lastMonth,
  ).length;
  const lastMonthBookings = bookings.length - thisMonthBookings; // Simplified for demo

  const trend =
   lastMonthBookings === 0
    ? 100
    : Math.round(
       ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100,
      );

  return {
   totalBookings,
   reservations: activeReservations,
   completed,
   cancelled,
   trend,
  };
 };

 const getLeads = () => {
  const uniqueLeads = [];
  const seen = new Set();

  bookings.forEach((b) => {
   const email = b.users?.email || b.email;
   if (email && !seen.has(email)) {
    seen.add(email);
    uniqueLeads.push({
     name: b.users?.name || b.user_name || "Guest",
     email: email,
     phone: "N/A", // Placeholder as per request
     total_visits: bookings.filter(
      (booking) => (booking.users?.email || booking.email) === email,
     ).length,
     last_visit: b.date,
    });
   }
  });
  return uniqueLeads;
 };

 const downloadLeads = () => {
  const leads = getLeads();
  const csvContent =
   "data:text/csv;charset=utf-8," +
   "Name,Email,Phone,Total Visits,Last Visit\n" +
   leads
    .map(
     (l) => `${l.name},${l.email},${l.phone},${l.total_visits},${l.last_visit}`,
    )
    .join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "customer_leads.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
 };

 // --- Handlers ---

 const handleUpdateBookingStatus = (bookingId, status) => {
  setConfirmModal({
   isOpen: true,
   title: status === "cancelled" ? "Cancel Booking" : "Complete Booking",
   message: `Are you sure you want to mark this booking as ${status}?`,
   onConfirm: () => executeBookingUpdate(bookingId, status),
  });
 };

 const executeBookingUpdate = async (bookingId, status) => {
  try {
   const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

   if (error) throw error;

   addToast(`Booking marked as ${status}`, "success");
   fetchBookings(restaurant.id);
   setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
  } catch (err) {
   addToast("Failed to update booking: " + err.message, "error");
  }
 };

 const handleSaveSettings = async () => {
  try {
   const payload = {
    owner_id: user.id,
    // ... include all text fields
    name: formData.name,
    cuisine: formData.cuisine,
    price: formData.price,
    location: formData.location,
    location_link: formData.location_link,
    description: formData.description,
    images: formData.images.filter((img) => img), // clean up
    active_days: formData.active_days,
    opening_time: formData.opening_time,
    closing_time: formData.closing_time,
    tags: formData.tags
     .split(",")
     .map((t) => t.trim())
     .filter((t) => t),
    menu: { highlights: formData.menu_highlights },
   };

   if (restaurant) {
    await supabase.from("restaurants").update(payload).eq("id", restaurant.id);
   } else {
    await supabase.from("restaurants").insert([payload]);
   }

   addToast("Settings saved successfully!", "success");
   fetchRestaurant();
  } catch (err) {
   addToast("Error saving settings: " + err.message, "error");
  }
 };

 const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
 };

 const handleImageChange = async (index, event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
   const fileExt = file.name.split(".").pop();
   const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
   const filePath = `${user.id}/${fileName}`;

   await supabase.storage.from("restaurant-images").upload(filePath, file);
   const { data } = supabase.storage
    .from("restaurant-images")
    .getPublicUrl(filePath);

   const newImages = [...formData.images];
   newImages[index] = data.publicUrl;
   setFormData((prev) => ({ ...prev, images: newImages }));
  } catch (err) {
   console.error("Upload failed", err);
  }
 };

 const handleMenuAdd = async (item, imageFile) => {
  if (!restaurant) {
   addToast("Please save restaurant settings first.", "error");
   return;
  }

  setMenuSaving(true);
  try {
   let imageUrl = "";

   // Upload image if provided
   if (imageFile) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${user.id}/menu/${fileName}`;

    const { error: uploadError } = await supabase.storage
     .from("restaurant-images")
     .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
     .from("restaurant-images")
     .getPublicUrl(filePath);

    imageUrl = urlData.publicUrl;
   }

   const newItem = { ...item, image: imageUrl };
   const updatedMenu = [...formData.menu_highlights, newItem];

   // Persist to Supabase
   const { error } = await supabase
    .from("restaurants")
    .update({ menu: { highlights: updatedMenu } })
    .eq("id", restaurant.id);

   if (error) throw error;

   setFormData((prev) => ({ ...prev, menu_highlights: updatedMenu }));
   addToast("Menu item added successfully!", "success");
  } catch (err) {
   addToast("Failed to add menu item: " + err.message, "error");
  } finally {
   setMenuSaving(false);
  }
 };

 const handleMenuRemove = async (index) => {
  if (!restaurant) return;

  try {
   const updatedMenu = formData.menu_highlights.filter((_, i) => i !== index);

   const { error } = await supabase
    .from("restaurants")
    .update({ menu: { highlights: updatedMenu } })
    .eq("id", restaurant.id);

   if (error) throw error;

   setFormData((prev) => ({ ...prev, menu_highlights: updatedMenu }));
   addToast("Menu item removed.", "success");
  } catch (err) {
   addToast("Failed to remove menu item: " + err.message, "error");
  }
 };

 // --- Render Views ---

 const renderContent = () => {
  switch (activeTab) {
   case "Overview":
    const stats = getStats();

    // Filter bookings based on active card
    const filteredOverviewBookings =
     filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

    return (
     <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>

      <DashboardChart
       data={bookings}
       timeRange={timeRange}
       onTimeRangeChange={setTimeRange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
       <StatsCard
        title="Total Bookings"
        value={stats.totalBookings}
        icon={Users}
        trend={stats.trend >= 0 ? "up" : "down"}
        trendValue={`${Math.abs(stats.trend)}%`}
        isActive={filterStatus === "all"}
        onClick={() => setFilterStatus("all")}
       />
       <StatsCard
        title="Active Reservations"
        value={stats.reservations}
        icon={CalendarCheck}
        color="blue"
        isActive={filterStatus === "confirmed"}
        onClick={() => setFilterStatus("confirmed")}
       />
       <StatsCard
        title="Completed Reservations"
        value={stats.completed}
        icon={Utensils}
        color="emerald"
        isActive={filterStatus === "completed"}
        onClick={() => setFilterStatus("completed")}
       />
       <StatsCard
        title="Cancelled Bookings"
        value={stats.cancelled}
        icon={XCircle}
        color="rose"
        isActive={filterStatus === "cancelled"}
        onClick={() => setFilterStatus("cancelled")}
       />
      </div>

      <div className="space-y-4">
       <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">
         {filterStatus === "all"
          ? "All Bookings"
          : filterStatus === "confirmed"
            ? "Active Reservations"
            : filterStatus === "completed"
              ? "Completed Reservations"
              : filterStatus === "cancelled"
                ? "Cancelled Bookings"
                : "Bookings"}
        </h3>
        <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
         {filteredOverviewBookings.length} Record
         {filteredOverviewBookings.length !== 1 ? "s" : ""}
        </span>
       </div>
       <BookingsTable
        bookings={filteredOverviewBookings}
        onAccept={(id) => handleUpdateBookingStatus(id, "confirmed")}
        onReject={(id) => handleUpdateBookingStatus(id, "cancelled")}
        onStatusChange={handleUpdateBookingStatus}
       />
      </div>
     </div>
    );
   case "Menu":
    return (
     <MenuManagement
      menuItems={formData.menu_highlights}
      onAdd={handleMenuAdd}
      onRemove={handleMenuRemove}
      saving={menuSaving}
     />
    );
   case "Reservations":
    return (
     <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">All Reservations</h2>
      <BookingsTable
       bookings={bookings}
       onAccept={(id) => handleUpdateBookingStatus(id, "confirmed")}
       onReject={(id) => handleUpdateBookingStatus(id, "cancelled")}
      />
     </div>
    );
   case "Leads":
    return <LeadsTable leads={getLeads()} onExport={downloadLeads} />;
   case "Reviews":
    return (
     <ReviewsManagement
      restaurantId={restaurant?.id}
      onRefreshRef={reviewsRefreshRef}
     />
    );
   case "Traffic":
    return <TrafficAnalytics restaurantId={restaurant?.id} />;
   case "Settings":
    return (
     <RestaurantSettings
      restaurant={formData}
      onChange={handleInputChange}
      onSave={handleSaveSettings}
      onImageChange={handleImageChange}
     />
    );
   case "Support":
    return (
     <CustomerSupport
      restaurantId={restaurant?.id}
      restaurantName={restaurant?.name}
      userId={user?.id}
     />
    );
   default:
    return <div>Select a tab</div>;
  }
 };

 return (
  <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
   <Sidebar
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    restaurantName={restaurant?.name}
    onLogout={() => {
     logout();
     navigate("/login");
    }}
   />

   <main className="flex-1 p-8 overflow-y-auto h-screen">
    <div className="max-w-7xl mx-auto">
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

   <Modal
    isOpen={confirmModal.isOpen}
    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
    title={confirmModal.title}
    footer={
     <>
      <button
       onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
       className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
       Cancel
      </button>
      <button
       onClick={confirmModal.onConfirm}
       className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
       Confirm
      </button>
     </>
    }>
    <p className="text-slate-600">{confirmModal.message}</p>
   </Modal>
  </div>
 );
}
