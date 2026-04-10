import { useState } from "react";
import { Outlet } from "react-router-dom";

import ToastStack from "@/components/common/ToastStack";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout() {
  const { toast } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-hero-mesh text-ink transition-colors dark:text-white">
      <ToastStack toast={toast} />
      <Navbar
        onToggleSidebar={() => setSidebarOpen((current) => !current)}
        sidebarCollapsed={sidebarCollapsed}
      />
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />
      <main
        className={`transition-[padding] duration-300 ${
          sidebarCollapsed ? "lg:pl-[120px]" : "lg:pl-[296px]"
        }`}
      >
        <div className="px-0 pb-10 pt-2 lg:px-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
