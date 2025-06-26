import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Package, Users, Warehouse, Settings, Bell } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r flex flex-col">
        <div className="h-16 flex items-center justify-center border-b">
          <span className="font-bold text-lg">Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-2 p-2 rounded hover:bg-secondary"><LayoutDashboard size={18}/> Dashboard</Link>
          <Link href="/admin/orders" className="flex items-center gap-2 p-2 rounded hover:bg-secondary"><ShoppingCart size={18}/> Orders</Link>
          <Link href="/admin/inventory" className="flex items-center gap-2 p-2 rounded hover:bg-secondary"><Package size={18}/> Inventory</Link>
          <Link href="/admin/customers" className="flex items-center gap-2 p-2 rounded hover:bg-secondary"><Users size={18}/> Customers</Link>
          <Link href="/admin/notifications" className="flex items-center gap-2 p-2 rounded hover:bg-secondary"><Bell size={18}/> Notifications</Link>
          <Link href="/admin/settings" className="flex items-center gap-2 p-2 rounded hover:bg-secondary"><Settings size={18}/> Settings</Link>
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 bg-background p-6">
        {children}
      </main>
    </div>
  );
} 