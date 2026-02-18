import { useState, useRef } from "react"; // Added useRef
import { useAuth } from "@/context/AuthContext";
import AuthService from "@/api/services/authService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Save, MapPin } from "lucide-react";

export default function BuyerProfileSection() {
  const { user, refreshUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  // Create a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    shipping_address: user?.profile?.location || "",
    phone: user?.profile?.phone_contact || "",
  });

  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // We still update the preview for UX, but the file stays in the ref
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("location", formData.shipping_address);
    data.append("phone_contact", formData.phone);

    // Use the ref to check for and append the file
    if (fileInputRef.current?.files?.[0]) {
      data.append("profile_picture", fileInputRef.current.files[0]);
    }

    try {
      await AuthService.updateProfile(data);
      await refreshUser();

      toast.success("Profile updated successfully", {
        description: "Your information has been synced with the gallery.",
      });

      // Clear the input ref after successful upload
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
        Personal Information
      </h1>
      <p className="text-slate-500 mb-8 text-sm">
        Update your identity and default shipping details.
      </p>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-12"
      >
        {/* Left: Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 shadow-sm">
              <img
                src={
                  preview ||
                  (user?.profile?.profile_picture
                    ? `${import.meta.env.VITE_IMAGE_URL || "http://localhost:5000"}${user.profile.profile_picture}`
                    : "/default-avatar.png")
                }
                className="w-full h-full object-cover"
                alt="Profile"
              />
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
              <Camera size={24} />
              <input
                type="file"
                ref={fileInputRef} // Attached the ref here
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            Profile Picture
          </p>
        </div>

        {/* Right: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Full Name
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="rounded-none border-slate-200 focus-visible:ring-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Phone Number
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="rounded-none border-slate-200 focus-visible:ring-slate-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Email Address
            </Label>
            <Input
              value={user?.email}
              disabled
              className="rounded-none bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-slate-400" />
              <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Default Shipping Address
              </Label>
            </div>
            <Input
              value={formData.shipping_address}
              onChange={(e) =>
                setFormData({ ...formData, shipping_address: e.target.value })
              }
              placeholder="e.g. KN 25 St, Kigali, Rwanda"
              className="rounded-none border-slate-200 focus-visible:ring-slate-900"
            />
          </div>

          <Button
            type="submit"
            disabled={isUpdating}
            className="rounded-none bg-slate-900 hover:bg-black px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-bold w-full md:w-auto flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            {isUpdating ? (
              "Saving Changes..."
            ) : (
              <>
                <Save size={16} /> Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
