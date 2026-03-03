import React, { useEffect, useState } from "react";
import ArchiveService, {
  type ArchiveApplication,
} from "@/api/services/archiveService";
import { toast, Toaster } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Terminal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function AdminArchiveApplicationsPage() {
  const [applications, setApplications] = useState<ArchiveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<ArchiveApplication | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form state for editing
  const [status, setStatus] = useState<"APPROVED" | "REJECTED" | "">("");
  const [accessLink, setAccessLink] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await ArchiveService.getAllApplications();
      setApplications(data);
    } catch (err) {
      toast.error("Failed to load archive applications.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (app: ArchiveApplication) => {
    setSelectedApp(app);
    setStatus(app.status === "PENDING" ? "" : app.status);
    setAccessLink(app.access_link || "");
    setAdminNotes(app.admin_notes || "");
    setExpiresAt(app.expires_at ? app.expires_at.slice(0, 10) : ""); // YYYY-MM-DD
    setIsDrawerOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedApp) return;
    if (!status) {
      toast.warning("Please select a status (APPROVED or REJECTED).");
      return;
    }

    setUpdating(true);
    try {
      await ArchiveService.updateApplication(selectedApp.application_id, {
        status: status as "APPROVED" | "REJECTED",
        access_link: accessLink || undefined,
        admin_notes: adminNotes || undefined,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      toast.success("Application updated.");
      await fetchApplications();
      setIsDrawerOpen(false);
    } catch (err) {
      toast.error("Update failed.");
    } finally {
      setUpdating(false);
    }
  };

  // Filtering
  const filtered = applications.filter((app) => {
    const term = searchTerm.toLowerCase();
    return (
      app.full_name.toLowerCase().includes(term) ||
      app.email.toLowerCase().includes(term) ||
      app.institution?.toLowerCase().includes(term) ||
      app.research_purpose.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-6 bg-transparent transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 dark:border-white/10 pb-8">
        <div>
          <h1 className="text-3xl font-sans uppercase tracking-tighter flex items-center gap-3 text-slate-900 dark:text-white">
            Archive Applications
          </h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-2">
            Research access requests
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="search by name / email / institution..."
            className="pl-10 rounded-none border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-[11px] font-sans focus-visible:ring-0 focus-visible:border-slate-900 dark:focus-visible:border-white h-11"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox
          label="Total"
          value={applications.length}
          icon={<FileText className="w-4 h-4" />}
        />
        <StatBox
          label="Pending"
          value={applications.filter((a) => a.status === "PENDING").length}
          icon={<Clock className="w-4 h-4" />}
          color="text-amber-500"
        />
        <StatBox
          label="Approved"
          value={applications.filter((a) => a.status === "APPROVED").length}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="text-green-500"
        />
        <StatBox
          label="Rejected"
          value={applications.filter((a) => a.status === "REJECTED").length}
          icon={<XCircle className="w-4 h-4" />}
          color="text-rose-500"
        />
      </div>

      {/* Table */}
      <div className="border border-slate-200 dark:border-white/10 rounded-none overflow-hidden bg-transparent backdrop-blur-[2px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                {["Applicant", "Purpose", "Status", "Submitted", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-20 text-center text-slate-400 dark:text-slate-600 animate-pulse font-mono text-xs uppercase tracking-tighter"
                  >
                    Fetching_Applications...
                  </td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((app) => (
                  <tr
                    key={app.application_id}
                    className="hover:bg-slate-500/5 dark:hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase text-slate-900 dark:text-white">
                          {app.full_name}
                        </p>
                        <p className="text-[9px] font-mono text-slate-500">
                          {app.email}
                        </p>
                        {app.institution && (
                          <p className="text-[9px] font-mono text-slate-400">
                            {app.institution}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] text-slate-700 dark:text-slate-300 line-clamp-2 max-w-xs">
                        {app.research_purpose}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono text-slate-400">
                      {app.created_at}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDrawer(app)}
                        className="px-4 py-1.5 border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center font-mono text-[10px] text-slate-400 uppercase italic"
                  >
                    NO_APPLICATIONS_FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="flex items-center justify-between px-1 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            ENTRY {startIndex + 1}—
            {Math.min(startIndex + itemsPerPage, filtered.length)} /{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase hover:bg-slate-900 hover:text-white dark:hover:bg-white/10 disabled:opacity-20 transition-all text-slate-900 dark:text-white flex items-center gap-1"
            >
              <ChevronLeft className="w-3 h-3" />
              Back
            </button>
            <span className="text-[10px] font-mono text-slate-400">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase hover:bg-slate-900 hover:text-white dark:hover:bg-white/10 disabled:opacity-20 transition-all text-slate-900 dark:text-white flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Review Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-white/10 rounded-none w-full sm:max-w-md p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-8 border-b border-slate-200 dark:border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-zinc-600 mb-2">
                <Terminal className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
                  Application Review
                </span>
              </div>
              <SheetTitle className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                #{selectedApp?.application_id}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 p-8 space-y-8 overflow-y-auto">
              {/* Applicant details */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Applicant
                </h4>
                <div className="space-y-px bg-zinc-100 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                  <DetailRow label="Name" value={selectedApp?.full_name} />
                  <DetailRow label="Email" value={selectedApp?.email} />
                  {selectedApp?.institution && (
                    <DetailRow
                      label="Institution"
                      value={selectedApp.institution}
                    />
                  )}
                </div>
              </section>

              {/* Research Purpose */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Research Purpose
                </h4>
                <div className="p-4 bg-zinc-100 dark:bg-white/5 border border-zinc-100 dark:border-white/5 text-[11px] text-slate-700 dark:text-slate-300">
                  {selectedApp?.research_purpose}
                </div>
              </section>

              {/* Admin actions */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Admin Decision
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">
                      Status *
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full p-3 bg-transparent border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:border-slate-900 dark:focus:border-white"
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">
                      Access Link (for approved)
                    </label>
                    <input
                      type="url"
                      value={accessLink}
                      onChange={(e) => setAccessLink(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full p-3 bg-transparent border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:border-slate-900 dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">
                      Expiration Date (optional)
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full p-3 bg-transparent border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:border-slate-900 dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      placeholder="Internal notes..."
                      className="w-full p-3 bg-transparent border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:border-slate-900 dark:focus:border-white resize-none"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10">
              <Button
                onClick={handleUpdate}
                disabled={updating || !status}
                className="w-full py-6 bg-slate-950 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest rounded-none hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50"
              >
                {updating ? "Updating..." : "Submit Decision"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Helper components
function StatBox({
  label,
  value,
  icon,
  color = "text-slate-900 dark:text-white",
}: any) {
  return (
    <div className="bg-white/80 border border-slate-200 dark:border-white/10 dark:bg-white/5 p-6 flex items-center justify-between group transition-colors hover:bg-white dark:hover:bg-white/[0.08]">
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className={`text-xl font-black tracking-tighter ${color}`}>
          {value}
        </p>
      </div>
      <div className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors">
        {icon}
      </div>
    </div>
  );
}

function ApplicationStatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  let style = "border-slate-200 dark:border-white/10 text-slate-400";
  if (s === "PENDING")
    style =
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-500";
  if (s === "APPROVED")
    style =
      "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400";
  if (s === "REJECTED")
    style =
      "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400";
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[9px] font-black font-mono uppercase border rounded-none tracking-tighter ${style}`}
    >
      {status}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-transparent">
      <span className="text-[9px] font-mono text-slate-400 uppercase">
        {label}
      </span>
      <span className="text-[10px] font-bold uppercase text-slate-900 dark:text-white">
        {value || "—"}
      </span>
    </div>
  );
}
