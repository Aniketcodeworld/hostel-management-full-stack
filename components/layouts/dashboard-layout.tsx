"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, CalendarCheck, Home, MessageSquare, UserPlus, LogOut, Menu, X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ElementType
    adminOnly?: boolean
  }[]
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  const sidebarItems = [
    {
      href: "/dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/attendance",
      title: "Attendance",
      icon: CalendarCheck,
    },
    {
      href: "/dashboard/rooms",
      title: "Rooms",
      icon: Home,
    },
    {
      href: "/dashboard/complaints",
      title: "Complaints",
      icon: MessageSquare,
    },
    {
      href: "/dashboard/register",
      title: "Register Allottee",
      icon: UserPlus,
      adminOnly: true,
    },
  ]

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Hostel Management</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-xs font-medium uppercase text-gray-500">{user?.role}</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <SidebarNav items={sidebarItems.filter((item) => !item.adminOnly || user?.role === "admin")} />
          </nav>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full justify-start" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

function SidebarNav({ items, className, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col space-y-1", className)} {...props}>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium",
              pathname === item.href
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

