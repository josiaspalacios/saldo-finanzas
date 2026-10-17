import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff, LockKeyhole, Plus, ShieldCheck } from "lucide-react";
import { formatMoney, type CurrencyCode, type TransactionType } from "../lib/finance";

interface BankBalanceCardProps {
  currency: CurrencyCode;
  income: number;
  balance: number;
  expenses: number;
  onAdd: (type: TransactionType) => void;
}

export default function BankBalanceCard({ currency, income, balance, expenses, onAdd }: BankBalanceCardProps) {
  const [hidden, setHidden] = useState(false);
  const amount = hidden ? "••••••••" : formatMoney(balance, currency);
  const visibleIncome = hidden ? "••••••" : formatMoney(income, currency);
  const visibleExpenses = hidden ? "••••••" : formatMoney(expenses, currency);

  return (
    <section aria-label="Resumen de tu saldo" className="bank-overview">
      <article className="bank-balance-card">
        <div className="balance-card-top">
          <div className="balance-card-brand"><span className="balance-card-logo"><LockKeyhole size={15} /></span><span>MI SALDO</span></div>
          <button
            aria-label={hidden ? "Mostrar saldo disponible" : "Ocultar saldo disponible"}
            className="balance-visibility"
            onClick={() => setHidden((value) => !value)}
            type="button"
          >
            {hidden ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
        <div className="balance-card-label">Saldo disponible registrado</div>
        <strong className={`balance-card-amount${hidden ? " balance-hidden" : ""}`} title={hidden ? undefined : amount}>{amount}</strong>
        <div className="balance-card-caption"><ShieldCheck size={13} /> Calculado con los movimientos que registraste</div>
        <div className="balance-card-bottom">
          <div><span><ArrowDownLeft size={13} /> Total de ingresos</span><strong>{visibleIncome}</strong></div>
          <div><span><ArrowUpRight size={13} /> Total de gastos</span><strong>{visibleExpenses}</strong></div>
        </div>
        <span aria-hidden="true" className="balance-orbit balance-orbit-one" />
        <span aria-hidden="true" className="balance-orbit balance-orbit-two" />
      </article>
      <article className="quick-actions-card">
        <div className="quick-actions-heading"><span className="section-overline">ACCESOS RÁPIDOS</span><strong>¿Qué necesitas registrar?</strong></div>
        <button className="quick-action" onClick={() => onAdd("income")} type="button">
          <span className="quick-action-icon action-income"><ArrowDownLeft size={17} /></span>
          <span><strong>Añadir ingreso</strong><small>Registra dinero que recibiste</small></span>
          <Plus className="quick-action-plus" size={15} />
        </button>
        <button className="quick-action" onClick={() => onAdd("expense")} type="button">
          <span className="quick-action-icon action-expense"><ArrowUpRight size={17} /></span>
          <span><strong>Registrar gasto</strong><small>Anota en qué usaste tu dinero</small></span>
          <Plus className="quick-action-plus" size={15} />
        </button>
        <p className="quick-actions-note">Saldo es una herramienta personal; no opera cuentas bancarias.</p>
      </article>
    </section>
  );
}
