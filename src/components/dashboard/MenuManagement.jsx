import {
 Trash2,
 Plus,
 Image as ImageIcon,
 Upload,
 Loader2,
 X,
} from "lucide-react";
import { useState, useRef } from "react";

const CATEGORIES = [
 "Main Course",
 "Appetizer",
 "Dessert",
 "Beverage",
 "Side",
 "Special",
];

const MenuManagement = ({ menuItems, onAdd, onRemove, saving }) => {
 const [newItem, setNewItem] = useState({
  name: "",
  price: "",
  description: "",
  category: "Main Course",
 });
 const [imageFile, setImageFile] = useState(null);
 const [imagePreview, setImagePreview] = useState(null);
 const fileInputRef = useRef(null);

 const handleImageSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setImageFile(file);
  const reader = new FileReader();
  reader.onloadend = () => setImagePreview(reader.result);
  reader.readAsDataURL(file);
 };

 const clearImage = () => {
  setImageFile(null);
  setImagePreview(null);
  if (fileInputRef.current) fileInputRef.current.value = "";
 };

 const handleAdd = () => {
  if (!newItem.name.trim()) return;
  onAdd(newItem, imageFile);
  setNewItem({
   name: "",
   price: "",
   description: "",
   category: "Main Course",
  });
  clearImage();
 };

 const handleKeyDown = (e) => {
  if (e.key === "Enter") {
   e.preventDefault();
   handleAdd();
  }
 };

 return (
  <div className="space-y-6">
   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-center mb-6">
     <div>
      <h2 className="text-xl font-bold text-slate-800">Menu Items</h2>
      <p className="text-sm text-slate-500 mt-1">
       {menuItems.length} item{menuItems.length !== 1 ? "s" : ""} on the menu
      </p>
     </div>
    </div>

    {/* Add Item Form */}
    <div className="mb-8 bg-slate-50 p-5 rounded-xl border border-dashed border-slate-200">
     <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
      <Plus className="w-4 h-4 text-emerald-600" />
      Add New Menu Item
     </h3>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {/* Image Upload */}
      <div className="md:row-span-2">
       <label className="text-xs font-medium text-slate-500 mb-1.5 block">
        Item Image
       </label>
       <div
        onClick={() => fileInputRef.current?.click()}
        className="relative aspect-video bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
        {imagePreview ? (
         <>
          <img
           src={imagePreview}
           alt="Preview"
           className="w-full h-full object-cover"
          />
          <button
           type="button"
           onClick={(e) => {
            e.stopPropagation();
            clearImage();
           }}
           className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow-sm hover:bg-rose-50 text-rose-500 transition-colors">
           <X className="w-4 h-4" />
          </button>
         </>
        ) : (
         <>
          <Upload className="w-6 h-6 text-slate-300 mb-2 group-hover:text-emerald-500 transition-colors" />
          <span className="text-xs text-slate-400 font-medium group-hover:text-emerald-600 transition-colors">
           Click to upload image
          </span>
          <span className="text-[10px] text-slate-300 mt-1">
           JPG, PNG up to 5MB
          </span>
         </>
        )}
        <input
         ref={fileInputRef}
         type="file"
         accept="image/*"
         className="hidden"
         onChange={handleImageSelect}
        />
       </div>
      </div>

      {/* Name & Price */}
      <div className="space-y-4">
       <div>
        <label className="text-xs font-medium text-slate-500 mb-1.5 block">
         Item Name <span className="text-rose-400">*</span>
        </label>
        <input
         type="text"
         placeholder="e.g. Grilled Salmon"
         className="w-full px-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
         value={newItem.name}
         onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
         onKeyDown={handleKeyDown}
        />
       </div>

       <div className="grid grid-cols-2 gap-3">
        <div>
         <label className="text-xs font-medium text-slate-500 mb-1.5 block">
          Price (PKR)
         </label>
         <input
          type="number"
          placeholder="0"
          min="0"
          step="1"
          className="w-full px-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          onKeyDown={handleKeyDown}
         />
        </div>
        <div>
         <label className="text-xs font-medium text-slate-500 mb-1.5 block">
          Category
         </label>
         <select
          className="w-full px-4 py-3 bg-white text-slate-800 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          value={newItem.category}
          onChange={(e) =>
           setNewItem({ ...newItem, category: e.target.value })
          }>
          {CATEGORIES.map((cat) => (
           <option key={cat} value={cat}>
            {cat}
           </option>
          ))}
         </select>
        </div>
       </div>
      </div>
     </div>

     {/* Description */}
     <div className="mb-4">
      <label className="text-xs font-medium text-slate-500 mb-1.5 block">
       Description
      </label>
      <input
       type="text"
       placeholder="Short description of the dish..."
       className="w-full px-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
       value={newItem.description}
       onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
       onKeyDown={handleKeyDown}
      />
     </div>

     {/* Add Button */}
     <button
      onClick={handleAdd}
      disabled={saving || !newItem.name.trim()}
      className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
      {saving ? (
       <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Saving...
       </>
      ) : (
       <>
        <Plus className="w-4 h-4" />
        Add to Menu
       </>
      )}
     </button>
    </div>

    {/* Menu Items Grid */}
    {menuItems.length === 0 ? (
     <div className="text-center py-16 text-slate-400">
      <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-200" />
      <p className="font-medium text-slate-500">No menu items yet</p>
      <p className="text-sm mt-1">Add your first item using the form above</p>
     </div>
    ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {menuItems.map((item, index) => (
       <div
        key={index}
        className="group relative bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-emerald-100 transition-all duration-300">
        <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <button
          onClick={() => onRemove(index)}
          className="p-2 bg-white/90 backdrop-blur-sm text-rose-500 rounded-full shadow-sm hover:bg-rose-50 border border-slate-100 transition-colors"
          title="Remove item">
          <Trash2 className="w-4 h-4" />
         </button>
        </div>

        {item.category && (
         <span className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-xs font-semibold text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
          {item.category}
         </span>
        )}

        <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden">
         {item.image ? (
          <img
           src={item.image}
           alt={item.name}
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
         ) : (
          <ImageIcon className="w-8 h-8" />
         )}
        </div>

        <div className="p-4">
         <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-800 leading-tight">
           {item.name}
          </h3>
          {item.price && (
           <span className="bg-emerald-50 text-emerald-700 text-sm font-bold px-2.5 py-1 rounded-lg shrink-0 ml-2">
            Rs. {item.price}
           </span>
          )}
         </div>
         {item.description && (
          <p className="text-sm text-slate-500 line-clamp-2">
           {item.description}
          </p>
         )}
        </div>
       </div>
      ))}
     </div>
    )}
   </div>
  </div>
 );
};

export default MenuManagement;
