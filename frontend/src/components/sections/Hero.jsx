import { motion } from "framer-motion";
import { FiArrowRight, FiDownload, FiPlay } from "react-icons/fi";
import Button from "../common/Button";

export default function Hero({ profile }) {
  const badgeText = profile ? `Portfolio of ${profile.name}` : "Portfolio platform for builders, writers, and teams";
  const titleText = profile?.headline || "Showcase projects, proof, and personality in one polished system.";
  const bioText = profile?.bio || "A responsive full-stack platform with project cases, blogs, achievements, contact capture, dashboards, authentication, and admin-managed content.";

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="mb-4 inline-flex rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-primary dark:bg-blue-950/50">
            {badgeText}
          </p>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-slate-950 dark:text-white sm:text-6xl">
            {titleText}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            {bioText}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/projects" icon={FiArrowRight}>
              Explore projects
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="glass rounded-lg p-4 shadow-soft"
        >
          <div className="rounded-lg bg-slate-950 p-4 text-white">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Project health</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <button className="grid h-11 w-11 place-items-center rounded-lg bg-secondary" aria-label="Play showcase preview">
                <FiPlay />
              </button>
            </div>
            <div className="grid gap-3">
              {["Talent Signal Hub", "API Gateway Integration", "Database Health Insights"].map((item, index) => (
                <div key={item} className="rounded-lg bg-white/8 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{item}</span>
                    <span className="text-sm text-slate-300">{88 + index * 4}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
                      style={{ width: `${88 + index * 4}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
