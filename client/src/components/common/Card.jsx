function Card({
  children,
  className = "",
  hoverable = false,
}) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-sm ${
        hoverable
          ? "hover:shadow-md hover:border-slate-300 transition-all duration-150"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;