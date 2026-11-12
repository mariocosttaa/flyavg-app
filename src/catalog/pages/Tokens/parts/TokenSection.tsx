import type { ReactNode } from 'react';

interface TokenSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function TokenSection({ title, description, children }: TokenSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl">{title}</h2>
        {description && <p className="max-w-3xl text-fg-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

interface TokenGroupProps {
  title: string;
  children: ReactNode;
}

export function TokenGroup({ title, children }: TokenGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-medium tracking-label text-fg-muted uppercase">{title}</h3>
      {children}
    </div>
  );
}
