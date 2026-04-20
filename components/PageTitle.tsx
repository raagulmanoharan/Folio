export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="mt-10 max-w-[28ch]"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "2rem",
        lineHeight: 1.15,
        letterSpacing: "-0.01em",
        fontWeight: 500,
      }}
    >
      {children}
    </h1>
  );
}
