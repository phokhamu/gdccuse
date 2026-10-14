import React, { useState, useEffect, useMemo } from 'react';
import { SchoolInfo } from '../types';
import { ALL_SCHOOLS, SCHOOL_CLUSTERS } from '../data/schoolsData';
import { School, Lock, KeyRound, AlertCircle, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SchoolSmisModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSchool: SchoolInfo | null;
  onSuccess: (schoolId: string) => void;
}

export const SchoolSmisModal: React.FC<SchoolSmisModalProps> = ({
  isOpen,
  onClose,
  targetSchool,
  onSuccess,
}) => {
  // If targetSchool is provided, use it; otherwise allow user to select school
  const [selectedClusterId, setSelectedClusterId] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [schoolSearchText, setSchoolSearchText] = useState('');
  const [smisCode, setSmisCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSmisCode('');
      setErrorMsg(null);
      if (targetSchool) {
        setSelectedClusterId(targetSchool.clusterId);
        setSelectedSchoolId(targetSchool.id);
      } else {
        setSelectedClusterId('');
        setSelectedSchoolId('');
        setSchoolSearchText('');
      }
    }
  }, [isOpen, targetSchool]);

  // Filtered schools if selecting
  const availableSchools = useMemo(() => {
    let list = ALL_SCHOOLS;
    if (selectedClusterId) {
      list = list.filter((s) => s.clusterId === selectedClusterId);
    }
    if (schoolSearchText.trim()) {
      const q = schoolSearchText.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.includes(q) ||
          (s.subdistrict && s.subdistrict.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedClusterId, schoolSearchText]);

  // Current active school for verification
  const activeSchool = useMemo(() => {
    if (targetSchool) return targetSchool;
    return ALL_SCHOOLS.find((s) => s.id === selectedSchoolId) || null;
  }, [targetSchool, selectedSchoolId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!activeSchool) {
      setErrorMsg('กรุณาเลือกชื่อโรงเรียนของท่านก่อน');
      return;
    }

    const entered = smisCode.trim();
    if (!entered) {
      setErrorMsg('กรุณากรอกรหัสประจำโรงเรียน (รหัส SMIS 8 หลัก)');
      return;
    }

    // Verify against activeSchool.id (which is the 8-digit SMIS code - รหัสแบบ A)
    if (entered === activeSchool.id) {
      onSuccess(activeSchool.id);
      onClose();
    } else {
      setErrorMsg('รหัสประจำโรงเรียน (รหัส SMIS 8 หลัก) ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  ระบบความปลอดภัยข้อมูลโรงเรียน
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1 line-clamp-1">
                ยืนยันตัวตนโรงเรียนเพื่อดูและแก้ไขข้อมูล
              </h3>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {targetSchool ? (
            /* Preselected School Card */
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
              <School className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="text-slate-500">โรงเรียนเป้าหมาย:</span>
                <p className="font-bold text-emerald-950 text-sm mt-0.5">{targetSchool.name}</p>
                <p className="text-emerald-800 text-[11px] mt-0.5">กลุ่มโรงเรียน: {targetSchool.clusterName}</p>
              </div>
            </div>
          ) : (
            /* School Selection Controls */
            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <School className="w-4 h-4 text-emerald-700" />
                <span>เลือกโรงเรียนของท่าน</span>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">กลุ่มโรงเรียน (23 กลุ่ม)</label>
                <select
                  value={selectedClusterId}
                  onChange={(e) => {
                    setSelectedClusterId(e.target.value);
                    setSelectedSchoolId('');
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                >
                  <option value="">-- กรองทุกกลุ่มโรงเรียน --</option>
                  {SCHOOL_CLUSTERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">ชื่อโรงเรียน *</label>
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                >
                  <option value="">-- กรุณาเลือกชื่อโรงเรียน ({availableSchools.length} โรงเรียน) --</option>
                  {availableSchools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.clusterName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* SMIS Code Input (รหัสแบบ A) */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                <span>รหัสประจำโรงเรียน (รหัส SMIS 8 หลัก) *</span>
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                รหัสผ่านแบบ A
              </span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              autoFocus
              value={smisCode}
              onChange={(e) => {
                setSmisCode(e.target.value.replace(/\D/g, ''));
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="กรอกรหัส SMIS 8 หลัก เช่น 4303xxxx"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono tracking-wider text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed space-y-1">
            <p className="font-bold flex items-center gap-1 text-amber-950">
              <span>💡 คำแนะนำการใช้งาน (แนวทางที่ 1 • รหัสแบบ A):</span>
            </p>
            <p>
              • <strong>ปุ่มแก้ไขในตาราง Dashboard ถูกซ่อนไว้</strong> เพื่อความปลอดภัย ไม่ให้บุคคลภายนอกแก้ไขข้อมูลของโรงเรียนท่านได้
            </p>
            <p>
              • <strong>รหัสแบบ A คือรหัส SMIS 8 หลัก</strong> (รหัสสถานศึกษาของ สพฐ.) ซึ่งแต่ละโรงเรียนทราบของตนเองอยู่แล้ว
            </p>
            <p>
              • เมื่อยืนยันรหัสถูกต้อง ระบบจะปลดล็อกและนำท่านเข้าสู่หน้าดูและแก้ไขข้อมูลได้ทันที
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!activeSchool || smisCode.trim().length !== 8}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ยืนยันรหัส & ปลดล็อกเพื่อแก้ไข</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
