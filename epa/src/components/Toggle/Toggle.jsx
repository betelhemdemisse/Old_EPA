export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <span
          className={`block h-5 w-9 rounded-full transition-colors ${
            checked ? "bg-[#387E53]" : "bg-gray-300"
          }`}
        />
        <span
          className={`absolute left-0 top-0 h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
    </label>
  );
}