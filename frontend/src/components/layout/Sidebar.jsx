import { NavLink } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/feed", label: "Feed" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/submit", label: "Submit" },
  { to: "/profile", label: "Profile" },
  { to: "/verify", label: "Verify" }
];

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="fixed inset-x-4 bottom-4 z-40 md:inset-x-auto md:left-6 md:top-28 md:bottom-6 md:w-52">
      <nav className="glass-panel flex items-center justify-between rounded-[28px] border border-white/70 p-2 shadow-card dark:border-slate-800 md:h-full md:flex-col md:items-stretch md:justify-start md:gap-3 md:p-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-2xl px-4 py-3 text-center text-sm font-semibold transition ${
                isActive ? "bg-ink text-white" : "text-slate-600 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-900"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={logout}
          className="rounded-2xl px-4 py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-white dark:text-slate-200 dark:hover:bg-slate-900 md:mt-auto"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
