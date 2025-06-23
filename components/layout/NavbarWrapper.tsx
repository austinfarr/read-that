"use client";

import { useUser } from "@/hooks/useUser";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const { authUser } = useUser();
  
  // Use authUser ID as key to force Navbar re-mount when auth changes
  // This ensures fresh state when logging in/out
  const navbarKey = authUser?.id || 'anonymous';
  
  return <Navbar key={navbarKey} />;
}