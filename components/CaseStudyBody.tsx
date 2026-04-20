import Image from "next/image";
import type { CaseStudyFigure, CaseStudySection } from "@/content/work";

export function CaseStudyBody({
  sections,
  figures,
}: {
  sections: CaseStudySection[];
  figures: CaseStudyFigure[];
}) {
  const realFigures = figures.filter((f) => !f.src.includes("placeholder"));

  return (
    <div
      className="mt-10 max-w-[68ch] space-y-10"
      style={{ fontSize: "var(--t-body)", lineHeight: 1.6 }}
    >
      {sections.map((section) => {
        const after = realFigures.filter(
          (f) => f.placement === "after-section" && f.afterHeading === section.heading
        );
        return (
          <section key={section.heading}>
            <h3
              className="text-[var(--muted)] uppercase mb-3"
              style={{ fontSize: "var(--t-meta)" }}
            >
              {section.heading}
            </h3>
            <div className="space-y-4">
              {section.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {after.length > 0 && (
              <div className="mt-8 space-y-6">
                {after.map((fig) => (
                  <figure key={fig.src}>
                    <div className="border border-[var(--rule)]">
                      <Image
                        src={fig.src}
                        alt={fig.alt}
                        width={fig.width}
                        height={fig.height}
                        sizes="(max-width: 720px) 100vw, 720px"
                        className="block w-full h-auto"
                      />
                    </div>
                    <figcaption
                      className="mt-2 text-[var(--muted)] uppercase"
                      style={{ fontSize: "var(--t-meta)" }}
                    >
                      {fig.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
