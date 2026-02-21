import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";
import { motion } from "framer-motion";
import {
 ArrowLeft,
 Clock,
 Tag,
 User,
 CalendarDays,
 Share2,
 BookOpen,
 ChevronRight,
} from "lucide-react";

export default function BlogPost() {
 const { slug } = useParams();
 const navigate = useNavigate();
 const [blog, setBlog] = useState(null);
 const [relatedBlogs, setRelatedBlogs] = useState([]);
 const [loading, setLoading] = useState(true);
 const [copied, setCopied] = useState(false);

 useEffect(() => {
  fetchBlog();
 }, [slug]);

 const fetchBlog = async () => {
  setLoading(true);
  try {
   const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

   if (error || !data) {
    navigate("/blog");
    return;
   }
   setBlog(data);

   // Update page title and meta for SEO
   document.title = data.meta_title || `${data.title} | ReserveKaru Blog`;
   const metaDesc = document.querySelector('meta[name="description"]');
   if (metaDesc) {
    metaDesc.setAttribute(
     "content",
     data.meta_description || data.excerpt || "",
    );
   } else {
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content = data.meta_description || data.excerpt || "";
    document.head.appendChild(meta);
   }

   // Fetch related posts
   if (data.tags?.length > 0) {
    const { data: related } = await supabase
     .from("blogs")
     .select("id, title, slug, cover_image, published_at, tags, content")
     .eq("is_published", true)
     .neq("id", data.id)
     .overlaps("tags", data.tags)
     .limit(3);

    setRelatedBlogs(related || []);
   }
  } catch (err) {
   console.error("Error fetching blog:", err);
  } finally {
   setLoading(false);
  }
 };

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

 const handleShare = async () => {
  const url = window.location.href;
  if (navigator.share) {
   try {
    await navigator.share({ title: blog.title, url });
   } catch {}
  } else {
   await navigator.clipboard.writeText(url);
   setCopied(true);
   setTimeout(() => setCopied(false), 2000);
  }
 };

 // Render content with basic formatting (paragraphs, headings, lists)
 const renderContent = (content) => {
  if (!content) return null;
  const lines = content.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
   const line = lines[i].trim();

   if (!line) {
    i++;
    continue;
   }

   // Headings
   if (line.startsWith("### ")) {
    elements.push(
     <h3 key={i} className="text-xl font-bold text-[#002b11] mt-8 mb-3">
      {line.slice(4)}
     </h3>,
    );
   } else if (line.startsWith("## ")) {
    elements.push(
     <h2
      key={i}
      className="text-2xl font-black text-[#002b11] mt-10 mb-4"
      id={line
       .slice(3)
       .toLowerCase()
       .replace(/[^a-z0-9]+/g, "-")}>
      {line.slice(3)}
     </h2>,
    );
   } else if (line.startsWith("# ")) {
    elements.push(
     <h1 key={i} className="text-3xl font-black text-[#002b11] mt-10 mb-4">
      {line.slice(2)}
     </h1>,
    );
   }
   // Blockquote
   else if (line.startsWith("> ")) {
    elements.push(
     <blockquote
      key={i}
      className="border-l-4 border-[#00aa6c] pl-5 py-2 my-6 bg-[#00aa6c]/[0.03] rounded-r-xl italic text-gray-600">
      {line.slice(2)}
     </blockquote>,
    );
   }
   // Unordered list
   else if (line.startsWith("- ") || line.startsWith("* ")) {
    const listItems = [];
    while (
     i < lines.length &&
     (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
    ) {
     listItems.push(lines[i].trim().slice(2));
     i++;
    }
    elements.push(
     <ul
      key={`ul-${i}`}
      className="list-disc list-inside space-y-2 my-4 text-gray-600 leading-relaxed pl-2">
      {listItems.map((item, j) => (
       <li key={j}>{renderInlineFormatting(item)}</li>
      ))}
     </ul>,
    );
    continue;
   }
   // Ordered list
   else if (/^\d+\.\s/.test(line)) {
    const listItems = [];
    while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
     listItems.push(lines[i].trim().replace(/^\d+\.\s/, ""));
     i++;
    }
    elements.push(
     <ol
      key={`ol-${i}`}
      className="list-decimal list-inside space-y-2 my-4 text-gray-600 leading-relaxed pl-2">
      {listItems.map((item, j) => (
       <li key={j}>{renderInlineFormatting(item)}</li>
      ))}
     </ol>,
    );
    continue;
   }
   // Horizontal rule
   else if (line === "---" || line === "***") {
    elements.push(<hr key={i} className="my-8 border-gray-200" />);
   }
   // Image
   else if (line.startsWith("![")) {
    const match = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (match) {
     elements.push(
      <figure key={i} className="my-8">
       <img
        src={match[2]}
        alt={match[1]}
        className="w-full rounded-2xl"
        loading="lazy"
       />
       {match[1] && (
        <figcaption className="text-center text-xs text-gray-400 mt-3">
         {match[1]}
        </figcaption>
       )}
      </figure>,
     );
    }
   }
   // Regular paragraph
   else {
    elements.push(
     <p key={i} className="text-[16px] text-gray-600 leading-[1.8] mb-5">
      {renderInlineFormatting(line)}
     </p>,
    );
   }

   i++;
  }

  return elements;
 };

 const renderInlineFormatting = (text) => {
  // Bold
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
   if (part.startsWith("**") && part.endsWith("**")) {
    return (
     <strong key={i} className="font-bold text-[#002b11]">
      {part.slice(2, -2)}
     </strong>
    );
   }
   // Link
   const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
   if (linkMatch) {
    return (
     <a
      key={i}
      href={linkMatch[2]}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#00aa6c] font-semibold hover:underline">
      {linkMatch[1]}
     </a>
    );
   }
   return part;
  });
 };

 if (loading) {
  return (
   <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
     <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-[#002b11]/10 animate-ping" />
      <div className="absolute inset-0 rounded-full border-t-2 border-[#002b11] animate-spin" />
     </div>
    </div>
   </div>
  );
 }

 if (!blog) return null;

 return (
  <div className="min-h-screen bg-white pt-[68px]">
   {/* JSON-LD Structured Data for SEO */}
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
     __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.meta_description || blog.excerpt || "",
      image: blog.cover_image || "",
      author: {
       "@type": "Person",
       name: blog.author_name || "ReserveKaru Team",
      },
      publisher: {
       "@type": "Organization",
       name: "ReserveKaru",
       logo: {
        "@type": "ImageObject",
        url: `${window.location.origin}/logo/logo.svg`,
       },
      },
      datePublished: blog.published_at,
      dateModified: blog.updated_at || blog.published_at,
      mainEntityOfPage: {
       "@type": "WebPage",
       "@id": window.location.href,
      },
     }),
    }}
   />

   {/* Back + Breadcrumb */}
   <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-6 pb-2">
    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
     <Link
      to="/"
      className="hover:text-[#002b11] transition-colors font-medium">
      Home
     </Link>
     <ChevronRight size={14} />
     <Link
      to="/blog"
      className="hover:text-[#002b11] transition-colors font-medium">
      Blog
     </Link>
     <ChevronRight size={14} />
     <span className="text-[#002b11] font-semibold truncate max-w-[200px]">
      {blog.title}
     </span>
    </nav>
   </div>

   {/* Article */}
   <article className="max-w-4xl mx-auto px-6 lg:px-8 pb-16">
    <motion.div
     initial={{ opacity: 0, y: 16 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.5 }}>
     {/* Tags */}
     {blog.tags?.length > 0 && (
      <div className="flex items-center gap-2 mb-5">
       {blog.tags.map((tag) => (
        <Link
         key={tag}
         to={`/blog?tag=${tag}`}
         className="px-3 py-1 rounded-full bg-[#00aa6c]/10 text-[#00aa6c] text-xs font-bold hover:bg-[#00aa6c]/20 transition-colors">
         {tag}
        </Link>
       ))}
      </div>
     )}

     {/* Title */}
     <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#002b11] tracking-tight leading-tight mb-6">
      {blog.title}
     </h1>

     {/* Meta */}
     <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-100">
      <span className="flex items-center gap-1.5 font-semibold text-[#002b11]">
       <User size={15} />
       {blog.author_name}
      </span>
      <span className="flex items-center gap-1.5">
       <CalendarDays size={15} />
       {formatDate(blog.published_at)}
      </span>
      <span className="flex items-center gap-1.5">
       <Clock size={15} />
       {getReadTime(blog.content)}
      </span>
      <button
       onClick={handleShare}
       className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors text-xs font-semibold cursor-pointer">
       <Share2 size={13} />
       {copied ? "Copied!" : "Share"}
      </button>
     </div>

     {/* Cover Image */}
     {blog.cover_image && (
      <div className="aspect-[2/1] rounded-2xl overflow-hidden mb-10 bg-gray-100">
       <img
        src={blog.cover_image}
        alt={blog.title}
        className="w-full h-full object-cover"
        loading="eager"
       />
      </div>
     )}

     {/* Excerpt */}
     {blog.excerpt && (
      <p className="text-xl text-gray-500 leading-relaxed mb-8 font-medium">
       {blog.excerpt}
      </p>
     )}

     {/* Content */}
     <div className="prose-custom">{renderContent(blog.content)}</div>
    </motion.div>

    {/* Author Footer */}
    <div className="mt-14 pt-8 border-t border-gray-100">
     <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-[#002b11] flex items-center justify-center text-white font-bold text-lg shrink-0">
       {blog.author_name?.[0]?.toUpperCase() || "R"}
      </div>
      <div>
       <p className="font-bold text-[#002b11]">{blog.author_name}</p>
       <p className="text-sm text-gray-400">Written for the ReserveKaru Blog</p>
      </div>
     </div>
    </div>
   </article>

   {/* Related Posts */}
   {relatedBlogs.length > 0 && (
    <section className="bg-[#f7f7f7] py-14">
     <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <h2 className="text-2xl font-extrabold text-[#002b11] tracking-tight mb-8">
       Related Articles
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
       {relatedBlogs.map((post) => (
        <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
         <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300">
          <div className="aspect-[16/10] overflow-hidden bg-gray-100">
           {post.cover_image ? (
            <img
             src={post.cover_image}
             alt={post.title}
             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
             loading="lazy"
            />
           ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#002b11] to-[#004d1f]">
             <BookOpen size={28} className="text-white/20" />
            </div>
           )}
          </div>
          <div className="p-5">
           <h3 className="text-base font-bold text-[#002b11] mb-2 group-hover:text-[#00aa6c] transition-colors leading-snug line-clamp-2">
            {post.title}
           </h3>
           <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{formatDate(post.published_at)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
             <Clock size={11} />
             {getReadTime(post.content)}
            </span>
           </div>
          </div>
         </article>
        </Link>
       ))}
      </div>
     </div>
    </section>
   )}

   {/* Navigate back */}
   <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10">
    <Link
     to="/blog"
     className="inline-flex items-center gap-2 text-sm font-bold text-[#002b11]/60 hover:text-[#002b11] transition-colors">
     <ArrowLeft size={16} />
     Back to all articles
    </Link>
   </div>
  </div>
 );
}
