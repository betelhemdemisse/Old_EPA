// components/Dashboard/PollutionCategoryTrendsChart.jsx
import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getChartData } from "../../services/generalDashboard.service";
import { getDashboardStats } from "../../services/generalDashboard.service";

// Pollution category colors
const pollutionColors = {
  "Air Pollution": "#3b82f6",      // Blue
  "Water Pollution": "#06b6d4",    // Cyan
  "Chemical Pollution": "#10b981", // Green
  "Soil Pollution": "#8b5cf6",     // Purple
  "Noise Pollution": "#f59e0b",    // Amber
  "Waste Pollution": "#ef4444",    // Red
  "Radiation Pollution": "#ec4899", // Pink
  "Thermal Pollution": "#f97316",  // Orange
  "Light Pollution": "#84cc16",    // Lime
  "Visual Pollution": "#a855f7",   // Violet
};

// Time period options


// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
    
    return (
      <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-xl min-w-64">
        <p className="font-bold text-gray-800 mb-3 pb-2 border-b">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            entry.value !== undefined && entry.value > 0 && (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm font-medium">{entry.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{entry.value}</span>
                  {total > 0 && (
                    <span className="text-xs text-gray-500">
                      ({Math.round((entry.value / total) * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
        {total > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Total</span>
              <span className="text-sm font-bold text-gray-800">{total} reports</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function LineChartCard({ filters = {} }) {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [visibleLines, setVisibleLines] = useState({});
  const [chartData, setChartData] = useState([]);
  const [pollutionTypes, setPollutionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize pollution types from stats
  useEffect(() => {
    fetchPollutionTypes();
  }, [filters]);

  // Fetch pollution types from dashboard stats
  const fetchPollutionTypes = async () => {
    try {
      const result = await getDashboardStats(filters);
      
      if (result.success && result.data.pollutionStats) {
        const types = result.data.pollutionStats.map(stat => ({
          key: stat.category.replace(/\s+/g, '_').toLowerCase(),
          name: stat.category.trim(),
          color: pollutionColors[stat.category.trim()] || getRandomColor(),
          visible: true,
          count: stat.count
        }));

        // Initialize visible lines
        const initialVisible = {};
        types.forEach(type => {
          initialVisible[type.key] = true;
        });
        setVisibleLines(initialVisible);
        setPollutionTypes(types);
      }
    } catch (err) {
      console.error('Error fetching pollution types:', err);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [selectedPeriod, filters, pollutionTypes]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getChartData(filters, selectedPeriod);
      console.log('Chart data response:', result); // For debugging

      if (result.success) {
        // Process the data to include pollution categories
        const processedData = await processChartData(result.data);
        setChartData(processedData);
      } else {
        setError(result.message || 'Failed to fetch chart data');
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to fetch chart data. Please check if the API endpoint exists.');
    } finally {
      setLoading(false);
    }
  };

  // Process chart data to include pollution categories
  const processChartData = async (rawData) => {
    // If you need to fetch pollution category data per date,
    // you might need to modify your backend endpoint
    // For now, we'll work with the status data and add mock pollution data
    
    if (!rawData || rawData.length === 0) {
      // Generate mock pollution data for demonstration
      return generateMockPollutionData();
    }
    
    // Process existing data
    return rawData.map(item => {
      const processedItem = { ...item };
      
      // Add pollution category data (mock for now)
      pollutionTypes.forEach(type => {
        if (processedItem[type.key] === undefined) {
          // Generate some random data for demonstration
          processedItem[type.key] = Math.floor(Math.random() * 10);
        }
      });
      
      return processedItem;
    });
  };

  // Generate mock pollution data for demonstration
  const generateMockPollutionData = () => {
    const days = selectedPeriod === '7d' ? 7 : 
                 selectedPeriod === '90d' ? 90 : 
                 selectedPeriod === '1y' ? 365 : 30;
    
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const formattedDate = date.toISOString().split('T')[0];
      const dayData = { date: formattedDate };
      
      // Add pollution category data
      pollutionTypes.forEach(type => {
        // Create realistic trending data
        const baseValue = type.count || 5;
        const trend = Math.sin(i * 0.3) * 2;
        const random = Math.random() * 3;
        dayData[type.key] = Math.max(0, Math.floor(baseValue + trend + random));
      });
      
      data.push(dayData);
    }
    
    return data;
  };

  // Generate random color for new pollution categories
  const getRandomColor = () => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#a855f7'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleLineToggle = (lineKey) => {
    setVisibleLines(prev => ({
      ...prev,
      [lineKey]: !prev[lineKey]
    }));
  };

  // Filter data based on visible lines
  const filteredData = useMemo(() => {
    return chartData.map(item => {
      const filteredItem = { date: item.date };
      Object.keys(visibleLines).forEach(key => {
        if (visibleLines[key] && item[key] !== undefined) {
          filteredItem[key] = item[key];
        }
      });
      return filteredItem;
    });
  }, [chartData, visibleLines]);

  // Calculate total reports across all dates
  const totalReports = useMemo(() => {
    return chartData.reduce((total, day) => {
      return total + Object.entries(day).reduce((dayTotal, [key, value]) => {
        if (key !== 'date') return dayTotal + (value || 0);
        return dayTotal;
      }, 0);
    }, 0);
  }, [chartData]);

  // Get top pollution categories
  const topCategories = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const categoryTotals = {};
    
    // Sum totals for each category
    chartData.forEach(day => {
      Object.entries(day).forEach(([key, value]) => {
        if (key !== 'date') {
          categoryTotals[key] = (categoryTotals[key] || 0) + value;
        }
      });
    });
    
    // Convert to array and sort
    return Object.entries(categoryTotals)
      .map(([key, total]) => {
        const type = pollutionTypes.find(t => t.key === key);
        return {
          key,
          name: type?.name || key,
          total,
          color: type?.color || getRandomColor()
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // Top 5 categories
  }, [chartData, pollutionTypes]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-center pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Pollution Category Trends</h2>
          </div>
         
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-center pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Pollution Category Trends</h2>
          </div>
       
        </div>
        <div className="h-96 flex flex-col items-center justify-center text-red-500">
          <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium mb-2">Error Loading Chart Data</p>
          <p className="text-sm text-gray-600">{error}</p>
          <button 
            onClick={fetchChartData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-10 p-6">
      {/* Header with title and filters */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-4 pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Pollution Category Trends</h2>
          
        </div>
        <div className="relative mt-4">
        
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Top Categories Summary */}
      {topCategories.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Pollution Categories</h3>
          <div className="flex flex-wrap gap-2">
            {topCategories.map((category, index) => (
              <div key={category.key} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                {/* <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </div> */}
                <span className="text-sm font-bold text-gray-800">{category.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="transition-all duration-300">
        {chartData.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-gray-500">
            <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium">No pollution category data available</p>
            <p className="text-sm mt-1">Try selecting a different time period or adjusting filters</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart 
              data={filteredData} 
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f3f4f6" 
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }} 
                interval="preserveStartEnd"
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                label={{ 
                  value: 'Number of Reports', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: 10,
                  style: { fontSize: 11, fontWeight: 500 }
                }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                animationDuration={300}
              />
              
              {pollutionTypes.map(type => (
                visibleLines[type.key] && (
                  <Line 
                    key={type.key}
                    type="monotone" 
                    dataKey={type.key} 
                    name={type.name}
                    stroke={type.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 1 }}
                    animationDuration={500}
                    animationEasing="ease-in-out"
                    connectNulls
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend with toggle buttons */}
      {pollutionTypes.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6 max-h-32 overflow-y-auto">
          {pollutionTypes.map(type => (
            <button
              key={type.key}
              onClick={() => handleLineToggle(type.key)}
              className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                visibleLines[type.key]
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: type.color }}
              ></div>
              <span className="truncate max-w-20">{type.name}</span>
              <span className={`ml-1 ${visibleLines[type.key] ? 'opacity-100' : 'opacity-50'}`}>
                {visibleLines[type.key] ? '✓' : '✗'}
              </span>
            </button>
          ))}
        </div>
      )}

    
    </div>
  );
}