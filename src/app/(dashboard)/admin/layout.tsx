import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="overflow-hidden">
      {/* sidebar left side */}
      {/* <DashboardSideBar /> */}

      {/* sidebar right side */}
      <main className="w-full">
        {/* <DashboardHeader /> */}

        {/* Children */}
        {children}
      </main>
    </SidebarProvider>
  );
}
