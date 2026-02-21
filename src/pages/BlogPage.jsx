import { useState, useEffect } from "react";
import LogoLoader from "../components/ui/LogoLoader";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { motion } from "framer-motion";
import {
 ArrowRight,
 Clock,
 Tag,
 BookOpen,
 Search,
 ChevronRight,
} from "lucide-react";

export default function BlogPage() {
 const [blogs, setBlogs] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedTag, setSelectedTag] = useState("");

 useEffect(() => {
  fetchBlogs();
 }, []);

 const fetchBlogs = async () => {
  try {
   const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

   if (data) setBlogs(data);
   if (error) console.error("Error fetching blogs:", error);
  } catch (err) {
   console.error("Error:", err);
  } finally {
   setLoading(false);
  }
 };

 // Get all unique tags
 const allTags = [...new Set(blogs.flatMap((b) => b.tags || []))];

 // Filter
 const filteredBlogs = blogs.filter((blog) => {
  const matchesSearch =
   !searchQuery ||
   blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
   blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesTag = !selectedTag || (blog.tags || []).includes(selectedTag);
  return matchesSearch && matchesTag;
 });

 const featuredBlog = filteredBlogs[0];
 const restBlogs = filteredBlogs.slice(1);

 const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
   year: "numeric",
   month: "long",
   day: "numeric",
  });
 };

 const getReadTime = (content) => {
  if (!content) return "1 min";
  const words = content.split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
 };

 if (loading) {
  return (
   <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-5">
     <LogoLoader size={72} />
     <p className="text-[#002b11]/40 text-xs font-medium tracking-widest uppercase">
      Loading
     </p>
    </div>
   </div>
  );
 }

 return (
  <div className="min-h-screen bg-white pt-[68px]">
   {/* Hero */}
   <section className="bg-[#002b11] relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4=')] opacity-50" />
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 sm:py-28 relative z-10">
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-4">
       <BookOpen size={18} className="text-[#00aa6c]" />
       <span className="text-xs font-bold tracking-widest text-[#00aa6c] uppercase">
        The ReserveKaru Blog
       </span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
       Stories, Tips & Insights
      </h1>
      <p className="text-white/50 text-lg max-w-lg mx-auto">
       Discover the latest in dining culture, restaurant trends, and insider
       tips from the world of fine dining.
      </p>
     </motion.div>
    </div>
   </section>

   {/* Search & Filter */}
   <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-7 relative z-20">
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
     <div className="relative flex-1 w-full">
      <Search
       size={18}
       className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
       type="text"
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       placeholder="Search articles..."
       className="w-full pl-11 pr-4 py-3 bg-[#f7f7f7] rounded-xl text-[#002b11] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#00aa6c]/20 transition-all text-sm"
      />
     </div>
     {allTags.length > 0 && (
      <div className="flex flex-wrap items-center gap-2 min-w-0">
       <button
        onClick={() => setSelectedTag("")}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
         !selectedTag
          ? "bg-[#002b11] text-white"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}>
        All
       </button>
       {allTags.map((tag) => (
        <button
         key={tag}
         onClick={() => setSelectedTag(tag === selectedTag ? "" : tag)}
         className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
          selectedTag === tag
           ? "bg-[#002b11] text-white"
           : "bg-gray-100 text-gray-500 hover:bg-gray-200"
         }`}>
         {tag}
        </button>
       ))}
      </div>
     )}
    </div>
   </div>

   {/* Content */}
   <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 sm:py-16">
    {filteredBlogs.length === 0 ? (
     <div className="text-center py-20">
      <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-5">
       <BookOpen size={24} className="text-gray-300" />
      </div>
      <h3 className="text-lg font-bold text-[#002b11]/70 mb-1">
       No articles found
      </h3>
      <p className="text-gray-400 text-sm">
       {searchQuery
        ? "Try a different search term"
        : "Check back soon for new content"}
      </p>
     </div>
    ) : (
     <>
      {/* Featured Post */}
      {featuredBlog && (
       <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <Link to={`/blog/${featuredBlog.slug}`} className="group block mb-12">
         <article className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100">
           {featuredBlog.cover_image ? (
            <img
             src={featuredBlog.cover_image}
             alt={featuredBlog.title}
             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
           ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#002b11] to-[#004d1f]">
             <BookOpen size={48} className="text-white/20" />
            </div>
           )}
          </div>
          <div className="py-2">
           <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#00aa6c]/10 text-[#00aa6c] text-xs font-bold">
             Featured
            </span>
            {featuredBlog.tags?.[0] && (
             <span className="flex items-center gap-1 text-xs text-gray-400">
              <Tag size={11} />
              {featuredBlog.tags[0]}
             </span>
            )}
           </div>
           <h2 className="text-3xl sm:text-4xl font-black text-[#002b11] tracking-tight mb-3 group-hover:text-[#00aa6c] transition-colors leading-tight">
            {featuredBlog.title}
           </h2>
           {featuredBlog.excerpt && (
            <p className="text-gray-500 leading-relaxed mb-5 line-clamp-3 text-[15px]">
             {featuredBlog.excerpt}
            </p>
           )}
           <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="font-semibold text-[#002b11]">
             {featuredBlog.author_name}
            </span>
            <span>·</span>
            <span>{formatDate(featuredBlog.published_at)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
             <Clock size={13} />
             {getReadTime(featuredBlog.content)}
            </span>
           </div>
           <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#002b11] group-hover:text-[#00aa6c] transition-colors">
            Read article
            <ArrowRight
             size={16}
             className="group-hover:translate-x-1 transition-transform"
            />
           </div>
          </div>
         </article>
        </Link>
       </motion.div>
      )}

      {/* Divider */}
      {restBlogs.length > 0 && (
       <div className="border-t border-gray-100 mb-10 pt-2">
        <span className="text-xs font-bold tracking-widest text-[#00aa6c] uppercase">
         Latest Articles
        </span>
       </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
       {restBlogs.map((blog, i) => (
        <motion.div
         key={blog.id}
         initial={{ opacity: 0, y: 16 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4, delay: i * 0.05 }}>
         <Link to={`/blog/${blog.slug}`} className="group block h-full">
          <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 h-full flex flex-col">
           <div className="aspect-[16/10] overflow-hidden bg-gray-100">
            {blog.cover_image ? (
             <img
              src={blog.cover_image}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
             />
            ) : (
             <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#002b11] to-[#004d1f]">
              <BookOpen size={32} className="text-white/20" />
             </div>
            )}
           </div>
           <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
             {blog.tags?.[0] && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#00aa6c]/10 text-[#00aa6c] text-[11px] font-bold">
               {blog.tags[0]}
              </span>
             )}
             <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Clock size={10} />
              {getReadTime(blog.content)}
             </span>
            </div>
            <h3 className="text-lg font-bold text-[#002b11] mb-2 group-hover:text-[#00aa6c] transition-colors leading-snug line-clamp-2">
             {blog.title}
            </h3>
            {blog.excerpt && (
             <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">
              {blog.excerpt}
             </p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
             <span className="text-xs text-gray-400">
              {formatDate(blog.published_at)}
             </span>
             <span className="flex items-center gap-1 text-xs font-bold text-[#002b11] group-hover:text-[#00aa6c] transition-colors">
              Read
              <ChevronRight
               size={14}
               className="group-hover:translate-x-0.5 transition-transform"
              />
             </span>
            </div>
           </div>
          </article>
         </Link>
        </motion.div>
       ))}
      </div>
     </>
    )}
   </div>

   {/* Footer CTA */}
   <section className="py-16 bg-[#f7f7f7]">
    <div className="max-w-2xl mx-auto px-6 text-center">
     <h2 className="text-2xl font-extrabold text-[#002b11] tracking-tight mb-3">
      Discover Your Next Dining Experience
     </h2>
     <p className="text-gray-500 text-sm mb-6">
      Ready to put these tips into action? Browse our curated selection of
      restaurants.
     </p>
     <Link
      to="/"
      className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#002b11] text-white font-bold text-sm rounded-full hover:bg-[#004d1f] transition-colors shadow-lg">
      Explore Restaurants
      <ArrowRight size={16} />
     </Link>
    </div>
   </section>
  </div>
 );
}
