import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, FileText, FileSignature, MoreHorizontal } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/ask", label: "Ask", icon: MessageCircle, primary: true },
  { to: "/contract", label: "Contract", icon: FileText },
  { to: "/fir", label: "FIR", icon: FileSignature },
  { to: "/bns", label: "More", icon: MoreHorizontal }
];

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 shadow-[0_-6px_30px_rgba(0,0,0,0.08)] safe-area-bottom">
      <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between gap-2">
        {items.map(({ to, label, icon: Icon, primary }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className={`${
                primary
                  ? "w-14 h-14 -mt-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"
                  : "flex-1 h-12 rounded-full flex items-center justify-center gap-2 text-sm font-semibold"
              } ${active && !primary ? "text-primary bg-primary-light" : "text-neutral-900"}`}
            >
              <Icon size={primary ? 26 : 22} />
              {!primary && <span>{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
