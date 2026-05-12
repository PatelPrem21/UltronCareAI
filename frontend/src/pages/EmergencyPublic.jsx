import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Activity, User, Phone, Pill, Stethoscope, Droplet, Hash, Hexagon } from 'lucide-react';
import api from '../api/axios';

const EmergencyPublic = () => {
  const { id } = useParams();

  const { data: emgData, isLoading, error } = useQuery({
    queryKey: ['emergency', id],
    queryFn: async () => (await api.get(`/emergency/${id}`)).data,
    retry: false,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-space-900 flex items-center justify-center text-teal-400"><Activity className="animate-spin" size={48}/></div>;
  }

  if (error || !emgData) {
    return (
      <div className="min-h-screen bg-space-900 flex flex-col items-center justify-center p-4">
        <AlertTriangle size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white">Record Not Found</h1>
        <p className="text-slate-400 mt-2">Invalid or expired emergency ID.</p>
        <Link to="/" className="mt-8 text-teal-400 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-900 bg-particles py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Banner */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <AlertTriangle className="text-red-500 animate-pulse" size={28} />
          <h1 className="text-xl md:text-2xl font-black text-red-500 tracking-wider uppercase">Emergency Medical Protocol Active</h1>
        </div>

        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Hexagon size={150} />
          </div>
          
          <div className="w-24 h-24 rounded-full bg-space-800 border-2 border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
            <User size={48} />
          </div>
          <div className="flex-1 text-center md:text-left z-10">
            <h2 className="text-3xl font-black text-white mb-2">{emgData.name}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
              <span className="px-3 py-1 bg-space-800 border border-white/10 rounded-full text-sm font-bold text-slate-300 flex items-center gap-2"><Hash size={14} className="text-teal-400"/> {emgData.custom_id}</span>
              <span className="px-3 py-1 bg-space-800 border border-white/10 rounded-full text-sm font-bold text-slate-300">{emgData.age} Years Old</span>
              <span className="px-3 py-1 bg-space-800 border border-white/10 rounded-full text-sm font-bold text-slate-300">Gender Not Specified</span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-bold">
              <Droplet size={18} /> Blood Vector: {emgData.blood_type}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Allergies */}
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-orange-500">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" /> Critical Allergies
            </h3>
            {emgData.allergies?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {emgData.allergies.map((allergy, i) => (
                  <span key={i} className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-sm font-bold">
                    {allergy}
                  </span>
                ))}
              </div>
            ) : <p className="text-slate-500 italic text-sm">No known allergies</p>}
          </div>

          {/* Chronic Conditions */}
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-brand-violet">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Stethoscope size={20} className="text-brand-violet" /> Chronic Conditions
            </h3>
            {emgData.conditions?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {emgData.conditions.map((cond, i) => (
                  <span key={i} className="px-3 py-1.5 bg-brand-violet/10 border border-brand-violet/20 text-brand-violet rounded-lg text-sm font-bold">
                    {cond}
                  </span>
                ))}
              </div>
            ) : <p className="text-slate-500 italic text-sm">No chronic conditions</p>}
          </div>

          {/* Active Medications */}
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-teal-400">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Pill size={20} className="text-teal-400" /> Current Medications
            </h3>
            {emgData.active_prescriptions?.length > 0 ? (
              <div className="space-y-3">
                {emgData.active_prescriptions.map(rx => (
                  <div key={rx.id} className="p-3 bg-space-800 border border-white/5 rounded-xl">
                    <p className="font-bold text-white">{rx.medicine_name}</p>
                    <p className="text-xs text-slate-400 mt-1">{rx.dosage} • {rx.frequency}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-slate-500 italic text-sm">No active prescriptions in system</p>}
          </div>

          {/* Emergency Contacts */}
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-blue-500">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Phone size={20} className="text-blue-500" /> Emergency Contact
            </h3>
            {emgData.emergency_contact ? (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="font-bold text-blue-400 text-lg">{emgData.emergency_contact}</p>
                <p className="text-xs text-slate-400 mt-1">Please call immediately.</p>
              </div>
            ) : <p className="text-slate-500 italic text-sm">No contact provided</p>}
          </div>

        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold tracking-widest uppercase">
            <Hexagon size={16} className="text-teal-400"/> Powered by UltronCare.Ai
          </Link>
        </div>

      </div>
    </div>
  );
};

export default EmergencyPublic;
