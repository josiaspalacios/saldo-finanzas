import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import BankBalanceCard from "../components/BankBalanceCard";
import SummaryCard from "../components/SummaryCard";
import {
  formatMoney,
  monthString,
  summarize,
  type CurrencyCode,
  type Transaction,
  type TransactionType,
} from "../lib/finance";

interface DashboardPageProps {
  currency: CurrencyCode;
  onAdd: (type?: TransactionType) => void;
  transactions: Transaction[];
}

export default function DashboardPage({ currency, onAdd, transactions }: DashboardPageProps) {
  const [month, setMonth] = useState(monthString());
  const monthTransactions = useMemo(() => transactions.filter((item) => item.date.startsWith(month)), [month, transactions]);
  const summary = useMemo(() => summarize(monthTransactions), [monthTransactions]);
  const lifetimeSummary = useMemo(() => summarize(transactions), [transactions]);
  const lifetimeBalance = lifetimeSummary.income - lifetimeSummary.expenses;
  const balance = summary.income - summary.expenses;
  const monthName = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(`${month}-15`));
  const greeting = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <>
      <PageHeading
        description="Una vista clara de tu dinero, con tus movimientos bajo control."
        eyebrow={greeting}
        title="Tu resumen financiero"
      />

      <BankBalanceCard balance={lifetimeBalance} currency={currency} expenses={lifetimeSummary.expenses} income={lifetimeSummary.income} onAdd={onAdd} />

      <section className="section-block">
        <div className="section-heading overview-heading">
          <div><span className="section-overline">RESUMEN DEL PERÍODO</span><h2>Actividad de {monthName}</h2></div>
          <label className="month-picker"><CalendarDays size={14} /><span className="sr-only">Elegir mes del resumen</span><input aria-label="Mes del resumen" onChange={(event) => setMonth(event.target.value || monthString())} type="month" value={month} /></label>
        </div>
        <div className="summary-grid dashboard-summary-grid">
          <SummaryCard icon={Wallet} label="Balance neto" note={balance < 0 ? "Gastos por encima de los ingresos" : "Ingresos menos gastos del período"} tone="violet" value={formatMoney(balance, currency)} />
          <SummaryCard icon={TrendingUp} label="Ingresos" note={`${monthTransactions.filter((item) => item.type === "income").length} entradas registradas`} tone="green" value={formatMoney(summary.income, currency)} />
          <SummaryCard icon={TrendingDown} label="Gastos" note={`${monthTransactions.filter((item) => item.type === "expense").length} salidas registradas`} tone="rose" value={formatMoney(summary.expenses, currency)} />
        </div>
      </section>

      <section className="dashboard-module-links" aria-label="Otras secciones">
        <Link className="dashboard-module-link" to="/movimientos">
          <span className="module-link-icon"><ArrowLeftRight size={16} /></span>
          <span className="module-link-copy"><strong>Movimientos</strong><small>Consulta y administra tus registros</small></span>
          <ArrowUpRight className="module-link-arrow" size={15} />
        </Link>
        <Link className="dashboard-module-link" to="/analisis">
          <span className="module-link-icon"><ChartNoAxesCombined size={16} /></span>
          <span className="module-link-copy"><strong>Análisis</strong><small>Explora tendencias y categorías</small></span>
          <ArrowUpRight className="module-link-arrow" size={15} />
        </Link>
        <Link className="dashboard-module-link" to="/presupuesto">
          <span className="module-link-icon"><Wallet size={16} /></span>
          <span className="module-link-copy"><strong>Presupuesto</strong><small>Planifica el gasto del período</small></span>
          <ArrowUpRight className="module-link-arrow" size={15} />
        </Link>
      </section>
    </>
  );
}
