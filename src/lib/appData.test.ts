import { describe, expect, it, vi } from "vitest";
import { persistAppData } from "./appData";
import { DEFAULT_SETTINGS, type Transaction } from "./finance";

const transaction: Transaction = {
  id: "transaction-1",
  description: "Mercado",
  amount: 48.25,
  type: "expense",
  category: "Alimentación",
  date: "2026-10-12",
  notes: "",
};

describe("private app data storage", () => {
  it("persists transactions and settings locally", () => {
    const values = new Map<string, string>();
    const storage = {
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    } as unknown as Storage;
    const result = persistAppData({ transactions: [transaction], settings: DEFAULT_SETTINGS }, storage);

    expect(result).toEqual({ ok: true });
    expect(JSON.parse(values.get("saldo:transactions:v1") ?? "[]")).toEqual([transaction]);
    expect(JSON.parse(values.get("saldo:settings:v1") ?? "{}")).toEqual(DEFAULT_SETTINGS);
  });

  it("returns an actionable error when private storage is full", () => {
    const setItem = vi.fn(() => {
      throw new DOMException("Storage is full", "QuotaExceededError");
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = persistAppData({ transactions: [], settings: DEFAULT_SETTINGS }, { setItem } as unknown as Storage);

    expect(result).toMatchObject({ ok: false, message: expect.stringContaining("espacio disponible") });
    expect(error).toHaveBeenCalledOnce();
    error.mockRestore();
  });
});
