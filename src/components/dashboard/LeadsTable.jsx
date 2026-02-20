import { Download, Search, Mail, Phone, User } from "lucide-react";

export default function LeadsTable({ leads, onExport }) {
 return (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
    <div>
     <h2 className="text-lg font-bold text-slate-800">Customer Leads</h2>
     <p className="text-slate-500 text-sm">Manage and export customer data</p>
    </div>
    <button
     onClick={onExport}
     className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
     <Download className="w-4 h-4" />
     <span>Export Excel</span>
    </button>
   </div>

   <div className="overflow-x-auto">
    <table className="w-full">
     <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider text-left">
      <tr>
       <th className="px-6 py-4">Customer Name</th>
       <th className="px-6 py-4">Contact Info</th>
       <th className="px-6 py-4">Total Visits</th>
       <th className="px-6 py-4">Last Visit</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-slate-100 text-sm">
      {leads.length > 0 ? (
       leads.map((lead, index) => (
        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
         <td className="px-6 py-4">
          <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <User className="w-5 h-5" />
           </div>
           <span className="font-semibold text-slate-900">
            {lead.name || "Unknown"}
           </span>
          </div>
         </td>
         <td className="px-6 py-4">
          <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-3 h-3" />
            <span>{lead.email || "N/A"}</span>
           </div>
           <div className="flex items-center gap-2 text-slate-500">
            <Phone className="w-3 h-3" />
            <span>{lead.phone || "N/A"}</span>
           </div>
          </div>
         </td>
         <td className="px-6 py-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
           {lead.total_visits} Visits
          </span>
         </td>
         <td className="px-6 py-4 text-slate-500">
          {new Date(lead.last_visit).toLocaleDateString()}
         </td>
        </tr>
       ))
      ) : (
       <tr>
        <td
         colSpan="4"
         className="px-6 py-12 text-center text-slate-400 italic">
         No leads found.
        </td>
       </tr>
      )}
     </tbody>
    </table>
   </div>
  </div>
 );
}
