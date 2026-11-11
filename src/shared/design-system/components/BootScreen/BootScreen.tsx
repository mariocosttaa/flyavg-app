interface BootScreenProps {
  /** Accessible name announced while the screen is busy, already translated. */
  label: string;
}

/** Full-area loading state for entry boot, guards and route chunks. */
export function BootScreen({ label }: BootScreenProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className="flex min-h-dvh items-center justify-center bg-surface"
    >
      <span
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-4 border-border border-t-accent motion-reduce:animate-none"
      />
    </div>
  );
}
