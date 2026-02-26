import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Upload,
  Loader2,
  Calendar,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";
import { ExhibitionService } from "@/api/services/exhibitionService";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ExhibitionType = "CLASSIFICATION" | "LIVE";

const generateUniqueStreamLink = (exhibitionId: string) => {
  const baseUrl = import.meta.env.FRONTEND_URL || window.location.origin;
  return `${baseUrl}/exhibitions/${exhibitionId}/watch`;
};

export default function ExhibitionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isArchived, setIsArchived] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "CLASSIFICATION" as ExhibitionType,
    stream_link: "",
    start_date: "",
    end_date: "",
    is_published: false,
  });

  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";
  const minDateTime = new Date().toISOString().slice(0, 16);

  useEffect(() => {
    const fetchEx = async () => {
      try {
        const res = await ExhibitionService.getExhibitionByIdByMe(id!);
        const ex = res.data;

        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          const d = new Date(dateString);
          const offset = d.getTimezoneOffset() * 60000;
          const localISOTime = new Date(d - offset).toISOString().slice(0, 16);
          return localISOTime;
        };

        const initialState = {
          title: ex.title || "",
          description: ex.description || "",
          type: ex.type || "CLASSIFICATION",
          stream_link: ex.stream_link || "",
          start_date: formatDateForInput(ex.start_date),
          end_date: formatDateForInput(ex.end_date),
          is_published: ex.is_published || false,
        };

        setForm(initialState);
        setIsArchived(ex.status === "ARCHIVED");
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

  useEffect(() => {
    if (form.type === "LIVE" && !form.stream_link) {
      setForm((prev) => ({
        ...prev,
        stream_link: generateUniqueStreamLink(id!),
      }));
    }
  }, [form.type]);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isArchived) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (isArchived) return;
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegenerate = () => {
    if (isArchived) return;
    setForm((prev) => ({
      ...prev,
      stream_link: generateUniqueStreamLink(id!),
    }));
    toast.success("New stream link generated");
  };

  const handleCopyLink = async () => {
    if (!form.stream_link) return;
    await navigator.clipboard.writeText(form.stream_link);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isArchived) return;

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
        <div className="mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-4xl font-serif text-slate-900 dark:text-slate-50">
            Edit Exhibition
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-[0.3em] mt-3">
            Update your exhibition details below
          </p>
        </div>

        {/* Archived banner — outside the form so it's always visible and unaffected */}
        {isArchived && (
          <div className="flex items-start gap-3 p-4 mb-8 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
            <AlertCircle
              size={18}
              className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                Exhibition Archived
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                This exhibition has ended and can no longer be edited. All
                fields are read-only.
              </p>
            </div>
          </div>
        )}

        {/*
          Outer wrapper: when archived, pointer-events-none blocks ALL clicks
          (buttons, inputs, file pickers, everything). select-none prevents
          accidental text selection giving the illusion of interactivity.
          The opacity dims the form so it visually reads as disabled.
        */}
        <div
          className={
            isArchived
              ? "pointer-events-none select-none opacity-50"
              : undefined
          }
        >
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Banner Upload */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400">
                Banner Image
              </label>
              <div
                className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden group"
                // no onClick when archived — pointer-events-none on parent handles it
                onClick={() =>
                  !isArchived &&
                  document.getElementById("banner-upload")?.click()
                }
                style={{ cursor: isArchived ? "default" : "pointer" }}
              >
                {bannerPreview ? (
                  <>
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {!isArchived && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center">
                          <Upload size={24} className="mx-auto mb-2" />
                          <p className="text-[10px] uppercase tracking-widest">
                            Change Banner
                          </p>
                        </div>
                      </div>
                    )}
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
                disabled={isArchived}
                onChange={handleBannerChange}
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column */}
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400">
                    Title
                  </label>
                  <Input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    disabled={isArchived}
                    readOnly={isArchived}
                    placeholder="Exhibition title..."
                    className="rounded-none border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400">
                    Description
                  </label>
                  <Textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    disabled={isArchived}
                    readOnly={isArchived}
                    placeholder="Describe this exhibition..."
                    rows={5}
                    className="rounded-none border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 resize-none"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Exhibition Type */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400">
                    Exhibition Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["CLASSIFICATION", "LIVE"] as ExhibitionType[]).map(
                      (t) => (
                        <button
                          key={t}
                          type="button"
                          disabled={isArchived}
                          onClick={() =>
                            !isArchived &&
                            setForm((prev) => ({ ...prev, type: t }))
                          }
                          className={`py-3 text-[10px] uppercase tracking-widest font-bold border transition-all ${
                            form.type === t
                              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                              : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {t}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Visibility */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400">
                    Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Published", value: true },
                      { label: "Draft", value: false },
                    ].map((opt) => (
                      <button
                        key={String(opt.value)}
                        type="button"
                        disabled={isArchived}
                        onClick={() =>
                          !isArchived &&
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
                            : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
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

            {/* LIVE Config Panel */}
            {form.type === "LIVE" && (
              <div className="p-8 border border-indigo-500/20 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.03] space-y-8">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">
                    Live Event Configuration
                  </h4>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <Input
                        type="datetime-local"
                        name="start_date"
                        value={form.start_date}
                        min={minDateTime}
                        onChange={handleChange}
                        disabled={isArchived}
                        readOnly={isArchived}
                        className="pl-9 rounded-none border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 h-11 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                      End Date
                    </label>
                    <div className="relative">
                      <Calendar
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <Input
                        type="datetime-local"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                        disabled={isArchived}
                        readOnly={isArchived}
                        min={
                          form.start_date ||
                          new Date().toISOString().slice(0, 16)
                        }
                        className="pl-9 rounded-none border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 h-11 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Stream Link — copy still works when archived, regenerate doesn't */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                      Public Stream Link
                    </label>
                    {!isArchived && (
                      <button
                        type="button"
                        onClick={handleRegenerate}
                        className="text-[9px] font-bold text-indigo-500 flex items-center gap-1 hover:underline uppercase tracking-widest"
                      >
                        <RefreshCw size={10} /> Regenerate
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-slate-700 p-3">
                    <LinkIcon
                      size={14}
                      className="text-slate-400 flex-shrink-0"
                    />
                    <code className="text-xs font-mono flex-1 text-slate-700 dark:text-slate-300 truncate">
                      {form.stream_link}
                    </code>
                    {/*
                      Copy button is intentionally OUTSIDE pointer-events-none
                      because copying the link is a read-only action that's
                      still useful even on an archived exhibition.
                      We re-enable pointer events just for this button.
                    */}
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      style={{ pointerEvents: "auto" }}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex-shrink-0"
                      title="Copy link"
                    >
                      {copied ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 italic">
                    Share this link with your audience before going live.
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800">
              {/* Cancel re-enables pointer events — navigation is always allowed */}
              <button
                type="button"
                style={{ pointerEvents: "auto" }}
                onClick={() => navigate(`/dashboard/exhibitions/${id}`)}
                className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={saving || isArchived}
                className="rounded-none px-12 py-6 uppercase text-[10px] tracking-widest font-bold bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
