"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bike,
  Users,
  ShoppingCart,
  ClipboardCheck,
  Settings,
} from "lucide-react";

const links = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Bike,
  },
  {
    title: "Sales",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    title: "Paperwork",
    href: "/paperwork",
    icon: ClipboardCheck,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-40 flex h-screen w-56 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-22 items-center justify-center border-b">
        <h1 className="text-xl font-bold">BikeHub</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Icon size={18} />
              <span>{link.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-3 py-3 text-right text-xs text-muted-foreground">
        <Link
          href="/terms"
          className="block font-medium transition-colors hover:text-foreground"
        >
          Terms &amp; Conditions
        </Link>
        <span className="mt-1 block text-xs">-- dev.nasim</span>
      </div>
    </aside>
  );
}