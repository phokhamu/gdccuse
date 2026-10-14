import React, { useState, useMemo } from 'react';
import { DistrictStaff, SchoolStaffRecord } from '../types';
import { ORGANIZATION_INFO } from '../data/organization';
import { exportToGoogleSheetsExcel } from '../utils/excelExporter';
import {
  Download,
  Printer,
  Trash2,
  Edit,
  Search,
  School,
  Building2,
  FileSpreadsheet,
  CheckSquare,
  Square,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface DataTableExportProps {
  districtStaffList: DistrictStaff[];
  schoolStaffList: SchoolStaffRecord[];
  onDeleteDistrictStaff: (id: string) => void;
  onDeleteSchoolStaff: (id: string) => void;
  onBatchDeleteDistrictStaff?: (ids: string[]) => void;
  onBatchDeleteSchoolStaff?: (ids: string[]) => void;
  onEditDistrictStaff: (staff: DistrictStaff) => void;
  onEditSchoolStaff: (staff: SchoolStaffRecord) => void;
  onClearAllData?: () => void;
}

export const DataTableExport: React.FC<DataTableExportProps> = ({
  districtStaffList,
  schoolStaffList,
  onDeleteDistrictStaff,
  onDeleteSchoolStaff,
  onBatchDeleteDistrictStaff,
  onBatchDeleteSchoolStaff,
  onEditDistrictStaff,
  onEditSchoolStaff,
  onClearAllData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'school' | 'district'>('school');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState('');
  
  // Single delete state with target info
  const [deleteTargetInfo, setDeleteTargetInfo] = useState<{ id: string; name: string } | null>(null);
  
  // Batch selection state
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<Set<string>>(new Set());
  const [selectedDistrictIds, setSelectedDistrictIds] = useState<Set<string>>(new Set());
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filtered School Staff
  const filteredSchoolStaff = useMemo(() => {
    return schoolStaffList.filter((item) => {
      if (selectedClusterFilter && item.clusterId !== selectedClusterFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        return (
          item.schoolName.toLowerCase().includes(term) ||
          item.clusterName.toLowerCase().includes(term) ||
          item.directorFirstNameTh.toLowerCase().includes(term) ||
          item.directorLastNameTh.toLowerCase().includes(term) ||
          item.clerkFirstNameTh.toLowerCase().includes(term) ||
          item.clerkLastNameTh.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [schoolStaffList, searchTerm, selectedClusterFilter]);

  // Filtered District Staff
  const filteredDistrictStaff = useMemo(() => {
    return districtStaffList.filter((item) => {
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        return (
          item.firstNameTh.toLowerCase().includes(term) ||
          item.lastNameTh.toLowerCase().includes(term) ||
          item.department.toLowerCase().includes(term) ||
          item.position.toLowerCase().includes(term) ||
          item.email.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [districtStaffList, searchTerm]);

  // Export CSV for School Staff with Thai BOM
  const exportSchoolCSV = () => {
    const headers = [
      'ลำดับ',
      'ชื่อโรงเรียน (แบบเต็ม)',
      'รูปแบบเลขที่หนังสือ',
      'คำนำหน้า (ภาษาไทย) ผู้อำนวยการโรงเรียน',
      'ชื่อ (ภาษาไทย) ผู้อำนวยการโรงเรียน',
      'นามสกุล (ภาษาไทย) ผู้อำนวยการโรงเรียน',
      'คำนำหน้า (ภาษาอังกฤษ) ผู้อำนวยการโรงเรียน',
      'ชื่อ (ภาษาอังกฤษ) ผู้อำนวยการโรงเรียน',
      'นามสกุล (ภาษาอังกฤษ) ผู้อำนวยการโรงเรียน',
      'e-Mail ผู้อำนวยการโรงเรียน',
      'คำนำหน้า (ภาษาไทย) ธุรการโรงเรียน',
      'ชื่อ (ภาษาไทย) ธุรการโรงเรียน',
      'นามสกุล (ภาษาไทย) ธุรการโรงเรียน',
      'คำนำหน้า (ภาษาอังกฤษ) ธุรการโรงเรียน',
      'ชื่อ (ภาษาอังกฤษ) ธุรการโรงเรียน',
      'นามสกุล (ภาษาอังกฤษ) ธุรการโรงเรียน',
      'e-Mail ธุรการโรงเรียน',
      'กลุ่มโรงเรียน',
      'วันที่บันทึก',
    ];

    const rows = filteredSchoolStaff.map((item, idx) => [
      idx + 1,
      `"${item.schoolName.replace(/"/g, '""')}"`,
      `"${(item.documentPrefix || '').replace(/"/g, '""')}"`,
      `"${item.directorPrefixTh || ''}"`,
      `"${item.directorFirstNameTh || ''}"`,
      `"${item.directorLastNameTh || ''}"`,
      `"${item.directorPrefixEn || ''}"`,
      `"${item.directorFirstNameEn || ''}"`,
      `"${item.directorLastNameEn || ''}"`,
      `"${item.directorEmail || ''}"`,
      `"${item.clerkPrefixTh || ''}"`,
      `"${item.clerkFirstNameTh || ''}"`,
      `"${item.clerkLastNameTh || ''}"`,
      `"${item.clerkPrefixEn || ''}"`,
      `"${item.clerkFirstNameEn || ''}"`,
      `"${item.clerkLastNameEn || ''}"`,
      `"${item.clerkEmail || ''}"`,
      `"${item.clusterName.replace(/"/g, '""')}"`,
      `"${item.createdAt}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ข้อมูลโรงเรียน_สพป_บึงกาฬ_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV for District Staff
  const exportDistrictCSV = () => {
    const headers = [
      'ลำดับ',
      'คำนำหน้า (ภาษาไทย)',
      'ชื่อ (ภาษาไทย)',
      'นามสกุล (ภาษาไทย)',
      'คำนำหน้า (ภาษาอังกฤษ)',
      'ชื่อ (ภาษาอังกฤษ)',
      'นามสกุล (ภาษาอังกฤษ)',
      'e-Mail สำนักงาน ที่สามารถยืนยันตัวตนได้',
      'ตำแหน่ง',
      'สังกัด / ชื่อหน่วยงาน',
      'สิทธิ์ผู้ดูแลระบบ, ผู้ใช้งาน',
      'วันที่บันทึก',
    ];

    const rows = filteredDistrictStaff.map((item, idx) => [
      idx + 1,
      `"${item.prefixTh || ''}"`,
      `"${item.firstNameTh || ''}"`,
      `"${item.lastNameTh || ''}"`,
      `"${item.prefixEn || ''}"`,
      `"${item.firstNameEn || ''}"`,
      `"${item.lastNameEn || ''}"`,
      `"${item.email || ''}"`,
      `"${item.position || ''}"`,
      `"${item.department || ''}"`,
      `"${item.rolePermission || 'ผู้ใช้งาน'}"`,
      `"${item.createdAt}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ข้อมูลผู้ใช้งานเขต_สพป_บึงกาฬ_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Selection states & handlers
  const currentSelectedSet = activeSubTab === 'school' ? selectedSchoolIds : selectedDistrictIds;
  const setCurrentSelectedSet = activeSubTab === 'school' ? setSelectedSchoolIds : setSelectedDistrictIds;
  const currentList = activeSubTab === 'school' ? filteredSchoolStaff : filteredDistrictStaff;

  const isAllSelected = currentList.length > 0 && currentList.every((item) => currentSelectedSet.has(item.id));
  const isSomeSelected = currentList.some((item) => currentSelectedSet.has(item.id)) && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setCurrentSelectedSet(new Set());
    } else {
      setCurrentSelectedSet(new Set(currentList.map((item) => item.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const next = new Set(currentSelectedSet);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCurrentSelectedSet(next);
  };

  const handleExecuteSingleDelete = () => {
    if (!deleteTargetInfo) return;
    const { id, name } = deleteTargetInfo;
    if (activeSubTab === 'school') {
      onDeleteSchoolStaff(id);
      setSelectedSchoolIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      onDeleteDistrictStaff(id);
      setSelectedDistrictIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    setDeleteTargetInfo(null);
    setSuccessToast(`ลบข้อมูล "${name}" ออกจากระบบเรียบร้อยแล้ว`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleExecuteBatchDelete = () => {
    const ids = Array.from(currentSelectedSet);
    if (ids.length === 0) return;

    if (activeSubTab === 'school') {
      if (onBatchDeleteSchoolStaff) {
        onBatchDeleteSchoolStaff(ids);
      } else {
        ids.forEach((id) => onDeleteSchoolStaff(id));
      }
      setSelectedSchoolIds(new Set());
      setSuccessToast(`ลบข้อมูลโรงเรียนที่เลือกจำนวน ${ids.length} แห่งเรียบร้อยแล้ว`);
    } else {
      if (onBatchDeleteDistrictStaff) {
        onBatchDeleteDistrictStaff(ids);
      } else {
        ids.forEach((id) => onDeleteDistrictStaff(id));
      }
      setSelectedDistrictIds(new Set());
      setSuccessToast(`ลบข้อมูลผู้ใช้งานเขตที่เลือกจำนวน ${ids.length} รายการเรียบร้อยแล้ว`);
    }
    setShowBatchDeleteModal(false);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 duration-150 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Title & Actions Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                ระบบจัดการข้อมูล & ลบข้อมูล
              </span>
              <span className="text-xs text-slate-500">สพป.บึงกาฬ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
              ตารางรายการข้อมูลและเครื่องมือจัดการข้อมูล (Data Management & Export)
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              ตรวจสอบ แก้ไข ลบข้อมูลทีละรายการ ลบเป็นกลุ่ม (Batch Delete) หรือส่งออกข้อมูลเป็นไฟล์ Excel (.xlsx) / CSV
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportToGoogleSheetsExcel(districtStaffList, schoolStaffList)}
              className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ Google Sheets (.xlsx)</span>
            </button>
            <button
              onClick={activeSubTab === 'school' ? exportSchoolCSV : exportDistrictCSV}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด CSV (UTF-8)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์รายงานสรุป</span>
            </button>
            {onClearAllData && (districtStaffList.length > 0 || schoolStaffList.length > 0) && (
              <button
                type="button"
                onClick={() => setShowClearAllModal(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                title="ลบข้อมูลที่บันทึกทั้งหมดออกจากระบบ"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>ล้างข้อมูลทั้งหมด</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setActiveSubTab('school');
                setSearchTerm('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'school'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <School className="w-4 h-4" />
              <span>ข้อมูลโรงเรียน ({schoolStaffList.length} แห่ง)</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab('district');
                setSearchTerm('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'district'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>ข้อมูลผู้ใช้งานเขต ({districtStaffList.length} คน)</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, กลุ่ม, ตำแหน่ง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Batch Action Bar if items selected */}
      {currentSelectedSet.size > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs no-print animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2.5 text-xs text-amber-950 font-bold">
            <CheckSquare className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              กำลังเลือกอยู่ <strong>{currentSelectedSet.size}</strong> รายการ ({activeSubTab === 'school' ? 'โรงเรียน' : 'ผู้ใช้งานเขต'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentSelectedSet(new Set())}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              ยกเลิกการเลือก
            </button>
            <button
              type="button"
              onClick={() => setShowBatchDeleteModal(true)}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบรายการที่เลือก ({currentSelectedSet.size} รายการ)</span>
            </button>
          </div>
        </div>
      )}

      {/* Printable Header */}
      <div className="hidden print-only mb-6">
        <h1 className="text-xl font-bold text-center">{ORGANIZATION_INFO.name}</h1>
        <h2 className="text-sm text-center text-slate-600 mt-1">
          รายงานผลการจัดเก็บข้อมูล{' '}
          {activeSubTab === 'school' ? 'ข้อมูลโรงเรียนภายใต้เขต (212 โรงเรียน)' : 'ข้อมูลผู้ใช้งานเขต'}
        </h2>
        <p className="text-xs text-center text-slate-500 mt-0.5">
          พิมพ์เมื่อ: {new Date().toLocaleString('th-TH')}
        </p>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {activeSubTab === 'school' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 text-xs font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center no-print">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                      title="เลือกทั้งหมด"
                    />
                  </th>
                  <th className="py-3 px-3 w-12 text-center">ลำดับ</th>
                  <th className="py-3 px-4">ชื่อโรงเรียน (แบบเต็ม)</th>
                  <th className="py-3 px-3">เลขที่หนังสือ</th>
                  <th className="py-3 px-4">ผู้อำนวยการโรงเรียน</th>
                  <th className="py-3 px-3">อีเมล ผอ.</th>
                  <th className="py-3 px-4">ธุรการโรงเรียน</th>
                  <th className="py-3 px-3">อีเมล ธุรการ</th>
                  <th className="py-3 px-3">กลุ่มโรงเรียน</th>
                  <th className="py-3 px-3 w-24 text-center no-print">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                {filteredSchoolStaff.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-slate-400">
                      ไม่พบข้อมูลโรงเรียน
                    </td>
                  </tr>
                ) : (
                  filteredSchoolStaff.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        selectedSchoolIds.has(item.id) ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center no-print">
                        <input
                          type="checkbox"
                          checked={selectedSchoolIds.has(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.schoolName}</td>
                      <td className="py-3 px-3 font-mono text-blue-800">{item.documentPrefix}</td>
                      <td className="py-3 px-4">
                        {item.directorFirstNameTh ? (
                          <div>
                            <span className="font-semibold text-slate-900">
                              {item.directorPrefixTh}
                              {item.directorFirstNameTh} {item.directorLastNameTh}
                            </span>
                            <div className="text-[11px] text-slate-500">
                              {item.directorPrefixEn} {item.directorFirstNameEn} {item.directorLastNameEn}
                            </div>
                          </div>
                        ) : (
                          <span className="text-rose-500 italic">ยังไม่ระบุ</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono">{item.directorEmail || '-'}</td>
                      <td className="py-3 px-4">
                        {item.clerkFirstNameTh ? (
                          <div>
                            <span className="font-semibold text-slate-900">
                              {item.clerkPrefixTh}
                              {item.clerkFirstNameTh} {item.clerkLastNameTh}
                            </span>
                            <div className="text-[11px] text-slate-500">
                              {item.clerkPrefixEn} {item.clerkFirstNameEn} {item.clerkLastNameEn}
                            </div>
                          </div>
                        ) : (
                          <span className="text-rose-500 italic">ยังไม่ระบุ</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono">{item.clerkEmail || '-'}</td>
                      <td className="py-3 px-3 font-medium text-emerald-800">{item.clusterName}</td>
                      <td className="py-3 px-3 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditSchoolStaff(item)}
                            title="แก้ไขข้อมูล"
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-700 cursor-pointer transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetInfo({ id: item.id, name: item.schoolName })}
                            title="ลบข้อมูลรายการนี้"
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-700 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 text-xs font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center no-print">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                      title="เลือกทั้งหมด"
                    />
                  </th>
                  <th className="py-3 px-3 w-12 text-center">ลำดับ</th>
                  <th className="py-3 px-4">ชื่อ - นามสกุล (ไทย)</th>
                  <th className="py-3 px-4">Name - Surname (Eng)</th>
                  <th className="py-3 px-4">e-Mail สำนักงาน ที่สามารถยืนยันตัวตนได้</th>
                  <th className="py-3 px-4">ตำแหน่ง</th>
                  <th className="py-3 px-4">สังกัด / ชื่อหน่วยงาน</th>
                  <th className="py-3 px-3 text-center">สิทธิ์การใช้งาน</th>
                  <th className="py-3 px-3 w-24 text-center no-print">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                {filteredDistrictStaff.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-400">
                      ไม่พบข้อมูลผู้ใช้งานเขต
                    </td>
                  </tr>
                ) : (
                  filteredDistrictStaff.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        selectedDistrictIds.has(item.id) ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center no-print">
                        <input
                          type="checkbox"
                          checked={selectedDistrictIds.has(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.prefixTh}
                        {item.firstNameTh} {item.lastNameTh}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.prefixEn} {item.firstNameEn} {item.lastNameEn}
                      </td>
                      <td className="py-3 px-4 text-blue-700 font-mono font-medium">
                        {item.email || '-'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{item.position}</td>
                      <td className="py-3 px-4 text-slate-600">{item.department}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.rolePermission === 'ผู้ดูแลระบบ'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {item.rolePermission}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditDistrictStaff(item)}
                            title="แก้ไขข้อมูล"
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-700 cursor-pointer transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTargetInfo({
                                id: item.id,
                                name: `${item.prefixTh}${item.firstNameTh} ${item.lastNameTh} (${item.department})`,
                              })
                            }
                            title="ลบข้อมูลรายการนี้"
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-700 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Single Delete Confirmation Modal */}
      {deleteTargetInfo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ยืนยันการลบข้อมูล?</h3>
            <div className="mt-2 text-sm text-slate-600">
              <p>ท่านต้องการลบรายการข้อมูลนี้ใช่หรือไม่:</p>
              <p className="mt-2 p-2.5 bg-slate-100 rounded-lg font-semibold text-slate-900 text-xs break-words">
                {deleteTargetInfo.name}
              </p>
              <p className="mt-2 text-xs text-rose-600 font-medium">
                * ข้อมูลจะถูกลบออกจากระบบและไม่สามารถกู้คืนได้
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetInfo(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleExecuteSingleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Delete Confirmation Modal */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ยืนยันการลบแบบกลุ่ม?</h3>
            <div className="mt-2 text-sm text-slate-600 space-y-2">
              <p>
                ท่านกำลังจะลบข้อมูลที่เลือกทั้งหมดจำนวน{' '}
                <strong className="text-rose-600 text-base">{currentSelectedSet.size}</strong> รายการ (
                {activeSubTab === 'school' ? 'โรงเรียน' : 'ผู้ใช้งานเขต'})
              </p>
              <p className="text-xs text-rose-600 font-medium">
                * ข้อมูลที่ถูกเลือกทั้งหมดจะถูกลบออกจากระบบทันทีและไม่สามารถเรียกคืนได้
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                ยืนยันลบ {currentSelectedSet.size} รายการ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ยืนยันการล้างข้อมูลทั้งหมด?</h3>
            <p className="text-sm text-slate-600 mt-2">
              ระบบจะลบข้อมูลที่บันทึกไว้ทั้งหมด (ทั้งบุคลากรเขตและโรงเรียน) การดำเนินการนี้ไม่สามารถเรียกคืนได้
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClearAllData) {
                    onClearAllData();
                    setSelectedSchoolIds(new Set());
                    setSelectedDistrictIds(new Set());
                    setSuccessToast('ล้างข้อมูลทั้งหมดในระบบเรียบร้อยแล้ว');
                    setTimeout(() => setSuccessToast(null), 4000);
                  }
                  setShowClearAllModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                ยืนยันล้างข้อมูลทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
