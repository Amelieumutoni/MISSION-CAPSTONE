import { cn } from "@/lib/utils";
import { NAVIGATION_CONFIG } from "@/utils/consts";
import { LogOut, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // ✅ CORRECT SOURCE
import { useNavigate, useLocation, Link } from "react-router";

export function Sidebar({ className }: { className?: string }) {
  const { user, loading, logout } = useAuth();
  const userRole = user?.role || "BUYER";

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleLogout = () => {
    logout(); // clears context + storage
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-white dark:bg-[#050508] h-full lg:h-screen lg:w-72 lg:border-r border-slate-200 dark:border-white/[0.03] transition-all duration-300",
        className,
      )}
    >
      {/* BRAND */}
      <div className="p-8 mb-4">
        <div className="flex flex-col">
          <Link
            to="/"
            className="font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight text-3xl leading-none"
          >
            Craftfolio
          </Link>
          <p className="text-[9px] uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500 font-bold mt-2.5">
            Documentation System
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-8 space-y-12 overflow-y-auto scrollbar-none">
        {!loading &&
          NAVIGATION_CONFIG.filter((section) =>
            section.roles.includes(userRole),
          ).map((section) => (
            <NavSection key={section.group} label={section.group}>
              {section.items
                .filter((item) => item.roles.includes(userRole))
                .map((item) => {
                  const isActive = item.path === currentPath;

                  return (
                    <Link
                      key={item.id}
                      to={item.disabled ? "#" : item.path}
                      className="block"
                    >
                      <NavItem
                        icon={<item.icon size={17} strokeWidth={1.5} />}
                        label={item.label}
                        badge={item.badge}
                        active={isActive}
                        disabled={item.disabled}
                      />
                    </Link>
                  );
                })}
            </NavSection>
          ))}
      </nav>

      {/* FOOTER / PROFILE */}
      <div className="p-6 mt-auto">
        <div className="border border-slate-200 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.01] p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative shrink-0">
              <img
                src={
                  user?.profile?.profile_picture
                    ? `${backendUrl}${user.profile.profile_picture}`
                    : `https://ui-avatars.com/api/?name=${
                        user?.name || "User"
                      }&background=0f172a&color=fff&bold=true`
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
              onClick={handleLogout}
              className="text-rose-500 hover:bg-rose-100 hover:text-rose-900 dark:hover:bg-rose-500 border-transparent"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ----------------------- */
/* SUB COMPONENTS */
/* ----------------------- */

function NavSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold text-slate-900 dark:text-slate-500 uppercase tracking-[0.3em]">
        {label}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: string | number;
  disabled?: boolean;
}) {
  return (
    <div
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

function ProfileBtn({
  icon,
  className,
  onClick,
}: {
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
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
