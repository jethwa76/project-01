import { useState } from "react";
import { FiBriefcase, FiLogOut, FiMenu, FiMoon, FiSun, FiUser, FiX } from "react-icons/fi";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Button from "../common/Button";

const links = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blogs" },
  { label: "Contact", href: "/#contact" }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/82 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/82">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Primary navigation">
        <Link to="/" className="focus-ring flex items-center gap-2 rounded-lg font-bold text-slate-950 dark:text-white">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white">
            <FiBriefcase aria-hidden="true" />
          </span>
          <span>ShowcasePro</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            className="focus-ring rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>
          {user ? (
            <>
              <Button variant="ghost" to={isAdmin ? "/admin" : "/dashboard"} icon={FiUser}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={logout} icon={FiLogOut}>
                Logout
              </Button>
            </>
          ) : (
            <Button to="/login" icon={FiUser}>
              Login
            </Button>
          )}
        </div>

        <button
          className="focus-ring rounded-lg p-2 text-slate-700 dark:text-slate-100 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <div className="container-page grid gap-2">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setOpen(false)}
                className="focus-ring rounded-lg px-3 py-3 font-medium text-slate-700 dark:text-slate-200"
              >
                {link.label}
              </Link>
            ))}
            <button className="focus-ring rounded-lg px-3 py-3 text-left font-medium" onClick={toggleTheme}>
              Toggle {theme === "dark" ? "light" : "dark"} mode
            </button>
            {user ? (
              <Button to={isAdmin ? "/admin" : "/dashboard"} onClick={() => setOpen(false)}>Dashboard</Button>
            ) : (
              <Button to="/login" onClick={() => setOpen(false)}>Login</Button>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
