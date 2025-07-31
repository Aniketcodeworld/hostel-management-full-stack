import { AdminAllotees } from "@/components/admin/admin-allotees"

export default function AlloteesPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Manage Allotees</h1>
      <p className="text-muted-foreground">View and manage all registered hostel allotees.</p>
      <AdminAllotees />
    </div>
  )
} 