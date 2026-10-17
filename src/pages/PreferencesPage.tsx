import { useRef, useState, type ChangeEvent } from "react";
import { Check, Download, LockKeyhole, RotateCcw, ShieldCheck, SunMoon, Upload } from "lucide-react";
import PageHeading from "../components/PageHeading";
import { CURRENCIES, type CurrencyCode, type FinanceSettings } from "../lib/finance";

interface PreferencesPageProps {
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onImport: (file: File) => Promise<void>;
  onRestoreDefaults: () => void;
  onToggleTheme: () => void;
  onExportBackup: () => void;
  settings: FinanceSettings;
  transactionsCount: number;
}

export default function PreferencesPage({
  currency,
  onCurrencyChange,
  onImport,
  onRestoreDefaults,
  onToggleTheme,
  onExportBackup,
  settings,
  transactionsCount,
}: PreferencesPageProps) {
  const [importing, setImporting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImporting(true);
    try {
      await onImport(file);
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <PageHeading
        description="Personaliza tu experiencia y mantén tus datos financieros bajo tu control."
        eyebrow="TU ESPACIO PERSONAL"
        title="Preferencias y privacidad."
      />
      <div className="settings-layout">
        <div className="settings-main-column">
          <section className="panel settings-panel">
            <div className="settings-section-heading"><span className="settings-icon"><SunMoon size={17} /></span><div><h2>Tu experiencia</h2><p>Ajusta la app a tu forma de ver las finanzas.</p></div></div>
            <label className="settings-row">
              <span><strong>Moneda principal</strong><small>Se usa para mostrar los importes registrados.</small></span>
              <select aria-label="Moneda principal" onChange={(event) => onCurrencyChange(event.target.value as CurrencyCode)} value={currency}>
                {Object.entries(CURRENCIES).map(([code, item]) => <option key={code} value={code}>{code} · {item.name}</option>)}
              </select>
            </label>
            <div className="settings-row">
              <span><strong>Apariencia</strong><small>Selecciona el tema que prefieres para tu espacio.</small></span>
              <button aria-label="Cambiar tema" className={`theme-switch${settings.theme === "dark" ? " is-on" : ""}`} onClick={onToggleTheme} role="switch" aria-checked={settings.theme === "dark"} type="button"><span /></button>
            </div>
          </section>

          <section className="panel settings-panel backup-settings-panel">
            <div className="settings-section-heading"><span className="settings-icon"><RotateCcw size={17} /></span><div><h2>Respaldo personal</h2><p>Descarga una copia tuya, cuando quieras.</p></div></div>
            <div className="backup-explanation"><LockKeyhole size={15} /><span>Tu información no tiene una copia en la nube. Guardar un respaldo te ayuda a recuperarla si cambias de navegador o dispositivo.</span></div>
            <div className="settings-row backup-summary"><span><strong>{transactionsCount} movimientos guardados</strong><small>El respaldo incluirá tus movimientos, moneda, tema y presupuesto.</small></span></div>
            <div className="backup-buttons">
              <button className="button button-primary" onClick={onExportBackup} type="button"><Download size={15} /> Descargar respaldo</button>
              <button className="button button-outline" disabled={importing} onClick={() => fileInput.current?.click()} type="button"><Upload size={15} /> {importing ? "Restaurando…" : "Restaurar desde archivo"}</button>
              <input accept="application/json,.json" aria-label="Seleccionar archivo de respaldo JSON" className="sr-only" onChange={handleImport} ref={fileInput} type="file" />
            </div>
          </section>
        </div>

        <aside className="settings-side-column">
          <section className="panel privacy-panel">
            <div className="privacy-large-icon"><ShieldCheck size={22} /></div>
            <span className="section-overline">TU PRIVACIDAD IMPORTA</span>
            <h2>Tus finanzas son tuyas.</h2>
            <p>Saldo funciona sin una cuenta ni conexión a un servidor financiero. Los movimientos se quedan guardados en el almacenamiento local de tu navegador.</p>
            <ul><li><Check size={14} /> Sin cuenta bancaria vinculada</li><li><Check size={14} /> Sin sincronización en la nube</li><li><Check size={14} /> Tus datos no se envían al publicar la app</li></ul>
          </section>
          <section className="panel settings-disclaimer">
            <strong>Una nota importante</strong>
            <p>Los importes se muestran en la moneda seleccionada. Cambiar la moneda de vista no convierte automáticamente los importes que ya registraste.</p>
          </section>
          <section className="panel settings-reset">
            <h2>Restablecer preferencias</h2>
            <p>Vuelve a la apariencia clara y la moneda inicial. No borra tus movimientos.</p>
            <button className="button button-quiet" onClick={onRestoreDefaults} type="button">Restablecer preferencias</button>
          </section>
        </aside>
      </div>
    </>
  );
}
