import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();

  // Orders today
  const { data: ordersTodayData } = await supabase
    .from("orders")
    .select("id")
    .gte("created_at", new Date().toISOString().slice(0, 10));
  const ordersToday = ordersTodayData?.length ?? 0;

  // Revenue this month
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("status", "delivered")
    .gte("created_at", firstOfMonth.toISOString());
  const revenueMonth = revenueData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) ?? 0;

  // Low stock products
  const { data: lowStock } = await supabase
    .from("product_inventory")
    .select("*")
    .lte("stock_quantity", 10); // Example threshold

  // Top selling products
  const { data: topProducts } = await supabase
    .from("order_items")
    .select("sanity_product_id, quantity")
    .order("quantity", { ascending: false })
    .limit(10);

  return NextResponse.json({
    ordersToday,
    revenueMonth,
    lowStock: lowStock || [],
    topProducts: topProducts || [],
  });
} 