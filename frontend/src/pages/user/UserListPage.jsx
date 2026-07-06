import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import { useToast } from "../../context/ToastContext";
import { FiHeart, FiFolderMinus, FiGithub, FiExternalLink } from "react-icons/fi";

export default function UserListPage({ title, description, type }) {
  const { user, setUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const list = user?.[type] || [];
  const displayProjects = projects.filter((p) => {
    const id = p._id;
    return list.some((item) => (typeof item === "object" ? item?._id === id : item === id));
  });

  const handleRemove = async (projectId) => {
    try {
      const endpoint = type === "savedProjects" ? "/users/saved-projects" : "/users/favorite-projects";
      const { data } = await api.patch(`${endpoint}/${projectId}`);
      setUser((prev) => ({
        ...prev,
        [type]: data[type]
      }));
      pushToast("Updated successfully.", "success");
    } catch (err) {
      pushToast(err.message || "Failed to update list.", "error");
    }
  };

  if (loading) return <Loader label="Loading projects" />;

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{description}</p>
      {displayProjects.length === 0 ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-500">No projects added to this list yet.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {displayProjects.map((project) => (
            <article key={project._id} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider">{project.category}</p>
                <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{project.title}</h2>
                <p className="mt-3 text-sm text-slate-650 dark:text-slate-300 line-clamp-3">{project.summary}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  {project.demoUrl && (
                    <Button variant="ghost" to={project.demoUrl} size="sm" icon={FiExternalLink} className="!py-1.5 !px-2.5">
                      Demo
                    </Button>
                  )}
                  {project.repoUrl && (
                    <Button variant="ghost" to={project.repoUrl} size="sm" icon={FiGithub} className="!py-1.5 !px-2.5">
                      Code
                    </Button>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(project._id)}
                  className="focus-ring flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  {type === "savedProjects" ? <FiFolderMinus size={14} /> : <FiHeart size={14} className="fill-current" />}
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

