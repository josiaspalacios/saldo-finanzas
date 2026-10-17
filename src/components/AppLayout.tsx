import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  LockKeyhole,
  Menu,
  Moon,
  Settings2,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { CURRENCIES, type CurrencyCode } from "../lib/finance";

const NAVIGATION = [
  { label: "Resumen", to: "/", icon: ChartNoAxesCombined, end: true },
  { label: "Movimientos", to: "/movimientos", icon: ArrowLeftRight },
  { label: "Presupuesto", to: "/presupuesto", icon: Wallet },
  { label: "Preferencias", to: "/preferencias", icon: Settings2 },
];

const PAGE_NAMES: Record<string, string> = {
  "/": "Resumen",
  "/movimientos": "Movimientos",
  "/presupuesto": "Presupuesto",
  "/preferencias": "Preferencias",
};

interface AppLayoutProps {
  currency: CurrencyCode;
  notice: string;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onToggleTheme: () => void;
  storageWarning: string | null;
  theme: "light" | "dark";
}

export default function AppLayout({
  currency,
  notice,
  onCurrencyChange,
  onToggleTheme,
  storageWarning,
  theme,
}: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const pageName = PAGE_NAMES[location.pathname] ?? "Resumen";

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className="app-layout">
      <aside className={`sidebar${menuOpen ? " sidebar-open" : ""}`}>
        <NavLink className="brand" onClick={() => setMenuOpen(false)} to="/">
          <span className="brand-symbol"><Wallet size={19} strokeWidth={2.4} /></span>
          <span>saldo<span className="brand-period">.</span></span>
        </NavLink>
        <div className="sidebar-label">FINANZAS PERSONALES</div>
        <nav aria-label="Navegación principal" className="sidebar-navigation">
          {NAVIGATION.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              className={({ isActive }) => `navigation-link${isActive ? " navigation-link-current" : ""}`}
              end={end}
              key={to}
              onClick={() => setMenuOpen(false)}
              to={to}
            >
              <Icon size={17} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="private-card">
            <div className="private-card-heading"><span className="private-card-icon"><LockKeyhole size={15} /></span><strong>Tu espacio, solo tuyo.</strong></div>
            <p>Tus finanzas se guardan de forma privada en este navegador.</p>
            <div className="private-status"><span /> Almacenamiento local activo</div>
          </div>
          <div className="profile-row">
            <span className="profile-avatar">T</span>
            <span className="profile-copy"><strong>Mi espacio</strong><small>Finanzas personales</small></span>
            <ShieldCheck className="profile-settings" size={16} />
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          aria-label="Cerrar menú"
          className="sidebar-scrim"
          onClick={() => setMenuOpen(false)}
          type="button"
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}
            className="icon-button mobile-menu-button"
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="breadcrumb"><span>Mi espacio</span><span className="breadcrumb-slash">/</span><strong>{pageName}</strong></div>
          <div className="topbar-tools">
            <span className="private-badge"><ShieldCheck size={14} /><span>Privado en este dispositivo</span></span>
            <label className="currency-control">
              <span className="sr-only">Moneda de la aplicación</span>
              <select aria-label="Moneda" onChange={(event) => onCurrencyChange(event.target.value as CurrencyCode)} value={currency}>
                {Object.entries(CURRENCIES).map(([code, item]) => <option key={code} value={code}>{code} · {item.name}</option>)}
              </select>
              <ChevronDown size={13} />
            </label>
            <button
              aria-label={theme === "light" ? "Activar tema oscuro" : "Activar tema claro"}
              className="icon-button theme-button"
              onClick={onToggleTheme}
              title="Cambiar tema"
              type="button"
            >
              <Moon size={16} />
            </button>
            <span aria-label="Tu perfil personal" className="top-avatar">T</span>
          </div>
        </header>

        <div className="dashboard-content">
          {storageWarning && <div className="storage-warning" role="alert"><CircleHelp size={16} /> {storageWarning}</div>}
          {notice && <div className="toast-message" role="status">{notice}</div>}
          <Outlet />
          <footer className="app-footer">
            <span>Saldo <span className="footer-dot">·</span> Un lugar privado para tus finanzas.</span>
            <span><LockKeyhole size={12} /> Guardado solo en este dispositivo</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
