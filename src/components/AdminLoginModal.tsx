import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Eye, EyeOff, Lock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ORGANIZATION_INFO } from '../data/organization';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const savedPassword = localStorage.getItem('bkn_admin_password') || 'okpl6i=ypFrTbN8e';

    setTimeout(() => {
      if (password.trim() === savedPassword) {
        localStorage.setItem('bkn_admin_auth', 'true');
        setPassword('');
        setErrorMsg(null);
        setIsSubmitting(false);
        onLoginSuccess();
      } else {
        setIsSubmitting(false);
        setErrorMsg('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านผู้ดูแลระบบอีกครั้ง');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
                Security Access
              </span>
              <h3 className="text-lg font-bold text-white">เข้าสู่ระบบหลังบ้าน (Admin Portal)</h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            พื้นที่เฉพาะเจ้าหน้าที่ผู้ดูแลระบบ {ORGANIZATION_INFO.shortName} เพื่อจัดการแผ่นงาน Google ชีต, รายการข้อมูลรายบุคคล และเชื่อมต่อระบบ
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">จำกัดสิทธิ์การเข้าถึงข้อมูล:</span>
              <p className="mt-0.5 text-amber-800">
                ข้อมูลส่วนบุคคลและแผ่นงานเชื่อมโยงถูกจำกัดให้เฉพาะแอดมินดูได้เท่านั้น
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              รหัสผ่านผู้ดูแลระบบ (Admin Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="กรอกรหัสผ่านผู้ดูแลระบบ"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Hint for convenience */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 flex items-center justify-between">
            <span className="text-slate-500">รหัสผ่านผู้ดูแลระบบ:</span>
            <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold text-indigo-700 text-[11px]">
              okpl6i=ypFrTbN8e
            </code>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังตรวจสอบ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>เข้าสู่ระบบหลังบ้าน</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
