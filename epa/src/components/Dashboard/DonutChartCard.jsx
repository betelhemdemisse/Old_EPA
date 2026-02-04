// components/Dashboard/DonutChartCard.jsx
import React, { useState, useEffect } from "react";
import { getDashboardStats } from "../../services/generalDashboard.service";

// Mock data - you would typically fetch this from an API
const penaltyData = [
  {
    penalty_id: "a19c31c1-dbc9-4dd2-8a2a-38082d81a343",
    penalty_name: "No violation found",
    description: "No violation found",
    amount: "0.00",
    is_active: true,
    count: 120, // Example count
    color: "#10b981" // Green
  },
  {
    penalty_id: "3ac3bca3-8d00-45ab-8c4c-d730585bebbf",
    penalty_name: "Penalty",
    description: "Penalty",
    amount: "0.00",
    is_active: true,
    count: 45, // Example count
    color: "#ef4444" // Red
  },
  {
    penalty_id: "ad2d87c3-0990-4fde-b2f8-14e9b12e614a",
    penalty_name: "Permanent closure recommendation",
    description: "Permanent closure recommendation",
    amount: "0.00",
    is_active: true,
    count: 15, // Example count
    color: "#8b5cf6" // Purple
  },
  {
    penalty_id: "22bb4726-541c-40da-a036-e8f47c1b0ca9",
    penalty_name: "Temporary stop",
    description: "Temporary stop",
    amount: "0.00",
    is_active: true,
    count: 35, // Example count
    color: "#f59e0b" // Amber
  },
  {
    penalty_id: "768a474c-8f3f-40ee-a55a-1c38846974d2",
    penalty_name: "Warning",
    description: "Warning",
    amount: "0.00",
    is_active: true,
    count: 85, // Example count
    color: "#3b82f6" // Blue
  }
];

// Sub-penalties data
const subPenalties = [
  { name: "Environmental Violation", count: 12, mainPenalty: "Penalty" },
  { name: "Noise Pollution", count: 8, mainPenalty: "Warning" },
  { name: "Waste Disposal Issue", count: 5, mainPenalty: "Temporary stop" },
  { name: "Chemical Handling", count: 3, mainPenalty: "Penalty" },
  { name: "Air Quality Breach", count: 7, mainPenalty: "Warning" },
];

export default function DonutChartCard() {
  const totalPenalties = penaltyData.reduce((sum, penalty) => sum + penalty.count, 0);
  
  // Calculate percentages for conic gradient
  let cumulativePercentage = 0;
  const gradientStops = penaltyData.map(penalty => {
    const percentage = (penalty.count / totalPenalties) * 100;
    const stop = `${penalty.color} ${cumulativePercentage}% ${cumulativePercentage + percentage}%`;
    cumulativePercentage += percentage;
    return stop;
  }).join(', ');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header with border */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Penalty Types</h2>
        <div className="text-sm text-gray-500">Total: {totalPenalties} cases</div>
      </div>

      <div className="flex flex-col lg:flex-col items-center justify-center gap-12">
        <div className="relative w-64 h-64">
          {/* Conic gradient donut */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${gradientStops})`,
            }}
          ></div>
          <div className="absolute inset-10 rounded-full bg-white"></div>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-gray-800">{totalPenalties}</div>
            <div className="text-lg text-gray-600">Total Penalties</div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Penalties */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Main Penalties</h3>
            <div className="space-y-3">
              {penaltyData.map((penalty) => (
                <div key={penalty.penalty_id} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: penalty.color }}
                  ></div>
                  <span className="text-gray-700 text-sm flex-1">{penalty.penalty_name}</span>
                  <span className="ml-auto font-semibold text-sm">{penalty.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sub Penalties
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Sub Penalties</h3>
            <div className="space-y-3">
              {subPenalties.map((sub, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-gray-600 text-sm flex-1">{sub.name}</span>
                  <span className="ml-auto font-medium text-sm">{sub.count}</span>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}