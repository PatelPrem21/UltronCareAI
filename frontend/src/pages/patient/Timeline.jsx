import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Calendar, ChevronDown, ChevronUp, Pill } from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const Timeline = () => {
  const { user } = useAuthStore();
  const [expandedId, setExpandedId] = useState(null);

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', user?.user_id],
    queryFn: async () => {
      const res = await api.get(`/auth/me`);
      const profileRes = await api.get(`/patients/${res.data.profile_id}`);
      return profileRes.data;
    },
    enabled: !!user,
  });

  if (isLoading) return <div className="p-8">Loading timeline...</div>;

  const visits = patient?.visits || [];
  const sortedVisits = [...visits].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Medical Timeline</h1>
        <div className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-secondary">
          {visits.length} Total Visits
        </div>
      </div>

      <div className="relative border-l border-border ml-4 md:ml-6 space-y-8 pb-12">
        {sortedVisits.map((visit) => {
          const isExpanded = expandedId === visit.id;
          
          return (
            <div key={visit.id} className="relative pl-8 md:pl-10">
              {/* Timeline dot */}
              <div className="absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-bg-primary" />
              
              <div 
                className={`bg-bg-secondary border transition-colors rounded-xl overflow-hidden ${
                  isExpanded ? 'border-accent' : 'border-border hover:border-accent/50'
                }`}
              >
                {/* Header (Clickable) */}
                <button 
                  onClick={() => setExpandedId(isExpanded ? null : visit.id)}
                  className="w-full text-left p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-accent flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(visit.date).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-text-muted hidden sm:inline">•</span>
                      <span className="text-sm text-text-secondary">Dr. {visit.doctor_id}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {visit.diagnosis}
                    </h3>
                  </div>
                  <div className="text-text-muted bg-bg-tertiary p-2 rounded-lg shrink-0">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Vitals */}
                      <div>
                        <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                          <Activity size={16} /> Vitals Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-bg-primary p-3 rounded-lg border border-border">
                            <p className="text-xs text-text-muted mb-1">Blood Pressure</p>
                            <p className="font-medium text-sm">{visit.vitals?.blood_pressure || 'N/A'}</p>
                          </div>
                          <div className="bg-bg-primary p-3 rounded-lg border border-border">
                            <p className="text-xs text-text-muted mb-1">Heart Rate</p>
                            <p className="font-medium text-sm">{visit.vitals?.heart_rate || 'N/A'} bpm</p>
                          </div>
                          <div className="bg-bg-primary p-3 rounded-lg border border-border">
                            <p className="text-xs text-text-muted mb-1">Temperature</p>
                            <p className="font-medium text-sm">{visit.vitals?.temperature || 'N/A'} °C</p>
                          </div>
                          <div className="bg-bg-primary p-3 rounded-lg border border-border">
                            <p className="text-xs text-text-muted mb-1">Oxygen Level</p>
                            <p className="font-medium text-sm">{visit.vitals?.oxygen_level || 'N/A'} %</p>
                          </div>
                        </div>
                      </div>

                      {/* Prescriptions */}
                      <div>
                        <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                          <Pill size={16} /> Prescriptions
                        </h4>
                        {visit.prescriptions && visit.prescriptions.length > 0 ? (
                          <div className="space-y-3">
                            {visit.prescriptions.map((rx, idx) => (
                              <div key={idx} className="bg-bg-primary p-3 rounded-lg border border-border">
                                <p className="font-medium text-sm text-accent mb-1">{rx.medicine_name}</p>
                                <p className="text-xs text-text-secondary">
                                  {rx.dosage} • {rx.frequency} • {rx.duration}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-text-muted italic bg-bg-primary p-3 rounded-lg border border-border">
                            No prescriptions for this visit
                          </p>
                        )}
                      </div>
                      
                      {/* Notes */}
                      {visit.notes && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-text-secondary mb-2">Doctor's Notes</h4>
                          <p className="text-sm text-text-primary bg-bg-primary p-4 rounded-lg border border-border leading-relaxed">
                            {visit.notes}
                          </p>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sortedVisits.length === 0 && (
          <div className="pl-8 text-center py-12 text-text-muted">
            <p>No medical visits recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
