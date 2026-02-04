import { useState, useRef, useEffect } from "react";

export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  className,
  error,
  onBlur,
  required = false,
  multiple = false,
}) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        if (open) {
          setOpen(false);
          onBlur?.();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onBlur]);

  // Get selected labels
  const selectedLabels = multiple
    ? options.filter(opt => (value || []).includes(opt.value)).map(opt => opt.label)
    : [options.find(opt => opt.value === value)?.label].filter(Boolean);

  const toggleOption = (optValue) => {
    if (!multiple) {
      onChange(optValue);
      setOpen(false);
      onBlur?.();
    } else {
      if (!Array.isArray(value)) value = [];
      if (value.includes(optValue)) {
        onChange(value.filter(v => v !== optValue));
      } else {
        onChange([...value, optValue]);
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && <label className="block mb-1 text-sm font-medium">{label} {required && <span className="text-red-500 ml-1">*</span>}</label>}

      {/* Input box */}
      <div
        onClick={() => setOpen(!open)}
        className={`w-full cursor-pointer rounded border focus:ring-green-500 focus:border-green-500 px-3 py-2 text-sm flex justify-between items-center bg-white ${
          error ? 'border-red-500 focus:ring-red-300 focus:border-red-500' : 'border-gray-300'
        }`}
      >
        <span className={`${selectedLabels.length === 0 ? "text-gray-400" : ""}`}>
          {selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder}
        </span>
        <svg
          className={`h-4 w-4 transform transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-gray-300 bg-white text-sm shadow-lg">
          {options.map((opt) => {
            const isSelected = multiple ? (value || []).includes(opt.value) : value === opt.value;
            return (
              <li
                key={opt.value}
                onClick={() => toggleOption(opt.value)}
                className={`px-3 py-2 cursor-pointer hover:bg-emerald-100 flex justify-between items-center ${
                  isSelected ? "bg-emerald-200 font-medium" : ""
                }`}
              >
                {opt.label}
                {isSelected && multiple && <span>✓</span>}
              </li>
            );
          })}
        </ul>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
