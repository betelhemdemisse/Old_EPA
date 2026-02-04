import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { getDashboardStats } from "../../services/generalDashboard.service";

const cardConfigs = [
  {
    key: 'totalComplaints',
    title: "Total Reports",
    icon: FileText,
    iconColor: "text-white",
    bgColor: "bg-blue-500",
    shadowColor: "shadow-blue-300",
  },
  {
    key: 'resolved',
    title: "Closed",
    icon: CheckCircle,
    iconColor: "text-white",
    bgColor: "bg-green-500",
    shadowColor: "shadow-green-300",
  },
  {
    key: 'in_progress',
    title: "Under Investigation",
    icon: Clock,
    iconColor: "text-white",
    bgColor: "bg-orange-500",
    shadowColor: "shadow-orange-300",
  },
  {
    key: 'rejected',
    title: "Rejected",
    icon: XCircle,
    iconColor: "text-white",
    bgColor: "bg-red-500",
    shadowColor: "shadow-red-300",
  },
];

export default function ReportCard({ index, filters = {} }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const config = cardConfigs[index];

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getDashboardStats(filters);

      if (result.success) {
        setData(result.data);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (!config) return null;

  const Icon = config.icon;
  
  // Get the value based on the card key
  const getValue = () => {
    if (!data) return 0;
    
    switch (config.key) {
      case 'totalComplaints':
        return data.totalComplaints || 0;
      case 'resolved':
        return data.resolved || 0;
      case 'in_progress':
        return data.in_progress || 0;
      case 'rejected':
        return data.rejected || 0;
      default:
        return 0;
    }
  };

  const value = getValue();

  return (
    <div className={`relative overflow-hidden rounded-2xl ${config.bgColor} text-white shadow-lg p-4 transition-all hover:scale-105 hover:shadow-xl`}>
      {/* Optional subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 rounded-2xl"></div>
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          {/* Icon and Value */}
          <div className="text-3xl flex items-center gap-2 font-bold tracking-tight">
            <Icon className="h-6 w-6" />
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : error ? (
              <span className="text-sm">Error</span>
            ) : (
              <span>{value.toLocaleString()}</span>
            )}
          </div>

          {/* Title */}
          <div className="mt-1 text-sm opacity-90">
            {config.title}
          </div>

          {/* Loading/Error states */}
          {error && (
            <div className="mt-2 text-xs text-red-200">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}