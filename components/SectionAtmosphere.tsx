import Image from "next/image";

export type AtmosphereProps = {
  src: string;
  alt: string;
  priority?: boolean;
};

export function SectionAtmosphere({ src, alt, priority = false }: AtmosphereProps) {
  return (
    <figure className="mt-6 mb-8 border border-[var(--rule)]">
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={800}
        sizes="(max-width: 720px) 100vw, 1200px"
        priority={priority}
        className="block w-full h-auto"
      />
    </figure>
  );
}
