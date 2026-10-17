import type { ReactNode } from "react";

interface PageHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function PageHeading({ eyebrow, title, description, action }: PageHeadingProps) {
  return (
    <section className="page-heading">
      <div>
        <span className="section-overline">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="page-subtitle">{description}</p>
      </div>
      {action && <div className="page-heading-action">{action}</div>}
    </section>
  );
}
