import { Outlet } from "react-router-dom";

import ToastStack from "@/components/common/ToastStack";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout() {
  const { toast } = useAuth();

  return (
    <div className="min-h-screen bg-hero-mesh text-ink transition-colors dark:text-white">
      <ToastStack toast={toast} />
      <Navbar />
      <Sidebar />
      <main className="pt-20 md:pl-72">
        <Outlet />
      </main>
    </div>
  );
}
