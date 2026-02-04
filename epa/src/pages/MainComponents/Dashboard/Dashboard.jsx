import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend 
} from 'recharts';
import { 
  Wind, Thermometer, Droplets, Activity, 
  ArrowUp, ArrowDown, MoreHorizontal, Leaf, Zap, 
  AlertTriangle, CheckCircle, MapPin, Volume2, Trash2, FlaskConical 
} from 'lucide-react';

export default function PollutionDashboard() {
  
  // --- MOCK DATA ---
  
  // Top 4 Cards Data (Updated units for Pollution context)
  const mainStats = [
    { title: 'Air Pollution (AQI)', value: '112', sub: 'Unhealthy', trend: '+12%', isUp: true, icon: Wind },
    { title: 'Waste Output', value: '840 T', sub: 'Daily Avg', trend: '-5.2%', isUp: false, icon: Trash2 },
    { title: 'Chemical Toxins', value: '12 ppm', sub: 'Safe Range', trend: '-0.5%', isUp: false, icon: FlaskConical },
    { title: 'Noise Levels', value: '85 dB', sub: 'Peak Hour', trend: '+8%', isUp: true, icon: Volume2 },
  ];

  // Main Large Chart Data
  const mainTrendData = [
    { name: 'Jan', air: 85, water: 45, noise: 60 },
    { name: 'Feb', air: 92, water: 50, noise: 58 },
    { name: 'Mar', air: 88, water: 48, noise: 62 },
    { name: 'Apr', air: 110, water: 60, noise: 75 },
    { name: 'May', air: 105, water: 55, noise: 70 },
    { name: 'Jun', air: 125, water: 65, noise: 82 },
    { name: 'Jul', air: 112, water: 62, noise: 80 },
  ];

  // Donut Chart Data (Pollutant Breakdown)
  const pollutantData = [
    { name: 'Particulate (PM2.5)', value: 45, color: '#ef4444' }, // Red
    { name: 'Ozone (O3)', value: 30, color: '#3b82f6' },          // Blue
    { name: 'Nitrogen (NO2)', value: 25, color: '#f59e0b' },      // Yellow
  ];

  // Blue Bar Chart Data (Waste Management Cost)
  const costData = [
    { name: 'M', val: 40 }, { name: 'T', val: 30 }, { name: 'W', val: 55 },
    { name: 'T', val: 45 }, { name: 'F', val: 60 }, { name: 'S', val: 35 }, { name: 'S', val: 45 },
  ];

  // Bottom Left Chart (Sensor Uptime)
  const sensorHealthData = [
    { name: 'Mon', active: 90, fault: 2 },
    { name: 'Tue', active: 92, fault: 0 },
    { name: 'Wed', active: 88, fault: 4 },
    { name: 'Thu', active: 95, fault: 0 },
  ];

  // Bottom Middle Chart (CO2 Emissions)
  const emissionsData = [
    { name: 'W1', value: 400 },
    { name: 'W2', value: 300 },
    { name: 'W3', value: 550 },
    { name: 'W4', value: 450 },
  ];

  // Bottom List Data (Regional Pollution)
  const regionStats = [
    { name: 'Industrial Zone', count: '154 AQI', pct: '+12%', color: 'text-red-500', icon: AlertTriangle },
    { name: 'Downtown', count: '98 AQI', pct: '+2.9%', color: 'text-yellow-500', icon: Activity },
    { name: 'North Park', count: '35 AQI', pct: '-5.0%', color: 'text-green-500', icon: Leaf },
    { name: 'Harbor District', count: '112 AQI', pct: '+1.7%', color: 'text-orange-500', icon: Droplets },
    { name: 'Suburbs', count: '42 AQI', pct: '0.8%', color: 'text-green-500', icon: MapPin },
  ];

  // Table Data
  const tableData = [
    { title: 'Sensor X-99 (Air)', date: '04 June, 2024', value: '154 AQI', status: 'Critical', loc: 'Factory A' },
    { title: 'Sensor B-22 (Water)', date: '30 May, 2024', value: '7.2 pH', status: 'Optimal', loc: 'River Bank' },
    { title: 'Sensor N-01 (Noise)', date: '19 June, 2024', value: '92 dB', status: 'Warning', loc: 'Highway' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pollution Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time monitoring of environmental contaminants.</p>
        </div>
        <div className="text-sm text-slate-500">Dashboards &gt; <span className="text-blue-600 font-medium">Pollution</span></div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {mainStats.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{stat.title}</div>
                    <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                    <span className="text-xs text-slate-400 mb-1">{stat.sub}</span>
                    </div>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                    <stat.icon size={20} className="text-slate-400" />
                </div>
            </div>
            <div className={`text-xs mt-3 flex items-center font-medium ${stat.isUp ? 'text-red-500' : 'text-green-500'}`}>
              {stat.isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />} 
              {stat.trend} <span className="text-slate-400 ml-1 font-normal">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Main Chart Section (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-800">Pollution Trends (Air vs Water)</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs border rounded bg-white hover:bg-slate-50">Monthly</button>
              <button className="px-3 py-1 text-xs border rounded bg-slate-50 text-slate-400">Weekly</button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mainTrendData}>
                <defs>
                  <linearGradient id="colorAir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="air" stroke="#ef4444" fillOpacity={1} fill="url(#colorAir)" name="Air AQI" />
                <Area type="monotone" dataKey="water" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWater)" name="Water PPM" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column Stack */}
        <div className="space-y-6">
          
          {/* Top Gradient Widget */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-100">
            <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2"><AlertTriangle size={18} className="text-red-500"/> Critical Alert</h3>
            <p className="text-sm text-red-800/80 mb-4">Toxic gas leak detected in Sector 4. Evacuation protocol active.</p>
            <div className="text-3xl font-bold text-red-900">High Risk</div>
            <button className="mt-3 text-xs bg-white text-red-600 px-3 py-2 rounded shadow-sm font-semibold hover:bg-red-50 w-full border border-red-200">View Live Cam</button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Donut Chart */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <div className="w-24 h-24 relative">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pollutantData} innerRadius={35} outerRadius={45} dataKey="value" stroke="none">
                      {pollutantData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-700 text-xs text-center">Pollutant<br/>Type</div>
              </div>
              <div className="flex justify-center gap-2 mt-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> PM2.5</span>
                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> O3</span>
              </div>
            </div>

            {/* Blue Bar Chart */}
            <div className="bg-slate-800 p-4 rounded-xl shadow-sm text-white flex flex-col justify-between">
              <div className="h-16 mb-2">
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData}>
                    <Bar dataKey="val" fill="rgba(255,255,255,0.4)" radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div className="text-xs text-slate-400">Clean-up Cost</div>
                <div className="font-bold text-lg">$1.2M</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Sensor Statistics (Line Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-slate-800">Sensor Network</h3>
            <MoreHorizontal size={16} className="text-slate-400" />
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorHealthData}>
                <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fault" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 text-xs text-slate-400">
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Active</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Faults</span>
          </div>
        </div>

        {/* Carbon Footprint (Area Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="text-2xl font-bold text-slate-800">4,250</div>
              <div className="text-xs text-slate-400">CO2 Emissions (Tons)</div>
            </div>
            <button className="text-xs bg-slate-100 px-2 py-1 rounded">Report &rarr;</button>
          </div>
          <div className="h-32">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emissionsData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#64748b" fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Stats (List) */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-slate-800">Regional Hotspots</h3>
            <MoreHorizontal size={16} className="text-slate-400" />
          </div>
          <div className="space-y-4">
            {regionStats.map((region, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded bg-slate-50 ${region.color === 'text-red-500' ? 'bg-red-50' : ''}`}>
                    <region.icon size={16} className={region.color} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{region.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800">{region.count}</div>
                  <div className={`text-xs ${region.color}`}>{region.pct}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800">Incident Logs & Sensor Reports</h3>
          <div className="flex gap-2">
            <input type="text" placeholder="Search logs..." className="border border-slate-200 rounded px-3 py-1 text-sm focus:outline-none" />
            <button className="bg-slate-800 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
               Export CSV
            </button>
          </div>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium"><input type="checkbox" /></th>
              <th className="px-6 py-3 font-medium">Device / Source</th>
              <th className="px-6 py-3 font-medium">Last Reading</th>
              <th className="px-6 py-3 font-medium">Value</th>
              <th className="px-6 py-3 font-medium">Location</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-4"><input type="checkbox" /></td>
                <td className="px-6 py-4 font-medium text-slate-700">{row.title}</td>
                <td className="px-6 py-4 text-slate-500">{row.date}</td>
                <td className="px-6 py-4 text-slate-500">{row.value}</td>
                <td className="px-6 py-4 text-slate-500">{row.loc}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    row.status === 'Optimal' ? 'bg-green-100 text-green-700' :
                    row.status === 'Warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}