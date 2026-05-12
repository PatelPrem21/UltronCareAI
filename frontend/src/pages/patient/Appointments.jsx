import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Video, Plus, Loader2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const Appointments = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isBooking, setIsBooking] = useState(false);
  
  const [formData, setFormData] = useState({
    doctor_id: '', date: '', time_slot: '', type: 'in-person', reason: '',
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', user?.user_id],
    queryFn: async () => (await api.get(`/appointments/${user.user_id}`)).data,
    enabled: !!user?.user_id,
  });

  const bookMutation = useMutation({
    mutationFn: async (data) => (await api.post('/appointments', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      setIsBooking(false);
      setFormData({ doctor_id: '', date: '', time_slot: '', type: 'in-person', reason: '' });
      toast.success('Appointment booked successfully!');
    },
    onError: () => toast.error('Failed to book appointment.')
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => (await api.put(`/appointments/${id}`, { status: 'cancelled' })).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Appointment cancelled.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    bookMutation.mutate({ patient_id: user.user_id, ...formData, status: 'pending' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-teal-400 bg-teal-400/10 border-teal-400/20';
      case 'pending': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'completed': return 'text-brand-violet bg-brand-violet/10 border-brand-violet/20';
      default: return 'text-slate-400 bg-space-600 border-white/10';
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date));
  const upcoming = sortedAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const past = sortedAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Appointments & Visits</h1>
          <p className="text-slate-400">Manage your clinical schedule and consultations</p>
        </div>
        <button
          onClick={() => setIsBooking(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-400 text-space-900 font-bold rounded-full hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all w-fit"
        >
          <Plus size={18} /> Log Visit
        </button>
      </div>

      <AnimatePresence>
        {isBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBooking(false)} className="absolute inset-0 bg-space-900/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-space-800 border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Book New Appointment</h2>
                <button onClick={() => setIsBooking(false)} className="text-slate-400 hover:text-white p-1 bg-space-700 rounded-full"><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor ID</label><input required value={formData.doctor_id} onChange={(e) => setFormData({...formData, doctor_id: e.target.value})} className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-teal-400 outline-none" placeholder="DOC-0001" /></div>
                  <div className="col-span-2 space-y-1"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultation Type</label><select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-teal-400 outline-none"><option value="in-person">In-Person Clinic</option><option value="online">Telemedicine / Video</option></select></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</label><input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-teal-400 outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time</label><input type="time" required value={formData.time_slot} onChange={(e) => setFormData({...formData, time_slot: e.target.value})} className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-teal-400 outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" /></div>
                  <div className="col-span-2 space-y-1"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason / Symptoms</label><textarea required rows={2} value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-teal-400 outline-none resize-none" placeholder="Briefly describe..." /></div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={bookMutation.isPending} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-400 text-space-900 font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] disabled:opacity-50 flex items-center gap-2">
                    {bookMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-12">
        {/* Upcoming Section */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Upcoming Appointments</h2>
          {upcoming.length === 0 ? (
             <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-full bg-space-600 flex items-center justify-center text-slate-500 mb-4"><Calendar size={32} /></div>
               <p className="text-slate-400">No upcoming appointments scheduled.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map((apt) => (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-space-800 rounded-xl p-3 text-center border border-white/5 min-w-[70px]">
                        <span className="block text-xs text-teal-400 font-bold uppercase tracking-wider">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="block text-2xl font-black text-white">{new Date(apt.date).getDate()}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white">Dr. {apt.doctor_id}</h3>
                        <span className={`inline-block px-2 py-0.5 mt-1 text-[10px] font-bold uppercase rounded border ${getStatusColor(apt.status)}`}>{apt.status}</span>
                      </div>
                    </div>
                    <div className="p-2 bg-space-800 rounded-lg text-teal-400 border border-white/5">
                      {apt.type === 'online' ? <Video size={20} /> : <MapPin size={20} />}
                    </div>
                  </div>
                  
                  <div className="bg-space-800 rounded-xl p-4 mb-4 border border-white/5">
                    <div className="flex items-center gap-3 text-sm text-slate-300 mb-2">
                      <Clock size={16} className="text-slate-500" />
                      <span>{apt.time_slot} ({apt.type})</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-300">
                      <AlertCircle size={16} className="text-slate-500 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{apt.reason}</span>
                    </div>
                  </div>

                  {apt.status === 'pending' && (
                    <button onClick={() => cancelMutation.mutate(apt.id)} disabled={cancelMutation.isPending} className="w-full py-2.5 rounded-lg border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 transition-colors text-sm">
                      Cancel Appointment
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Past Visits Section */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Past Visits</h2>
          {past.length === 0 ? (
             <div className="text-center py-8 text-slate-500">No past visits recorded.</div>
          ) : (
            <div className="space-y-4">
              {past.map(apt => (
                <div key={apt.id} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-space-600 flex items-center justify-center text-slate-400">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Dr. {apt.doctor_id}</p>
                      <p className="text-xs text-slate-400">{new Date(apt.date).toLocaleDateString()} • {apt.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-300 max-w-xs truncate hidden md:block">{apt.reason}</span>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${getStatusColor(apt.status)}`}>{apt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Appointments;
