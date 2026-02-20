import { useState } from "react";
import { Check, X, Clock, Calendar, User, Users } from "lucide-react";

const BookingsTable = ({ bookings, onAccept, onReject, onStatusChange }) => {
 const [searchTerm, setSearchTerm] = useState("");

 const filteredBookings = bookings.filter((booking) => {
  const term = searchTerm.toLowerCase();
  const name = booking.users?.name || booking.user_name || "Guest";
  const email = booking.users?.email || booking.email || "";
  return (
   name.toLowerCase().includes(term) || email.toLowerCase().includes(term)
  );
 });

 return (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
   <div className="p-6 border-b border-slate-100 flex justify-between items-center">
    <h2 className="text-lg font-bold text-slate-800">Recent Reservations</h2>
    <div className="flex gap-2">
     <input
      type="text"
      placeholder="Search guests..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="px-4 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl text-sm shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
     />
    </div>
   </div>

   <div className="overflow-x-auto">
    <table className="w-full">
     <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider text-left">
      <tr>
       <th className="px-6 py-4">Guest</th>
       <th className="px-6 py-4">Date & Time</th>
       <th className="px-6 py-4">People</th>
       <th className="px-6 py-4">Status</th>
       <th className="px-6 py-4 text-right">Actions</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-slate-100 text-sm">
      {filteredBookings.length > 0 ? (
       filteredBookings.map((booking) => (
        <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
         <td className="px-6 py-4">
          <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
            <User className="w-5 h-5" />
           </div>
           <div>
            <p className="font-semibold text-slate-900">
             {booking.users?.name || booking.user_name || "Guest"}
            </p>
            <p className="text-slate-500 text-xs">
             {booking.users?.email || booking.email || "No email"}
            </p>
           </div>
          </div>
         </td>
         <td className="px-6 py-4">
          <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{new Date(booking.date).toLocaleDateString()}</span>
           </div>
           <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Clock className="w-3 h-3" />
            <span>{booking.time}</span>
           </div>
          </div>
         </td>
         <td className="px-6 py-4">
          <div className="flex items-center gap-2 text-slate-700">
           <Users className="w-4 h-4 text-slate-400" />
           <span>{booking.party_size || booking.guests} Guests</span>
          </div>
         </td>
         <td className="px-6 py-4">
          <span
           className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${
                       booking.status === "confirmed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : booking.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : booking.status === "completed"
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-rose-50 text-rose-600 border-rose-100"
                      }
                    `}>
           {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
         </td>
         <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-2">
           {booking.status === "pending" && (
            <>
             <button
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors tooltip"
              title="Accept"
              onClick={() => onAccept(booking.id)}>
              <Check className="w-4 h-4" />
             </button>
             <button
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors tooltip"
              title="Reject"
              onClick={() => onReject(booking.id)}>
              <X className="w-4 h-4" />
             </button>
            </>
           )}
           {booking.status === "confirmed" && (
            <>
             <button
              className="px-3 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors border border-emerald-100"
              onClick={() => onStatusChange(booking.id, "completed")}>
              Complete
             </button>
             <button
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors tooltip"
              title="Cancel"
              onClick={() => onReject(booking.id)}>
              <X className="w-4 h-4" />
             </button>
            </>
           )}
          </div>
         </td>
        </tr>
       ))
      ) : (
       <tr>
        <td
         colSpan="5"
         className="px-6 py-12 text-center text-slate-400 italic">
         No bookings found for this period.
        </td>
       </tr>
      )}
     </tbody>
    </table>
   </div>
  </div>
 );
};

export default BookingsTable;
