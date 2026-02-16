import { cn } from "@/lib/utils";
import { NAVIGATION_CONFIG } from "@/utils/consts";
import { LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuthService from "@/api/services/authService";
import { useNavigate } from "react-router";

export function Sidebar({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  const userRole = user?.role || "editor";
  const navigate = useNavigate();

  const image = import.meta.env.BACKEND_IMAGE_URL || "http://localhost:5000";

  return (
    <aside
      className={cn(
        "flex flex-col bg-white dark:bg-[#050508] h-full lg:h-screen lg:w-72 lg:border-r border-slate-200 dark:border-white/[0.03] transition-all duration-300",
        className,
      )}
    >
      {/* Brand Section - Serif & Documentation Label */}
      <div className="p-8 mb-4">
        <div className="flex flex-col">
          <h1 className="font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight text-3xl leading-none">
            Craftfolio
          </h1>
          <p className="text-[9px] uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500 font-bold mt-2.5">
            Documentation System
          </p>
        </div>
      </div>

      {/* Nav Content */}
      <nav className="flex-1 px-8 space-y-12 overflow-y-auto scrollbar-none">
        {!loading &&
          NAVIGATION_CONFIG.filter((section) =>
            section.roles.includes(userRole),
          ).map((section) => (
            <NavSection key={section.group} label={section.group}>
              {section.items
                .filter((item) => item.roles.includes(userRole))
                .map((item) => (
                  <NavItem
                    key={item.id}
                    icon={<item.icon size={17} strokeWidth={1.5} />}
                    label={item.label}
                    badge={item.badge}
                    active={item.path === "/"}
                  />
                ))}
            </NavSection>
          ))}
      </nav>

      {/* Footer Profile - Squared & High Contrast */}
      <div className="p-6 mt-auto">
        <div className="border border-slate-200 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.01] p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative shrink-0">
              <img
                src={
                  image + user?.profile?.profile_picture ||
                  `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=0f172a&color=fff&bold=true`
                }
                alt="avatar"
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 object-cover grayscale"
              />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[13px] font-serif font-bold text-slate-900 dark:text-slate-100 truncate">
                {user?.name || "Verifying..."}
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                {userRole === "AUTHOR" ? "Artist" : userRole}
              </span>
            </div>
          </div>

          <div className="flex gap-1.5">
            <ProfileBtn
              icon={<Settings size={14} />}
              onClick={() => navigate("/dashboard/profile")}
            />
            <ProfileBtn
              icon={<LogOut size={14} />}
              onClick={() => AuthService.logout()}
              className="text-rose-500 hover:bg-rose-100 hover:text-rose-900 dark:hover:bg-rose-500 border-transparent"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavSection({ label, children }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold text-slate-900 dark:text-slate-500 uppercase tracking-[0.3em] font-sans">
        {label}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavItem({ icon, label, active, badge, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between py-2 cursor-pointer transition-all duration-300 border-b border-transparent",
        active
          ? "text-slate-900 dark:text-white border-slate-900 dark:border-white"
          : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
      )}
    >
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "transition-colors duration-300",
            active
              ? "text-slate-900 dark:text-white"
              : "text-slate-300 dark:text-slate-700",
          )}
        >
          {icon}
        </span>
        <span className="text-[14px] font-serif font-medium tracking-tight">
          {label}
        </span>
      </div>
      {badge && (
        <span className="text-[10px] font-mono opacity-50">({badge})</span>
      )}
    </div>
  );
}

function ProfileBtn({ icon, className, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 p-2.5 border border-slate-200 dark:border-white/[0.08] flex items-center justify-center transition-all hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-95",
        className,
      )}
    >
      {icon}
    </button>
  );
}
