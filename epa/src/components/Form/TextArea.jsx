// Minimal reusable textarea input
export default function TextArea({ label, value, onChange, name, rows = 3, required = false,error, onBlur, ...props }) {
  return (
    <div className="mb-3">
      {label && <label className="block mb-1 text-sm font-medium">{label} {required && <span className="text-red-500 ml-1">*</span>}</label>}
      <textarea
        className={`w-full rounded px-3 py-2 text-sm border  outline-none focus:ring-green-500 focus:border-green-500 ${
          error ? 'border-red-500 focus:ring-red-300 focus:border-red-500' : 'border-gray-300'
        }`}
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={(e) => onBlur?.(e)}
        rows={rows}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
