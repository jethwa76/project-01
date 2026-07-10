import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

const socials = [
  { label: "GitHub", icon: FiGithub, href: "https://github.com" },
  { label: "LinkedIn", icon: FiLinkedin, href: "https://www.linkedin.com/in/harsh-jethwa-a2020531b/" },
  { label: "Email", icon: FiMail, href: "mailto:harshyjethwa2020@gmail.com" }
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/70 py-10 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="container-page flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-bold text-slate-950 dark:text-white">ShowcasePro</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Portfolio, projects, writing, and trust signals in one responsive platform.
          </p>
        </div>
        <div className="flex gap-3">
          {socials.map(({ label, icon: Icon, href }) => (
            <a
              key={label}
              href={href}
              className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-800 dark:text-slate-300"
              aria-label={label}
            >
              <Icon aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
