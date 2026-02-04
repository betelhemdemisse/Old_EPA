// components/Form/SimpleDateRangePicker.jsx
import React, { useState, useRef } from "react";
import { Calendar, X } from "lucide-react";

const SimpleDateRangePicker = ({ 
  startDate, 
  endDate, 
  onChange,
  placeholder = "Select date range",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const pickerRef = useRef(null);

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString();
  };

  const handleApply = () => {
    onChange({
      start: tempStart,
      end: tempEnd
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStart(null);
    setTempEnd(null);
    onChange({ start: null, end: null });
  };

  const displayText = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    return placeholder;
  };

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-2.5 text-left flex items-center justify-between border rounded-lg ${
          disabled 
            ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed' 
            : 'bg-white border-slate-300 hover:border-slate-400 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{displayText()}</span>
        </div>
        {(startDate || endDate) && (
          <X
            className="w-4 h-4 text-slate-400 hover:text-slate-600"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-lg shadow-lg border border-slate-200 p-4 min-w-[300px]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={tempStart ? tempStart.toISOString().split('T')[0] : ''}
                onChange={(e) => setTempStart(e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={tempEnd ? tempEnd.toISOString().split('T')[0] : ''}
                onChange={(e) => setTempEnd(e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                min={tempStart?.toISOString().split('T')[0]}
              />
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDateRangePicker;