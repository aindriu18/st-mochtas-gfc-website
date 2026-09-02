import type { AnchorHTMLAttributes, ReactNode } from 'react';

type SafeLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export default function SafeLink({ href, children, ...props }: SafeLinkProps) {
  return <a href={href} {...props}>{children}</a>;
}
