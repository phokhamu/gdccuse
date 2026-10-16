/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SchoolForm } from './components/SchoolForm';
import { DistrictStaffForm } from './components/DistrictStaffForm';
import { AdminPortal } from './components/AdminPortal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { DistrictStaff, SchoolStaffRecord, GASConfig, UserTab, AdminTab } from './types';
import {
  loadDistrictStaffFromStorage,
  saveDistrictStaffToStorage,
  loadSchoolStaffFromStorage,
  saveSchoolStaffToStorage,
  loadGASConfig,
  saveGASConfig,
  loadAllFromServer,
  syncAllToServer,
  deleteDistrictStaffFromServer,
  deleteSchoolStaffFromServer,
  batchDeleteFromServer,
  loadDataFromGAS,
  deleteDistrictStaffFromGAS,
  deleteSchoolStaffFromGAS,
  isStaticHosting,
} from './utils/gasService';
import { ORGANIZATION_INFO } from './data/organization';
import { ALL_SCHOOLS } from './data/schoolsData';
import { ArrowLeft, ShieldCheck, RefreshCw, ExternalLink, FileSpreadsheet } from 'lucide-react';

export default function App() {
  // Navigation & Portal states
  const [currentPortal, setCurrentPortal] = useState<'user' | 'admin'>('user');
  const [activeUserTab, setActiveUserTab] = useState<UserTab>('dashboard');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('sheets-view');

  // Admin Auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('bkn_admin_auth') === 'true';
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  // State data
  const [districtStaffList, setDistrictStaffList] = useState<DistrictStaff[]>([]);
  const [schoolStaffList, setSchoolStaffList] = useState<SchoolStaffRecord[]>([]);
  const [gasConfig, setGasConfig] = useState<GASConfig>({
    webAppUrl: '',
    autoSync: false,
    connected: false,
  });

  // Navigation & Editing states
  const [targetSchoolIdForForm, setTargetSchoolIdForForm] = useState<string | undefined>();
  const [editingDistrictStaff, setEditingDistrictStaff] = useState<DistrictStaff | null>(null);
  const [isEditingFromAdmin, setIsEditingFromAdmin] = useState<boolean>(false);

  const [isSyncingGAS, setIsSyncingGAS] = useState<boolean>(false);
  const [gasSyncStatus, setGasSyncStatus] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Verified School IDs for SMIS unlocking (แนวทางที่ 1 • รหัสแบบ A)
  const [verifiedSchoolIds, setVerifiedSchoolIds] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem('bkn_verified_schools');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleVerifySchool = (schoolId: string) => {
    setVerifiedSchoolIds((prev) => {
      const next = new Set(prev);
      next.add(schoolId);
      try {
        sessionStorage.setItem('bkn_verified_schools', JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  // Function to refresh from Google Apps Script
  const handleRefreshFromGAS = async (showBanner = true) => {
    if (!gasConfig.webAppUrl) {
      if (showBanner) {
        setGasSyncStatus('ยังไม่ได้ระบุ Google Apps Script Web App URL');
        setTimeout(() => setGasSyncStatus(null), 4000);
      }
      return;
    }
    setIsSyncingGAS(true);
    if (showBanner) setGasSyncStatus(null);
    try {
      const gasData = await loadDataFromGAS(gasConfig.webAppUrl);
      if (gasData) {
        setDistrictStaffList(gasData.districtStaff);
        setSchoolStaffList(gasData.schoolStaff);
        saveDistrictStaffToStorage(gasData.districtStaff);
        saveSchoolStaffToStorage(gasData.schoolStaff);
        const timeStr = new Date().toLocaleTimeString('th-TH');
        setLastSyncTime(timeStr);
        if (showBanner) {
          setGasSyncStatus(`ดึงข้อมูลจาก Google Sheets สำเร็จ! (${gasData.districtStaff.length} ผู้ใช้งานเขต, ${gasData.schoolStaff.length} โรงเรียน)`);
        }
      } else if (showBanner) {
        setGasSyncStatus('ไม่สามารถดึงข้อมูลจาก Google Sheets ได้ โปรดตรวจสอบ Web App URL');
      }
    } catch {
      if (showBanner) {
        setGasSyncStatus('เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets');
      }
    } finally {
      setIsSyncingGAS(false);
      if (showBanner) {
        setTimeout(() => setGasSyncStatus(null), 5000);
      }
    }
  };

  // Load from Google Sheets immediately on page load
  useEffect(() => {
    async function initData() {
      const config = loadGASConfig();
      setGasConfig(config);

      // 1. Immediately show cached data so UI is instantly visible
      const dStaff = loadDistrictStaffFromStorage();
      const sStaff = loadSchoolStaffFromStorage();
      if (dStaff.length > 0 || sStaff.length > 0) {
        setDistrictStaffList(dStaff);
        setSchoolStaffList(sStaff);
      }

      // 2. Fetch fresh data directly from Google Sheets immediately on page access
      if (config.webAppUrl) {
        setIsSyncingGAS(true);
        try {
          const gasData = await loadDataFromGAS(config.webAppUrl);
          if (gasData) {
            setDistrictStaffList(gasData.districtStaff);
            setSchoolStaffList(gasData.schoolStaff);
            saveDistrictStaffToStorage(gasData.districtStaff);
            saveSchoolStaffToStorage(gasData.schoolStaff);
            setLastSyncTime(new Date().toLocaleTimeString('th-TH'));
            setIsSyncingGAS(false);
            return;
          }
        } catch (e) {
          console.warn('Initial GAS load failed:', e);
        } finally {
          setIsSyncingGAS(false);
        }
      }

      // 3. Fallback to server if GAS is not configured or failed
      const serverData = await loadAllFromServer();
      if (serverData && (serverData.districtStaff.length > 0 || serverData.schoolStaff.length > 0)) {
        setDistrictStaffList(serverData.districtStaff);
        setSchoolStaffList(serverData.schoolStaff);
        saveDistrictStaffToStorage(serverData.districtStaff);
        saveSchoolStaffToStorage(serverData.schoolStaff);
      }
    }
    initData();
  }, []);

  // When viewing/switching to Dashboard, auto-fetch latest Google Sheets data
  useEffect(() => {
    if (activeUserTab === 'dashboard' && currentPortal === 'user' && gasConfig.webAppUrl) {
      handleRefreshFromGAS(false);
    }
  }, [activeUserTab, currentPortal, gasConfig.webAppUrl]);

  const handleRefreshFromServer = async () => {
    const serverData = await loadAllFromServer();
    if (serverData) {
      setDistrictStaffList(serverData.districtStaff);
      setSchoolStaffList(serverData.schoolStaff);
      saveDistrictStaffToStorage(serverData.districtStaff);
      saveSchoolStaffToStorage(serverData.schoolStaff);
      return;
    }
    // If server is not present (GitHub Pages), refresh from GAS
    if (gasConfig.webAppUrl) {
      await handleRefreshFromGAS(true);
    }
  };

  // Save changes to district staff
  const handleSaveDistrictStaff = (newOrUpdated: DistrictStaff) => {
    setDistrictStaffList((prev) => {
      const index = prev.findIndex((s) => s.id === newOrUpdated.id);
      let updated: DistrictStaff[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = newOrUpdated;
      } else {
        updated = [newOrUpdated, ...prev];
      }
      saveDistrictStaffToStorage(updated);
      return updated;
    });
    setEditingDistrictStaff(null);
    if (isEditingFromAdmin) {
      setCurrentPortal('admin');
      setIsEditingFromAdmin(false);
    }
  };

  // Save changes to school staff
  const handleSaveSchoolStaff = (newOrUpdated: SchoolStaffRecord) => {
    setSchoolStaffList((prev) => {
      const index = prev.findIndex(
        (s) =>
          s.id === newOrUpdated.id ||
          (newOrUpdated.schoolId && s.schoolId === newOrUpdated.schoolId) ||
          (s.schoolName === newOrUpdated.schoolName)
      );
      let updated: SchoolStaffRecord[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = newOrUpdated;
      } else {
        updated = [newOrUpdated, ...prev];
      }
      saveSchoolStaffToStorage(updated);
      return updated;
    });
    if (isEditingFromAdmin) {
      setCurrentPortal('admin');
      setIsEditingFromAdmin(false);
    }
  };

  // Delete actions (Admin only)
  const handleDeleteDistrictStaff = (id: string) => {
    const itemToDelete = districtStaffList.find((s) => s.id === id);
    setDistrictStaffList((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveDistrictStaffToStorage(updated);
      deleteDistrictStaffFromServer(id);
      return updated;
    });
    if (gasConfig.webAppUrl && itemToDelete) {
      deleteDistrictStaffFromGAS(itemToDelete, gasConfig.webAppUrl);
    }
  };

  const handleDeleteSchoolStaff = (id: string) => {
    const itemToDelete = schoolStaffList.find((s) => s.id === id);
    setSchoolStaffList((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSchoolStaffToStorage(updated);
      deleteSchoolStaffFromServer(id);
      return updated;
    });
    if (gasConfig.webAppUrl && itemToDelete) {
      deleteSchoolStaffFromGAS(itemToDelete, gasConfig.webAppUrl);
    }
  };

  const handleBatchDeleteDistrictStaff = (ids: string[]) => {
    const idSet = new Set(ids);
    const itemsToDelete = districtStaffList.filter((s) => idSet.has(s.id));
    setDistrictStaffList((prev) => {
      const updated = prev.filter((s) => !idSet.has(s.id));
      saveDistrictStaffToStorage(updated);
      batchDeleteFromServer('district', ids);
      return updated;
    });
    if (gasConfig.webAppUrl) {
      itemsToDelete.forEach((item) => deleteDistrictStaffFromGAS(item, gasConfig.webAppUrl));
    }
  };

  const handleBatchDeleteSchoolStaff = (ids: string[]) => {
    const idSet = new Set(ids);
    const itemsToDelete = schoolStaffList.filter((s) => idSet.has(s.id));
    setSchoolStaffList((prev) => {
      const updated = prev.filter((s) => !idSet.has(s.id));
      saveSchoolStaffToStorage(updated);
      batchDeleteFromServer('school', ids);
      return updated;
    });
    if (gasConfig.webAppUrl) {
      itemsToDelete.forEach((item) => deleteSchoolStaffFromGAS(item, gasConfig.webAppUrl));
    }
  };

  const handleClearAllData = async () => {
    setDistrictStaffList([]);
    setSchoolStaffList([]);
    saveDistrictStaffToStorage([]);
    saveSchoolStaffToStorage([]);
    await syncAllToServer([], []);
  };

  // Edit actions initiated from Back Office
  const handleEditDistrictStaff = (staff: DistrictStaff) => {
    setEditingDistrictStaff(staff);
    setIsEditingFromAdmin(true);
    setCurrentPortal('user');
    setActiveUserTab('district-form');
  };

  const handleEditSchoolStaff = (staff: SchoolStaffRecord) => {
    setTargetSchoolIdForForm(staff.schoolId);
    setIsEditingFromAdmin(true);
    setCurrentPortal('user');
    setActiveUserTab('school-form');
  };

  // User form navigation
  const handleNavigateToSchoolForm = (schoolId?: string) => {
    setTargetSchoolIdForForm(schoolId);
    setCurrentPortal('user');
    setActiveUserTab('school-form');
  };

  const handleNavigateToDistrictForm = () => {
    setEditingDistrictStaff(null);
    setCurrentPortal('user');
    setActiveUserTab('district-form');
  };

  // Update GAS config
  const handleUpdateGASConfig = (newConfig: GASConfig) => {
    setGasConfig(newConfig);
    saveGASConfig(newConfig);
  };

  // Admin Auth Handlers
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setShowAdminLoginModal(false);
    setCurrentPortal('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('bkn_admin_auth');
    setIsAdminLoggedIn(false);
    setCurrentPortal('user');
    setActiveUserTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        currentPortal={currentPortal}
        activeUserTab={activeUserTab}
        setActiveUserTab={setActiveUserTab}
        activeAdminTab={activeAdminTab}
        setActiveAdminTab={setActiveAdminTab}
        gasConfig={gasConfig}
        districtStaffCount={districtStaffList.length}
        schoolStaffCount={schoolStaffList.length}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        onSwitchToAdmin={() => {
          if (isAdminLoggedIn) {
            setCurrentPortal('admin');
          } else {
            setShowAdminLoginModal(true);
          }
        }}
        onSwitchToUser={() => setCurrentPortal('user')}
        onLogoutAdmin={handleAdminLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Banner for Google Sheets Sync Status */}
        {gasSyncStatus && (
          <div className="mb-4 bg-teal-50 border border-teal-300 rounded-xl p-3 flex items-center justify-between text-xs text-teal-900 animate-fadeIn">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-700 shrink-0" />
              <span className="font-semibold">{gasSyncStatus}</span>
            </div>
          </div>
        )}

        {/* Cloud Google Sheets Mode Banner */}
        {gasConfig.webAppUrl ? (
          <div className="mb-4 bg-teal-50/70 border border-teal-200/80 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-teal-900 font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>ระบบเชื่อมต่อบันทึกข้อมูลเข้า Google Sheets แบบ Cloud Database เรียบร้อยแล้ว</span>
            </div>
            <button
              onClick={() => handleRefreshFromGAS(true)}
              disabled={isSyncingGAS}
              className="flex items-center gap-1.5 font-bold text-teal-800 hover:text-teal-950 bg-white px-3 py-1.5 rounded-lg border border-teal-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer self-start sm:self-auto disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGAS ? 'animate-spin' : ''}`} />
              <span>{isSyncingGAS ? 'กำลังดึงข้อมูล...' : 'ดึงข้อมูลล่าสุดจาก Sheets'}</span>
            </button>
          </div>
        ) : isStaticHosting() ? (
          <div className="mb-4 bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <span><strong>คำแนะนำ GitHub Pages:</strong> ต้องการให้ข้อมูลบันทึกลงใน Google Sheet เพื่อให้ทุกคนเห็นข้อมูลเดียวกัน โปรดตั้งค่า Web App URL ที่เมนู "ตั้งค่า Google Sheets" ในระบบหลังบ้าน หรือใส่ใน <code className="font-mono bg-amber-100 px-1 rounded">src/config/gasConfig.ts</code></span>
            </div>
            <button
              onClick={() => {
                if (isAdminLoggedIn) {
                  setCurrentPortal('admin');
                  setActiveAdminTab('gas-settings');
                } else {
                  setShowAdminLoginModal(true);
                }
              }}
              className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
            >
              ไปตั้งค่า Google Sheets
            </button>
          </div>
        ) : null}

        {/* Banner if editing from admin portal */}
        {isEditingFromAdmin && currentPortal === 'user' && (
          <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>โหมดแก้ไขข้อมูลจากระบบหลังบ้าน (เมื่อบันทึกเสร็จระบบจะนำกลับไปยังหลังบ้าน)</span>
            </div>
            <button
              onClick={() => {
                setIsEditingFromAdmin(false);
                setCurrentPortal('admin');
              }}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ยกเลิกและกลับหลังบ้าน</span>
            </button>
          </div>
        )}

        {/* Portal Routing */}
        {currentPortal === 'admin' ? (
          /* BACK OFFICE (ADMIN PORTAL): Google Sheets View, Data Management/Export, GAS Settings, Security */
          <AdminPortal
            adminTab={activeAdminTab}
            setAdminTab={setActiveAdminTab}
            districtStaffList={districtStaffList}
            schoolStaffList={schoolStaffList}
            gasConfig={gasConfig}
            onUpdateGASConfig={handleUpdateGASConfig}
            onRefreshFromServer={handleRefreshFromServer}
            onRefreshFromGAS={handleRefreshFromGAS}
            onDeleteDistrictStaff={handleDeleteDistrictStaff}
            onDeleteSchoolStaff={handleDeleteSchoolStaff}
            onBatchDeleteDistrictStaff={handleBatchDeleteDistrictStaff}
            onBatchDeleteSchoolStaff={handleBatchDeleteSchoolStaff}
            onEditDistrictStaff={handleEditDistrictStaff}
            onEditSchoolStaff={handleEditSchoolStaff}
            onClearAllData={handleClearAllData}
            onLogoutAdmin={handleAdminLogout}
            onReturnToUserPortal={() => setCurrentPortal('user')}
          />
        ) : (
          /* FRONT OFFICE (USER PORTAL): Dashboard, School Form, District Staff Form ONLY */
          <>
            {activeUserTab === 'dashboard' && (
              <Dashboard
                districtStaffList={districtStaffList}
                schoolStaffList={schoolStaffList}
                onNavigateToSchoolForm={handleNavigateToSchoolForm}
                onNavigateToDistrictForm={handleNavigateToDistrictForm}
                isAdmin={isAdminLoggedIn}
                onOpenAdminLogin={() => setShowAdminLoginModal(true)}
                isSyncingGAS={isSyncingGAS}
                lastSyncTime={lastSyncTime}
                onRefreshFromGAS={() => handleRefreshFromGAS(true)}
                gasConfig={gasConfig}
                onVerifySchool={handleVerifySchool}
                verifiedSchoolIds={verifiedSchoolIds}
              />
            )}

            {activeUserTab === 'school-form' && (
              <SchoolForm
                schoolStaffList={schoolStaffList}
                onSaveSuccess={handleSaveSchoolStaff}
                gasConfig={gasConfig}
                initialSchoolId={targetSchoolIdForForm}
                onViewSchoolInDashboard={(_schoolId) => {
                  setActiveUserTab('dashboard');
                }}
                isAdmin={isAdminLoggedIn}
                verifiedSchoolIds={verifiedSchoolIds}
                onVerifySchool={handleVerifySchool}
              />
            )}

            {activeUserTab === 'district-form' && (
              <DistrictStaffForm
                districtStaffList={districtStaffList}
                onSaveSuccess={handleSaveDistrictStaff}
                gasConfig={gasConfig}
                editingStaff={editingDistrictStaff}
                onCancelEdit={() => setEditingDistrictStaff(null)}
              />
            )}
          </>
        )}
      </main>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 space-y-1 no-print">
        <p className="font-semibold text-slate-700">
          {ORGANIZATION_INFO.name} ({ORGANIZATION_INFO.shortName}) จังหวัด{ORGANIZATION_INFO.province}
        </p>
        <p>
          ระบบจัดเก็บข้อมูลผู้ใช้งานเขตและข้อมูลโรงเรียนภายใต้เขต (เป้าหมาย {ALL_SCHOOLS.length} โรงเรียน • {ALL_SCHOOLS.length * 2} บุคลากรเป้าหมาย)
        </p>
        <p className="text-slate-400">
          ระบบแยกส่วนหน้าบ้านสำหรับการกรอกข้อมูล และระบบหลังบ้านสำหรับการบริหารจัดการและเชื่อมโยง Google Sheets
        </p>
      </footer>
    </div>
  );
}
