export default function Button({
  children,
  variant = "solid",
  disabled,
  color = "green",
  className = "",
  onClick,
  ...props
}) {
  const base =
    "inline-flex items-center gap-2 rounded-md text-sm font-medium px-3.5 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const styles = {
    solid: {
      green:
        "bg-[#387E53] text-white hover:bg-green-700 focus:ring-green-600",
      blue: "bg-[#1ca9e1] text-white hover:bg-sky-700 focus:ring-sky-600",
      gray: "bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-700",
      dark: "bg-[#0f4d98] text-white hover:bg-[#0f4d98] focus:ring-gray-700",
    },
    outline: {
      green:
        "border border-green-600 text-green-700 hover:bg-green-50 focus:ring-green-600",
      gray:
        "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400",
    },
    ghost: {
      gray: "text-gray-600 hover:bg-gray-100 focus:ring-gray-300",
    },
  };

  // Apply disabled styles
  const disabledStyles = disabled 
    ? "opacity-60 cursor-not-allowed !hover:bg-none pointer-events-none" 
    : "";
  
  // Get the style classes
  const styleClasses = styles[variant][color] || styles.solid.green;

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onClick) onClick(e);
  };

  return (
    <button
      disabled={disabled}
      className={`${base} ${styleClasses} ${disabledStyles} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}