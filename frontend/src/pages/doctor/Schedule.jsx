import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Video, CheckCircle2, XCircle, Activity, User } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const Schedule = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['doc-appointments', user?.user_id],
    queryFn: async () => (await api.get(`/appointments/${user?.user_id}`)).data,
    enabled: !!user?.user_id
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }) => (await api.put(`/appointments/${id}`, { status })).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['doc-appointments']);
      toast.success('Schedule updated.');
    },
    onError: () => toast.error('Update failed.')
  });

  if (isLoading) return <div className="flex justify-center p-20"><Activity className="animate-spin text-brand-violet" size={48}/></div>;

  const sortedAppointments = [...appointments].sort((a, b) => new Date(a.date) - new Date(b.date));
  const pending = sortedAppointments.filter(a => a.status === 'pending');
  const confirmed = sortedAppointments.filter(a => a.status === 'confirmed');
  const past = sortedAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  const AppointmentCard = ({ apt, showActions }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="bg-space-800 rounded-xl p-3 text-center border border-white/5 min-w-[70px]">
            <span className="block text-[10px] text-teal-400 font-bold uppercase tracking-wider">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
            <span className="block text-2xl font-black text-white">{new Date(apt.date).getDate()}</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <User size={16} className="text-slate-500" /> PAT-{apt.patient_id.split('-')[1]}
            </h3>
            <span className="text-xs text-slate-400 flex items-center gap-2 mt-1">
              <Clock size={12}/> {apt.time_slot}
            </span>
          </div>
        </div>
        <div className="p-2 bg-space-800 rounded-lg text-teal-400 border border-white/5">
          {apt.type === 'online' ? <Video size={20} /> : <MapPin size={20} />}
        </div>
      </div>
      
      <div className="bg-space-800 rounded-xl p-4 mb-4 border border-white/5">
        <p className="text-sm text-slate-300 leading-relaxed"><span className="text-brand-violet font-bold mr-2">Reason:</span>{apt.reason}</p>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4 border-t border-white/5 pt-4">
          {apt.status === 'pending' && (
            <>
              <button onClick={() => updateMutation.mutate({ id: apt.id, status: 'confirmed' })} className="flex-1 py-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500 hover:text-space-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                <CheckCircle2 size={16} /> Confirm
              </button>
              <button onClick={() => updateMutation.mutate({ id: apt.id, status: 'cancelled' })} className="flex-1 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                <XCircle size={16} /> Cancel
              </button>
            </>
          )}
          {apt.status === 'confirmed' && (
             <button onClick={() => updateMutation.mutate({ id: apt.id, status: 'completed' })} className="w-full py-2 bg-brand-violet/10 border border-brand-violet/30 text-brand-violet hover:bg-brand-violet hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
               <CheckCircle2 size={16} /> Mark Completed
             </button>
          )}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Master Schedule</h1>
        <p className="text-slate-400">Manage pending requests and confirmed clinical appointments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" /> Pending Requests ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.length === 0 ? <div className="text-center py-8 text-slate-500 bg-space-900/50 rounded-2xl border border-dashed border-white/10">No pending requests</div> : pending.map(apt => <AppointmentCard key={apt.id} apt={apt} showActions={true} />)}
          </div>
        </section>

        {/* Confirmed */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_10px_#00D4FF]" /> Confirmed Queue ({confirmed.length})
          </h2>
          <div className="space-y-4">
            {confirmed.length === 0 ? <div className="text-center py-8 text-slate-500 bg-space-900/50 rounded-2xl border border-dashed border-white/10">No confirmed appointments</div> : confirmed.map(apt => <AppointmentCard key={apt.id} apt={apt} showActions={true} />)}
          </div>
        </section>
      </div>

      {/* Past/Completed */}
      <section className="pt-8 mt-8 border-t border-white/10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Calendar className="text-slate-500" size={20} /> Historical Logs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {past.length === 0 ? <div className="text-slate-500 text-sm">No historical logs found.</div> : past.map(apt => (
            <div key={apt.id} className="glass-card p-4 rounded-xl flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
              <div>
                <p className="font-bold text-white text-sm">PAT-{apt.patient_id.split('-')[1]}</p>
                <p className="text-xs text-slate-400">{new Date(apt.date).toLocaleDateString()} • {apt.type}</p>
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${apt.status === 'completed' ? 'text-brand-violet bg-brand-violet/10 border-brand-violet/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                {apt.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Schedule;
