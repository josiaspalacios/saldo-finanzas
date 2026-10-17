export const EXPENSE_CATEGORIES = [
  "Alimentación",
  "Transporte",
  "Hogar",
  "Servicios",
  "Salud",
  "Educación",
  "Ocio",
  "Compras",
  "Otros",
] as const;

export const INCOME_CATEGORIES = [
  "Sueldo",
  "Trabajo extra",
  "Negocio",
  "Inversiones",
  "Regalo",
  "Otros",
] as const;

export const CURRENCIES = {
  MXN: { name: "Peso mexicano", locale: "es-MX" },
  USD: { name: "Dólar estadounidense", locale: "en-US" },
  EUR: { name: "Euro", locale: "es-ES" },
  COP: { name: "Peso colombiano", locale: "es-CO" },
  ARS: { name: "Peso argentino", locale: "es-AR" },
  CLP: { name: "Peso chileno", locale: "es-CL" },
  PEN: { name: "Sol peruano", locale: "es-PE" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;
export type TransactionType = "income" | "expense";
export type Category = (typeof EXPENSE_CATEGORIES)[number] | (typeof INCOME_CATEGORIES)[number];

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
  notes: string;
}

export interface FinanceSettings {
  currency: CurrencyCode;
  theme: "light" | "dark";
  monthlyBudget: number;
}

export interface LoadedFinanceData {
  transactions: Transaction[];
  settings: FinanceSettings;
  warning: string | null;
}

export const DEFAULT_SETTINGS: FinanceSettings = {
  currency: "MXN",
  theme: "light",
  monthlyBudget: 0,
};

export const TRANSACTIONS_KEY = "saldo:transactions:v1";
export const SETTINGS_KEY = "saldo:settings:v1";
const LEGACY_TRANSACTIONS_KEY = "budget-tracker-transactions";
const LEGACY_SETTINGS_KEY = "budget-tracker-settings";

export function localDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function monthString(date = new Date()): string {
  return localDateString(date).slice(0, 7);
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat(CURRENCIES[currency].locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatShortMoney(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat(CURRENCIES[currency].locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDate(date: string): string {
  const [year = 1970, month = 1, day = 1] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Transaction>;
  const validCategories: readonly string[] = item.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return typeof item.id === "string"
    && typeof item.description === "string"
    && item.description.trim().length > 0
    && typeof item.amount === "number"
    && Number.isFinite(item.amount)
    && item.amount > 0
    && (item.type === "income" || item.type === "expense")
    && typeof item.category === "string"
    && validCategories.includes(item.category)
    && typeof item.date === "string"
    && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
    && typeof item.notes === "string";
}

function normalizeLegacyTransactions(value: unknown): Transaction[] {
  if (!Array.isArray(value)) throw new Error("El respaldo de movimientos no tiene un formato válido.");
  return value.flatMap((entry: unknown) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    if (
      typeof item.id !== "string"
      || typeof item.description !== "string"
      || typeof item.amount !== "number"
      || !Number.isFinite(item.amount)
      || item.amount <= 0
      || (item.type !== "income" && item.type !== "expense")
      || typeof item.date !== "string"
      || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)
    ) return [];

    const legacyCategory = typeof item.category === "string" ? item.category : "";
    const categoryAliases: Record<string, Category> = {
      Salario: "Sueldo",
      Vivienda: "Hogar",
      Entretenimiento: "Ocio",
    };
    const normalizedCategory = categoryAliases[legacyCategory] ?? legacyCategory;
    const categories: readonly string[] = item.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return [{
      id: item.id,
      description: item.description.trim(),
      amount: Math.round(item.amount * 100) / 100,
      type: item.type,
      category: categories.includes(normalizedCategory)
        ? normalizedCategory as Category
        : "Otros",
      date: item.date,
      notes: typeof item.notes === "string" ? item.notes : "",
    }];
  });
}

function parseSettings(value: unknown): FinanceSettings {
  if (!value || typeof value !== "object") return DEFAULT_SETTINGS;
  const settings = value as Record<string, unknown>;
  return {
    currency: typeof settings.currency === "string" && settings.currency in CURRENCIES
      ? settings.currency as CurrencyCode
      : DEFAULT_SETTINGS.currency,
    theme: settings.theme === "dark" ? "dark" : "light",
    monthlyBudget: typeof settings.monthlyBudget === "number"
      && Number.isFinite(settings.monthlyBudget)
      && settings.monthlyBudget >= 0
      ? settings.monthlyBudget
      : DEFAULT_SETTINGS.monthlyBudget,
  };
}

export function isFinanceSettings(value: unknown): value is FinanceSettings {
  if (!value || typeof value !== "object") return false;
  const settings = value as Partial<FinanceSettings>;
  return typeof settings.currency === "string"
    && settings.currency in CURRENCIES
    && (settings.theme === "light" || settings.theme === "dark")
    && typeof settings.monthlyBudget === "number"
    && Number.isFinite(settings.monthlyBudget)
    && settings.monthlyBudget >= 0;
}

export function loadFinanceData(storage: Pick<Storage, "getItem" | "setItem">): LoadedFinanceData {
  let warning: string | null = null;
  let transactions: Transaction[] = [];
  let settings = DEFAULT_SETTINGS;

  try {
    const savedTransactions = storage.getItem(TRANSACTIONS_KEY);
    if (savedTransactions !== null) {
      const parsed: unknown = JSON.parse(savedTransactions);
      if (!Array.isArray(parsed)) throw new Error("Los movimientos guardados no tienen un formato válido.");
      transactions = parsed.filter(isTransaction);
    } else {
      const legacyTransactions = storage.getItem(LEGACY_TRANSACTIONS_KEY);
      if (legacyTransactions !== null) {
        transactions = normalizeLegacyTransactions(JSON.parse(legacyTransactions));
        storage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
      }
    }

    const savedSettings = storage.getItem(SETTINGS_KEY);
    if (savedSettings !== null) {
      settings = parseSettings(JSON.parse(savedSettings));
    } else {
      const legacySettings = storage.getItem(LEGACY_SETTINGS_KEY);
      if (legacySettings !== null) {
        settings = parseSettings(JSON.parse(legacySettings));
        storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      }
    }
  } catch (error) {
    console.error("No se pudieron leer los datos privados guardados.", error);
    warning = "No se pudieron leer los datos guardados en este navegador.";
  }

  return { transactions, settings, warning };
}

export function summarize(transactions: Transaction[]) {
  return transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === "income") summary.income += transaction.amount;
      else summary.expenses += transaction.amount;
      return summary;
    },
    { income: 0, expenses: 0 },
  );
}

