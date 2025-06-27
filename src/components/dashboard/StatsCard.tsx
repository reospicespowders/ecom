import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export default function StatsCard({ title, value, icon, className = "" }: StatsCardProps) {
  return (
    <Card className={`tw-flex tw-items-center tw-gap-4 tw-p-4 tw-bg-white tw-shadow-sm ${className}`}>
      {icon && <div className="tw-text-3xl tw-text-primary">{icon}</div>}
      <div>
        <div className="tw-text-sm tw-text-muted-foreground tw-font-medium">{title}</div>
        <div className="tw-text-2xl tw-font-bold tw-text-foreground">{value}</div>
      </div>
    </Card>
  );
} 