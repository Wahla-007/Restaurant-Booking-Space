import { useState, useEffect } from "react";
import {
 Phone,
 MessageSquare,
 Send,
 AlertCircle,
 CheckCircle,
 Clock,
 Loader2,
 ChevronDown,
 ChevronUp,
 MessageCircleReply,
 RefreshCw,
} from "lucide-react";
import { supabase } from "../../supabase";
import { format } from "date-fns";

const STATUS_CONFIG = {
 pending: {
  label: "Pending",
  color: "bg-amber-50 text-amber-700 border-amber-200",
  dot: "bg-amber-400",
 },
 in_progress: {
  label: "In Progress",
  color: "bg-blue-50 text-blue-700 border-blue-200",
  dot: "bg-blue-400",
 },
 resolved: {
  label: "Resolved",
  color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  dot: "bg-emerald-400",
 },
};

const PRIORITY_CONFIG = {
 Low: "bg-slate-100 text-slate-600",
 Normal: "bg-blue-100 text-blue-700",
 High: "bg-red-100 text-red-700",
};

export default function CustomerSupport({
 restaurantId,
 restaurantName,
 userId,
}) {
 const [ticket, setTicket] = useState({
  subject: "",
  category: "General Inquiry",
  priority: "Normal",
  message: "",
 });
 const [submitting, setSubmitting] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [tickets, setTickets] = useState([]);
 const [loadingTickets, setLoadingTickets] = useState(true);
 const [expandedTicket, setExpandedTicket] = useState(null);

 const fetchTickets = async () => {
  if (!restaurantId) return;
  setLoadingTickets(true);
  try {
   const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

   if (error) throw error;
   setTickets(data || []);
  } catch (err) {
   console.error("Error fetching tickets:", err);
  } finally {
   setLoadingTickets(false);
  }
 };

 useEffect(() => {
  fetchTickets();
 }, [restaurantId]);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!restaurantId) return;
  setSubmitting(true);
  try {
   const { error } = await supabase.from("support_tickets").insert([
    {
     restaurant_id: restaurantId,
     restaurant_name: restaurantName || "Unknown",
     user_id: userId,
     subject: ticket.subject,
     category: ticket.category,
     priority: ticket.priority,
     message: ticket.message,
     status: "pending",
    },
   ]);

   if (error) throw error;

   setSubmitted(true);
   setTicket({
    subject: "",
    category: "General Inquiry",
    priority: "Normal",
    message: "",
   });
   fetchTickets();
   setTimeout(() => setSubmitted(false), 4000);
  } catch (err) {
   console.error("Error submitting ticket:", err);
  } finally {
   setSubmitting(false);
  }
 };

 const handleChange = (e) => {
  const { name, value } = e.target;
  setTicket((prev) => ({ ...prev, [name]: value }));
 };

 const pendingCount = tickets.filter((t) => t.status === "pending").length;
 const inProgressCount = tickets.filter(
  (t) => t.status === "in_progress",
 ).length;
 const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

 return (
  <div className="space-y-8 max-w-5xl mx-auto">
   {/* Header Section */}
   <div className="bg-linear-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
    <div className="relative z-10">
     <h2 className="text-3xl font-bold mb-2">Customer Support Center</h2>
     <p className="text-emerald-50 opacity-90 max-w-xl">
      Submit a support ticket and our team will get back to you. Track your
      ticket status in real-time below.
     </p>
    </div>
    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Left Column — Helplines + Stats */}
    <div className="lg:col-span-1 space-y-6">
     {/* Helpline Card */}
     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
       <Phone className="w-5 h-5 text-emerald-600" />
       Helpline Numbers
      </h3>
      <div className="space-y-4">
       <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
        <div className="bg-white p-2 rounded-lg shadow-sm">
         <Phone className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
         <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">
          Priority Support
         </p>
         <p className="text-lg font-bold text-slate-900">0328 0562360</p>
        </div>
       </div>
       <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
        <div className="bg-white p-2 rounded-lg shadow-sm">
         <Phone className="w-5 h-5 text-blue-600" />
        </div>
        <div>
         <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
          General Inquiries
         </p>
         <p className="text-lg font-bold text-slate-900">+92 325 2337074</p>
        </div>
       </div>
      </div>
      <div className="mt-6 pt-6 border-t border-slate-100">
       <p className="text-sm text-slate-500 text-center">
        Available Mon-Sat, 9:00 AM - 10:00 PM
       </p>
      </div>
     </div>

     {/* Ticket Stats */}
     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
       Your Ticket Stats
      </h3>
      <div className="space-y-3">
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
         <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
         <span className="text-sm text-slate-600">Pending</span>
        </div>
        <span className="text-sm font-bold text-slate-800">{pendingCount}</span>
       </div>
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
         <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
         <span className="text-sm text-slate-600">In Progress</span>
        </div>
        <span className="text-sm font-bold text-slate-800">
         {inProgressCount}
        </span>
       </div>
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
         <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
         <span className="text-sm text-slate-600">Resolved</span>
        </div>
        <span className="text-sm font-bold text-slate-800">
         {resolvedCount}
        </span>
       </div>
      </div>
     </div>
    </div>

    {/* Right Column — Form */}
    <div className="lg:col-span-2">
     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
       <MessageSquare className="w-6 h-6 text-emerald-600" />
       Open a Support Ticket
      </h3>

      {submitted ? (
       <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
         <CheckCircle className="w-8 h-8" />
        </div>
        <h4 className="text-xl font-bold text-emerald-800 mb-2">
         Ticket Submitted!
        </h4>
        <p className="text-emerald-600">
         Your support request has been received. You can track its status below.
        </p>
       </div>
      ) : (
       <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
           Subject
          </label>
          <input
           required
           type="text"
           name="subject"
           value={ticket.subject}
           onChange={handleChange}
           placeholder="Brief description of the issue"
           className="w-full px-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
          />
         </div>
         <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
           Category
          </label>
          <select
           name="category"
           value={ticket.category}
           onChange={handleChange}
           className="w-full px-4 py-3 bg-white text-slate-800 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all">
           <option>General Inquiry</option>
           <option>Technical Issue</option>
           <option>Billing & Payments</option>
           <option>Feature Request</option>
           <option>Other</option>
          </select>
         </div>
        </div>

        <div className="space-y-2">
         <label className="text-sm font-semibold text-slate-700">
          Priority Level
         </label>
         <div className="flex gap-4">
          {["Low", "Normal", "High"].map((p) => (
           <label key={p} className="flex items-center gap-2 cursor-pointer">
            <input
             type="radio"
             name="priority"
             value={p}
             checked={ticket.priority === p}
             onChange={handleChange}
             className="w-4 h-4 accent-emerald-600 cursor-pointer"
            />
            <span className="text-slate-600 text-sm">{p}</span>
           </label>
          ))}
         </div>
        </div>

        <div className="space-y-2">
         <label className="text-sm font-semibold text-slate-700">Message</label>
         <textarea
          required
          name="message"
          value={ticket.message}
          onChange={handleChange}
          rows="5"
          placeholder="Describe your issue in detail..."
          className="w-full px-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
         />
        </div>

        <div className="flex items-center justify-end pt-4">
         <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-50 cursor-pointer">
          {submitting ? (
           <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
           <Send className="w-5 h-5" />
          )}
          {submitting ? "Submitting..." : "Submit Ticket"}
         </button>
        </div>
       </form>
      )}
     </div>
    </div>
   </div>

   {/* Ticket History */}
   <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <div className="flex items-center justify-between mb-6">
     <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
      <Clock className="w-5 h-5 text-slate-500" />
      Your Ticket History
     </h3>
     <button
      onClick={fetchTickets}
      className="text-slate-400 hover:text-emerald-600 transition-colors p-2 rounded-lg hover:bg-emerald-50 cursor-pointer"
      title="Refresh tickets">
      <RefreshCw size={16} />
     </button>
    </div>

    {loadingTickets ? (
     <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
     </div>
    ) : tickets.length === 0 ? (
     <div className="flex flex-col items-center justify-center py-12">
      <MessageSquare size={40} className="text-slate-200 mb-3" />
      <p className="text-slate-400 text-sm font-medium">
       No tickets submitted yet
      </p>
      <p className="text-slate-300 text-xs mt-1">
       Submit a ticket above to get started
      </p>
     </div>
    ) : (
     <div className="space-y-3">
      {tickets.map((t) => {
       const statusConf = STATUS_CONFIG[t.status] || STATUS_CONFIG.pending;
       const isExpanded = expandedTicket === t.id;

       return (
        <div
         key={t.id}
         className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
         {/* Ticket Header Row */}
         <button
          onClick={() => setExpandedTicket(isExpanded ? null : t.id)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 min-w-0 flex-1">
           <div
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${statusConf.color}`}>
            {statusConf.label}
           </div>
           <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
             {t.subject}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
             {t.category} ·{" "}
             {t.created_at
              ? format(new Date(t.created_at), "MMM d, yyyy hh:mm a")
              : ""}
            </p>
           </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-3">
           <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.Normal}`}>
            {t.priority}
           </span>
           {isExpanded ? (
            <ChevronUp size={16} className="text-slate-400" />
           ) : (
            <ChevronDown size={16} className="text-slate-400" />
           )}
          </div>
         </button>

         {/* Expanded Content */}
         {isExpanded && (
          <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
           <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
             Your Message
            </p>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4">
             {t.message}
            </p>
           </div>

           {/* Admin Reply */}
           {t.admin_reply && (
            <div>
             <p className="text-xs font-semibold text-indigo-500 mb-1 flex items-center gap-1">
              <MessageCircleReply size={12} />
              Admin Response
             </p>
             <p className="text-sm text-slate-700 leading-relaxed bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              {t.admin_reply}
             </p>
             {t.replied_at && (
              <p className="text-[11px] text-slate-400 mt-1">
               Replied on{" "}
               {format(new Date(t.replied_at), "MMM d, yyyy 'at' hh:mm a")}
              </p>
             )}
            </div>
           )}
          </div>
         )}
        </div>
       );
      })}
     </div>
    )}
   </div>

   {/* FAQ Quick Links */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
    {[
     "How to manage bookings?",
     "Updating menu prices",
     "Handling cancellations",
    ].map((faq, i) => (
     <div
      key={i}
      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-200 cursor-pointer transition-colors flex items-center justify-between group">
      <span className="text-slate-600 font-medium group-hover:text-emerald-700">
       {faq}
      </span>
      <AlertCircle className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
     </div>
    ))}
   </div>
  </div>
 );
}
