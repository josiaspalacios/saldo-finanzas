import { useEffect, useMemo, useState } from "react";
import { Download, Filter, Plus, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import TransactionTable from "../components/TransactionTable";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatMoney, monthString, summarize, type CurrencyCode, type Transaction, type TransactionType } from "../lib/finance";

interface TransactionsPageProps {
  currency: CurrencyCode;
  onAdd: () => void;
  onDelete: (transaction: Transaction) => void;
  onExport: (transactions: Transaction[], month: string) => void;
  transactions: Transaction[];
}

export default function TransactionsPage({ currency, onAdd, onDelete, onExport, transactions }: TransactionsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [month, setMonth] = useState(searchParams.get("mes") || monthString());
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | TransactionType>("all");
  const [category, setCategory] = useState("all");
  const items = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    return transactions
      .filter((item) => !month || item.date.startsWith(month))
      .filter((item) => type === "all" || item.type === type)
      .filter((item) => category === "all" || item.category === category)
      .filter((item) => !query || `${item.description} ${item.category} ${item.notes}`.toLocaleLowerCase("es").includes(query))
      .sort((first, second) => second.date.localeCompare(first.date) || second.id.localeCompare(first.id));
  }, [transactions, month, type, category, search]);
  const totals = summarize(items);
  const monthName = month
    ? new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(`${month}-15`))
    : "Todo el período";

  useEffect(() => {
    const queryMonth = searchParams.get("mes");
    if (queryMonth && /^\d{4}-\d{2}$/.test(queryMonth)) setMonth(queryMonth);
  }, [searchParams]);

  function updateMonth(value: string) {
    setMonth(value);
    if (value) setSearchParams({ mes: value }, { replace: true });
    else setSearchParams({}, { replace: true });
  }

  return (
    <>
      <PageHeading
        action={<button className="button button-primary" onClick={onAdd} type="button"><Plus size={16} /> Nuevo movimiento</button>}
        description="Cada entrada y salida, organizada con tus propias categorías."
        eyebrow="ACTIVIDAD DE TU DINERO"
        title="Todos tus movimientos"
      />
      <section className="transaction-overview">
        <div><span>Ingresos en la selección</span><strong className="overview-income">{formatMoney(totals.income, currency)}</strong></div>
        <div><span>Gastos en la selección</span><strong className="overview-expense">{formatMoney(totals.expenses, currency)}</strong></div>
        <div><span>Movimientos encontrados</span><strong>{items.length}</strong></div>
      </section>
      <section className="panel all-transactions-panel">
        <div className="panel-heading activity-heading">
          <div><h2>Registro de actividad</h2><p>Estás consultando {monthName}.</p></div>
          <button className="button button-outline" disabled={items.length === 0} onClick={() => onExport(items, month)} type="button"><Download size={14} /> Exportar selección</button>
        </div>
        <div className="filter-row">
          <label className="search-box"><Search size={15} /><span className="sr-only">Buscar movimientos</span><input onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, nota o categoría..." value={search} />{search && <button aria-label="Limpiar búsqueda" onClick={() => setSearch("")} type="button"><X size={13} /></button>}</label>
          <label className="month-filter"><span className="sr-only">Filtrar por mes</span><input aria-label="Filtrar por mes" onChange={(event) => updateMonth(event.target.value)} type="month" value={month} /></label>
          <label className="type-filter"><Filter size={13} /><span className="sr-only">Tipo</span><select aria-label="Filtrar por tipo" onChange={(event) => setType(event.target.value as "all" | TransactionType)} value={type}><option value="all">Todos</option><option value="income">Ingresos</option><option value="expense">Gastos</option></select></label>
          <label className="type-filter category-filter"><span className="sr-only">Categoría</span><select aria-label="Filtrar por categoría" onChange={(event) => setCategory(event.target.value)} value={category}><option value="all">Todas las categorías</option>{[...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        {items.length === 0 ? (
          <div className="empty-state"><span className="empty-state-icon"><Search size={19} /></span><strong>{transactions.length === 0 ? "Todavía no hay movimientos" : "No encontramos resultados"}</strong><p>{transactions.length === 0 ? "Tus registros personales aparecerán aquí." : "Prueba otros filtros o registra un movimiento nuevo."}</p><button className="button button-primary" onClick={onAdd} type="button"><Plus size={14} /> Agregar movimiento</button></div>
        ) : <TransactionTable currency={currency} onDelete={onDelete} transactions={items} />}
        <footer className="activity-footer"><span>{items.length} {items.length === 1 ? "registro" : "registros"}</span><span>{monthName}</span></footer>
      </section>
    </>
  );
}
