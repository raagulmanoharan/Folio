import { StatusBar } from "@/components/StatusBar";
import { SectionHeader } from "@/components/SectionHeader";
import { KeyValueTable } from "@/components/KeyValueTable";
import { LogTable } from "@/components/LogTable";
import { ExpandableRow } from "@/components/ExpandableRow";
import { HashSync } from "@/components/HashSync";
import { hero, dossier, bio } from "@/content/profile";
import { work } from "@/content/work";
import { writing } from "@/content/writing";
import { contact } from "@/content/contact";

const LAST_UPDATED = new Date().toISOString().slice(0, 10);

const tocRows = [
  { n: "02", section: "PROFILE", summary: "Role, focus, education, location", href: "#profile" },
  { n: "03", section: "WORK", summary: "Projects, case studies, ongoing", href: "#work" },
  { n: "04", section: "WRITING", summary: "Essays and notes", href: "#writing" },
  { n: "05", section: "CONTACT", summary: "Email, socials, music", href: "#contact" },
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
          <div
            className="text-[var(--muted)] uppercase"
            style={{ fontSize: "var(--t-meta)" }}
          >
            INDEX —— R.R / 2026
          </div>

          <h1
            className="mt-8 max-w-[22ch]"
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

          <div className="mt-12">
            <div
              className="text-[var(--muted)] uppercase mb-2"
              style={{ fontSize: "var(--t-meta)" }}
            >
              // CONTENTS
            </div>
            <table
              className="w-full text-left"
              style={{ fontSize: "var(--t-body)" }}
            >
              <thead className="sr-only">
                <tr>
                  <th>Number</th>
                  <th>Section</th>
                  <th>Summary</th>
                  <th>Link</th>
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
                    <td className="py-[var(--pad-row-y)] pr-4 align-baseline text-[var(--muted)] hidden sm:table-cell">
                      {r.summary}
                    </td>
                    <td className="py-[var(--pad-row-y)] pr-0 align-baseline text-right w-8">
                      <a href={r.href} aria-label={`Go to ${r.section}`}>
                        →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 02 — PROFILE */}
        <section id="profile" className="pb-[var(--pad-section-y)]">
          <SectionHeader number="02" slug="PROFILE" title="Profile" />
          <KeyValueTable rows={dossier.map((d) => ({ key: d.key, value: d.value }))} />
          <p
            className="mt-8 max-w-[64ch]"
            style={{ fontSize: "var(--t-body-lg)" }}
          >
            {bio}
          </p>
        </section>

        {/* 03 — WORK */}
        <section id="work" className="pb-[var(--pad-section-y)]">
          <SectionHeader number="03" slug="WORK" title="Work" />
          <div
            className="grid gap-x-4 px-0 py-[var(--pad-row-y)] border-b border-[var(--rule)] text-[var(--muted)] uppercase grid-cols-[5rem_1fr_1fr_1fr_2rem] sm:grid-cols-[5rem_minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_2rem]"
            style={{ fontSize: "var(--t-meta)" }}
            role="row"
          >
            <span>DATE</span>
            <span>PROJECT</span>
            <span>CONTEXT</span>
            <span>ROLE</span>
            <span className="text-right">+</span>
          </div>
          <div role="rowgroup">
            {work.map((row) => (
              <ExpandableRow key={row.slug} row={row} />
            ))}
          </div>
        </section>

        {/* 04 — WRITING */}
        <section id="writing" className="pb-[var(--pad-section-y)]">
          <SectionHeader number="04" slug="WRITING" title="Writing" />
          <LogTable
            caption="Writing log"
            columns={[
              { key: "date", label: "DATE", className: "w-20" },
              { key: "title", label: "TITLE" },
              { key: "topic", label: "TOPIC", className: "hidden sm:table-cell w-32" },
              { key: "length", label: "LEN", className: "w-16" },
              { key: "link", label: "", className: "w-8 text-right" },
            ]}
            rows={writing.map((w) => ({
              date: w.date,
              title: (
                <>
                  <a href={w.url}>{w.title}</a>
                  {w.draft && (
                    <span className="ml-2 text-[var(--muted)]">[DRAFT]</span>
                  )}
                </>
              ),
              topic: <span className="text-[var(--muted)]">{w.topic}</span>,
              length: <span className="text-[var(--muted)]">{w.length}</span>,
              link: (
                <a
                  href={w.url}
                  aria-label={`Read ${w.title}`}
                  className="inline-block text-right"
                >
                  →
                </a>
              ),
            }))}
          />
        </section>

        {/* 05 — CONTACT */}
        <section id="contact" className="pb-[var(--pad-section-y)]">
          <SectionHeader number="05" slug="CONTACT" title="Contact" />
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
          © 2026 R.R — last updated {LAST_UPDATED}
        </footer>
      </main>
      <HashSync />
    </>
  );
}
