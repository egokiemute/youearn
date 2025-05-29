import React from "react";
import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t text-gray-700">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Branding */}
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Edu<span className="text-yellow-500">pay</span>
          </h2>
          <p className="text-sm text-gray-600">
            Making school fee payments seamless, secure, and transparent for everyone.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-md font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">How It Works</a></li>
            <li><a href="#" className="hover:underline">Pricing</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
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
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-md font-semibold mb-3">Follow Us</h3>
          <div className="flex gap-4">
            <a href="#" aria-label="Facebook">
              <Facebook className="w-5 h-5 hover:text-blue-600" />
            </a>
            <a href="#" aria-label="Twitter">
              <Twitter className="w-5 h-5 hover:text-blue-400" />
            </a>
            <a href="#" aria-label="Instagram">
              <Instagram className="w-5 h-5 hover:text-pink-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t py-4 px-6 text-center text-sm text-gray-500 space-y-1">
        <p>&copy; {new Date().getFullYear()} Edupay, Inc. All rights reserved.</p>
        <p>
          Designed by{" "}
          <span className="font-medium text-gray-700">
            Crowther Samuel, Odjidja Jared, and Bemile Emmanuel
          </span>
        </p>
      </div>
    </footer>
  );
};
