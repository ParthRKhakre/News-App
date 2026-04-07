import { Link, NavLink } from "react-router-dom";

import BrandMark from "@/components/common/BrandMark";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useAuth();

  return (
    <header className="glass-panel fixed inset-x-0 top-0 z-40 border-b border-white/60 dark:border-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/feed" className="flex items-center gap-3">
          <BrandMark />
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `text-sm font-semibold ${isActive ? "text-ink dark:text-white" : "text-slate-500 dark:text-slate-300"}`
            }
          >
            Feed
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-sm font-semibold ${isActive ? "text-ink dark:text-white" : "text-slate-500 dark:text-slate-300"}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/submit"
            className={({ isActive }) =>
              `text-sm font-semibold ${isActive ? "text-ink dark:text-white" : "text-slate-500 dark:text-slate-300"}`
            }
          >
            Submit
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `text-sm font-semibold ${isActive ? "text-ink dark:text-white" : "text-slate-500 dark:text-slate-300"}`
            }
          >
            Profile
          </NavLink>
          <NavLink
            to="/verify"
            className={({ isActive }) =>
              `text-sm font-semibold ${isActive ? "text-ink dark:text-white" : "text-slate-500 dark:text-slate-300"}`
            }
          >
            Verify
          </NavLink>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <div className="rounded-full bg-orange-50 px-3 py-2 text-sm font-semibold text-ember dark:bg-slate-800">
            @{user?.username}
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-sm font-semibold text-slate-500 transition hover:text-ink dark:text-slate-300 dark:hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
