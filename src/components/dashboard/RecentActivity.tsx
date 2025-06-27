import { Card } from "@/components/ui/card";

const activities = [
  { id: 1, text: "Order #1234 placed", time: "2 min ago" },
  { id: 2, text: "User John Doe signed up", time: "10 min ago" },
  { id: 3, text: "Product 'Apple' restocked", time: "1 hour ago" },
  { id: 4, text: "Order #1233 shipped", time: "2 hours ago" },
];

export default function RecentActivity() {
  return (
    <Card className="tw-p-4 tw-bg-white tw-shadow-sm">
      <div className="tw-font-semibold tw-mb-2">Recent Activity</div>
      <ul className="tw-space-y-2">
        {activities.map((a) => (
          <li key={a.id} className="tw-flex tw-justify-between tw-text-sm tw-text-muted-foreground">
            <span>{a.text}</span>
            <span className="tw-text-xs tw-text-muted">{a.time}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
} 