import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, X, Check, ArrowRight, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string) => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync mode with initialMode on open
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setEmail('');
      setPassword('');
      setName('');
      setSuccess(false);
    }
  }, [isOpen, initialMode]);

  // Simple LocalStorage User Database Simulation
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      try {
        if (!email || !password) {
          setError('이메일과 비밀번호를 모두 입력해주세요.');
          setIsLoading(false);
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setError('올바른 이메일 형식이 아닙니다.');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('비밀번호는 최소 6자리 이상이어야 합니다.');
          setIsLoading(false);
          return;
        }

        const usersKey = 'yaskytrip_registered_users';
        const usersRaw = localStorage.getItem(usersKey);
        const users: { email: string; password: string; name: string }[] = usersRaw ? JSON.parse(usersRaw) : [];

        if (mode === 'signup') {
          if (!name) {
            setError('이름을 입력해주세요.');
            setIsLoading(false);
            return;
          }

          const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (existingUser) {
            setError('이미 등록된 이메일 주소입니다.');
            setIsLoading(false);
            return;
          }

          const newUser = { email: email.toLowerCase(), password, name };
          users.push(newUser);
          localStorage.setItem(usersKey, JSON.stringify(users));

          setSuccess(true);
          setTimeout(() => {
            onAuthSuccess(email.toLowerCase());
            setIsLoading(false);
            setSuccess(false);
            onClose();
          }, 1500);

        } else {
          // Login
          const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (!user || user.password !== password) {
            // Also accept a default demo login to make it smooth
            if (email.toLowerCase() === 'koreapaik@gmail.com' && password === '123456') {
              // Standard admin/demo user bypass
            } else {
              setError('이메일 주소 또는 비밀번호가 올바르지 않습니다.');
              setIsLoading(false);
              return;
            }
          }

          setSuccess(true);
          setTimeout(() => {
            onAuthSuccess(email.toLowerCase());
            setIsLoading(false);
            setSuccess(false);
            onClose();
          }, 1500);
        }
      } catch (err) {
        setError('인증 도중 에러가 발생했습니다.');
        setIsLoading(false);
      }
    }, 1200);
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" id="auth-modal-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md overflow-hidden bg-white rounded-3xl shadow-2xl border border-slate-100"
          id="auth-modal-card"
        >
          {/* Header background decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50 cursor-pointer"
            id="auth-modal-close-btn"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8 pt-10">
            {/* Title */}
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold tracking-wider mb-2">
                YASKYTRIP
              </span>
              <h3 className="text-xl font-bold text-slate-800" id="auth-modal-title">
                {mode === 'login' ? '로그인하기' : '회원가입하기'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login' 
                  ? '야스키트립에서 완벽한 여행 상품을 예약하세요.' 
                  : '회원이 되시면 더 많은 혜택과 맞춤 추천을 드립니다.'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600"
                id="auth-error"
              >
                {error}
              </motion.div>
            )}

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
                id="auth-success-screen"
              >
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-bold text-slate-800">
                  {mode === 'login' ? '성공적으로 로그인되었습니다.' : '회원가입이 완료되었습니다!'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">잠시 후 메인 화면으로 이동합니다.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4" id="auth-form">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">이름</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="홍길동"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/75 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-hidden text-slate-800 font-medium"
                        id="auth-input-name"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600">이메일 주소</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/75 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-hidden text-slate-800 font-medium"
                      id="auth-input-email"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600">비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/75 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-hidden text-slate-800 font-medium"
                      id="auth-input-password"
                      disabled={isLoading}
                    />
                  </div>
                  {mode === 'login' && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 hover:text-blue-500 cursor-pointer">비밀번호를 잊으셨나요?</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center space-x-2 mt-6 cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
                  id="auth-submit-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>처리 중...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'login' ? '로그인' : '회원가입하기'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Toggle Mode Footer */}
            {!success && (
              <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                {mode === 'login' ? '아직 회원이 아니신가요?' : '이미 계정이 있으신가요?'}
                <button
                  onClick={toggleMode}
                  className="text-blue-600 font-semibold ml-1.5 hover:underline focus:outline-hidden cursor-pointer"
                  id="auth-toggle-mode-btn"
                  disabled={isLoading}
                >
                  {mode === 'login' ? '회원가입' : '로그인하기'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
