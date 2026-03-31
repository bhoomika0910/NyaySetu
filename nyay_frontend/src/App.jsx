import { lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppShell from "./components/layout/AppShell.jsx";
import ErrorBoundary from "./components/layout/ErrorBoundary.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const LegalQueryPage = lazy(() => import("./pages/LegalQueryPage.jsx"));
const FIRDrafterPage = lazy(() => import("./pages/FIRDrafterPage.jsx"));
const ContractScannerPage = lazy(() => import("./pages/ContractScannerPage.jsx"));
const BNSMapperPage = lazy(() => import("./pages/BNSMapperPage.jsx"));
const CaseMeterPage = lazy(() => import("./pages/CaseMeterPage.jsx"));
const AnonymousReportPage = lazy(() => import("./pages/AnonymousReportPage.jsx"));
const NGOLocatorPage = lazy(() => import("./pages/NGOLocatorPage.jsx"));
const LegalQuizPage = lazy(() => import("./pages/LegalQuizPage.jsx"));
const RightsCardPage = lazy(() => import("./pages/RightsCardPage.jsx"));

function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <AppShell>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/ask" element={<LegalQueryPage />} />
            <Route path="/fir" element={<FIRDrafterPage />} />
            <Route path="/contract" element={<ContractScannerPage />} />
            <Route path="/bns" element={<BNSMapperPage />} />
            <Route path="/case" element={<CaseMeterPage />} />
            <Route path="/report" element={<AnonymousReportPage />} />
            <Route path="/ngo" element={<NGOLocatorPage />} />
            <Route path="/quiz" element={<LegalQuizPage />} />
            <Route path="/rights-card" element={<RightsCardPage />} />
          </Routes>
        </AnimatePresence>
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;
