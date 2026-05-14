import { createContext, useContext, useEffect, useReducer } from "react";
import type { ReactNode } from "react";
import type {
  AfaAsset,
  PortfolioEvent,
  TaxYearData,
  WerbungskostenData,
} from "../types";

const CURRENT_TAX_YEAR = new Date().getFullYear() - 1;

const EMPTY_WERBUNGSKOSTEN: WerbungskostenData = {
  ergonomicFurnitureCost: 0,
  ergoFurnitureCarryOver: 0,
  internetMonthlyGross: 0,
  internetWorkPercent: 80,
  otherArbeitsmittelCost: 0,
  gewerkschaftCost: 0,
  fachliteraturCost: 0,
  reisekostenCost: 0,
  fortbildungCost: 0,
  otherWerbungskostenCost: 0,
};

function emptyYear(year: number): TaxYearData {
  return {
    year,
    afaAssets: [],
    werbungskosten: { ...EMPTY_WERBUNGSKOSTEN },
  };
}

interface State {
  selectedYear: number;
  years: TaxYearData[];
  // Global, cross-year list of every share movement (vests, ESPP buys,
  // exercises, sells). The moving-average cost basis is computed over this
  // whole list — it is NOT partitioned per year.
  portfolioEvents: PortfolioEvent[];
}

type Action =
  | { type: "SET_YEAR"; year: number }
  | { type: "ADD_ASSET"; asset: AfaAsset }
  | { type: "UPDATE_ASSET"; asset: AfaAsset }
  | { type: "DELETE_ASSET"; id: string }
  | { type: "SET_WERBUNGSKOSTEN"; data: WerbungskostenData }
  | {
      type: "SET_OTHER_BROKER";
      otherBrokerGainsEUR: number;
      otherBrokerLossesEUR: number;
      otherBrokerPaidKestEUR: number;
    }
  | { type: "ADD_PORTFOLIO_EVENTS"; events: PortfolioEvent[] }
  | { type: "DELETE_PORTFOLIO_EVENT"; id: string }
  | { type: "DELETE_ALL_PORTFOLIO_EVENTS" }
  | { type: "LOAD"; state: State };

function getOrCreateYear(years: TaxYearData[], year: number): TaxYearData[] {
  if (years.find((y) => y.year === year)) return years;
  return [...years, emptyYear(year)].sort((a, b) => b.year - a.year);
}

function updateYear(
  years: TaxYearData[],
  year: number,
  updater: (y: TaxYearData) => TaxYearData,
): TaxYearData[] {
  return years.map((y) => (y.year === year ? updater(y) : y));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return action.state;

    case "SET_YEAR": {
      const years = getOrCreateYear(state.years, action.year);
      return { ...state, selectedYear: action.year, years };
    }

    case "ADD_ASSET": {
      const years = getOrCreateYear(state.years, state.selectedYear);
      return {
        ...state,
        years: updateYear(years, state.selectedYear, (y) => ({
          ...y,
          afaAssets: [...y.afaAssets, action.asset],
        })),
      };
    }
    case "UPDATE_ASSET":
      return {
        ...state,
        years: updateYear(state.years, state.selectedYear, (y) => ({
          ...y,
          afaAssets: y.afaAssets.map((a) =>
            a.id === action.asset.id ? action.asset : a,
          ),
        })),
      };
    case "DELETE_ASSET":
      return {
        ...state,
        years: updateYear(state.years, state.selectedYear, (y) => ({
          ...y,
          afaAssets: y.afaAssets.filter((a) => a.id !== action.id),
        })),
      };

    case "SET_WERBUNGSKOSTEN":
      return {
        ...state,
        years: updateYear(state.years, state.selectedYear, (y) => ({
          ...y,
          werbungskosten: action.data,
        })),
      };

    case "SET_OTHER_BROKER":
      return {
        ...state,
        years: updateYear(state.years, state.selectedYear, (y) => ({
          ...y,
          otherBrokerGainsEUR: action.otherBrokerGainsEUR,
          otherBrokerLossesEUR: action.otherBrokerLossesEUR,
          otherBrokerPaidKestEUR: action.otherBrokerPaidKestEUR,
        })),
      };

    case "ADD_PORTFOLIO_EVENTS":
      return {
        ...state,
        portfolioEvents: [...state.portfolioEvents, ...action.events],
      };
    case "DELETE_PORTFOLIO_EVENT":
      return {
        ...state,
        portfolioEvents: state.portfolioEvents.filter(
          (e) => e.id !== action.id,
        ),
      };
    case "DELETE_ALL_PORTFOLIO_EVENTS":
      return { ...state, portfolioEvents: [] };

    default:
      return state;
  }
}

const STORAGE_KEY = "steuerhelfer-at-v1";

function loadState(): State {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as State;
      const years = getOrCreateYear(parsed.years, parsed.selectedYear);
      return { ...parsed, years, portfolioEvents: parsed.portfolioEvents ?? [] };
    }
  } catch {
    /* ignore */
  }
  const years = [emptyYear(CURRENT_TAX_YEAR)];
  return { selectedYear: CURRENT_TAX_YEAR, years, portfolioEvents: [] };
}

interface TaxContextValue {
  state: State;
  selectedYearData: TaxYearData;
  portfolioEvents: PortfolioEvent[];
  dispatch: React.Dispatch<Action>;
}

const TaxContext = createContext<TaxContextValue | null>(null);

export function TaxProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const selectedYearData =
    state.years.find((y) => y.year === state.selectedYear) ??
    emptyYear(state.selectedYear);

  return (
    <TaxContext.Provider
      value={{
        state,
        selectedYearData,
        portfolioEvents: state.portfolioEvents,
        dispatch,
      }}
    >
      {children}
    </TaxContext.Provider>
  );
}

export function useTax() {
  const ctx = useContext(TaxContext);
  if (!ctx) throw new Error("useTax must be used within TaxProvider");
  return ctx;
}
