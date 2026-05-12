import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const VitalsChart = ({ visits }) => {
  if (!visits || visits.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted bg-bg-secondary border border-border rounded-xl">
        No vitals data available
      </div>
    );
  }

  // Parse visits into chart data
  const data = visits.map((visit) => {
    // Basic parsing assuming "120/80" format for BP and numeric for others
    let systolic = null;
    let diastolic = null;
    
    if (visit.vitals?.blood_pressure) {
      const parts = visit.vitals.blood_pressure.split('/');
      if (parts.length === 2) {
        systolic = parseInt(parts[0]);
        diastolic = parseInt(parts[1]);
      }
    }

    return {
      date: new Date(visit.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      heartRate: visit.vitals?.heart_rate ? parseInt(visit.vitals.heart_rate) : null,
      systolic: systolic,
      diastolic: diastolic,
      weight: visit.vitals?.weight ? parseFloat(visit.vitals.weight) : null,
    };
  }).reverse(); // chronological order

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            yAxisId="left"
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Line yAxisId="left" type="monotone" dataKey="systolic" name="Systolic BP" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line yAxisId="left" type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="#fb923c" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line yAxisId="left" type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line yAxisId="right" type="monotone" dataKey="weight" name="Weight (kg)" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VitalsChart;
