import React, { useEffect, useState } from "react";
import AdminService, { type UserProfile } from "@/api/services/adminServices";
import { toast } from "sonner";
import {
  Search,
  Mail,
  Calendar,
  MoreHorizontal,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Toaster } from "sonner";
import { format } from "date-fns";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getAllUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load user directory.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (newPage: number) => setCurrentPage(newPage);

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-6 bg-transparent transition-colors duration-300">
      <Toaster richColors theme="dark" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-slate-900 dark:text-white" />
            User Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            System access control and registry.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Filter by name or email..."
              className="pl-10 rounded-none border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-0 focus:border-slate-900 dark:focus:border-white transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button className="p-2 border border-slate-200 dark:border-white/10 rounded-none hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-500">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="border border-slate-200 dark:border-white/10 rounded-none overflow-hidden bg-transparent backdrop-blur-[2px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Identity
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Contact
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Registered
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Access
                </th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-20 text-center text-slate-400 dark:text-slate-600 animate-pulse font-mono text-xs uppercase tracking-tighter"
                  >
                    Synchronizing_Database...
                  </td>
                </tr>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.user_id}
                    className="hover:bg-slate-500/5 dark:hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.profile?.profile_picture
                              ? `/image${user.profile.profile_picture}`
                              : `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
                          }
                          alt={user.name}
                          className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/10 grayscale object-cover"
                        />
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        <Mail className="w-3 h-3 opacity-40" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {user.created_at
                          ? format(new Date(user.created_at), "dd.MM.yyyy")
                          : "--"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter border rounded-none ${
                          user.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-600 border-green-200/50 dark:border-green-500/30 dark:text-green-400"
                            : "bg-red-500/10 text-red-600 border-red-200/50 dark:border-red-500/30 dark:text-red-500"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400 font-mono text-xs italic"
                  >
                    ZERO_RESULTS_MATCHED
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      {!loading && (
        <div className="flex items-center justify-between px-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Record {startIndex + 1}—
            {Math.min(startIndex + itemsPerPage, filteredUsers.length)} /{" "}
            {filteredUsers.length}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase hover:bg-white/10 disabled:opacity-20 transition-all text-slate-900 dark:text-white flex items-center gap-1"
            >
              <ChevronLeft className="w-3 h-3" />
              Back
            </button>
            <span className="text-[10px] font-mono text-slate-400">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase hover:bg-white/10 disabled:opacity-20 transition-all text-slate-900 dark:text-white flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
