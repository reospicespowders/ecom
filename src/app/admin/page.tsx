"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ShoppingCart, Package, Users, Warehouse, Bell } from "lucide-react";

const metricIcons = {
  ordersToday: <ShoppingCart size={24} />,
  revenueMonth: <BarChart3 size={24} />,
  lowStock: <Warehouse size={24} />,
  topProducts: <Package size={24} />,
};

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analytics/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
        const data = await res.json();
        setMetrics(data);
      } catch (e: any) {
        setError(e.message);
      }
      setLoading(false);
    }
    fetchMetrics();
  }, []);

  return (
    <div>
      <header className="h-16 flex items-center border-b mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Metrics Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <span className="text-muted-foreground">{metricIcons.ordersToday}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : metrics?.ordersToday ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
            <span className="text-muted-foreground">{metricIcons.revenueMonth}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : metrics?.revenueMonth ?? '$0'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
            <span className="text-muted-foreground">{metricIcons.lowStock}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : metrics?.lowStock?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Products</CardTitle>
            <span className="text-muted-foreground">{metricIcons.topProducts}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : metrics?.topProducts?.length ?? 0}</div>
          </CardContent>
        </Card>
      </section>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {/* Placeholders for tables/grids */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardContent>
            {/* OrdersTable placeholder */}
            <div className="text-muted-foreground">OrdersTable coming soon...</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Inventory Status</CardTitle></CardHeader>
          <CardContent>
            {/* InventoryGrid placeholder */}
            <div className="text-muted-foreground">InventoryGrid coming soon...</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent>
            {/* NotificationCenter placeholder */}
            <div className="text-muted-foreground">NotificationCenter coming soon...</div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
} 