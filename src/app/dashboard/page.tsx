import StatsCard from "@/components/dashboard/StatsCard";
import SalesChart from "@/components/dashboard/SalesChart";
import OrdersTable from "@/components/dashboard/OrdersTable";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { FaShoppingCart, FaDollarSign, FaUsers } from "react-icons/fa";

export default function DashboardHome() {
  return (
    <div className="tw-space-y-6">
      {/* Stats Cards */}
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
        <StatsCard title="Orders" value={1280} icon={<FaShoppingCart />} />
        <StatsCard title="Revenue" value="$12,400" icon={<FaDollarSign />} />
        <StatsCard title="Customers" value={320} icon={<FaUsers />} />
      </div>
      {/* Chart and Table */}
      <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-4">
        <div className="lg:tw-col-span-2">
          <SalesChart />
        </div>
        <RecentActivity />
      </div>
      <OrdersTable />
    </div>
  );
} 