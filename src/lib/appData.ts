import type { FinanceSettings, Transaction } from "./finance";

export interface AppData {
  transactions: Transaction[];
  settings: FinanceSettings;
}

export type SaveResult = { ok: true } | { ok: false; message: string };

export function persistAppData(data: AppData, storage: Storage = window.localStorage): SaveResult {
  try {
    storage.setItem("saldo:transactions:v1", JSON.stringify(data.transactions));
    storage.setItem("saldo:settings:v1", JSON.stringify(data.settings));
    return { ok: true };
  } catch (error) {
    console.error("No se pudieron guardar los datos personales en este dispositivo.", error);
    return {
      ok: false,
      message: "No se pudo guardar. Comprueba el espacio disponible del navegador.",
    };
  }
}
