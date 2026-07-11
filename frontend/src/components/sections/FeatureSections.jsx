import { FiAward, FiCode, FiLayers, FiMessageCircle, FiShield, FiTrendingUp } from "react-icons/fi";
import { featuredProjects as mockProjects, skills as mockSkills, testimonials as mockTestimonials, timeline } from "../../data/demo";
import Button from "../common/Button";
import SectionHeading from "./SectionHeading";

const services = [
  { title: "Portfolio Strategy", icon: FiLayers, text: "Structure project narratives around outcomes, decisions, and trust." },
  { title: "Full Stack Delivery", icon: FiCode, text: "Ship responsive apps with secure APIs, clean models, and useful admin flows." },
  { title: "Growth Signals", icon: FiTrendingUp, text: "Surface skills, writing, testimonials, certificates, and measurable impact." },
  { title: "Security Baseline", icon: FiShield, text: "JWT auth, role access, validation, Helmet, rate limits, and sanitized inputs." }
];

export function AboutSection({ profile }) {
  const heading = profile ? `Built by ${profile.name}` : "Built for proof, not decoration.";
  const bioText = profile?.bio || "ShowcasePro turns a portfolio into a durable web product: cases, posts, achievements, testimonials, lead capture, and admin-managed content.";

  return (
    <section id="about" className="section bg-white/70 dark:bg-slate-950/40">
      <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-secondary">About</p>
          <h2 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">{heading}</h2>
        </div>
        <div className="space-y-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
          <p>{bioText}</p>
          {profile?.headline && (
            <p className="text-base font-semibold text-primary">
              Role: {profile.headline}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function ServicesSection() {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading eyebrow="Services" title="A complete platform surface" text="Every section is designed to help visitors understand ability, credibility, and availability quickly." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map(({ title, text, icon: Icon }) => (
            <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectsSection({ projects = [] }) {
  const displayProjects = projects.length > 0 ? projects.slice(0, 6) : mockProjects;

  return (
    <section id="projects" className="section bg-white/70 dark:bg-slate-950/40">
      <div className="container-page">
        <SectionHeading eyebrow="Projects" title="Featured case studies" text="Cards support categories, tech stacks, links, likes, saved projects, filtering, and admin updates." />
        <div className="grid gap-5 md:grid-cols-3">
          {displayProjects.map((project) => (
            <article key={project._id || project.title} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
              <div>
                {project.slug ? (
                  <a href={`/projects/${project.slug}`}>
                    {project.image?.url ? (
                      <img src={project.image.url} alt={project.title} className="mb-5 h-36 w-full rounded-lg object-cover" />
                    ) : (
                      <div className="mb-5 h-36 rounded-lg bg-gradient-to-br from-primary to-slate-950" />
                    )}
                  </a>
                ) : (
                  <div className="mb-5 h-36 rounded-lg bg-gradient-to-br from-primary to-slate-950" />
                )}
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider">{project.category}</p>
                {project.slug ? (
                  <a href={`/projects/${project.slug}`}>
                    <h3 className="mt-2 text-xl font-bold text-slate-950 dark:text-white group-hover:text-primary transition-colors">{project.title}</h3>
                  </a>
                ) : (
                  <h3 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{project.title}</h3>
                )}
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300 line-clamp-3">{project.summary}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(project.technologies || []).map((tech) => (
                  <span key={tech} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button to="/projects">View all projects</Button>
        </div>
      </div>
    </section>
  );
}

export function SkillsTimelineSection({ skills = [] }) {
  const displaySkills = skills.length > 0 ? skills : mockSkills;

  return (
    <section className="section">
      <div className="container-page max-w-3xl">
        <SectionHeading eyebrow="Skills" title="Technical depth" />
        <div className="space-y-5">
          {displaySkills.map((skill) => (
            <div key={skill._id || skill.name}>
              <div className="mb-2 flex justify-between text-sm font-semibold">
                <span>{skill.name}</span>
                <span>{skill.level}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${skill.level}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection({ testimonials = [] }) {
  const displayTestimonials = testimonials.length > 0 ? testimonials : mockTestimonials;

  return (
    <section className="section bg-white/70 dark:bg-slate-950/40">
      <div className="container-page">
        <SectionHeading eyebrow="Testimonials" title="Signals from collaborators" />
        <div className="grid gap-5 md:grid-cols-2">
          {displayTestimonials.map((item) => (
            <figure key={item._id || item.name} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <FiMessageCircle className="text-primary" />
              <blockquote className="mt-4 text-lg font-semibold leading-8 text-slate-800 dark:text-slate-100">"{item.quote}"</blockquote>
              <figcaption className="mt-5 text-sm text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-950 dark:text-white">{item.name}</span>
                {item.role && `, ${item.role}`}
                {item.company && ` at ${item.company}`}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CertificatesSection({ certificates = [] }) {
  const displayCertificates = certificates.length > 0 ? certificates : [
    { title: "Cloud Architecture Professional", issuer: "Example Cloud", credentialId: "CAP-2026" },
    { title: "Advanced React Systems", issuer: "Frontend Masters", credentialId: "ARS-2026" },
    { title: "Secure API Design", issuer: "OWASP Org", credentialId: "SAD-2026" }
  ];

  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading eyebrow="Certificates" title="Credentials and achievements" />
        <div className="grid gap-5 md:grid-cols-3">
          {displayCertificates.map((cert) => (
            <article key={cert._id || cert.title} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
              <div>
                <FiAward className="h-7 w-7 text-accent" />
                <h3 className="mt-4 font-bold text-slate-950 dark:text-white">{cert.title}</h3>
                <p className="mt-2 text-sm text-slate-500">Issuer: {cert.issuer}</p>
                {cert.credentialId && <p className="mt-1 text-xs text-slate-400">ID: {cert.credentialId}</p>}
              </div>
              {cert.credentialUrl && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:underline">
                    Verify Credential
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
