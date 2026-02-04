// components/Dashboard/PollutionSubCategoryColumnChart.jsx
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import axios from "axios";
import { getChartData } from "../../services/generalDashboard.service";


// Colors for different pollution categories
const categoryColors = {
  "Air Pollution": "#3b82f6",
  "Chemical Pollution": "#ef4444",
  "Sound Pollution": "#f59e0b",
  "Waste Pollution": "#10b981",
  "Unknown": "#9ca3af",
  "No Subcategory": "#6b7280"
};

const PollutionSubCategoryColumnChart = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("30d");
  const [chartData, setChartData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
// Fetch data from API
const fetchChartData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Create filters object with period
    const filters = {
      period: selectedDateRange // Use selectedDateRange, not selectedPeriod
      // Add other filters here if needed
    };
    
    console.log('Fetching chart data with filters:', filters);
    
    // Call the service function
    const response = await getChartData(filters);
    
    console.log('API Response:', response);

    if (response.success) {
      // Process the data to ensure numeric values
      const processedData = processChartData(response.data);
      setChartData(processedData);
      
      // Extract unique categories
      const uniqueCategories = extractCategories(processedData);
      setCategories(uniqueCategories);
      
      console.log('Processed data:', processedData);
      console.log('Categories:', uniqueCategories);
    } else {
      setError(response.message || 'Failed to fetch data');
    }
  } catch (err) {
    setError(err.message || 'Failed to fetch data');
    console.error('Error fetching chart data:', err);
  } finally {
    setLoading(false);
  }
};

  // Process chart data to ensure proper types
  const processChartData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => {
      const processedItem = { ...item };
      
      // Convert all numeric string values to numbers
      Object.keys(processedItem).forEach(key => {
        if (key !== 'date' && 
            !key.includes('_category') && 
            !key.includes('_subcategory')) {
          const value = processedItem[key];
          if (typeof value === 'string' && !isNaN(value)) {
            processedItem[key] = Number(value);
          }
        }
      });
      
      return processedItem;
    });
  };

  // Extract unique categories from data
  const extractCategories = (data) => {
    if (!data || data.length === 0) return [];
    
    const categoriesSet = new Set();
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key.endsWith('_category') && item[key]) {
          categoriesSet.add(item[key].trim());
        }
      });
    });
    
    return Array.from(categoriesSet);
  };

  useEffect(() => {
    fetchChartData();
  }, [selectedDateRange]);

  // Get all subcategory keys from chart data
  const getSubcategoryKeys = () => {
    if (!chartData || chartData.length === 0) {
      console.log('No chart data available');
      return [];
    }
    
    const keys = new Map();
    
    chartData.forEach(item => {
      Object.keys(item).forEach(key => {
        // Look for keys that are NOT metadata and NOT 'date'
        const isSubcategoryKey = 
          key !== 'date' && 
          !key.endsWith('_category') && 
          !key.endsWith('_subcategory');
        
        if (isSubcategoryKey) {
          const value = item[key];
          const isNumeric = typeof value === 'number' || (typeof value === 'string' && !isNaN(value));
          
          if (isNumeric) {
            // Get category and subcategory from metadata
            const categoryKey = `${key}_category`;
            const subcategoryKey = `${key}_subcategory`;
            
            const category = item[categoryKey] ? item[categoryKey].trim() : "Unknown";
            const subcategory = item[subcategoryKey] || "Unknown";
            
            // Create a unique identifier
            const uniqueId = `${category}_${subcategory}`;
            
            if (!keys.has(uniqueId)) {
              keys.set(uniqueId, {
                key,
                name: subcategory,
                displayName: subcategory === 'No Subcategory' ? category : `${subcategory} (${category})`,
                category: category,
                color: categoryColors[category] || getColorForCategory(category)
              });
            }
          }
        }
      });
    });
    
    const result = Array.from(keys.values());
    console.log('Subcategory keys found:', result);
    return result;
  };

  // Helper function to generate colors for categories
  const getColorForCategory = (category) => {
    const colors = [
      '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', 
      '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4'
    ];
    
    const index = Math.abs(category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
    return colors[index];
  };

  const subcategoryKeys = getSubcategoryKeys();
  
  // Filter subcategories based on selected category
  const filteredSubcategoryKeys = selectedCategory === "All" 
    ? subcategoryKeys 
    : subcategoryKeys.filter(item => item.category === selectedCategory);

  console.log('Filtered subcategory keys:', filteredSubcategoryKeys);
  console.log('Chart data for rendering:', chartData);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg max-w-md">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {payload.map((entry, index) => {
              const dataKey = entry.dataKey;
              const barData = chartData.find(d => d.date === label);
              
              if (!barData) return null;
              
              const categoryKey = `${dataKey}_category`;
              const subcategoryKey = `${dataKey}_subcategory`;
              const category = barData[categoryKey] || "Unknown";
              const subcategory = barData[subcategoryKey] || "Unknown";
              const value = barData[dataKey] || 0;
              
              return (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.fill }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {subcategory}
                    </p>
                    <p className="text-xs text-gray-500">{category}</p>
                  </div>
                  <span className="text-sm font-semibold ml-2">{value} complaints</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Pollution Subcategories</h2>
        
      </div>

     

      {/* Category Legend */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: categoryColors[category] || getColorForCategory(category) }}
              ></div>
              <span className="text-sm text-gray-700">{category}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && filteredSubcategoryKeys.length > 0 ? (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis 
                dataKey="date" 
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ 
                  value: 'Number of Complaints', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: 10,
                  style: { fontSize: 12 }
                }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '12px'
                }}
                formatter={(value, entry) => {
                  const subKey = filteredSubcategoryKeys.find(k => k.key === entry.dataKey);
                  return subKey ? subKey.displayName : value;
                }}
              />
              
              {filteredSubcategoryKeys.map((item, index) => (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  name={item.name}
                  fill={item.color}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={30}
                  stackId="a"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="text-gray-500">No chart data to display</div>
          <div className="text-sm text-gray-400">
            <p>Chart data exists: {chartData.length > 0 ? 'Yes' : 'No'}</p>
            <p>Subcategory keys found: {subcategoryKeys.length}</p>
            <p>Filtered keys: {filteredSubcategoryKeys.length}</p>
            {chartData.length > 0 && (
              <div className="mt-2">
                <p>Sample data structure:</p>
                <pre className="text-xs">{JSON.stringify(chartData[0], null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PollutionSubCategoryColumnChart;