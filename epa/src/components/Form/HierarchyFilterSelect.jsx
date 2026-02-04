import Select from "./Select";

export default function HierarchyFilterSelect({
  fields = [],
  value = {},
  onChange,
  disabled = false,
  onClear,
}) {
  const handleFieldChange = (fieldName, fieldValue) => {
    // Update the specific field
    const updated = { ...value, [fieldName]: fieldValue };
    
    // Clear all descendant fields when a parent field changes
    const keys = Object.keys(updated).filter(
      (k) => k === "hierarchyRoot" || k.startsWith("childOf_")
    );
    
    const currentIndex = keys.indexOf(fieldName);
    
    // Clear only deeper levels
    keys.forEach((k, index) => {
      if (index > currentIndex) {
        updated[k] = "";
      }
    });
    
    onChange(updated);
  };

  const handleClear = () => {
    const clearedFilters = {};
    fields.forEach(field => {
      clearedFilters[field.name] = "";
    });
    onChange(clearedFilters);
    onClear?.();
  };

  const hasActiveFilters = fields.some(field => 
    value?.[field.name] && value[field.name] !== ""
  );

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3 p-2 rounded-xl border border-gray-100  text-sm">
      {fields.map((field) => (
        <div key={field.name} className="w-52">
          <Select
            label={field.label}
            value={value?.[field.name] || ""}
            onChange={(val) => handleFieldChange(field.name, val)}
            options={field.options || []}
            placeholder={field.placeholder || `Select ${field.label}`}
            disabled={disabled}
            className="mb-0"
            showLabel={false} // Hide label to match original compact style
          />
        </div>
      ))}

      {hasActiveFilters && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleClear}
            className="h-8 px-3 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-150"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}