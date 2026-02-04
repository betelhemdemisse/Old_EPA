export default function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative w-full max-w-md">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-green-500"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
      </svg>
    </div>
  );
}