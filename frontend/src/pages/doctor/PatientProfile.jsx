import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Activity, AlertTriangle, FileText, Pill, Plus, ChevronLeft, Droplet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../api/axios';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vitals');

  const { data: patient, isLoading: patientLoading } = useQuery({ queryKey: ['patient', id], queryFn: async () => (await api.get(`/patients/${id}`)).data });
  const { data: visits = [] } = useQuery({ queryKey: ['visits', id], queryFn: async () => (await api.get(`/visits/${id}`)).data });
  const { data: prescriptions = [] } = useQuery({ queryKey: ['prescriptions', id], queryFn: async () => (await api.get(`/prescriptions/${id}`)).data });
  const { data: alerts = [] } = useQuery({ queryKey: ['alerts', id], queryFn: async () => (await api.get(`/ai/alerts/${id}`)).data });

  if (patientLoading) return <div className="flex justify-center p-20"><Activity className="animate-spin text-brand-violet" size={48}/></div>;
  if (!patient) return <div className="p-20 text-center text-slate-500">Patient not found</div>;

  const chartData = [...visits].sort((a, b) => new Date(a.date) - new Date(b.date)).map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hr: parseInt(v.vitals.heart_rate) || 0,
    sys: parseInt(v.vitals.blood_pressure.split('/')[0]) || 0,
    dia: parseInt(v.vitals.blood_pressure.split('/')[1]) || 0,
    o2: parseInt(v.vitals.oxygen_level) || 0,
  }));

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
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/doctor/patients')} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm font-medium">
          <ChevronLeft size={16} /> Back to Directory
        </button>
        <button onClick={() => navigate(`/doctor/visit/new?patient=${id}`)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-400 text-space-900 font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all">
          <Plus size={16} /> Add Visit Record
        </button>
      </div>

      {/* Patient Profile Card */}
      <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 border-t-2 border-t-brand-violet relative overflow-hidden">
        <div className="w-24 h-24 rounded-full bg-space-800 border-2 border-brand-violet/50 flex items-center justify-center text-brand-violet shrink-0 z-10">
          <User size={48} />
        </div>
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-3xl font-black text-white mb-2">{patient.name}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
            <span className="px-3 py-1 bg-space-800 border border-white/10 rounded-full text-sm font-bold text-teal-400 font-mono tracking-wider">{patient.custom_id}</span>
            <span className="px-3 py-1 bg-space-800 border border-white/10 rounded-full text-sm font-bold text-slate-300">{patient.age}y</span>
            <span className="px-3 py-1 bg-space-800 border border-white/10 rounded-full text-sm font-bold text-red-400 flex items-center gap-1"><Droplet size={14}/> {patient.blood_type}</span>
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            {patient.allergies?.length > 0 && <div><span className="font-bold text-slate-300">Allergies:</span> {patient.allergies.join(', ')}</div>}
            {patient.conditions?.length > 0 && <div><span className="font-bold text-slate-300">Conditions:</span> {patient.conditions.join(', ')}</div>}
          </div>
        </div>

        {/* AI Alerts Summary */}
        {alerts.length > 0 && (
          <div className="md:w-64 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 shrink-0 z-10">
            <h3 className="font-bold text-red-400 flex items-center gap-2 mb-2 text-sm"><AlertTriangle size={16}/> Active AI Alerts ({alerts.length})</h3>
            <ul className="space-y-2">
              {alerts.slice(0,2).map(a => (
                <li key={a.id} className="text-xs text-slate-300 leading-tight bg-space-900/50 p-2 rounded truncate">{a.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {[
          { id: 'vitals', label: 'Telemetry Trends', icon: Activity },
          { id: 'visits', label: 'Visit History', icon: FileText },
          { id: 'prescriptions', label: 'Regimen', icon: Pill },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-space-700 text-teal-400 border-t-2 border-t-teal-400' 
                : 'text-slate-500 hover:bg-space-800 hover:text-slate-300'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        
        {activeTab === 'vitals' && (
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Longitudinal Vitals Trend</h3>
            {chartData.length > 1 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="hr" name="Heart Rate (bpm)" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, fill: '#7C3AED', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="sys" name="Systolic BP" stroke="#00D4FF" strokeWidth={3} dot={{ r: 4, fill: '#00D4FF', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="o2" name="Oxygen %" stroke="#34D399" strokeWidth={3} dot={{ r: 4, fill: '#34D399', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">Insufficient data for trend visualization. Add more visits.</div>
            )}
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="space-y-4">
            {visits.length === 0 ? <div className="text-center py-10 text-slate-500">No visit records.</div> : 
              [...visits].sort((a,b) => new Date(b.date) - new Date(a.date)).map(visit => (
                <div key={visit.id} className="glass-card p-6 rounded-2xl border-l-4 border-l-brand-violet">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-white text-lg">{visit.diagnosis}</h4>
                      <p className="text-xs text-slate-400 mt-1">{new Date(visit.date).toLocaleDateString()} • Dr. {visit.doctor_id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 bg-space-800/50 p-4 rounded-xl border border-white/5">
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Heart Rate</span><span className="text-white font-mono text-sm">{visit.vitals.heart_rate}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Blood Pressure</span><span className="text-white font-mono text-sm">{visit.vitals.blood_pressure}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Temp</span><span className="text-white font-mono text-sm">{visit.vitals.temperature}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">O2 Level</span><span className="text-white font-mono text-sm">{visit.vitals.oxygen_level}</span></div>
                  </div>
                  {visit.notes && <p className="text-sm text-slate-300 leading-relaxed bg-space-900 p-4 rounded-xl border border-white/5">{visit.notes}</p>}
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
             {prescriptions.length === 0 ? <div className="text-center py-10 text-slate-500">No prescriptions.</div> : 
              prescriptions.map(rx => (
                <div key={rx.id} className="glass-card p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-white">{rx.medicine_name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{rx.dosage} • {rx.frequency} for {rx.duration}</p>
                    {rx.instructions && <p className="text-xs text-teal-400 mt-2 bg-teal-400/10 inline-block px-2 py-1 rounded">Note: {rx.instructions}</p>}
                  </div>
                  <div className="text-right flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto justify-between">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${rx.status === 'active' ? 'text-teal-400 bg-teal-400/10 border-teal-400/20' : 'text-slate-400 bg-space-600 border-white/10'}`}>
                      {rx.status}
                    </span>
                    <span className="text-xs text-slate-500">{new Date(rx.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}

      </div>

    </div>
  );
};

export default PatientProfile;
