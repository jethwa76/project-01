import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FiCamera, FiUser } from "react-icons/fi";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../api/client";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { pushToast } = useToast();
  const { register, handleSubmit, formState, reset } = useForm({ defaultValues: user || {} });
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      pushToast("Please select an image file.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      pushToast("Image must be under 5MB.", "error");
      return;
    }

    setUploading(true);
    try {
      // Upload to Cloudinary via backend
      const formData = new FormData();
      formData.append("image", file);
      const { data: uploadData } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Update profile with new avatar
      const { data } = await api.patch("/users/profile", {
        avatar: uploadData.image
      });
      setUser(data.user);
      pushToast("Avatar updated successfully!", "success");
    } catch (err) {
      console.error("Avatar upload error:", err);
      pushToast(err.message || "Failed to upload avatar.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Profile</h1>

      {/* Avatar section */}
      <div className="mt-6 flex items-center gap-5">
        <div className="relative">
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary border-2 border-slate-200 dark:border-slate-700">
              <FiUser size={28} />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-primary text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
            title="Change avatar"
          >
            <FiCamera size={14} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        <div>
          <p className="font-bold text-slate-950 dark:text-white">{user?.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          {uploading && (
            <p className="mt-1 text-xs text-primary font-medium animate-pulse">Uploading avatar...</p>
          )}
        </div>
      </div>

      {/* Profile form */}
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
