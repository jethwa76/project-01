import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiSend } from "react-icons/fi";
import api from "../api/client";
import Button from "../components/common/Button";
import PageShell from "../components/layout/PageShell";
import Loader from "../components/common/Loader";
import {
  AboutSection,
  ServicesSection,
  SkillsTimelineSection,
  TestimonialsSection
} from "../components/sections/FeatureSections";
import Hero from "../components/sections/Hero";
import SectionHeading from "../components/sections/SectionHeading";
import { useToast } from "../context/ToastContext";

export default function LandingPage() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState } = useForm();
  const { pushToast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, projectsRes, skillsRes, certsRes, testRes] = await Promise.all([
          api.get("/users/admin-profile").catch(() => ({ data: { data: null } })),
          api.get("/projects").catch(() => ({ data: { data: [] } })),
          api.get("/skills").catch(() => ({ data: { data: [] } })),
          api.get("/certificates").catch(() => ({ data: { data: [] } })),
          api.get("/testimonials").catch(() => ({ data: { data: [] } }))
        ]);

        setProfile(profileRes.data?.data);
        setProjects(projectsRes.data?.data || []);
        setSkills(skillsRes.data?.data || []);
        setCertificates(certsRes.data?.data || []);
        setTestimonials(testRes.data?.data || []);
      } catch (err) {
        console.error("Failed to load landing page data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const onSubmit = async (values) => {
    try {
      await api.post("/messages", values);
      pushToast("Message sent successfully.", "success");
      reset();
    } catch (err) {
      pushToast(err.message || "Failed to send message.", "error");
    }
  };

  if (loading) {
    return (
      <PageShell>
        <Loader label="Loading portfolio" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main>
        <Hero profile={profile} />
        <AboutSection profile={profile} />
        <ServicesSection />
        <SkillsTimelineSection skills={skills} />
        <TestimonialsSection testimonials={testimonials} />
        <section id="contact" className="section bg-white/70 dark:bg-slate-950/40">
          <div className="container-page">
            <SectionHeading eyebrow="Contact" title="Start a conversation" text="Messages are stored in MongoDB and managed from the admin dashboard." />
            <form onSubmit={handleSubmit(onSubmit)} className="mx-auto grid max-w-2xl gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <input
                    className={`focus-ring w-full rounded-lg border px-4 py-3 dark:bg-slate-950 text-sm dark:text-white ${
                      formState.errors.name ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                    }`}
                    placeholder="Name"
                    {...register("name", { required: "Name is required." })}
                  />
                  {formState.errors.name && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <input
                    className={`focus-ring w-full rounded-lg border px-4 py-3 dark:bg-slate-950 text-sm dark:text-white ${
                      formState.errors.email ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                    }`}
                    placeholder="Email"
                    type="email"
                    {...register("email", {
                      required: "Email is required.",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address."
                      }
                    })}
                  />
                  {formState.errors.email && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{formState.errors.email.message}</p>
                  )}
                </div>
              </div>
              <div>
                <input
                  className={`focus-ring w-full rounded-lg border px-4 py-3 dark:bg-slate-950 text-sm dark:text-white ${
                    formState.errors.subject ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                  }`}
                  placeholder="Subject"
                  {...register("subject", { required: "Subject is required." })}
                />
                {formState.errors.subject && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{formState.errors.subject.message}</p>
                )}
              </div>
              <div>
                <textarea
                  className={`focus-ring w-full min-h-36 rounded-lg border px-4 py-3 dark:bg-slate-950 text-sm dark:text-white ${
                    formState.errors.message ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                  }`}
                  placeholder="Message"
                  {...register("message", {
                    required: "Message is required.",
                    minLength: { value: 10, message: "Message must be at least 10 characters." }
                  })}
                />
                {formState.errors.message && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{formState.errors.message.message}</p>
                )}
              </div>
              <Button type="submit" icon={FiSend} disabled={formState.isSubmitting}>
                {formState.isSubmitting ? "Sending..." : "Send message"}
              </Button>
            </form>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

