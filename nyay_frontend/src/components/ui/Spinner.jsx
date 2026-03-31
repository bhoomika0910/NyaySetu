function Spinner({ size = 20 }) {
  return (
    <span
      className="inline-block border-2 border-primary/30 border-t-primary rounded-full animate-spin"
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

export default Spinner;
