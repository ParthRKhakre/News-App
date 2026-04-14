import { NavLink } from "react-router-dom";

import BrandMark from "@/components/common/BrandMark";
import { useAuth } from "@/hooks/useAuth";

function FeedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 7h14M5 12h14M5 17h9" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 19V9M12 19V5M19 19v-7" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
      <path d="m9.5 12 1.8 1.8 3.7-4.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 16l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12h9" strokeLinecap="round" />
      <path d="M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4" strokeLinecap="round" />
    </svg>
  );
}

const links = [
  { to: "/feed", label: "Feed", icon: FeedIcon },
  { to: "/dashboard", label: "Dashboard", icon: ChartIcon },
  { to: "/submit", label: "Submit", icon: PlusIcon },
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/verify", label: "Verify", icon: ShieldIcon }
];

function NavItem({ link, collapsed, onNavigate }) {
  const Icon = link.icon;
  return (
    <NavLink
      to={link.to}
      title={collapsed ? link.label : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
          isActive
            ? "bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] dark:bg-blue-600"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        } ${collapsed ? "justify-center px-0 py-3.5" : ""}`
      }
    >
      <Icon />
      {!collapsed ? <span>{link.label}</span> : null}
    </NavLink>
  );
}

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }) {
  const { logout, canAccessAnalytics, canSubmitNews } = useAuth();
  const visibleLinks = links.filter((link) => {
    if (link.to === "/dashboard") {
      return canAccessAnalytics;
    }
    if (link.to === "/submit") {
      return canSubmitNews;
    }
    return true;
  });

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-white/70 bg-white/92 px-4 pb-6 pt-24 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-950/92 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[96px]" : "lg:w-[280px]"}`}
      >
        <div className={`mb-5 hidden lg:flex ${collapsed ? "justify-center" : "items-center justify-between"}`}>
          {!collapsed ? <BrandMark compact /> : null}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed ? (
                <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>

        {collapsed ? (
          <div className="mb-6 hidden justify-center lg:flex">
            <BrandMark compact />
          </div>
        ) : null}

        {!collapsed ? (
          <div className="mb-6 rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-700 to-slate-950 px-5 py-5 text-white shadow-[0_20px_50px_rgba(37,99,235,0.28)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
              Navigation
            </p>
            <p className="mt-3 font-display text-2xl font-bold tracking-tight">
              Trust signals first.
            </p>
            <p className="mt-2 text-sm leading-6 text-blue-50/90">
              Verify stories, inspect AI reasoning, and store proof on-chain.
            </p>
          </div>
        ) : null}

        <nav className={`flex flex-1 flex-col gap-2 ${collapsed ? "items-center" : ""}`}>
          {visibleLinks.map((link) => (
            <NavItem
              key={link.to}
              link={link}
              collapsed={collapsed}
              onNavigate={onClose}
            />
          ))}
        </nav>

        <button
          type="button"
          onClick={logout}
          title={collapsed ? "Logout" : undefined}
          className={`mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${
            collapsed ? "justify-center px-0 py-3.5" : ""
          }`}
        >
          <LogoutIcon />
          {!collapsed ? <span>Logout</span> : null}
        </button>
      </aside>
    </>
  );
}
