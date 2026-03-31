import LanguageSelector from "../ui/LanguageSelector.jsx";
import BottomNav from "./BottomNav.jsx";

function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-primary-light text-neutral-900">
      <div className="max-w-5xl mx-auto px-4 pb-24 pt-6 relative">
        <LanguageSelector className="absolute right-4 top-4" />
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

export default AppShell;
