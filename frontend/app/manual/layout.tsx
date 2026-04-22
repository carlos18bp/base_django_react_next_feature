'use client';

export default function ManualLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1400px] px-6 py-10">{children}</div>;
}
