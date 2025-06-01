"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useUser } from "@/Provider/UserProvider";
import { useAuth } from "@/hooks/useAuth";

interface NavbarItem {
  children: React.ReactNode;
  href: string;
}

interface Props {
  items: NavbarItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export const NavbarSidebar = ({ items, open, onOpenChange }: Props) => {
  const { user } = useUser();
  const { logout, isLoggingOut } = useAuth();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 transition-none">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center">
            <SheetTitle className="">
              {user ? `${user?.telegramUsername}` : "Menu"}
            </SheetTitle>
          </div>
        </SheetHeader>
        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-full text-left p-4 hover:bg-[#09005b] hover:text-white flex items-center  text-base font-medium"
              onClick={() => onOpenChange(false)}
            >
              {item.children}
            </Link>
          ))}
          <div className="pl-4 mt-1 flex items-center space-x-4 text-sm text-gray-600">
            <button
              onClick={() => logout("/login")}
              disabled={isLoggingOut}
              className={`px-3 py-1 rounded-full text-white transition-colors duration-200 ${
                isLoggingOut
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 cursor-pointer"
              }`}
            >
              {isLoggingOut ? (
                <span className="flex items-center space-x-1">
                  <svg
                    className="animate-spin h-3 w-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Logging out...</span>
                </span>
              ) : (
                "Logout"
              )}
            </button>
          </div>
          {!user ? (
            <div className="border-t">
              <Link
                href="/login"
                className="w-full text-left p-4 hover:bg-[#09005b] hover:text-white flex items-center  text-base font-medium"
                onClick={() => onOpenChange(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="w-full text-left p-4 hover:bg-[#09005b] hover:text-white flex items-center  text-base font-medium"
                onClick={() => onOpenChange(false)}
              >
                Register
              </Link>
            </div>
          ) : (
            ""
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
