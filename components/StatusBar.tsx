import { Mark } from "./Mark";
import { availability, identity } from "@/content/profile";

const navItems = [
  { n: "01", label: "INDEX", href: "#index" },
  { n: "02", label: "PROFILE", href: "#profile" },
  { n: "03", label: "WORK", href: "#work" },
  { n: "04", label: "WRITING", href: "#writing" },
  { n: "05", label: "CONTACT", href: "#contact" },
];

export function StatusBar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)] border-b border-[var(--rule)]"
      style={{ height: 36 }}
    >
      <div className="mx-auto flex h-full items-center justify-between gap-6 px-[var(--gutter)] overflow-x-auto whitespace-nowrap">
        <div
          className="flex items-center gap-4"
          style={{ fontSize: "var(--t-meta)" }}
        >
          <span className="flex items-center gap-2">
            <Mark />
            <span>{identity.name}</span>
          </span>
          <span className="hidden sm:inline text-[var(--muted)]">·</span>
          <span className="hidden sm:inline">{identity.role}</span>
          <span className="hidden md:inline text-[var(--muted)]">·</span>
          <span className="hidden md:inline">{identity.location}</span>
          {availability.state !== "hidden" && (
            <span
              className="hidden md:inline-flex items-center border border-[var(--accent)] text-[var(--accent)] px-1.5 py-px"
              style={{ fontSize: "var(--t-meta)" }}
            >
              [ {availability.label} ]
            </span>
          )}
        </div>
        <nav
          aria-label="Sections"
          className="flex items-center gap-3"
          style={{ fontSize: "var(--t-meta)" }}
        >
          {navItems.map((item, i) => (
            <span key={item.n} className="flex items-center gap-3">
              {i > 0 && <span className="text-[var(--muted)]">·</span>}
              <a href={item.href} className="text-[var(--muted)]">
                <span>{item.n}</span>
                <span className="ml-1 hidden sm:inline">{item.label}</span>
              </a>
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}
