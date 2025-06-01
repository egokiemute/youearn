import React from "react";
import DashboardHeader from "./_component/DashboardHeader";
import { Footer } from "@/app/(home)/footer";

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
        <Footer />
      </main>
    </>
  );
}
