import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility to add tw- prefix to Tailwind classes
type ClassValue = string | number | null | undefined | ClassValue[];

export function tw(...inputs: ClassValue[]): string {
  return inputs
    .flat(Infinity)
    .filter(Boolean)
    .map((cls) =>
      typeof cls === "string"
        ? cls
            .split(" ")
            .map((c) => (c.startsWith("tw-") ? c : `tw-${c}`))
            .join(" ")
        : cls
    )
    .join(" ");
}

// Dashboard-specific className utility (uses tw and cn)
export function dcn(...inputs: ClassValue[]): string {
  return tw(inputs);
}
