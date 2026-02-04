// components/Dashboard/RegionCityBarChart.jsx
import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell 
} from "recharts";
import { getDashboardStats } from "../../services/generalDashboard.service";

// Colors for different entities - with proper mapping
const entityColors = {
  // Region Colors
  "Addis Ababa": "#3b82f6",
  "Oromia": "#10b981",
  "Amhara": "#8b5cf6",
  "Tigray": "#ef4444",
  "SNNPR": "#f59e0b",
  "Afar": "#06b6d4",
  "Somali": "#ec4899",
  "Benishangul-Gumuz": "#8b5cf6",
  "Gambela": "#10b981",
  "Harari": "#3b82f6",
  "Dire Dawa": "#f59e0b",
  "Sidama": "#06b6d4",
  "South West Ethiopia": "#ec4899",
  // Handle variations
  "Addiss Ababa": "#3b82f6", // Handle typo
  "ADDIS ABABA": "#3b82f6", // Handle uppercase
  "Addis ababa": "#3b82f6", // Handle lowercase
  "Unknown Region": "#9ca3af", // Gray for unknown
  // City Colors
  //"Addis Ababa": "#3b82f6",
  "Adama": "#10b981",
  "Bahir Dar": "#8b5cf6",
  "Mekelle": "#ef4444",
  "Hawassa": "#f59e0b",
  "Jimma": "#06b6d4",
  "Gondar": "#ec4899",
  "Dessie": "#8b5cf6",
  "Unknown": "#9ca3af",
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, selectedView }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm font-medium">{entry.name}:</span>
              <span className="text-sm font-semibold ml-auto">
                {selectedView === "percentage" ? `${entry.value}%` : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Function to normalize region names
const normalizeRegionName = (regionName) => {
  if (!regionName) return "Unknown Region";
  
  const normalized = regionName.trim();
  
  // Handle common variations
  const variations = {
    "addiss ababa": "Addis Ababa",
    "addis ababa": "Addis Ababa",
    "ADDIS ABABA": "Addis Ababa",
    "addis-ababa": "Addis Ababa",
    "addis_ababa": "Addis Ababa",
  };
  
  const lowerName = normalized.toLowerCase();
  if (variations[lowerName]) {
    return variations[lowerName];
  }
  
  // Capitalize first letter of each word
  return normalized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function RegionBarChart({ filters = {} }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState("count");
  const [selectedEntity, setSelectedEntity] = useState("region");
  const [statsData, setStatsData] = useState({
    regionStats: [],
    cityStats: [],
    totalComplaints: 0
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getDashboardStats(filters);
      console.log("API Response:", result); // Debug log

      if (result.success) {
        // Normalize region names before storing
        const normalizedRegionStats = (result.data.regionStats || []).map(stat => ({
          ...stat,
          region: normalizeRegionName(stat.region)
        }));
        
        // Normalize city names
        const normalizedCityStats = (result.data.cityStats || []).map(stat => ({
          ...stat,
          city: stat.city || "Unknown City"
        }));
        
        setStatsData({
          regionStats: normalizedRegionStats,
          cityStats: normalizedCityStats,
          totalComplaints: result.data.totalComplaints || 0
        });
        
        // Set initial chart data
        updateChartData(selectedEntity, {
          ...result.data,
          regionStats: normalizedRegionStats,
          cityStats: normalizedCityStats
        });
      } else {
        setError(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const updateChartData = (entityType, data = null) => {
    const sourceData = data || statsData;
    let entityStats = [];
    
    if (entityType === "region") {
      entityStats = sourceData.regionStats || [];
    } else if (entityType === "city") {
      entityStats = sourceData.cityStats || [];
    }

    console.log(`${entityType} stats:`, entityStats); // Debug log

    if (entityStats.length > 0) {
      const processedData = entityStats.map(stat => {
        const entityName = stat[entityType] || `Unknown ${entityType === 'region' ? 'Region' : 'City'}`;
        const count = stat.count || 0;
        const percentage = sourceData.totalComplaints > 0 
          ? parseFloat(((count / sourceData.totalComplaints) * 100).toFixed(1))
          : 0;
        
        return {
          name: entityName,
          count: count,
          percentage: percentage,
          rawCount: count // Keep raw count for reference
        };
      });
      
      // Sort by count (descending)
      processedData.sort((a, b) => b.count - a.count);
      
      // Limit to top 15 for better visualization
      const limitedData = processedData.slice(0, 15);
      
      console.log(`Processed ${entityType} data:`, limitedData); // Debug log
      setChartData(limitedData);
    } else {
      setChartData([]);
    }
  };

  useEffect(() => {
    updateChartData(selectedEntity);
  }, [selectedEntity, statsData]);

  // Get color for an entity
  const getEntityColor = (entityName) => {
    const normalizedName = normalizeRegionName(entityName);
    return entityColors[normalizedName] || generateColor(normalizedName);
  };

  // Generate consistent color based on entity name
  const generateColor = (name) => {
    const colors = [
      '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b',
      '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#8b5cf6',
      '#14b8a6', '#f43f5e', '#a855f7', '#d946ef'
    ];
    const index = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
    return colors[index];
  };

  // Calculate total for percentage view
  const totalComplaints = statsData.totalComplaints;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-10 p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Geographic Distribution</h2>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Geographic Distribution</h2>
        </div>
        <div className="h-80 flex items-center justify-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-10 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Geographic Distribution</h2>
          <p className="text-sm text-gray-500 mt-1">
            {chartData.length} {selectedEntity === "region" ? "regions" : "cities"} • {totalComplaints} total complaints
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="region">By Region</option>
            <option value="city">By City</option>
          </select>
        
        </div>
      </div>

      {/* Debug info - remove in production */}
    
      {chartData.length === 0 ? (
        <div className="h-80 flex flex-col items-center justify-center text-gray-500">
          <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-lg font-medium">No {selectedEntity} data available</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-6 max-h-24 overflow-y-auto p-2 bg-gray-50 rounded-lg">
            {chartData.map((entity) => (
              <div 
                key={entity.name} 
                className="flex items-center gap-2 px-3 py-1 bg-white rounded border border-gray-200 shadow-sm"
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: getEntityColor(entity.name) }}
                ></div>
                <span className="text-sm text-gray-700 font-medium truncate max-w-32">
                  {entity.name}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {selectedView === "percentage" ? `${entity.percentage}%` : entity.count}
                </span>
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: selectedEntity === "city" ? 80 : 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={selectedEntity === "city" ? -60 : -45}
                  textAnchor="end"
                  height={selectedEntity === "city" ? 80 : 60}
                  tick={{ fontSize: 10 }}
                  interval={0}
                />
                <YAxis 
                  label={{ 
                    value: selectedView === "count" ? 'Number of Complaints' : 'Percentage (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: 10,
                    style: { fontSize: 12 }
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  content={(props) => <CustomTooltip {...props} selectedView={selectedView} />}
                />
                
                <Bar
                  dataKey={selectedView === "count" ? "count" : "percentage"}
                  name={selectedView === "count" ? "Complaints" : "Percentage (%)"}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={selectedEntity === "city" ? 40 : 50}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getEntityColor(entry.name)}
                      strokeWidth={1}
                      stroke="#fff"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          
        </>
      )}
    </div>
  );
}