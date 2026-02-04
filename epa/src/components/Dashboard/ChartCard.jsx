import React from 'react';

export default function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}