export default function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">{title}</h2>
      {text ? <p className="mt-4 text-slate-600 dark:text-slate-300">{text}</p> : null}
    </div>
  );
}
