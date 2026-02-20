import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Send } from "lucide-react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function WebReviewForm({ isOpen, onClose, onSubmitted }) {
 const { user } = useAuth();
 const { addToast } = useToast();
 const [rating, setRating] = useState(0);
 const [hoveredStar, setHoveredStar] = useState(0);
 const [comment, setComment] = useState("");
 const [submitting, setSubmitting] = useState(false);

 const handleSubmit = async () => {
  if (!user) {
   addToast("Please sign in to leave a review.", "error");
   return;
  }
  if (rating === 0) {
   addToast("Please select a rating.", "error");
   return;
  }
  if (!comment.trim()) {
   addToast("Please write a comment.", "error");
   return;
  }

  setSubmitting(true);
  try {
   const { error } = await supabase.from("web_reviews").insert([
    {
     user_id: user.id,
     user_name: user.name || "Anonymous",
     user_avatar: user.avatar || "",
     rating,
     comment: comment.trim(),
     is_approved: false,
    },
   ]);

   if (error) throw error;

   addToast("Review submitted! It will appear after approval.", "success");
   setRating(0);
   setComment("");
   onClose();
   if (onSubmitted) onSubmitted();
  } catch (err) {
   console.error("Error submitting review:", err);
   addToast("Failed to submit review. Please try again.", "error");
  } finally {
   setSubmitting(false);
  }
 };

 return (
  <AnimatePresence>
   {isOpen && (
    <>
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
     />
     <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
       {/* Close */}
       <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer">
        <X size={16} className="text-gray-500" />
       </button>

       <h3 className="text-xl font-extrabold text-[#002b11] mb-1">
        Share Your Experience
       </h3>
       <p className="text-sm text-gray-400 mb-6">
        Tell others what you love about ReserveKaru
       </p>

       {/* Star Rating */}
       <div className="mb-6">
        <label className="text-sm font-semibold text-[#002b11]/70 mb-2 block">
         Your Rating
        </label>
        <div className="flex items-center gap-1.5">
         {[1, 2, 3, 4, 5].map((star) => (
          <button
           key={star}
           type="button"
           onClick={() => setRating(star)}
           onMouseEnter={() => setHoveredStar(star)}
           onMouseLeave={() => setHoveredStar(0)}
           className="cursor-pointer transition-transform hover:scale-110">
           <Star
            size={28}
            className={`transition-colors ${
             star <= (hoveredStar || rating)
              ? "text-[#00aa6c] fill-[#00aa6c]"
              : "text-gray-200"
            }`}
           />
          </button>
         ))}
         {rating > 0 && (
          <span className="text-sm text-gray-400 ml-2 font-medium">
           {rating}/5
          </span>
         )}
        </div>
       </div>

       {/* Comment */}
       <div className="mb-6">
        <label className="text-sm font-semibold text-[#002b11]/70 mb-2 block">
         Your Review
        </label>
        <textarea
         value={comment}
         onChange={(e) => setComment(e.target.value)}
         placeholder="What made your experience great?"
         rows={4}
         maxLength={500}
         className="w-full px-4 py-3 bg-gray-50 text-[#002b11] placeholder:text-gray-300 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00aa6c]/20 focus:border-[#00aa6c] outline-none transition-all resize-none text-sm"
        />
        <p className="text-xs text-gray-300 mt-1 text-right">
         {comment.length}/500
        </p>
       </div>

       {/* Submit */}
       <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-[#002b11] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#004d1f] transition-colors disabled:opacity-50 cursor-pointer">
        {submitting ? (
         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
         <>
          <Send size={15} />
          Submit Review
         </>
        )}
       </motion.button>
      </div>
     </motion.div>
    </>
   )}
  </AnimatePresence>
 );
}
