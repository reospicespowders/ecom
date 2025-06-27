"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTachometerAlt, FaBox, FaUsers, FaShoppingCart, FaCog } from "react-icons/fa";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
  { href: "/dashboard/orders", label: "Orders", icon: <FaShoppingCart /> },
  { href: "/dashboard/customers", label: "Customers", icon: <FaUsers /> },
  { href: "/dashboard/products", label: "Products", icon: <FaBox /> },
  { href: "/dashboard/settings", label: "Settings", icon: <FaCog /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="tw-bg-white tw-shadow-sm tw-h-full tw-p-4 tw-w-56 tw-flex tw-flex-col tw-gap-2">
      <div className="tw-font-bold tw-text-lg tw-mb-4">Dashboard</div>
      <nav className="tw-flex-1 tw-flex tw-flex-col tw-gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`tw-flex tw-items-center tw-gap-2 tw-py-2 tw-px-3 tw-rounded tw-transition tw-text-base ${
              pathname === item.href
                ? "tw-bg-blue-100 tw-text-blue-700"
                : "tw-text-muted-foreground hover:tw-bg-muted"
            }`}
          >
            <span className="tw-text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
} 