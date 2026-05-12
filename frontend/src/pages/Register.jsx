import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';

import {
  User,
  Mail,
  Lock,
  Stethoscope,
  HeartPulse,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

import { FaGoogle, FaApple } from 'react-icons/fa';

import toast from 'react-hot-toast';
import api from '../api/axios';

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
  });

  const [patientData, setPatientData] = useState({
    age: '',
    blood_type: 'A+',
  });

  const [doctorData, setDoctorData] = useState({
    specialization: '',
    hospital: '',
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/auth/register', data);
      return res.data;
    },

    onSuccess: () => {
      toast.success('Account created successfully');
      navigate('/login');
    },

    onError: (err) => {
      toast.error(
        err.response?.data?.detail || 'Registration failed'
      );
    },
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...authData,
      ...(authData.role === 'patient'
        ? patientData
        : doctorData),
    };

    registerMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex overflow-hidden relative">

      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      </div>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-16 z-10">

        <div className="max-w-xl">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-8">
              <ShieldCheck
                size={18}
                className="text-cyan-400"
              />

              <span className="text-sm text-slate-300">
                Intelligent Healthcare Platform
              </span>
            </div>

            <h1 className="text-6xl font-bold leading-tight mb-6 tracking-tight">
              Create Your
              <span className="block bg-gradient-to-r from-cyan-400 to-violet-400 text-transparent bg-clip-text">
                UltronCare ID
              </span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed mb-10">
              Join the future of AI-powered healthcare
              and intelligent patient systems.
            </p>

            <div className="space-y-4">

              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-xl">
                <h3 className="font-semibold mb-1">
                  AI Diagnostics
                </h3>

                <p className="text-slate-400 text-sm">
                  Predictive healthcare intelligence.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-xl">
                <h3 className="font-semibold mb-1">
                  Secure Infrastructure
                </h3>

                <p className="text-slate-400 text-sm">
                  Enterprise-grade encrypted systems.
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >

          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[32px] p-8 shadow-2xl">

            {/* HEADER */}
            <div className="mb-8">

              <h2 className="text-4xl font-bold tracking-tight mb-2">
                Create Account
              </h2>

              <p className="text-slate-400">
                Join the future of healthcare.
              </p>

            </div>

            {/* PROGRESS */}
            <div className="flex items-center gap-3 mb-10">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`h-2 flex-1 rounded-full transition-all ${step >= item
                      ? 'bg-gradient-to-r from-cyan-400 to-violet-400'
                      : 'bg-white/10'
                    }`}
                />
              ))}

            </div>

            <AnimatePresence mode="wait">

              {/* STEP 1 */}
              {step === 1 && (

                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-6"
                >

                  <button className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 font-medium">
                    <FaGoogle />
                    Continue with Google
                  </button>

                  <button className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 font-medium">
                    <FaApple />
                    Continue with Apple
                  </button>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">
                      Full Name
                    </label>

                    <div className="relative">

                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type="text"
                        value={authData.name}
                        onChange={(e) =>
                          setAuthData({
                            ...authData,
                            name: e.target.value,
                          })
                        }
                        className="w-full h-14 pl-12 rounded-2xl bg-black/20 border border-white/10 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">
                      Email Address
                    </label>

                    <div className="relative">

                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type="email"
                        value={authData.email}
                        onChange={(e) =>
                          setAuthData({
                            ...authData,
                            email: e.target.value,
                          })
                        }
                        className="w-full h-14 pl-12 rounded-2xl bg-black/20 border border-white/10 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 outline-none"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">
                      Password
                    </label>

                    <div className="relative">

                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={authData.password}
                        onChange={(e) =>
                          setAuthData({
                            ...authData,
                            password: e.target.value,
                          })
                        }
                        className="w-full h-14 pl-12 pr-14 rounded-2xl bg-black/20 border border-white/10 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 outline-none"
                        placeholder="••••••••"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={nextStep}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 font-semibold flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight size={18} />
                  </button>

                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (

                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-6"
                >

                  <div>

                    <h3 className="text-2xl font-semibold mb-2">
                      Choose Role
                    </h3>

                    <p className="text-slate-400">
                      Select how you want to use UltronCare.
                    </p>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <button
                      type="button"
                      onClick={() =>
                        setAuthData({
                          ...authData,
                          role: 'patient',
                        })
                      }
                      className={`p-8 rounded-3xl border transition-all text-left ${authData.role === 'patient'
                          ? 'border-cyan-400 bg-cyan-500/10'
                          : 'border-white/10 bg-white/5'
                        }`}
                    >

                      <HeartPulse
                        className="mb-5 text-cyan-400"
                        size={36}
                      />

                      <h4 className="text-xl font-semibold mb-2">
                        Patient
                      </h4>

                      <p className="text-slate-400 text-sm">
                        Smart monitoring and AI healthcare support.
                      </p>

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAuthData({
                          ...authData,
                          role: 'doctor',
                        })
                      }
                      className={`p-8 rounded-3xl border transition-all text-left ${authData.role === 'doctor'
                          ? 'border-violet-400 bg-violet-500/10'
                          : 'border-white/10 bg-white/5'
                        }`}
                    >

                      <Stethoscope
                        className="mb-5 text-violet-400"
                        size={36}
                      />

                      <h4 className="text-xl font-semibold mb-2">
                        Doctor
                      </h4>

                      <p className="text-slate-400 text-sm">
                        AI-assisted diagnostics and patient management.
                      </p>

                    </button>

                  </div>

                  <div className="flex items-center justify-between pt-4">

                    <button
                      onClick={prevStep}
                      className="flex items-center gap-2 text-slate-400 hover:text-white"
                    >
                      <ArrowLeft size={18} />
                      Back
                    </button>

                    <button
                      onClick={nextStep}
                      className="px-6 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 font-semibold flex items-center gap-2"
                    >
                      Continue
                      <ArrowRight size={18} />
                    </button>

                  </div>

                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 3 && (

                <motion.form
                  key="step3"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-6"
                >

                  {authData.role === 'patient' ? (
                    <>
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">
                          Age
                        </label>

                        <input
                          type="number"
                          value={patientData.age}
                          onChange={(e) =>
                            setPatientData({
                              ...patientData,
                              age: e.target.value,
                            })
                          }
                          className="w-full h-14 px-5 rounded-2xl bg-black/20 border border-white/10"
                          placeholder="25"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">
                          Blood Type
                        </label>

                        <select
                          value={patientData.blood_type}
                          onChange={(e) =>
                            setPatientData({
                              ...patientData,
                              blood_type: e.target.value,
                            })
                          }
                          className="w-full h-14 px-5 rounded-2xl bg-black/20 border border-white/10"
                        >
                          {[
                            'A+',
                            'A-',
                            'B+',
                            'B-',
                            'AB+',
                            'AB-',
                            'O+',
                            'O-',
                          ].map((type) => (
                            <option key={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">
                          Specialization
                        </label>

                        <input
                          type="text"
                          value={doctorData.specialization}
                          onChange={(e) =>
                            setDoctorData({
                              ...doctorData,
                              specialization: e.target.value,
                            })
                          }
                          className="w-full h-14 px-5 rounded-2xl bg-black/20 border border-white/10"
                          placeholder="Cardiology"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">
                          Hospital
                        </label>

                        <input
                          type="text"
                          value={doctorData.hospital}
                          onChange={(e) =>
                            setDoctorData({
                              ...doctorData,
                              hospital: e.target.value,
                            })
                          }
                          className="w-full h-14 px-5 rounded-2xl bg-black/20 border border-white/10"
                          placeholder="Apollo Hospital"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between pt-4">

                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center gap-2 text-slate-400 hover:text-white"
                    >
                      <ArrowLeft size={18} />
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="px-8 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 font-semibold flex items-center gap-2"
                    >

                      {registerMutation.isPending ? (
                        <Loader2
                          className="animate-spin"
                          size={18}
                        />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight size={18} />
                        </>
                      )}

                    </button>
                  </div>

                </motion.form>
              )}

            </AnimatePresence>

            <p className="text-center text-slate-500 text-sm mt-8">
              Already have an account?{' '}

              <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300"
              >
                Sign In
              </Link>
            </p>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;