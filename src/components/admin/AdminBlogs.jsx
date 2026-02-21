import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
 Plus,
 Trash2,
 Pencil,
 X,
 Eye,
 EyeOff,
 Upload,
 FileText,
 Clock,
 Tag,
 Search,
 ExternalLink,
 ImageIcon,
} from "lucide-react";

const AdminBlogs = () => {
 const [blogs, setBlogs] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [editingBlog, setEditingBlog] = useState(null);
 const [saving, setSaving] = useState(false);
 const [deleting, setDeleting] = useState(null);
 const [searchTerm, setSearchTerm] = useState("");
 const [coverFile, setCoverFile] = useState(null);
 const [coverPreview, setCoverPreview] = useState(null);
 const [uploading, setUploading] = useState(false);

 const [formData, setFormData] = useState({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  author_name: "ReserveKaru Team",
  tags: "",
  is_published: false,
  meta_title: "",
  meta_description: "",
 });

 useEffect(() => {
  fetchBlogs();
 }, []);

 const fetchBlogs = async () => {
  setLoading(true);
  const { data, error } = await supabase
   .from("blogs")
   .select("*")
   .order("created_at", { ascending: false });

  if (data) setBlogs(data);
  if (error) console.error("Error fetching blogs:", error);
  setLoading(false);
 };

 const generateSlug = (title) =>
  title
   .toLowerCase()
   .replace(/[^a-z0-9\s-]/g, "")
   .replace(/\s+/g, "-")
   .replace(/-+/g, "-")
   .slice(0, 80);

 const handleTitleChange = (val) => {
  setFormData((prev) => ({
   ...prev,
   title: val,
   slug: editingBlog ? prev.slug : generateSlug(val),
   meta_title: prev.meta_title || val.slice(0, 60),
  }));
 };

 const handleCoverSelect = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setCoverFile(file);
  setCoverPreview(URL.createObjectURL(file));
 };

 const uploadCover = async (file) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `blog_${Date.now()}.${fileExt}`;
  const filePath = `blogs/${fileName}`;

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
  if (!formData.title.trim() || !formData.content.trim()) return;

  setSaving(true);
  try {
   let coverUrl = formData.cover_image;

   if (coverFile) {
    setUploading(true);
    coverUrl = await uploadCover(coverFile);
    setUploading(false);
   }

   const tagsArr = formData.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

   const payload = {
    title: formData.title,
    slug: formData.slug,
    excerpt: formData.excerpt,
    content: formData.content,
    cover_image: coverUrl || null,
    author_name: formData.author_name || "ReserveKaru Team",
    tags: tagsArr,
    is_published: formData.is_published,
    meta_title: formData.meta_title || formData.title,
    meta_description:
     formData.meta_description || formData.excerpt.slice(0, 160),
    published_at: formData.is_published
     ? editingBlog?.published_at || new Date().toISOString()
     : null,
    updated_at: new Date().toISOString(),
   };

   if (editingBlog) {
    const { error } = await supabase
     .from("blogs")
     .update(payload)
     .eq("id", editingBlog.id);
    if (error) throw error;
   } else {
    const { error } = await supabase.from("blogs").insert(payload);
    if (error) throw error;
   }

   resetForm();
   fetchBlogs();
  } catch (err) {
   console.error("Error saving blog:", err);
  } finally {
   setSaving(false);
   setUploading(false);
  }
 };

 const resetForm = () => {
  setShowForm(false);
  setEditingBlog(null);
  setFormData({
   title: "",
   slug: "",
   excerpt: "",
   content: "",
   cover_image: "",
   author_name: "ReserveKaru Team",
   tags: "",
   is_published: false,
   meta_title: "",
   meta_description: "",
  });
  setCoverFile(null);
  setCoverPreview(null);
 };

 const openEdit = (blog) => {
  setEditingBlog(blog);
  setFormData({
   title: blog.title || "",
   slug: blog.slug || "",
   excerpt: blog.excerpt || "",
   content: blog.content || "",
   cover_image: blog.cover_image || "",
   author_name: blog.author_name || "ReserveKaru Team",
   tags: (blog.tags || []).join(", "),
   is_published: blog.is_published || false,
   meta_title: blog.meta_title || "",
   meta_description: blog.meta_description || "",
  });
  setCoverFile(null);
  setCoverPreview(blog.cover_image || null);
  setShowForm(true);
 };

 const handleDelete = async (id) => {
  if (!window.confirm("Delete this blog post?")) return;
  setDeleting(id);
  try {
   const { error } = await supabase.from("blogs").delete().eq("id", id);
   if (error) throw error;
   setBlogs((prev) => prev.filter((b) => b.id !== id));
  } catch (err) {
   console.error("Error deleting blog:", err);
  } finally {
   setDeleting(null);
  }
 };

 const handleTogglePublish = async (blog) => {
  try {
   const newPublished = !blog.is_published;
   const { error } = await supabase
    .from("blogs")
    .update({
     is_published: newPublished,
     published_at: newPublished
      ? blog.published_at || new Date().toISOString()
      : blog.published_at,
     updated_at: new Date().toISOString(),
    })
    .eq("id", blog.id);

   if (error) throw error;
   setBlogs((prev) =>
    prev.map((b) =>
     b.id === blog.id ? { ...b, is_published: newPublished } : b,
    ),
   );
  } catch (err) {
   console.error("Error toggling publish:", err);
  }
 };

 const formatDate = (d) =>
  d
   ? new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
     })
   : "—";

 const filtered = blogs.filter(
  (b) =>
   b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
   b.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())),
 );

 if (loading) {
  return (
   <div className="flex items-center justify-center py-32">
    <div className="flex flex-col items-center gap-3">
     <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
     <p className="text-slate-500 text-sm font-medium">Loading blogs...</p>
    </div>
   </div>
  );
 }

 return (
  <div className="space-y-6">
   {/* Header */}
   <div className="flex items-center justify-between flex-wrap gap-4">
    <div>
     <h2 className="text-2xl font-bold text-slate-800">Blog Posts</h2>
     <p className="text-sm text-slate-500 mt-1">
      Create and manage SEO-optimized blog articles
     </p>
    </div>
    <motion.button
     whileHover={{ scale: 1.02 }}
     whileTap={{ scale: 0.98 }}
     onClick={() => {
      resetForm();
      setShowForm(true);
     }}
     className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer">
     <Plus size={16} />
     New Post
    </motion.button>
   </div>

   {/* Stats */}
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
       <FileText size={18} className="text-indigo-600" />
      </div>
      <span className="text-sm text-slate-500 font-medium">Total Posts</span>
     </div>
     <p className="text-2xl font-bold text-slate-800">{blogs.length}</p>
    </div>
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
       <Eye size={18} className="text-green-600" />
      </div>
      <span className="text-sm text-slate-500 font-medium">Published</span>
     </div>
     <p className="text-2xl font-bold text-slate-800">
      {blogs.filter((b) => b.is_published).length}
     </p>
    </div>
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
       <EyeOff size={18} className="text-amber-600" />
      </div>
      <span className="text-sm text-slate-500 font-medium">Drafts</span>
     </div>
     <p className="text-2xl font-bold text-slate-800">
      {blogs.filter((b) => !b.is_published).length}
     </p>
    </div>
   </div>

   {/* Search */}
   <div className="relative max-w-sm">
    <Search
     size={16}
     className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
    />
    <input
     type="text"
     placeholder="Search posts..."
     value={searchTerm}
     onChange={(e) => setSearchTerm(e.target.value)}
     className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
    />
   </div>

   {/* Blog List */}
   {filtered.length === 0 ? (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
     <FileText size={40} className="text-slate-300 mx-auto mb-3" />
     <p className="text-slate-500 font-medium">No blog posts yet</p>
     <p className="text-slate-400 text-sm mt-1">
      Click "New Post" to write your first article
     </p>
    </div>
   ) : (
    <div className="space-y-3">
     {filtered.map((blog) => (
      <motion.div
       key={blog.id}
       layout
       initial={{ opacity: 0, y: 8 }}
       animate={{ opacity: 1, y: 0 }}
       className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
       <div className="flex items-start gap-4 p-5">
        {/* Cover Thumbnail */}
        <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 hidden sm:block">
         {blog.cover_image ? (
          <img
           src={blog.cover_image}
           alt=""
           className="w-full h-full object-cover"
          />
         ) : (
          <div className="w-full h-full flex items-center justify-center">
           <ImageIcon size={20} className="text-slate-300" />
          </div>
         )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
         <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-slate-800 truncate">
           {blog.title}
          </h3>
          <span
           className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold ${
            blog.is_published
             ? "bg-green-50 text-green-600"
             : "bg-amber-50 text-amber-600"
           }`}>
           {blog.is_published ? "Published" : "Draft"}
          </span>
         </div>
         <p className="text-sm text-slate-500 truncate">
          {blog.excerpt || "No excerpt"}
         </p>
         <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
           <Clock size={12} />
           {formatDate(blog.published_at || blog.created_at)}
          </span>
          {blog.tags?.length > 0 && (
           <span className="flex items-center gap-1">
            <Tag size={12} />
            {blog.tags.slice(0, 3).join(", ")}
           </span>
          )}
          <span>/blog/{blog.slug}</span>
         </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
         <a
          href={`/blog/${blog.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
          title="Preview">
          <ExternalLink size={16} />
         </a>
         <button
          onClick={() => handleTogglePublish(blog)}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
           blog.is_published
            ? "hover:bg-amber-50 text-green-500 hover:text-amber-600"
            : "hover:bg-green-50 text-slate-400 hover:text-green-600"
          }`}
          title={blog.is_published ? "Unpublish" : "Publish"}>
          {blog.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
         </button>
         <button
          onClick={() => openEdit(blog)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
          title="Edit">
          <Pencil size={16} />
         </button>
         <button
          onClick={() => handleDelete(blog.id)}
          disabled={deleting === blog.id}
          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
          title="Delete">
          <Trash2 size={16} />
         </button>
        </div>
       </div>
      </motion.div>
     ))}
    </div>
   )}

   {/* Create / Edit Form Modal */}
   <AnimatePresence>
    {showForm && (
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <motion.div
       initial={{ opacity: 0, y: 20, scale: 0.97 }}
       animate={{ opacity: 1, y: 0, scale: 1 }}
       exit={{ opacity: 0, y: 20, scale: 0.97 }}
       className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
       <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">
         {editingBlog ? "Edit Blog Post" : "Write New Blog Post"}
        </h3>
        <button
         onClick={resetForm}
         className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
         <X size={18} className="text-slate-400" />
        </button>
       </div>

       <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Title */}
        <div>
         <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Title *
         </label>
         <input
          type="text"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g. Top 10 Restaurants in Lahore"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          required
         />
        </div>

        {/* Slug */}
        <div>
         <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          URL Slug
         </label>
         <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">/blog/</span>
          <input
           type="text"
           value={formData.slug}
           onChange={(e) =>
            setFormData((prev) => ({
             ...prev,
             slug: generateSlug(e.target.value),
            }))
           }
           className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
         </div>
        </div>

        {/* Excerpt */}
        <div>
         <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Excerpt
         </label>
         <textarea
          value={formData.excerpt}
          onChange={(e) =>
           setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
          }
          placeholder="Short summary shown on the blog listing page..."
          rows={2}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
         />
        </div>

        {/* Content */}
        <div>
         <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Content * (Supports Markdown)
         </label>
         <textarea
          value={formData.content}
          onChange={(e) =>
           setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          placeholder={`# Main Heading\n\nWrite your article content here...\n\n## Section Title\n\nParagraph text with **bold** words.\n\n- List item one\n- List item two`}
          rows={14}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-y font-mono leading-relaxed"
          required
         />
         <p className="text-xs text-slate-400 mt-1">
          Use #, ##, ### for headings · **bold** · - or * for lists · {">"} for
          quotes · --- for dividers
         </p>
        </div>

        {/* Cover Image */}
        <div>
         <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Cover Image
         </label>
         <div className="flex items-start gap-4">
          {coverPreview && (
           <img
            src={coverPreview}
            alt="Preview"
            className="w-28 h-20 object-cover rounded-lg border border-slate-200"
           />
          )}
          <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors text-sm font-medium text-slate-600">
           <Upload size={16} />
           {coverFile ? "Change Image" : "Upload Image"}
           <input
            type="file"
            accept="image/*"
            onChange={handleCoverSelect}
            className="hidden"
           />
          </label>
         </div>
        </div>

        {/* Author + Tags Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
           Author Name
          </label>
          <input
           type="text"
           value={formData.author_name}
           onChange={(e) =>
            setFormData((prev) => ({
             ...prev,
             author_name: e.target.value,
            }))
           }
           className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
         </div>
         <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
           Tags (comma separated)
          </label>
          <input
           type="text"
           value={formData.tags}
           onChange={(e) =>
            setFormData((prev) => ({ ...prev, tags: e.target.value }))
           }
           placeholder="Food, Restaurants, Travel"
           className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
         </div>
        </div>

        {/* SEO Section */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-4">
         <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Search size={14} />
          SEO Settings
         </h4>
         <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
           Meta Title (max 60 chars)
          </label>
          <input
           type="text"
           value={formData.meta_title}
           onChange={(e) =>
            setFormData((prev) => ({
             ...prev,
             meta_title: e.target.value.slice(0, 60),
            }))
           }
           className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <p className="text-xs text-slate-400 mt-0.5 text-right">
           {formData.meta_title.length}/60
          </p>
         </div>
         <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
           Meta Description (max 160 chars)
          </label>
          <textarea
           value={formData.meta_description}
           onChange={(e) =>
            setFormData((prev) => ({
             ...prev,
             meta_description: e.target.value.slice(0, 160),
            }))
           }
           rows={2}
           className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
          />
          <p className="text-xs text-slate-400 mt-0.5 text-right">
           {formData.meta_description.length}/160
          </p>
         </div>
        </div>

        {/* Publish Toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
         <input
          type="checkbox"
          checked={formData.is_published}
          onChange={(e) =>
           setFormData((prev) => ({
            ...prev,
            is_published: e.target.checked,
           }))
          }
          className="sr-only peer"
         />
         <div className="w-10 h-6 bg-slate-200 peer-checked:bg-indigo-600 rounded-full relative transition-colors after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
         <span className="text-sm font-medium text-slate-700">
          Publish immediately
         </span>
        </label>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
         <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={saving}
          className="flex-1 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer">
          {saving
           ? uploading
             ? "Uploading image..."
             : "Saving..."
           : editingBlog
             ? "Update Post"
             : "Create Post"}
         </motion.button>
         <button
          type="button"
          onClick={resetForm}
          className="px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
          Cancel
         </button>
        </div>
       </form>
      </motion.div>
     </motion.div>
    )}
   </AnimatePresence>
  </div>
 );
};

export default AdminBlogs;
