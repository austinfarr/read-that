"use client";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Compass, Menu, X, LogOut, User, Settings, ChevronDown } from "lucide-react";
// import ShadcnKit from "@/components/icons/shadcn-kit";
// import { randomUUID } from "randomUUID";
import Link from "next/link";
// import { randomUUID } from "crypto";
import { usePathname, useRouter } from "next/navigation";
import SearchBar from "../SearchBar";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/hooks/useUser";

const Navbar = ({}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { authUser, profile, loading } = useUser();
  const supabase = createClient();

  // Close drawer when pathname changes
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Hide navbar on search page for fullscreen experience
  if (pathname === "/search") {
    return null;
  }

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
        <div className="hidden md:block flex-1 max-w-sm mx-4">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop theme toggle */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Desktop buttons */}
          {loading ? (
            <div className="hidden md:flex items-center gap-1 p-1">
              <div className="w-10 h-10 bg-muted-foreground/20 rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-muted-foreground/20 rounded animate-pulse" />
            </div>
          ) : authUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="hidden md:flex items-center gap-1 cursor-pointer hover:bg-muted/50 rounded-full p-1 transition-colors">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-border/20 hover:border-primary/30 transition-all"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted border-2 border-border/20 hover:border-primary/30 flex items-center justify-center transition-all">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button className="hidden md:block">
                Login
              </Button>
            </Link>
          )}

          {/* Mobile: Search and Menu on the right */}
          <div className="flex md:hidden items-center gap-2">
            <SearchBar />

            <Drawer direction="right" open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6 scale-110" />
                </Button>
              </DrawerTrigger>

              <DrawerContent side="right" className="w-72">
                <DrawerHeader className="border-b px-6 py-4">
                  <div className="flex items-center justify-between">
                    <DrawerTitle>Menu</DrawerTitle>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4" />
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>

                <nav className="flex flex-col p-6 space-y-1">
                  <Link
                    href="/explore"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      pathname === "/explore"
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Compass className="w-5 h-5" />
                    <span className="font-medium">Explore</span>
                  </Link>

                  <Link
                    href="/my-books"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      pathname === "/my-books"
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">My Books</span>
                  </Link>

                  <div className="pt-4 border-t mt-4">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="font-medium">Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    {loading ? (
                      <div className="flex items-center gap-2 px-4 py-3 mb-2 rounded-lg bg-muted animate-pulse">
                        <div className="w-4 h-4 bg-muted-foreground/20 rounded-full" />
                        <div className="w-24 h-4 bg-muted-foreground/20 rounded" />
                      </div>
                    ) : authUser ? (
                      <>
                        <div className="flex items-center gap-2 px-4 py-3 mb-2 rounded-lg bg-muted">
                          {profile?.avatar_url ? (
                            <img 
                              src={profile.avatar_url} 
                              alt="Profile" 
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          <span className="text-sm">{profile?.display_name || profile?.username || authUser.email?.split('@')[0]}</span>
                        </div>
                        
                        <Link href="/profile" className="block">
                          <Button variant="ghost" className="w-full justify-start">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                          </Button>
                        </Link>
                        
                        <Link href="/settings" className="block">
                          <Button variant="ghost" className="w-full justify-start">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Button>
                        </Link>
                        
                        <Button variant="secondary" className="w-full justify-start" onClick={handleSignOut}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Link href="/login" className="block">
                        <Button className="w-full">
                          Login
                        </Button>
                      </Link>
                    )}
                  </div>
                </nav>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Navbar;
