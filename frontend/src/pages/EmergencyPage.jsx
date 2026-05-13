import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, AlertTriangle, Phone, Pill, Activity, Brain, QrCode, Clock } from 'lucide-react';
import api from '../api/axios';

const TRIAGE_CONFIG = {
  RED:     { bg: 'bg-red-500/10',    border: 'border-red-500',    text: 'text-red-400',    label: 'CRITICAL',  icon: '🔴' },
  ORANGE:  { bg: 'bg-orange-500/10', border: 'border-orange-500', text: 'text-orange-400', label: 'URGENT',    icon: '🟠' },
  YELLOW:  { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-400', label: 'MODERATE',  icon: '🟡' },
  GREEN:   { bg: 'bg-teal-500/10',   border: 'border-teal-500',   text: 'text-teal-400',   label: 'STABLE',    icon: '🟢' },
  UNKNOWN: { bg: 'bg-slate-500/10',  border: 'border-slate-500',  text: 'text-slate-400',  label: 'UNKNOWN',   icon: '⚪' },
};

export default function EmergencyPage() {
  const { patient_id } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function fetchEmergency() {
      try {
        const res = await api.get(`/emergency/${patient_id}`);
        setData(res.data);
      } catch (err) {
        setError('Patient record not found or server error.');
      } finally {
        setLoading(false);
      }
    }
    fetchEmergency();
  }, [patient_id]);

  if (loading) return (
    <div className="min-h-screen bg-space-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-2 border-teal-500/30 border-t-teal-400 rounded-full mx-auto mb-4"
        />
        <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Emergency Brief...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-space-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🚨</div>
        <h1 className="text-2xl font-bold text-white mb-2">Record Not Found</h1>
        <p className="text-slate-400">{error}</p>
      </div>
    </div>
  );

  const triage = TRIAGE_CONFIG[data.triage_level] || TRIAGE_CONFIG.UNKNOWN;

  return (
    <div className="min-h-screen bg-space-900 text-white">

      {/* ── TOP BANNER ── */}
      <div className={`${triage.bg} border-b ${triage.border} px-4 py-3`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{triage.icon}</span>
            <div>
              <div className={`text-xs font-bold tracking-widest uppercase ${triage.text}`}>
                Triage Level
              </div>
              <div className={`text-xl font-black ${triage.text}`}>
                {triage.label}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock size={12} />
            {data.generated_at ? new Date(data.generated_at).toLocaleTimeString() : 'Just now'}
          </div>
        </div>
      </div>

      {/* ── HEADER ── */}
      <div className="bg-space-800 border-b border-white/5 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-lg font-bold text-teal-400">
              {data.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold">{data.name}</h1>
              <p className="text-slate-400 text-sm">
                Age {data.age} · Blood Type{' '}
                <span className="text-red-400 font-bold">{data.blood_type}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest">UltronCare.AI</span>
            <span className="text-teal-400">🦚</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* ── AI TRIAGE BRIEF ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${triage.bg} border ${triage.border} rounded-2xl p-5`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain size={18} className={triage.text} />
            <span className={`font-bold text-sm ${triage.text}`}>AI Triage Brief</span>
            <span className="ml-auto text-xs text-slate-500">{data.visits_analyzed} visits analyzed</span>
          </div>
          <pre className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {data.ai_brief}
          </pre>
        </motion.div>

        {/* ── QUICK INFO GRID ── */}
        <div className="grid grid-cols-2 gap-3">

          {/* Allergies */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4 border border-red-500/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-red-400" />
              <span className="text-red-400 font-bold text-sm">Allergies</span>
            </div>
            {data.allergies?.length > 0 ? (
              <div className="space-y-1">
                {data.allergies.map((a, i) => (
                  <div key={i} className="bg-red-500/10 text-red-300 text-xs px-3 py-1.5 rounded-lg font-medium">
                    ⚠️ {a}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs">No known allergies</p>
            )}
          </motion.div>

          {/* Conditions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-4 border border-orange-500/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-orange-400" />
              <span className="text-orange-400 font-bold text-sm">Conditions</span>
            </div>
            {data.conditions?.length > 0 ? (
              <div className="space-y-1">
                {data.conditions.map((c, i) => (
                  <div key={i} className="bg-orange-500/10 text-orange-300 text-xs px-3 py-1.5 rounded-lg font-medium">
                    {c}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs">No conditions recorded</p>
            )}
          </motion.div>
        </div>

        {/* ── MEDICATIONS ── */}
        {data.current_medications?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-5 border border-white/5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Pill size={16} className="text-teal-400" />
              <span className="text-teal-400 font-bold text-sm">Current Medications</span>
            </div>
            <div className="space-y-2">
              {data.current_medications.map((med, i) => (
                <div key={i} className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-3 border border-white/5">
                  <div>
                    <p className="text-white font-semibold text-sm">{med.name}</p>
                    <p className="text-slate-400 text-xs">{med.frequency}</p>
                  </div>
                  <span className="text-teal-400 text-xs font-mono bg-teal-500/10 px-3 py-1 rounded-full">
                    {med.dosage}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── EMERGENCY CONTACT ── */}
        {data.emergency_contact && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-5 border border-green-500/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <Phone size={16} className="text-green-400" />
              <span className="text-green-400 font-bold text-sm">Emergency Contact</span>
            </div>
            <a
              href={`tel:${data.emergency_contact}`}
              className="flex items-center justify-between bg-green-500/10 rounded-xl px-4 py-3 border border-green-500/20 hover:bg-green-500/20 transition-all"
            >
              <span className="text-white font-semibold">{data.emergency_contact}</span>
              <span className="text-green-400 text-xs font-bold">TAP TO CALL →</span>
            </a>
          </motion.div>
        )}

        {/* ── AI ALERTS COUNT ── */}
        {data.active_alerts > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3"
          >
            <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-bold text-sm">
                {data.active_alerts} Active AI Alert{data.active_alerts > 1 ? 's' : ''}
              </p>
              <p className="text-slate-400 text-xs">Review full patient record for details</p>
            </div>
          </motion.div>
        )}

        {/* ── QR CODE ── */}
        {data.qr_code && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card rounded-2xl p-5 border border-white/5 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <QrCode size={16} className="text-teal-400" />
              <span className="text-teal-400 font-bold text-sm">Patient QR Code</span>
            </div>
            <img
              src={`data:image/png;base64,${data.qr_code}`}
              alt="Patient QR Code"
              className="w-36 h-36 mx-auto rounded-xl"
            />
            <p className="text-slate-500 text-xs mt-2">Scan to reload this emergency page</p>
          </motion.div>
        )}

        {/* ── FOOTER ── */}
        <div className="text-center py-4">
          <p className="text-slate-600 text-xs">
            🦚 UltronCare.AI · AI-Powered Emergency Brief · {new Date().getFullYear()}
          </p>
          <p className="text-slate-700 text-xs mt-1">
            This is an AI-generated summary. Always verify with the attending physician.
          </p>
        </div>

      </div>
    </div>
  );
}
