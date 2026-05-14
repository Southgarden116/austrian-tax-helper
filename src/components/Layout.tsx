import { useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Calculator, Home, Menu, TrendingUp, X } from "lucide-react";
import { useIntl } from "react-intl";
import { useTax } from "../context/TaxContext";
import { useLanguage } from "../context/LanguageContext";
import TaxSummaryPrint from "./TaxSummaryPrint";

const currentYear = new Date().getFullYear();
const AVAILABLE_YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i);

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

export default function Layout() {
  const { state, dispatch } = useTax();
  const { locale, setLocale } = useLanguage();
  const intl = useIntl();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_ITEMS = useMemo(
    () => [
      {
        to: "/",
        label: intl.formatMessage({ id: "nav.finanzonline" }),
        icon: BarChart3,
      },
      {
        to: "/etrade",
        label: intl.formatMessage({ id: "nav.etrade" }),
        icon: TrendingUp,
      },
      {
        to: "/afa",
        label: intl.formatMessage({ id: "nav.afa" }),
        icon: Calculator,
      },
      {
        to: "/werbungskosten",
        label: intl.formatMessage({ id: "nav.werbungskosten" }),
        icon: Home,
      },
    ],
    [intl],
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 bg-gray-900 text-white px-4 py-3 print:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label={intl.formatMessage({ id: "layout.menu" })}
          className="p-1 -ml-1 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-at-red font-bold text-lg">🇦🇹</span>
          <span className="font-bold">Steuerhelfer</span>
        </div>
        <select
          value={state.selectedYear}
          onChange={(e) =>
            dispatch({ type: "SET_YEAR", year: Number(e.target.value) })
          }
          className="ml-auto bg-gray-800 text-white border border-gray-600 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-at-red/50"
        >
          {AVAILABLE_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </header>

      <div className="lg:h-screen lg:flex lg:overflow-hidden print:hidden">
        {/* Backdrop (mobile) */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 transform transition-transform duration-200 lg:transform-none ${
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-5 border-b border-gray-700 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-at-red font-bold text-xl">🇦🇹</span>
                <span className="font-bold text-lg">Steuerhelfer</span>
              </div>
              <p className="text-gray-400 text-xs">
                {intl.formatMessage({ id: "layout.subtitle" })}
              </p>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label={intl.formatMessage({ id: "common.close" })}
              className="lg:hidden p-1 -mr-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 py-3 border-b border-gray-700">
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1.5">
              {intl.formatMessage({ id: "layout.taxYear" })}
            </label>
            <select
              value={state.selectedYear}
              onChange={(e) =>
                dispatch({ type: "SET_YEAR", year: Number(e.target.value) })
              }
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-at-red/50"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-at-red text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-700 space-y-3">
            {/* Language switcher */}
            <div className="flex gap-1">
              {(["de", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold uppercase transition-colors ${
                    locale === l
                      ? "bg-at-red text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              {intl.formatMessage({ id: "layout.privacy" })}
            </p>
            <div className="flex flex-col gap-2">
              <NavLink
                to="/legal"
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-medium transition-colors"
              >
                {intl.formatMessage({ id: "layout.legal" })}
              </NavLink>
              <a
                href="https://github.com/Southgarden116/tax-helper"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-medium transition-colors"
              >
                <GithubIcon size={16} />
                {intl.formatMessage({ id: "layout.github" })}
              </a>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:overflow-auto">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
      <TaxSummaryPrint />
    </>
  );
}
