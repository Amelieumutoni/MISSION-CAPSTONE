import React, { useEffect, useState } from "react";
import AdminService, { type UserProfile } from "@/api/services/adminServices";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Search,
  User,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "sonner";

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const IMAGE_BASE_URL =
    import.meta.env.BACKEND_IMAGE_URL || "http://localhost:5000";

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getAllArtists();
      setArtists(res.data);
    } catch (err) {
      toast.error("Failed to synchronize artist records.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    const toastId = toast.loading(`Updating artist to ${status}...`);
    try {
      await AdminService.updateArtistStatus(id, status);
      toast.success(`Account status updated successfully`, {
        id: toastId,
        description: `Artist is now ${status.toLowerCase()}.`,
      });
      fetchArtists();
    } catch (err) {
      toast.error("Action failed", {
        id: toastId,
        description: "Please check your permissions or connection.",
      });
    }
  };

  const filtered = artists.filter((a) =>
    a.name.toLowerCase().includes(filter.toLowerCase()),
  );
  console.log(filtered);
  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-6 bg-white dark:bg-transparent transition-colors duration-300">
      <Toaster duration={3000} richColors theme="system" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-50">
            Artist Verification
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Curate the community of creators in Rwanda.
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search by name..."
            className="pl-10 rounded-none border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-slate-400"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((artist) => (
          <div
            key={artist.user_id}
            className="group border border-slate-200 dark:border-slate-800 p-6 space-y-4 hover:border-slate-400 dark:hover:border-slate-600 transition-all bg-white dark:bg-inherit flex flex-col"
          >
            <div className="flex justify-between items-start">
              <div className="h-16 w-16 rounded-full border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800 relative">
                {artist.profile?.profile_picture ? (
                  <img
                    src={`${IMAGE_BASE_URL}${artist.profile?.profile_picture}`}
                    alt={artist.name}
                    className="h-full w-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://ui-avatars.com/api/?background=random&name=" +
                        artist.name;
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <User className="text-slate-300 dark:text-slate-600 w-8 h-8" />
                  </div>
                )}
              </div>
              <StatusBadge status={artist.status} />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                {artist.name}
                <ExternalLink className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-slate-200 cursor-pointer" />
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                {artist.email}
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-400 dark:text-slate-500">
                <MapPin className="w-3 h-3" />
                {artist.profile?.location || "Location not set"}
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 italic border-l-2 border-slate-100 dark:border-slate-800 pl-3">
              "{artist.profile?.bio || "No biography provided yet."}"
            </p>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-none border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={() => handleStatusUpdate(artist.user_id, "ACTIVE")}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-none border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => handleStatusUpdate(artist.user_id, "INACTIVE")}
              >
                Restrict
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600">
          No artists found matching your criteria.
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    ACTIVE: {
      icon: <CheckCircle className="w-3 h-3" />,
      class:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50",
    },
    PENDING: {
      icon: <Clock className="w-3 h-3" />,
      class:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    },
    INACTIVE: {
      icon: <XCircle className="w-3 h-3" />,
      class:
        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
    },
  };
  const config = configs[status] || configs.PENDING;
  return (
    <span
      className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-sm ${config.class}`}
    >
      {config.icon} {status}
    </span>
  );
}
