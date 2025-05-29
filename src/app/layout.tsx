import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/Provider/UserProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "YouEarn - watch advertisements and earn money",
  description: "Watch advertisements and earn money",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <html lang="en">
        <body
          className={`${dmSans.className} antialiased`}
          data-new-gr-c-s-check-loaded="14.1234.0"
          data-gr-ext-installed=""
        >
          {/* <UserProvider> */}
          {children}
          {/* </UserProvider> */}
          <Toaster />
        </body>
      </html>
    </UserProvider>
  );
}
