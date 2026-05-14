import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TaxProvider } from "./context/TaxContext";
import { LanguageProvider } from "./context/LanguageContext";
import Layout from "./components/Layout";
import FinanzOnlineGuide from "./pages/FinanzOnlineGuide";
import EtradeSection from "./pages/EtradeSection";
import AfaCalculator from "./pages/AfaCalculator";
import WerbungskostenSection from "./pages/WerbungskostenSection";
import LegalPage from "./pages/LegalPage";

export default function App() {
  return (
    <LanguageProvider>
      <TaxProvider>
        <BrowserRouter basename="/steuerhelfer">
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<FinanzOnlineGuide />} />
              <Route path="etrade" element={<EtradeSection />} />
              <Route path="afa" element={<AfaCalculator />} />
              <Route
                path="werbungskosten"
                element={<WerbungskostenSection />}
              />
              <Route path="legal" element={<LegalPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TaxProvider>
    </LanguageProvider>
  );
}
