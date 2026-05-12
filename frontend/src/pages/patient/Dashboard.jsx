import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pill, Activity, QrCode, AlertTriangle, Calendar, FileText, Brain, HeartPulse, BrainCircuit, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import QRModal from '../../components/QRModal';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [qrOpen, setQrOpen] = useState(false);

  // Fetch all required data
  const { data: profile } = useQuery({ queryKey: ['patient', user?.user_id], queryFn: async () => (await api.get(`/auth/me`)).data });
  const customId = profile?.custom_id || user?.custom_id;

  const { data: prescriptions = [] } = useQuery({ queryKey: ['prescriptions', customId], queryFn: async () => (await api.get(`/prescriptions/${customId}`)).data, enabled: !!customId });
  const { data: visits = [] } = useQuery({ queryKey: ['visits', customId], queryFn: async () => (await api.get(`/visits/${customId}`)).data, enabled: !!customId });
  const { data: appointments = [] } = useQuery({ queryKey: ['appointments', user?.user_id], queryFn: async () => (await api.get(`/appointments/${user?.user_id}`)).data, enabled: !!user?.user_id });

  // Get latest vitals from visits
  const sortedVisits = [...visits].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const latestVitals = sortedVisits.length > 0 ? sortedVisits[0].vitals : null;

  return (
    <div className="space-y-8">
      <QRModal isOpen={qrOpen} onClose={() => setQrOpen(false)} customId={customId} />

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Add Medication", icon: Pill, color: "text-brand-violet", bg: "bg-brand-violet/10", border: "border-brand-violet/30", onClick: () => navigate('/patient/prescriptions') },
          { label: "Log Symptom", icon: Activity, color: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-400/30", onClick: () => navigate('/patient/chat') },
          { label: "My QR Code", icon: QrCode, color: "text-white", bg: "bg-white/10", border: "border-white/20", onClick: () => setQrOpen(true) },
          { label: "Emergency Mode", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", onClick: () => navigate('/patient/emergency') },
        ].map((action, i) => (
          <motion.button 
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            className={`glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-3 border ${action.border} hover:bg-space-600 transition-colors group`}
          >
            <div className={`w-12 h-12 rounded-full ${action.bg} flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
              <action.icon size={24} />
            </div>
            <span className="text-sm font-medium text-slate-300">{action.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Center Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Health Assistant */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <BrainCircuit className="text-brand-violet" /> ULTRON AI ASSISTANT
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-5 rounded-2xl border-l-4 border-l-brand-violet">
                <Brain size={20} className="text-brand-violet mb-2" />
                <h3 className="font-bold text-white text-sm mb-1">Health Insights</h3>
                <p className="text-xs text-slate-400">Vitals are stable. Consider increasing water intake based on recent labs.</p>
              </div>
              <div className="glass-card p-5 rounded-2xl border-l-4 border-l-teal-400">
                <Calendar size={20} className="text-teal-400 mb-2" />
                <h3 className="font-bold text-white text-sm mb-1">Appointments Check</h3>
                <p className="text-xs text-slate-400">No conflicts found in your upcoming schedule.</p>
              </div>
              <div className="glass-card p-5 rounded-2xl border-l-4 border-l-orange-500">
                <BellRing size={20} className="text-orange-500 mb-2" />
                <h3 className="font-bold text-white text-sm mb-1">Smart Reminders</h3>
                <p className="text-xs text-slate-400">Time to refill Amoxicillin in 2 days.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Active Prescriptions */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Pill size={20} className="text-teal-400" /> Active Medications
                </h2>
                <Link to="/patient/prescriptions" className="text-xs text-teal-400 hover:text-teal-300">View All</Link>
              </div>
              <div className="space-y-4">
                {prescriptions.filter(p => p.status !== 'completed').slice(0, 3).map((rx) => (
                  <div key={rx.id} className="bg-space-800 p-4 rounded-xl border border-white/5">
                    <p className="font-bold text-white">{rx.medicine_name}</p>
                    <p className="text-xs text-slate-400 mt-1">{rx.dosage} • {rx.frequency}</p>
                  </div>
                ))}
                {prescriptions.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">No active prescriptions</p>}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Calendar size={20} className="text-brand-violet" /> Upcoming Visits
                </h2>
                <Link to="/patient/appointments" className="text-xs text-brand-violet hover:text-purple-300">View All</Link>
              </div>
              <div className="space-y-4">
                {appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').slice(0, 3).map((apt) => {
                  const aptDate = apt.datetime ? new Date(apt.datetime) : new Date();
                  return (
                    <div key={apt.custom_id || apt._id || Math.random()} className="bg-space-800 p-4 rounded-xl border border-white/5 flex gap-4">
                      <div className="bg-space-700 rounded-lg p-2 text-center min-w-[60px]">
                        <span className="block text-xs text-brand-violet font-bold uppercase">{aptDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="block text-xl font-bold text-white">{aptDate.getDate()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">Dr. {apt.doctor_id}</p>
                        <p className="text-xs text-slate-400 mt-1">{apt.datetime ? aptDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'} • {apt.type}</p>
                      </div>
                    </div>
                  );
                })}
                {appointments.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">No upcoming appointments</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          
          {/* Vitals Monitor */}
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-teal-400">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <HeartPulse size={20} className="text-teal-400" /> Vitals Monitor
            </h2>
            {latestVitals ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-sm text-slate-400">Heart Rate</span>
                  <span className="text-xl font-bold text-white">{latestVitals.heart_rate} <span className="text-xs text-slate-500 font-normal">bpm</span></span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-sm text-slate-400">Blood Pressure</span>
                  <span className="text-xl font-bold text-white">{latestVitals.blood_pressure} <span className="text-xs text-slate-500 font-normal">mmHg</span></span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-sm text-slate-400">Oxygen</span>
                  <span className="text-xl font-bold text-white">{latestVitals.oxygen_level} <span className="text-xs text-slate-500 font-normal">%</span></span>
                </div>
                <div className="flex justify-between items-end pb-1">
                  <span className="text-sm text-slate-400">Temperature</span>
                  <span className="text-xl font-bold text-white">{latestVitals.temperature} <span className="text-xs text-slate-500 font-normal">°C</span></span>
                </div>
                <p className="text-xs text-slate-500 text-center mt-4 pt-2">Last updated: {new Date(sortedVisits[0].created_at).toLocaleDateString()}</p>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-sm">No vitals recorded yet.</div>
            )}
          </div>

          {/* Recent Visits History */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <FileText size={20} className="text-slate-300" /> Recent Visits
            </h2>
            <div className="space-y-4">
              {sortedVisits.slice(0, 4).map((visit) => (
                <div key={visit.custom_id || visit._id || Math.random()} className="relative pl-6 border-l border-white/10">
                  <div className="absolute w-2 h-2 rounded-full bg-teal-400 -left-[4.5px] top-1.5" />
                  <p className="text-sm font-bold text-white">{visit.diagnosis}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(visit.created_at).toLocaleDateString()} • Dr. {visit.doctor_id}</p>
                </div>
              ))}
              {sortedVisits.length === 0 && <div className="text-center text-slate-500 text-sm">No visit history</div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
