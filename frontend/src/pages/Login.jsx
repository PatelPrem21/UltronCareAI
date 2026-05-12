import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { FaGoogle, FaApple } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(
        {
          user_id: data.user_id,
          name: data.name,
          email: formData.email,
          custom_id: data.custom_id,
        },
        data.access_token,
        data.role
      );

      toast.success('Welcome back');

      if (data.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.detail ||
        'Unable to authenticate account.'
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      </div>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-16 z-10">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-8">
              <ShieldCheck size={18} className="text-cyan-400" />
              <span className="text-sm text-slate-300">
                Secure AI Healthcare Platform
              </span>
            </div>

            <h1 className="text-6xl font-bold leading-tight mb-6 tracking-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-cyan-400 to-violet-400 text-transparent bg-clip-text">
                UltronCare
              </span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed mb-10">
              Next-generation intelligent healthcare ecosystem powered by AI,
              predictive diagnostics, and real-time patient intelligence.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
              >
                <h3 className="text-3xl font-bold mb-2">98.2%</h3>
                <p className="text-slate-400 text-sm">
                  AI diagnostic efficiency
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
              >
                <h3 className="text-3xl font-bold mb-2">24/7</h3>
                <p className="text-slate-400 text-sm">
                  Smart patient monitoring
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[32px] p-8 shadow-2xl">
            <div className="mb-10">
              <h2 className="text-4xl font-bold mb-3 tracking-tight">
                Sign in
              </h2>
              <p className="text-slate-400">
                Access your intelligent healthcare workspace.
              </p>
            </div>

            {/* Social Login */}
            <div className="space-y-4 mb-8">
              <button className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 font-medium">
                <FaGoogle className="text-lg" />
                Continue with Google
              </button>

              <button className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 font-medium">
                <FaApple className="text-lg" />
                Continue with Apple
              </button>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#0B1020] text-slate-500">
                  OR CONTINUE WITH EMAIL
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    placeholder="you@example.com"
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black/20 border border-white/10 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-400">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className="w-full h-14 pl-12 pr-14 rounded-2xl bg-black/20 border border-white/10 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 outline-none transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 hover:scale-[1.01] transition-all font-semibold flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(0,255,255,0.15)]"
              >
                {loginMutation.isPending ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Continue
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-8">
              Don’t have an account?{' '}
              <Link
                to="/register"
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
