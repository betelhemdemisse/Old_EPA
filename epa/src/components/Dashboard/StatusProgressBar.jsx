// components/Dashboard/StatusProgressBar.jsx
import React, { useState, useEffect } from "react";
import { getDashboardStats } from "../../services/generalDashboard.service";

// Default statuses with all possible statuses
const defaultStatuses = [
  { label: "Pending", status: "pending", value: 0 },
  { label: "Under Review", status: "under_review", value: 0 },
  { label: "Verified", status: "verified", value: 0 },
  { label: "Under Investigation", status: "under_investigation", value: 0 },
  { label: "Investigation Submitted", status: "investigation_submitted", value: 0 },
  { label: "Authorized", status: "authorized", value: 0 },
  { label: "Rejected", status: "rejected", value: 0 },
  { label: "Closed", status: "closed", value: 0 },
];

// Helper function to get color classes based on status
const getStatusColor = (status) => {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case "pending":
    case "Pending":
      return { bg: "bg-[#FFAE41]", text: "text-white", dot: "bg-[#FFAE41]" };
    case "verified":
    case "closed":
    case "authorized":
      return { bg: "bg-[#37A537]", text: "text-white", dot: "bg-[#37A537]" };
    case "under_review":
    case "under review":
    case "investigation_submitted":
      return { bg: "bg-indigo-100", text: "text-indigo-800", dot: "bg-indigo-500" };
    case "rejected":
      return { bg: "bg-[#F52E32]", text: "text-white", dot: "bg-[#F52E32]" };
    case "under_investigation":
      return { bg: "bg-[#3BA1F5]", text: "text-white", dot: "bg-[#3BA1F5]" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-400" };
  }
};

export default function StatusProgressBar({ filters = {} }) {
  const [statuses, setStatuses] = useState(defaultStatuses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatusData();
  }, [filters]);

  const fetchStatusData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getDashboardStats(filters);

      if (result.success) {
        // Update statuses with real data
        const updatedStatuses = defaultStatuses.map(status => {
          // Find matching status in API response
          const matchingStatus = result.data.statusStats?.find(
            stat => stat.status.toLowerCase() === status.status.toLowerCase()
          );
          
          // Also check for "Pending" vs "pending" case differences
          const alternativeMatch = result.data.statusStats?.find(
            stat => {
              // Normalize both statuses for comparison
              const apiStatus = stat.status.toLowerCase().replace(/\s+/g, '_');
              const componentStatus = status.status.toLowerCase().replace(/\s+/g, '_');
              return apiStatus === componentStatus;
            }
          );

          const matchedStatus = matchingStatus || alternativeMatch;
          
          return {
            ...status,
            value: matchedStatus ? matchedStatus.count : 0
          };
        });

        setStatuses(updatedStatuses);
      } else {
        setError('Failed to fetch status data');
      }
    } catch (err) {
      console.error('Error fetching status data:', err);
      setError('Failed to fetch status data');
    } finally {
      setLoading(false);
    }
  };

  // Filter out statuses with 0 values for cleaner display
  const filteredStatuses = statuses.filter(item => item.value > 0);
  const totalValue = filteredStatuses.reduce((sum, s) => sum + s.value, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Status Progress</h2>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Status Progress</h2>
        </div>
        <div className="text-center text-red-500 p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white grid grid-cols-1 rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Status Progress</h2>
        <div className="text-sm text-gray-500">
          Total: {totalValue} complaints
        </div>
      </div>

      {filteredStatuses.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No status data available
        </div>
      ) : (
        <div className="space-y-6 overflow-y-auto pr-2 max-h-[400px]">
          {filteredStatuses.map((item) => {
            const percentage = Math.round((item.value / totalValue) * 100);
            const colorClasses = getStatusColor(item.status);
            
            return (
              <div key={item.status} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colorClasses.dot }}
                      title={item.status}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {percentage}%
                    </span>
                    <span className="text-sm font-semibold text-gray-800 w-10 text-right">
                      {item.value}
                    </span>
                  </div>
                </div>
                
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-full rounded-full shadow-sm ${colorClasses.bg}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Status breakdown details (optional) */}
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>{item.status}</span>
                  <span>{item.value} of {totalValue} total</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">{totalValue}</div>
            <div className="text-xs text-gray-500">Total Complaints</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">{filteredStatuses.length}</div>
            <div className="text-xs text-gray-500">Active Statuses</div>
          </div>
        </div>
      </div>
    </div>
  );
}