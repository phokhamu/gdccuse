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
} from './utils/gasService';
import { ORGANIZATION_INFO } from './data/organization';
import { ALL_SCHOOLS } from './data/schoolsData';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

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

  // Load from server or localStorage on mount
  useEffect(() => {
    async function initData() {
      const serverData = await loadAllFromServer();
      if (serverData && (serverData.districtStaff.length > 0 || serverData.schoolStaff.length > 0)) {
        setDistrictStaffList(serverData.districtStaff);
        setSchoolStaffList(serverData.schoolStaff);
        saveDistrictStaffToStorage(serverData.districtStaff);
        saveSchoolStaffToStorage(serverData.schoolStaff);
      } else if (serverData) {
        // Server responded with clean empty lists
        const dStaff = loadDistrictStaffFromStorage();
        const sStaff = loadSchoolStaffFromStorage();
        if (dStaff.length > 0 || sStaff.length > 0) {
          setDistrictStaffList(dStaff);
          setSchoolStaffList(sStaff);
          syncAllToServer(dStaff, sStaff);
        } else {
          setDistrictStaffList([]);
          setSchoolStaffList([]);
          saveDistrictStaffToStorage([]);
          saveSchoolStaffToStorage([]);
        }
      } else {
        const dStaff = loadDistrictStaffFromStorage();
        const sStaff = loadSchoolStaffFromStorage();
        setDistrictStaffList(dStaff);
        setSchoolStaffList(sStaff);
      }
      const config = loadGASConfig();
      setGasConfig(config);
    }
    initData();
  }, []);

  const handleRefreshFromServer = async () => {
    const serverData = await loadAllFromServer();
    if (serverData) {
      setDistrictStaffList(serverData.districtStaff);
      setSchoolStaffList(serverData.schoolStaff);
      saveDistrictStaffToStorage(serverData.districtStaff);
      saveSchoolStaffToStorage(serverData.schoolStaff);
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
      const index = prev.findIndex((s) => s.id === newOrUpdated.id);
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
    setDistrictStaffList((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveDistrictStaffToStorage(updated);
      deleteDistrictStaffFromServer(id);
      return updated;
    });
  };

  const handleDeleteSchoolStaff = (id: string) => {
    setSchoolStaffList((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSchoolStaffToStorage(updated);
      deleteSchoolStaffFromServer(id);
      return updated;
    });
  };

  const handleBatchDeleteDistrictStaff = (ids: string[]) => {
    const idSet = new Set(ids);
    setDistrictStaffList((prev) => {
      const updated = prev.filter((s) => !idSet.has(s.id));
      saveDistrictStaffToStorage(updated);
      batchDeleteFromServer('district', ids);
      return updated;
    });
  };

  const handleBatchDeleteSchoolStaff = (ids: string[]) => {
    const idSet = new Set(ids);
    setSchoolStaffList((prev) => {
      const updated = prev.filter((s) => !idSet.has(s.id));
      saveSchoolStaffToStorage(updated);
      batchDeleteFromServer('school', ids);
      return updated;
    });
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
