import React from "react";

export default function FilterTab({
  options = [],      
  value = "all",
  onChange = () => {},
}) {

  console.log(options , "options")
  return (
    <div className=" inline-flex p-1 gap-4 bg-white border border-gray-300 rounded-lg shadow-sm">
      {options.filter(opt => !opt.disabled).map(opt => {
        const active = opt.key === value;

        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={
              `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ` +
              (active
                ? "bg-[#387E53] text-white shadow-md"
                : "bg-[#F5F7FA] text-gray-700 hover:bg-gray-200")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
