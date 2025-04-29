"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
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
  console.log("pathname", pathname);

  return (
    <Card className="bg-card py-3 px-8 border-0 flex items-center justify-between gap-6 rounded-2xl mt-5">
      {/* Logo here */}
      <ul className="hidden md:flex items-center gap-10 text-card-foreground">
        <p className="text-2xl font-bold text-primary">ReadThat</p>
        <li
          className={`text-primary font-medium ${
            pathname === "/" ? "text-primary" : "text-black"
          }`}
        >
          <Link href="/">Home</Link>
        </li>
        <li
          className={`text-primary font-medium ${
            pathname === "/explore" ? "text-primary" : "text-black"
          }`}
        >
          <a href="/explore">Explore</a>
        </li>
      </ul>

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

            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <a href="#home">Home</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="#features">Features</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="#pricing">Pricing</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="#faqs">FAQs</a>
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
