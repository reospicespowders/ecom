import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdminOrdersTable from "@/components/dashboard/AdminOrdersTable";

export default function AdminOrdersPage() {
  return (
    <div className="dashboard-bg tw-py-10 tw-px-2 sm:tw-px-6 lg:tw-px-12">
      {/* Header Section */}
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-start md:tw-items-center tw-justify-between tw-gap-4 tw-mb-6">
        <div>
          <h1 className="tw-text-3xl tw-font-bold tw-text-gray-900">Orders</h1>
          <div className="tw-text-muted-foreground tw-text-base">Manage all store orders</div>
        </div>
        <div className="tw-flex tw-gap-2 tw-mt-2 md:tw-mt-0">
          <Input className="tw-w-56" placeholder="Search orders..." />
          <Button variant="outline" size="sm" className="tw-flex tw-items-center tw-gap-2">
            Export
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6 tw-mb-8">
        {/* Total Orders */}
        <div className="card-modern tw-shadow-lg tw-rounded-xl tw-bg-white tw-p-8 tw-flex tw-flex-col tw-gap-3">
          <div className="tw-text-gray-500 tw-text-base">Total Orders</div>
          <div className="tw-text-4xl tw-font-extrabold tw-text-[var(--color-neutral-700)]">1,234</div>
          <div className="tw-mt-2 tw-h-7 tw-bg-[var(--color-neutral-200)] tw-rounded-lg tw-flex tw-items-center tw-overflow-hidden">
            <span className="tw-text-[var(--color-neutral-500)] tw-text-base tw-font-semibold tw-px-4">+12.5% this month</span>
          </div>
        </div>
        
        {/* Pending Orders */}
        <div className="card-modern tw-shadow-lg tw-rounded-xl tw-bg-white tw-p-8 tw-flex tw-flex-col tw-gap-3">
          <div className="tw-text-gray-500 tw-text-base">Pending Orders</div>
          <div className="tw-text-4xl tw-font-extrabold tw-text-[var(--color-neutral-700)]">45</div>
          <div className="tw-mt-2 tw-h-7 tw-bg-[var(--color-warning-100)] tw-rounded-lg tw-flex tw-items-center tw-overflow-hidden">
            <span className="tw-text-[var(--color-warning-600)] tw-text-base tw-font-semibold tw-px-4">Needs attention</span>
          </div>
        </div>
        
        {/* Revenue */}
        <div className="card-modern tw-shadow-lg tw-rounded-xl tw-bg-white tw-p-8 tw-flex tw-flex-col tw-gap-3">
          <div className="tw-text-gray-500 tw-text-base">Total Revenue</div>
          <div className="tw-text-4xl tw-font-extrabold tw-text-[var(--color-neutral-700)]">$45,678</div>
          <div className="tw-mt-2 tw-h-7 tw-bg-[var(--color-success-100)] tw-rounded-lg tw-flex tw-items-center tw-overflow-hidden">
            <span className="tw-text-[var(--color-success-600)] tw-text-base tw-font-semibold tw-px-4">+8.3% this month</span>
          </div>
        </div>
        
        {/* Avg Order Value */}
        <div className="card-modern tw-shadow-lg tw-rounded-xl tw-bg-white tw-p-8 tw-flex tw-flex-col tw-gap-3">
          <div className="tw-text-gray-500 tw-text-base">Avg Order Value</div>
          <div className="tw-text-4xl tw-font-extrabold tw-text-[var(--color-neutral-700)]">$87.50</div>
          <div className="tw-mt-2 tw-h-7 tw-bg-[var(--color-neutral-200)] tw-rounded-lg tw-flex tw-items-center tw-overflow-hidden">
            <span className="tw-text-[var(--color-neutral-500)] tw-text-base tw-font-semibold tw-px-4">+5.1% this month</span>
          </div>
        </div>
      </div>
      
      {/* Main Content: Table */}
      <div className="card-modern">
        <AdminOrdersTable />
      </div>
    </div>
  );
} 