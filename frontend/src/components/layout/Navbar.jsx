import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

import BrandMark from "@/components/common/BrandMark";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

const pageMeta = {
  "/feed": {
    title: "News feed",
    subtitle: "Review stories quickly and verify the ones that matter."
  },
  "/dashboard": {
    title: "Analytics dashboard",
    subtitle: "Track patterns, outcomes, and verification activity."
  },
  "/submit": {
    title: "Submit a story",
    subtitle: "Paste a claim or article and run a full credibility check."
  },
  "/profile": {
    title: "Profile",
    subtitle: "See your account details and saved verification history."
  },
  "/verify": {
    title: "Public verification",
    subtitle: "Check whether a story hash has been recorded on-chain."
  }
};

export default function Navbar({ onToggleSidebar, sidebarCollapsed = false }) {
  const { user, theme, toggleTheme } = useAuth();
  const location = useLocation();

  const currentMeta = useMemo(() => {
    return pageMeta[location.pathname] || pageMeta["/feed"];
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
      <div
        className={`mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-4 sm:px-6 ${
          sidebarCollapsed ? "lg:pl-10 lg:pr-8" : "lg:px-8"
        }`}
      >
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Toggle navigation"
        >
          <MenuIcon />
        </button>

        <Link to="/feed" className="hidden shrink-0 lg:block">
          <BrandMark compact />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-sky-300">
            Tez News
          </p>
          <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {currentMeta.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <div className="hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:block dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Signed in
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              @{user?.username}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
