import { writing } from "@/content/writing";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBar } from "@/components/StatusBar";
import { PageMeta, type PageMetaRow } from "@/components/PageMeta";
import { PageTitle } from "@/components/PageTitle";
import { NoteBody } from "@/components/NoteBody";
import { NoteNav } from "@/components/NoteNav";
import { LiquidGradient } from "@/components/LiquidGradient";

export function generateStaticParams() {
  return writing
    .filter((w) => w.slug && w.note)
    .map((w) => ({ slug: w.slug! }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = writing.find((w) => w.slug === slug);
  if (!row || !row.note) notFound();

  const note = row.note;
  const idx = writing.findIndex((w) => w.slug === slug);
  const prev = idx > 0 ? writing[idx - 1] : null;
  const next = idx < writing.length - 1 ? writing[idx + 1] : null;

  const rows: PageMetaRow[] = [
    { key: "DATE", value: row.date },
    { key: "TOPIC", value: row.topic },
    { key: "LENGTH", value: row.length },
  ];

  return (
    <>
      <StatusBar />
      <main
        id="main"
        className="mx-auto px-[var(--gutter)]"
        style={{ maxWidth: "var(--max-w)", paddingTop: 36 }}
      >
        <nav
          className="pt-[var(--pad-section-y)] pb-6 text-[var(--muted)] uppercase"
          style={{ fontSize: "var(--t-meta)" }}
        >
          <Link href="/#writing">← WRITING</Link>
          {" / "}
          {row.title.toUpperCase()}
        </nav>

        <PageMeta rows={rows} />

        <PageTitle>{note.summary}</PageTitle>

        <LiquidGradient variant={note.atmosphere} />

        <NoteBody sections={note.sections} />

        <NoteNav prev={prev} next={next} />

        <footer
          className="mt-20 border-t border-[var(--rule)] py-6 text-[var(--muted)]"
          style={{ fontSize: "var(--t-meta)" }}
        >
          © 2026 RAAGUL MANOHARAN
        </footer>
      </main>
    </>
  );
}
