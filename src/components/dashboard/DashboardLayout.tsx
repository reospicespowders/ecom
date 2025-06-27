import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardLayout({ children, className = "" }: DashboardLayoutProps) {
  return (
    <div className={`dashboard-container ${className}`}>
      {children}
    </div>
  );
} 