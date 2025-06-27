import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CustomersTable from "@/components/dashboard/CustomersTable";

export default function CustomersDashboard() {
  return (
    <div className="dashboard-bg tw-py-10 tw-px-2 sm:tw-px-6 lg:tw-px-12">
      {/* Header Section */}
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-start md:tw-items-center tw-justify-between tw-gap-4 tw-mb-6">
        <div>
          <h1 className="tw-text-3xl tw-font-bold tw-text-gray-900">Customers</h1>
          <div className="tw-text-muted-foreground tw-text-base">Manage your store's customers</div>
        </div>
        <div className="tw-flex tw-gap-2 tw-mt-2 md:tw-mt-0">
          <Input className="tw-w-56" placeholder="Search customers..." />
          <Button variant="outline" size="sm" className="tw-flex tw-items-center tw-gap-2">
            Export
          </Button>
          <Button size="sm" className="tw-flex tw-items-center tw-gap-2">
            Add Customer
          </Button>
        </div>
      </div>
      {/* Stats Overview */}
      <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6 tw-mb-8">
        {/* Total Customers */}
        <div className="card-modern tw-shadow-lg tw-rounded-xl tw-bg-white tw-p-8 tw-flex tw-flex-col tw-gap-3">
          <div className="tw-text-gray-500 tw-text-base">Total Customers</div>
          <div className="tw-text-4xl tw-font-extrabold tw-text-[var(--color-neutral-700)]">2,340</div>
          <div className="tw-mt-2 tw-h-7 tw-bg-[var(--color-neutral-200)] tw-rounded-lg tw-flex tw-items-center tw-overflow-hidden">
            <span className="tw-text-[var(--color-neutral-500)] tw-text-base tw-font-semibold tw-px-4">+3.2% this month</span>
          </div>
        </div>
        {/* New This Month */}
        <div className="card-modern tw-shadow-lg tw-rounded-xl tw-bg-white tw-p-8 tw-flex tw-flex-col tw-gap-3">
          <div className="tw-text-gray-500 tw-text-base">New This Month</div>
          <div className="tw-text-4xl tw-font-extrabold tw-text-[var(--color-neutral-700)]">120</div>
          <div className="tw-mt-2 tw-h-7 tw-bg-[var(--color-neutral-100)] tw-rounded-lg tw-flex tw-items-center tw-overflow-hidden tw-border tw-border-[var(--color-neutral-200)]">
            <span className="tw-text-[var(--color-neutral-500)] tw-text-base tw-font-semibold tw-px-4">+12% vs last month</span>
          </div>
        </div>
        {/* Active Customers */}
        <div className="card-modern tw-shadow-lg tw-rounded-xl tw-bg-white tw-p-8 tw-flex tw-flex-col tw-gap-3">
          <div className="tw-text-gray-500 tw-text-base">Active Customers</div>
          <div className="tw-text-4xl tw-font-extrabold tw-text-[var(--color-neutral-700)]">1,850</div>
          <div className="tw-mt-2 tw-h-7 tw-bg-[var(--color-primary-100)] tw-rounded-lg tw-flex tw-items-center tw-overflow-hidden">
            <div className="tw-bg-[var(--color-primary-500)] tw-h-full tw-w-[79%] tw-flex tw-items-center tw-justify-start tw-rounded-lg tw-transition-all">
              <span className="tw-text-white tw-text-base tw-font-semibold tw-px-4">79% active</span>
            </div>
          </div>
        </div>
        {/* Avg. Order Value */}
        <div className="card-modern tw-shadow-lg tw-rounded-xl tw-bg-white tw-p-8 tw-flex tw-flex-col tw-gap-3">
          <div className="tw-text-gray-500 tw-text-base">Avg. Order Value</div>
          <div className="tw-text-4xl tw-font-extrabold tw-text-[var(--color-neutral-700)]">$87.50</div>
          <div className="tw-mt-2 tw-h-7 tw-bg-[var(--color-neutral-200)] tw-rounded-lg tw-flex tw-items-center tw-overflow-hidden">
            <span className="tw-text-[var(--color-neutral-500)] tw-text-base tw-font-semibold tw-px-4">+5.1% this month</span>
          </div>
        </div>
      </div>
      {/* Main Content: Table */}
      <div className="card-modern">
        <CustomersTable />
      </div>
    </div>
  );
} 