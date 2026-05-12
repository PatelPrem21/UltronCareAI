import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Trash2, AlertTriangle, Loader2, Search, Activity, Save } from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const AddVisit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patient') || '';
  const { user } = useAuthStore();
  
  const [patientId, setPatientId] = useState(initialPatientId);
  const [isSearching, setIsSearching] = useState(!!initialPatientId);
  const [drugWarning, setDrugWarning] = useState('');

  const { data: patient, error: patientError } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => (await api.get(`/patients/${patientId}`)).data,
    enabled: isSearching && !!patientId,
    retry: false,
  });

  const [visitData, setVisitData] = useState({
    vitals: { blood_pressure: '', temperature: '', weight: '', heart_rate: '', oxygen_level: '' },
    diagnosis: '', notes: '', follow_up_date: ''
  });

  const [prescriptions, setPrescriptions] = useState([]);

  const addPrescriptionRow = () => {
    setPrescriptions([...prescriptions, { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removePrescriptionRow = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const checkAlertsMutation = useMutation({
    mutationFn: async () => (await api.get(`/ai/alerts/${patientId}`)).data,
    onSuccess: (data) => {
      const interaction = data.find(a => a.module_type === 'drug_interaction');
      if (interaction) setDrugWarning(interaction.message);
    }
  });

  const visitMutation = useMutation({
    mutationFn: async () => {
      const newVisit = (await api.post('/visits', {
        patient_id: patientId, doctor_id: user.user_id, 
        vitals: visitData.vitals, diagnosis: visitData.diagnosis, 
        notes: visitData.notes, follow_up_date: visitData.follow_up_date || null
      })).data;

      if (prescriptions.length > 0) {
        for (const rx of prescriptions) {
          if (rx.medicine_name) {
            await api.post('/prescriptions', { patient_id: patientId, doctor_id: user.user_id, visit_id: newVisit.id, ...rx });
          }
        }
      }
      await checkAlertsMutation.mutateAsync();
      return newVisit;
    },
    onSuccess: () => navigate(`/doctor/patients/${patientId}`)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patientId || !patient) return;
    visitMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Record Visit Session</h1>
        <p className="text-slate-400">Initialize a new consultation record and regimen.</p>
      </div>

      {/* Patient Selection */}
      <div className="glass-card rounded-2xl p-6">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Patient Identifier</label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="flex-1 px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-brand-violet outline-none font-mono"
            placeholder="PAT-XXXX"
          />
          <button
            type="button"
            onClick={() => setIsSearching(true)}
            className="px-6 py-3 bg-space-700 text-white font-bold rounded-xl hover:bg-brand-violet transition-colors flex justify-center items-center gap-2 border border-white/5 hover:border-brand-violet"
          >
            <Search size={18} /> Authenticate Patient
          </button>
        </div>
        
        {patientError && <p className="text-red-400 text-sm mt-3 font-medium flex items-center gap-2"><AlertTriangle size={16}/> Record not found.</p>}
        {patient && (
          <div className="mt-4 p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-teal-400 block text-sm mb-1 uppercase tracking-wider">Patient Verified</span>
              <span className="text-white font-medium">{patient.name} <span className="text-slate-400 text-sm font-normal ml-2">({patient.age}y, {patient.blood_type})</span></span>
            </div>
            <Activity className="text-teal-400 opacity-50" />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Vitals Form */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">Telemetry Entry</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Pressure</label>
              <input type="text" placeholder="120/80" value={visitData.vitals.blood_pressure} onChange={(e) => setVisitData({...visitData, vitals: {...visitData.vitals, blood_pressure: e.target.value}})} className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-brand-violet outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Heart Rate</label>
              <input type="number" placeholder="72" value={visitData.vitals.heart_rate} onChange={(e) => setVisitData({...visitData, vitals: {...visitData.vitals, heart_rate: e.target.value}})} className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-brand-violet outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temp (°C)</label>
              <input type="number" step="0.1" placeholder="37.0" value={visitData.vitals.temperature} onChange={(e) => setVisitData({...visitData, vitals: {...visitData.vitals, temperature: e.target.value}})} className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-brand-violet outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weight (kg)</label>
              <input type="number" step="0.1" placeholder="70.5" value={visitData.vitals.weight} onChange={(e) => setVisitData({...visitData, vitals: {...visitData.vitals, weight: e.target.value}})} className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-brand-violet outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">O2 Level (%)</label>
              <input type="number" placeholder="98" value={visitData.vitals.oxygen_level} onChange={(e) => setVisitData({...visitData, vitals: {...visitData.vitals, oxygen_level: e.target.value}})} className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-brand-violet outline-none" />
            </div>
          </div>
        </div>

        {/* Diagnosis & Notes */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">Clinical Diagnosis</h2>
          <div className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Diagnosis *</label>
              <input type="text" required value={visitData.diagnosis} onChange={(e) => setVisitData({...visitData, diagnosis: e.target.value})} className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-brand-violet outline-none" placeholder="e.g. Acute Bronchitis" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Notes</label>
              <textarea rows={4} value={visitData.notes} onChange={(e) => setVisitData({...visitData, notes: e.target.value})} className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-brand-violet outline-none resize-none" placeholder="Patient presented with..." />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Follow-up Date</label>
              <input type="date" value={visitData.follow_up_date} onChange={(e) => setVisitData({...visitData, follow_up_date: e.target.value})} className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-brand-violet outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
          </div>
        </div>

        {/* Prescriptions */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white">Prescription Regimen</h2>
            <button type="button" onClick={addPrescriptionRow} className="flex items-center gap-2 px-4 py-2 bg-brand-violet/20 text-brand-violet font-bold rounded-xl hover:bg-brand-violet/40 transition-colors text-sm border border-brand-violet/30">
              <Plus size={16} /> Append Drug
            </button>
          </div>

          {prescriptions.length === 0 ? (
            <div className="text-center py-8 bg-space-900/50 border-2 border-dashed border-white/10 rounded-xl text-slate-500">
              No medications added. Click "Append Drug".
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((rx, idx) => (
                <div key={idx} className="p-4 bg-space-900 border border-white/5 rounded-xl relative group">
                  <button type="button" onClick={() => removePrescriptionRow(idx)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-8">
                    <div className="lg:col-span-2 space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medicine Name *</label><input type="text" required value={rx.medicine_name} onChange={(e) => handlePrescriptionChange(idx, 'medicine_name', e.target.value)} className="w-full px-3 py-2 bg-space-800 border border-white/10 rounded-lg text-white text-sm focus:border-brand-violet outline-none" placeholder="Amoxicillin" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dosage *</label><input type="text" required value={rx.dosage} onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)} className="w-full px-3 py-2 bg-space-800 border border-white/10 rounded-lg text-white text-sm focus:border-brand-violet outline-none" placeholder="500mg" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frequency *</label><input type="text" required value={rx.frequency} onChange={(e) => handlePrescriptionChange(idx, 'frequency', e.target.value)} className="w-full px-3 py-2 bg-space-800 border border-white/10 rounded-lg text-white text-sm focus:border-brand-violet outline-none" placeholder="BD" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration *</label><input type="text" required value={rx.duration} onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)} className="w-full px-3 py-2 bg-space-800 border border-white/10 rounded-lg text-white text-sm focus:border-brand-violet outline-none" placeholder="7 days" /></div>
                    <div className="lg:col-span-3 space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructions</label><input type="text" value={rx.instructions} onChange={(e) => handlePrescriptionChange(idx, 'instructions', e.target.value)} className="w-full px-3 py-2 bg-space-800 border border-white/10 rounded-lg text-white text-sm focus:border-brand-violet outline-none" placeholder="Take with food" /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {drugWarning && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <AlertTriangle size={24} className="shrink-0 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-400 text-sm tracking-wider uppercase mb-1">AI Safety Override</h3>
              <p className="text-sm text-slate-300">{drugWarning}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6">
          <button type="submit" disabled={visitMutation.isPending || !patient} className="flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-brand-violet to-purple-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50">
            {visitMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20}/> Commit Record</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVisit;
