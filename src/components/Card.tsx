import { PropsWithChildren } from 'react';

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <section className={`bg-iosCard rounded-2xl shadow-soft p-4 ${className}`}>{children}</section>;
}
