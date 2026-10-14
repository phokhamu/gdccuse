import React, { useState, useMemo, useEffect } from 'react';
import { SCHOOL_CLUSTERS, ALL_SCHOOLS, getSchoolsByCluster } from '../data/schoolsData';
import {
  THAI_PREFIXES,
  ENGLISH_PREFIXES,
  ORGANIZATION_INFO,
  suggestEnglishPrefix,
} from '../data/organization';
import { SchoolStaffRecord, GASConfig, DuplicateCheckResult } from '../types';
import { validateOptionalEmail, checkSchoolStaffDuplicate } from '../utils/validation';
import { sendSchoolStaffToGAS, saveSchoolStaffToServer } from '../utils/gasService';
import confetti from 'canvas-confetti';
import {
  School,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  Save,
  RotateCcw,
  Search,
  User,
  Mail,
  FileText,
  Globe,
  ExternalLink,
  Lock,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

interface SchoolFormProps {
  schoolStaffList: SchoolStaffRecord[];
  onSaveSuccess: (record: SchoolStaffRecord) => void;
  gasConfig: GASConfig;
  initialSchoolId?: string;
  onViewSchoolInDashboard?: (schoolId: string) => void;
  isAdmin?: boolean;
  verifiedSchoolIds?: Set<string>;
  onVerifySchool?: (schoolId: string) => void;
}

export const SchoolForm: React.FC<SchoolFormProps> = ({
  schoolStaffList,
  onSaveSuccess,
  gasConfig,
  initialSchoolId,
  onViewSchoolInDashboard,
  isAdmin = false,
  verifiedSchoolIds,
  onVerifySchool,
}) => {
  // Inline SMIS unlock states for protected school records
  const [inlineSmisCode, setInlineSmisCode] = useState<string>('');
  const [inlineSmisError, setInlineSmisError] = useState<string | null>(null);
  // Cascading Filter States
  const [selectedClusterId, setSelectedClusterId] = useState<string>('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [schoolSearchText, setSchoolSearchText] = useState<string>('');

  // Form Fields matching exact user specifications
  const [documentPrefix, setDocumentPrefix] = useState<string>('');

  // 1. ผู้อำนวยการโรงเรียน (ผอ.รร.)
  const [directorPrefixTh, setDirectorPrefixTh] = useState<string>('นาย');
  const [directorFirstNameTh, setDirectorFirstNameTh] = useState<string>('');
  const [directorLastNameTh, setDirectorLastNameTh] = useState<string>('');
  const [directorPrefixEn, setDirectorPrefixEn] = useState<string>('Mr.');
  const [directorFirstNameEn, setDirectorFirstNameEn] = useState<string>('');
  const [directorLastNameEn, setDirectorLastNameEn] = useState<string>('');
  const [directorEmail, setDirectorEmail] = useState<string>('');

  // 2. เจ้าหน้าที่ธุรการโรงเรียน (ธุรการ รร.)
  const [clerkPrefixTh, setClerkPrefixTh] = useState<string>('นางสาว');
  const [clerkFirstNameTh, setClerkFirstNameTh] = useState<string>('');
  const [clerkLastNameTh, setClerkLastNameTh] = useState<string>('');
  const [clerkPrefixEn, setClerkPrefixEn] = useState<string>('Miss');
  const [clerkFirstNameEn, setClerkFirstNameEn] = useState<string>('');
  const [clerkLastNameEn, setClerkLastNameEn] = useState<string>('');
  const [clerkEmail, setClerkEmail] = useState<string>('');

  // Status & Feedback States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState<DuplicateCheckResult | null>(null);

  // Initialize from initialSchoolId if provided
  useEffect(() => {
    if (initialSchoolId) {
      const sch = ALL_SCHOOLS.find((s) => s.id === initialSchoolId);
      if (sch) {
        setSelectedClusterId(sch.clusterId);
        setSelectedSchoolId(sch.id);
      }
    }
  }, [initialSchoolId]);

  // Available schools based on selected cluster
  const availableSchools = useMemo(() => {
    if (!selectedClusterId) return [];
    const list = getSchoolsByCluster(selectedClusterId);
    if (!schoolSearchText.trim()) return list;
    return list.filter(
      (s) =>
        s.name.includes(schoolSearchText.trim()) ||
        s.id.includes(schoolSearchText.trim()) ||
        (s.subdistrict && s.subdistrict.includes(schoolSearchText.trim()))
    );
  }, [selectedClusterId, schoolSearchText]);

  // Selected School Object
  const currentSchool = useMemo(() => {
    return ALL_SCHOOLS.find((s) => s.id === selectedSchoolId);
  }, [selectedSchoolId]);

  // Selected Cluster Object
  const currentCluster = useMemo(() => {
    return SCHOOL_CLUSTERS.find((c) => c.id === selectedClusterId);
  }, [selectedClusterId]);

  // Check if this school has existing saved record
  const existingSchoolRecord = useMemo(() => {
    if (!selectedSchoolId) return undefined;
    return schoolStaffList.find((s) => s.schoolId === selectedSchoolId);
  }, [selectedSchoolId, schoolStaffList]);

  // When school changes, populate default or existing data
  useEffect(() => {
    if (existingSchoolRecord) {
      setDocumentPrefix(existingSchoolRecord.documentPrefix || '');
      setDirectorPrefixTh(existingSchoolRecord.directorPrefixTh || 'นาย');
      setDirectorFirstNameTh(existingSchoolRecord.directorFirstNameTh || '');
      setDirectorLastNameTh(existingSchoolRecord.directorLastNameTh || '');
      setDirectorPrefixEn(existingSchoolRecord.directorPrefixEn || 'Mr.');
      setDirectorFirstNameEn(existingSchoolRecord.directorFirstNameEn || '');
      setDirectorLastNameEn(existingSchoolRecord.directorLastNameEn || '');
      setDirectorEmail(existingSchoolRecord.directorEmail || '');

      setClerkPrefixTh(existingSchoolRecord.clerkPrefixTh || 'นางสาว');
      setClerkFirstNameTh(existingSchoolRecord.clerkFirstNameTh || '');
      setClerkLastNameTh(existingSchoolRecord.clerkLastNameTh || '');
      setClerkPrefixEn(existingSchoolRecord.clerkPrefixEn || 'Miss');
      setClerkFirstNameEn(existingSchoolRecord.clerkFirstNameEn || '');
      setClerkLastNameEn(existingSchoolRecord.clerkLastNameEn || '');
      setClerkEmail(existingSchoolRecord.clerkEmail || '');
    } else if (currentSchool) {
      // Suggest default document prefix based on school ID
      const schoolNum = currentSchool.id.slice(-3);
      setDocumentPrefix(`ศธ 04321.${schoolNum}/`);
      setDirectorFirstNameTh('');
      setDirectorLastNameTh('');
      setDirectorFirstNameEn('');
      setDirectorLastNameEn('');
      setDirectorEmail('');
      setClerkFirstNameTh('');
      setClerkLastNameTh('');
      setClerkFirstNameEn('');
      setClerkLastNameEn('');
      setClerkEmail('');
    }
    setSuccessBanner(null);
    setErrorBanner(null);
  }, [selectedSchoolId, existingSchoolRecord, currentSchool]);

  // Check if existing record is locked by SMIS
  const isSchoolLocked = useMemo(() => {
    if (!currentSchool) return false;
    if (!existingSchoolRecord) return false;
    if (isAdmin) return false;
    if (verifiedSchoolIds && verifiedSchoolIds.has(currentSchool.id)) return false;
    return true;
  }, [currentSchool, existingSchoolRecord, isAdmin, verifiedSchoolIds]);

  const handleInlineUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    setInlineSmisError(null);
    if (inlineSmisCode.trim() === currentSchool.id) {
      if (onVerifySchool) onVerifySchool(currentSchool.id);
      setInlineSmisCode('');
    } else {
      setInlineSmisError('รหัส SMIS ไม่ถูกต้อง กรุณาตรวจสอบรหัสประจำโรงเรียน 8 หลักของท่านอีกครั้ง');
    }
  };

  // Reset school when cluster changes
  const handleClusterChange = (newClusterId: string) => {
    setSelectedClusterId(newClusterId);
    setSchoolSearchText('');
    const schoolsInNewCluster = getSchoolsByCluster(newClusterId);
    if (!schoolsInNewCluster.some((s) => s.id === selectedSchoolId)) {
      setSelectedSchoolId('');
    }
  };

  const handleDirectorThaiPrefixChange = (val: string) => {
    setDirectorPrefixTh(val);
    setDirectorPrefixEn(suggestEnglishPrefix(val));
  };

  const handleClerkThaiPrefixChange = (val: string) => {
    setClerkPrefixTh(val);
    setClerkPrefixEn(suggestEnglishPrefix(val));
  };

  const handleResetForm = () => {
    setDirectorFirstNameTh('');
    setDirectorLastNameTh('');
    setDirectorFirstNameEn('');
    setDirectorLastNameEn('');
    setDirectorEmail('');

    setClerkFirstNameTh('');
    setClerkLastNameTh('');
    setClerkFirstNameEn('');
    setClerkLastNameEn('');
    setClerkEmail('');

    setSuccessBanner(null);
    setErrorBanner(null);
    setShowDuplicateModal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setSuccessBanner(null);

    // 1. Check cascading selections
    if (!selectedClusterId) {
      setErrorBanner('กรุณาเลือกกลุ่มโรงเรียนเป็นตัวกรองเริ่มต้นก่อน');
      return;
    }
    if (!selectedSchoolId || !currentSchool) {
      setErrorBanner('กรุณาเลือกชื่อโรงเรียน (แบบเต็ม)');
      return;
    }

    // 2. Check document format prefix
    if (!documentPrefix.trim()) {
      setErrorBanner('กรุณาระบุ รูปแบบเลขที่หนังสือ เช่น ศธ 04321.xxx/');
      return;
    }

    // 3. Validation for Director Required Fields
    if (!directorFirstNameTh.trim()) {
      setErrorBanner('กรุณากรอก ชื่อ (ภาษาไทย) ผู้อำนวยการโรงเรียน *');
      return;
    }
    if (!directorLastNameTh.trim()) {
      setErrorBanner('กรุณากรอก นามสกุล (ภาษาไทย) ผู้อำนวยการโรงเรียน *');
      return;
    }
    if (!directorFirstNameEn.trim()) {
      setErrorBanner('กรุณากรอก ชื่อ (ภาษาอังกฤษ) ผู้อำนวยการโรงเรียน *');
      return;
    }
    if (!directorLastNameEn.trim()) {
      setErrorBanner('กรุณากรอก นามสกุล (ภาษาอังกฤษ) ผู้อำนวยการโรงเรียน *');
      return;
    }
    if (directorEmail.trim()) {
      const deCheck = validateOptionalEmail(directorEmail.trim());
      if (!deCheck.isValid) {
        setErrorBanner(`อีเมล ผู้อำนวยการโรงเรียน ไม่ถูกต้อง: ${deCheck.message}`);
        return;
      }
    }

    // 4. Validation for Clerk Required Fields
    if (!clerkFirstNameTh.trim()) {
      setErrorBanner('กรุณากรอก ชื่อ (ภาษาไทย) ธุรการโรงเรียน *');
      return;
    }
    if (!clerkLastNameTh.trim()) {
      setErrorBanner('กรุณากรอก นามสกุล (ภาษาไทย) ธุรการโรงเรียน *');
      return;
    }
    if (!clerkFirstNameEn.trim()) {
      setErrorBanner('กรุณากรอก ชื่อ (ภาษาอังกฤษ) ธุรการโรงเรียน *');
      return;
    }
    if (!clerkLastNameEn.trim()) {
      setErrorBanner('กรุณากรอก นามสกุล (ภาษาอังกฤษ) ธุรการโรงเรียน *');
      return;
    }
    if (clerkEmail.trim()) {
      const ceCheck = validateOptionalEmail(clerkEmail.trim());
      if (!ceCheck.isValid) {
        setErrorBanner(`อีเมล ธุรการโรงเรียน ไม่ถูกต้อง: ${ceCheck.message}`);
        return;
      }
    }

    // 5. Check Duplicate
    const dupCheck = checkSchoolStaffDuplicate(
      {
        schoolName: currentSchool.name,
        directorEmail,
        clerkEmail,
        id: existingSchoolRecord?.id,
      },
      schoolStaffList
    );

    if (dupCheck.isDuplicate) {
      setShowDuplicateModal(dupCheck);
      setErrorBanner(`ตรวจพบข้อมูลซ้ำ: ${dupCheck.message}`);
      return;
    }

    // Build School Record
    const recordId = existingSchoolRecord?.id || `sch-${Date.now()}`;
    const newRecord: SchoolStaffRecord = {
      id: recordId,
      clusterId: currentSchool.clusterId,
      clusterName: currentSchool.clusterName,
      schoolId: currentSchool.id,
      schoolName: currentSchool.name,
      documentPrefix: documentPrefix.trim(),

      directorPrefixTh: directorPrefixTh.trim(),
      directorFirstNameTh: directorFirstNameTh.trim(),
      directorLastNameTh: directorLastNameTh.trim(),
      directorPrefixEn: directorPrefixEn.trim(),
      directorFirstNameEn: directorFirstNameEn.trim(),
      directorLastNameEn: directorLastNameEn.trim(),
      directorEmail: directorEmail.trim(),

      clerkPrefixTh: clerkPrefixTh.trim(),
      clerkFirstNameTh: clerkFirstNameTh.trim(),
      clerkLastNameTh: clerkLastNameTh.trim(),
      clerkPrefixEn: clerkPrefixEn.trim(),
      clerkFirstNameEn: clerkFirstNameEn.trim(),
      clerkLastNameEn: clerkLastNameEn.trim(),
      clerkEmail: clerkEmail.trim(),

      createdAt: existingSchoolRecord?.createdAt || new Date().toLocaleString('th-TH'),
      updatedAt: new Date().toLocaleString('th-TH'),
    };

    setIsSubmitting(true);
    try {
      // 1. บันทึกลงไฟล์เซิร์ฟเวอร์โดยตรง
      await saveSchoolStaffToServer(newRecord);

      // 2. ส่งไปยัง Google Apps Script ถ้าตั้งค่าไว้
      const gasResult = await sendSchoolStaffToGAS(newRecord, gasConfig.webAppUrl);

      // 3. บันทึกใน React state
      onSaveSuccess(newRecord);
      if (onVerifySchool) {
        onVerifySchool(newRecord.schoolId);
      }

      // Confetti celebration
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      setSuccessBanner(
        `บันทึกข้อมูล ${newRecord.schoolName} (ผอ.รร. และ ธุรการ รร.) ลงไฟล์เรียบร้อยแล้ว! ${
          gasResult.message ? `(${gasResult.message})` : ''
        }`
      );
    } catch (err: any) {
      setErrorBanner(`เกิดข้อผิดพลาดในการบันทึก: ${err.message || 'โปรดลองใหม่อีกครั้ง'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title & Cascading Filter Box */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  แบบฟอร์มข้อมูลโรงเรียนภายใต้เขต
                </span>
                <span className="text-xs text-slate-500">เป้าหมาย 212 โรงเรียน</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
                บันทึกข้อมูลโรงเรียนภายใต้เขต ({ORGANIZATION_INFO.shortName})
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                เลือกกลุ่มโรงเรียนเป็นตัวกรองเริ่มต้น แล้วเลือกชื่อโรงเรียน พร้อมระบุข้อมูล ผอ.รร. และ ธุรการ รร.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:text-right shrink-0">
            <div className="text-xs text-slate-500">บันทึกข้อมูลแล้ว</div>
            <div className="text-lg font-bold text-emerald-700">
              {schoolStaffList.length} / {ALL_SCHOOLS.length} โรงเรียน
            </div>
            <div className="text-xs text-slate-500">
              ({((schoolStaffList.length / ALL_SCHOOLS.length) * 100).toFixed(1)}%)
            </div>
          </div>
        </div>

        {/* Cascading Filter Section */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/60">
          {/* Step 1: Cluster Selector */}
          <div>
            <label className="block text-sm font-bold text-emerald-950 mb-1.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>กลุ่มโรงเรียน (ตัวกรองเริ่มต้น) *</span>
            </label>
            <select
              value={selectedClusterId}
              onChange={(e) => handleClusterChange(e.target.value)}
              className="w-full bg-white border border-emerald-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
            >
              <option value="">-- กรุณาเลือกกลุ่มโรงเรียน / กลุ่มพัฒนาคุณภาพ --</option>
              {SCHOOL_CLUSTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.district}) - {c.schoolCount} โรงเรียน
                </option>
              ))}
            </select>
            <p className="text-xs text-emerald-800 mt-1">
              เมื่อเลือกกลุ่มแล้ว ระบบจะแสดงเฉพาะรายชื่อโรงเรียนที่สังกัดกลุ่มนี้
            </p>
          </div>

          {/* Step 2: School Selector */}
          <div>
            <label className="block text-sm font-bold text-emerald-950 mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>ชื่อโรงเรียน (แบบเต็ม) *</span>
              </div>
              {selectedClusterId && (
                <span className="text-xs text-emerald-800 font-normal">
                  พบ {availableSchools.length} โรงเรียน
                </span>
              )}
            </label>

            {selectedClusterId ? (
              <div className="space-y-1.5">
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
                >
                  <option value="">-- เลือกชื่อโรงเรียน (แบบเต็ม) --</option>
                  {availableSchools.map((s) => {
                    const hasRecord = schoolStaffList.some((st) => st.schoolId === s.id);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id}){hasRecord ? ' [บันทึกข้อมูลแล้ว ✓]' : ' [ยังไม่บันทึก]'}
                      </option>
                    );
                  })}
                </select>

                {availableSchools.length > 5 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="พิมพ์ค้นหาชื่อโรงเรียนในกลุ่มนี้..."
                      value={schoolSearchText}
                      onChange={(e) => setSchoolSearchText(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-xs bg-white/80 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-emerald-300 rounded-lg p-2.5 bg-white/60 text-xs text-slate-500 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>โปรดเลือก "กลุ่มโรงเรียน" ในช่องที่ 1 ก่อน เพื่อแสดงรายชื่อโรงเรียน</span>
              </div>
            )}
          </div>
        </div>

        {/* Selected School Notice & Status */}
        {currentSchool && (
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs text-slate-500">
                รหัสโรงเรียน: <strong className="font-mono">{currentSchool.id}</strong> • สังกัด:{' '}
                <strong>{currentSchool.clusterName}</strong> • {currentSchool.district}
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {currentSchool.name}
              </div>
            </div>

            {existingSchoolRecord ? (
              isSchoolLocked ? (
                <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 self-start sm:self-auto">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  บันทึกข้อมูลแล้ว (ล็อกด้วยรหัส SMIS)
                </span>
              ) : (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold flex items-center gap-1 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isAdmin ? 'มีข้อมูลในระบบแล้ว (โหมดผู้ดูแลระบบ)' : 'ปลดล็อกข้อมูลแล้ว (พร้อมแก้ไข)'}
                </span>
              )
            ) : (
              <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
                ยังไม่มีข้อมูล (กรอกใหม่ด้านล่าง)
              </span>
            )}
          </div>
        )}
      </div>

      {/* If School is Locked by SMIS Code */}
      {isSchoolLocked ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-amber-200 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-300">
              ข้อมูลถูกล็อกความปลอดภัย
            </span>
            <h3 className="text-lg font-bold text-slate-800 mt-2">
              ข้อมูลของ {currentSchool?.name} ได้รับการบันทึกแล้ว
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              เพื่อความปลอดภัยและความเป็นส่วนตัวของข้อมูล กรุณาระบุรหัสประจำโรงเรียน (รหัส SMIS 8 หลัก) ของโรงเรียนท่านเพื่อปลดล็อกการเข้าดูและแก้ไขข้อมูล
            </p>
          </div>

          <form onSubmit={handleInlineUnlock} className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                placeholder="รหัส SMIS 8 หลัก เช่น 4303xxxx"
                value={inlineSmisCode}
                onChange={(e) => {
                  setInlineSmisCode(e.target.value.replace(/\D/g, ''));
                  setInlineSmisError(null);
                }}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ปลดล็อกเพื่อแก้ไข</span>
              </button>
            </div>

            {inlineSmisError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-center gap-1.5 animate-shake">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{inlineSmisError}</span>
              </div>
            )}

            <p className="text-[11px] text-slate-400 pt-1">
              💡 หมายเหตุ: รหัส SMIS คือรหัสสถานศึกษา 8 หลักที่ใช้ในระบบของ สพฐ.
            </p>
          </form>
        </div>
      ) : (
        /* Main Form Card */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200 space-y-6">
        {/* Success Banner */}
        {successBanner && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl flex items-start gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">บันทึกสำเร็จ!</p>
              <p>{successBanner}</p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorBanner && (
          <div className="bg-rose-50 border border-rose-300 text-rose-900 p-4 rounded-xl flex items-start gap-3 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">โปรดตรวจสอบข้อผิดพลาด</p>
              <p>{errorBanner}</p>
            </div>
          </div>
        )}

        {/* Field: รูปแบบเลขที่หนังสือ *จำเป็นต้องกรอก */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>รูปแบบเลขที่หนังสือ *จำเป็นต้องกรอก</span>
          </label>
          <input
            type="text"
            placeholder="เช่น ศธ 04321.001/"
            value={documentPrefix}
            onChange={(e) => setDocumentPrefix(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
          <p className="text-[11px] text-slate-500 mt-1">
            รูปแบบรหัสหนังสือราชการของสถานศึกษาสำหรับออกเลขหนังสือ
          </p>
        </div>

        {/* SECTION 1: ผู้อำนวยการโรงเรียน */}
        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-4">
          <div className="flex items-center justify-between border-b border-blue-200 pb-2">
            <h3 className="text-base font-bold text-blue-950 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-700" />
              <span>ข้อมูลผู้อำนวยการโรงเรียน</span>
            </h3>
            <span className="text-xs text-blue-800 font-semibold bg-blue-100 px-2.5 py-0.5 rounded-full">
              เป้าหมายที่ 1
            </span>
          </div>

          {/* Thai Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                คำนำหน้า (ภาษาไทย) ผู้อำนวยการโรงเรียน *
              </label>
              <select
                value={directorPrefixTh}
                onChange={(e) => handleDirectorThaiPrefixChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                ชื่อ (ภาษาไทย) ผู้อำนวยการโรงเรียน *
              </label>
              <input
                type="text"
                placeholder="เช่น เกรียงศักดิ์"
                value={directorFirstNameTh}
                onChange={(e) => setDirectorFirstNameTh(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                นามสกุล (ภาษาไทย) ผู้อำนวยการโรงเรียน *
              </label>
              <input
                type="text"
                placeholder="เช่น วัฒนาวงศ์"
                value={directorLastNameTh}
                onChange={(e) => setDirectorLastNameTh(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* English Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                คำนำหน้า (ภาษาอังกฤษ) ผู้อำนวยการโรงเรียน *
              </label>
              <select
                value={directorPrefixEn}
                onChange={(e) => setDirectorPrefixEn(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                ชื่อ (ภาษาอังกฤษ) ผู้อำนวยการโรงเรียน *
              </label>
              <input
                type="text"
                placeholder="เช่น Kriangsak"
                value={directorFirstNameEn}
                onChange={(e) => setDirectorFirstNameEn(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                นามสกุล (ภาษาอังกฤษ) ผู้อำนวยการโรงเรียน *
              </label>
              <input
                type="text"
                placeholder="เช่น Wattanawong"
                value={directorLastNameEn}
                onChange={(e) => setDirectorLastNameEn(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Director Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-700" />
              <span>e-Mail ผู้อำนวยการโรงเรียน</span>
            </label>
            <input
              type="email"
              placeholder="เช่น kriangsak@bkn.go.th"
              value={directorEmail}
              onChange={(e) => setDirectorEmail(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* SECTION 2: ธุรการโรงเรียน */}
        <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-700" />
              <span>ข้อมูลธุรการโรงเรียน</span>
            </h3>
            <span className="text-xs text-emerald-800 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full">
              เป้าหมายที่ 2
            </span>
          </div>

          {/* Thai Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                คำนำหน้า (ภาษาไทย) ธุรการโรงเรียน *
              </label>
              <select
                value={clerkPrefixTh}
                onChange={(e) => handleClerkThaiPrefixChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
                ชื่อ (ภาษาไทย) ธุรการโรงเรียน *
              </label>
              <input
                type="text"
                placeholder="เช่น อรัญญา"
                value={clerkFirstNameTh}
                onChange={(e) => setClerkFirstNameTh(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                นามสกุล (ภาษาไทย) ธุรการโรงเรียน *
              </label>
              <input
                type="text"
                placeholder="เช่น บุญญารัตน์"
                value={clerkLastNameTh}
                onChange={(e) => setClerkLastNameTh(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* English Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                คำนำหน้า (ภาษาอังกฤษ) ธุรการโรงเรียน *
              </label>
              <select
                value={clerkPrefixEn}
                onChange={(e) => setClerkPrefixEn(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
                ชื่อ (ภาษาอังกฤษ) ธุรการโรงเรียน *
              </label>
              <input
                type="text"
                placeholder="เช่น Aranya"
                value={clerkFirstNameEn}
                onChange={(e) => setClerkFirstNameEn(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                นามสกุล (ภาษาอังกฤษ) ธุรการโรงเรียน *
              </label>
              <input
                type="text"
                placeholder="เช่น Boonyarat"
                value={clerkLastNameEn}
                onChange={(e) => setClerkLastNameEn(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Clerk Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>e-Mail ธุรการโรงเรียน</span>
            </label>
            <input
              type="email"
              placeholder="เช่น aranya.admin@bkn.go.th"
              value={clerkEmail}
              onChange={(e) => setClerkEmail(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleResetForm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ล้างฟอร์ม</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-7 py-2.5 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSubmitting
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-700 hover:bg-emerald-800 hover:shadow-lg active:scale-95'
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
                <span>บันทึกข้อมูลโรงเรียน (ผอ. และ ธุรการ)</span>
              </>
            )}
          </button>
        </div>
      </form>
      )}

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
