import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, X, CheckCircle2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import ArtworkService from "@/api/services/artworkService";
import { Button } from "@/components/ui/button";

export default function CreateArtworkPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technique: "",
    materials: "",
    dimensions: "",
    creation_year: new Date().getFullYear(),
    price: "",
    stock_quantity: "1",
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast.info("Image staged for upload");
    }
  };

  const removeImage = () => {
    setMainImage(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainImage) return toast.error("Please upload a main image");

    setLoading(true);
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value.toString());
    });
    data.append("main_image", mainImage);
    // Default status for new pieces
    data.append("status", "AVAILABLE");

    try {
      await ArtworkService.createArtwork(data);

      // SUCCESS: Toast first, then navigate
      toast.success("Masterpiece published to gallery");

      // Small timeout ensures the toast registers before the component unmounts
      setTimeout(() => {
        navigate(`/dashboard/artworks`);
      }, 2000);
    } catch (error) {
      toast.error("Failed to publish artwork. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-foreground min-h-screen">
      {/* Back Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ChevronLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
          Back to Collection
        </span>
      </button>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif tracking-tight text-foreground">
            Publish Artwork
          </h1>
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            New Inventory Entry <span className="h-px w-8 bg-border"></span>
            <span className="text-emerald-500 flex items-center gap-1">
              <CheckCircle2 size={10} /> Initial Status: Available
            </span>
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-16"
      >
        {/* Left Column: Media (4/12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="group relative aspect-[3/4] border border-border bg-muted/20 overflow-hidden">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={removeImage}
                    className="bg-destructive text-white p-4 hover:scale-110 transition-transform"
                  >
                    <X size={24} />
                  </button>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/40 transition-colors">
                <Upload
                  size={40}
                  strokeWidth={1}
                  className="mb-4 text-muted-foreground"
                />
                <span className="text-[10px] uppercase font-bold tracking-widest">
                  Upload Master Image
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
          <div className="p-4 border-l-2 border-primary bg-muted/10">
            <p className="text-[10px] text-muted-foreground uppercase leading-relaxed tracking-wider">
              Guidelines: Minimum 2000px width. Preferred format .webp or .jpg
              for web optimization.
            </p>
          </div>
        </div>

        {/* Right Column: Information (7/12) */}
        <div className="lg:col-span-7 space-y-10">
          <section className="space-y-6">
            <h2 className="text-[11px] uppercase tracking-[0.4em] font-black text-muted-foreground/50 border-b border-border pb-2">
              Primary Details
            </h2>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                Artwork Title
              </label>
              <input
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border-b border-border bg-transparent py-3 focus:border-primary outline-none transition-colors text-xl font-serif italic"
                placeholder="Enter title..."
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  Technique
                </label>
                <input
                  name="technique"
                  required
                  value={formData.technique}
                  onChange={handleInputChange}
                  className="w-full border-b border-border bg-transparent py-2 focus:border-primary outline-none text-sm"
                  placeholder="e.g. Acrylic on Canvas"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  Year
                </label>
                <input
                  name="creation_year"
                  type="number"
                  value={formData.creation_year}
                  onChange={handleInputChange}
                  className="w-full border-b border-border bg-transparent py-2 focus:border-primary outline-none text-sm font-mono"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-[11px] uppercase tracking-[0.4em] font-black text-muted-foreground/50 border-b border-border pb-2">
              Financials & Stock
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  List Price ($)
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full border-b border-border bg-transparent py-2 focus:border-primary outline-none text-lg font-mono"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  Quantity
                </label>
                <input
                  name="stock_quantity"
                  type="number"
                  required
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  className="w-full border-b border-border bg-transparent py-2 focus:border-primary outline-none text-lg font-mono"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-[11px] uppercase tracking-[0.4em] font-black text-muted-foreground/50 border-b border-border pb-2">
              Narrative
            </h2>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                Description
              </label>
              <textarea
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-border bg-card/50 p-4 focus:border-primary outline-none transition-colors resize-none text-sm leading-relaxed"
                placeholder="The inspiration, the process, the soul of the piece..."
              />
            </div>
          </section>

          <Button
            disabled={loading}
            className="w-full bg-foreground text-background py-10 rounded-none uppercase tracking-[0.3em] font-black text-xs hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {loading ? "Syncing with Gallery..." : "Publish Artwork"}
          </Button>
        </div>
      </form>
    </div>
  );
}
