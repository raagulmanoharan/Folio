import { StatusBar } from "@/components/StatusBar";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionAtmosphere } from "@/components/SectionAtmosphere";
import { KeyValueTable } from "@/components/KeyValueTable";
import { LogTable } from "@/components/LogTable";
import { ExpandableRow } from "@/components/ExpandableRow";
import { HashSync } from "@/components/HashSync";
import { hero, dossier } from "@/content/profile";
import { work } from "@/content/work";
import { writing } from "@/content/writing";
import { contact } from "@/content/contact";

const LAST_UPDATED = new Date().toISOString().slice(0, 10);

const tocRows = [
  { n: "01", section: "PROFILE", summary: "Role, focus, education, location", href: "#profile" },
  { n: "02", section: "WORK", summary: "Projects, 0→1 and enterprise", href: "#work" },
  { n: "03", section: "WRITING", summary: "On AI interfaces, interaction, and design", href: "#writing" },
  { n: "04", section: "CONTACT", summary: "Email, socials, features", href: "#contact" },
];

export default function Page() {
  return (
    <>
      <StatusBar />
      <main
        id="main"
        className="mx-auto px-[var(--gutter)]"
        style={{
          maxWidth: "var(--max-w)",
          paddingTop: 36,
        }}
      >
        {/* 01 — INDEX */}
        <section id="index" className="pt-[var(--pad-section-y)] pb-8">
          <h1
            className="max-w-[22ch]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--t-hero)",
              lineHeight: "var(--lh-display)",
              letterSpacing: "var(--track-tight)",
              fontWeight: 500,
            }}
          >
            {hero.line}
          </h1>

          <p
            className="mt-8 max-w-[64ch] text-[var(--muted)]"
            style={{ fontSize: "var(--t-body-lg)" }}
          >
            {hero.dek}
          </p>

          <SectionAtmosphere
            src="/img/atmosphere/00-index.webp"
            alt="Muted gradient field, dark horizon band dissolving upward."
            priority
          />

          <div className="mt-12">
            <table
              className="w-full text-left"
              style={{ fontSize: "var(--t-body)" }}
            >
              <thead className="sr-only">
                <tr>
                  <th>Number</th>
                  <th>Section</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {tocRows.map((r) => (
                  <tr
                    key={r.n}
                    className="border-b border-[var(--rule)] last:border-b-0"
                  >
                    <td className="py-[var(--pad-row-y)] pr-4 align-baseline text-[var(--muted)] w-12">
                      {r.n}
                    </td>
                    <td className="py-[var(--pad-row-y)] pr-4 align-baseline w-28 sm:w-36">
                      <a href={r.href}>{r.section}</a>
                    </td>
                    <td className="py-[var(--pad-row-y)] pr-0 align-baseline text-[var(--muted)] hidden sm:table-cell">
                      <a href={r.href}>{r.summary}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 01 — PROFILE */}
        <section id="profile" className="pb-[var(--pad-section-y)]">
          <SectionHeader title="Profile" />
          <SectionAtmosphere
            src="/img/atmosphere/01-profile.webp"
            alt="Soft warm gradient field, ochre bleeding into paper."
          />
          <KeyValueTable rows={dossier.map((d) => ({ key: d.key, value: d.value }))} />
        </section>

        {/* 02 — WORK */}
        <section id="work" className="pb-[var(--pad-section-y)]">
          <SectionHeader title="Work" />
          <SectionAtmosphere
            src="/img/atmosphere/02-work.webp"
            alt="Three horizontal strata — paper, ochre, near-black — stacked like sediment."
            priority
          />
          <div
            className="grid gap-x-6 px-0 py-[var(--pad-row-y)] border-b border-[var(--rule)] text-[var(--muted)] uppercase"
            style={{
              fontSize: "var(--t-meta)",
              gridTemplateColumns:
                "5rem minmax(0, 1.2fr) minmax(0, 1.4fr) minmax(0, 1fr)",
            }}
            role="row"
          >
            <span>DATE</span>
            <span>PROJECT</span>
            <span>CONTEXT</span>
            <span>ROLE</span>
          </div>
          <div role="rowgroup">
            {work.map((row) => (
              <ExpandableRow key={row.slug} row={row} />
            ))}
          </div>
        </section>

        {/* 03 — WRITING */}
        <section id="writing" className="pb-[var(--pad-section-y)]">
          <SectionHeader title="Writing" />
          <SectionAtmosphere
            src="/img/atmosphere/03-writing.webp"
            alt="Warm paper field with a dark charcoal column along the left edge."
          />
          {writing.length === 0 ? (
            <p
              className="text-[var(--muted)]"
              style={{ fontSize: "var(--t-body)" }}
            >
              Nothing here yet. Notes in progress at{" "}
              <a
                href="https://raagulmanoharan.com/ramblings"
                target="_blank"
                rel="noopener noreferrer"
              >
                /ramblings
              </a>
              .
            </p>
          ) : (
            <LogTable
              caption="Writing log"
              columns={[
                { key: "date", label: "DATE", className: "w-20" },
                { key: "title", label: "TITLE" },
                { key: "topic", label: "TOPIC", className: "hidden sm:table-cell w-32" },
                { key: "length", label: "LEN", className: "w-16" },
              ]}
              rows={writing.map((w) => ({
                date: w.date,
                title: (
                  <>
                    <a
                      href={w.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {w.title}
                    </a>
                    {w.draft && (
                      <span className="ml-2 text-[var(--muted)]">[DRAFT]</span>
                    )}
                  </>
                ),
                topic: <span className="text-[var(--muted)]">{w.topic}</span>,
                length: <span className="text-[var(--muted)]">{w.length}</span>,
              }))}
            />
          )}
        </section>

        {/* 04 — CONTACT */}
        <section id="contact" className="pb-[var(--pad-section-y)]">
          <SectionHeader title="Contact" />
          <SectionAtmosphere
            src="/img/atmosphere/04-contact.webp"
            alt="Near-black field with a soft ochre glow diffused into darkness."
          />
          <KeyValueTable
            rows={contact.map((c) => ({
              key: c.key,
              value: c.value,
              href: c.href,
              external: c.external,
            }))}
          />
        </section>

        <footer
          className="border-t border-[var(--rule)] py-6 text-[var(--muted)]"
          style={{ fontSize: "var(--t-meta)" }}
        >
          © 2026 RAAGUL MANOHARAN — last updated {LAST_UPDATED}
        </footer>
      </main>
      <HashSync />
    </>
  );
}
