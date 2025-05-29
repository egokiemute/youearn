"use client";
import { cn } from "@/lib/utils";
import { useUser } from "@/Provider/UserProvider";
import { CreditCard, Home, User } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const DashboardHeader = () => {
  const { user } = useUser();
  const pathname = usePathname();

  const userNavItems = [
    {
      href: "/profile",
      icon: Home,
      label: "Dashboard",
      activeClass:
        pathname === "/profile"
          ? "bg-[#09005b] text-[#fff]"
          : "hover:bg-gray-50",
    },
    {
      href: "/profile/referrals",
      icon: CreditCard,
      label: "Referrals",
      activeClass:
        pathname === "/profile/referrals"
          ? "bg-[#09005b] text-[#fff]"
          : "hover:bg-gray-50",
    },
    // {
    //   href: "/profile/profile",
    //   icon: UserCircle,
    //   label: "Profile",
    //   activeClass:
    //     pathname === "/dashboard/profile"
    //       ? "bg-[#09005b30] text-[#fff]"
    //       : "hover:bg-gray-50",
    // },
  ];

  return (
    <nav className="bg-[#09005b3d] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - visible on mobile */}
          <div className="flex items-center">
            <Link
              href="/"
              className={cn(
                "flex items-center text-2xl font-semibold text-[#09005b]",
                poppins.className
              )}
            >
              <span>You</span>
              <span className="text-[#fe0000]">earn</span>
              {/* <span className="text-[#fff] ml-1">Referral</span> */}
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {userNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.activeClass}`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User info or mobile menu button */}
          <div className="flex items-center">
            {user && (
              <div className="hidden md:flex items-center space-x-3">
                <User className="h-6 w-6 text-gray-600" />
                <span className="text-sm text-gray-700">
                  Welcome, {user.telegramUsername || user.email}
                </span>
              </div>
            )}
            
            {/* Mobile menu button - you can add mobile menu functionality here */}
            <div className="md:hidden">
              <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardHeader;