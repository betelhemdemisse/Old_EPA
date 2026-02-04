//  reusable text input
export default function Input({ label, value, onChange, name, type = "text",required = false, error, onBlur, ...props }) {
  return (
    <div className="mb-3">
      {label && <label className="block mb-1 text-sm font-medium">{label} {required && <span className="text-red-500 ml-1">*</span>}</label>}
      <input
        className={`w-full rounded border px-3 py-2 text-sm outline-none focus:ring-green-500 focus:border-green-500 ${
          error ? 'border-red-500 focus:ring-red-300 focus:border-red-500' : 'border-gray-300'
        }`}
        type={type}
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={(e) => onBlur?.(e)}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
