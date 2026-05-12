import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, Users, Pill, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '../../components/StatCard';

const Reports = () => {
  // Using placeholder data for analytics charts to match the UI requirements
  // since the backend doesn't provide specific aggregation routes yet.
  
  const weeklyActivity = [
    { name: 'Mon', visits: 12, alerts: 2 },
    { name: 'Tue', visits: 15, alerts: 1 },
    { name: 'Wed', visits: 8, alerts: 4 },
    { name: 'Thu', visits: 22, alerts: 0 },
    { name: 'Fri', visits: 18, alerts: 2 },
    { name: 'Sat', visits: 5, alerts: 1 },
    { name: 'Sun', visits: 3, alerts: 0 },
  ];

  const distributionData = [
    { name: 'Cardiology', value: 45 },
    { name: 'General', value: 30 },
    { name: 'Endocrinology', value: 15 },
    { name: 'Neurology', value: 10 },
  ];
  
  const COLORS = ['#00D4FF', '#7C3AED', '#34D399', '#F97316'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-space-800 border border-white/10 p-3 rounded-xl shadow-xl">
          <p className="text-white font-bold text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-xs font-medium">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
        <p className="text-slate-400">High-level metrics and AI-generated clinical insights.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Visits (Month)" value="142" icon={Users} colorClass="text-brand-violet" bgClass="bg-brand-violet/10" />
        <StatCard title="Prescriptions Issued" value="385" icon={Pill} colorClass="text-teal-400" bgClass="bg-teal-400/10" />
        <StatCard title="Avg. Consultation" value="18m" icon={Clock} colorClass="text-orange-400" bgClass="bg-orange-400/10" />
        <StatCard title="Critical Interventions" value="12" icon={AlertTriangle} colorClass="text-red-500" bgClass="bg-red-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Line Chart: Weekly Activity */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-teal-400" size={20} /> Patient Throughput
            </h2>
            <span className="flex items-center gap-1 text-xs font-bold text-teal-400 bg-teal-400/10 px-2 py-1 rounded">
              <TrendingUp size={14} /> +12% vs last week
            </span>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyActivity} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="visits" name="Total Visits" stroke="#00D4FF" strokeWidth={4} dot={{ r: 4, fill: '#00D4FF', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="alerts" name="AI Alerts Generated" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, fill: '#7C3AED', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Distribution */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BrainCircuit size={20} className="text-brand-violet" /> Diagnostics Split
          </h2>
          
          <div className="h-[250px] w-full flex-1 relative">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white">100</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cases</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            {distributionData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-300">{entry.name}</span>
                  <span className="text-xs font-bold text-white">{entry.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// Polyfill icon since it was missed in import
import { BrainCircuit } from 'lucide-react';

export default Reports;
