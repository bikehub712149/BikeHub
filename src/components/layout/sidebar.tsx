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

export const navLinks = [
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

export function SidebarNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <div className="flex h-16 lg:h-22 items-center justify-center border-b px-4">
        <h1 className="text-xl font-bold">BikeHub</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
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
          onClick={onNavigate}
          className="block font-medium transition-colors hover:text-foreground"
        >
          Terms &amp; Conditions
        </Link>
        <a
          href="https://dev-nasim.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-xs transition-colors hover:text-foreground"
        >
          -- dev.nasim
        </a>
      </div>
    </>
  );
}

export default function Sidebar() {
  return (
    <aside className="sticky top-0 z-40 hidden lg:flex h-screen w-56 shrink-0 flex-col border-r bg-background">
      <SidebarNavContent />
    </aside>
  );
}