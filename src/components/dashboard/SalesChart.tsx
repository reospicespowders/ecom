"use client";

import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", sales: 120 },
  { name: "Tue", sales: 210 },
  { name: "Wed", sales: 150 },
  { name: "Thu", sales: 278 },
  { name: "Fri", sales: 189 },
  { name: "Sat", sales: 239 },
  { name: "Sun", sales: 349 },
];

export default function SalesChart() {
  return (
    <Card className="tw-p-4 tw-bg-white tw-shadow-sm">
      <div className="tw-font-semibold tw-mb-2">Sales (This Week)</div>
      <div className="tw-h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" className="tw-text-xs"/>
            <YAxis className="tw-text-xs"/>
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
} 