"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const images = [
  "/assets/hero-banner.jpg",
  "/assets/hero-banner-2.jpg",
];

export const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[90vh] w-full overflow-hidden">
      {/* Sliding Background Images */}
      <div
        className="absolute inset-0 transition-all duration-1000 bg-cover bg-center"
        style={{ backgroundImage: `url('${images[currentImage]}')` }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 h-full flex items-center justify-center">
        <div className="max-w-3xl flex flex-col items-center text-center">
          <h1 className="text-[#fff] text-center text-4xl md:text-7xl font-bold mb-4">
            With YouEarn, Your Time Has Value And We Pay You For It.
          </h1>
          <p className="text-gray-300 text-lg md:text-2xl mb-6">
            Turn your time into digital currency. Join thousands earning cryptocurrency daily through our simple ad-viewing platform.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              variant="elevated"
              className={cn(
                "bg-yellow-500 text-black hover:bg-white hover:text-black rounded-sm px-12 py-6 text-lg transition-all"
              )}
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              asChild
              variant="elevated"
              className={cn(
                "bg-white text-black hover:bg-[#fe0000] hover:text-white rounded-sm px-12 py-6 text-lg transition-all"
              )}
            >
              <Link href="/signup">Join the Community</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
