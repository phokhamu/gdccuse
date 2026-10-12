import React from 'react';
import { ORGANIZATION_INFO } from '../data/organization';
import { GASConfig, UserTab, AdminTab } from '../types';
import {
  Building2,
  School,
  LayoutDashboard,
  ShieldCheck,
  Lock,
  ShieldAlert,
  ArrowRight,
  LogOut,
  FileSpreadsheet,
  TableProperties,
  Settings,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  currentPortal: 'user' | 'admin';
  activeUserTab: UserTab;
  setActiveUserTab: (tab: UserTab) => void;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  gasConfig: GASConfig;
  districtStaffCount: number;
  schoolStaffCount: number;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onSwitchToAdmin: () => void;
  onSwitchToUser: () => void;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPortal,
  activeUserTab,
  setActiveUserTab,
  activeAdminTab,
  setActiveAdminTab,
  gasConfig,
  districtStaffCount,
  schoolStaffCount,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onSwitchToAdmin,
  onSwitchToUser,
  onLogoutAdmin,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Bar with Ministry & Organization Identity */}
      <div className="bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950 text-white px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-sky-200 font-semibold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-400/20">
                  สพป.บึงกาฬ • จ.บึงกาฬ
                </span>
                <span className="text-xs text-blue-200 hidden sm:inline">
                  {ORGANIZATION_INFO.ministry}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
                {ORGANIZATION_INFO.name}
              </h1>
            </div>
          </div>

          {/* Quick Metrics & Admin Entry Button */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="hidden lg:flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-white/10">
              <span className="text-slate-300">โรงเรียนเป้าหมาย:</span>
              <span className="font-semibold text-yellow-300">{ORGANIZATION_INFO.totalSchools} โรงเรียน</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-white/10">
              <span className="text-slate-300">บุคลากร รร.:</span>
              <span className="font-semibold text-emerald-300">
                {schoolStaffCount}/{ORGANIZATION_INFO.totalTargetSchoolStaff}
              </span>
            </div>

            {/* Admin Switcher / Login Button */}
            {currentPortal === 'user' ? (
              isAdminLoggedIn ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onSwitchToAdmin}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-900" />
                    <span>เข้าสู่ระบบหลังบ้าน</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onLogoutAdmin}
                    title="ออกจากระบบแอดมิน"
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAdminLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-medium text-xs rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>เข้าสู่ระบบหลังบ้าน (Admin)</span>
                </button>
              )
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded">
                  โหมดหลังบ้าน (Admin)
                </span>
                <button
                  onClick={onSwitchToUser}
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>กลับหน้าบ้าน</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Mode Warning or User Security Notice */}
      {currentPortal === 'admin' ? (
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2 text-xs text-amber-300 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>พื้นที่เฉพาะผู้ดูแลระบบ:</strong> หน้าแผ่นงาน Google ชีต, รายการข้อมูลรายบุคคล, และการเชื่อมต่อ Apps Script ถูกจำกัดสิทธิ์ไว้ที่นี่
              </span>
            </div>
            <button
              onClick={onLogoutAdmin}
              className="text-red-300 hover:text-red-200 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border-b border-amber-200/70 px-4 sm:px-6 py-1.5 text-xs text-amber-900">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <p className="truncate">
                <span className="font-semibold">ระบบหน้าบ้าน (ผู้ใช้งานทั่วไป):</span> กรอกข้อมูลโรงเรียนและเขต พร้อมติดตามสรุปความคืบหน้าภาพรวม
              </p>
            </div>
            <button
              onClick={isAdminLoggedIn ? onSwitchToAdmin : onOpenAdminLogin}
              className="text-indigo-800 hover:text-indigo-950 font-bold shrink-0 underline decoration-indigo-300 text-xs cursor-pointer ml-2"
            >
              {isAdminLoggedIn ? 'ไปที่ระบบหลังบ้าน ➔' : 'เจ้าหน้าที่เขตเข้าสู่ระบบหลังบ้าน ➔'}
            </button>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {currentPortal === 'user' ? (
          /* USER TABS (หน้าบ้าน - ไม่เห็นแผ่นงาน, ไม่เห็นส่งออก, ไม่เห็น Apps Script) */
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar text-sm font-medium">
            <button
              onClick={() => setActiveUserTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                activeUserTab === 'dashboard'
                  ? 'bg-blue-700 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>แดชบอร์ดสรุปผลภาพรวม</span>
            </button>

            <button
              onClick={() => setActiveUserTab('school-form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                activeUserTab === 'school-form'
                  ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <School className="w-4 h-4" />
              <span>กรอกข้อมูลโรงเรียน (กรองตามกลุ่ม)</span>
            </button>

            <button
              onClick={() => setActiveUserTab('district-form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                activeUserTab === 'district-form'
                  ? 'bg-indigo-700 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>กรอกข้อมูลผู้ใช้งานเขต</span>
            </button>
          </nav>
        ) : (
          /* ADMIN TABS (หลังบ้าน - แผ่นงาน Google ชีต, รายการข้อมูล / ส่งออก, เชื่อมต่อ GAS) */
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar text-sm font-medium">
            <button
              onClick={() => setActiveAdminTab('sheets-view')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                activeAdminTab === 'sheets-view'
                  ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Google ชีต (แผ่นงานในระบบ)</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('data-list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                activeAdminTab === 'data-list'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TableProperties className="w-4 h-4" />
              <span>รายการข้อมูล / ส่งออก</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('gas-settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                activeAdminTab === 'gas-settings'
                  ? 'bg-teal-700 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>เชื่อมต่อ Apps Script (GAS)</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('security')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                activeAdminTab === 'security'
                  ? 'bg-indigo-700 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>ความปลอดภัย & รหัสผ่าน</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