export function getMonthlyChartData(transactions: Transaction[], now = new Date()) {
  return Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const month = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    const monthTransactions = transactions.filter((transaction) => transaction.date.startsWith(month));
    const total = summarize(monthTransactions);
    return {
      month,
      label: new Intl.DateTimeFormat("es-MX", { month: "short" }).format(monthDate).replace(".", ""),
      income: total.income,
      expenses: total.expenses,
    };
  });
}

export function getCategoryTotals(transactions: Transaction[]) {
  const totals = new Map<Category, number>();
  for (const transaction of transactions) {
    if (transaction.type !== "expense") continue;
    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount);
  }
  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((first, second) => second.value - first.value);
}

export function makeCsv(transactions: Transaction[], currency: CurrencyCode): string {
  const quote = (value: string | number) => {
    const text = String(value);
    const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replaceAll('"', '""')}"`;
  };
  const rows: (string | number)[][] = [
    ["Fecha", "Descripción", "Tipo", "Categoría", "Monto", "Moneda", "Nota"],
    ...transactions.map((item) => [
      item.date,
      item.description,
      item.type === "income" ? "Ingreso" : "Gasto",
      item.category,
      item.amount.toFixed(2),
      currency,
      item.notes,
    ]),
  ];
  return `\uFEFF${rows.map((row) => row.map(quote).join(",")).join("\r\n")}`;
}
