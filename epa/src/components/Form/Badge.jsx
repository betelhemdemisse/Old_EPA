export default function Badge({ children, color = "green" }) {
  const map = {
    green: "bg-green-50 text-green-700 ring-1 ring-green-200",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    gray: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[color]}`}>
      {children}
    </span>
  );
}