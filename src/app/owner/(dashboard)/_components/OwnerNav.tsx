"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/owner", label: "Overview" },
  { href: "/owner/content", label: "Content" },
  { href: "/owner/assets", label: "Assets" },
  { href: "/owner/agents", label: "Agents" },
  { href: "/owner/agents-canvas", label: "Canvas" },
];

export const OwnerNav = () => {
  const pathname = usePathname();

  return (
    <nav className="owner-nav owner-nav--bar" aria-label="Owner sections">
      <ul>
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href || (pathname?.startsWith(link.href + "/") ?? false);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`owner-nav__link ${isActive ? "owner-nav__link--active" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
