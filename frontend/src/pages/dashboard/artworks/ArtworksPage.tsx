import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Edit3,
  Archive,
  Lock,
  Upload,
  ImageOff,
  LayoutGrid,
  ArchiveRestore,
} from "lucide-react";
import ArtworkService from "@/api/services/artworkService";
import { useAuth } from "@/context/AuthContext";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { UniversalDrawer } from "@/components/dashboard/UpdateModel";

type FieldErrors = Partial<
  Record<"title" | "price" | "stock_quantity" | "technique" | "image", string>
>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[10px] text-destructive mt-1 font-bold uppercase">
      {message}
    </p>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-border p-4 bg-card animate-pulse">
      <div className="aspect-square bg-muted mb-4" />
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/3 mb-4" />
    </div>
  );
}

export default function ArtworksManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";

  // States
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Derived Admin Status
  const isAdmin = useMemo(() => user?.role === "ADMIN", [user]);

  // Fetch artworks
  const fetchArtworks = useCallback(async () => {
    // Only proceed if auth is finished and we have a user role
    if (authLoading || !user?.role) return;

    setLoading(true);
    try {
      // Use the isAdmin memo to decide which API to hit
      const response = isAdmin
        ? await ArtworkService.getArtworks()
        : await ArtworkService.getMyArtworks();

      const data = Array.isArray(response) ? response : response.data || [];
      setArtworks(data);
    } catch (error: any) {
      console.error("Fetch error:", error);
      // Only toast error if it's not a common auth race condition
      if (error.response?.status !== 403) {
        toast.error("Failed to load collection");
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin, authLoading, user?.role]);

  // Run fetch only when user is ready
  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  // Filter by status
  const filteredArtworks = useMemo(
    () =>
      artworks.filter((w) =>
        activeTab === "ACTIVE"
          ? w.status !== "ARCHIVED"
          : w.status === "ARCHIVED",
      ),
    [artworks, activeTab],
  );

  // --- Actions ---
  const handleArchive = async (id: number) => {
    try {
      await ArtworkService.archiveArtwork(id);
      toast.success("Moved to Archive");
      fetchArtworks();
    } catch {
      toast.error("Archive failed");
    }
  };

  const handleEditClick = (work: any) => {
    if (isAdmin) return; // Prevent drawer for admins
    setSelectedArtwork(work);

    setFormData({
      title: work.title || "",
      price: work.price || "",
      stock_quantity: work.stock_quantity || "",
      technique: work.technique || "",
    });

    const fullImageUrl = work.main_image?.startsWith("http")
      ? work.main_image
      : `${baseUrl}${work.main_image}`;

    setImagePreview(fullImageUrl);
    setImageFile(null);
    setFieldErrors({});
    setIsDrawerOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArtwork) return;

    setUpdating(true);
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value != null) submitData.append(key, value.toString());
    });
    if (imageFile) submitData.append("main_image", imageFile);

    try {
      await ArtworkService.updateArtwork(
        selectedArtwork.artwork_id,
        submitData,
      );
      setIsDrawerOpen(false);
      toast.success("Artwork updated successfully");
      fetchArtworks();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      toast.error("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  // Cleanup image preview
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // --- Loading / Auth Guard UI ---
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen font-serif uppercase tracking-widest text-sm">
        Authenticating...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen font-serif">
        Access Denied
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-16">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 py-4">
        <div>
          <h1 className="text-4xl font-serif text-foreground">
            {isAdmin ? "Global Inventory" : "My Artworks"}
          </h1>
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] mt-3">
            {isAdmin ? "System Administration" : "Portfolio Management"} /{" "}
            {activeTab}
          </p>
        </div>
        {!isAdmin && (
          <Button
            onClick={() => navigate("/dashboard/artworks/new")}
            className="rounded-none px-8 py-6 uppercase text-[10px] tracking-widest font-bold bg-slate-900 dark:bg-slate-400 hover:bg-black dark:hover:bg-slate-500 text-white"
          >
            <Plus size={16} className="mr-2" /> Add Piece
          </Button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex gap-10 border-b border-border mb-10">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`pb-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-black transition-all ${
            activeTab === "ACTIVE"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground/60"
          }`}
        >
          <LayoutGrid size={14} />
          {isAdmin ? "Active Inventory" : "Active Collection"} (
          {artworks.filter((w) => w.status !== "ARCHIVED").length})
        </button>
        <button
          onClick={() => setActiveTab("ARCHIVED")}
          className={`pb-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-black transition-all ${
            activeTab === "ARCHIVED"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground/60"
          }`}
        >
          <ArchiveRestore size={14} />
          {isAdmin ? "Global Archive" : "Vault"} (
          {artworks.filter((w) => w.status === "ARCHIVED").length})
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredArtworks.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-dashed border-border">
            <ImageOff
              size={40}
              className="mx-auto text-muted-foreground mb-4"
            />
            <p className="text-muted-foreground uppercase text-[10px] tracking-widest">
              No items found
            </p>
          </div>
        ) : (
          filteredArtworks.map((work) => (
            <div
              key={work.artwork_id}
              className="group border border-border p-4 bg transition-all hover:border-slate-300 dark:hover:border-slate-600"
            >
              <div className="aspect-square overflow-hidden bg-muted mb-4 relative">
                <img
                  src={
                    work.main_image?.startsWith("http")
                      ? work.main_image
                      : `${baseUrl}${work.main_image}`
                  }
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={work.title}
                />
                <div
                  className={`absolute top-2 left-2 px-2 py-1 text-[8px] font-bold uppercase ${
                    work.status === "AVAILABLE"
                      ? "bg-emerald-500 text-white"
                      : "bg-red-400 text-white"
                  }`}
                >
                  {work.status}
                </div>
              </div>
              <div className="space-y-1 mb-4">
                <h3 className="font-serif text-lg truncate">{work.title}</h3>
                {isAdmin && (
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">
                    Artist: {work.author?.name || "Unknown"}
                  </p>
                )}
                <p className="font-mono text-xs font-bold">
                  ${parseFloat(work.price).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 border-t border-border mt-4 pt-4">
                <button
                  onClick={() => handleEditClick(work)}
                  disabled={activeTab === "ARCHIVED" || isAdmin}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-[9px] uppercase font-bold transition-colors ${
                    activeTab === "ARCHIVED" || isAdmin
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {activeTab === "ARCHIVED" || isAdmin ? (
                    <Lock size={12} />
                  ) : (
                    <Edit3 size={12} />
                  )}
                  {isAdmin
                    ? "System Lock"
                    : activeTab === "ARCHIVED"
                      ? "Vaulted"
                      : "Edit"}
                </button>
                {activeTab === "ACTIVE" && !isAdmin && (
                  <button
                    onClick={() => handleArchive(work.artwork_id)}
                    className="px-3 py-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Archive size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Drawer */}
      {!isAdmin && selectedArtwork && (
        <UniversalDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Edit Artwork"
          onSubmit={handleUpdate}
          loading={updating}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                Imagery
              </label>
              <div className="relative aspect-video border border-dashed border-border overflow-hidden bg-muted/20 group">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="w-full h-full object-contain"
                    alt="Preview"
                  />
                )}
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer text-white transition-opacity">
                  <Upload size={20} />
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
                </label>
              </div>
              <FieldError message={fieldErrors.image} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                Title
              </label>
              <input
                className="w-full bg-transparent border-b border-border py-2 outline-none"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <FieldError message={fieldErrors.title} />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  Price
                </label>
                <input
                  type="number"
                  className="w-full bg-transparent border-b border-border py-2 outline-none"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
                <FieldError message={fieldErrors.price} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  Stock
                </label>
                <input
                  type="number"
                  className="w-full bg-transparent border-b border-border py-2 outline-none"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_quantity: e.target.value })
                  }
                />
                <FieldError message={fieldErrors.stock_quantity} />
              </div>
            </div>
          </div>
        </UniversalDrawer>
      )}
    </div>
  );
}
