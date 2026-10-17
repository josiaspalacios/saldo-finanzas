import { useMemo, useState, type FormEvent } from "react";
import { ArrowDownRight, ArrowUpRight, Check, CircleHelp, Lightbulb, PiggyBank, Wallet } from "lucide-react";
import PageHeading from "../components/PageHeading";
import { formatMoney, getCategoryTotals, monthString, summarize, type CurrencyCode, type Transaction } from "../lib/finance";

interface BudgetPageProps {
  budget: number;
  currency: CurrencyCode;
  onSave: (budget: number) => void;
  transactions: Transaction[];
}

export default function BudgetPage({ budget, currency, onSave, transactions }: BudgetPageProps) {
  const [month, setMonth] = useState(monthString());
  const [draft, setDraft] = useState(String(budget || ""));
  const monthly = useMemo(() => transactions.filter((item) => item.date.startsWith(month)), [transactions, month]);
  const summary = summarize(monthly);
  const categories = getCategoryTotals(monthly);
  const remaining = budget - summary.expenses;
  const percentage = budget > 0 ? Math.round((summary.expenses / budget) * 100) : 0;
  const monthName = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(`${month}-15`));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(draft);
    if (Number.isFinite(amount) && amount >= 0) onSave(Math.round(amount * 100) / 100);
  }

  return (
    <>
      <PageHeading
        description="Pon una intención a tu dinero. Un presupuesto está para ayudarte, no para juzgarte."
        eyebrow="PLANIFICACIÓN PERSONAL"
        title="Un plan para tu dinero."
      />
      <section className="budget-page-controls">
        <span>Consulta tu presupuesto y tus gastos de un mes.</span>
        <label className="month-picker"><span className="sr-only">Mes de presupuesto</span><input aria-label="Mes de presupuesto" onChange={(event) => setMonth(event.target.value || monthString())} type="month" value={month} /></label>
      </section>
      <section className="budget-page-grid">
        <article className="panel budget-focus-panel">
          <div className="budget-focus-header"><span className="budget-focus-icon"><PiggyBank size={19} /></span><span className="section-overline">TU OBJETIVO DE {monthName.toLocaleUpperCase("es-MX")}</span></div>
          <h2>Gasta con intención,<br />sin perder tu tranquilidad.</h2>
          <p>Tu límite mensual te da contexto para tomar decisiones que se sienten bien para ti.</p>
          <div className="budget-focus-amount"><strong>{formatMoney(summary.expenses, currency)}</strong><span>gastados este mes</span></div>
          <div aria-label={`Se ha utilizado ${percentage}% del presupuesto`} className="budget-progress-track budget-progress-large" role="progressbar" aria-valuemax={100} aria-valuemin={0} aria-valuenow={Math.min(percentage, 100)}>
            <span className={percentage >= 90 ? "budget-progress-fill warning" : "budget-progress-fill"} style={{ width: `${Math.min(percentage, 100)}%` }} />
          </div>
          <div className="budget-progress-label"><span>{budget ? `${percentage}% utilizado` : "Sin límite definido todavía"}</span><span>{formatMoney(budget, currency)}</span></div>
          <div className={`budget-remaining${remaining < 0 && budget > 0 ? " remaining-negative" : ""}`}><span>{budget === 0 ? "Establece un límite mensual para empezar" : remaining < 0 ? "Has superado tu límite por" : "Disponible para el resto del mes"}</span><strong>{budget > 0 ? formatMoney(Math.abs(remaining), currency) : "A tu ritmo"}</strong></div>
        </article>
        <article className="panel budget-editor-panel">
          <span className="section-overline">TU LÍMITE MENSUAL</span>
          <h2>Elige una cifra que te haga sentido.</h2>
          <p>Puedes cambiarla cuando quieras. No necesitas cumplir un número perfecto.</p>
          <form className="budget-form budget-form-large" onSubmit={submit}>
            <label htmlFor="budget-amount">Presupuesto para {monthName}</label>
            <div className="budget-input-row"><span>{currency}</span><input id="budget-amount" min="0" onChange={(event) => setDraft(event.target.value)} placeholder="Ej. 15 000" step="0.01" type="number" value={draft} /><button aria-label="Guardar presupuesto" className="budget-save-button" type="submit"><Check size={17} /></button></div>
            <button className="button button-primary budget-submit" type="submit">Guardar mi objetivo</button>
          </form>
          <div className="budget-kind-note"><Lightbulb size={15} /><span>Es una guía para ayudarte a planificar; no es una meta rígida.</span></div>
        </article>
      </section>
      <section className="panel category-breakdown">
        <div className="panel-heading"><div><span className="section-overline">EN QUÉ SE VA</span><h2>Gastos por categoría</h2><p>Una mirada amable a tus prioridades del mes.</p></div></div>
        {categories.length === 0 ? <div className="empty-state compact-empty"><span className="empty-state-icon"><Wallet size={19} /></span><strong>Aún no hay gastos en {monthName}.</strong><p>Cuando registres gastos, te mostraremos aquí en qué categorías se reparten.</p></div> : (
          <div className="category-breakdown-list">
            {categories.map((item) => {
              const ratio = summary.expenses > 0 ? item.value / summary.expenses * 100 : 0;
              return <div className="category-breakdown-item" key={item.name}><div className="category-breakdown-name"><span>{item.name}</span><strong>{formatMoney(item.value, currency)}</strong></div><div className="budget-progress-track"><span className="category-progress-fill" style={{ width: `${ratio}%` }} /></div><small>{Math.round(ratio)}% de tus gastos del mes</small></div>;
            })}
          </div>
        )}
      </section>
      <section className="budget-insights">
        <article><span className="insight-icon insight-green"><ArrowDownRight size={17} /></span><div><span>Entradas del mes</span><strong>{formatMoney(summary.income, currency)}</strong><small>Todo el dinero que recibiste.</small></div></article>
        <article><span className="insight-icon insight-rose"><ArrowUpRight size={17} /></span><div><span>Salidas del mes</span><strong>{formatMoney(summary.expenses, currency)}</strong><small>Lo que ya registraste como gasto.</small></div></article>
        <article><span className="insight-icon insight-violet"><CircleHelp size={17} /></span><div><span>Un recordatorio</span><strong>Tu presupuesto es personal.</strong><small>Úsalo a tu manera, con flexibilidad.</small></div></article>
      </section>
    </>
  );
}
