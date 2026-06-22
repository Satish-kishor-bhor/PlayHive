'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Eye, EyeOff, Trophy, Mail, Lock, User, Phone,
  Loader2, AlertCircle, CheckCircle, Gamepad2, ChevronRight
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  username: z.string().min(3, 'Username must be 3-20 characters').max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscore'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid Indian mobile number').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must have one uppercase letter')
    .regex(/[0-9]/, 'Must have one number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    setIsLoading(true);
    try {
      await axios.post(`${API}/api/v1/auth/register`, {
        email: data.email,
        username: data.username,
        password: data.password,
        displayName: data.displayName,
        phone: data.phone || undefined,
      });
      setRegisteredEmail(data.email);
      setStep('verify');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError('');
    setOtpLoading(true);
    try {
      await axios.post(`${API}/api/v1/auth/verify-email`, { email: registeredEmail, otp });
      setOtpSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setOtpError(err.response?.data?.message || 'Invalid OTP');
      } else {
        setOtpError('Verification failed');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-20" />
      <motion.div
        className="absolute top-1/4 right-1/3 w-80 h-80 rounded-full bg-brand-gold/6 blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="p-3 rounded-2xl bg-brand-gradient shadow-orange-glow group-hover:scale-110 transition-transform">
              <Trophy className="w-7 h-7 text-black" />
            </div>
            <span className="text-3xl font-display font-black text-white">
              PLAY<span className="gradient-text">HIVE</span>
            </span>
          </Link>
          <p className="text-white/40 mt-3 text-sm">Join 50,000+ BGMI players competing for prizes</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card p-8"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-white mb-1">Create your account</h1>
                <p className="text-white/40 text-sm">Free forever. No credit card required.</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/30 mb-6"
                >
                  <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                  <p className="text-danger text-sm">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Display Name + Username Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input {...register('displayName')} placeholder="Dynamo" className={`input pl-10 text-sm ${errors.displayName ? 'border-danger' : ''}`} />
                    </div>
                    {errors.displayName && <p className="text-danger text-xs mt-1">{errors.displayName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Username</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">@</span>
                      <input {...register('username')} placeholder="dynamo_bgmi" className={`input pl-8 text-sm ${errors.username ? 'border-danger' : ''}`} />
                    </div>
                    {errors.username && <p className="text-danger text-xs mt-1">{errors.username.message}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input {...register('email')} type="email" placeholder="you@gmail.com" className={`input pl-10 text-sm ${errors.email ? 'border-danger' : ''}`} autoComplete="email" />
                  </div>
                  {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Mobile Number <span className="text-white/30">(Optional)</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 text-white/40 text-sm border-r border-brand-border pr-2">+91</div>
                    <input {...register('phone')} type="tel" placeholder="9876543210" className={`input pl-20 text-sm ${errors.phone ? 'border-danger' : ''}`} />
                  </div>
                  {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create strong password"
                      className={`input pl-10 pr-10 text-sm ${errors.password ? 'border-danger' : ''}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength indicators */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      {PASSWORD_REQUIREMENTS.map((req) => (
                        <div key={req.label} className="flex items-center gap-2">
                          <CheckCircle className={`w-3 h-3 ${req.test(password) ? 'text-success' : 'text-white/20'}`} />
                          <span className={`text-xs ${req.test(password) ? 'text-success' : 'text-white/30'}`}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input {...register('confirmPassword')} type="password" placeholder="Repeat password" className={`input pl-10 text-sm ${errors.confirmPassword ? 'border-danger' : ''}`} />
                  </div>
                  {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                {/* BGMI notice */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-orange/5 border border-brand-orange/20">
                  <Gamepad2 className="w-4 h-4 text-brand-amber flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/50">
                    You'll link your <strong className="text-white/70">BGMI UID</strong> after registration to unlock paid tournaments and prize withdrawals.
                  </p>
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5 text-base mt-2">
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</>
                  ) : (
                    <>Create Account <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-white/40 mt-6">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-brand-amber hover:text-brand-orange font-medium transition-colors">Sign in</Link>
              </p>
            </motion.div>
          ) : (
            /* ── OTP Verification Step ── */
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card p-8 text-center"
            >
              {otpSuccess ? (
                <div>
                  <div className="w-20 h-20 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-success" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white mb-2">Email Verified! 🎉</h2>
                  <p className="text-white/50 text-sm">Welcome to PlayHive! Redirecting to login...</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-brand-orange/15 border-2 border-brand-orange/40 flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-10 h-10 text-brand-amber" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white mb-2">Check Your Email</h2>
                  <p className="text-white/50 text-sm mb-2">We sent a 6-digit code to</p>
                  <p className="text-brand-amber font-semibold mb-8">{registeredEmail}</p>

                  <div className="mb-6">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="input text-center text-3xl font-mono tracking-widest py-4"
                    />
                    {otpError && <p className="text-danger text-sm mt-2">{otpError}</p>}
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={otp.length !== 6 || otpLoading}
                    className="btn-primary w-full justify-center py-3.5 text-base"
                  >
                    {otpLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : 'Verify & Enter Arena 🎮'}
                  </button>

                  <p className="text-xs text-white/30 mt-4">
                    Didn't receive? Check spam folder. Code expires in 24 hours.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
