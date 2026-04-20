import type { CurrentlyItem } from "@/content/currently";

export function CurrentlyList({ items }: { items: CurrentlyItem[] }) {
  if (items.length === 0) {
    return (
      <p
        className="text-[var(--muted)]"
        style={{ fontSize: "var(--t-body)" }}
      >
        Nothing logged yet.
      </p>
    );
  }

  return (
    <ul style={{ fontSize: "var(--t-body)" }}>
      {items.map((item, i) => (
        <li
          key={i}
          className="grid gap-x-6 px-0 py-[var(--pad-row-y)] border-b border-[var(--rule)]"
          style={{ gridTemplateColumns: "8rem minmax(0, 1fr)" }}
        >
          <span
            className="text-[var(--muted)] uppercase"
            style={{ fontSize: "var(--t-meta)" }}
          >
            {item.kind}
          </span>
          <div>
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-[3px]"
              >
                {item.title} ↗
              </a>
            ) : (
              <span>{item.title}</span>
            )}
            {item.note && (
              <p className="mt-1 text-[var(--muted)]">{item.note}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
