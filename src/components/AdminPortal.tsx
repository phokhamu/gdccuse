import React, { useState } from 'react';
import {
  FileSpreadsheet,
  TableProperties,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertCircle,
  Database,
  KeyRound,
  Save,
} from 'lucide-react';
import { DistrictStaff, SchoolStaffRecord, GASConfig, AdminTab } from '../types';
import { GoogleSheetsView } from './GoogleSheetsView';
import { DataTableExport } from './DataTableExport';
import { GASSettingsTab } from './GASSettingsTab';
import { ORGANIZATION_INFO } from '../data/organization';

interface AdminPortalProps {
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  districtStaffList: DistrictStaff[];
  schoolStaffList: SchoolStaffRecord[];
  gasConfig: GASConfig;
  onUpdateGASConfig: (config: GASConfig) => void;
  onRefreshFromServer: () => Promise<void>;
  onRefreshFromGAS?: () => Promise<void>;
  onDeleteDistrictStaff: (id: string) => void;
  onDeleteSchoolStaff: (id: string) => void;
  onBatchDeleteDistrictStaff?: (ids: string[]) => void;
  onBatchDeleteSchoolStaff?: (ids: string[]) => void;
  onEditDistrictStaff: (staff: DistrictStaff) => void;
  onEditSchoolStaff: (staff: SchoolStaffRecord) => void;
  onClearAllData?: () => void;
  onLogoutAdmin: () => void;
  onReturnToUserPortal: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  adminTab,
  setAdminTab,
  districtStaffList,
  schoolStaffList,
  gasConfig,
  onUpdateGASConfig,
  onRefreshFromServer,
  onRefreshFromGAS,
  onDeleteDistrictStaff,
  onDeleteSchoolStaff,
  onBatchDeleteDistrictStaff,
  onBatchDeleteSchoolStaff,
  onEditDistrictStaff,
  onEditSchoolStaff,
  onClearAllData,
  onLogoutAdmin,
  onReturnToUserPortal,
}) => {
  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    const storedPass = localStorage.getItem('bkn_admin_password') || 'okpl6i=ypFrTbN8e';
    if (currentPass !== storedPass) {
      setPassMessage({ type: 'error', text: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
      return;
    }
    if (newPass.length < 4) {
      setPassMessage({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMessage({ type: 'error', text: 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน' });
      return;
    }

    localStorage.setItem('bkn_admin_password', newPass);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setPassMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านผู้ดูแลระบบเรียบร้อยแล้ว!' });
  };

  return (
    <div className="space-y-6">
      {/* Admin Back Office Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  ระบบหลังบ้าน (Back Office)
                </span>
                <span className="text-xs text-slate-400">ระดับสิทธิ์: ผู้ดูแลระบบสูงสุด</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                ศูนย์จัดการข้อมูลและเชื่อมโยงระบบ สพป.บึงกาฬ
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onReturnToUserPortal}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>ดูหน้าบ้าน (ผู้ใช้งานทั่วไป)</span>
            </button>
            <button
              onClick={onLogoutAdmin}
              className="px-3.5 py-2 bg-red-900/60 hover:bg-red-800 text-red-200 hover:text-white text-xs font-semibold rounded-xl border border-red-700/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบหลังบ้าน</span>
            </button>
          </div>
        </div>

        {/* Quick System Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <div className="text-slate-400">ไฟล์ผู้ใช้งานเขต:</div>
            <div className="font-bold text-indigo-300 mt-0.5 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              <span>{districtStaffList.length} รายการ (json)</span>
            </div>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <div className="text-slate-400">ไฟล์โรงเรียนในสังกัด:</div>
            <div className="font-bold text-emerald-300 mt-0.5 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              <span>{schoolStaffList.length} โรงเรียน (json)</span>
            </div>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <div className="text-slate-400">การเชื่อมต่อ Google Sheets:</div>
            <div className="font-bold mt-0.5 flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  gasConfig.webAppUrl ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className={gasConfig.webAppUrl ? 'text-emerald-300' : 'text-amber-300'}>
                {gasConfig.webAppUrl ? 'พร้อมใช้งาน' : 'ยังไม่ได้เชื่อมต่อ'}
              </span>
            </div>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <div className="text-slate-400">สถานะความปลอดภัย:</div>
            <div className="font-bold text-green-400 mt-0.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>แยกสิทธิ์หลังบ้านแล้ว</span>
            </div>
          </div>
        </div>
      </div>

      {/* Back Office Tabs Navigation */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-2">
        <nav className="flex space-x-2 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setAdminTab('sheets-view')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              adminTab === 'sheets-view'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google ชีต (แผ่นงานในระบบ)</span>
          </button>

          <button
            onClick={() => setAdminTab('data-list')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              adminTab === 'data-list'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>จัดการ & ลบข้อมูล / ส่งออก</span>
          </button>

          <button
            onClick={() => setAdminTab('gas-settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              adminTab === 'gas-settings'
                ? 'bg-teal-700 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>เชื่อมต่อ Apps Script (GAS)</span>
          </button>

          <button
            onClick={() => setAdminTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              adminTab === 'security'
                ? 'bg-indigo-700 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>ความปลอดภัย & รหัสผ่าน</span>
          </button>
        </nav>
      </div>

      {/* Tab Contents */}
      {adminTab === 'sheets-view' && (
        <GoogleSheetsView
          districtStaffList={districtStaffList}
          schoolStaffList={schoolStaffList}
          gasConfig={gasConfig}
          onRefreshFromServer={onRefreshFromServer}
          onRefreshFromGAS={onRefreshFromGAS}
          onEditSchoolStaff={onEditSchoolStaff}
          onEditDistrictStaff={onEditDistrictStaff}
          onDeleteSchoolStaff={onDeleteSchoolStaff}
          onDeleteDistrictStaff={onDeleteDistrictStaff}
        />
      )}

      {adminTab === 'data-list' && (
        <DataTableExport
          districtStaffList={districtStaffList}
          schoolStaffList={schoolStaffList}
          onDeleteDistrictStaff={onDeleteDistrictStaff}
          onDeleteSchoolStaff={onDeleteSchoolStaff}
          onBatchDeleteDistrictStaff={onBatchDeleteDistrictStaff}
          onBatchDeleteSchoolStaff={onBatchDeleteSchoolStaff}
          onEditDistrictStaff={onEditDistrictStaff}
          onEditSchoolStaff={onEditSchoolStaff}
          onClearAllData={onClearAllData}
        />
      )}

      {adminTab === 'gas-settings' && (
        <GASSettingsTab
          gasConfig={gasConfig}
          onUpdateConfig={onUpdateGASConfig}
          districtStaffList={districtStaffList}
          schoolStaffList={schoolStaffList}
          onRefreshFromGAS={onRefreshFromGAS}
        />
      )}

      {adminTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                ตั้งค่ารหัสผ่านผู้ดูแลระบบ (Admin Password)
              </h3>
              <p className="text-xs text-slate-500">
                ใช้สำหรับป้องกันการเข้าถึงแผ่นงาน Google ชีต และข้อมูลส่วนบุคคลในระบบหลังบ้าน
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสผ่านปัจจุบัน
              </label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="ระบุรหัสผ่านเดิม"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสผ่านใหม่
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="กำหนดรหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ยืนยันรหัสผ่านใหม่
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {passMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  passMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {passMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{passMessage.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกรหัสผ่านใหม่</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
