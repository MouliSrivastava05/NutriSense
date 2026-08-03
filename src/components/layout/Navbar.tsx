"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Great_Vibes } from "next/font/google";

const cursiveFont = Great_Vibes({ 
  weight: "400",
  subsets: ["latin"],
});

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/history", label: "History" },
    { href: "/profile", label: "Profile" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <img src="/logo.png" alt="NutriSense Logo" className="h-14 w-14 object-cover transition-transform group-hover:scale-105 rounded-full" />
          <span className={cn("font-medium text-3xl tracking-wide text-primary", cursiveFont.className)}>NutriSense</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-foreground", 
                  pathname.startsWith(link.href) ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <Link href="/upload" className={cn(buttonVariants({ size: "sm" }), "px-5 rounded-full shadow-none")}>
            Analyze
          </Link>
        </div>
      </div>
    </header>
  );
}
