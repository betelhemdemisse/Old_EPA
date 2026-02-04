import React from "react";

export default function Modal({ open, grid = '', onClose, title, description, children, actions , width,height  }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/30 p-4">
     <div className={`bg-white rounded-lg shadow-lg p-6 relative ${width} ${height} max-h-[200] overflow-y-auto`}>

        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <span aria-hidden>x</span>
        </button>

        {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
        {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}

        <div className={`${grid ?? ''} mb-4`}>
          {children}
        </div>

        {actions && (
          <div className="flex justify-end gap-2 mt-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
