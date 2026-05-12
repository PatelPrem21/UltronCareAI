import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, UserPlus, FileText, ChevronRight, Activity, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';

const Patients = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['all-patients'],
    queryFn: async () => {
      // Mock or fetch real data
      try {
        return (await api.get('/patients')).data;
      } catch {
        return [
          { custom_id: 'PAT-0001', name: 'John Doe', email: 'john@example.com', age: 45, blood_type: 'O+', status: 'stable' },
          { custom_id: 'PAT-0002', name: 'Jane Smith', email: 'jane@example.com', age: 32, blood_type: 'A-', status: 'critical' },
          { custom_id: 'PAT-0003', name: 'Robert Johnson', email: 'rob@example.com', age: 58, blood_type: 'B+', status: 'monitoring' },
        ];
      }
    }
  });

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.custom_id.toLowerCase().includes(search.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'critical': return <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs font-bold uppercase tracking-wider">Critical</span>;
      case 'monitoring': return <span className="px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded text-xs font-bold uppercase tracking-wider">Monitor</span>;
      default: return <span className="px-2 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded text-xs font-bold uppercase tracking-wider">Stable</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Patient Directory</h1>
          <p className="text-slate-400">Manage and monitor your clinical assignments.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-violet to-purple-500 text-white font-bold rounded-xl hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all">
          <UserPlus size={18} /> Add Patient
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-space-800 border border-white/10 rounded-xl text-white focus:border-brand-violet outline-none transition-all placeholder:text-slate-500"
            placeholder="Search by ID, Name, or Email..."
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-space-800 text-slate-300 font-medium rounded-xl border border-white/10 hover:bg-space-700 transition-all">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Patient List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12"><Activity className="animate-spin text-brand-violet" size={32}/></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-space-800 border-b border-white/10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Patient</th>
                  <th className="py-4 px-6">Identifier</th>
                  <th className="py-4 px-6">Clinical Vector</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPatients.map(pt => (
                  <motion.tr 
                    key={pt.custom_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-space-700/50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-space-900 border border-white/10 flex items-center justify-center text-slate-400">
                          <span className="font-bold">{pt.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{pt.name}</p>
                          <p className="text-xs text-slate-400">{pt.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-teal-400 bg-teal-400/10 border border-teal-400/20 px-2 py-1 rounded">{pt.custom_id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-slate-300">{pt.age}y • {pt.blood_type}</p>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(pt.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/doctor/patients/${pt.custom_id}`)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-space-800 hover:bg-brand-violet text-slate-300 hover:text-white border border-white/10 hover:border-brand-violet rounded-lg transition-all text-xs font-medium"
                        >
                          <FileText size={14} /> Profile
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">
                      No patients found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Patients;
