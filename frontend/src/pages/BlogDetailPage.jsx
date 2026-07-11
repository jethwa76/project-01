import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiHeart,
  FiBookmark,
  FiCalendar,
  FiTag,
  FiMessageCircle,
  FiSend,
  FiUser
} from "react-icons/fi";
import api from "../api/client";
import Button from "../components/common/Button";
import PageShell from "../components/layout/PageShell";
import Loader from "../components/common/Loader";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const { user } = useAuth();
  const { pushToast } = useToast();
  const { register, handleSubmit, reset, formState } = useForm();

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/blogs/slug/${slug}`);
        const b = data.data;
        setBlog(b);
        setLikeCount(b.likes?.length || 0);
        setComments(b.comments || []);
        if (user) {
          setLiked(b.likes?.some((id) => id.toString() === user._id));
          setBookmarked(b.bookmarks?.some((id) => id.toString() === user._id));
        }
      } catch (err) {
        pushToast(err.message || "Failed to load blog post.", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, user, pushToast]);

  const toggleLike = async () => {
    if (!user) {
      pushToast("Please log in to like posts.", "info");
      return;
    }
    try {
      const { data } = await api.patch(`/blogs/${blog._id}/like`);
      setLiked((prev) => !prev);
      setLikeCount(data.likes);
    } catch (err) {
      pushToast(err.message || "Failed to update like.", "error");
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      pushToast("Please log in to bookmark posts.", "info");
      return;
    }
    try {
      await api.patch(`/blogs/${blog._id}/bookmark`);
      setBookmarked((prev) => !prev);
      pushToast(bookmarked ? "Bookmark removed." : "Post bookmarked!", "success");
    } catch (err) {
      pushToast(err.message || "Failed to update bookmark.", "error");
    }
  };

  const onSubmitComment = async (values) => {
    if (!user) {
      pushToast("Please log in to comment.", "info");
      return;
    }
    try {
      const { data } = await api.post(`/blogs/${blog._id}/comments`, { body: values.body });
      setComments(data.comments || []);
      reset();
      pushToast("Comment posted!", "success");
    } catch (err) {
      pushToast(err.message || "Failed to post comment.", "error");
    }
  };

  if (loading) {
    return (
      <PageShell>
        <Loader label="Loading blog post" />
      </PageShell>
    );
  }

  if (!blog) {
    return (
      <PageShell>
        <main className="section">
          <div className="container-page text-center">
            <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Post not found</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-400">The blog post you're looking for doesn't exist or has been removed.</p>
            <Button to="/blogs" className="mt-6" icon={FiArrowLeft}>Back to blog</Button>
          </div>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="section">
        <div className="container-page">
          {/* Breadcrumb */}
          <Link to="/blogs" className="focus-ring mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <FiArrowLeft size={14} />
            Back to blog
          </Link>

          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Cover image */}
            {blog.coverImage?.url ? (
              <img src={blog.coverImage.url} alt={blog.title} className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl" />
            ) : (
              <div className="w-full h-48 sm:h-64 rounded-xl bg-gradient-to-br from-primary to-slate-900 dark:from-teal-600" />
            )}

            {/* Header */}
            <div className="mt-8 max-w-3xl mx-auto">
              {/* Tags */}
              {blog.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary dark:bg-blue-950/30">
                      <FiTag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl lg:text-5xl leading-tight">
                {blog.title}
              </h1>

              {/* Meta line */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  {blog.author?.avatar?.url ? (
                    <img src={blog.author.avatar.url} alt={blog.author.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {blog.author?.name?.charAt(0).toUpperCase() || <FiUser size={14} />}
                    </div>
                  )}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{blog.author?.name || "Portfolio Admin"}</span>
                </div>
                <span className="flex items-center gap-1">
                  <FiCalendar size={13} />
                  {new Date(blog.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                <span className="flex items-center gap-1">
                  <FiMessageCircle size={13} />
                  {comments.length} {comments.length === 1 ? "comment" : "comments"}
                </span>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex gap-3 border-b border-slate-200 dark:border-slate-800 pb-6">
                <button
                  onClick={toggleLike}
                  className={`focus-ring flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    liked
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-500"
                      : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-500 hover:text-red-500"
                  }`}
                >
                  <FiHeart className={liked ? "fill-current" : ""} size={15} />
                  {likeCount} {likeCount === 1 ? "Like" : "Likes"}
                </button>
                <button
                  onClick={toggleBookmark}
                  className={`focus-ring flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    bookmarked
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-600"
                      : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-500 hover:text-amber-600"
                  }`}
                >
                  <FiBookmark className={bookmarked ? "fill-current" : ""} size={15} />
                  {bookmarked ? "Bookmarked" : "Bookmark"}
                </button>
              </div>

              {/* Blog body */}
              <div className="mt-8 prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-8 text-[17px] whitespace-pre-line">
                {blog.body}
              </div>

              {/* Comments section */}
              <section className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <FiMessageCircle />
                  Comments ({comments.length})
                </h2>

                {/* Comment form */}
                {user ? (
                  <form onSubmit={handleSubmit(onSubmitComment)} className="mt-6 flex gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        className={`focus-ring w-full rounded-lg border px-4 py-3 text-sm dark:bg-slate-950 dark:text-white ${
                          formState.errors.body ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                        }`}
                        placeholder="Write a comment..."
                        rows={3}
                        {...register("body", {
                          required: "Comment is required.",
                          minLength: { value: 2, message: "Comment is too short." }
                        })}
                      />
                      {formState.errors.body && (
                        <p className="mt-1 text-xs text-red-500">{formState.errors.body.message}</p>
                      )}
                      <Button type="submit" className="mt-2" icon={FiSend} disabled={formState.isSubmitting}>
                        {formState.isSubmitting ? "Posting..." : "Post comment"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link> to post a comment.
                    </p>
                  </div>
                )}

                {/* Comment list */}
                <div className="mt-6 space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No comments yet. Be the first to share your thoughts!</p>
                  ) : (
                    comments.map((comment, index) => (
                      <div key={comment._id || index} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        {comment.user?.avatar?.url ? (
                          <img src={comment.user.avatar.url} alt={comment.user.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                        ) : (
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {comment.user?.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-950 dark:text-white">{comment.user?.name || "User"}</span>
                            <span className="text-xs text-slate-400">
                              {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-6">{comment.body}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </motion.article>
        </div>
      </main>
    </PageShell>
  );
}
