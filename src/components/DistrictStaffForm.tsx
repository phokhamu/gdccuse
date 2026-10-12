import React, { useState } from 'react';
import {
  THAI_PREFIXES,
  ENGLISH_PREFIXES,
  DISTRICT_DEPARTMENTS,
  DISTRICT_POSITIONS,
  USER_PERMISSIONS,
  ORGANIZATION_INFO,
  suggestEnglishPrefix,
} from '../data/organization';
import { DistrictStaff, GASConfig, DuplicateCheckResult } from '../types';
import { validateEmail, checkDistrictStaffDuplicate } from '../utils/validation';
import { sendDistrictStaffToGAS, saveDistrictStaffToServer } from '../utils/gasService';
import {
  Building2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Mail,
  UserCog,
  Globe,
} from 'lucide-react';

interface DistrictStaffFormProps {
  districtStaffList: DistrictStaff[];
  onSaveSuccess: (record: DistrictStaff) => void;
  gasConfig: GASConfig;
  editingStaff?: DistrictStaff | null;
  onCancelEdit?: () => void;
}

export const DistrictStaffForm: React.FC<DistrictStaffFormProps> = ({
  districtStaffList,
  onSaveSuccess,
  gasConfig,
  editingStaff,
  onCancelEdit,
}) => {
  // Form Fields exactly matching user Google Sheets specifications
  const [prefixTh, setPrefixTh] = useState<string>(editingStaff?.prefixTh || 'นาย');
  const [firstNameTh, setFirstNameTh] = useState<string>(editingStaff?.firstNameTh || '');
  const [lastNameTh, setLastNameTh] = useState<string>(editingStaff?.lastNameTh || '');

  const [prefixEn, setPrefixEn] = useState<string>(
    editingStaff?.prefixEn || suggestEnglishPrefix(editingStaff?.prefixTh || 'นาย')
  );
  const [firstNameEn, setFirstNameEn] = useState<string>(editingStaff?.firstNameEn || '');
  const [lastNameEn, setLastNameEn] = useState<string>(editingStaff?.lastNameEn || '');

  const [email, setEmail] = useState<string>(editingStaff?.email || '');
  const [position, setPosition] = useState<string>(editingStaff?.position || DISTRICT_POSITIONS[2]);
  const [customPosition, setCustomPosition] = useState<string>('');

  const [department, setDepartment] = useState<string>(
    editingStaff?.department || `${ORGANIZATION_INFO.name} (${DISTRICT_DEPARTMENTS[0]})`
  );

  const [rolePermission, setRolePermission] = useState<'ผู้ใช้งาน' | 'ผู้ดูแลระบบ'>(
    editingStaff?.rolePermission || 'ผู้ใช้งาน'
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState<DuplicateCheckResult | null>(null);

  // Auto update English prefix when Thai prefix changes
  const handleThaiPrefixChange = (val: string) => {
    setPrefixTh(val);
    setPrefixEn(suggestEnglishPrefix(val));
  };

  const handleReset = () => {
    setFirstNameTh('');
    setLastNameTh('');
    setFirstNameEn('');
    setLastNameEn('');
    setEmail('');
    setCustomPosition('');
    setSuccessBanner(null);
    setErrorBanner(null);
    setShowDuplicateModal(null);
    if (onCancelEdit) onCancelEdit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setSuccessBanner(null);

    // 1. Validation for Required Thai fields
    if (!prefixTh.trim()) {
      setErrorBanner('กรุณาระบุ คำนำหน้า (ภาษาไทย)');
      return;
    }
    if (!firstNameTh.trim()) {
      setErrorBanner('กรุณากรอก ชื่อ (ภาษาไทย)');
      return;
    }
    if (!lastNameTh.trim()) {
      setErrorBanner('กรุณากรอก นามสกุล (ภาษาไทย)');
      return;
    }

    // 2. Validation for Required English fields
    if (!prefixEn.trim()) {
      setErrorBanner('กรุณาระบุ คำนำหน้า (ภาษาอังกฤษ)');
      return;
    }
    if (!firstNameEn.trim()) {
      setErrorBanner('กรุณากรอก ชื่อ (ภาษาอังกฤษ)');
      return;
    }
    if (!lastNameEn.trim()) {
      setErrorBanner('กรุณากรอก นามสกุล (ภาษาอังกฤษ)');
      return;
    }

    // 3. Validation for Required Position & Department
    const finalPosition = position === 'อื่นๆ' ? customPosition.trim() : position;
    if (!finalPosition) {
      setErrorBanner('กรุณาระบุ ตำแหน่ง');
      return;
    }
    if (!department.trim()) {
      setErrorBanner('กรุณาระบุ สังกัด / ชื่อหน่วยงาน');
      return;
    }

    // 4. Validation for Email (Office email)
    if (email.trim()) {
      const emailCheck = validateEmail(email.trim());
      if (!emailCheck.isValid) {
        setErrorBanner(emailCheck.message || 'รูปแบบ e-Mail ไม่ถูกต้อง');
        return;
      }
    }

    // 5. Duplicate Check
    const dupCheck = checkDistrictStaffDuplicate(
      {
        email,
        firstNameTh,
        lastNameTh,
        id: editingStaff?.id,
      },
      districtStaffList
    );

    if (dupCheck.isDuplicate) {
      setShowDuplicateModal(dupCheck);
      setErrorBanner(`ตรวจพบข้อมูลซ้ำ: ${dupCheck.message}`);
      return;
    }

    const recordId = editingStaff?.id || `dist-${Date.now()}`;
    const newStaff: DistrictStaff = {
      id: recordId,
      prefixTh: prefixTh.trim(),
      firstNameTh: firstNameTh.trim(),
      lastNameTh: lastNameTh.trim(),
      prefixEn: prefixEn.trim(),
      firstNameEn: firstNameEn.trim(),
      lastNameEn: lastNameEn.trim(),
      email: email.trim(),
      position: finalPosition,
      department: department.trim(),
      rolePermission,
      createdAt: editingStaff?.createdAt || new Date().toLocaleString('th-TH'),
      updatedAt: new Date().toLocaleString('th-TH'),
    };

    setIsSubmitting(true);
    try {
      // 1. บันทึกลงไฟล์เซิร์ฟเวอร์โดยตรง
      await saveDistrictStaffToServer(newStaff);

      // 2. ส่งไปยัง Google Apps Script
      const gasResult = await sendDistrictStaffToGAS(newStaff, gasConfig.webAppUrl);

      // 3. บันทึกในระบบ
      onSaveSuccess(newStaff);

      setSuccessBanner(
        `บันทึกข้อมูล "${newStaff.prefixTh}${newStaff.firstNameTh} ${newStaff.lastNameTh}" ลงไฟล์เรียบร้อยแล้ว! ${
          gasResult.message ? `(${gasResult.message})` : ''
        }`
      );
      if (!editingStaff) {
        handleReset();
      }
    } catch (err: any) {
      setErrorBanner(`เกิดข้อผิดพลาดในการบันทึก: ${err.message || 'โปรดลองใหม่อีกครั้ง'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  แบบฟอร์มข้อมูลผู้ใช้งานเขต
                </span>
                <span className="text-xs text-slate-500">{ORGANIZATION_INFO.shortName}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
                บันทึกข้อมูลผู้ใช้งานเขต ({ORGANIZATION_INFO.shortName})
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                หัวข้อฟอร์มตรงตามโครงสร้าง Google Sheets สำหรับนำเข้าและบันทึกลงไฟล์ระบบ
              </p>
            </div>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200/60 rounded-xl p-3 sm:text-right shrink-0">
            <div className="text-xs text-indigo-800">ผู้ใช้งานเขตในระบบ</div>
            <div className="text-2xl font-extrabold text-indigo-900">{districtStaffList.length} คน</div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200 space-y-6">
        {/* Success Banner */}
        {successBanner && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">บันทึกสำเร็จ!</p>
              <p>{successBanner}</p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorBanner && (
          <div className="bg-rose-50 border border-rose-300 text-rose-900 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">โปรดตรวจสอบข้อผิดพลาด</p>
              <p>{errorBanner}</p>
            </div>
          </div>
        )}

        {/* Section 1: Thai Name (ภาษาไทย) */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-700" />
            <span>ข้อมูลชื่อ - นามสกุล (ภาษาไทย) *จำเป็นต้องกรอก</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                คำนำหน้า (ภาษาไทย) *
              </label>
              <select
                value={prefixTh}
                onChange={(e) => handleThaiPrefixChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                required
              >
                {THAI_PREFIXES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อ (ภาษาไทย) *
              </label>
              <input
                type="text"
                placeholder="เช่น สมชาย"
                value={firstNameTh}
                onChange={(e) => setFirstNameTh(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                นามสกุล (ภาษาไทย) *
              </label>
              <input
                type="text"
                placeholder="เช่น รักการเรียน"
                value={lastNameTh}
                onChange={(e) => setLastNameTh(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: English Name (ภาษาอังกฤษ) */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-700" />
            <span>ข้อมูลชื่อ - นามสกุล (ภาษาอังกฤษ) *จำเป็นต้องกรอก</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                คำนำหน้า (ภาษาอังกฤษ) *
              </label>
              <select
                value={prefixEn}
                onChange={(e) => setPrefixEn(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                required
              >
                {ENGLISH_PREFIXES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อ (ภาษาอังกฤษ) *
              </label>
              <input
                type="text"
                placeholder="เช่น Somchai"
                value={firstNameEn}
                onChange={(e) => setFirstNameEn(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                นามสกุล (ภาษาอังกฤษ) *
              </label>
              <input
                type="text"
                placeholder="เช่น Rakkarnrian"
                value={lastNameEn}
                onChange={(e) => setLastNameEn(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Email, Position, Department, RolePermission */}
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-700" />
              <span>e-Mail สำนักงาน ที่สามารถยืนยันตัวตนได้</span>
            </label>
            <input
              type="email"
              placeholder="เช่น user@bkn.go.th"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              ระบุอีเมลราชการของ สพป.บึงกาฬ หรืออีเมลองค์กรที่ใช้ในการปฏิบัติงาน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Position */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ตำแหน่ง *จำเป็นต้องกรอก
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                required
              >
                {DISTRICT_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
              {position === 'อื่นๆ' && (
                <input
                  type="text"
                  placeholder="ระบุชื่อตำแหน่ง"
                  value={customPosition}
                  onChange={(e) => setCustomPosition(e.target.value)}
                  className="mt-2 w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                สังกัด / ชื่อหน่วยงาน *จำเป็นต้องกรอก
              </label>
              <input
                type="text"
                placeholder="เช่น สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบึงกาฬ (กลุ่มนโยบายและแผน)"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Role Permission */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <UserCog className="w-3.5 h-3.5 text-indigo-700" />
              <span>สิทธิ์ผู้ดูแลระบบ, ผู้ใช้งาน *</span>
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {USER_PERMISSIONS.map((p) => {
                const isSelected = rolePermission === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setRolePermission(p)}
                    className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1 h-1 bg-white rounded-full" />}
                    </div>
                    <span>{p}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{editingStaff ? 'ยกเลิกการแก้ไข' : 'ล้างฟอร์ม'}</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-7 py-2.5 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSubmitting
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : 'bg-indigo-700 hover:bg-indigo-800 hover:shadow-lg active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{editingStaff ? 'อัปเดตข้อมูลผู้ใช้งานเขต' : 'บันทึกข้อมูลผู้ใช้งานเขต'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Duplicate Alert Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">ตรวจพบข้อมูลซ้ำซ้อน</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {showDuplicateModal.message}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDuplicateModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-900 cursor-pointer"
              >
                รับทราบและแก้ไขข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
