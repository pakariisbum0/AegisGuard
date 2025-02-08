"use client";

import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();

  // Add debug logging
  console.log("Auth State:", { isAuthenticated, isLoading, user });

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const truncateAddress = (address: string) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  };

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
            {[
              { name: "Home", path: "/" },
              { name: "Departments", path: "/departments" },
              { name: "About", path: "/about" },
              { name: "Reports", path: "/reports" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`text-sm transition-colors ${
                  isActive(item.path)
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {isLoading && isAuthenticated ? (
              <Button disabled variant="outline" className="gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </Button>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    {truncateAddress(user?.walletAddress || "")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => logout()}>
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => login()}
                className="bg-black text-white hover:bg-gray-800"
              >
                Connect Wallet
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
