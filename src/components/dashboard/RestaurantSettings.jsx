import { Save, Upload, MapPin, Link } from "lucide-react";
import { useState } from "react";

const RestaurantSettings = ({
 restaurant,
 onChange,
 onSave,
 onImageChange,
}) => {
 return (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
   <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
    <div>
     <h2 className="text-xl font-bold text-slate-800">Restaurant Settings</h2>
     <p className="text-slate-500 text-sm">
      Manage your restaurant's profile and visibility.
     </p>
    </div>
    <button
     onClick={onSave}
     className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 font-medium">
     <Save className="w-4 h-4" /> Save Changes
    </button>
   </div>

   <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
    {/* Left Column: Form */}
    <div className="lg:col-span-2 space-y-6">
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
       <label className="text-sm font-semibold text-slate-700">
        Restaurant Name
       </label>
       <input
        type="text"
        name="name"
        value={restaurant.name || ""}
        onChange={onChange}
        placeholder="Enter restaurant name"
        className="w-full px-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
       />
      </div>

      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
       <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">
         Location Address
        </label>
        <input
         type="text"
         name="location"
         value={restaurant.location || ""}
         onChange={onChange}
         placeholder="Enter address"
         className="w-full px-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
        />
       </div>
       <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
         <Link className="w-3.5 h-3.5" />
         Location Link
        </label>
        <input
         type="url"
         name="location_link"
         value={restaurant.location_link || ""}
         onChange={onChange}
         placeholder="Paste Google Maps share link here"
         className="w-full px-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
        />
        <p className="text-xs text-slate-400">
         Open Google Maps → Share → Copy link and paste it here
        </p>
       </div>
      </div>
      <div className="space-y-2">
       <label className="text-sm font-semibold text-slate-700">
        Cuisine Type
       </label>
       <input
        type="text"
        name="cuisine"
        value={restaurant.cuisine || ""}
        onChange={onChange}
        placeholder="e.g. Italian, Chinese, Pakistani"
        className="w-full px-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
       />
      </div>
     </div>

     <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">
       Description
      </label>
      <textarea
       name="description"
       rows="4"
       value={restaurant.description || ""}
       onChange={onChange}
       placeholder="Describe your restaurant..."
       className="w-full px-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
      />
     </div>

     <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">
       Tagline (Optional)
      </label>
      <input
       type="text"
       name="tagline" // Assuming tagline exists in schema, otherwise ignoring
       className="w-full px-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
       placeholder="e.g. Best Italian in Town"
      />
     </div>
    </div>

    {/* Right Column: Images */}
    <div className="space-y-6">
     <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">
       Cover Image
      </label>
      <div className="relative group aspect-video bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-400 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden">
       {restaurant.images && restaurant.images[0] ? (
        <img
         src={restaurant.images[0]}
         alt="Cover"
         className="w-full h-full object-cover"
        />
       ) : (
        <>
         <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-emerald-500 transition-colors" />
         <span className="text-sm text-slate-500 font-medium">
          Click to upload
         </span>
        </>
       )}
       <input
        type="file"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => onImageChange(0, e)}
       />
      </div>
     </div>

     <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
      <h4 className="text-blue-800 font-bold text-sm mb-1">Pro Tip</h4>
      <p className="text-blue-600 text-xs">
       High-quality images increase booking rates by 25%. Ensure good lighting
       and composition.
      </p>
     </div>
    </div>
   </div>
  </div>
 );
};

export default RestaurantSettings;
