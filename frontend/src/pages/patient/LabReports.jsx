import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, Download, Brain, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const LabReports = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [file, setFile] = useState(null);
  const [visitId, setVisitId] = useState('');
  const [expandedReport, setExpandedReport] = useState(null);

  const { data: profile } = useQuery({ queryKey: ['patient', user?.user_id], queryFn: async () => (await api.get(`/auth/me`)).data });
  const customId = profile?.custom_id || user?.custom_id;

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['lab-reports', customId],
    queryFn: async () => (await api.get(`/lab-reports/${customId}`)).data,
    enabled: !!customId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData) => (await api.post('/lab-reports/upload', formData)).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['lab-reports']);
      setFile(null);
      setVisitId('');
      toast.success('Report processed by AI.');
    },
    onError: () => toast.error('Upload failed.')
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file || !customId) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', customId);
    if (visitId) formData.append('visit_id', visitId);
    uploadMutation.mutate(formData);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'analyzed': return <span className="px-2 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Brain size={12}/> Analyzed</span>;
      case 'processing': return <span className="px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Processing</span>;
      default: return <span className="px-2 py-1 bg-space-600 text-slate-400 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider">Pending</span>;
    }
  };

  const getColorClass = (color) => {
    if (color === 'red') return 'text-red-400 font-bold';
    if (color === 'yellow') return 'text-orange-400 font-bold';
    return 'text-teal-400';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Documents</h1>
          <p className="text-slate-400">Secure clinical records and AI-analyzed lab results.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-space-700 text-white font-bold rounded-xl border border-white/10 hover:bg-space-600 transition-all text-sm">
            <Download size={16} /> Download All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Panel */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl sticky top-24">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Upload size={20} className="text-brand-violet" /> Upload Report
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-white/10 hover:border-teal-500/50 rounded-xl p-8 text-center transition-colors bg-space-800">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-space-700 flex items-center justify-center text-teal-400 mb-3">
                    <FileText size={24} />
                  </div>
                  <span className="text-sm font-bold text-white mb-1">Click to browse</span>
                  <span className="text-xs text-slate-500">PDF, PNG, JPG up to 10MB</span>
                </label>
                {file && <div className="mt-4 p-2 bg-teal-500/10 border border-teal-500/30 rounded-lg text-xs text-teal-400 font-mono truncate">{file.name}</div>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link to Visit ID (Optional)</label>
                <input
                  type="text"
                  value={visitId}
                  onChange={(e) => setVisitId(e.target.value)}
                  className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-xl text-white focus:border-brand-violet outline-none text-sm font-mono"
                  placeholder="VST-XXXX"
                />
              </div>

              <button
                type="submit"
                disabled={!file || uploadMutation.isPending}
                className="w-full py-3 bg-gradient-to-r from-brand-violet to-purple-500 text-white font-bold rounded-xl hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {uploadMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Process via AI'}
              </button>
            </form>
          </div>
        </div>

        {/* Reports List */}
        <div className="lg:col-span-2 space-y-4">
          {reports.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl flex flex-col items-center text-center">
              <FileText size={48} className="text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Documents</h3>
              <p className="text-slate-400 text-sm">Upload a lab report to get instant AI analysis.</p>
            </div>
          ) : (
            reports.map(report => {
              const isExpanded = expandedReport === report.id;
              const aiData = report.ai_analysis;
              
              return (
                <div key={report.id} className="glass-card rounded-2xl overflow-hidden transition-all">
                  <div 
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-space-600/50"
                    onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-space-800 border border-white/5 flex items-center justify-center text-teal-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{report.filename}</h3>
                        <p className="text-xs text-slate-400">{new Date(report.uploaded_at).toLocaleDateString()} • {report.visit_id || 'Standalone'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(report.status)}
                      {isExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && aiData && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-space-800/50"
                      >
                        <div className="p-6 space-y-6">
                          <div>
                            <h4 className="text-xs font-bold text-brand-violet uppercase tracking-wider mb-2 flex items-center gap-2"><Brain size={14} /> AI Summary</h4>
                            <p className="text-sm text-slate-300 leading-relaxed bg-space-900/50 p-4 rounded-xl border border-white/5">{aiData.summary}</p>
                          </div>
                          
                          {aiData.abnormal_flags && aiData.abnormal_flags.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2"><AlertCircle size={14} /> Abnormal Flags</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {aiData.abnormal_flags.map((flag, idx) => (
                                  <div key={idx} className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex justify-between items-center">
                                    <span className="text-sm font-bold text-white">{flag.marker}</span>
                                    <div className="text-right">
                                      <span className="block text-sm font-mono text-red-400">{flag.value}</span>
                                      <span className="block text-[10px] text-slate-500">Normal: {flag.normal_range}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {aiData.extracted_values && (
                            <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><CheckCircle2 size={14} /> Key Extracted Values</h4>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(aiData.extracted_values).map(([key, item]) => (
                                  <div key={key} className="px-3 py-1.5 bg-space-900 border border-white/5 rounded-lg flex items-center gap-2">
                                    <span className="text-xs text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                                    <span className={`text-xs font-mono ${getColorClass(item.color)}`}>{item.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default LabReports;
