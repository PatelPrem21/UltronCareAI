import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Heart, Activity, Droplets, Phone, Pill } from 'lucide-react';
import api from '../api/axios';

const Emergency = () => {
  const { id } = useParams(); // patient custom_id (e.g., PAT-0001)

  const { data: patient, isLoading, isError } = useQuery({
    queryKey: ['emergency', id],
    queryFn: async () => {
      const res = await api.get(`/emergency/${id}`);
      return res.data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin text-danger">
          <AlertTriangle size={48} />
        </div>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={40} />
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Record Not Found</h1>
        <p className="text-text-secondary max-w-md">
          We could not find emergency records for this ID. Please verify the ID and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-danger/20 selection:text-danger">
      {/* High Contrast Header */}
      <header className="bg-danger text-white p-6 md:p-8 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <AlertTriangle size={40} className="animate-pulse" />
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-wider">Emergency Medical Record</h1>
              <p className="font-medium opacity-90 text-lg">{patient.custom_id}</p>
            </div>
          </div>
          <div className="bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/30">
            <p className="text-sm uppercase tracking-wider opacity-90 font-semibold mb-1">Emergency Contact</p>
            <div className="flex items-center gap-2 font-bold text-xl">
              <Phone size={20} />
              {patient.emergency_contact}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
        {/* Patient Identity */}
        <section className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 md:p-8">
          <h2 className="text-4xl font-black mb-2">{patient.name}</h2>
          <div className="flex flex-wrap gap-4 text-xl font-medium text-gray-600">
            <span>Age: {patient.age}</span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Droplets size={24} className="text-danger" fill="currentColor" />
              Blood Type: <span className="font-bold text-gray-900 text-2xl ml-1">{patient.blood_type}</span>
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Critical Conditions */}
          <section className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 text-red-700">
              <Heart size={28} className="fill-red-700" />
              <h3 className="text-2xl font-bold uppercase">Critical Conditions</h3>
            </div>
            {patient.conditions && patient.conditions.length > 0 ? (
              <ul className="space-y-3">
                {patient.conditions.map((condition, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-xl font-bold text-gray-900">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    {condition}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg font-medium text-gray-500 italic">None reported</p>
            )}
          </section>

          {/* Known Allergies */}
          <section className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 text-orange-700">
              <Activity size={28} />
              <h3 className="text-2xl font-bold uppercase">Known Allergies</h3>
            </div>
            {patient.allergies && patient.allergies.length > 0 ? (
              <ul className="space-y-3">
                {patient.allergies.map((allergy, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-xl font-bold text-gray-900">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    {allergy}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg font-medium text-gray-500 italic">None reported</p>
            )}
          </section>
        </div>

        {/* Active Medications */}
        <section className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 text-blue-700">
            <Pill size={28} />
            <h3 className="text-2xl font-bold uppercase">Active Medications</h3>
          </div>
          {patient.active_medications && patient.active_medications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {patient.active_medications.map((med, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                  <div className="font-bold text-xl text-gray-900 mb-1">{med.medicine_name}</div>
                  <div className="text-gray-600 font-medium">
                    {med.dosage} • {med.frequency}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-lg font-medium text-gray-500 italic">No active medications found</p>
          )}
        </section>

      </main>
    </div>
  );
};

export default Emergency;
