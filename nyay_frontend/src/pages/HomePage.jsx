import { Link } from "react-router-dom";
import { MessageCircle, FileText, FileSignature, Landmark, MapPin, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "../components/ui/Card.jsx";

const tiles = [
  { labelKey: "home.ask", to: "/ask", icon: MessageCircle },
  { labelKey: "home.contract", to: "/contract", icon: FileText },
  { labelKey: "home.fir", to: "/fir", icon: FileSignature },
  { labelKey: "home.bns", to: "/bns", icon: Landmark },
  { labelKey: "home.ngo", to: "/ngo", icon: MapPin },
  { labelKey: "home.quiz", to: "/quiz", icon: HelpCircle }
];

function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-4">
          <img src="/logo.svg" alt="Nyaya Setu" className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold font-display text-neutral-900">{t("home.headline")}</h1>
        <p className="text-lg text-neutral-700 mt-2">{t("home.subheading")}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {tiles.map(({ labelKey, to, icon: Icon }) => (
          <Link key={to} to={to} aria-label={t(labelKey)}>
            <Card className="flex flex-col items-center justify-center h-36 gap-3 bg-primary-light">
              <div className="w-16 h-16 rounded-2xl bg-white text-primary flex items-center justify-center shadow">
                <Icon size={28} />
              </div>
              <span className="font-bold text-neutral-900 text-center">{t(labelKey)}</span>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-neutral-700">
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-white shadow">{t("home.madeFor")}</span>
        </div>
        <div className="text-xs text-neutral-600">Nyaya Setu</div>
      </div>
    </div>
  );
}

export default HomePage;
