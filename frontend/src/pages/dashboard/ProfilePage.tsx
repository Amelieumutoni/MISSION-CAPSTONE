import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Camera,
  MapPin,
  Briefcase,
  Phone,
  Save,
  User,
  Lock,
  Mail,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AuthService from "@/api/services/authService";
import { toast, Toaster } from "sonner";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"identity" | "security">(
    "identity",
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <Toaster
        position="top-right"
        richColors
        theme="light"
        style={{
          marginTop: "70px",
        }}
      />

      <header>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-2">
          User Settings / {activeTab === "identity" ? "Registry" : "Security"}
        </p>
        <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white transition-colors">
          Account Control
        </h1>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-8 border-b border-slate-200 dark:border-white/10">
        <TabButton
          active={activeTab === "identity"}
          onClick={() => setActiveTab("identity")}
          label="Registry Identity"
        />
        <TabButton
          active={activeTab === "security"}
          onClick={() => setActiveTab("security")}
          label="Account Settings"
        />
      </div>

      {/* Conditional Rendering of Sections */}
      {activeTab === "identity" ? (
        <IdentitySection />
      ) : (
        <AccountSettingsSection />
      )}
    </div>
  );
}

// --- TAB 1: IDENTITY SECTION (PROFILE & IMAGE) ---
function IdentitySection() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Logic: Exclude professional fields if user is Admin
  const isAdmin = user?.role === "ADMIN";

  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    specialty: "",
    years_experience: "",
    phone_contact: "",
  });

  const BASE_URL = import.meta.env.BACKEND_IMAGE_URL || "/image";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const data = new FormData();

    // Only append relevant fields based on role
    data.append("location", formData.location);
    data.append("phone_contact", formData.phone_contact);

    if (!isAdmin) {
      data.append("bio", formData.bio);
      data.append("specialty", formData.specialty);
      data.append("years_experience", formData.years_experience);
    }

    if (fileInputRef.current?.files?.[0]) {
      data.append("profile_picture", fileInputRef.current.files[0]);
    }

    toast.promise(AuthService.updateProfile(data), {
      loading: "UPDATING REGISTRY...",
      success: () => {
        setIsLoading(false);
        refreshUser();
        return "IDENTITY UPDATED";
      },
      error: (err) => {
        setIsLoading(false);
        return err.response?.data?.message || "UPDATE FAILED";
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in slide-in-from-left-4 duration-500">
      <div className="lg:col-span-4 space-y-6">
        <div
          className="relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="aspect-square bg-slate-100 dark:bg-white/5 border border-slate-200 overflow-hidden relative grayscale hover:grayscale-0 transition-all">
            <img
              src={
                previewImage ||
                (user?.profile?.profile_picture
                  ? `${BASE_URL}${user.profile.profile_picture}`
                  : `https://ui-avatars.com/api/?name=${user?.name}`)
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white gap-2 transition-opacity">
              <Camera size={20} />
              <span className="text-[9px] uppercase font-bold tracking-widest">
                Change Photo
              </span>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreviewImage(URL.createObjectURL(file));
            }}
          />
        </div>
        <div className="space-y-2">
          <InfoRow
            label="Access Level"
            value={user?.role || "AUTHOR"}
            isBadge
          />
          <InfoRow label="Registry Email" value={user?.email || "N/A"} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8">
        {!isAdmin && (
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
              <User size={14} /> Professional Biography
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={4}
              className="w-full bg-transparent border border-slate-200 dark:border-white/10 p-4 focus:border-slate-900 outline-none text-sm leading-relaxed"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileInput
            icon={<MapPin size={14} />}
            label="Location"
            value={formData.location}
            onChange={(e: any) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
          <ProfileInput
            icon={<Phone size={14} />}
            label="Contact Number"
            value={formData.phone_contact}
            onChange={(e: any) =>
              setFormData({ ...formData, phone_contact: e.target.value })
            }
          />

          {!isAdmin && (
            <ProfileInput
              icon={<Briefcase size={14} />}
              label="Specialty"
              value={formData.specialty}
              onChange={(e: any) =>
                setFormData({ ...formData, specialty: e.target.value })
              }
            />
          )}
        </div>
        <Button
          disabled={isLoading}
          className="w-full md:w-auto rounded-none bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-black dark:hover:bg-slate-200 px-10 h-12 uppercase tracking-widest text-[10px] font-bold transition-colors"
        >
          <Save size={14} className="mr-2" />
          {isLoading ? "Processing..." : "Save Identity"}
        </Button>
      </form>
    </div>
  );
}

// --- TAB 2: ACCOUNT SETTINGS SECTION (NAME, EMAIL, PASSWORD) ---
function AccountSettingsSection() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      return toast.error("PASSWORDS DO NOT MATCH");
    }

    setIsLoading(true);
    const payload = {
      name: formData.name,
      email: formData.email,
      currentPassword: formData.currentPassword || undefined,
      newPassword: formData.newPassword || undefined,
    };

    toast.promise(AuthService.updateSettings(payload), {
      loading: "SYNCHRONIZING ACCOUNT...",
      success: () => {
        setIsLoading(false);
        refreshUser();
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        return "ACCOUNT SETTINGS UPDATED";
      },
      error: (err) => {
        setIsLoading(false);
        return err.response?.data?.message || "FAILED TO UPDATE SETTINGS";
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in slide-in-from-right-4 duration-500">
      <div className="lg:col-span-4 space-y-6">
        <div className="p-8 bg-slate-50 dark:bg-white/5 border border-slate-200 flex flex-col items-center text-center space-y-4">
          <Fingerprint size={32} className="text-slate-400" />
          <h3 className="font-serif font-bold text-lg">System Credentials</h3>
          <p className="text-[11px] text-slate-500 uppercase tracking-wide leading-relaxed">
            Update your core identity and security access.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProfileInput
            icon={<User size={14} />}
            label="Display Name"
            value={formData.name}
            onChange={(e: any) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <ProfileInput
            icon={<Mail size={14} />}
            label="System Email"
            value={formData.email}
            onChange={(e: any) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-white/5 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProfileInput
              type="password"
              label="Current Password"
              value={formData.currentPassword}
              onChange={(e: any) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
            />
            <ProfileInput
              type="password"
              label="New Password"
              value={formData.newPassword}
              onChange={(e: any) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
            />
            <ProfileInput
              type="password"
              label="Confirm New"
              value={formData.confirmPassword}
              onChange={(e: any) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </div>
        </div>

        <Button
          disabled={isLoading}
          className="w-full md:w-auto rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 px-10 h-12 uppercase tracking-widest text-[10px] font-bold transition-colors"
        >
          <Lock size={14} className="mr-2" />
          {isLoading ? "Processing..." : "Update Credentials"}
        </Button>
      </form>
    </div>
  );
}

// --- HELPERS (SAME AS YOUR ORIGINAL) ---
function TabButton({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pb-4 text-[11px] uppercase tracking-[0.2em] font-bold transition-all border-b-2",
        active
          ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
          : "border-transparent text-slate-400 hover:text-slate-600",
      )}
    >
      {label}
    </button>
  );
}

function InfoRow({ label, value, isBadge }: any) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 py-2">
      <span className="text-[9px] font-mono text-slate-400 uppercase">
        {label}
      </span>
      <span
        className={cn(
          "text-[11px] font-medium",
          isBadge
            ? "bg-slate-900 text-white px-2 py-0.5 text-[9px] uppercase tracking-widest"
            : "text-slate-600",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ProfileInput({
  icon,
  label,
  name,
  value,
  onChange,
  type = "text",
}: any) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
        {icon} {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 focus:border-slate-900 outline-none transition-all text-sm"
      />
    </div>
  );
}
