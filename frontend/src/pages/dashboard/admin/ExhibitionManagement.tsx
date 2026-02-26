import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ExhibitionService,
  type Exhibition,
} from "@/api/services/exhibitionService";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Globe,
  Lock,
  ExternalLink,
  Image as ImageIcon,
  Radio,
  Clock,
  Save,
  X,
  Calendar,
  Users,
  Filter,
  User,
  MoreVertical,
  AlertCircle,
  Ban,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminExhibitionsPage() {
  const navigate = useNavigate();

  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedExhibition, setSelectedExhibition] =
    useState<Exhibition | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [updating, setUpdating] = useState(false);

  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";

  useEffect(() => {
    fetchExhibitions();
  }, []);

  /** ✅ Keep local switch state in sync */
  useEffect(() => {
    if (selectedExhibition) {
      setIsPublished(selectedExhibition.is_published);
    }
  }, [selectedExhibition]);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const res = await ExhibitionService.getAdminExhibitions();
      setExhibitions(res.data);
    } catch {
      toast.error("Failed to load exhibitions");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!selectedExhibition) return;

    if (selectedExhibition.status === "ARCHIVED") {
      toast.error("Archived exhibitions cannot be modified");
      return;
    }

    const desiredState = isPublished;

    if (desiredState === selectedExhibition.is_published) {
      return;
    }

    setUpdating(true);

    const toastId = toast.loading(
      desiredState ? "Publishing exhibition..." : "Unpublishing exhibition...",
    );

    try {
      await ExhibitionService.updateStatus(
        selectedExhibition.exhibition_id,
        desiredState,
      );

      // ✅ Update list state
      setExhibitions((prev) =>
        prev.map((ex) =>
          ex.exhibition_id === selectedExhibition.exhibition_id
            ? { ...ex, is_published: desiredState }
            : ex,
        ),
      );

      // ✅ Update selectedExhibition (CRITICAL)
      setSelectedExhibition((prev) =>
        prev ? { ...prev, is_published: desiredState } : prev,
      );

      toast.success(
        desiredState ? "Exhibition is now public" : "Exhibition is now private",
        { id: toastId },
      );

      setIsSheetOpen(false);
    } catch {
      toast.error("Failed to update status", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  const openDetailsSheet = (exhibition: Exhibition) => {
    setSelectedExhibition(exhibition);
    setIsSheetOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const map: any = {
      UPCOMING: {
        icon: <Clock className="w-3 h-3" />,
        label: "Upcoming",
        className: "bg-blue-100 text-blue-700",
      },
      LIVE: {
        icon: <Radio className="w-3 h-3 animate-pulse" />,
        label: "Live",
        className: "bg-red-100 text-red-700",
      },
      ARCHIVED: {
        icon: <Ban className="w-3 h-3" />,
        label: "Archived",
        className: "bg-slate-100 text-slate-600",
      },
    };
    return map[status] ?? map.UPCOMING;
  };

  const filteredExhibitions = exhibitions.filter((ex) => {
    const matchesSearch =
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || ex.type === typeFilter;
    const matchesStatus = statusFilter === "all" || ex.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen p-8">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-end border-b pb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold">
              Exhibition Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage visibility and lifecycle
            </p>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search exhibitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="CLASSIFICATION">Classification</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExhibitions.map((ex) => {
            const badge = getStatusBadge(ex.status);

            return (
              <div
                key={ex.exhibition_id}
                className="border bg-white overflow-hidden"
              >
                <div className="relative h-40 bg-muted">
                  {ex.banner_image ? (
                    <img
                      src={
                        ex.banner_image.startsWith("http")
                          ? ex.banner_image
                          : `${baseUrl}${ex.banner_image}`
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="text-muted-foreground" />
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex gap-2">
                    <Badge>{ex.type}</Badge>
                    <Badge className={badge.className}>
                      {badge.icon}
                      {badge.label}
                    </Badge>
                  </div>

                  <div className="absolute top-2 right-2">
                    <Badge
                      className={
                        ex.is_published
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-600 text-white"
                      }
                    >
                      {ex.is_published ? (
                        <Globe size={12} />
                      ) : (
                        <Lock size={12} />
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="font-serif truncate">{ex.title}</h3>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      <Calendar size={12} />{" "}
                      {new Date(ex.start_date).toLocaleDateString()}
                    </span>
                    <span>
                      <Users size={12} /> {ex.artworks?.length ?? 0}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openDetailsSheet(ex)}
                  >
                    <Eye size={14} className="mr-1" /> Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILS SHEET */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedExhibition && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedExhibition.title}</SheetTitle>
                <SheetDescription>Manage public visibility</SheetDescription>
              </SheetHeader>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <div>
                  <Label>Public Visibility</Label>
                  <p className="text-xs text-muted-foreground">
                    Toggle public access
                  </p>
                </div>

                {selectedExhibition.status === "ARCHIVED" ? (
                  <Badge variant="outline">
                    <Ban size={12} className="mr-1" /> Locked
                  </Badge>
                ) : (
                  <Switch
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                    disabled={updating}
                  />
                )}
              </div>

              {selectedExhibition.status === "LIVE" && !isPublished && (
                <div className="mt-4 p-3 border border-amber-300 bg-amber-50 flex gap-2">
                  <AlertCircle size={16} />
                  <p className="text-xs">
                    This exhibition is LIVE but private.
                  </p>
                </div>
              )}

              <SheetFooter className="mt-6 flex gap-2">
                <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                  <X size={14} className="mr-1" /> Close
                </Button>

                {selectedExhibition.status !== "ARCHIVED" && (
                  <Button
                    onClick={handlePublishToggle}
                    disabled={
                      updating ||
                      isPublished === selectedExhibition.is_published
                    }
                    className="rounded-none flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Save size={14} className="mr-1" />
                    {updating
                      ? "Saving..."
                      : selectedExhibition.is_published
                        ? "Unpublish"
                        : "Publish"}
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
