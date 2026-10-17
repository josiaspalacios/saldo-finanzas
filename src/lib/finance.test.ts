import { describe, expect, it } from "vitest";
import {
  getCategoryTotals,
  getMonthlyChartData,
  isTransaction,
  loadFinanceData,
  makeCsv,
  summarize,
  TRANSACTIONS_KEY,
  type Transaction,
} from "./finance";

const transactions: Transaction[] = [
  { id: "one", description: "Pago, nómina", amount: 2500, type: "income", category: "Sueldo", date: "2026-10-01", notes: "" },
  { id: "two", description: 'Mercado "central"', amount: 125.5, type: "expense", category: "Alimentación", date: "2026-10-02", notes: "Compra semanal" },
  { id: "three", description: "Autobús", amount: 30, type: "expense", category: "Transporte", date: "2026-10-03", notes: "" },
];

describe("finance calculations", () => {
  it("summarizes income and expenses without losing cents", () => {
    expect(summarize(transactions)).toEqual({ income: 2500, expenses: 155.5 });
  });

  it("groups expense totals by category and excludes income", () => {
    expect(getCategoryTotals(transactions)).toEqual([
      { name: "Alimentación", value: 125.5 },
      { name: "Transporte", value: 30 },
    ]);
  });

  it("builds six chronological month buckets, including empty months", () => {
    const data = getMonthlyChartData(transactions, new Date(2026, 9, 16));
    expect(data).toHaveLength(6);
    expect(data.at(-1)).toMatchObject({ month: "2026-10", income: 2500, expenses: 155.5 });
    expect(data[0]).toMatchObject({ month: "2026-05", income: 0, expenses: 0 });
  });

  it("validates stored transaction data before using it", () => {
    expect(isTransaction(transactions[0])).toBe(true);
    expect(isTransaction({ ...transactions[0], amount: Number.NaN })).toBe(false);
  });

  it("migrates previous browser records and settings without losing legacy categories", () => {
    const storageMap = new Map<string, string>([
      ["budget-tracker-transactions", JSON.stringify([
        { id: "legacy-1", description: "Salario", amount: 1000, type: "income", category: "Salario", date: "2026-10-01" },
        { id: "legacy-2", description: "Casa", amount: 200, type: "expense", category: "Vivienda", date: "2026-10-02" },
      ])],
      ["budget-tracker-settings", JSON.stringify({ currency: "COP", theme: "dark" })],
    ]);
    const storage = {
      getItem: (key: string) => storageMap.get(key) ?? null,
      setItem: (key: string, value: string) => storageMap.set(key, value),
    };

    const result = loadFinanceData(storage);

    expect(result.transactions.map((item) => item.category)).toEqual(["Sueldo", "Hogar"]);
    expect(result.settings).toMatchObject({ currency: "COP", theme: "dark", monthlyBudget: 0 });
    expect(storageMap.has(TRANSACTIONS_KEY)).toBe(true);
    expect(result.warning).toBeNull();
  });

  it("escapes CSV fields and includes a spreadsheet-friendly byte order mark", () => {
    const csv = makeCsv(transactions.slice(0, 2), "MXN");
    expect(csv).toContain("\uFEFF");
    expect(csv).toContain('"Pago, nómina"');
    expect(csv).toContain('"Mercado ""central"""');
  });

  it("prevents spreadsheet formulas in exported descriptions", () => {
    const csv = makeCsv([
      { ...transactions[0]!, description: "=IMPORTAR.DATOS()" },
    ], "MXN");
    expect(csv).toContain("\"'=IMPORTAR.DATOS()\"");
  });
});
