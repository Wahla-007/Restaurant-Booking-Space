import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { useToast } from "../../context/ToastContext";
import {
 QrCode,
 Upload,
 Send,
 CheckCircle2,
 Clock,
 XCircle,
 Loader2,
 Receipt,
 User,
 Building2,
 ImagePlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BillingTab({ restaurantId, restaurantName, userId }) {
 const { addToast } = useToast();
 const [payments, setPayments] = useState([]);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [showForm, setShowForm] = useState(false);

 // Form state
 const [senderName, setSenderName] = useState("");
 const [accountType, setAccountType] = useState("JazzCash");
 const [screenshotFile, setScreenshotFile] = useState(null);
 const [screenshotPreview, setScreenshotPreview] = useState(null);

 // Load payment history
 useEffect(() => {
  if (!restaurantId) return;
  loadPayments();
 }, [restaurantId]);

 const loadPayments = async () => {
  try {
   const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

   if (error) throw error;
   setPayments(data || []);
  } catch (err) {
   console.error("Error loading payments:", err);
  } finally {
   setLoading(false);
  }
 };

 const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
   addToast("File size must be under 5MB", "error");
   return;
  }

  setScreenshotFile(file);
  const reader = new FileReader();
  reader.onloadend = () => setScreenshotPreview(reader.result);
  reader.readAsDataURL(file);
 };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!senderName.trim()) {
   addToast("Please enter sender name", "error");
   return;
  }
  if (!screenshotFile) {
   addToast("Please upload a payment screenshot", "error");
   return;
  }

  setSubmitting(true);

  try {
   // Upload screenshot to Supabase storage
   const fileExt = screenshotFile.name.split(".").pop();
   const fileName = `payment_${restaurantId}_${Date.now()}.${fileExt}`;

   const { data: uploadData, error: uploadError } = await supabase.storage
    .from("payment-receipts")
    .upload(fileName, screenshotFile);

   if (uploadError) {
    // If bucket doesn't exist, store as base64 in DB
    console.warn("Storage upload failed, storing as data URI:", uploadError);
   }

   const screenshotUrl = uploadData
    ? supabase.storage.from("payment-receipts").getPublicUrl(fileName).data
       .publicUrl
    : screenshotPreview;

   // Insert payment record
   const { error: insertError } = await supabase.from("payments").insert({
    restaurant_id: restaurantId,
    restaurant_name: restaurantName,
    user_id: userId,
    sender_name: senderName.trim(),
    account_type: accountType,
    screenshot_url: screenshotUrl,
    status: "pending",
   });

   if (insertError) throw insertError;

   addToast("Payment submitted for approval!", "success");
   setSenderName("");
   setAccountType("JazzCash");
   setScreenshotFile(null);
   setScreenshotPreview(null);
   setShowForm(false);
   loadPayments();
  } catch (err) {
   console.error("Payment submission error:", err);
   addToast("Failed to submit payment: " + err.message, "error");
  } finally {
   setSubmitting(false);
  }
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

 return (
  <div className="space-y-6">
   {/* Header */}
   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
     <h2 className="text-2xl font-bold text-slate-800">Billing & Payments</h2>
     <p className="text-slate-500 text-sm mt-1">
      Scan the QR code, make a payment, and submit your receipt for approval
     </p>
    </div>
    <button
     onClick={() => setShowForm(!showForm)}
     className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer">
     <Receipt size={16} />
     {showForm ? "Hide Form" : "Submit Payment"}
    </button>
   </div>

   {/* Payment Form */}
   <AnimatePresence>
    {showForm && (
     <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* QR Code Side */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
         <div className="bg-white p-3 rounded-2xl shadow-lg mb-4">
          <img
           src="/payments/payment-qr.jpeg"
           alt="Payment QR Code"
           className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
          />
         </div>
         <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
           <QrCode size={18} className="text-emerald-600" />
           <p className="text-sm font-bold text-slate-800">Scan to Pay</p>
          </div>
          <p className="text-xs text-slate-500 max-w-[260px]">
           Scan this QR code with your banking app, complete the payment, then
           fill out the form with your details
          </p>
         </div>
        </div>

        {/* Form Side */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
         <h3 className="text-lg font-bold text-slate-800 mb-1">
          Payment Details
         </h3>
         <p className="text-xs text-slate-400 -mt-4">
          Fill in after completing the payment
         </p>

         {/* Sender Name */}
         <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
           <User size={14} className="text-slate-400" />
           Sender Name
          </label>
          <input
           type="text"
           value={senderName}
           onChange={(e) => setSenderName(e.target.value)}
           placeholder="Full name of the account holder"
           className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all"
           required
          />
         </div>

         {/* Account Type */}
         <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
           <Building2 size={14} className="text-slate-400" />
           Account Type
          </label>
          <div className="grid grid-cols-3 gap-2">
           {["JazzCash", "EasyPaisa", "Bank Transfer"].map((type) => (
            <button
             key={type}
             type="button"
             onClick={() => setAccountType(type)}
             className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              accountType === type
               ? "bg-emerald-600 text-white shadow-sm"
               : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-emerald-300"
             }`}>
             {type}
            </button>
           ))}
          </div>
         </div>

         {/* Screenshot Upload */}
         <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
           <ImagePlus size={14} className="text-slate-400" />
           Payment Screenshot
          </label>
          <div className="relative">
           {screenshotPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200">
             <img
              src={screenshotPreview}
              alt="Receipt preview"
              className="w-full max-h-48 object-contain bg-slate-50"
             />
             <button
              type="button"
              onClick={() => {
               setScreenshotFile(null);
               setScreenshotPreview(null);
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
              <XCircle size={14} />
             </button>
            </div>
           ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer">
             <Upload size={24} className="text-slate-300 mb-2" />
             <span className="text-sm text-slate-500 font-medium">
              Click to upload screenshot
             </span>
             <span className="text-xs text-slate-400 mt-1">
              PNG, JPG up to 5MB
             </span>
             <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
             />
            </label>
           )}
          </div>
         </div>

         {/* Submit Button */}
         <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer">
          {submitting ? (
           <>
            <Loader2 size={16} className="animate-spin" />
            Submitting...
           </>
          ) : (
           <>
            <Send size={16} />
            Submit for Approval
           </>
          )}
         </button>
        </form>
       </div>
      </div>
     </motion.div>
    )}
   </AnimatePresence>

   {/* Payment History */}
   <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100">
     <h3 className="text-base font-bold text-slate-800">Payment History</h3>
    </div>

    {loading ? (
     <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
     </div>
    ) : payments.length === 0 ? (
     <div className="text-center py-16">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
       <Receipt size={24} className="text-slate-300" />
      </div>
      <p className="text-slate-500 font-medium text-sm">No payments yet</p>
      <p className="text-slate-400 text-xs mt-1">
       Submit your first payment to get started
      </p>
     </div>
    ) : (
     <div className="divide-y divide-slate-100">
      {payments.map((payment) => {
       const config = statusConfig[payment.status] || statusConfig.pending;
       const StatusIcon = config.icon;
       return (
        <div
         key={payment.id}
         className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
         {/* Screenshot thumbnail */}
         <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
          {payment.screenshot_url ? (
           <img
            src={payment.screenshot_url}
            alt="Receipt"
            className="w-full h-full object-cover"
           />
          ) : (
           <div className="w-full h-full flex items-center justify-center">
            <Receipt size={18} className="text-slate-300" />
           </div>
          )}
         </div>

         {/* Details */}
         <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
           {payment.sender_name}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
           {payment.account_type} •{" "}
           {new Date(payment.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
           })}
          </p>
         </div>

         {/* Status Badge */}
         <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ${config.bg} ${config.text} ${config.ring}`}>
          <StatusIcon size={13} />
          {config.label}
         </div>
        </div>
       );
      })}
     </div>
    )}
   </div>
  </div>
 );
}
