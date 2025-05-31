import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useUser } from "@/Provider/UserProvider";

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 transition-none">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center">
            <SheetTitle className="">{user ? `${user?.telegramUsername}` : 'Menu'}</SheetTitle>
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
            ''
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
