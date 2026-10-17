import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  note: string;
  tone: "violet" | "green" | "rose" | "blue";
  value: string;
}

export default function SummaryCard({ icon: Icon, label, note, tone, value }: SummaryCardProps) {
  return (
    <article className={`summary-card summary-${tone}`}>
      <div className="summary-card-top"><span>{label}</span><span className="summary-icon"><Icon size={17} strokeWidth={1.9} /></span></div>
      <strong className="summary-card-value" title={value}>{value}</strong>
      <span className="summary-card-note">{note}</span>
      <span aria-hidden="true" className="summary-card-decoration" />
    </article>
  );
}
