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
} from 'lucide-react';

interface DataTableExportProps {
  districtStaffList: DistrictStaff[];
  schoolStaffList: SchoolStaffRecord[];
  onDeleteDistrictStaff: (id: string) => void;
  onDeleteSchoolStaff: (id: string) => void;
  onEditDistrictStaff: (staff: DistrictStaff) => void;
  onEditSchoolStaff: (staff: SchoolStaffRecord) => void;
}

export const DataTableExport: React.FC<DataTableExportProps> = ({
  districtStaffList,
  schoolStaffList,
  onDeleteDistrictStaff,
  onDeleteSchoolStaff,
  onEditDistrictStaff,
  onEditSchoolStaff,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'school' | 'district'>('school');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title & Actions Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                ระบบจัดการข้อมูล & ส่งออก
              </span>
              <span className="text-xs text-slate-500">สพป.บึงกาฬ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
              ตารางรายการข้อมูลและเครื่องมือส่งออก (Export)
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              ตรวจสอบ แก้ไข ลบ และดาวน์โหลดข้อมูลเป็นไฟล์ Google Sheets (.xlsx) หรือ CSV (UTF-8)
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
                  <th className="py-3 px-3 w-12 text-center">ลำดับ</th>
                  <th className="py-3 px-4">ชื่อโรงเรียน (แบบเต็ม)</th>
                  <th className="py-3 px-3">เลขที่หนังสือ</th>
                  <th className="py-3 px-4">ผู้อำนวยการโรงเรียน</th>
                  <th className="py-3 px-3">อีเมล ผอ.</th>
                  <th className="py-3 px-4">ธุรการโรงเรียน</th>
                  <th className="py-3 px-3">อีเมล ธุรการ</th>
                  <th className="py-3 px-3">กลุ่มโรงเรียน</th>
                  <th className="py-3 px-3 w-20 text-center no-print">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                {filteredSchoolStaff.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-400">
                      ไม่พบข้อมูลโรงเรียน
                    </td>
                  </tr>
                ) : (
                  filteredSchoolStaff.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.schoolName}</td>
                      <td className="py-3 px-3 font-mono text-blue-800">{item.documentPrefix}</td>
                      <td className="py-3 px-4">
                        {item.directorFirstNameTh ? (
                          <div>
                            <span className="font-semibold text-slate-900">
                              {item.directorPrefixTh}{item.directorFirstNameTh} {item.directorLastNameTh}
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
                              {item.clerkPrefixTh}{item.clerkFirstNameTh} {item.clerkLastNameTh}
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
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditSchoolStaff(item)}
                            title="แก้ไขข้อมูล"
                            className="p-1.5 rounded-md hover:bg-blue-100 text-blue-700 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item.id)}
                            title="ลบข้อมูล"
                            className="p-1.5 rounded-md hover:bg-rose-100 text-rose-700 cursor-pointer"
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
                  <th className="py-3 px-3 w-12 text-center">ลำดับ</th>
                  <th className="py-3 px-4">ชื่อ - นามสกุล (ไทย)</th>
                  <th className="py-3 px-4">Name - Surname (Eng)</th>
                  <th className="py-3 px-4">e-Mail สำนักงาน ที่สามารถยืนยันตัวตนได้</th>
                  <th className="py-3 px-4">ตำแหน่ง</th>
                  <th className="py-3 px-4">สังกัด / ชื่อหน่วยงาน</th>
                  <th className="py-3 px-3 text-center">สิทธิ์การใช้งาน</th>
                  <th className="py-3 px-3 w-20 text-center no-print">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                {filteredDistrictStaff.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                      ไม่พบข้อมูลผู้ใช้งานเขต
                    </td>
                  </tr>
                ) : (
                  filteredDistrictStaff.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.prefixTh}{item.firstNameTh} {item.lastNameTh}
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
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditDistrictStaff(item)}
                            title="แก้ไขข้อมูล"
                            className="p-1.5 rounded-md hover:bg-blue-100 text-blue-700 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item.id)}
                            title="ลบข้อมูล"
                            className="p-1.5 rounded-md hover:bg-rose-100 text-rose-700 cursor-pointer"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">ยืนยันการลบข้อมูล?</h3>
            <p className="text-sm text-slate-600 mt-2">
              ท่านต้องการลบรายการข้อมูลนี้ใช่หรือไม่ การดำเนินการนี้ไม่สามารถยกเลิกได้
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeSubTab === 'school') {
                    onDeleteSchoolStaff(deleteConfirmId);
                  } else {
                    onDeleteDistrictStaff(deleteConfirmId);
                  }
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
