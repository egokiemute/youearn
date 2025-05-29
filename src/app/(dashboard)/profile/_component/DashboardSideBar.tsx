"use client";
import { cn } from "@/lib/utils";
import { useUser } from "@/Provider/UserProvider";
import {
  CreditCard,
  Home,
  UserCircle,
  Users,
} from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const DashboardSideBar = () => {
  const { user, logout } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();

  // Determine admin status from user data or session
  const isAdmin = user?.role === 'admin';

  const handleSignOut = async () => {
    setIsLoggingOut(!isLoggingOut);
    try {
      // Call both logout methods to ensure clean logout
      if (logout) {
        logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Regular user navigation items
  const userNavItems = [
    {
      href: "/dashboard",
      icon: Home,
      label: "Dashboard",
      activeClass: pathname === "/dashboard" ? "bg-green-50 text-green-600" : "hover:bg-gray-50",
    },
    {
      href: "/dashboard/referrals",
      icon: CreditCard,
      label: "Referrals",
      activeClass: pathname === "/dashboard/referrals" ? "bg-green-50 text-green-600" : "hover:bg-gray-50",
    },
    {
      href: "/dashboard/profile",
      icon: UserCircle,
      label: "Profile",
      activeClass: pathname === "/dashboard/profile" ? "bg-green-50 text-green-600" : "hover:bg-gray-50",
    }
  ];

  // Admin navigation items
  const adminNavItems = [
    {
      href: "/admin",
      icon: Home,
      label: "Dashboard",
      activeClass: pathname === "/admin" ? "bg-green-50 text-green-600" : "hover:bg-gray-50",
    },
    {
      href: "/admin/all-users",
      icon: Users,
      label: "All Users",
      activeClass: pathname === "/admin/all-users" ? "bg-green-50 text-green-600" : "hover:bg-gray-50",
    }
  ];

  // Choose navigation items based on user role
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="px-3 space-y-4 p-4 bg-white flex flex-col h-full items-start justify-between overflow-hidden">
      <div className="w-full flex-1">
        <div className="pt-4 pl-0">
          <div className="flex items-center">
            <Link
              href="/"
              className={cn(
                "pl-1 flex items-center text-3xl font-semibold text-green-800",
                poppins.className
              )}
            >
              <span className="">Edu</span>
              <span className="text-yellow-500">pay</span>
            </Link>
          </div>
        </div>
        
        
        {/* Navigation Items */}
        <div className="pt-6">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${item.activeClass}`}
              >
                <item.icon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="hidden">
          <button onClick={handleSignOut}>logout</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSideBar;