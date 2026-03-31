import { motion } from "framer-motion";

function Card({ children, className = "", tone }) {
  const border = tone ? `border-l-4 ${tone}` : "";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-card rounded-2xl p-5 ${border} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default Card;
