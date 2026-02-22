import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ExhibitionService,
  type Exhibition,
} from "@/api/services/exhibitionService";
import ArtworkService from "@/api/services/artworkService";
import { toast, Toaster } from "sonner";
import {
  Search,
  Calendar,
  Users,
  Image as ImageIcon,
  Radio,
  Clock,
  ExternalLink,
  Archive,
  Film,
  Grid,
  List,
  Filter,
  Download,
  Eye,
  User,
  MapPin,
  AlertCircle,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface Artwork {
  artwork_id: string;
  title: string;
  description?: string;
  main_image: string;
  price?: number;
  status: string;
  created_at: string;
  author?: {
    user_id: string;
    name: string;
    profile?: {
      profile_picture?: string;
      location?: string;
    };
  };
}

interface ArchivedExhibition extends Exhibition {
  archived_at?: string;
  recording_url?: string;
}

interface ArchivedArtwork extends Artwork {
  archived_at: string;
}

type ViewMode = "grid" | "list";
type ContentType = "all" | "exhibitions" | "artworks";

export default function AdminArchivedContentPage() {
  const navigate = useNavigate();
  const [exhibitions, setExhibitions] = useState<ArchivedExhibition[]>([]);
  const [artworks, setArtworks] = useState<ArchivedArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [contentType, setContentType] = useState<ContentType>("all");
  const [selectedItem, setSelectedItem] = useState<
    ArchivedExhibition | ArchivedArtwork | null
  >(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const baseUrl =
    import.meta.env.VITE_BACKEND_IMAGE_URL || "http://localhost:5000";

  useEffect(() => {
    fetchArchivedContent();
  }, []);

  const fetchArchivedContent = async () => {
    setLoading(true);
    try {
      // Fetch archived exhibitions
      const exhibitionsRes = await ExhibitionService.getAdminExhibitions();
      const archivedExhibitions = exhibitionsRes.data.filter(
        (ex: Exhibition) => ex.status === "ARCHIVED",
      );
      setExhibitions(archivedExhibitions);

      // Fetch all artworks and filter archived ones
      const artworksRes = await ArtworkService.getArtworks();
      const allArtworks = artworksRes.data || artworksRes;
      const archivedArtworks = allArtworks.filter(
        (art: Artwork) => art.status === "ARCHIVED",
      );
      setArtworks(archivedArtworks);

      toast.success(
        `Loaded ${archivedExhibitions.length} exhibitions and ${archivedArtworks.length} artworks`,
      );
    } catch (err) {
      console.error("Failed to fetch archived content:", err);
      toast.error("Failed to load archived content");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredContent = () => {
    const filteredExhibitions = exhibitions.filter((ex) => {
      const matchesSearch =
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || ex.type === typeFilter;
      return matchesSearch && matchesType;
    });

    const filteredArtworks = artworks.filter((art) => {
      const matchesSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    if (contentType === "exhibitions")
      return { exhibitions: filteredExhibitions, artworks: [] };
    if (contentType === "artworks")
      return { exhibitions: [], artworks: filteredArtworks };
    return { exhibitions: filteredExhibitions, artworks: filteredArtworks };
  };

  const { exhibitions: filteredExhibitions, artworks: filteredArtworks } =
    getFilteredContent();
  const totalItems = filteredExhibitions.length + filteredArtworks.length;

  const handleExportData = () => {
    const data = {
      exhibitions: filteredExhibitions,
      artworks: filteredArtworks,
      exportedAt: new Date().toISOString(),
      totalCount: totalItems,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `archived-content-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${totalItems} items`);
  };

  const handleViewDetails = (item: ArchivedExhibition | ArchivedArtwork) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-transparent p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { exhibitions: displayExhibitions, artworks: displayArtworks } =
    getFilteredContent();

  return (
    <div className="min-h-screen bg-white dark:bg-transparent p-8 transition-colors duration-300">
      <Toaster richColors theme="system" position="top-right" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Archive className="w-8 h-8 text-slate-400" />
              <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-50">
                Archive Management
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Browse and manage all archived exhibitions and artworks
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search archived content..."
                className="pl-10 rounded-none border-slate-200 dark:border-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X
                    size={14}
                    className="text-slate-400 hover:text-slate-600"
                  />
                </button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleExportData}
              className="rounded-none"
              disabled={totalItems === 0}
            >
              <Download size={14} className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Tabs
              value={contentType}
              onValueChange={(v) => setContentType(v as ContentType)}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
                <TabsTrigger value="all" className="rounded-none">
                  All ({totalItems})
                </TabsTrigger>
                <TabsTrigger value="exhibitions" className="rounded-none">
                  Exhibitions ({filteredExhibitions.length})
                </TabsTrigger>
                <TabsTrigger value="artworks" className="rounded-none">
                  Artworks ({filteredArtworks.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {(contentType === "all" || contentType === "exhibitions") && (
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] rounded-none border-slate-200 dark:border-slate-800">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="LIVE">Live Exhibitions</SelectItem>
                  <SelectItem value="CLASSIFICATION">Classification</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-none border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30">
                <Archive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {exhibitions.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Archived Exhibitions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30">
                <ImageIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {artworks.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Archived Artworks
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30">
                <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {totalItems}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Archived Items
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Exhibitions */}
            {displayExhibitions.map((exhibition) => (
              <Card
                key={`ex-${exhibition.exhibition_id}`}
                className="group rounded-none border-slate-200 dark:border-slate-800 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer"
                onClick={() => handleViewDetails(exhibition)}
              >
                <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {exhibition.banner_image ? (
                    <img
                      src={
                        exhibition.banner_image.startsWith("http")
                          ? exhibition.banner_image
                          : `${baseUrl}${exhibition.banner_image}`
                      }
                      alt={exhibition.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-slate-400" />
                    </div>
                  )}
                  <Badge className="absolute top-2 left-2 bg-indigo-600 rounded-none">
                    {exhibition.type}
                  </Badge>
                  <Badge className="absolute top-2 right-2 bg-slate-800 rounded-none">
                    <Archive size={10} className="mr-1" />
                    Archived
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-serif text-lg truncate mb-2">
                    {exhibition.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {exhibition.description || "No description"}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(exhibition.end_date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      {exhibition.artworks?.length || 0} works
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Artworks */}
            {displayArtworks.map((artwork) => (
              <Card
                key={`art-${artwork.artwork_id}`}
                className="group rounded-none border-slate-200 dark:border-slate-800 overflow-hidden hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer"
                onClick={() => handleViewDetails(artwork)}
              >
                <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={
                      artwork.main_image?.startsWith("http")
                        ? artwork.main_image
                        : `${baseUrl}${artwork.main_image}`
                    }
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-2 left-2 bg-amber-600 rounded-none">
                    Artwork
                  </Badge>
                  <Badge className="absolute top-2 right-2 bg-slate-800 rounded-none">
                    <Archive size={10} className="mr-1" />
                    Archived
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-serif text-lg truncate mb-2">
                    {artwork.title}
                  </h3>

                  {artwork.author && (
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-5 w-5 rounded-none">
                        <AvatarImage
                          src={artwork.author.profile?.profile_picture}
                        />
                        <AvatarFallback className="rounded-none bg-slate-200">
                          <User size={10} />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {artwork.author.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(artwork.archived_at || artwork.created_at)}
                    </div>
                    {artwork.price && (
                      <div className="font-mono font-bold">
                        ${artwork.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {/* Exhibitions List */}
            {displayExhibitions.map((exhibition) => (
              <div
                key={`ex-${exhibition.exhibition_id}`}
                className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer"
                onClick={() => handleViewDetails(exhibition)}
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                  {exhibition.banner_image ? (
                    <img
                      src={
                        exhibition.banner_image.startsWith("http")
                          ? exhibition.banner_image
                          : `${baseUrl}${exhibition.banner_image}`
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={20} className="text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-indigo-600 rounded-none text-[8px]">
                      {exhibition.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-none text-[8px]"
                    >
                      Exhibition
                    </Badge>
                  </div>
                  <h3 className="font-serif text-base truncate">
                    {exhibition.title}
                  </h3>
                </div>

                <div className="hidden md:block text-sm text-slate-500">
                  {formatDate(exhibition.end_date)}
                </div>

                <div className="hidden md:block text-sm text-slate-500">
                  {exhibition.artworks?.length || 0} artworks
                </div>

                <Button variant="ghost" size="sm" className="rounded-none">
                  <Eye size={14} />
                </Button>
              </div>
            ))}

            {/* Artworks List */}
            {displayArtworks.map((artwork) => (
              <div
                key={`art-${artwork.artwork_id}`}
                className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer"
                onClick={() => handleViewDetails(artwork)}
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                  <img
                    src={
                      artwork.main_image?.startsWith("http")
                        ? artwork.main_image
                        : `${baseUrl}${artwork.main_image}`
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-amber-600 rounded-none text-[8px]">
                      Artwork
                    </Badge>
                  </div>
                  <h3 className="font-serif text-base truncate">
                    {artwork.title}
                  </h3>
                  {artwork.author && (
                    <p className="text-xs text-slate-500">
                      by {artwork.author.name}
                    </p>
                  )}
                </div>

                <div className="hidden md:block text-sm text-slate-500">
                  {formatDate(artwork.archived_at || artwork.created_at)}
                </div>

                <div className="hidden md:block text-sm font-mono">
                  {artwork.price ? `$${artwork.price.toLocaleString()}` : "-"}
                </div>

                <Button variant="ghost" size="sm" className="rounded-none">
                  <Eye size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {totalItems === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600">
            <Archive className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">
              No archived content found
            </p>
            <p className="text-sm">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Archived exhibitions and artworks will appear here"}
            </p>
          </div>
        )}

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl rounded-none">
            {selectedItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-serif">
                    {"title" in selectedItem ? selectedItem.title : "Details"}
                  </DialogTitle>
                  <DialogDescription>
                    {"type" in selectedItem
                      ? "Archived Exhibition"
                      : "Archived Artwork"}
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-6 p-1">
                    {/* Image */}
                    <div className="h-48 w-full bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
                      <img
                        src={
                          "banner_image" in selectedItem
                            ? selectedItem.banner_image?.startsWith("http")
                              ? selectedItem.banner_image
                              : `${baseUrl}${selectedItem.banner_image}`
                            : selectedItem.main_image?.startsWith("http")
                              ? selectedItem.main_image
                              : `${baseUrl}${selectedItem.main_image}`
                        }
                        alt={selectedItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                          Status
                        </p>
                        <Badge className="bg-slate-800 rounded-none">
                          ARCHIVED
                        </Badge>
                      </div>
                      {"type" in selectedItem && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                            Type
                          </p>
                          <Badge className="bg-indigo-600 rounded-none">
                            {selectedItem.type}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {"description" in selectedItem &&
                      selectedItem.description && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                            Description
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {selectedItem.description}
                          </p>
                        </div>
                      )}

                    {/* Author Info */}
                    {"author" in selectedItem && selectedItem.author && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                          Artist
                        </p>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-slate-800">
                          <Avatar className="h-10 w-10 rounded-none">
                            <AvatarImage
                              src={selectedItem.author.profile?.profile_picture}
                            />
                            <AvatarFallback className="rounded-none bg-slate-200">
                              <User size={16} />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {selectedItem.author.name}
                            </p>
                            {selectedItem.author.profile?.location && (
                              <p className="text-xs text-slate-500">
                                {selectedItem.author.profile.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      {"start_date" in selectedItem && (
                        <>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                              Start Date
                            </p>
                            <p className="text-sm font-medium">
                              {formatDate(selectedItem.start_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                              End Date
                            </p>
                            <p className="text-sm font-medium">
                              {formatDate(selectedItem.end_date)}
                            </p>
                          </div>
                        </>
                      )}
                      {"created_at" in selectedItem && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                            Created
                          </p>
                          <p className="text-sm font-medium">
                            {formatDate(selectedItem.created_at)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Price for Artworks */}
                    {"price" in selectedItem && selectedItem.price && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                          Original Price
                        </p>
                        <p className="text-lg font-mono font-bold">
                          ${selectedItem.price.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* Artworks List for Exhibitions */}
                    {"artworks" in selectedItem &&
                      selectedItem.artworks &&
                      selectedItem.artworks.length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                            Artworks in Exhibition (
                            {selectedItem.artworks.length})
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {selectedItem.artworks.slice(0, 3).map((art) => (
                              <div
                                key={art.artwork_id}
                                className="aspect-square bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                              >
                                <img
                                  src={
                                    art.main_image?.startsWith("http")
                                      ? art.main_image
                                      : `${baseUrl}${art.main_image}`
                                  }
                                  alt={art.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Live Details for Exhibitions */}
                    {"live_details" in selectedItem &&
                      selectedItem.live_details && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                            Stream Recording
                          </p>
                          <Badge className="bg-slate-200 text-slate-700 rounded-none">
                            {selectedItem.live_details.stream_status}
                          </Badge>
                          {selectedItem.live_details.current_viewers > 0 && (
                            <p className="text-sm mt-2">
                              Peak viewers:{" "}
                              {selectedItem.live_details.current_viewers}
                            </p>
                          )}
                        </div>
                      )}
                  </div>
                </ScrollArea>

                <Separator className="my-4" />

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDetailsOpen(false)}
                    className="rounded-none"
                  >
                    Close
                  </Button>
                  {"stream_link" in selectedItem &&
                    selectedItem.stream_link && (
                      <Button
                        variant="default"
                        onClick={() =>
                          window.open(selectedItem.stream_link, "_blank")
                        }
                        className="rounded-none bg-indigo-600 hover:bg-indigo-700"
                      >
                        <ExternalLink size={14} className="mr-2" />
                        View Recording
                      </Button>
                    )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
