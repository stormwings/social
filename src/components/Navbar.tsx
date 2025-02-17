"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/private/home", label: "Home" },
  { href: "/private/feed", label: "Trades" },
  { href: "/private/explorer", label: "Explore" },
  { href: "/private/posts", label: "Posts" },
  { href: "/private/chats", label: "Chats" },
  { href: "/private/account", label: "Account" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 bg-gray-100 shadow">
      <div className="flex justify-between">
        {NAV_ITEMS.map(({ href, label }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`w-full flex items-center justify-center py-3 text-xs font-medium ${
                isActive ? "text-black font-semibold" : "text-gray-500"
              }`}
              data-testid={`nav-item-${label.toLowerCase()}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}