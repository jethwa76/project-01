import { useEffect, useMemo, useState } from "react";
import { FiEdit3, FiEye, FiPlus, FiSearch, FiTrash2, FiX, FiMonitor, FiClock, FiActivity, FiFolder, FiBookOpen, FiUser, FiShield } from "react-icons/fi";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import api from "../../api/client";
import { useToast } from "../../context/ToastContext";

const resourceMap = {
  users: ["name", "email", "role"],
  projects: ["title", "category", "status"],
  skills: ["name", "category", "level"],
  certificates: ["title", "issuer", "credentialId"],
  messages: ["name", "email", "status"],
  blogs: ["title", "status", "tags"],
  testimonials: ["name", "role", "company", "rating"],
  experience: ["company", "position", "type", "current"],
  education: ["institution", "degree", "cgpa"],
  categories: ["name", "type", "slug"]
};

// Initial state for form fields based on resource type
const getInitialFormState = (type, item = null) => {
  if (type === "users") {
    return {
      name: item?.name || "",
      email: item?.email || "",
      role: item?.role || "visitor"
    };
  }
  if (type === "projects") {
    return {
      title: item?.title || "",
      summary: item?.summary || "",
      description: item?.description || "",
      category: item?.category || "Web Application",
      status: item?.status || "published",
      tags: item?.tags?.join(", ") || "",
      technologies: item?.technologies?.join(", ") || "",
      demoUrl: item?.demoUrl || "",
      repoUrl: item?.repoUrl || "",
      featured: item?.featured || false
    };
  }
  if (type === "skills") {
    return {
      name: item?.name || "",
      category: item?.category || "",
      level: item?.level || 80,
      color: item?.color || "#2563EB"
    };
  }
  if (type === "certificates") {
    return {
      title: item?.title || "",
      issuer: item?.issuer || "",
      credentialId: item?.credentialId || "",
      credentialUrl: item?.credentialUrl || "",
      issuedAt: item?.issuedAt ? new Date(item.issuedAt).toISOString().split("T")[0] : ""
    };
  }
  if (type === "messages") {
    return {
      name: item?.name || "",
      email: item?.email || "",
      subject: item?.subject || "",
      message: item?.message || "",
      status: item?.status || "new"
    };
  }
  if (type === "blogs") {
    return {
      title: item?.title || "",
      excerpt: item?.excerpt || "",
      body: item?.body || "",
      status: item?.status || "published",
      tags: item?.tags?.join(", ") || ""
    };
  }
  if (type === "testimonials") {
    return {
      name: item?.name || "",
      role: item?.role || "",
      company: item?.company || "",
      quote: item?.quote || "",
      rating: item?.rating || 5,
      visible: item?.visible !== undefined ? item.visible : true
    };
  }
  if (type === "experience") {
    return {
      company: item?.company || "",
      position: item?.position || "",
      startDate: item?.startDate ? new Date(item.startDate).toISOString().split("T")[0] : "",
      endDate: item?.endDate ? new Date(item.endDate).toISOString().split("T")[0] : "",
      current: item?.current || false,
      description: item?.description || "",
      technologies: item?.technologies?.join(", ") || "",
      achievements: item?.achievements?.join(", ") || "",
      location: item?.location || "",
      type: item?.type || "full-time",
      order: item?.order || 0,
      visible: item?.visible !== undefined ? item.visible : true
    };
  }
  if (type === "education") {
    return {
      institution: item?.institution || "",
      degree: item?.degree || "",
      field: item?.field || "",
      startDate: item?.startDate ? new Date(item.startDate).toISOString().split("T")[0] : "",
      endDate: item?.endDate ? new Date(item.endDate).toISOString().split("T")[0] : "",
      current: item?.current || false,
      cgpa: item?.cgpa || "",
      semester: item?.semester || "",
      subjects: item?.subjects?.join(", ") || "",
      achievements: item?.achievements?.join(", ") || "",
      description: item?.description || "",
      order: item?.order || 0,
      visible: item?.visible !== undefined ? item.visible : true
    };
  }
  if (type === "categories") {
    return {
      name: item?.name || "",
      type: item?.type || "project",
      description: item?.description || "",
      color: item?.color || "#2563eb",
      order: item?.order || 0
    };
  }
  return {};
};

export default function ManageResource({ type }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userDetail, setUserDetail] = useState(null);

  const { pushToast } = useToast();
  const fields = resourceMap[type] || resourceMap.projects;
  const title = type.charAt(0).toUpperCase() + type.slice(1);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      // For users, use the admin endpoint
      const endpoint = type === "users" ? "/admin/users" : `/${type}`;
      const { data } = await api.get(endpoint);
      setRows(data.data || []);
    } catch (err) {
      console.error(err);
      pushToast(err.message || `Failed to load ${type}.`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // Client-side search
  const filteredRows = useMemo(() => {
    if (!query) return rows;
    const lowerQuery = query.toLowerCase();
    return rows.filter((row) =>
      fields.some((field) => String(row[field] || "").toLowerCase().includes(lowerQuery))
    );
  }, [rows, fields, query]);

  // Open modal for creation
  const handleCreateOpen = () => {
    if (type === "messages") {
      pushToast("Messages are submitted via the contact form.", "info");
      return;
    }
    setEditingItem(null);
    if (type === "users") {
      setFormData({ name: "", email: "", password: "", role: "visitor" });
    } else {
      setFormData(getInitialFormState(type));
    }
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEditOpen = (item) => {
    setEditingItem(item);
    setFormData(getInitialFormState(type, item));
    setIsModalOpen(true);
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) {
      return;
    }
    try {
      const endpoint = type === "users" ? `/admin/users/${id}` : `/${type}/${id}`;
      await api.delete(endpoint);
      pushToast("Record deleted successfully.", "success");
      setRows((prev) => prev.filter((row) => row._id !== id));
    } catch (err) {
      pushToast(err.message || "Failed to delete record.", "error");
    }
  };

  // Handle viewing user details (audit logs, sessions, works)
  const handleViewUserDetails = async (user) => {
    setSelectedUser(user);
    setUserDetailOpen(true);
    setUserDetailLoading(true);
    try {
      const { data } = await api.get(`/admin/users/${user._id}`);
      setUserDetail(data.data);
    } catch (err) {
      pushToast(err.message || "Failed to load user details.", "error");
    } finally {
      setUserDetailLoading(false);
    }
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value
    }));
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Format data for saving
    const payload = { ...formData };
    if (type === "projects") {
      payload.tags = formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [];
      payload.technologies = formData.technologies ? formData.technologies.split(",").map((t) => t.trim()) : [];
    }
    if (type === "blogs") {
      payload.tags = formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [];
    }
    if (type === "experience") {
      payload.technologies = formData.technologies ? formData.technologies.split(",").map((t) => t.trim()) : [];
      payload.achievements = formData.achievements ? formData.achievements.split(",").map((t) => t.trim()) : [];
      payload.order = formData.order ? parseInt(formData.order) : 0;
    }
    if (type === "education") {
      payload.subjects = formData.subjects ? formData.subjects.split(",").map((t) => t.trim()) : [];
      payload.achievements = formData.achievements ? formData.achievements.split(",").map((t) => t.trim()) : [];
      payload.cgpa = formData.cgpa ? parseFloat(formData.cgpa) : undefined;
      payload.semester = formData.semester ? parseInt(formData.semester) : undefined;
      payload.order = formData.order ? parseInt(formData.order) : 0;
    }
    if (type === "categories") {
      payload.order = formData.order ? parseInt(formData.order) : 0;
    }

    try {
      if (type === "users" && !editingItem) {
        // Admin create user
        const { data } = await api.post("/admin/users", payload);
        pushToast("User created successfully.", "success");
        setRows((prev) => [data.data || data, ...prev]);
      } else if (type === "users" && editingItem) {
        // Admin edit user role
        const { data } = await api.patch(`/admin/users/${editingItem._id}/role`, { role: payload.role });
        pushToast("User role updated.", "success");
        setRows((prev) =>
          prev.map((row) => (row._id === editingItem._id ? data.data || data : row))
        );
      } else if (editingItem) {
        // Edit record
        const { data } = await api.patch(`/${type}/${editingItem._id}`, payload);
        pushToast("Record updated successfully.", "success");
        setRows((prev) =>
          prev.map((row) => (row._id === editingItem._id ? data.data || data : row))
        );
      } else {
        // Create record
        const { data } = await api.post(`/${type}`, payload);
        pushToast("Record created successfully.", "success");
        setRows((prev) => [data.data || data, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      pushToast(err.message || "Failed to save record. Check fields.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Manage {title}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Create, edit, delete, search, filter, and sort records through protected admin APIs.
          </p>
        </div>
        {type !== "messages" && (
          <Button icon={FiPlus} onClick={handleCreateOpen}>
            {type === "users" ? "Add User" : "Create"}
          </Button>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4 dark:border-slate-800">
          <FiSearch className="text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm outline-none text-slate-800 dark:text-slate-200"
            placeholder={`Search ${type}...`}
          />
        </div>

        {loading ? (
          <Loader label={`Loading ${type}`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                <tr>
                  {fields.map((field) => (
                    <th key={field} className="px-4 py-3 font-semibold capitalize">
                      {field}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={fields.length + 1} className="px-4 py-8 text-center text-slate-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row._id} className="border-t border-slate-100 dark:border-slate-800">
                      {fields.map((field) => (
                        <td key={field} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {field === "level" ? `${row[field]}%` : String(row[field] || "")}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {type === "users" && (
                            <button
                              onClick={() => handleViewUserDetails(row)}
                              className="focus-ring rounded-lg p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                              aria-label="View user details"
                              title="View details, sessions & audit logs"
                            >
                              <FiEye />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditOpen(row)}
                            className="focus-ring rounded-lg p-2 text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                            aria-label="Edit record"
                          >
                            <FiEdit3 />
                          </button>
                          <button
                            onClick={() => handleDelete(row._id)}
                            className="focus-ring rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                            aria-label="Delete record"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern Dialog/Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                {editingItem ? `Edit ${type.slice(0, -1)}` : `Create ${type.slice(0, -1)}`}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="focus-ring rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {/* Users Form fields */}
              {type === "users" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Name</label>
                    <input
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                      disabled={!!editingItem}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email</label>
                    <input
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      type="email"
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                      disabled={!!editingItem}
                    />
                  </div>
                  {!editingItem && (
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Password</label>
                      <input
                        name="password"
                        type="password"
                        value={formData.password || ""}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                        required
                        minLength={8}
                        placeholder="Min. 8 characters"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Role</label>
                    <select
                      name="role"
                      value={formData.role || "visitor"}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                    >
                      <option value="visitor">Visitor</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Projects Form fields */}
              {type === "projects" && (
                <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Title</label>
                    <input
                      name="title"
                      value={formData.title || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Category</label>
                      <input
                        name="category"
                        value={formData.category || ""}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status</label>
                      <select
                        name="status"
                        value={formData.status || "published"}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Summary</label>
                    <input
                      name="summary"
                      value={formData.summary || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description</label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm min-h-24"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tags (comma separated)</label>
                      <input
                        name="tags"
                        value={formData.tags || ""}
                        onChange={handleChange}
                        placeholder="e.g. saas, react, responsive"
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Technologies (comma separated)</label>
                      <input
                        name="technologies"
                        value={formData.technologies || ""}
                        onChange={handleChange}
                        placeholder="e.g. React, Node.js, MongoDB"
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Demo URL</label>
                      <input
                        name="demoUrl"
                        value={formData.demoUrl || ""}
                        onChange={handleChange}
                        type="url"
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Repo URL</label>
                      <input
                        name="repoUrl"
                        value={formData.repoUrl || ""}
                        onChange={handleChange}
                        type="url"
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      name="featured"
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={handleChange}
                      id="featured-checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-950"
                    />
                    <label htmlFor="featured-checkbox" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Featured Project
                    </label>
                  </div>
                </div>
              )}

              {/* Skills Form fields */}
              {type === "skills" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Name</label>
                    <input
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Category</label>
                    <input
                      name="category"
                      value={formData.category || ""}
                      onChange={handleChange}
                      placeholder="e.g. Frontend, Backend, UI/UX"
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Level (0-100%)</label>
                      <input
                        name="level"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.level || 80}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Color Tag</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          name="color"
                          type="color"
                          value={formData.color || "#2563EB"}
                          onChange={handleChange}
                          className="h-10 w-12 rounded cursor-pointer bg-transparent"
                        />
                        <input
                          name="color"
                          value={formData.color || "#2563EB"}
                          onChange={handleChange}
                          className="focus-ring flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Certificates Form fields */}
              {type === "certificates" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Title</label>
                    <input
                      name="title"
                      value={formData.title || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Issuer</label>
                    <input
                      name="issuer"
                      value={formData.issuer || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Credential ID</label>
                    <input
                      name="credentialId"
                      value={formData.credentialId || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Credential URL</label>
                    <input
                      name="credentialUrl"
                      value={formData.credentialUrl || ""}
                      onChange={handleChange}
                      type="url"
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Issued Date</label>
                    <input
                      name="issuedAt"
                      type="date"
                      value={formData.issuedAt || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Messages View Form fields */}
              {type === "messages" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sender Name</label>
                    <p className="mt-1 rounded-lg bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-400">
                      {formData.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sender Email</label>
                    <p className="mt-1 rounded-lg bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-400">
                      <a href={`mailto:${formData.email}`} className="text-primary hover:underline">
                        {formData.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Subject</label>
                    <p className="mt-1 rounded-lg bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {formData.subject}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Message Body</label>
                    <p className="mt-1 rounded-lg bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-6">
                      {formData.message}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status</label>
                    <select
                      name="status"
                      value={formData.status || "new"}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Blogs Form fields */}
              {type === "blogs" && (
                <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Title</label>
                    <input
                      name="title"
                      value={formData.title || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status</label>
                    <select
                      name="status"
                      value={formData.status || "published"}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Excerpt</label>
                    <input
                      name="excerpt"
                      value={formData.excerpt || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Body</label>
                    <textarea
                      name="body"
                      value={formData.body || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full min-h-36 rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tags (comma separated)</label>
                    <input
                      name="tags"
                      value={formData.tags || ""}
                      onChange={handleChange}
                      placeholder="e.g. tech, coding, tutorials"
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Testimonials Form fields */}
              {type === "testimonials" && (
                <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Name</label>
                    <input
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Role</label>
                      <input
                        name="role"
                        value={formData.role || ""}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Company</label>
                      <input
                        name="company"
                        value={formData.company || ""}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Quote</label>
                    <textarea
                      name="quote"
                      value={formData.quote || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full min-h-24 rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Rating (1-5)</label>
                      <select
                        name="rating"
                        value={formData.rating || 5}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      >
                        <option value="1">1 Star</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          name="visible"
                          type="checkbox"
                          checked={formData.visible !== false}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-950"
                        />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Visible</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Form fields */}
              {type === "experience" && (
                <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Company</label>
                      <input
                        name="company"
                        value={formData.company || ""}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Position</label>
                      <input
                        name="position"
                        value={formData.position || ""}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Job Type</label>
                      <select
                        name="type"
                        value={formData.type || "full-time"}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Location</label>
                      <input
                        name="location"
                        value={formData.location || ""}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Start Date</label>
                      <input
                        name="startDate"
                        type="date"
                        value={formData.startDate || ""}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">End Date</label>
                      <input
                        name="endDate"
                        type="date"
                        value={formData.endDate || ""}
                        onChange={handleChange}
                        disabled={formData.current === true}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      name="current"
                      type="checkbox"
                      checked={formData.current || false}
                      onChange={handleChange}
                      id="current-experience"
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-950"
                    />
                    <label htmlFor="current-experience" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Currently Work Here
                    </label>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description</label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full min-h-24 rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Technologies (comma separated)</label>
                      <input
                        name="technologies"
                        value={formData.technologies || ""}
                        onChange={handleChange}
                        placeholder="React, Node.js"
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Achievements (comma separated)</label>
                      <input
                        name="achievements"
                        value={formData.achievements || ""}
                        onChange={handleChange}
                        placeholder="Created API, Led team"
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Display Order</label>
                      <input
                        name="order"
                        type="number"
                        value={formData.order || 0}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                    <div className="flex items-end pb-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          name="visible"
                          type="checkbox"
                          checked={formData.visible !== false}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-950"
                        />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Visible</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Education Form fields */}
              {type === "education" && (
                <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Institution</label>
                      <input
                        name="institution"
                        value={formData.institution || ""}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Degree</label>
                      <input
                        name="degree"
                        value={formData.degree || ""}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Field of Study</label>
                    <input
                      name="field"
                      value={formData.field || ""}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Start Date</label>
                      <input
                        name="startDate"
                        type="date"
                        value={formData.startDate || ""}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">End Date</label>
                      <input
                        name="endDate"
                        type="date"
                        value={formData.endDate || ""}
                        onChange={handleChange}
                        disabled={formData.current === true}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      name="current"
                      type="checkbox"
                      checked={formData.current || false}
                      onChange={handleChange}
                      id="current-education"
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-950"
                    />
                    <label htmlFor="current-education" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Currently Studying Here
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">CGPA / Grade</label>
                      <input
                        name="cgpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={formData.cgpa || ""}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Current Semester</label>
                      <input
                        name="semester"
                        type="number"
                        value={formData.semester || ""}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description</label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full min-h-24 rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Subjects (comma separated)</label>
                      <input
                        name="subjects"
                        value={formData.subjects || ""}
                        onChange={handleChange}
                        placeholder="e.g. OS, DBMS, Algorithms"
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Achievements (comma separated)</label>
                      <input
                        name="achievements"
                        value={formData.achievements || ""}
                        onChange={handleChange}
                        placeholder="e.g. Gold Medalist, Rank 1"
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Display Order</label>
                      <input
                        name="order"
                        type="number"
                        value={formData.order || 0}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                    <div className="flex items-end pb-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          name="visible"
                          type="checkbox"
                          checked={formData.visible !== false}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-950"
                        />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Visible</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Categories Form fields */}
              {type === "categories" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Name</label>
                    <input
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Type</label>
                      <select
                        name="type"
                        value={formData.type || "project"}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      >
                        <option value="project">Project</option>
                        <option value="blog">Blog</option>
                        <option value="skill">Skill</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Display Order</label>
                      <input
                        name="order"
                        type="number"
                        value={formData.order || 0}
                        onChange={handleChange}
                        className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description</label>
                    <input
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Color Tag</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        name="color"
                        type="color"
                        value={formData.color || "#2563eb"}
                        onChange={handleChange}
                        className="h-10 w-12 rounded cursor-pointer bg-transparent"
                      />
                      <input
                        name="color"
                        value={formData.color || "#2563eb"}
                        onChange={handleChange}
                        className="focus-ring flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* User Detail Monitoring Drawer */}
      {userDetailOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm" onClick={() => setUserDetailOpen(false)}>
          <div
            className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <FiUser /> User Details
              </h2>
              <button
                onClick={() => setUserDetailOpen(false)}
                className="focus-ring rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FiX size={20} />
              </button>
            </div>

            {userDetailLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader label="Loading user details" />
              </div>
            ) : userDetail ? (
              <div className="p-6 space-y-6">
                {/* Account Summary */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                  <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FiShield size={14} /> Account Summary
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Name</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{userDetail.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Email</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{userDetail.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Role</p>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        userDetail.user?.role === "admin" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        userDetail.user?.role === "editor" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}>{userDetail.user?.role}</span>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Provider</p>
                      <p className="font-semibold text-slate-900 dark:text-white capitalize">{userDetail.user?.provider || "local"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Email Verified</p>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        userDetail.user?.emailVerified ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>{userDetail.user?.emailVerified ? "Yes" : "No"}</span>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">2FA Enabled</p>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        userDetail.user?.twoFactorEnabled ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>{userDetail.user?.twoFactorEnabled ? "Enabled" : "Disabled"}</span>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Joined</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{new Date(userDetail.user?.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                  <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FiMonitor size={14} /> Active Sessions ({userDetail.sessions?.length || 0})
                  </h3>
                  <div className="mt-3 space-y-2">
                    {userDetail.sessions?.length > 0 ? userDetail.sessions.map((session) => (
                      <div key={session._id} className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 text-sm flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{session.browser} on {session.os}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{session.device} · IP: {session.ip} · Last active: {new Date(session.lastActive).toLocaleString()}</p>
                        </div>
                      </div>
                    )) : <p className="text-sm text-slate-500">No active sessions.</p>}
                  </div>
                </div>

                {/* Audit Logs */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                  <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FiActivity size={14} /> Activity Log ({userDetail.logs?.length || 0})
                  </h3>
                  <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                    {userDetail.logs?.length > 0 ? userDetail.logs.map((log) => (
                      <div key={log._id} className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 text-sm border-l-4 border-l-transparent" style={{
                        borderLeftColor: log.status === "success" ? "#22c55e" : "#ef4444"
                      }}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {log.action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            log.status === "success" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>{log.status}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <FiClock className="inline mr-1" size={11} />{new Date(log.timestamp).toLocaleString()}
                          {log.ip && <> · IP: {log.ip}</>}
                          {log.browser && log.browser !== "Unknown" && <> · {log.browser}</>}
                        </p>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <p className="text-xs text-slate-400 mt-1 truncate">Details: {JSON.stringify(log.details)}</p>
                        )}
                      </div>
                    )) : <p className="text-sm text-slate-500">No activity logs yet.</p>}
                  </div>
                </div>

                {/* User's Works */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                  <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FiFolder size={14} /> User's Works
                  </h3>
                  <div className="mt-3 space-y-3">
                    {/* Projects */}
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1"><FiFolder size={12} /> Projects ({userDetail.works?.projects?.length || 0})</p>
                      <div className="mt-1 space-y-1">
                        {userDetail.works?.projects?.length > 0 ? userDetail.works.projects.map((p) => (
                          <div key={p._id} className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 text-sm">
                            <p className="font-medium text-slate-800 dark:text-slate-200">{p.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{p.status} · {p.category} · Created: {new Date(p.createdAt).toLocaleDateString()}</p>
                          </div>
                        )) : <p className="text-xs text-slate-500 pl-1">No projects.</p>}
                      </div>
                    </div>

                    {/* Blogs */}
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1"><FiBookOpen size={12} /> Blogs ({userDetail.works?.blogs?.length || 0})</p>
                      <div className="mt-1 space-y-1">
                        {userDetail.works?.blogs?.length > 0 ? userDetail.works.blogs.map((b) => (
                          <div key={b._id} className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 text-sm">
                            <p className="font-medium text-slate-800 dark:text-slate-200">{b.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{b.status} · Created: {new Date(b.createdAt).toLocaleDateString()}</p>
                          </div>
                        )) : <p className="text-xs text-slate-500 pl-1">No blogs.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500">Failed to load user details.</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
