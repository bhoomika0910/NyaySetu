import { motion } from "framer-motion";
import Spinner from "./Spinner.jsx";

const variants = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "border border-primary text-primary bg-white hover:bg-primary-light",
  danger: "bg-danger text-white hover:bg-danger/90",
  ghost: "bg-transparent text-neutral-900 hover:bg-neutral-50"
};

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-base",
  lg: "h-14 px-6 text-lg"
};

function Button({
  variant = "primary",
  size = "md",
  fullWidth = true,
  loading = false,
  disabled = false,
  children,
  className = "",
  ...props
}) {
  const base = `${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} rounded-full font-bold flex items-center justify-center gap-2 transition focus-visible:ring-2 ring-primary disabled:opacity-60 disabled:cursor-not-allowed`;

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
      className={`${base} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size={18} />}
      <span>{loading ? "" : children}</span>
    </motion.button>
  );
}

export default Button;
