import { useEffect, useState } from "react";
import PageShell from "../components/layout/PageShell";
import Loader from "../components/common/Loader";
import api from "../api/client";
import { useToast } from "../context/ToastContext";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <PageShell>
      <main className="section">
        <div className="container-page">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Blog</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">Writing and field notes</h1>

          {loading ? (
            <Loader label="Loading articles" />
          ) : blogs.length === 0 ? (
            <div className="mt-10 rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-slate-500">No blog posts published yet.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <article key={blog._id} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                  <div>
                    {blog.coverImage?.url ? (
                      <img src={blog.coverImage.url} alt={blog.title} className="mb-4 h-40 w-full rounded-lg object-cover" />
                    ) : (
                      <div className="mb-4 h-40 rounded-lg bg-gradient-to-br from-primary to-slate-900 dark:from-teal-600" />
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(blog.tags || []).map((tag) => (
                        <span key={tag} className="text-xs font-semibold text-secondary uppercase tracking-wider">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white">{blog.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{blog.excerpt}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
                    <span>By {blog.author?.name || "Portfolio Admin"}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
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
