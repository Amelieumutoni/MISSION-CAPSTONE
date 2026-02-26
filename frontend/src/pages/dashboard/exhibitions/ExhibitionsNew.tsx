import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  Upload,
  Video,
  ImageIcon,
  Link as LinkIcon,
  RefreshCw,
  Globe,
} from "lucide-react";
import { ExhibitionService } from "@/api/services/exhibitionService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Utility for public stream link generation
const generateUniqueStreamLink = () => {
  const code = Math.random().toString(36).substring(2, 12);
  return `http://localhost:5173/dashboard/exhibitions/${code}/live`;
};

export default function NewExhibition() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form States
  const [type, setType] = useState<"CLASSIFICATION" | "LIVE">("CLASSIFICATION");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    stream_link: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Sync stream link when type becomes LIVE
  useEffect(() => {
    if (type === "LIVE" && !formData.stream_link) {
      setFormData((prev) => ({
        ...prev,
        stream_link: generateUniqueStreamLink(),
      }));
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("type", type);

    // Only append dates/link if it's a Live Event
    if (type === "LIVE") {
      fd.append("start_date", formData.start_date);
      fd.append("end_date", formData.end_date);
      fd.append("stream_link", formData.stream_link);
    }

    if (imageFile) fd.append("banner", imageFile);

    try {
      await ExhibitionService.createExhibition(fd);
      toast.success("Exhibition published successfully");
      navigate("/dashboard/exhibitions");
    } catch (err) {
      toast.error("Failed to publish exhibition");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Navigation Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ChevronLeft size={14} /> Back to Gallery
      </button>

      <header className="mb-12">
        <h1 className="text-4xl font-serif mb-2">New Exhibition</h1>
        <p className="text-muted-foreground text-[10px] uppercase tracking-[0.2em]">
          Define your showcase parameters
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* 1. Banner Upload - Large Visual Focus */}
        <section className="space-y-4">
          <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
            Cover Banner (High Resolution)
          </label>
          <div className="relative aspect-[21/9] border border-dashed border-border overflow-hidden bg-muted/20 group transition-all hover:border-slate-400">
            {imagePreview ? (
              <img
                src={imagePreview}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Upload size={24} className="mb-2 opacity-50" />
                <span className="text-[10px] uppercase tracking-tighter">
                  Click to upload banner
                </span>
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setImageFile(e.target.files[0]);
                    setImagePreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />
              <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                Change Image
              </span>
            </label>
          </div>
        </section>

        {/* 2. Basic Info */}
        <div className="grid md:grid-cols-2 gap-12">
          <section className="space-y-8">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                Title
              </label>
              <input
                required
                className="w-full bg-transparent border-b border-border py-3 outline-none text-xl font-serif focus:border-primary transition-colors"
                placeholder="Exhibition Name..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                Exhibition Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setType("CLASSIFICATION")}
                  className={`flex-1 p-4 border flex flex-col items-center gap-2 transition-all ${type === "CLASSIFICATION" ? "border-primary bg-primary/5" : "border-border text-muted-foreground"}`}
                >
                  <ImageIcon size={20} />
                  <span className="text-[9px] font-bold uppercase">
                    Classification
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setType("LIVE")}
                  className={`flex-1 p-4 border flex flex-col items-center gap-2 transition-all ${type === "LIVE" ? "border-indigo-500 bg-indigo-500/5" : "border-border text-muted-foreground"}`}
                >
                  <Video size={20} />
                  <span className="text-[9px] font-bold uppercase">
                    Live Event
                  </span>
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                Description
              </label>
              <textarea
                rows={4}
                className="w-full bg-transparent border border-border p-4 outline-none text-sm focus:border-primary transition-colors resize-none"
                placeholder="Describe the concept of this exhibition..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </section>
        </div>

        {/* 3. Conditional Fields: Live Only */}
        {type === "LIVE" && (
          <div className="p-8 border border-indigo-500/20 bg-indigo-500/[0.02] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-8">
              <Globe size={14} className="text-indigo-500" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
                Live Event Configuration
              </h4>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-8">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full bg-transparent border-b border-border py-2 outline-none"
                  value={formData.start_date}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full bg-transparent border-b border-border py-2 outline-none"
                  value={formData.end_date}
                  min={
                    formData.start_date || new Date().toISOString().slice(0, 16)
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  Public Stream Link
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      stream_link: generateUniqueStreamLink(),
                    })
                  }
                  className="text-[9px] font-bold text-indigo-500 flex items-center gap-1 hover:underline"
                >
                  <RefreshCw size={10} /> REGENERATE
                </button>
              </div>
              <div className="flex w-10 items-center gap-3 bg-white dark:bg-black/20 border border-border p-3">
                <LinkIcon size={14} className="text-muted-foreground" />
                <code className="text-xs font-mono flex-1">
                  {formData.stream_link}
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-12 border-t border-border flex justify-end gap-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-[10px] uppercase font-black tracking-widest hover:text-red-500 transition-colors"
          >
            Discard
          </button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-none px-12 py-7 uppercase text-[10px] tracking-widest font-black bg-slate-900 text-white hover:bg-black"
          >
            {loading ? "Processing..." : "Publish Exhibition"}
          </Button>
        </div>
      </form>
    </div>
  );
}
