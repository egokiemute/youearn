import React from "react";
import { Facebook, Twitter, Instagram } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-[#09005b] border-t text-white">
      <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-start justify-between gap-10">
        {/* Branding */}
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">
            You<span className="text-[#fe0000]">earn</span>
          </h2>
          <p className="text-sm text-white">
            We are a reliable and collectively shared revenue advertising platform that pays you for every click!
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-md font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:underline cursor-pointer">Home</Link></li>
            <li><Link href="/terms" className="hover:underline cursor-pointer">Terms & Condition</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        {/* <div>
          <h3 className="text-md font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              support@edupay.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              09998776654
            </li>
          </ul>
        </div> */}

        {/* Social Media */}
        <div>
          <h3 className="text-md font-semibold mb-3">Follow Us</h3>
          <div className="flex gap-4 text-white">
            <Link className="cursor-pointer" href="https://www.facebook.com/share/19Fiuc84rB/" target="_blank" aria-label="Facebook">
              <Facebook className="w-5 h-5 text-white" />
            </Link>
            <Link className="cursor-pointer" href="https://x.com/Youearn_offers" target="_blank" aria-label="Twitter">
              <Twitter className="w-5 h-5 text-white" />
            </Link>
            <Link className="cursor-pointer" href="https://www.instagram.com/youearn_offers/" target="_blank" aria-label="Instagram">
              <Instagram className="w-5 h-5 text-white" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white py-4 px-6 text-center text-sm text-white space-y-1">
        <p>&copy; {new Date().getFullYear()} Youearn, Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};
