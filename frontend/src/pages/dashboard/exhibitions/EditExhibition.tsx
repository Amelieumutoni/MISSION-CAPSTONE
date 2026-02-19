import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Upload, Loader2, Calendar } from "lucide-react";
import { ExhibitionService } from "@/api/services/exhibitionService";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ExhibitionType = "CLASSIFICATION" | "LIVE";

export default function ExhibitionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "CLASSIFICATION" as ExhibitionType,
    stream_link: "",
    start_date: "",
    end_date: "",
    is_published: false,
  });

  const baseUrl =
    import.meta.env.VITE_BACKEND_IMAGE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchEx = async () => {
      try {
        const res = await ExhibitionService.getExhibitionByIdByMe(id!);
        const ex = res.data;
        setForm({
          title: ex.title || "",
          description: ex.description || "",
          type: ex.type || "CLASSIFICATION",
          stream_link: ex.stream_link || "",
          start_date: ex.start_date?.slice(0, 10) || "",
          end_date: ex.end_date?.slice(0, 10) || "",
          is_published: ex.is_published || false,
        });
        if (ex.banner_image) {
          setBannerPreview(
            ex.banner_image.startsWith("http")
              ? ex.banner_image
              : `${baseUrl}${ex.banner_image}`,
          );
        }
      } catch (err) {
        toast.error("Failed to load exhibition");
        navigate("/dashboard/exhibitions");
      } finally {
        setLoading(false);
      }
    };
    fetchEx();
  }, [id, navigate]);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("type", form.type);
      formData.append("stream_link", form.stream_link);
      formData.append("start_date", form.start_date);
      formData.append("end_date", form.end_date);
      formData.append("is_published", String(form.is_published));
      if (bannerFile) formData.append("banner_image", bannerFile);

      await ExhibitionService.updateExhibition(id!, formData);
      toast.success("Exhibition updated successfully");
      navigate(`/dashboard/exhibitions/${id}`);
    } catch (err) {
      toast.error("Failed to update exhibition");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-serif tracking-widest animate-pulse text-slate-900 dark:text-slate-100">
        LOADING EXHIBITION...
      </div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-transparent transition-colors duration-300 pb-20">
      <Toaster richColors theme="system" />

      {/* Top Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(`/dashboard/exhibitions/${id}`)}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Exhibition
        </button>
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          Edit Mode
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Page Title */}
        <div className="mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-4xl font-serif text-slate-900 dark:text-slate-50">
            Edit Exhibition
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-[0.3em] mt-3">
            Update your exhibition details below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Banner Upload */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400">
              Banner Image
            </label>
            <div
              className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer group"
              onClick={() => document.getElementById("banner-upload")?.click()}
            >
              {bannerPreview ? (
                <>
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center">
                      <Upload size={24} className="mx-auto mb-2" />
                      <p className="text-[10px] uppercase tracking-widest">
                        Change Banner
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-600">
                  <div className="text-center">
                    <Upload size={24} className="mx-auto mb-2" />
                    <p className="text-[10px] uppercase tracking-widest">
                      Upload Banner
                    </p>
                  </div>
                </div>
              )}
            </div>
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400">
                  Title
                </label>
                <Input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Exhibition title..."
                  className="rounded-none border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 h-11"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this exhibition..."
                  rows={5}
                  className="rounded-none border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 resize-none"
                />
              </div>

              {/* Stream Link — only for LIVE */}
              {form.type === "LIVE" && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400">
                    Stream Link
                  </label>
                  <Input
                    name="stream_link"
                    value={form.stream_link}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="rounded-none border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 h-11 font-mono text-sm"
                  />
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Exhibition Type */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400">
                  Exhibition Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["CLASSIFICATION", "LIVE"] as ExhibitionType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                      className={`py-3 text-[10px] uppercase tracking-widest font-bold border transition-all ${
                        form.type === t
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                          : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates — only for LIVE */}
              {form.type === "LIVE" && (
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400">
                    Duration
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Start
                      </p>
                      <div className="relative">
                        <Calendar
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <Input
                          type="date"
                          name="start_date"
                          value={form.start_date}
                          onChange={handleChange}
                          className="pl-9 rounded-none border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 h-11 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        End
                      </p>
                      <div className="relative">
                        <Calendar
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <Input
                          type="date"
                          name="end_date"
                          value={form.end_date}
                          onChange={handleChange}
                          className="pl-9 rounded-none border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 h-11 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Visibility */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ label: "Draft", value: false }].map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          is_published: opt.value,
                        }))
                      }
                      className={`py-3 text-[10px] uppercase tracking-widest font-bold border transition-all ${
                        form.is_published === opt.value
                          ? opt.value
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                          : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 italic">
                  Published exhibitions are visible to the public.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/exhibitions/${id}`)}
              className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-none px-12 py-6 uppercase text-[10px] tracking-widest font-bold bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
