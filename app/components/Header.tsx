"use client";

import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export function Header() {
  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Link href="/">
              <span
                className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                DOGE
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-8">
            {["Home", "Departments", "Reports"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item}
              </Link>
            ))}
            <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm">
              Sign In
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
