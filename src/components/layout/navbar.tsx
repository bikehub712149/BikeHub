"use client";

import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/inventory": "Inventory",
  "/sales": "Sales",
  "/customers": "Customers",
  "/settings": "Settings",
};

export default function Navbar() {
  const pathname = usePathname();

  const title = titles[pathname] ?? "BikeHub";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Left */}
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search..."
          className="hidden w-64 md:flex"
        />

        <Avatar>
          <AvatarFallback>NA</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}