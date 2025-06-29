"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UserOrdersTable from "@/components/dashboard/UserOrdersTable";
import AdminOrdersTable from "@/components/dashboard/AdminOrdersTable";
import { useUser } from "@clerk/nextjs";

export default function DashboardOrdersPage() {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.admin_role === "admin";

  return (
    <div className="dashboard-bg tw-py-10 tw-px-2 sm:tw-px-6 lg:tw-px-12">
      {/* Header Section */}
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-start md:tw-items-center tw-justify-between tw-gap-4 tw-mb-6">
        <div>
          <h1 className="tw-text-3xl tw-font-bold tw-text-gray-900">{isAdmin ? "All Orders" : "My Orders"}</h1>
          <div className="tw-text-muted-foreground tw-text-base">{isAdmin ? "Manage all customer orders" : "Track and manage your orders"}</div>
        </div>
        <div className="tw-flex tw-gap-2 tw-mt-2 md:tw-mt-0">
          <Input className="tw-w-56" placeholder="Search orders..." />
          <Button variant="outline" size="sm" className="tw-flex tw-items-center tw-gap-2">
            Export
          </Button>
        </div>
      </div>
      {/* Main Content: Table */}
      <div className="card-modern">
        {isLoaded ? (
          isAdmin ? <AdminOrdersTable /> : <UserOrdersTable />
        ) : (
          <div className="p-8 text-center">Loading...</div>
        )}
      </div>
    </div>
  );
} 