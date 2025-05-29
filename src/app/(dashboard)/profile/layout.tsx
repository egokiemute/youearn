import React from "react";
import DashboardHeader from "./_component/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="w-full">
        <DashboardHeader />
        {/* Children */}
        {children}
      </main>
    </>
  );
}
