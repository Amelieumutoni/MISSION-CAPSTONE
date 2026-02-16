import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Camera,
  MapPin,
  Briefcase,
  Phone,
  Clock,
  Save,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AuthService from "@/api/services/authService";
import { toast, Toaster } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Initialize with empty strings to avoid "uncontrolled component" warnings
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    specialty: "",
    years_experience: "",
    phone_contact: "",
  });

  const image = import.meta.env.BACKEND_IMAGE_URL || "http://localhost:5000";
  useEffect(() => {
    if (user?.profile) {
      setFormData({
        bio: user.profile.bio || "",
        location: user.profile.location || "",
        specialty: user.profile.specialty || "",
        years_experience: user.profile.years_experience || "",
        phone_contact: user.profile.phone_contact || "",
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewImage) URL.revokeObjectURL(previewImage);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    const data = new FormData();
    // Append text fields
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    // Append the file - THE KEY MUST BE "profile_picture"
    if (fileInputRef.current?.files?.[0]) {
      data.append("profile_picture", fileInputRef.current.files[0]);
    }

    toast.promise(AuthService.updateProfile(data), {
      loading: "SYNCHRONIZING REGISTRY DATA...",
      success: (res) => {
        setIsLoading(false);
        return "IDENTITY PROFILE UPDATED SUCCESSFULLY.";
      },
      error: (err) => {
        setIsLoading(false);
        return err.response?.data?.message || "FAILED TO UPDATE REGISTRY.";
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <Toaster
        position="top-right"
        richColors
        offset={80}
        toastOptions={{
          style: {
            marginTop: "10px",
            borderRadius: "0px",
            textTransform: "uppercase",
            fontSize: "10px",
            zIndex: 9999,
          },
        }}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-white/10 pb-8">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-2">
            System / Identity / {user?.role || "User"}
          </p>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            Account Profile
          </h1>
        </div>
        <Button
          onClick={() => handleSubmit()}
          disabled={isLoading}
          className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-black px-8 h-12 font-bold uppercase tracking-widest text-[11px] disabled:opacity-50 transition-all"
        >
          <Save size={16} className="mr-2" />
          {isLoading ? "Processing..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="aspect-square bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden relative">
              <img
                src={
                  previewImage ||
                  image + user?.profile?.profile_picture ||
                  `https://ui-avatars.com/api/?name=${user?.name}&background=000&color=fff&size=512`
                }
                alt="Profile"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                <Camera size={24} />
                <span className="text-[10px] uppercase font-bold tracking-widest">
                  Update Photo
                </span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold dark:text-white">
              Registry Info
            </h3>
            <div className="space-y-3">
              <InfoRow label="Legal Name" value={user?.name || "N/A"} />
              <InfoRow label="Email Address" value={user?.email || "N/A"} />
              <InfoRow
                label="Access Level"
                value={user?.role || "Editor"}
                isBadge
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <form className="space-y-10" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-slate-500">
                <User size={14} /> Professional Biography
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={5}
                placeholder="Describe your artistic background..."
                className="w-full bg-transparent border border-slate-200 dark:border-white/10 p-4 focus:border-slate-900 outline-none transition-all text-sm resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ProfileInput
                icon={<MapPin size={16} />}
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
              <ProfileInput
                icon={<Briefcase size={16} />}
                label="Specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleInputChange}
              />
              <ProfileInput
                icon={<Clock size={16} />}
                label="Years of Experience"
                name="years_experience"
                value={formData.years_experience}
                onChange={handleInputChange}
              />
              <ProfileInput
                icon={<Phone size={16} />}
                label="Contact Number"
                name="phone_contact"
                value={formData.phone_contact}
                onChange={handleInputChange}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Keep your existing InfoRow and ProfileInput sub-components exactly as they are.

// Sub-components
function InfoRow({ label, value, isBadge }: any) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 py-2">
      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
        {label}
      </span>
      <span
        className={cn(
          "text-xs font-medium",
          isBadge
            ? "bg-slate-900 text-white dark:bg-white dark:text-black px-2 py-0.5 text-[9px] font-bold uppercase"
            : "dark:text-slate-300",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ProfileInput({ icon, label, name, value, onChange, disabled }: any) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
        {icon} {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 focus:border-slate-900 dark:focus:border-white outline-none transition-all text-sm"
      />
    </div>
  );
}
