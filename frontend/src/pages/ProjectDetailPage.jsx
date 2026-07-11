import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiExternalLink,
  FiGithub,
  FiHeart,
  FiEye,
  FiCalendar,
  FiTag,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import api from "../api/client";
import Button from "../components/common/Button";
import PageShell from "../components/layout/PageShell";
import Loader from "../components/common/Loader";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const { user } = useAuth();
  const { pushToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/projects/slug/${slug}`);
        const p = data.data;
        setProject(p);
        setLikeCount(p.likes?.length || 0);
        if (user && p.likes?.some((id) => id.toString() === user._id)) {
          setLiked(true);
        }
      } catch (err) {
        pushToast(err.message || "Failed to load project.", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, user, pushToast]);

  const toggleLike = async () => {
    if (!user) {
      pushToast("Please log in to like projects.", "info");
      return;
    }
    try {
      const { data } = await api.patch(`/projects/${project._id}/like`);
      setLiked((prev) => !prev);
      setLikeCount(data.likes);
    } catch (err) {
      pushToast(err.message || "Failed to update like.", "error");
    }
  };

  const galleryImages = project?.gallery?.filter((g) => g?.url) || [];
  const mainImage = project?.image?.url;
  const allImages = mainImage ? [{ url: mainImage }, ...galleryImages] : galleryImages;

  if (loading) {
    return (
      <PageShell>
        <Loader label="Loading project" />
      </PageShell>
    );
  }

  if (!project) {
    return (
      <PageShell>
        <main className="section">
          <div className="container-page text-center">
            <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Project not found</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-400">The project you're looking for doesn't exist or has been removed.</p>
            <Button to="/projects" className="mt-6" icon={FiArrowLeft}>Back to projects</Button>
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
          <Link to="/projects" className="focus-ring mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <FiArrowLeft size={14} />
            Back to projects
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider">{project.category}</p>
                <h1 className="mt-2 text-4xl font-extrabold text-slate-950 dark:text-white sm:text-5xl">{project.title}</h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{project.summary}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleLike}
                  className={`focus-ring flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                    liked
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-500"
                      : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-500 hover:text-red-500"
                  }`}
                >
                  <FiHeart className={liked ? "fill-current" : ""} size={16} />
                  {likeCount}
                </button>
                <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <FiEye size={14} />
                  {project.views || 0} views
                </span>
              </div>
            </div>

            {/* Meta chips */}
            <div className="mt-6 flex flex-wrap gap-3">
              {project.status && (
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  project.status === "published"
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400"
                    : project.status === "archived"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  {project.status}
                </span>
              )}
              {project.featured && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                  ⭐ Featured
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <FiCalendar size={12} />
                {new Date(project.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>

            {/* Image / Gallery */}
            {allImages.length > 0 && (
              <div className="relative mt-8 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <img
                  src={allImages[galleryIndex]?.url}
                  alt={`${project.title} screenshot ${galleryIndex + 1}`}
                  className="h-72 w-full object-cover sm:h-96 lg:h-[480px]"
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setGalleryIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60 transition"
                      aria-label="Previous image"
                    >
                      <FiChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setGalleryIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60 transition"
                      aria-label="Next image"
                    >
                      <FiChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setGalleryIndex(i)}
                          className={`h-2 rounded-full transition-all ${
                            i === galleryIndex ? "w-6 bg-white" : "w-2 bg-white/50"
                          }`}
                          aria-label={`View image ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* No image fallback */}
            {allImages.length === 0 && (
              <div className="mt-8 h-48 rounded-xl bg-gradient-to-br from-primary to-slate-900 dark:from-teal-600" />
            )}

            {/* Content grid */}
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white">About this project</h2>
                <div className="mt-4 prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-7 whitespace-pre-line">
                  {project.description}
                </div>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* Action buttons */}
                <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
                  {project.demoUrl && (
                    <Button to={project.demoUrl} icon={FiExternalLink} className="w-full">
                      Live Demo
                    </Button>
                  )}
                  {project.repoUrl && (
                    <Button to={project.repoUrl} variant="outline" icon={FiGithub} className="w-full">
                      Source Code
                    </Button>
                  )}
                </div>

                {/* Technologies */}
                {project.technologies?.length > 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">Tech Stack</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {project.tags?.length > 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">Tags</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary dark:bg-blue-950/30">
                          <FiTag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Owner info */}
                {project.owner && (
                  <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">Created by</h3>
                    <div className="mt-3 flex items-center gap-3">
                      {project.owner.avatar?.url ? (
                        <img src={project.owner.avatar.url} alt={project.owner.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {project.owner.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-white">{project.owner.name}</p>
                        {project.owner.headline && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{project.owner.headline}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </motion.div>
        </div>
      </main>
    </PageShell>
  );
}
