export const navLinks = [
  { href: "/about", key: "about" },
  { href: "/works", key: "works" },
  { href: "/ai-agent", key: "librarian" },
] as const;

export const headerNav = [
  { type: "link", href: "/about", key: "about" },
  { type: "link", href: "/works", key: "works" },
  { type: "link", href: "/ai-agent", key: "librarian" },
] as const;

export type NavLink = (typeof navLinks)[number];
export type NavKey = NavLink["key"];
export type HeaderNavItem = (typeof headerNav)[number];
export type NavLabelKey = NavKey;
