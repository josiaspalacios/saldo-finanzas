import { useEffect, useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight, X } from "lucide-react";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  localDateString,
  type Category,
  type Transaction,
  type TransactionType,
} from "../lib/finance";

interface TransactionDialogProps {
  currencySymbol: string;
  initialType?: TransactionType;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function TransactionDialog({
  currencySymbol,
  initialType = "expense",
  onClose,
  onSave,
}: TransactionDialogProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>(initialType === "income" ? "Sueldo" : "Alimentación");
  const [date, setDate] = useState(localDateString());
  const [notes, setNotes] = useState("");
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) return;

    onSave({
      id: createId(),
      description: description.trim(),
      amount: Math.round(numericAmount * 100) / 100,
      type,
      category,
      date,
      notes: notes.trim(),
    });
  }

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="transaction-dialog-title"
        aria-modal="true"
        className="transaction-dialog"
        role="dialog"
      >
        <header className="dialog-header">
          <div>
            <span className="dialog-kicker">REGISTRO PERSONAL</span>
            <h2 id="transaction-dialog-title">Nuevo movimiento</h2>
            <p>Agrega una entrada o salida de dinero.</p>
          </div>
          <button aria-label="Cerrar" className="icon-button" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>

        <form className="transaction-form" onSubmit={submit}>
          <div aria-label="Tipo de movimiento" className="transaction-type-picker" role="group">
            <button
              aria-pressed={type === "expense"}
              className={type === "expense" ? "type-choice selected expense-choice" : "type-choice"}
              onClick={() => {
                setType("expense");
                setCategory("Alimentación");
              }}
              type="button"
            >
              <ArrowUpRight size={16} /> Gasto
            </button>
            <button
              aria-pressed={type === "income"}
              className={type === "income" ? "type-choice selected income-choice" : "type-choice"}
              onClick={() => {
                setType("income");
                setCategory("Sueldo");
              }}
              type="button"
            >
              <ArrowDownLeft size={16} /> Ingreso
            </button>
          </div>

          <label className="form-field">
            <span>Descripción</span>
            <input
              autoFocus
              maxLength={80}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={type === "income" ? "Ej. Pago de nómina" : "Ej. Compra del supermercado"}
              required
              value={description}
            />
          </label>

          <label className="form-field amount-field">
            <span>Monto <small>{currencySymbol}</small></span>
            <div className="amount-control">
              <span aria-hidden="true">{currencySymbol}</span>
              <input
                min="0.01"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                required
                step="0.01"
                type="number"
                value={amount}
              />
            </div>
          </label>

          <div className="form-columns">
            <label className="form-field">
              <span>Categoría</span>
              <select
                onChange={(event) => setCategory(event.target.value as Category)}
                value={category}
              >
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Fecha</span>
              <input onChange={(event) => setDate(event.target.value)} required type="date" value={date} />
            </label>
          </div>

          <label className="form-field">
            <span>Nota <small>Opcional</small></span>
            <input
              maxLength={140}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Añade un recordatorio o detalle"
              value={notes}
            />
          </label>

          <footer className="dialog-actions">
            <button className="button button-quiet" onClick={onClose} type="button">Cancelar</button>
            <button className="button button-primary" type="submit">Guardar movimiento</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
