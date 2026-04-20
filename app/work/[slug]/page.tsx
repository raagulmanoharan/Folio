import { work } from "@/content/work";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBar } from "@/components/StatusBar";
import { PageMeta, type PageMetaRow } from "@/components/PageMeta";
import { PageTitle } from "@/components/PageTitle";
import { CaseStudyBody } from "@/components/CaseStudyBody";
import { CaseStudyNav } from "@/components/CaseStudyNav";
import { Atmosphere } from "@/components/Atmosphere";

export function generateStaticParams() {
  return work.filter((p) => p.caseStudy).map((p) => ({ slug: p.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = work.find((p) => p.slug === slug);
  if (!project || !project.caseStudy) notFound();

  const cs = project.caseStudy;
  const idx = work.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? work[idx - 1] : null;
  const next = idx < work.length - 1 ? work[idx + 1] : null;

  const rows: PageMetaRow[] = [
    { key: "PROJECT", value: project.project },
    { key: "DATE", value: project.date },
    { key: "ROLE", value: project.role },
    { key: "CONTEXT", value: project.context },
  ];
  if (cs.externalLink) {
    rows.push({
      key: "LINK",
      value: cs.externalLink.label,
      href: cs.externalLink.href,
    });
  }

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
          <Link href="/#work">← WORK</Link>
          {" / "}
          {project.project.toUpperCase()}
        </nav>

        <PageMeta rows={rows} />

        <PageTitle>{cs.summary}</PageTitle>

        <Atmosphere src={cs.atmosphere.src} alt={cs.atmosphere.alt} priority />

        <CaseStudyBody sections={cs.sections} figures={cs.figures} />

        <CaseStudyNav prev={prev} next={next} />

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
