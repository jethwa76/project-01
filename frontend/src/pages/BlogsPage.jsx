import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiHeart, FiMessageCircle } from "react-icons/fi";
import PageShell from "../components/layout/PageShell";
import Loader from "../components/common/Loader";
import api from "../api/client";
import { useToast } from "../context/ToastContext";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { pushToast } = useToast();

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const { data } = await api.get("/blogs");
        setBlogs(data.data || []);
      } catch (err) {
        pushToast(err.message || "Failed to load blog posts.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, [pushToast]);

  const filteredBlogs = useMemo(() => {
    if (!query) return blogs;
    const lowerQuery = query.toLowerCase();
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(lowerQuery) ||
        b.excerpt.toLowerCase().includes(lowerQuery) ||
        (b.tags || []).some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }, [blogs, query]);

  return (
    <PageShell>
      <main className="section">
        <div className="container-page">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Blog</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">Writing and field notes</h1>
            </div>
            <label className="focus-within:ring-primary flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <FiSearch className="text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent text-sm outline-none text-slate-800 dark:text-slate-200"
                placeholder="Search posts by title, tag..."
                aria-label="Search blog posts"
              />
            </label>
          </div>

          {loading ? (
            <Loader label="Loading articles" />
          ) : filteredBlogs.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-slate-500">{query ? "No posts match your search." : "No blog posts published yet."}</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredBlogs.map((blog) => (
                <article key={blog._id} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between group transition hover:-translate-y-1 hover:shadow-lg">
                  <div>
                    <Link to={`/blogs/${blog.slug}`}>
                      {blog.coverImage?.url ? (
                        <img src={blog.coverImage.url} alt={blog.title} className="mb-4 h-40 w-full rounded-lg object-cover" />
                      ) : (
                        <div className="mb-4 h-40 rounded-lg bg-gradient-to-br from-primary to-slate-900 dark:from-teal-600" />
                      )}
                    </Link>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(blog.tags || []).map((tag) => (
                        <span key={tag} className="text-xs font-semibold text-secondary uppercase tracking-wider">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <Link to={`/blogs/${blog.slug}`}>
                      <h2 className="text-xl font-bold text-slate-950 dark:text-white group-hover:text-primary transition-colors">{blog.title}</h2>
                    </Link>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400 line-clamp-3">{blog.excerpt}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
                    <span>By {blog.author?.name || "Portfolio Admin"}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FiHeart size={12} />
                        {blog.likes?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiMessageCircle size={12} />
                        {blog.comments?.length || 0}
                      </span>
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </PageShell>
  );
}
