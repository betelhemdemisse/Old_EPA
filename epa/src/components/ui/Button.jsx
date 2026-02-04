// components/ui/Button.jsx
import React from "react";

export default function Button({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-lg bg-[#387E53]  text-white font-medium shadow-sm transition duration-200 ${className}`}
    >
      {children}
    </button>
  );
}
