import { Link } from "react-router-dom";

const variants = {
  primary: "bg-primary text-white hover:bg-blue-700",
  secondary: "bg-secondary text-white hover:bg-teal-600",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  outline: "border border-slate-300 text-slate-800 hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-100"
};

export default function Button({ children, className = "", variant = "primary", to, icon: Icon, ...props }) {
  const classes = `focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${variants[variant]} ${className}`;
  const content = (
    <>
      {Icon ? <Icon aria-hidden="true" /> : null}
      {children}
    </>
  );

  if (to) {
    const isExternal = to.startsWith("http://") || to.startsWith("https://");
    const isFile = to.includes(".") && !to.startsWith("#");
    if (isExternal || isFile) {
      return (
        <a className={classes} href={to} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined} {...props}>
          {content}
        </a>
      );
    }
    return (
      <Link className={classes} to={to} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
