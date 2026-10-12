export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-dashed border-border bg-card/70 px-4 py-6 text-sm leading-6 text-muted-foreground">
      {children}
    </p>
  );
}
