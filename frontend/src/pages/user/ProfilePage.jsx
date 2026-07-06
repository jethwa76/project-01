import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../api/client";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { pushToast } = useToast();
  const { register, handleSubmit, formState, reset } = useForm({ defaultValues: user || {} });

  // Sync form inputs with user state when user is fetched/updated
  useEffect(() => {
    if (user) {
      reset(user);
    }
  }, [user, reset]);

  const onSubmit = async (values) => {
    try {
      const { data } = await api.patch("/users/profile", values);
      setUser(data.user);
      pushToast("Profile updated successfully.", "success");
    } catch (err) {
      console.error("Profile save error:", err);
      pushToast(err.message || "Failed to update profile.", "error");
    }
  };

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Name</label>
            <input className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm" placeholder="Name" {...register("name", { required: "Name is required." })} />
            {formState.errors.name && <p className="mt-1 text-xs text-red-500">{formState.errors.name.message}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Headline</label>
            <input className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm" placeholder="Headline" {...register("headline")} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Location</label>
            <input className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm" placeholder="Location" {...register("location")} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Website</label>
            <input className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm" type="url" placeholder="Website" {...register("website")} />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Bio</label>
          <textarea className="mt-1 focus-ring w-full min-h-32 rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm" placeholder="Bio" {...register("bio")} />
        </div>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Saving..." : "Save profile"}
        </Button>
      </form>
    </section>
  );
}

