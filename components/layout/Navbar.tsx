"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Compass, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
// import ShadcnKit from "@/components/icons/shadcn-kit";
// import { randomUUID } from "randomUUID";
import Link from "next/link";
// import { randomUUID } from "crypto";
import { usePathname } from "next/navigation";
import SearchBar from "../SearchBar";

const Navbar = ({}) => {
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-2 md:px-4 pt-2 md:pt-4">
      <Card className="bg-background/80 backdrop-blur-md py-2 md:py-3 px-3 md:px-8 border border-border/20 flex items-center justify-between gap-2 md:gap-6 rounded-2xl shadow-lg">
        {/* Logo - visible on all screens */}
        <Link
          href="/"
          className="text-xl md:text-2xl font-bold text-primary flex-shrink-0"
        >
          ReadThat
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/explore"
            className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
              pathname === "/explore"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Compass
              className={`w-4 h-4 transition-transform group-hover:rotate-12 ${
                pathname === "/explore" ? "text-primary" : ""
              }`}
            />
            <span className="font-medium">Explore</span>
          </Link>
          <Link
            href="/my-books"
            className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
              pathname === "/my-books"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen
              className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                pathname === "/my-books" ? "text-primary" : ""
              }`}
            />
            <span className="font-medium">My Books</span>
          </Link>
        </nav>

        {/* Desktop: Search in center, buttons on right */}
        <div className="hidden md:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop buttons */}
          <Button variant="secondary" className="hidden md:block">
            Login
          </Button>
          <Button className="hidden md:block">Get Started</Button>

          {/* Desktop theme toggle */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Mobile: Search and Menu on the right */}
          <div className="flex md:hidden items-center gap-2">
            <SearchBar />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6 scale-110" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/explore" className="flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    <span>Explore</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-books" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>My Books</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-sm">Theme</span>
                    <div className="ml-auto">
                      <ThemeToggle />
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button variant="secondary" className="w-full text-sm">
                    Login
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button className="w-full text-sm">Get Started</Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Navbar;
