import { useCallback, useEffect, useRef, useState } from "react";
import { HashRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import TransactionDialog from "./components/TransactionDialog";
import BudgetPage from "./pages/BudgetPage";
import DashboardPage from "./pages/DashboardPage";
import PreferencesPage from "./pages/PreferencesPage";
import TransactionsPage from "./pages/TransactionsPage";
import { persistAppData } from "./lib/appData";
import {
  CURRENCIES,
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  TRANSACTIONS_KEY,
  isFinanceSettings,
  isTransaction,
  loadFinanceData,
  makeCsv,
  monthString,
  type CurrencyCode,
  type FinanceSettings,
  type Transaction,
} from "./lib/finance";

function getInitialData() {
  try {
    return loadFinanceData(window.localStorage);
  } catch (error) {
    console.error("El almacenamiento local no está disponible en este navegador.", error);
    return {
      transactions: [],
      settings: DEFAULT_SETTINGS,
      warning: "El almacenamiento privado no está disponible; los cambios no se conservarán al cerrar esta página.",
    };
  }
}

function downloadFile(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function FinanceApplication() {
  const navigate = useNavigate();
  const [initialData] = useState(getInitialData);
  const [transactions, setTransactions] = useState(initialData.transactions);
  const [settings, setSettings] = useState<FinanceSettings>(initialData.settings);
  const [storageWarning, setStorageWarning] = useState(initialData.warning);
  const [notice, setNotice] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"income" | "expense">("expense");
  const firstPersist = useRef(true);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    if (firstPersist.current) {
      firstPersist.current = false;
      if (initialData.warning) return;
    }
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      window.localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
      setStorageWarning(null);
    } catch (error) {
      console.error("No se pudieron guardar los datos personales en este dispositivo.", error);
      setStorageWarning("No se pudo guardar. Comprueba el espacio disponible del navegador.");
    }
  }, [settings, transactions]);

  const announce = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }, []);

  function openTransactionDialog(type: "income" | "expense" = "expense") {
    setDialogType(type);
    setShowDialog(true);
  }

  function addTransaction(transaction: Transaction) {
    setTransactions((current) => [...current, transaction]);
    setShowDialog(false);
    announce("Movimiento guardado en este dispositivo.");
    navigate(`/movimientos?mes=${transaction.date.slice(0, 7)}`);
  }

  function deleteTransaction(transaction: Transaction) {
    if (!window.confirm(`¿Eliminar «${transaction.description}»? Esta acción no se puede deshacer.`)) return;
    setTransactions((current) => current.filter((item) => item.id !== transaction.id));
    announce("Movimiento eliminado.");
  }

  function saveBudget(budget: number) {
    setSettings((current) => ({ ...current, monthlyBudget: budget }));
    announce("Tu presupuesto mensual quedó actualizado.");
  }

  function updateCurrency(currency: CurrencyCode) {
    setSettings((current) => ({ ...current, currency }));
  }

  function toggleTheme() {
    setSettings((current) => ({ ...current, theme: current.theme === "light" ? "dark" : "light" }));
  }

  function exportTransactions(selected: Transaction[], month: string) {
    if (!selected.length) {
      announce("No hay movimientos para exportar con los filtros actuales.");
      return;
    }
    downloadFile(
      makeCsv(selected, settings.currency),
      `movimientos-${month || "todos"}.csv`,
      "text/csv;charset=utf-8",
    );
    announce("El archivo CSV está listo.");
  }

  function exportBackup() {
    const backup = {
      format: "saldo-personal-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      transactions,
    };
    downloadFile(JSON.stringify(backup, null, 2), `saldo-respaldo-${monthString()}.json`, "application/json");
    announce("Respaldo personal descargado en tu dispositivo.");
  }

  async function importBackup(file: File) {
    try {
      const contents: unknown = JSON.parse(await file.text());
      if (
        !contents
        || typeof contents !== "object"
        || !("format" in contents)
        || contents.format !== "saldo-personal-backup"
        || !("version" in contents)
        || contents.version !== 1
        || !("transactions" in contents)
        || !Array.isArray(contents.transactions)
        || !("settings" in contents)
        || !isFinanceSettings(contents.settings)
      ) {
        throw new Error("El archivo no parece ser un respaldo válido de Saldo.");
      }
      const restored = contents.transactions.filter(isTransaction);
      if (restored.length !== contents.transactions.length) {
        throw new Error("El respaldo contiene movimientos inválidos y no se importó.");
      }
      if (!window.confirm(`Se reemplazarán tus movimientos actuales por ${restored.length} del respaldo. ¿Continuar?`)) return;
      const next = { transactions: restored, settings: contents.settings };
      const result = persistAppData(next);
      if (!result.ok) throw new Error(result.message);
      setTransactions(restored);
      setSettings(contents.settings);
      announce(`Se restauraron ${restored.length} movimientos correctamente.`);
    } catch (error) {
      console.error("No se pudo restaurar el respaldo.", error);
      announce(error instanceof Error ? error.message : "No se pudo leer el archivo de respaldo.");
    }
  }

  function restorePreferences() {
    setSettings((current) => ({ ...current, currency: DEFAULT_SETTINGS.currency, theme: DEFAULT_SETTINGS.theme }));
    announce("Se restablecieron las preferencias. Tus movimientos no se modificaron.");
  }

  return (
    <>
      <Routes>
        <Route element={<AppLayout
          currency={settings.currency}
          notice={notice}
          onCurrencyChange={updateCurrency}
          onToggleTheme={toggleTheme}
          storageWarning={storageWarning}
          theme={settings.theme}
        />}>
          <Route element={<DashboardPage currency={settings.currency} onAdd={openTransactionDialog} onDelete={deleteTransaction} transactions={transactions} />} path="/" />
          <Route element={<TransactionsPage currency={settings.currency} onAdd={() => openTransactionDialog()} onDelete={deleteTransaction} onExport={exportTransactions} transactions={transactions} />} path="/movimientos" />
          <Route element={<BudgetPage budget={settings.monthlyBudget} currency={settings.currency} onSave={saveBudget} transactions={transactions} />} path="/presupuesto" />
          <Route element={<PreferencesPage
            currency={settings.currency}
            onCurrencyChange={updateCurrency}
            onExportBackup={exportBackup}
            onImport={importBackup}
            onRestoreDefaults={restorePreferences}
            onToggleTheme={toggleTheme}
            settings={settings}
            transactionsCount={transactions.length}
          />} path="/preferencias" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Route>
      </Routes>
      {showDialog && (
        <TransactionDialog
          currencySymbol={new Intl.NumberFormat(CURRENCIES[settings.currency].locale, { style: "currency", currency: settings.currency }).formatToParts(0).find((part) => part.type === "currency")?.value ?? settings.currency}
          initialType={dialogType}
          onClose={() => setShowDialog(false)}
          onSave={addTransaction}
        />
      )}
    </>
  );
}

export default function App() {
  return <HashRouter><FinanceApplication /></HashRouter>;
}
