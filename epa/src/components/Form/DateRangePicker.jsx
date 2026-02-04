// components/Form/DateRangePicker.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onChange,
  placeholder = "Select date range",
  minDate = null,
  maxDate = new Date(),
  format = "MM/dd/yyyy",
  presets = true,
  showClear = true,
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState(null);
  const [activePreset, setActivePreset] = useState(null);
  const pickerRef = useRef(null);

  const presetsList = [
    { label: "Today", days: 0 },
    { label: "Yesterday", days: -1 },
    { label: "Last 7 days", days: -7 },
    { label: "Last 30 days", days: -30 },
    { label: "This month", custom: () => {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      };
    }},
    { label: "Last month", custom: () => {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0)
      };
    }},
    { label: "This quarter", custom: () => {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      return {
        start: new Date(now.getFullYear(), quarter * 3, 1),
        end: new Date(now.getFullYear(), quarter * 3 + 3, 0)
      };
    }},
    { label: "This year", custom: () => {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31)
      };
    }}
  ];

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    switch (format) {
      case "dd/MM/yyyy":
        return `${day}/${month}/${year}`;
      case "yyyy-MM-dd":
        return `${year}-${month}-${day}`;
      default:
        return `${month}/${day}/${year}`;
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateInRange = (date) => {
    if (!tempStart && !tempEnd) return false;
    if (tempStart && tempEnd) {
      return date >= tempStart && date <= tempEnd;
    }
    if (tempStart && hoverDate) {
      const start = tempStart < hoverDate ? tempStart : hoverDate;
      const end = tempStart < hoverDate ? hoverDate : tempStart;
      return date >= start && date <= end;
    }
    return false;
  };

  const isStartDate = (date) => {
    return tempStart && date.toDateString() === tempStart.toDateString();
  };

  const isEndDate = (date) => {
    return tempEnd && date.toDateString() === tempEnd.toDateString();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isDisabled = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateClick = (date) => {
    if (isDisabled(date)) return;

    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(date);
      setTempEnd(null);
      setActivePreset(null);
    } else if (tempStart && !tempEnd) {
      if (date < tempStart) {
        setTempEnd(tempStart);
        setTempStart(date);
      } else {
        setTempEnd(date);
      }
    }
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
    setActivePreset(null);
    onChange({ start: null, end: null });
  };

  const handlePresetClick = (preset) => {
    let start, end;
    
    if (preset.custom) {
      const range = preset.custom();
      start = range.start;
      end = range.end;
    } else {
      end = new Date();
      start = new Date();
      start.setDate(end.getDate() + preset.days);
    }

    setTempStart(start);
    setTempEnd(end);
    setActivePreset(preset.label);
    
    // Auto-apply preset selections
    onChange({ start, end });
    setTimeout(() => setIsOpen(false), 300);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(viewMonth);
    newMonth.setMonth(viewMonth.getMonth() + direction);
    setViewMonth(newMonth);
  };

  const goToToday = () => {
    const today = new Date();
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const renderCalendar = () => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const weeks = [];
    let days = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = 0; i < firstDay; i++) {
      const day = prevMonthDays - firstDay + i + 1;
      const date = new Date(year, month - 1, day);
      days.push(
        <div
          key={`prev-${i}`}
          className="h-9 flex items-center justify-center text-slate-400 cursor-not-allowed"
        >
          {day}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isRange = isDateInRange(date);
      const isStart = isStartDate(date);
      const isEnd = isEndDate(date);
      const disabled = isDisabled(date);
      const today = isToday(date);
      
      let className = "h-9 flex items-center justify-center rounded-md cursor-pointer ";
      
      if (disabled) {
        className += "text-slate-400 cursor-not-allowed ";
      } else if (isStart || isEnd) {
        className += "bg-blue-600 text-white font-semibold ";
      } else if (isRange) {
        className += "bg-blue-100 text-blue-700 ";
      } else if (today) {
        className += "border border-blue-500 text-blue-700 ";
      } else {
        className += "text-slate-700 hover:bg-slate-100 ";
      }

      days.push(
        <div
          key={day}
          className={className}
          onClick={() => !disabled && handleDateClick(date)}
          onMouseEnter={() => !disabled && setHoverDate(date)}
          title={formatDate(date)}
        >
          {day}
        </div>
      );

      if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
        // Fill remaining days for next month
        const nextMonthDays = 42 - days.length; // 6 weeks * 7 days
        for (let i = 1; i <= nextMonthDays; i++) {
          const date = new Date(year, month + 1, i);
          days.push(
            <div
              key={`next-${i}`}
              className="h-9 flex items-center justify-center text-slate-400 cursor-not-allowed"
            >
              {i}
            </div>
          );
        }

        weeks.push(
          <div key={weeks.length} className="grid grid-cols-7 gap-1">
            {days}
          </div>
        );
        days = [];
      }
    }

    return weeks;
  };

  const displayText = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (startDate) {
      return `From ${formatDate(startDate)}`;
    } else if (endDate) {
      return `To ${formatDate(endDate)}`;
    }
    return placeholder;
  };

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-2.5 text-left flex items-center justify-between border rounded-lg transition-colors ${
          disabled 
            ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed' 
            : 'bg-white border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className={`${(!startDate && !endDate) ? 'text-slate-500' : 'text-slate-900'}`}>
            {displayText()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {showClear && (startDate || endDate) && (
            <X
              className="w-4 h-4 text-slate-400 hover:text-slate-600"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* Calendar Popup */}
      {isOpen && !disabled && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-xl shadow-lg border border-slate-200 p-6 w-[800px] max-w-[95vw]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Presets Column */}
            {presets && (
              <div className="md:col-span-1">
                <h4 className="font-semibold text-slate-900 mb-4">Quick Select</h4>
                <div className="space-y-2">
                  {presetsList.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activePreset === preset.label
                          ? 'bg-blue-50 border border-blue-200 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                
                {/* Selected Dates Preview */}
                <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                  <h5 className="font-medium text-slate-700 mb-2">Selected Range</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">From:</span>
                      <span className="font-medium text-slate-900">
                        {tempStart ? formatDate(tempStart) : "Not selected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">To:</span>
                      <span className="font-medium text-slate-900">
                        {tempEnd ? formatDate(tempEnd) : "Not selected"}
                      </span>
                    </div>
                    {tempStart && tempEnd && (
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="text-sm text-slate-600">Duration:</span>
                        <span className="font-medium text-slate-900">
                          {Math.ceil((tempEnd - tempStart) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Column */}
            <div className={`${presets ? 'md:col-span-2' : 'md:col-span-3'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={goToToday}
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Today
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-slate-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="space-y-1">
                {renderCalendar()}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  {tempStart && tempEnd ? (
                    <span>
                      Selected: <span className="font-medium text-slate-900">
                        {formatDate(tempStart)} → {formatDate(tempEnd)}
                      </span>
                    </span>
                  ) : tempStart ? (
                    <span>
                      Start date selected: <span className="font-medium text-slate-900">
                        {formatDate(tempStart)}
                      </span>
                    </span>
                  ) : (
                    <span>Select a date range</span>
                  )}
                </div>
                <div className="flex gap-3">
                  {showClear && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={!tempStart || !tempEnd}
                    className={`px-4 py-2 text-sm rounded-lg ${
                      tempStart && tempEnd
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Date Inputs for Manual Entry */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={tempStart ? tempStart.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    setTempStart(date);
                    setActivePreset(null);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  max={maxDate?.toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={tempEnd ? tempEnd.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    setTempEnd(date);
                    setActivePreset(null);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  max={maxDate?.toISOString().split('T')[0]}
                  min={tempStart?.toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;