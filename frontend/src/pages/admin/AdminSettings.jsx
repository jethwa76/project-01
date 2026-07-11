import { useEffect, useState } from "react";
import { FiHome, FiMail, FiShare2, FiFileText, FiGlobe, FiCheck } from "react-icons/fi";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import api from "../../api/client";
import { useToast } from "../../context/ToastContext";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const { pushToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data.data);
      } catch (err) {
        pushToast(err.message || "Failed to load site settings.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [pushToast]);

  const handleUpdate = async (subpath, payload) => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/settings/${subpath}`, payload);
      setSettings((prev) => ({
        ...prev,
        [subpath]: data.data
      }));
      pushToast("Settings updated successfully.", "success");
    } catch (err) {
      pushToast(err.message || "Failed to update settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading settings..." />;
  if (!settings) return <div className="text-center py-10 text-slate-500">Failed to load site configurations.</div>;

  const tabs = [
    { id: "hero", label: "Hero Section", icon: FiHome },
    { id: "contact", label: "Contact Info", icon: FiMail },
    { id: "social", label: "Social Links", icon: FiShare2 },
    { id: "resume", label: "Resume Info", icon: FiFileText },
    { id: "seo", label: "SEO Defaults", icon: FiGlobe }
  ];

  return (
    <section>
      <div>
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Global Settings</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Manage your portfolio content layouts, contact coordinates, social hooks, resume files, and SEO metadata.
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
        <aside className="flex flex-row md:flex-col overflow-x-auto gap-1 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-3 md:pb-0 md:pr-4">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === id
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </aside>

        <main className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          {activeTab === "hero" && <HeroTab form={settings.hero} onSave={(data) => handleUpdate("hero", data)} saving={saving} />}
          {activeTab === "contact" && <ContactTab form={settings.contact} onSave={(data) => handleUpdate("contact", data)} saving={saving} />}
          {activeTab === "social" && <SocialTab form={settings.social} onSave={(data) => handleUpdate("social", data)} saving={saving} />}
          {activeTab === "resume" && <ResumeTab form={settings.resume} onSave={(data) => handleUpdate("resume", data)} saving={saving} />}
          {activeTab === "seo" && <SeoTab form={settings.seo} onSave={(data) => handleUpdate("seo", data)} saving={saving} />}
        </main>
      </div>
    </section>
  );
}

function HeroTab({ form, onSave, saving }) {
  const [data, setData] = useState({ ...form });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white border-b pb-2 dark:border-slate-800">Hero Layout</h2>
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Title</label>
        <input
          value={data.title || ""}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          required
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Subtitle</label>
        <input
          value={data.subtitle || ""}
          onChange={(e) => setData({ ...data, subtitle: e.target.value })}
          className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          required
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description</label>
        <textarea
          value={data.description || ""}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="mt-1 focus-ring w-full min-h-24 rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">CTA Button Text</label>
          <input
            value={data.ctaText || ""}
            onChange={(e) => setData({ ...data, ctaText: e.target.value })}
            className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">CTA Button Link</label>
          <input
            value={data.ctaLink || ""}
            onChange={(e) => setData({ ...data, ctaLink: e.target.value })}
            className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          />
        </div>
      </div>
      <div className="flex justify-end pt-3">
        <Button type="submit" icon={FiCheck} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function ContactTab({ form, onSave, saving }) {
  const [data, setData] = useState({ ...form });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white border-b pb-2 dark:border-slate-800">Contact Details</h2>
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Public Contact Email</label>
        <input
          value={data.email || ""}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          type="email"
          className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Phone Number</label>
        <input
          value={data.phone || ""}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
          className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Physical Address</label>
        <input
          value={data.address || ""}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Google Map Embed Link</label>
        <input
          value={data.mapUrl || ""}
          onChange={(e) => setData({ ...data, mapUrl: e.target.value })}
          type="url"
          className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
        />
      </div>
      <div className="flex justify-end pt-3">
        <Button type="submit" icon={FiCheck} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function SocialTab({ form, onSave, saving }) {
  const [data, setData] = useState({ ...form });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white border-b pb-2 dark:border-slate-800">Social Connections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">GitHub Profile URL</label>
          <input
            value={data.github || ""}
            onChange={(e) => setData({ ...data, github: e.target.value })}
            className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">LinkedIn Profile URL</label>
          <input
            value={data.linkedin || ""}
            onChange={(e) => setData({ ...data, linkedin: e.target.value })}
            className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Twitter/X URL</label>
          <input
            value={data.twitter || ""}
            onChange={(e) => setData({ ...data, twitter: e.target.value })}
            className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Instagram URL</label>
          <input
            value={data.instagram || ""}
            onChange={(e) => setData({ ...data, instagram: e.target.value })}
            className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">LeetCode URL</label>
          <input
            value={data.leetcode || ""}
            onChange={(e) => setData({ ...data, leetcode: e.target.value })}
            className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Codeforces URL</label>
          <input
            value={data.codeforces || ""}
            onChange={(e) => setData({ ...data, codeforces: e.target.value })}
            className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          />
        </div>
      </div>
      <div className="flex justify-end pt-3">
        <Button type="submit" icon={FiCheck} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function ResumeTab({ form, onSave, saving }) {
  const [data, setData] = useState({ ...form });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white border-b pb-2 dark:border-slate-800">Resume Link</h2>
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Resume Download URL</label>
        <input
          value={data.url || ""}
          onChange={(e) => setData({ ...data, url: e.target.value })}
          className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          placeholder="URL to your uploaded resume file"
        />
      </div>
      {data.lastUpdated && (
        <p className="text-xs text-slate-500 dark:text-slate-400">Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
      )}
      <div className="flex justify-end pt-3">
        <Button type="submit" icon={FiCheck} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function SeoTab({ form, onSave, saving }) {
  const [data, setData] = useState({
    ...form,
    keywords: form.keywords?.join(", ") || ""
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...data,
      keywords: data.keywords ? data.keywords.split(",").map((k) => k.trim()) : []
    };
    onSave(payload);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white border-b pb-2 dark:border-slate-800">SEO Default Settings</h2>
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Site Title</label>
        <input
          value={data.siteTitle || ""}
          onChange={(e) => setData({ ...data, siteTitle: e.target.value })}
          className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          required
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Site Description</label>
        <textarea
          value={data.siteDescription || ""}
          onChange={(e) => setData({ ...data, siteDescription: e.target.value })}
          className="mt-1 focus-ring w-full min-h-24 rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          required
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">SEO Keywords (comma separated)</label>
        <input
          value={data.keywords || ""}
          onChange={(e) => setData({ ...data, keywords: e.target.value })}
          className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          placeholder="e.g. portfolio, developer, react, fullstack"
        />
      </div>
      <div className="flex justify-end pt-3">
        <Button type="submit" icon={FiCheck} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
