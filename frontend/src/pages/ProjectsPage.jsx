import { useEffect, useState, useMemo } from "react";
import { FiExternalLink, FiGithub, FiSearch, FiHeart, FiFolderPlus, FiFolderMinus } from "react-icons/fi";
import Button from "../components/common/Button";
import PageShell from "../components/layout/PageShell";
import Loader from "../components/common/Loader";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { user, setUser } = useAuth();
  const { pushToast } = useToast();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data } = await api.get("/projects");
        setProjects(data.data || []);
      } catch (err) {
        pushToast("Failed to fetch projects.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [pushToast]);

  const filteredProjects = useMemo(() => {
    if (!query) return projects;
    const lowerQuery = query.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.summary.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );
  }, [projects, query]);

  const isSaved = (projectId) => {
    return user?.savedProjects?.some((item) =>
      typeof item === "object" ? item?._id === projectId : item === projectId
    );
  };

  const isFavorited = (projectId) => {
    return user?.favoriteProjects?.some((item) =>
      typeof item === "object" ? item?._id === projectId : item === projectId
    );
  };

  const toggleList = async (projectId, listKey) => {
    if (!user) {
      pushToast("Please log in to save or favorite projects.", "info");
      return;
    }
    try {
      const endpoint = listKey === "savedProjects" ? "/users/saved-projects" : "/users/favorite-projects";
      const { data } = await api.patch(`${endpoint}/${projectId}`);
      setUser((prev) => ({
        ...prev,
        [listKey]: data[listKey]
      }));
      pushToast("Updated successfully.", "success");
    } catch (err) {
      pushToast(err.message || "Failed to update list.", "error");
    }
  };

  if (loading) {
    return (
      <PageShell>
        <Loader label="Loading projects" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="section">
        <div className="container-page">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Projects</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">Case study library</h1>
            </div>
            <label className="focus-within:ring-primary flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <FiSearch className="text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent text-sm outline-none text-slate-850 dark:text-slate-200"
                placeholder="Search projects"
                aria-label="Search projects"
              />
            </label>
          </div>
          {filteredProjects.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-slate-500">No projects found.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => {
                const saved = isSaved(project._id);
                const favorited = isFavorited(project._id);
                return (
                  <article key={project._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                    <div>
                      <div className="mb-5 h-40 rounded-lg bg-gradient-to-br from-primary to-slate-900 dark:from-teal-650" />
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-semibold text-secondary uppercase tracking-wider">{project.category}</p>
                        {user && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => toggleList(project._id, "savedProjects")}
                              className={`focus-ring p-1.5 rounded-lg border transition ${
                                saved
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-750"
                              }`}
                              title={saved ? "Remove from saved" : "Save project"}
                            >
                              <FiFolderPlus size={15} />
                            </button>
                            <button
                              onClick={() => toggleList(project._id, "favoriteProjects")}
                              className={`focus-ring p-1.5 rounded-lg border transition ${
                                favorited
                                  ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-500"
                                  : "border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-750"
                              }`}
                              title={favorited ? "Remove from favorites" : "Favorite project"}
                            >
                              <FiHeart size={15} className={favorited ? "fill-current" : ""} />
                            </button>
                          </div>
                        )}
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{project.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-slate-650 dark:text-slate-300">{project.summary}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-105 dark:border-slate-850 flex gap-2">
                      {project.demoUrl && (
                        <Button variant="outline" to={project.demoUrl} icon={FiExternalLink}>
                          Demo
                        </Button>
                      )}
                      {project.repoUrl && (
                        <Button variant="ghost" to={project.repoUrl} icon={FiGithub}>
                          Code
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </PageShell>
  );
}

