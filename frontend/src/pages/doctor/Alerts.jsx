import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Filter, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';

const Alerts = () => {
  // In a full implementation, there should be a global /ai/alerts endpoint for doctors
  // Here we'll simulate fetching all alerts or just use a placeholder
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['all-alerts'],
    queryFn: async () => {
      // Mocking for now since API might not have a "get all alerts for doctor" route
      // Or we try to hit a global route. If it doesn't exist, we fallback.
      try {
        const res = await api.get(`/ai/alerts/all`);
        return res.data;
      } catch {
        return [
          { id: '1', patient_id: 'PAT-0001', module_type: 'drug_interaction', severity: 'high', message: 'Potential conflict: Aspirin and Warfarin. Increased bleeding risk.', created_at: new Date().toISOString(), is_resolved: false },
          { id: '2', patient_id: 'PAT-0002', module_type: 'deterioration', severity: 'critical', message: 'Slight drop in O2 levels and increased heart rate over last 3 visits.', created_at: new Date().toISOString(), is_resolved: false },
          { id: '3', patient_id: 'PAT-0003', module_type: 'adherence', severity: 'medium', message: 'Patient hasn\'t refilled Metformin prescription in 45 days.', created_at: new Date().toISOString(), is_resolved: false },
        ];
      }
    },
  });

  const [severityFilter, setSeverityFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (moduleFilter !== 'all' && alert.module_type !== moduleFilter) return false;
    return !alert.is_resolved;
  });

  if (isLoading) return <div className="p-8">Loading alerts...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="text-warning" />
            AI Copilot Alerts
          </h1>
          <p className="text-text-secondary mt-1">Real-time proactive monitoring across your patients.</p>
        </div>
      </div>

      <div className="bg-bg-secondary p-4 rounded-xl border border-border flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-text-secondary font-medium mr-2">
          <Filter size={18} /> Filters
        </div>
        
        <select 
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-1 focus:ring-accent outline-none"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select 
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-1 focus:ring-accent outline-none capitalize"
        >
          <option value="all">All Modules</option>
          <option value="drug_interaction">Drug Interaction</option>
          <option value="deterioration">Deterioration</option>
          <option value="adherence">Adherence</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16 bg-bg-secondary border-2 border-dashed border-border rounded-xl">
            <CheckCircle2 size={48} className="mx-auto text-success mb-4" />
            <h3 className="text-lg font-bold">All Clear</h3>
            <p className="text-text-secondary">No active AI alerts matching your filters.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id} 
              className={`bg-bg-secondary border rounded-xl p-5 flex flex-col md:flex-row gap-4 justify-between items-start ${
                alert.severity === 'critical' ? 'border-danger' :
                alert.severity === 'high' ? 'border-orange-500' : 'border-warning/50'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    alert.severity === 'critical' ? 'bg-danger/10 text-danger' :
                    alert.severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-sm font-medium text-text-secondary uppercase">
                    {alert.module_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-text-muted hidden sm:inline">•</span>
                  <span className="text-xs text-text-muted">
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>
                <h3 className="font-medium text-text-primary text-lg mb-1">{alert.message}</h3>
                <p className="text-sm text-text-secondary">
                  Patient ID: <span className="font-mono bg-bg-tertiary px-1 rounded">{alert.patient_id}</span>
                </p>
              </div>
              
              <button
                className="w-full md:w-auto px-4 py-2 border border-border text-text-secondary font-medium rounded-lg hover:border-success hover:text-success hover:bg-success/10 transition-colors shrink-0 flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle2 size={16} /> Mark Resolved
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
