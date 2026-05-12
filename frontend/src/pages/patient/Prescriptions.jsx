import { useQuery } from '@tanstack/react-query';
import { Pill, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const Prescriptions = () => {
  const { user } = useAuthStore();
  
  const { data: profile } = useQuery({ queryKey: ['patient', user?.user_id], queryFn: async () => (await api.get(`/auth/me`)).data });
  const customId = profile?.custom_id || user?.custom_id;

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['prescriptions', customId],
    queryFn: async () => (await api.get(`/prescriptions/${customId}`)).data,
    enabled: !!customId,
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-teal-400 bg-teal-400/10 border-teal-400/20';
      case 'completed': return 'text-brand-violet bg-brand-violet/10 border-brand-violet/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-space-600 border-white/10';
    }
  };

  const active = prescriptions.filter(p => p.status === 'active');
  const past = prescriptions.filter(p => p.status !== 'active');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Medications</h1>
        <p className="text-slate-400">Track active prescriptions and medication history.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        <section>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_10px_#00D4FF] animate-pulse" /> Active Regimen
          </h2>
          {active.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-full bg-space-600 flex items-center justify-center text-slate-500 mb-4"><Pill size={32} /></div>
               <p className="text-slate-400">No active medications prescribed.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {active.map(rx => (
                <motion.div key={rx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl border-t-2 border-t-teal-400 group hover:bg-space-600/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-space-800 border border-white/5 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                      <Pill size={24} />
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${getStatusColor(rx.status)}`}>
                      {rx.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-1">{rx.medicine_name}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-space-800 border border-white/5 rounded text-xs text-slate-300 font-medium">{rx.dosage}</span>
                    <span className="px-2 py-1 bg-space-800 border border-white/5 rounded text-xs text-slate-300 font-medium flex items-center gap-1"><Clock size={12}/> {rx.frequency}</span>
                  </div>
                  
                  <div className="bg-space-800 p-3 rounded-xl border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Duration</span>
                      <span className="text-white font-medium">{rx.duration}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Prescribed By</span>
                      <span className="text-white font-medium flex items-center gap-1"><User size={12}/> Dr. {rx.doctor_id}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Date</span>
                      <span className="text-white font-medium flex items-center gap-1"><Calendar size={12}/> {new Date(rx.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {rx.instructions && (
                    <div className="mt-4 flex items-start gap-2 text-xs text-orange-400 bg-orange-400/5 border border-orange-400/10 p-2 rounded-lg">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{rx.instructions}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Completed / Past</h2>
          {past.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No past medication history.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {past.map(rx => (
                <div key={rx.id} className="glass-card p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-space-600 flex items-center justify-center text-slate-400">
                      <Pill size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{rx.medicine_name} <span className="text-xs font-normal text-slate-400 ml-2">{rx.dosage}</span></p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(rx.created_at).toLocaleDateString()} • Dr. {rx.doctor_id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border w-fit ${getStatusColor(rx.status)}`}>
                    {rx.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Prescriptions;
