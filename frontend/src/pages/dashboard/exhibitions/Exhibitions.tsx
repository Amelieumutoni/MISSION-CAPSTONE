import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Edit3,
  Layers,
  Check,
  Eye,
  Search,
  Lock,
  AlertCircle,
} from "lucide-react";
import {
  ExhibitionService,
  type Exhibition,
} from "@/api/services/exhibitionService";
import ArtworkService, { type Artwork } from "@/api/services/artworkService";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function ExhibitionManagement() {
  const navigate = useNavigate();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [availableArtworks, setAvailableArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [exhibitionSearch, setExhibitionSearch] = useState("");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedExhibition, setSelectedExhibition] =
    useState<Exhibition | null>(null);

  // Tracks if the currently selected exhibition is archived
  const selectedIsArchived = selectedExhibition?.status === "ARCHIVED";

  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [exRes, artRes] = await Promise.all([
        ExhibitionService.getMyExhibitions(),
        ArtworkService.getMyArtworks(),
      ]);
      setExhibitions(exRes.data);
      setAvailableArtworks(artRes.data);
    } catch (err) {
      toast.error("Failed to load gallery data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleArtwork = async (artworkId: string) => {
    if (!selectedExhibition) return;

    // Hard block — archived exhibitions cannot be curated
    if (selectedIsArchived) {
      toast.error("Archived exhibitions cannot be modified");
      return;
    }

    const isCurrentlyAssigned = selectedExhibition.artworks?.some(
      (a) => a.artwork_id === artworkId,
    );

    try {
      if (isCurrentlyAssigned) {
        const updatedIds = selectedExhibition
          .artworks!.filter((a) => a.artwork_id !== artworkId)
          .map((a) => a.artwork_id);
        await ExhibitionService.assignArtworks(
          selectedExhibition.exhibition_id,
          updatedIds,
        );
        toast.success("Artwork removed");
      } else {
        const existingIds =
          selectedExhibition.artworks?.map((a) => a.artwork_id) || [];
        await ExhibitionService.assignArtworks(
          selectedExhibition.exhibition_id,
          [...existingIds, artworkId],
        );
        toast.success("Artwork added");
      }

      fetchData();

      setSelectedExhibition((prev) => {
        if (!prev) return null;
        const newArtworks = isCurrentlyAssigned
          ? prev.artworks?.filter((a) => a.artwork_id !== artworkId)
          : [
              ...(prev.artworks || []),
              availableArtworks.find((a) => a.artwork_id === artworkId)!,
            ];
        return { ...prev, artworks: newArtworks };
      });
    } catch (err) {
      toast.error("Failed to update curation");
    }
  };

  const handleOpenCurate = (ex: Exhibition) => {
    if (ex.status === "ARCHIVED") {
      toast.error("Archived exhibitions cannot be curated");
      return;
    }
    setSelectedExhibition(ex);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (ex: Exhibition) => {
    if (ex.status === "ARCHIVED") {
      toast.error("Archived exhibitions cannot be edited");
      return;
    }
    navigate(`/dashboard/exhibitions/edit/${ex.exhibition_id}`);
  };

  const filteredArtworks = availableArtworks.filter((art) =>
    art.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredExhibitions = exhibitions.filter((ex) =>
    ex.title.toLowerCase().includes(exhibitionSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white dark:bg-transparent transition-colors duration-300 max-w-7xl mx-auto px-4 pb-16">
      <Toaster position="bottom-right" richColors theme="system" />

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-4xl font-serif text-zinc-900 dark:text-zinc-50">
            Exhibitions
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-[0.3em] mt-3">
            Management Portal / {new Date().getFullYear()}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -tranzinc-y-1/2 text-zinc-400 dark:text-zinc-500"
              size={14}
            />
            <Input
              placeholder="Search exhibitions..."
              className="pl-9 h-10 rounded-none border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 text-xs"
              value={exhibitionSearch}
              onChange={(e) => setExhibitionSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={() => navigate("/dashboard/exhibitions/new")}
            className="rounded-none px-8 py-6 uppercase text-[10px] tracking-widest font-bold bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 whitespace-nowrap"
          >
            <Plus size={16} className="mr-2" /> Create Exhibition
          </Button>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full h-40 flex items-center justify-center uppercase text-[10px] tracking-widest animate-pulse text-zinc-500 dark:text-zinc-400">
            Loading Gallery...
          </div>
        ) : filteredExhibitions.length === 0 ? (
          <div className="col-span-full py-20 border-2 border-dashed border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
            <Search size={32} className="mb-4 opacity-20" />
            <p className="text-[10px] uppercase tracking-widest font-bold">
              No exhibitions found
            </p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        ) : (
          filteredExhibitions.map((ex) => {
            const isArchived = ex.status === "ARCHIVED";
            return (
              <div
                key={ex.exhibition_id}
                className={`group border bg-white dark:bg-inherit overflow-hidden transition-all ${
                  isArchived
                    ? "border-zinc-100 dark:border-zinc-800"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                {/* Banner */}
                <div className="aspect-video relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={
                      ex.banner_image?.startsWith("http")
                        ? ex.banner_image
                        : `${baseUrl}${ex.banner_image}`
                    }
                    alt={ex.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isArchived ? "" : "group-hover:scale-105"
                    }`}
                  />

                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge
                      className={
                        ex.type === "LIVE" ? "bg-indigo-600" : "bg-violet-600"
                      }
                    >
                      {ex.type}
                    </Badge>
                    {isArchived ? (
                      <Badge className="bg-zinc-700 text-zinc-200">
                        ARCHIVED
                      </Badge>
                    ) : (
                      <Badge
                        variant={ex.is_published ? "default" : "outline"}
                        className={
                          ex.is_published
                            ? "bg-emerald-600"
                            : "bg-white/80 text-black border-none"
                        }
                      >
                        {ex.is_published ? "PUBLISHED" : "DRAFT"}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-xl truncate text-zinc-900 dark:text-zinc-100">
                      {ex.title}
                    </h3>
                    <button
                      onClick={() =>
                        navigate(`/dashboard/exhibitions/${ex.exhibition_id}`)
                      }
                      className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    {isArchived ? (
                      // Archived — both buttons replaced with a single locked notice
                      <>
                        <div className="col-span-2 flex items-center justify-center gap-2 py-2.5 border border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600">
                          <Lock size={11} />
                          <span className="text-[9px] uppercase tracking-widest font-bold">
                            Read-Only
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none text-[9px] uppercase font-bold tracking-widest border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          onClick={() => handleOpenCurate(ex)}
                        >
                          <Layers size={12} className="mr-2" /> Curate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none text-[9px] uppercase font-bold tracking-widest border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          onClick={() => handleOpenEdit(ex)}
                        >
                          <Edit3 size={12} className="mr-2" /> Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Curation Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <SheetHeader className="p-6 bg-zinc-50 dark:bg-zinc-900">
            <SheetTitle className="text-zinc-700 dark:text-white font-serif text-2xl">
              Manage Collection
            </SheetTitle>
            <SheetDescription className="text-zinc-400 text-[10px] uppercase tracking-[0.2em]">
              {selectedExhibition?.title} —{" "}
              {selectedExhibition?.artworks?.length || 0} Works Active
            </SheetDescription>

            {/* Archived warning inside sheet — replaces search with a lockout notice */}
            {selectedIsArchived ? (
              <div className="mt-4 flex items-start gap-3 p-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                <AlertCircle
                  size={15}
                  className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                />
                <p className="text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-widest font-bold leading-relaxed">
                  This exhibition is archived and cannot be modified.
                </p>
              </div>
            ) : (
              <div className="relative mt-4">
                <Search
                  className="absolute left-3 top-1/2 -tranzinc-y-1/2 text-zinc-400"
                  size={14}
                />
                <Input
                  placeholder="Search your artworks..."
                  className="pl-10 h-9 rounded-none text-xs border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </SheetHeader>

          {/*
            When archived: pointer-events-none + opacity on the list so
            nothing is clickable — belt-and-suspenders alongside the handler guard.
          */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-zinc-900 ${
              selectedIsArchived
                ? "pointer-events-none select-none opacity-40"
                : ""
            }`}
          >
            {filteredArtworks.map((art) => {
              const isAssigned = selectedExhibition?.artworks?.some(
                (a) => a.artwork_id === art.artwork_id,
              );
              return (
                <div
                  key={art.artwork_id}
                  onClick={() => handleToggleArtwork(art.artwork_id)}
                  className={`flex items-center gap-4 p-3 border transition-all ${
                    selectedIsArchived
                      ? "cursor-not-allowed border-zinc-100 dark:border-zinc-800"
                      : `cursor-pointer ${
                          isAssigned
                            ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800"
                            : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600"
                        }`
                  }`}
                >
                  <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                    <img
                      src={`${baseUrl}${art.main_image}`}
                      className="w-full h-full object-cover"
                      alt={art.title}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase truncate text-zinc-900 dark:text-zinc-100">
                      {art.title}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      ID: {art.artwork_id}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isAssigned
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    {isAssigned && <Check size={12} />}
                  </div>
                </div>
              );
            })}
            {filteredArtworks.length === 0 && (
              <p className="text-center text-zinc-400 dark:text-zinc-600 text-[10px] py-10 uppercase tracking-widest">
                No matching artworks found
              </p>
            )}
          </div>

          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
            <Button
              className="w-full rounded-none bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 uppercase text-[10px] font-bold py-6 tracking-[0.2em]"
              onClick={() => setIsSheetOpen(false)}
            >
              {selectedIsArchived ? "Close" : "Finish Curation"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
