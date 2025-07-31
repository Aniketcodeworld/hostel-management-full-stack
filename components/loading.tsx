'use client'

import { cn } from "@/lib/utils"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner className="h-12 w-12" />
    </div>
  )
} 