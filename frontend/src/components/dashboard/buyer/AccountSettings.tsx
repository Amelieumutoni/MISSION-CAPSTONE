import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthService from "@/api/services/authService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, Mail, User } from "lucide-react";

export default function AccountSettingsSection() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      return toast.error("PASSWORDS DO NOT MATCH", {
        description: "The new password and confirmation must be identical.",
      });
    }

    setIsLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      currentPassword: formData.currentPassword || undefined,
      newPassword: formData.newPassword || undefined,
    };

    toast.promise(AuthService.updateSettings(payload), {
      loading: "SYNCHRONIZING ACCOUNT REGISTRY...",
      success: () => {
        setIsLoading(false);
        refreshUser();
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        return "ACCOUNT SETTINGS UPDATED SUCCESSFULLY.";
      },
      error: (err) => {
        setIsLoading(false);
        return err.response?.data?.message || "FAILED TO UPDATE SETTINGS.";
      },
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
      <header className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-2">
          Security / Credentials
        </p>
        <h1 className="text-3xl font-serif font-bold text-slate-900">
          Account Settings
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Basic Identity Section */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                <User size={14} /> Display Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-slate-200 py-2 focus:border-slate-900 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                <Mail size={14} /> System Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-slate-200 py-2 focus:border-slate-900 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </section>

        {/* Password Reset Section */}
        <section className="pt-8 border-t border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-2 bg-slate-900 text-white">
              <Lock size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest">
                Update Credentials
              </h2>
              <p className="text-[11px] text-slate-400">
                Leave blank if you do not wish to change your password.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase text-slate-500">
                Current Password
              </label>
              <input
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-slate-200 py-2 focus:border-slate-900 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase text-slate-500">
                New Password
              </label>
              <input
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-slate-200 py-2 focus:border-slate-900 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase text-slate-500">
                Confirm New Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-slate-200 py-2 focus:border-slate-900 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </section>

        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-none bg-slate-900 hover:bg-black px-12 py-6 text-[11px] uppercase tracking-[0.3em] font-bold transition-all"
        >
          {isLoading ? "Synchronizing..." : "Update Credentials"}
        </Button>
      </form>
    </div>
  );
}
