import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import "@/styles/dashboard.css";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div className="tw-flex tw-min-h-screen">
        <Sidebar />
        <main className="tw-flex-1 tw-p-6 tw-bg-muted/50">{children}</main>
      </div>
    </DashboardLayout>
  );
} 