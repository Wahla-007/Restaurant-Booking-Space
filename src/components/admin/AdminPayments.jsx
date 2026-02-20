import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { useToast } from "../../context/ToastContext";
import {
 CheckCircle2,
 XCircle,
 Clock,
 Receipt,
 Search,
 Eye,
 X,
 Loader2,
 Building2,
 User,
 Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPayments() {
 const { addToast } = useToast();
 const [payments, setPayments] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState("all");
 const [searchQuery, setSearchQuery] = useState("");
 const [actionLoading, setActionLoading] = useState(null);
 const [previewImage, setPreviewImage] = useState(null);

 useEffect(() => {
  loadPayments();
 }, []);

 const loadPayments = async () => {
  try {
   const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

   if (error) throw error;
   setPayments(data || []);
  } catch (err) {
   console.error("Error loading payments:", err);
   addToast("Failed to load payments", "error");
  } finally {
   setLoading(false);
  }
 };

 const handleAction = async (paymentId, status) => {
  setActionLoading(paymentId);
  try {
   const { error } = await supabase
    .from("payments")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", paymentId);

   if (error) throw error;

   setPayments((prev) =>
    prev.map((p) =>
     p.id === paymentId
      ? { ...p, status, reviewed_at: new Date().toISOString() }
      : p,
    ),
   );

   addToast(
    `Payment ${status === "approved" ? "approved" : "rejected"} successfully`,
    "success",
   );
  } catch (err) {
   console.error("Payment action error:", err);
   addToast("Failed to update payment status", "error");
  } finally {
   setActionLoading(null);
  }
 };

 const filteredPayments = payments.filter((p) => {
  const matchesFilter = filter === "all" || p.status === filter;
  const q = searchQuery.toLowerCase();
  const matchesSearch =
   !q ||
   p.sender_name?.toLowerCase().includes(q) ||
   p.restaurant_name?.toLowerCase().includes(q) ||
   p.account_type?.toLowerCase().includes(q);
  return matchesFilter && matchesSearch;
 });

 const counts = {
  all: payments.length,
  pending: payments.filter((p) => p.status === "pending").length,
  approved: payments.filter((p) => p.status === "approved").length,
  rejected: payments.filter((p) => p.status === "rejected").length,
 };

 const statusConfig = {
  pending: {
   label: "Pending",
   icon: Clock,
   bg: "bg-amber-50",
   text: "text-amber-700",
   ring: "ring-amber-200",
  },
  approved: {
   label: "Approved",
   icon: CheckCircle2,
   bg: "bg-emerald-50",
   text: "text-emerald-700",
   ring: "ring-emerald-200",
  },
  rejected: {
   label: "Rejected",
   icon: XCircle,
   bg: "bg-red-50",
   text: "text-red-700",
   ring: "ring-red-200",
  },
 };

 if (loading) {
  return (
   <div className="flex items-center justify-center py-32">
    <div className="flex flex-col items-center gap-3">
     <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
     <p className="text-slate-500 text-sm font-medium">Loading payments...</p>
    </div>
   </div>
  );
 }

 return (
  <div className="space-y-6">
   {/* Header */}
   <div>
    <h2 className="text-2xl font-bold text-slate-800">Payment Management</h2>
    <p className="text-slate-500 text-sm mt-1">
     Review and approve payment submissions from restaurants
    </p>
   </div>

   {/* Stats Cards */}
   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {[
     {
      label: "Total",
      count: counts.all,
      color: "bg-slate-50 text-slate-700",
     },
     {
      label: "Pending",
      count: counts.pending,
      color: "bg-amber-50 text-amber-700",
     },
     {
      label: "Approved",
      count: counts.approved,
      color: "bg-emerald-50 text-emerald-700",
     },
     {
      label: "Rejected",
      count: counts.rejected,
      color: "bg-red-50 text-red-700",
     },
    ].map((stat) => (
     <div
      key={stat.label}
      className={`${stat.color} rounded-xl p-4 text-center`}>
      <p className="text-2xl font-bold">{stat.count}</p>
      <p className="text-xs font-medium mt-1 opacity-70">{stat.label}</p>
     </div>
    ))}
   </div>

   {/* Filter & Search */}
   <div className="flex flex-col sm:flex-row gap-3">
    <div className="flex gap-2 flex-wrap">
     {["all", "pending", "approved", "rejected"].map((f) => (
      <button
       key={f}
       onClick={() => setFilter(f)}
       className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
        filter === f
         ? "bg-indigo-600 text-white shadow-sm"
         : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
       }`}>
       {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
       <span className="opacity-60">({counts[f]})</span>
      </button>
     ))}
    </div>
    <div className="relative flex-1 max-w-sm ml-auto">
     <Search
      size={16}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
     />
     <input
      type="text"
      placeholder="Search by name, restaurant..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
     />
    </div>
   </div>

   {/* Payments List */}
   <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    {filteredPayments.length === 0 ? (
     <div className="text-center py-16">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
       <Receipt size={24} className="text-slate-300" />
      </div>
      <p className="text-slate-500 font-medium text-sm">No payments found</p>
      <p className="text-slate-400 text-xs mt-1">
       {filter !== "all"
        ? "Try changing the filter"
        : "No payment submissions yet"}
      </p>
     </div>
    ) : (
     <div className="divide-y divide-slate-100">
      {filteredPayments.map((payment) => {
       const config = statusConfig[payment.status] || statusConfig.pending;
       const StatusIcon = config.icon;
       return (
        <div
         key={payment.id}
         className="p-5 hover:bg-slate-50/50 transition-colors">
         <div className="flex flex-col sm:flex-row gap-4">
          {/* Screenshot */}
          <div
           onClick={() => setPreviewImage(payment.screenshot_url)}
           className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all">
           {payment.screenshot_url ? (
            <img
             src={payment.screenshot_url}
             alt="Receipt"
             className="w-full h-full object-cover"
            />
           ) : (
            <div className="w-full h-full flex items-center justify-center">
             <Receipt size={20} className="text-slate-300" />
            </div>
           )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
           <div className="flex items-start justify-between gap-3">
            <div>
             <p className="text-sm font-bold text-slate-800">
              {payment.restaurant_name || "Unknown Restaurant"}
             </p>
             <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
               <User size={12} className="text-slate-400" />
               {payment.sender_name}
              </span>
              <span className="flex items-center gap-1">
               <Building2 size={12} className="text-slate-400" />
               {payment.account_type}
              </span>
              <span className="flex items-center gap-1">
               <Calendar size={12} className="text-slate-400" />
               {new Date(payment.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
               })}
              </span>
             </div>
            </div>

            {/* Status */}
            <div
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 shrink-0 ${config.bg} ${config.text} ${config.ring}`}>
             <StatusIcon size={13} />
             {config.label}
            </div>
           </div>

           {/* Actions for pending */}
           {payment.status === "pending" && (
            <div className="flex items-center gap-2 mt-3">
             <button
              onClick={() => setPreviewImage(payment.screenshot_url)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
              <Eye size={13} />
              View Receipt
             </button>
             <button
              onClick={() => handleAction(payment.id, "approved")}
              disabled={actionLoading === payment.id}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer">
              {actionLoading === payment.id ? (
               <Loader2 size={13} className="animate-spin" />
              ) : (
               <CheckCircle2 size={13} />
              )}
              Approve
             </button>
             <button
              onClick={() => handleAction(payment.id, "rejected")}
              disabled={actionLoading === payment.id}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer">
              {actionLoading === payment.id ? (
               <Loader2 size={13} className="animate-spin" />
              ) : (
               <XCircle size={13} />
              )}
              Reject
             </button>
            </div>
           )}

           {/* Review date for already reviewed */}
           {payment.reviewed_at && payment.status !== "pending" && (
            <p className="text-xs text-slate-400 mt-2">
             Reviewed on{" "}
             {new Date(payment.reviewed_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
             })}
            </p>
           )}
          </div>
         </div>
        </div>
       );
      })}
     </div>
    )}
   </div>

   {/* Image Preview Modal */}
   <AnimatePresence>
    {previewImage && (
     <>
      <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       onClick={() => setPreviewImage(null)}
       className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
      />
      <motion.div
       initial={{ opacity: 0, scale: 0.9 }}
       animate={{ opacity: 1, scale: 1 }}
       exit={{ opacity: 0, scale: 0.9 }}
       className="fixed inset-0 z-[101] flex items-center justify-center p-4">
       <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
        <button
         onClick={() => setPreviewImage(null)}
         className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md z-10 cursor-pointer">
         <X size={16} className="text-slate-700" />
        </button>
        <img
         src={previewImage}
         alt="Payment Receipt"
         className="w-full max-h-[80vh] object-contain bg-slate-50"
        />
       </div>
      </motion.div>
     </>
    )}
   </AnimatePresence>
  </div>
 );
}
