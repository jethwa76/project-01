import { FiAward, FiFolder, FiUsers, FiStar, FiMessageSquare, FiMail, FiBookOpen, FiBell } from "react-icons/fi";
import { useApiResource } from "../../hooks/useApiResource";
import Loader from "../../components/common/Loader";

const fallbackMetrics = {
  users: 0,
  projects: 0,
  skills: 0,
  certificates: 0,
  testimonials: 0,
  messages: 0,
  blogs: 0,
  notifications: 0
};

export default function AdminOverview() {
  const { data, loading } = useApiResource("/admin/overview", {
    metrics: fallbackMetrics,
    recentMessages: [],
    popularProjects: []
  });

  if (loading) return <Loader />;

  const metrics = data.metrics || fallbackMetrics;
  const cards = [
    { label: "Users", value: metrics.users, icon: FiUsers },
    { label: "Projects", value: metrics.projects, icon: FiFolder },
    { label: "Skills", value: metrics.skills, icon: FiStar },
    { label: "Certificates", value: metrics.certificates, icon: FiAward },
    { label: "Testimonials", value: metrics.testimonials, icon: FiMessageSquare },
    { label: "Messages", value: metrics.messages, icon: FiMail },
    { label: "Blogs", value: metrics.blogs, icon: FiBookOpen },
    { label: "Notifications", value: metrics.notifications, icon: FiBell }
  ];

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Dashboard overview</h1>
      <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
              <Icon className="text-primary" size={20} />
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Recent messages" items={data.recentMessages?.map((m) => `${m.subject} from ${m.email}`)} />
        <Panel title="Popular projects" items={data.popularProjects?.map((p) => `${p.title} - ${p.views || 0} views`)} />
      </div>
    </section>
  );
}

function Panel({ title, items = [] }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <h2 className="font-bold text-slate-950 dark:text-white">{title}</h2>
      <div className="mt-4 grid gap-3">
        {(items.length ? items : ["No records yet"]).map((item) => (
          <p key={item} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-650 dark:bg-slate-950 dark:text-slate-350">{item}</p>
        ))}
      </div>
    </article>
  );
}
