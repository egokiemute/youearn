"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { NavbarSidebar } from "./navbar-sidebar";
import { MenuIcon } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface NavbarItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavbarItem = ({ href, children, isActive }: NavbarItemProps) => {
  return (
    <Button
      asChild
      variant="elevated"
      className={cn(
        "bg-transparent text-white hover:text-black rounded-sm border-transparent hover:border-white hover:bg-white px-3.5 text-lg transition-all duration-300 ease-in-out",
        isActive && "bg-white text-black"
      )}
    >
      <Link href={href}>
        <div className="flex items-center">{children}</div>
      </Link>
    </Button>
  );
};

const NavbarItems = [
  { children: "Home", href: "/" },
  { children: "T&Cs", href: "/terms" },
];

export const Navbar = () => {
  const pathname = usePathname(); // Get the current path
  const [isSidebarOpen, setSidebarOpen] = useState(false); // State to manage sidebar open/close

  return (
    <nav className="h-20 flex border-b justify-between font-medium bg-[#09005b] w-full">
      <Link
        href="/"
        className={cn(
          "pl-6 flex items-center text-3xl font-semibold text-white",
          poppins.className
        )}
      >
        <span className="">Edu</span>
        <span className="text-[#fe0000]">pay</span>
      </Link>

      <NavbarSidebar items={NavbarItems} open={isSidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="items-center gap-4 hidden lg:flex pr-6">
        {NavbarItems.map((item) => (
          <NavbarItem
            key={item.href}
            href={item.href}
            isActive={pathname === item.href}
          >
            {item.children}
          </NavbarItem>
        ))}
      </div>

      <div className="hidden lg:flex">
        <Button
          asChild
          variant="secondary"
          className="bg-transparent text-white rounded-none border-l border-t-0 border-b-0 border-r-0 px-12 h-full hover:text-black hover:bg-white transition-colors text-lg duration-300 ease-in-out"
        >
          <Link href="/login">Login</Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="bg-[#fe0000] text-white rounded-none border-l border-t-0 border-b-0 border-r-0 px-12 h-full hover:text-black hover:bg-white transition-colors text-lg duration-300 ease-in-out"
        >
          <Link href="/signup">Join the Community</Link>
        </Button>
      </div>

      <div className="flex items-center justify-center lg:hidden pr-6">
        <Button
          variant="ghost"
          className="border-transparent size-12 bg-white"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <MenuIcon className="h-12 w-12" />
        </Button>
      </div>
    </nav>
  );
};
