import { useMemo, useState } from "react";
import { CalendarDays, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeading from "../components/PageHeading";
import SummaryCard from "../components/SummaryCard";
import {
  formatMoney,
  formatShortMoney,
  getCategoryTotals,
  getMonthlyChartData,
  monthString,
  summarize,
  type CurrencyCode,
  type Transaction,
} from "../lib/finance";

const CATEGORY_COLORS = ["#8275df", "#47a987", "#e28a80", "#5b8bd2", "#e6ad58", "#a078bd", "#55a6b1", "#db9669", "#8792a1"];

interface AnalysisPageProps {
  currency: CurrencyCode;
  transactions: Transaction[];
}

export default function AnalysisPage({ currency, transactions }: AnalysisPageProps) {
  const [month, setMonth] = useState(monthString());
  const monthTransactions = useMemo(() => transactions.filter((item) => item.date.startsWith(month)), [month, transactions]);
  const summary = useMemo(() => summarize(monthTransactions), [monthTransactions]);
  const categories = useMemo(() => getCategoryTotals(monthTransactions), [monthTransactions]);
  const monthlyData = useMemo(() => getMonthlyChartData(transactions), [transactions]);
  const monthName = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(`${month}-15`));
  const balance = summary.income - summary.expenses;

  return (
    <>
      <PageHeading
        description="Entiende la evolución de tus ingresos y gastos con los datos que has registrado."
        eyebrow="TENDENCIAS Y COMPORTAMIENTO"
        title="Análisis financiero"
      />

      <section className="section-block">
        <div className="section-heading overview-heading">
          <div><span className="section-overline">PERÍODO SELECCIONADO</span><h2>Indicadores de {monthName}</h2></div>
          <label className="month-picker"><CalendarDays size={14} /><span className="sr-only">Elegir mes del análisis</span><input aria-label="Mes del análisis" onChange={(event) => setMonth(event.target.value || monthString())} type="month" value={month} /></label>
        </div>
        <div className="summary-grid analysis-summary-grid">
          <SummaryCard icon={Wallet} label="Balance neto" note={balance < 0 ? "Gastos por encima de los ingresos" : "Ingresos menos gastos"} tone="violet" value={formatMoney(balance, currency)} />
          <SummaryCard icon={TrendingUp} label="Ingresos" note={`${monthTransactions.filter((item) => item.type === "income").length} entradas en el período`} tone="green" value={formatMoney(summary.income, currency)} />
          <SummaryCard icon={TrendingDown} label="Gastos" note={`${monthTransactions.filter((item) => item.type === "expense").length} salidas en el período`} tone="rose" value={formatMoney(summary.expenses, currency)} />
        </div>
      </section>

      <section className="dashboard-charts analysis-charts" aria-label="Gráficos financieros">
        <article className="panel chart-panel">
          <div className="panel-heading chart-heading">
            <div><h2>Ingresos y gastos</h2><p>Comparativo de los últimos seis meses.</p></div>
            <span className="chart-key"><i className="key-dot income-key" /> Ingresos <i className="key-dot expense-key" /> Gastos</span>
          </div>
          <div className="flow-chart">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={monthlyData} margin={{ top: 12, right: 4, left: -14, bottom: 0 }} barGap={5}>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 5" vertical={false} />
                <XAxis axisLine={false} dataKey="label" tick={{ fill: "var(--muted)", fontSize: 10 }} tickLine={false} tickMargin={11} />
                <YAxis axisLine={false} tick={{ fill: "var(--muted)", fontSize: 9 }} tickFormatter={(value: number) => formatShortMoney(value, currency)} tickLine={false} width={64} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, color: "var(--text)", fontSize: 11 }} formatter={(value: number, name: string) => [formatMoney(value, currency), name === "income" ? "Ingresos" : "Gastos"]} />
                <Bar dataKey="income" fill="#47a987" maxBarSize={22} name="income" radius={[5, 5, 1, 1]} />
                <Bar dataKey="expenses" fill="#e28a80" maxBarSize={22} name="expenses" radius={[5, 5, 1, 1]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footnote"><span><span className="footnote-dot" /> Balance de {monthName}</span><strong>{formatMoney(balance, currency)}</strong></div>
        </article>

        <article className="panel category-panel">
          <div className="panel-heading"><div><h2>Distribución de gastos</h2><p>Detalle por categoría de {monthName}.</p></div></div>
          <div className="donut-layout">
            <div className="donut-chart">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart><Pie data={categories} dataKey="value" cx="50%" cy="50%" innerRadius="68%" outerRadius="92%" paddingAngle={categories.length > 1 ? 4 : 0} stroke="none">
                  {categories.map((item, index) => <Cell fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} key={item.name} />)}
                </Pie><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, color: "var(--text)", fontSize: 11 }} formatter={(value: number) => formatMoney(value, currency)} /></PieChart>
              </ResponsiveContainer>
              <div className="donut-total"><strong>{formatMoney(summary.expenses, currency)}</strong><span>en gastos</span></div>
            </div>
            <div className="category-legend">
              {categories.length === 0 ? <span className="legend-empty">Todavía no hay gastos este mes.</span> : categories.slice(0, 5).map((item, index) => (
                <div className="category-legend-row" key={item.name}><span className="legend-swatch" style={{ background: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} /><span className="legend-name">{item.name}</span><strong>{summary.expenses ? Math.round(item.value / summary.expenses * 100) : 0}%</strong></div>
              ))}
            </div>
          </div>
        </article>
      </section>
      <p className="analysis-privacy-note">El análisis se calcula únicamente con los movimientos guardados en este dispositivo.</p>
    </>
  );
}
