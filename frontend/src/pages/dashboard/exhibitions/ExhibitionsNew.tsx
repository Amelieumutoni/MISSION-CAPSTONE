import React, { useState } from "react";
import { ExhibitionService } from "@/api/services/exhibitionService";
import { toast } from "sonner";
import {
  Camera,
  LayoutGrid,
  Calendar,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2,
  ChevronRight,
} from "lucide-react";

// UI Components (Assumed from your setup)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateExhibitionPage() {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"CLASSIFICATION" | "LIVE">("CLASSIFICATION");
  const [preview, setPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("type", type);

    try {
      await ExhibitionService.createExhibition(formData);
      toast.success("Exhibition Created", {
        description: "Your exhibition has been saved as a draft.",
      });
      // Redirect or Reset here
    } catch (error: any) {
      toast.error("Creation Failed", {
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-12 font-sans">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-slate-900">
          New Exhibition
        </h1>
        <p className="text-slate-500 mt-2">
          Curate your masterpieces for the Rwandan art community.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Side: Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Exhibition Type
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType("CLASSIFICATION")}
                className={`p-6 border flex flex-col items-center gap-3 transition-all ${
                  type === "CLASSIFICATION"
                    ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                    : "border-slate-200 opacity-60"
                }`}
              >
                <LayoutGrid className="w-6 h-6" />
                <span className="text-sm font-bold uppercase tracking-tighter">
                  Classification
                </span>
              </button>
              <button
                type="button"
                onClick={() => setType("LIVE")}
                className={`p-6 border flex flex-col items-center gap-3 transition-all ${
                  type === "LIVE"
                    ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                    : "border-slate-200 opacity-60"
                }`}
              >
                <Camera className="w-6 h-6" />
                <span className="text-sm font-bold uppercase tracking-tighter">
                  Live Stream
                </span>
              </button>
            </div>
          </section>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-xs font-bold uppercase tracking-widest"
              >
                Exhibition Title
              </Label>
              <Input
                name="title"
                id="title"
                placeholder="e.g., Echoes of Imigongo"
                required
                className="rounded-none border-slate-200 focus-visible:ring-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-xs font-bold uppercase tracking-widest"
              >
                Description
              </Label>
              <Textarea
                name="description"
                id="description"
                placeholder="Describe the story behind this collection..."
                className="min-h-[150px] rounded-none border-slate-200"
              />
            </div>
          </div>

          {type === "LIVE" && (
            <div className="p-6 bg-slate-50 border border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-slate-900">
                <LinkIcon className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Stream Configuration
                </h3>
              </div>
              <Input
                name="stream_link"
                placeholder="Enter your internal PeerJS/Socket Room ID"
                required
                className="bg-white rounded-none"
              />
              <p className="text-[10px] text-slate-400 uppercase tracking-tight">
                This ID will be used to initialize the signaling server.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Media & Dates */}
        <div className="space-y-8">
          <Card className="rounded-none border-slate-200 shadow-none overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[4/5] relative bg-slate-100 group">
                {preview ? (
                  <img
                    src={preview}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-[10px] uppercase font-bold tracking-widest">
                      Upload Banner Image
                    </p>
                  </div>
                )}
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">
                    Select Image
                  </span>
                  <input
                    type="file"
                    name="banner"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 border-t border-slate-100 pt-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                <Calendar className="w-3 h-3" /> Start Date
              </Label>
              <Input
                type="datetime-local"
                name="start_date"
                required
                className="rounded-none border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                <Calendar className="w-3 h-3" /> End Date
              </Label>
              <Input
                type="datetime-local"
                name="end_date"
                required
                className="rounded-none border-slate-200"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white py-8 rounded-none flex items-center justify-center gap-3 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Create Exhibition
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
