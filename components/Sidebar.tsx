"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  MessageSquare,
  AlertTriangle,
  Settings,
  Building2
} from "lucide-react";

const routes = [
  {
    label: "Overview",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Students",
    icon: Users,
    href: "/dashboard/students",
  },
  {
    label: "Rooms",
    icon: Building2,
    href: "/dashboard/rooms",
  },
  {
    label: "Complaints",
    icon: AlertTriangle,
    href: "/dashboard/complaints",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/dashboard/messages",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 flex h-full w-64 flex-col glass-effect border-r">
      <div className="flex flex-col gap-2 p-4 pt-24">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              pathname === route.href ? "bg-accent" : ""
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
} 