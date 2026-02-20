import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
 Plus,
 Trash2,
 ToggleLeft,
 ToggleRight,
 Eye,
 MousePointerClick,
 Upload,
 ExternalLink,
 Pencil,
 X,
 BarChart3,
 Megaphone,
 ImageIcon,
} from "lucide-react";

const AdminBannerAds = () => {
 const [banners, setBanners] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [editingBanner, setEditingBanner] = useState(null);
 const [formData, setFormData] = useState({
  title: "",
  image_url: "",
  link_url: "",
  is_active: true,
 });
 const [saving, setSaving] = useState(false);
 const [deleting, setDeleting] = useState(null);
 const [imageFile, setImageFile] = useState(null);
 const [imagePreview, setImagePreview] = useState(null);
 const [uploading, setUploading] = useState(false);

 useEffect(() => {
  fetchBanners();
 }, []);

 const fetchBanners = async () => {
  setLoading(true);
  const { data, error } = await supabase
   .from("banner_ads")
   .select("*")
   .order("created_at", { ascending: false });

  if (data) setBanners(data);
  if (error) console.error("Error fetching banners:", error);
  setLoading(false);
 };

 const handleImageSelect = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setImageFile(file);
  setImagePreview(URL.createObjectURL(file));
 };

 const uploadImage = async (file) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `banner_${Date.now()}.${fileExt}`;
  const filePath = `banners/${fileName}`;

  const { error } = await supabase.storage
   .from("banner-images")
   .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage
   .from("banner-images")
   .getPublicUrl(filePath);

  return urlData.publicUrl;
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.title.trim()) return;
  // Must have an image file for new banners, or existing URL for edits
  if (!imageFile && !formData.image_url) return;

  setSaving(true);
  try {
   let imageUrl = formData.image_url;

   // Upload new image if selected
   if (imageFile) {
    setUploading(true);
    imageUrl = await uploadImage(imageFile);
    setUploading(false);
   }

   if (editingBanner) {
    const { error } = await supabase
     .from("banner_ads")
     .update({
      title: formData.title,
      image_url: imageUrl,
      link_url: formData.link_url,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
     })
     .eq("id", editingBanner.id);

    if (error) throw error;
   } else {
    const { error } = await supabase.from("banner_ads").insert({
     title: formData.title,
     image_url: imageUrl,
     link_url: formData.link_url,
     is_active: formData.is_active,
    });

    if (error) throw error;
   }

   setShowForm(false);
   setEditingBanner(null);
   setFormData({ title: "", image_url: "", link_url: "", is_active: true });
   setImageFile(null);
   setImagePreview(null);
   fetchBanners();
  } catch (err) {
   console.error("Error saving banner:", err);
  } finally {
   setSaving(false);
   setUploading(false);
  }
 };

 const handleDelete = async (id) => {
  setDeleting(id);
  try {
   const { error } = await supabase.from("banner_ads").delete().eq("id", id);
   if (error) throw error;
   setBanners((prev) => prev.filter((b) => b.id !== id));
  } catch (err) {
   console.error("Error deleting banner:", err);
  } finally {
   setDeleting(null);
  }
 };

 const handleToggleActive = async (banner) => {
  try {
   const { error } = await supabase
    .from("banner_ads")
    .update({
     is_active: !banner.is_active,
     updated_at: new Date().toISOString(),
    })
    .eq("id", banner.id);

   if (error) throw error;
   setBanners((prev) =>
    prev.map((b) =>
     b.id === banner.id ? { ...b, is_active: !b.is_active } : b,
    ),
   );
  } catch (err) {
   console.error("Error toggling banner:", err);
  }
 };

 const openEdit = (banner) => {
  setEditingBanner(banner);
  setFormData({
   title: banner.title,
   image_url: banner.image_url,
   link_url: banner.link_url || "",
   is_active: banner.is_active,
  });
  setImageFile(null);
  setImagePreview(banner.image_url);
  setShowForm(true);
 };

 const totalImpressions = banners.reduce(
  (sum, b) => sum + (b.impressions || 0),
  0,
 );
 const totalClicks = banners.reduce((sum, b) => sum + (b.clicks || 0), 0);
 const avgCTR =
  totalImpressions > 0
   ? ((totalClicks / totalImpressions) * 100).toFixed(2)
   : "0.00";

 if (loading) {
  return (
   <div className="flex items-center justify-center py-32">
    <div className="flex flex-col items-center gap-3">
     <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
     <p className="text-slate-500 text-sm font-medium">Loading banners...</p>
    </div>
   </div>
  );
 }

 return (
  <div className="space-y-6">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <h2 className="text-2xl font-bold text-slate-800">Banner Ads</h2>
     <p className="text-sm text-slate-500 mt-1">
      Manage homepage ad banners and track performance
     </p>
    </div>
    <motion.button
     whileHover={{ scale: 1.02 }}
     whileTap={{ scale: 0.98 }}
     onClick={() => {
      setEditingBanner(null);
      setFormData({ title: "", image_url: "", link_url: "", is_active: true });
      setImageFile(null);
      setImagePreview(null);
      setShowForm(true);
     }}
     className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer">
     <Plus size={16} />
     New Banner
    </motion.button>
   </div>

   {/* Analytics Cards */}
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
       <Eye size={18} className="text-blue-600" />
      </div>
      <span className="text-sm text-slate-500 font-medium">
       Total Impressions
      </span>
     </div>
     <p className="text-2xl font-bold text-slate-800">
      {totalImpressions.toLocaleString()}
     </p>
    </div>
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
       <MousePointerClick size={18} className="text-green-600" />
      </div>
      <span className="text-sm text-slate-500 font-medium">Total Clicks</span>
     </div>
     <p className="text-2xl font-bold text-slate-800">
      {totalClicks.toLocaleString()}
     </p>
    </div>
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
       <BarChart3 size={18} className="text-purple-600" />
      </div>
      <span className="text-sm text-slate-500 font-medium">Avg. CTR</span>
     </div>
     <p className="text-2xl font-bold text-slate-800">{avgCTR}%</p>
    </div>
   </div>

   {/* Form Modal */}
   <AnimatePresence>
    {showForm && (
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => setShowForm(false)}>
      <motion.div
       initial={{ scale: 0.95, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       exit={{ scale: 0.95, opacity: 0 }}
       onClick={(e) => e.stopPropagation()}
       className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
       <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">
         {editingBanner ? "Edit Banner" : "Create New Banner"}
        </h3>
        <button
         onClick={() => setShowForm(false)}
         className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
         <X size={18} className="text-slate-400" />
        </button>
       </div>

       <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Title */}
        <div>
         <label className="text-sm font-semibold text-slate-700 mb-1 block">
          Banner Title *
         </label>
         <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Ramadan Special Offer"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all"
         />
        </div>

        {/* Image Upload */}
        <div>
         <label className="text-sm font-semibold text-slate-700 mb-1 block">
          Banner Image *
         </label>
         <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
          {imagePreview ? (
           <div className="relative w-full h-full">
            <img
             src={imagePreview}
             alt="Preview"
             className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
             <span className="text-white text-xs font-bold">Change Image</span>
            </div>
           </div>
          ) : (
           <div className="flex flex-col items-center gap-2 text-slate-400">
            <Upload size={24} />
            <span className="text-sm font-medium">Click to upload image</span>
            <span className="text-xs text-slate-300">
             PNG, JPG, WebP up to 5MB
            </span>
           </div>
          )}
          <input
           type="file"
           accept="image/*"
           onChange={handleImageSelect}
           className="hidden"
          />
         </label>
        </div>

        {/* Link URL */}
        <div>
         <label className="text-sm font-semibold text-slate-700 mb-1 block">
          Link URL (optional)
         </label>
         <input
          type="url"
          value={formData.link_url}
          onChange={(e) =>
           setFormData({ ...formData, link_url: e.target.value })
          }
          placeholder="https://example.com/offer"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all"
         />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between py-2">
         <label className="text-sm font-semibold text-slate-700">
          Active on Homepage
         </label>
         <button
          type="button"
          onClick={() =>
           setFormData({ ...formData, is_active: !formData.is_active })
          }
          className="cursor-pointer">
          {formData.is_active ? (
           <ToggleRight size={32} className="text-indigo-600" />
          ) : (
           <ToggleLeft size={32} className="text-slate-300" />
          )}
         </button>
        </div>

        {/* Submit */}
        <button
         type="submit"
         disabled={saving || uploading}
         className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer text-sm">
         {uploading
          ? "Uploading image..."
          : saving
            ? "Saving..."
            : editingBanner
              ? "Update Banner"
              : "Create Banner"}
        </button>
       </form>
      </motion.div>
     </motion.div>
    )}
   </AnimatePresence>

   {/* Banners List */}
   {banners.length === 0 ? (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
     <Megaphone size={40} className="text-slate-300 mx-auto mb-3" />
     <h3 className="text-lg font-bold text-slate-700 mb-1">No banners yet</h3>
     <p className="text-sm text-slate-400">
      Create your first ad banner to display on the homepage
     </p>
    </div>
   ) : (
    <div className="space-y-4">
     {banners.map((banner) => {
      const ctr =
       banner.impressions > 0
        ? ((banner.clicks / banner.impressions) * 100).toFixed(2)
        : "0.00";

      return (
       <motion.div
        key={banner.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row">
         {/* Image Preview */}
         <div className="sm:w-56 h-36 sm:h-auto shrink-0">
          <img
           src={banner.image_url}
           alt={banner.title}
           className="w-full h-full object-cover"
          />
         </div>

         {/* Details */}
         <div className="flex-1 p-5">
          <div className="flex items-start justify-between mb-3">
           <div>
            <div className="flex items-center gap-2 mb-1">
             <h3 className="text-base font-bold text-slate-800">
              {banner.title}
             </h3>
             <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
               banner.is_active
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-500"
              }`}>
              {banner.is_active ? "Active" : "Inactive"}
             </span>
            </div>
            {banner.link_url && (
             <a
              href={banner.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors">
              <ExternalLink size={11} />
              {banner.link_url.substring(0, 40)}
              {banner.link_url.length > 40 ? "..." : ""}
             </a>
            )}
           </div>

           {/* Actions */}
           <div className="flex items-center gap-1.5 shrink-0">
            <button
             onClick={() => handleToggleActive(banner)}
             className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
             title={banner.is_active ? "Deactivate" : "Activate"}>
             {banner.is_active ? (
              <ToggleRight size={18} className="text-green-600" />
             ) : (
              <ToggleLeft size={18} className="text-slate-400" />
             )}
            </button>
            <button
             onClick={() => openEdit(banner)}
             className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
             title="Edit">
             <Pencil size={16} className="text-slate-500" />
            </button>
            <button
             onClick={() => handleDelete(banner.id)}
             disabled={deleting === banner.id}
             className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
             title="Delete">
             <Trash2
              size={16}
              className={
               deleting === banner.id
                ? "text-red-300 animate-pulse"
                : "text-red-400 hover:text-red-600"
              }
             />
            </button>
           </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-3">
           <div className="flex items-center gap-1.5 text-sm">
            <Eye size={14} className="text-blue-500" />
            <span className="text-slate-500">Impressions:</span>
            <span className="font-bold text-slate-700">
             {(banner.impressions || 0).toLocaleString()}
            </span>
           </div>
           <div className="flex items-center gap-1.5 text-sm">
            <MousePointerClick size={14} className="text-green-500" />
            <span className="text-slate-500">Clicks:</span>
            <span className="font-bold text-slate-700">
             {(banner.clicks || 0).toLocaleString()}
            </span>
           </div>
           <div className="flex items-center gap-1.5 text-sm">
            <BarChart3 size={14} className="text-purple-500" />
            <span className="text-slate-500">CTR:</span>
            <span className="font-bold text-slate-700">{ctr}%</span>
           </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3">
           Created{" "}
           {new Date(banner.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
           })}
          </p>
         </div>
        </div>
       </motion.div>
      );
     })}
    </div>
   )}
  </div>
 );
};

export default AdminBannerAds;
