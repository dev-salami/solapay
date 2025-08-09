"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn, useLogout, useToken } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

const Navbar = () => {
  const { token } = useToken();
  const { logout } = useLogout();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    window.location.href = "/";
  };

  // Check if link is active
  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Navigation links that don't depend on auth state
  const staticLinks = [{ href: "/", label: "Home" }];

  // Auth-dependent links (only show when client has loaded)
  const getAuthLinks = () => {
    if (!isClient) return [];

    if (token) {
      return [{ href: "/dashboard", label: "Dashboard" }];
    } else {
      return [
        { href: "/login", label: "Login" },
        { href: "/register", label: "Register" },
      ];
    }
  };

  const allLinks = [...staticLinks, ...getAuthLinks()];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SP</span>
            </div>
            <span className="text-xl font-bold text-gray-900">SolPay</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex space-x-6">
              {allLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActiveLink(link.href)
                      ? "text-primary border-b-2 border-primary  "
                      : "text-gray-700"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Button (only show when client has loaded) */}
            {isClient && token && (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                Logout
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button className="mt-8" variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-2 pb-4 border-b">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">SP</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      SolPay
                    </span>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col space-y-4">
                    {allLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-lg font-medium transition-colors hover:text-primary py-2",
                          isActiveLink(link.href)
                            ? "text-primary border-l-4 border-primary pl-4"
                            : "text-gray-700"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Auth Button (only show when client has loaded) */}
                  {isClient && token && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full"
                      >
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
