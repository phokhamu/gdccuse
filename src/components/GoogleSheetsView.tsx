import React, { useState } from 'react';
import { DistrictStaff, SchoolStaffRecord, GASConfig } from '../types';
import { exportToGoogleSheetsExcel } from '../utils/excelExporter';
import { syncAllToServer } from '../utils/gasService';
import { ORGANIZATION_INFO } from '../data/organization';
import {
  FileSpreadsheet,
  Download,
  Save,
  RefreshCw,
  Search,
  CheckCircle2,
  Table,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface GoogleSheetsViewProps {
  districtStaffList: DistrictStaff[];
  schoolStaffList: SchoolStaffRecord[];
  gasConfig: GASConfig;
  onRefreshFromServer: () => Promise<void>;
  onRefreshFromGAS?: () => Promise<void>;
  onEditSchoolStaff: (staff: SchoolStaffRecord) => void;
  onEditDistrictStaff: (staff: DistrictStaff) => void;
  onDeleteSchoolStaff?: (id: string) => void;
  onDeleteDistrictStaff?: (id: string) => void;
}

export const GoogleSheetsView: React.FC<GoogleSheetsViewProps> = ({
  districtStaffList,
  schoolStaffList,
  gasConfig,
  onRefreshFromServer,
  onRefreshFromGAS,
  onEditSchoolStaff,
  onEditDistrictStaff,
  onDeleteSchoolStaff,
  onDeleteDistrictStaff,
}) => {
  const [activeSheet, setActiveSheet] = useState<'school' | 'district'>('school');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSavingToFile, setIsSavingToFile] = useState(false);
  const [isRefreshingGAS, setIsRefreshingGAS] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'school' | 'district';
    id: string;
    name: string;
  } | null>(null);

  const handleSaveToSystemFiles = async () => {
    setIsSavingToFile(true);
    setSaveBanner(null);
    try {
      const ok = await syncAllToServer(districtStaffList, schoolStaffList);
      if (ok) {
        setSaveBanner(
          'บันทึกข้อมูลทั้งหมดลงไฟล์ระบบ (data/district_staff.json และ data/school_staff.json) เรียบร้อยแล้ว!'
        );
      } else {
        setSaveBanner('บันทึกลงในระบบเรียบร้อยแล้ว');
      }
    } finally {
      setIsSavingToFile(false);
      setTimeout(() => setSaveBanner(null), 5000);
    }
  };

  const handleDownloadXlsx = () => {
    exportToGoogleSheetsExcel(districtStaffList, schoolStaffList);
  };

  // Filtered views
  const filteredSchoolRows = schoolStaffList.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.schoolName.toLowerCase().includes(term) ||
      s.clusterName.toLowerCase().includes(term) ||
      s.directorFirstNameTh.toLowerCase().includes(term) ||
      s.directorLastNameTh.toLowerCase().includes(term) ||
      s.clerkFirstNameTh.toLowerCase().includes(term) ||
      s.clerkLastNameTh.toLowerCase().includes(term)
    );
  });

  const filteredDistrictRows = districtStaffList.filter((d) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.firstNameTh.toLowerCase().includes(term) ||
      d.lastNameTh.toLowerCase().includes(term) ||
      d.department.toLowerCase().includes(term) ||
      d.position.toLowerCase().includes(term) ||
      d.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Google ชีต / Google Sheets File Database
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  [ไฟล์: data/district_staff.json & data/school_staff.json]
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                แผ่นงานจัดเก็บข้อมูล {ORGANIZATION_INFO.name}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {gasConfig.webAppUrl && onRefreshFromGAS && (
              <button
                onClick={async () => {
                  setIsRefreshingGAS(true);
                  try {
                    await onRefreshFromGAS();
                    setSaveBanner('ดึงข้อมูลล่าสุดจาก Google Sheets สำเร็จ!');
                    setTimeout(() => setSaveBanner(null), 4000);
                  } finally {
                    setIsRefreshingGAS(false);
                  }
                }}
                disabled={isRefreshingGAS}
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:bg-slate-400"
                title="ดึงข้อมูลล่าสุดจาก Google Sheets (Cloud)"
              >
                {isRefreshingGAS ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>ดึงข้อมูลล่าสุดจาก Google Sheets</span>
              </button>
            )}

            <button
              onClick={handleSaveToSystemFiles}
              disabled={isSavingToFile}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:bg-slate-400"
            >
              {isSavingToFile ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>บันทึกลงไฟล์ระบบ</span>
            </button>

            <button
              onClick={handleDownloadXlsx}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ Google Sheets (.xlsx)</span>
            </button>

            <button
              onClick={() => onRefreshFromServer()}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
              title="โหลดข้อมูลล่าสุด"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {saveBanner && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{saveBanner}</span>
          </div>
        )}

        {/* Tab switch & search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSheet('school')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSheet === 'school'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>แผ่นงาน: ข้อมูลโรงเรียนภายใต้เขต ({schoolStaffList.length} แถว)</span>
            </button>

            <button
              onClick={() => setActiveSheet('district')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSheet === 'district'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>แผ่นงาน: ข้อมูลผู้ใช้งานเขต ({districtStaffList.length} แถว)</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาในตาราง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-300 overflow-hidden">
        {/* Formula bar */}
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex items-center gap-3 text-xs font-mono text-slate-600">
          <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-300">
            {activeSheet === 'school' ? 'A1:R' + (filteredSchoolRows.length + 1) : 'A1:K' + (filteredDistrictRows.length + 1)}
          </span>
          <span className="text-slate-400">fx</span>
          <span className="text-slate-800 truncate">
            {activeSheet === 'school'
              ? `=FILTER('ข้อมูลโรงเรียน'!A:R, 'ข้อมูลโรงเรียน'!B:B <> "")`
              : `=FILTER('ข้อมูลผู้ใช้งานเขต'!A:K, 'ข้อมูลผู้ใช้งานเขต'!H:H <> "")`}
          </span>
          <span className="ml-auto text-[11px] text-slate-500 font-sans">
            จำนวนข้อมูล: <strong>{activeSheet === 'school' ? filteredSchoolRows.length : filteredDistrictRows.length}</strong> แถว
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          {activeSheet === 'school' ? (
            /* School Sheet Table */
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-20">
                <tr className="bg-emerald-800 text-white font-bold border-b border-emerald-900">
                  <th className="py-2.5 px-2 text-center w-10 border-r border-emerald-700">ลำดับ</th>
                  <th className="py-2.5 px-4 min-w-[200px] border-r border-emerald-700">ชื่อโรงเรียน (แบบเต็ม)</th>
                  <th className="py-2.5 px-3 min-w-[140px] border-r border-emerald-700">รูปแบบเลขที่หนังสือ</th>
                  <th className="py-2.5 px-2 min-w-[70px] border-r border-emerald-700">คำนำหน้า (ไทย) ผอ.</th>
                  <th className="py-2.5 px-3 min-w-[120px] border-r border-emerald-700">ชื่อ (ไทย) ผอ.</th>
                  <th className="py-2.5 px-3 min-w-[130px] border-r border-emerald-700">นามสกุล (ไทย) ผอ.</th>
                  <th className="py-2.5 px-2 min-w-[70px] border-r border-emerald-700">คำนำหน้า (อังกฤษ) ผอ.</th>
                  <th className="py-2.5 px-3 min-w-[120px] border-r border-emerald-700">ชื่อ (อังกฤษ) ผอ.</th>
                  <th className="py-2.5 px-3 min-w-[130px] border-r border-emerald-700">นามสกุล (อังกฤษ) ผอ.</th>
                  <th className="py-2.5 px-3 min-w-[160px] border-r border-emerald-700">e-Mail ผู้อำนวยการ</th>
                  <th className="py-2.5 px-2 min-w-[70px] border-r border-emerald-700">คำนำหน้า (ไทย) ธุรการ</th>
                  <th className="py-2.5 px-3 min-w-[120px] border-r border-emerald-700">ชื่อ (ไทย) ธุรการ</th>
                  <th className="py-2.5 px-3 min-w-[130px] border-r border-emerald-700">นามสกุล (ไทย) ธุรการ</th>
                  <th className="py-2.5 px-2 min-w-[70px] border-r border-emerald-700">คำนำหน้า (อังกฤษ) ธุรการ</th>
                  <th className="py-2.5 px-3 min-w-[120px] border-r border-emerald-700">ชื่อ (อังกฤษ) ธุรการ</th>
                  <th className="py-2.5 px-3 min-w-[130px] border-r border-emerald-700">นามสกุล (อังกฤษ) ธุรการ</th>
                  <th className="py-2.5 px-3 min-w-[160px] border-r border-emerald-700">e-Mail ธุรการ</th>
                  <th className="py-2.5 px-3 min-w-[140px] border-r border-emerald-700">กลุ่มโรงเรียน</th>
                  <th className="py-2.5 px-2 text-center w-16">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans text-slate-800">
                {filteredSchoolRows.length === 0 ? (
                  <tr>
                    <td colSpan={19} className="text-center py-12 text-slate-400">
                      ไม่พบข้อมูลโรงเรียนในแผ่นงาน
                    </td>
                  </tr>
                ) : (
                  filteredSchoolRows.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-emerald-50/50 transition-colors odd:bg-white even:bg-slate-50/60"
                    >
                      <td className="py-2 px-2 text-center font-mono text-slate-400 bg-slate-100 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-4 font-bold text-slate-900 border-r border-slate-200">
                        {item.schoolName}
                      </td>
                      <td className="py-2 px-3 font-mono border-r border-slate-200 text-blue-800">
                        {item.documentPrefix}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200">{item.directorPrefixTh || '-'}</td>
                      <td className="py-2 px-3 font-medium border-r border-slate-200">{item.directorFirstNameTh || '-'}</td>
                      <td className="py-2 px-3 font-medium border-r border-slate-200">{item.directorLastNameTh || '-'}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{item.directorPrefixEn || '-'}</td>
                      <td className="py-2 px-3 border-r border-slate-200">{item.directorFirstNameEn || '-'}</td>
                      <td className="py-2 px-3 border-r border-slate-200">{item.directorLastNameEn || '-'}</td>
                      <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{item.directorEmail || '-'}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{item.clerkPrefixTh || '-'}</td>
                      <td className="py-2 px-3 font-medium border-r border-slate-200">{item.clerkFirstNameTh || '-'}</td>
                      <td className="py-2 px-3 font-medium border-r border-slate-200">{item.clerkLastNameTh || '-'}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{item.clerkPrefixEn || '-'}</td>
                      <td className="py-2 px-3 border-r border-slate-200">{item.clerkFirstNameEn || '-'}</td>
                      <td className="py-2 px-3 border-r border-slate-200">{item.clerkLastNameEn || '-'}</td>
                      <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{item.clerkEmail || '-'}</td>
                      <td className="py-2 px-3 text-slate-700 font-semibold border-r border-slate-200">
                        {item.clusterName}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => onEditSchoolStaff(item)}
                            className="text-xs text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
                          >
                            แก้ไข
                          </button>
                          {onDeleteSchoolStaff && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirmTarget({
                                  type: 'school',
                                  id: item.id,
                                  name: item.schoolName,
                                })
                              }
                              className="text-xs text-rose-600 hover:text-rose-800 underline font-medium cursor-pointer flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>ลบ</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* District Sheet Table */
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-20">
                <tr className="bg-blue-900 text-white font-bold border-b border-blue-950">
                  <th className="py-2.5 px-2 text-center w-10 border-r border-blue-800">ลำดับ</th>
                  <th className="py-2.5 px-2 min-w-[80px] border-r border-blue-800">คำนำหน้า (ไทย)</th>
                  <th className="py-2.5 px-3 min-w-[120px] border-r border-blue-800">ชื่อ (ไทย)</th>
                  <th className="py-2.5 px-3 min-w-[130px] border-r border-blue-800">นามสกุล (ไทย)</th>
                  <th className="py-2.5 px-2 min-w-[80px] border-r border-blue-800">คำนำหน้า (อังกฤษ)</th>
                  <th className="py-2.5 px-3 min-w-[120px] border-r border-blue-800">ชื่อ (อังกฤษ)</th>
                  <th className="py-2.5 px-3 min-w-[130px] border-r border-blue-800">นามสกุล (อังกฤษ)</th>
                  <th className="py-2.5 px-4 min-w-[180px] border-r border-blue-800">e-Mail สำนักงาน ที่สามารถยืนยันตัวตนได้</th>
                  <th className="py-2.5 px-3 min-w-[160px] border-r border-blue-800">ตำแหน่ง</th>
                  <th className="py-2.5 px-4 min-w-[180px] border-r border-blue-800">สังกัด / ชื่อหน่วยงาน</th>
                  <th className="py-2.5 px-3 min-w-[130px] border-r border-blue-800">สิทธิ์ผู้ดูแลระบบ, ผู้ใช้งาน</th>
                  <th className="py-2.5 px-2 text-center w-24">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans text-slate-800">
                {filteredDistrictRows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-12 text-slate-400">
                      ไม่พบข้อมูลผู้ใช้งานเขตในแผ่นงาน
                    </td>
                  </tr>
                ) : (
                  filteredDistrictRows.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/50 transition-colors odd:bg-white even:bg-slate-50/60"
                    >
                      <td className="py-2 px-2 text-center font-mono text-slate-400 bg-slate-100 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200">{item.prefixTh}</td>
                      <td className="py-2 px-3 font-semibold border-r border-slate-200">{item.firstNameTh}</td>
                      <td className="py-2 px-3 font-semibold border-r border-slate-200">{item.lastNameTh}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{item.prefixEn}</td>
                      <td className="py-2 px-3 border-r border-slate-200">{item.firstNameEn}</td>
                      <td className="py-2 px-3 border-r border-slate-200">{item.lastNameEn}</td>
                      <td className="py-2 px-4 text-blue-700 font-mono border-r border-slate-200">
                        {item.email || '-'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">{item.position}</td>
                      <td className="py-2 px-4 border-r border-slate-200">{item.department}</td>
                      <td className="py-2 px-3 border-r border-slate-200">
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
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => onEditDistrictStaff(item)}
                            className="text-xs text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
                          >
                            แก้ไข
                          </button>
                          {onDeleteDistrictStaff && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirmTarget({
                                  type: 'district',
                                  id: item.id,
                                  name: `${item.prefixTh}${item.firstNameTh} ${item.lastNameTh} (${item.department})`,
                                })
                              }
                              className="text-xs text-rose-600 hover:text-rose-800 underline font-medium cursor-pointer flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>ลบ</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ยืนยันการลบข้อมูล?</h3>
            <div className="mt-2 text-sm text-slate-600">
              <p>ท่านต้องการลบข้อมูลรายการนี้ใช่หรือไม่:</p>
              <p className="mt-2 p-2.5 bg-slate-100 rounded-lg font-semibold text-slate-900 text-xs break-words">
                {deleteConfirmTarget.name}
              </p>
              <p className="mt-2 text-xs text-rose-600 font-medium">
                * ข้อมูลจะถูกลบออกจากระบบและไม่สามารถกู้คืนได้
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmTarget.type === 'school') {
                    onDeleteSchoolStaff?.(deleteConfirmTarget.id);
                  } else {
                    onDeleteDistrictStaff?.(deleteConfirmTarget.id);
                  }
                  setDeleteConfirmTarget(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-xs"
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
