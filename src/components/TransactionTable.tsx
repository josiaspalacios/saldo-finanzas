import {
  Activity,
  BriefcaseBusiness,
  CarFront,
  Coffee,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  MoreHorizontal,
  ShoppingBag,
  Sparkles,
  Trash2,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { formatDate, formatMoney, type Category, type CurrencyCode, type Transaction } from "../lib/finance";

const ICONS: Partial<Record<Category, LucideIcon>> = {
  Alimentación: Utensils,
  Transporte: CarFront,
  Hogar: House,
  Servicios: Laptop,
  Salud: HeartPulse,
  Educación: GraduationCap,
  Ocio: Coffee,
  Compras: ShoppingBag,
  Otros: MoreHorizontal,
  Sueldo: BriefcaseBusiness,
  "Trabajo extra": Laptop,
  Negocio: Activity,
  Inversiones: BriefcaseBusiness,
  Regalo: Sparkles,
};

const COLORS: Partial<Record<Category, string>> = {
  Alimentación: "#eaa54b",
  Transporte: "#5a8add",
  Hogar: "#8d73d4",
  Servicios: "#49a9b1",
  Salud: "#e4757e",
  Educación: "#549b74",
  Ocio: "#bd80bd",
  Compras: "#df895c",
  Sueldo: "#549b74",
  "Trabajo extra": "#5a8add",
  Negocio: "#8d73d4",
  Inversiones: "#49a9b1",
  Regalo: "#df895c",
};

interface TransactionTableProps {
  currency: CurrencyCode;
  onDelete: (transaction: Transaction) => void;
  transactions: Transaction[];
}

export default function TransactionTable({ currency, onDelete, transactions }: TransactionTableProps) {
  return (
    <div className="table-scroll">
      <table className="transactions-table">
        <thead>
          <tr><th>DESCRIPCIÓN</th><th>CATEGORÍA</th><th>FECHA</th><th>TIPO</th><th className="table-amount">MONTO</th><th><span className="sr-only">Acciones</span></th></tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const isIncome = transaction.type === "income";
            const Icon = ICONS[transaction.category] ?? MoreHorizontal;
            return (
              <tr key={transaction.id}>
                <td>
                  <div className="transaction-description">
                    <span
                      className={`transaction-category-icon${isIncome ? " icon-income" : ""}`}
                      style={{ "--category-color": COLORS[transaction.category] ?? "#8990a3" } as React.CSSProperties}
                    >
                      <Icon size={16} strokeWidth={1.8} />
                    </span>
                    <span className="transaction-title-wrap">
                      <strong>{transaction.description}</strong>
                      <small>{transaction.notes || (isIncome ? "Entrada de dinero" : "Gasto personal")}</small>
                    </span>
                  </div>
                </td>
                <td><span className="category-name">{transaction.category}</span></td>
                <td className="date-cell">{formatDate(transaction.date)}</td>
                <td><span className={`transaction-badge ${isIncome ? "badge-income" : "badge-expense"}`}>{isIncome ? "Ingreso" : "Gasto"}</span></td>
                <td className={`table-amount transaction-amount ${isIncome ? "amount-income" : ""}`}>{isIncome ? "+" : "−"}{formatMoney(transaction.amount, currency)}</td>
                <td>
                  <button aria-label={`Eliminar ${transaction.description}`} className="delete-transaction-button" onClick={() => onDelete(transaction)} title="Eliminar movimiento" type="button">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
