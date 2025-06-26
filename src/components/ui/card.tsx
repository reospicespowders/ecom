import * as React from "react";

export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className ?? ""}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className ?? ""}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <h3 className={`font-semibold leading-none tracking-tight ${className ?? ""}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-0 ${className ?? ""}`} {...props}>
      {children}
    </div>
  );
} 