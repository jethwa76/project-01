import { FiAward, FiBell, FiFolder, FiGrid, FiMessageCircle, FiSettings, FiStar, FiUser, FiBookOpen, FiMessageSquare, FiBriefcase, FiBook, FiList, FiShield } from "react-icons/fi";
import { NavLink, Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const adminLinks = [
  { label: "Overview", to: "/admin", icon: FiGrid },
  { label: "Users", to: "/admin/users", icon: FiUser },
  { label: "Verifications", to: "/admin/verifications", icon: FiShield },
  { label: "Projects", to: "/admin/projects", icon: FiFolder },
  { label: "Blogs", to: "/admin/blogs", icon: FiBookOpen },
  { label: "Skills", to: "/admin/skills", icon: FiStar },
  { label: "Experience", to: "/admin/experience", icon: FiBriefcase },
  { label: "Education", to: "/admin/education", icon: FiBook },
  { label: "Categories", to: "/admin/categories", icon: FiList },
  { label: "Certificates", to: "/admin/certificates", icon: FiAward },
  { label: "Testimonials", to: "/admin/testimonials", icon: FiMessageSquare },
  { label: "Messages", to: "/admin/messages", icon: FiMessageCircle },
  { label: "Global Settings", to: "/admin/settings", icon: FiSettings }
];

const userLinks = [
  { label: "Profile", to: "/dashboard", icon: FiUser },
  { label: "Verification", to: "/dashboard/verification", icon: FiShield },
  { label: "Saved", to: "/dashboard/saved", icon: FiFolder },
  { label: "Favorites", to: "/dashboard/favorites", icon: FiStar },
  { label: "Notifications", to: "/dashboard/notifications", icon: FiBell },
  { label: "Settings", to: "/dashboard/settings", icon: FiSettings }
];

export default function DashboardLayout({ admin = false }) {
  const links = admin ? adminLinks : userLinks;
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container-page grid gap-6 py-8 lg:grid-cols-[250px_1fr]">
        <aside className="glass h-max rounded-lg p-3">
          <nav className="grid gap-1" aria-label={admin ? "Admin navigation" : "Dashboard navigation"}>
            {links.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin" || to === "/dashboard"}
                className={({ isActive }) =>
                  `focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`
                }
              >
                <Icon aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
