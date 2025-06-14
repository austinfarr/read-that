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
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <Card className="bg-background/80 backdrop-blur-md py-3 px-8 border border-border/20 flex items-center justify-between gap-6 rounded-2xl shadow-lg">
        {/* Logo here */}
        <div className="hidden md:flex items-center gap-12">
          <Link href="/" className="text-2xl font-bold text-primary">
            ReadThat
          </Link>

          <nav className="flex items-center gap-2">
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
        </div>

        <SearchBar />

        <div className="flex items-center">
          <Button variant="secondary" className="hidden md:block px-2">
            Login
          </Button>
          <Button className="hidden md:block ml-2 mr-2">Get Started</Button>

          <div className="flex md:hidden mr-2 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span className="py-2 px-2 bg-gray-100 rounded-md">Pages</span>
              </DropdownMenuTrigger>

              {/* <DropdownMenuContent align="start">
              {landings.map((page) => (
                <DropdownMenuItem key={page.id}>
                  <Link href={page.route}>{page.title}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent> */}
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5 rotate-0 scale-100" />
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

          <ThemeToggle />
        </div>
      </Card>
    </div>
  );
};

// const landings = [
//   {
//     id: randomUUID(),
//     title: "Landing 01",
//     route: "/project-management",
//   },
//   {
//     id: randomUUID(),
//     title: "Landing 02",
//     route: "/crm-landing",
//   },
//   {
//     id: randomUUID(),
//     title: "Landing 03",
//     route: "/ai-content-landing",
//   },
//   {
//     id: randomUUID(),
//     title: "Landing 04",
//     route: "/new-intro-landing",
//   },
//   {
//     id: randomUUID(),
//     title: "Landing 05",
//     route: "/about-us-landing",
//   },
//   {
//     id: randomUUID(),
//     title: "Landing 06",
//     route: "/contact-us-landing",
//   },
//   {
//     id: randomUUID(),
//     title: "Landing 07",
//     route: "/faqs-landing",
//   },
//   {
//     id: randomUUID(),
//     title: "Landing 08",
//     route: "/pricing-landing",
//   },
//   {
//     id: randomUUID(),
//     title: "Landing 09",
//     route: "/career-landing",
//   },
// ];

export default Navbar;
