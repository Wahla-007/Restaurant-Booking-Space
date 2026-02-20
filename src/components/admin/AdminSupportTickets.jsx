import { useState, useEffect } from "react";
import {
 Headset,
 Search,
 Filter,
 Clock,
 MessageCircleReply,
 Send,
 Loader2,
 ChevronDown,
 ChevronUp,
 AlertTriangle,
 CheckCircle2,
 Timer,
 X,
 RefreshCw,
} from "lucide-react";
import { supabase } from "../../supabase";
import { format } from "date-fns";

const STATUS_OPTIONS = [
 {
  value: "pending",
  label: "Pending",
  color: "bg-amber-50 text-amber-700 border-amber-200",
  dot: "bg-amber-400",
 },
 {
  value: "in_progress",
  label: "In Progress",
  color: "bg-blue-50 text-blue-700 border-blue-200",
  dot: "bg-blue-400",
 },
 {
  value: "resolved",
  label: "Resolved",
  color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  dot: "bg-emerald-400",
 },
];

const PRIORITY_CONFIG = {
 Low: "bg-slate-100 text-slate-600",
 Normal: "bg-blue-100 text-blue-700",
 High: "bg-red-100 text-red-700",
};

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s]));

const ITEMS_PER_PAGE = 10;

export default function AdminSupportTickets() {
 const [tickets, setTickets] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [filterStatus, setFilterStatus] = useState("all");
 const [filterPriority, setFilterPriority] = useState("all");
 const [expandedTicket, setExpandedTicket] = useState(null);
 const [replyText, setReplyText] = useState("");
 const [replyingTo, setReplyingTo] = useState(null);
 const [updatingStatus, setUpdatingStatus] = useState(null);
 const [currentPage, setCurrentPage] = useState(1);

 const fetchTickets = async () => {
  setLoading(true);
  try {
   const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

   if (error) throw error;
   setTickets(data || []);
  } catch (err) {
   console.error("Error fetching support tickets:", err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchTickets();
 }, []);

 const handleStatusChange = async (ticketId, newStatus) => {
  setUpdatingStatus(ticketId);
  try {
   const { error } = await supabase
    .from("support_tickets")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

   if (error) throw error;
   setTickets((prev) =>
    prev.map((t) =>
     t.id === ticketId
      ? { ...t, status: newStatus, updated_at: new Date().toISOString() }
      : t,
    ),
   );
  } catch (err) {
   console.error("Error updating status:", err);
  } finally {
   setUpdatingStatus(null);
  }
 };

 const handleReply = async (ticketId) => {
  if (!replyText.trim()) return;
  setReplyingTo(ticketId);
  try {
   const now = new Date().toISOString();
   const currentTicket = tickets.find((t) => t.id === ticketId);
   const currentStatus = currentTicket?.status || "in_progress";
   // Keep current status if already set (e.g. resolved), otherwise move to in_progress
   const newStatus =
    currentStatus === "pending" ? "in_progress" : currentStatus;

   const { error } = await supabase
    .from("support_tickets")
    .update({
     admin_reply: replyText.trim(),
     replied_at: now,
     status: newStatus,
     updated_at: now,
    })
    .eq("id", ticketId);

   if (error) throw error;
   setTickets((prev) =>
    prev.map((t) =>
     t.id === ticketId
      ? {
         ...t,
         admin_reply: replyText.trim(),
         replied_at: now,
         status: newStatus,
         updated_at: now,
        }
      : t,
    ),
   );
   setReplyText("");
  } catch (err) {
   console.error("Error sending reply:", err);
  } finally {
   setReplyingTo(null);
  }
 };

 // Filtering
 const filteredTickets = tickets.filter((t) => {
  const matchesSearch =
   !search ||
   t.subject?.toLowerCase().includes(search.toLowerCase()) ||
   t.restaurant_name?.toLowerCase().includes(search.toLowerCase()) ||
   t.message?.toLowerCase().includes(search.toLowerCase()) ||
   t.category?.toLowerCase().includes(search.toLowerCase());
  const matchesStatus = filterStatus === "all" || t.status === filterStatus;
  const matchesPriority =
   filterPriority === "all" || t.priority === filterPriority;
  return matchesSearch && matchesStatus && matchesPriority;
 });

 // Pagination
 const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
 const paginatedTickets = filteredTickets.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE,
 );

 useEffect(() => {
  setCurrentPage(1);
 }, [search, filterStatus, filterPriority]);

 // Stats
 const pendingCount = tickets.filter((t) => t.status === "pending").length;
 const inProgressCount = tickets.filter(
  (t) => t.status === "in_progress",
 ).length;
 const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

 return (
  <div className="space-y-8">
   {/* Header */}
   <div className="bg-linear-to-r from-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
    <div className="relative z-10">
     <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
      <Headset className="w-8 h-8" />
      Support Tickets
     </h2>
     <p className="text-indigo-100 opacity-90 max-w-xl">
      Review and manage support tickets from restaurant owners. Reply to issues
      and track resolution progress.
     </p>
    </div>
    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
   </div>

   {/* Quick Stats */}
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
     <div className="bg-amber-50 p-3 rounded-xl">
      <Clock className="w-6 h-6 text-amber-500" />
     </div>
     <div>
      <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
      <p className="text-xs text-slate-500 font-medium">Pending Tickets</p>
     </div>
    </div>
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
     <div className="bg-blue-50 p-3 rounded-xl">
      <Timer className="w-6 h-6 text-blue-500" />
     </div>
     <div>
      <p className="text-2xl font-bold text-slate-800">{inProgressCount}</p>
      <p className="text-xs text-slate-500 font-medium">In Progress</p>
     </div>
    </div>
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
     <div className="bg-emerald-50 p-3 rounded-xl">
      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
     </div>
     <div>
      <p className="text-2xl font-bold text-slate-800">{resolvedCount}</p>
      <p className="text-xs text-slate-500 font-medium">Resolved</p>
     </div>
    </div>
   </div>

   {/* Filters */}
   <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
     <div className="relative flex-1 w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
       type="text"
       placeholder="Search by subject, restaurant, or message..."
       value={search}
       onChange={(e) => setSearch(e.target.value)}
       className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
      />
     </div>

     <div className="flex gap-3 shrink-0">
      <select
       value={filterStatus}
       onChange={(e) => setFilterStatus(e.target.value)}
       className="px-3 py-2.5 bg-white text-slate-800 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer">
       <option value="all">All Status</option>
       <option value="pending">Pending</option>
       <option value="in_progress">In Progress</option>
       <option value="resolved">Resolved</option>
      </select>

      <select
       value={filterPriority}
       onChange={(e) => setFilterPriority(e.target.value)}
       className="px-3 py-2.5 bg-white text-slate-800 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer">
       <option value="all">All Priority</option>
       <option value="Low">Low</option>
       <option value="Normal">Normal</option>
       <option value="High">High</option>
      </select>

      <button
       onClick={fetchTickets}
       className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
       title="Refresh">
       <RefreshCw size={16} />
      </button>
     </div>
    </div>
   </div>

   {/* Ticket List */}
   <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    {loading ? (
     <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
     </div>
    ) : filteredTickets.length === 0 ? (
     <div className="flex flex-col items-center justify-center py-20">
      <Headset size={48} className="text-slate-200 mb-3" />
      <p className="text-slate-400 text-sm font-medium">No tickets found</p>
      <p className="text-slate-300 text-xs mt-1">
       {search || filterStatus !== "all" || filterPriority !== "all"
        ? "Try adjusting your filters"
        : "No support tickets have been submitted yet"}
      </p>
     </div>
    ) : (
     <div className="divide-y divide-slate-100">
      {paginatedTickets.map((t) => {
       const statusConf = STATUS_MAP[t.status] || STATUS_MAP.pending;
       const isExpanded = expandedTicket === t.id;

       return (
        <div key={t.id} className="hover:bg-slate-50/50 transition-colors">
         {/* Row */}
         <button
          onClick={() => {
           setExpandedTicket(isExpanded ? null : t.id);
           setReplyText(t.admin_reply || "");
          }}
          className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer">
          <div className="flex items-center gap-4 min-w-0 flex-1">
           {/* Priority Indicator */}
           {t.priority === "High" && (
            <AlertTriangle size={16} className="text-red-500 shrink-0" />
           )}

           <div
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${statusConf.color}`}>
            {statusConf.label}
           </div>

           <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">
             {t.subject}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
             <span className="text-slate-500 font-medium">
              {t.restaurant_name}
             </span>
             {" · "}
             {t.category}
             {" · "}
             {t.created_at
              ? format(new Date(t.created_at), "MMM d, yyyy hh:mm a")
              : ""}
            </p>
           </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4">
           <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.Normal}`}>
            {t.priority}
           </span>
           {t.admin_reply && (
            <MessageCircleReply
             size={14}
             className="text-indigo-400"
             title="Replied"
            />
           )}
           {isExpanded ? (
            <ChevronUp size={16} className="text-slate-400" />
           ) : (
            <ChevronDown size={16} className="text-slate-400" />
           )}
          </div>
         </button>

         {/* Expanded Detail */}
         {isExpanded && (
          <div className="px-6 pb-6 border-t border-slate-100 pt-5 space-y-5">
           {/* Message */}
           <div>
            <p className="text-xs font-semibold text-slate-500 mb-1.5">
             Customer Message
            </p>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
             {t.message}
            </p>
           </div>

           {/* Status Control */}
           <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
             <span className="text-xs font-semibold text-slate-500">
              Change Status:
             </span>
             <div className="flex gap-1.5">
              {STATUS_OPTIONS.map((s) => (
               <button
                key={s.value}
                disabled={updatingStatus === t.id}
                onClick={(e) => {
                 e.stopPropagation();
                 handleStatusChange(t.id, s.value);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                 t.status === s.value
                  ? `${s.color} ring-2 ring-offset-1 ${s.value === "pending" ? "ring-amber-300" : s.value === "in_progress" ? "ring-blue-300" : "ring-emerald-300"}`
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                } disabled:opacity-50`}>
                {s.label}
               </button>
              ))}
             </div>
            </div>
           </div>

           {/* Reply Section */}
           <div>
            <p className="text-xs font-semibold text-indigo-500 mb-1.5 flex items-center gap-1">
             <MessageCircleReply size={12} />
             Admin Reply
            </p>
            <textarea
             value={replyText}
             onChange={(e) => setReplyText(e.target.value)}
             rows="3"
             placeholder="Type your reply to the restaurant owner..."
             className="w-full px-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none text-sm"
            />
            <div className="flex items-center justify-between mt-2">
             <div>
              {t.replied_at && (
               <p className="text-[11px] text-slate-400">
                Last replied:{" "}
                {format(new Date(t.replied_at), "MMM d, yyyy 'at' hh:mm a")}
               </p>
              )}
             </div>
             <button
              onClick={() => handleReply(t.id)}
              disabled={replyingTo === t.id || !replyText.trim()}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer">
              {replyingTo === t.id ? (
               <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
               <Send className="w-4 h-4" />
              )}
              {replyingTo === t.id ? "Sending..." : "Send Reply"}
             </button>
            </div>
           </div>
          </div>
         )}
        </div>
       );
      })}
     </div>
    )}

    {/* Pagination */}
    {totalPages > 1 && (
     <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
      <p className="text-xs text-slate-500">
       Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
       {Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)} of{" "}
       {filteredTickets.length} tickets
      </p>
      <div className="flex gap-1">
       {Array.from({ length: totalPages }, (_, i) => (
        <button
         key={i}
         onClick={() => setCurrentPage(i + 1)}
         className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
          currentPage === i + 1
           ? "bg-indigo-600 text-white"
           : "text-slate-500 hover:bg-slate-100"
         }`}>
         {i + 1}
        </button>
       ))}
      </div>
     </div>
    )}
   </div>
  </div>
 );
}
