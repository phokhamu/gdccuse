import React, { useState, useMemo } from 'react';
import { ALL_SCHOOLS, SCHOOL_CLUSTERS } from '../data/schoolsData';
import { DISTRICT_DEPARTMENTS, ORGANIZATION_INFO } from '../data/organization';
import { SchoolStaffRecord, DistrictStaff, GASConfig, SchoolInfo } from '../types';
import { SchoolSmisModal } from './SchoolSmisModal';
import {
  Users,
  School,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  PlusCircle,
  Building2,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Lock,
  RefreshCw,
} from 'lucide-react';

interface DashboardProps {
  districtStaffList: DistrictStaff[];
  schoolStaffList: SchoolStaffRecord[];
  onNavigateToSchoolForm: (schoolId?: string) => void;
  onNavigateToDistrictForm: () => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  isSyncingGAS?: boolean;
  lastSyncTime?: string;
  onRefreshFromGAS?: () => Promise<void>;
  gasConfig?: GASConfig;
  onVerifySchool?: (schoolId: string) => void;
  verifiedSchoolIds?: Set<string>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  districtStaffList,
  schoolStaffList,
  onNavigateToSchoolForm,
  onNavigateToDistrictForm,
  isAdmin = false,
  onOpenAdminLogin,
  isSyncingGAS = false,
  lastSyncTime = '',
  onRefreshFromGAS,
  gasConfig,
  onVerifySchool,
  verifiedSchoolIds,
}) => {
  // SMIS Auth Modal state for school verification (แนวทางที่ 1 • รหัสแบบ A)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalSchool, setAuthModalSchool] = useState<SchoolInfo | null>(null);

  // Search & Filters for School Table
  const [searchTerm, setSearchTerm] = useState('');
  const [clusterFilter, setClusterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'partial' | 'empty'>('all');

  // Stats calculation
  const totalSchools = ALL_SCHOOLS.length; // 212
  const targetSchoolStaff = totalSchools * 2; // 424

  // Group staff by schoolId
  const schoolStaffMap = useMemo(() => {
    const map = new Map<
      string,
      {
        record?: SchoolStaffRecord;
        directorName?: string;
        directorEmail?: string;
        clerkName?: string;
        clerkEmail?: string;
        count: number;
      }
    >();

    ALL_SCHOOLS.forEach((s) => {
      map.set(s.id, { count: 0 });
    });

    schoolStaffList.forEach((st) => {
      const hasDirector = Boolean(st.directorFirstNameTh && st.directorFirstNameTh.trim());
      const hasClerk = Boolean(st.clerkFirstNameTh && st.clerkFirstNameTh.trim());
      const count = (hasDirector ? 1 : 0) + (hasClerk ? 1 : 0);

      map.set(st.schoolId, {
        record: st,
        directorName: hasDirector
          ? `${st.directorPrefixTh}${st.directorFirstNameTh} ${st.directorLastNameTh}`
          : undefined,
        directorEmail: st.directorEmail,
        clerkName: hasClerk
          ? `${st.clerkPrefixTh}${st.clerkFirstNameTh} ${st.clerkLastNameTh}`
          : undefined,
        clerkEmail: st.clerkEmail,
        count,
      });
    });

    return map;
  }, [schoolStaffList]);

  // Overall counts
  const stats = useMemo(() => {
    let completedSchools = 0;
    let partialSchools = 0;
    let emptySchools = 0;
    let totalDirectors = 0;
    let totalClerks = 0;

    schoolStaffMap.forEach((val) => {
      if (val.count === 2) completedSchools++;
      else if (val.count === 1) partialSchools++;
      else emptySchools++;

      if (val.directorName) totalDirectors++;
      if (val.clerkName) totalClerks++;
    });

    const totalStaffMembers = totalDirectors + totalClerks;
    const completionRate = ((totalStaffMembers / targetSchoolStaff) * 100).toFixed(1);

    return {
      completedSchools,
      partialSchools,
      emptySchools,
      totalDirectors,
      totalClerks,
      totalStaffMembers,
      completionRate,
    };
  }, [schoolStaffMap, targetSchoolStaff]);

  // Cluster breakdown statistics
  const clusterStats = useMemo(() => {
    return SCHOOL_CLUSTERS.map((cluster) => {
      const schoolsInCluster = ALL_SCHOOLS.filter((s) => s.clusterId === cluster.id);
      let staffInCluster = 0;
      let fullSchools = 0;

      schoolsInCluster.forEach((sch) => {
        const staff = schoolStaffMap.get(sch.id);
        if (staff) {
          staffInCluster += staff.count;
          if (staff.count === 2) fullSchools++;
        }
      });

      const target = schoolsInCluster.length * 2;
      const pct = target > 0 ? ((staffInCluster / target) * 100).toFixed(0) : '0';

      return {
        ...cluster,
        schoolsCount: schoolsInCluster.length,
        staffInCluster,
        target,
        fullSchools,
        pct: Number(pct),
      };
    });
  }, [schoolStaffMap]);

  const departmentStats = useMemo(() => {
    return DISTRICT_DEPARTMENTS.map((dept) => {
      const count = districtStaffList.filter(
        (s) => s.department === dept || (s.department && s.department.includes(dept))
      ).length;
      return { department: dept, count };
    });
  }, [districtStaffList]);

  // Filtered Schools List
  const filteredSchools = useMemo(() => {
    return ALL_SCHOOLS.filter((sch) => {
      // 1. Cluster Filter
      if (clusterFilter && sch.clusterId !== clusterFilter) return false;

      // 2. Search Term
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchName = sch.name.toLowerCase().includes(term);
        const matchId = sch.id.includes(term);
        const matchSubdistrict = sch.subdistrict?.toLowerCase().includes(term);
        if (!matchName && !matchId && !matchSubdistrict) return false;
      }

      // 3. Status Filter
      const staff = schoolStaffMap.get(sch.id);
      const count = staff ? staff.count : 0;
      if (statusFilter === 'complete' && count !== 2) return false;
      if (statusFilter === 'partial' && count !== 1) return false;
      if (statusFilter === 'empty' && count !== 0) return false;

      return true;
    });
  }, [searchTerm, clusterFilter, statusFilter, schoolStaffMap]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Overview Hero KPI Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Dashboard สรุปผลภาพรวม
              </span>
              {isSyncingGAS ? (
                <span className="text-xs text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-teal-600" />
                  <span>กำลังดึงข้อมูลล่าสุดจาก Google Sheets...</span>
                </span>
              ) : gasConfig?.webAppUrl ? (
                <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ดึงข้อมูลจาก Google Sheets แล้ว {lastSyncTime ? `(อัปเดต ${lastSyncTime})` : ''}</span>
                </span>
              ) : (
                <span className="text-xs text-slate-500">ข้อมูลแบบ Real-time</span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
              สรุปความคืบหน้าการจัดเก็บข้อมูล {ORGANIZATION_INFO.shortName}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              ติดตามผลการกรอกข้อมูลผู้ใช้งานเขต และข้อมูลโรงเรียนในสังกัด {totalSchools} โรงเรียน (เป้าหมาย ผอ.รร. + ธุรการ รร. รวม {targetSchoolStaff} คน)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onRefreshFromGAS && gasConfig?.webAppUrl && (
              <button
                onClick={() => onRefreshFromGAS()}
                disabled={isSyncingGAS}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                title="ดึงข้อมูลล่าสุดจาก Google Sheets ทันที"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGAS ? 'animate-spin text-teal-600' : 'text-slate-600'}`} />
                <span>{isSyncingGAS ? 'กำลังดึง...' : 'ดึงข้อมูลจาก Sheets'}</span>
              </button>
            )}

            <button
              onClick={() => onNavigateToSchoolForm()}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <School className="w-4 h-4" />
              <span>กรอกข้อมูลโรงเรียน</span>
            </button>
            <button
              onClick={onNavigateToDistrictForm}
              className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>กรอกข้อมูลเขต</span>
            </button>
          </div>
        </div>

        {/* 4 Big Number KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: ผู้ใช้งานเขต (District Staff) */}
          <div className="bg-linear-to-br from-indigo-50 to-indigo-100/50 p-5 rounded-2xl border border-indigo-200 shadow-2xs">
            <div className="flex items-center justify-between text-indigo-900">
              <span className="text-sm font-bold">1. ผู้ใช้งานเขต (รวม)</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-200/70 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-700" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-950">{districtStaffList.length}</span>
              <span className="text-sm font-semibold text-indigo-700">คน</span>
            </div>
            <div className="mt-2 text-xs text-indigo-800/80 flex items-center justify-between pt-2 border-t border-indigo-200/60">
              <span>กลุ่มงานที่ส่งแล้ว:</span>
              <span className="font-bold">
                {departmentStats.filter((d) => d.count > 0).length} / {DISTRICT_DEPARTMENTS.length} กลุ่ม
              </span>
            </div>
          </div>

          {/* Card 2: บุคลากรโรงเรียนที่กรอกแล้ว (School Staff Total) */}
          <div className="bg-linear-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-900">
              <span className="text-sm font-bold">2. บุคลากร รร. ที่ส่งแล้ว</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-200/70 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-700" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-950">{stats.totalStaffMembers}</span>
              <span className="text-sm font-semibold text-emerald-700">/ {targetSchoolStaff} คน</span>
              <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                {stats.completionRate}%
              </span>
            </div>
            <div className="mt-2 text-xs text-emerald-800/80 flex items-center justify-between pt-2 border-t border-emerald-200/60">
              <span>ผอ.รร.: {stats.totalDirectors} คน</span>
              <span>•</span>
              <span>ธุรการ รร.: {stats.totalClerks} คน</span>
            </div>
          </div>

          {/* Card 3: โรงเรียนที่ส่งครบเป้าหมาย 2 คน */}
          <div className="bg-linear-to-br from-teal-50 to-teal-100/50 p-5 rounded-2xl border border-teal-200 shadow-2xs">
            <div className="flex items-center justify-between text-teal-900">
              <span className="text-sm font-bold">3. รร. ที่ส่งครบ 2 คน</span>
              <div className="w-9 h-9 rounded-xl bg-teal-200/70 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-teal-700" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-teal-950">{stats.completedSchools}</span>
              <span className="text-sm font-semibold text-teal-700">/ {totalSchools} โรงเรียน</span>
              <span className="ml-auto text-xs font-bold text-teal-700 bg-teal-200/60 px-2 py-0.5 rounded-md">
                {((stats.completedSchools / totalSchools) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="mt-2 text-xs text-teal-800/80 flex items-center justify-between pt-2 border-t border-teal-200/60">
              <span>สถานะ: ครบทั้ง ผอ. และ ธุรการ</span>
              <span className="font-bold text-teal-700">✓ สมบูรณ์</span>
            </div>
          </div>

          {/* Card 4: โรงเรียนที่ยังไม่ครบ / ยังไม่ส่ง */}
          <div className="bg-linear-to-br from-amber-50 to-amber-100/50 p-5 rounded-2xl border border-amber-200 shadow-2xs">
            <div className="flex items-center justify-between text-amber-900">
              <span className="text-sm font-bold">4. รร. ที่ยังไม่ครบเป้าหมาย</span>
              <div className="w-9 h-9 rounded-xl bg-amber-200/70 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-700" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-950">
                {stats.partialSchools + stats.emptySchools}
              </span>
              <span className="text-sm font-semibold text-amber-700">โรงเรียน</span>
            </div>
            <div className="mt-2 text-xs text-amber-800/80 flex items-center justify-between pt-2 border-t border-amber-200/60">
              <span>ส่งแล้ว 1 คน: {stats.partialSchools} รร.</span>
              <span>•</span>
              <span className="text-rose-700 font-bold">ยังไม่ส่ง: {stats.emptySchools} รร.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Performance Progress Section */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-700" />
              <span>ความคืบหน้าจำแนกตามกลุ่มโรงเรียน / กลุ่มพัฒนาคุณภาพการศึกษา (23 กลุ่ม)</span>
            </h3>
            <p className="text-xs text-slate-500">
              คลิกที่กลุ่มโรงเรียนเพื่อกรองตารางโรงเรียนด้านล่างทันที
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clusterStats.map((cl) => {
            const isSelected = clusterFilter === cl.id;
            return (
              <div
                key={cl.id}
                onClick={() => setClusterFilter(isSelected ? '' : cl.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-800">{cl.name}</span>
                  <span className="font-semibold text-blue-700">{cl.pct}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cl.pct === 100
                        ? 'bg-emerald-500'
                        : cl.pct >= 50
                        ? 'bg-blue-600'
                        : cl.pct > 0
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${cl.pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    บุคลากร: {cl.staffInCluster}/{cl.target} คน
                  </span>
                  <span>
                    ครบ 2 คน: <strong>{cl.fullSchools}/{cl.schoolsCount}</strong> รร.
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive School by School Status Table (212 Schools) */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-700" />
                <span>สถานะการบันทึกข้อมูลแยกตามโรงเรียน (ครบทั้ง 212 โรงเรียน)</span>
              </h3>
              <p className="text-xs text-slate-500">
                แสดงผลเป้าหมายโรงเรียนละ 2 คน: ผู้อำนวยการโรงเรียน (ผอ.รร.) และ เจ้าหน้าที่ธุรการโรงเรียน (ธุรการ รร.)
              </p>
            </div>

            <div className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 font-medium">
              แสดง <strong>{filteredSchools.length}</strong> จาก <strong>{totalSchools}</strong> โรงเรียน
            </div>
          </div>

          {/* School Verification Access Banner (แนวทางที่ 1 • รหัสแบบ A) */}
          <div className="bg-linear-to-r from-emerald-50 via-teal-50/80 to-slate-50 border border-emerald-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Lock className="w-4 h-4 text-emerald-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    ความปลอดภัยข้อมูลโรงเรียน
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">แนวทางที่ 1 • ยืนยันด้วยรหัสแบบ A</span>
                </div>
                <div className="font-bold text-slate-800 text-sm mt-0.5">
                  สำหรับโรงเรียน: ต้องการตรวจสอบหรือแก้ไขข้อมูลของโรงเรียนท่าน?
                </div>
                <div className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                  ระบบซ่อนปุ่มแก้ไขในตาราง Dashboard สาธารณะเพื่อความปลอดภัย — โรงเรียนสามารถยืนยันตัวตนด้วย <strong>รหัสประจำโรงเรียน (รหัส SMIS 8 หลัก)</strong> เพื่อเข้าดูและแก้ไขข้อมูล
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAuthModalSchool(null);
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-200" />
              <span>ยืนยันรหัสโรงเรียนเพื่อดู/แก้ไข</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อโรงเรียน หรือรหัสสถานศึกษา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            {/* Cluster Filter */}
            <div className="sm:col-span-4">
              <select
                value={clusterFilter}
                onChange={(e) => setClusterFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
              >
                <option value="">-- กรองทุกกลุ่มโรงเรียน (23 กลุ่ม) --</option>
                {SCHOOL_CLUSTERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.district})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="complete">✓ ครบ 2 คน ({stats.completedSchools})</option>
                <option value="partial">⏳ ส่งแล้ว 1 คน ({stats.partialSchools})</option>
                <option value="empty">✕ ยังไม่ส่ง ({stats.emptySchools})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Schools Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold border-b border-slate-200">
                <th className="py-3 px-3 w-12 text-center">ลำดับ</th>
                <th className="py-3 px-3 w-28">รหัส รร.</th>
                <th className="py-3 px-4 min-w-[200px]">ชื่อโรงเรียน</th>
                <th className="py-3 px-3 min-w-[140px]">กลุ่มโรงเรียน</th>
                <th className="py-3 px-4 min-w-[180px]">ผู้อำนวยการโรงเรียน (ผอ.รร.)</th>
                <th className="py-3 px-4 min-w-[180px]">เจ้าหน้าที่ธุรการ (ธุรการ รร.)</th>
                <th className="py-3 px-3 w-24 text-center">สถานะ</th>
                <th className="py-3 px-3 w-28 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    ไม่พบข้อมูลโรงเรียนที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredSchools.map((sch, index) => {
                  const staff = schoolStaffMap.get(sch.id);
                  const count = staff ? staff.count : 0;

                  return (
                    <tr
                      key={sch.id}
                      className="hover:bg-slate-50/80 transition-colors text-slate-800"
                    >
                      <td className="py-3 px-3 text-center text-xs text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-600">
                        {isAdmin ? (
                          <span className="font-semibold text-slate-800">{sch.id}</span>
                        ) : (
                          <span className="text-slate-400 select-none tracking-wider font-mono" title="รหัสประจำโรงเรียน 8 หลัก (ซ่อนไว้เพื่อความปลอดภัย)">
                            {sch.id.slice(0, 4)}••••
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{sch.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {sch.subdistrict ? `ต.${sch.subdistrict} ` : ''}{sch.district}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                          {sch.clusterName}
                        </span>
                      </td>

                      {/* Director Cell */}
                      <td className="py-3 px-4 text-xs">
                        {staff?.directorName ? (
                          isAdmin ? (
                            <div className="space-y-0.5">
                              <span className="font-semibold text-emerald-900 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                {staff.directorName}
                              </span>
                              {staff.directorEmail && (
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {staff.directorEmail}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ส่งข้อมูลแล้ว
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            ยังไม่ส่ง
                          </span>
                        )}
                      </td>

                      {/* Clerk Cell */}
                      <td className="py-3 px-4 text-xs">
                        {staff?.clerkName ? (
                          isAdmin ? (
                            <div className="space-y-0.5">
                              <span className="font-semibold text-emerald-900 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                {staff.clerkName}
                              </span>
                              {staff.clerkEmail && (
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {staff.clerkEmail}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ส่งข้อมูลแล้ว
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            ยังไม่ส่ง
                          </span>
                        )}
                      </td>

                      {/* Total Count Status */}
                      <td className="py-3 px-3 text-center">
                        {count === 2 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 2/2 ครบ
                          </span>
                        ) : count === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            1/2 คน
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                            0/2 คน
                          </span>
                        )}
                      </td>

                      {/* Action (แนวทางที่ 1: ซ่อนปุ่มแก้ไขในตาราง Dashboard สำหรับบุคคลทั่วไป) */}
                      <td className="py-3 px-3 text-center">
                        {count === 0 ? (
                          // Haven't submitted yet: Anyone can fill initial data
                          <button
                            type="button"
                            onClick={() => onNavigateToSchoolForm(sch.id)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-700 hover:text-white text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 w-full cursor-pointer shadow-2xs"
                            title="กรอกข้อมูลโรงเรียนใหม่"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>กรอกข้อมูล</span>
                          </button>
                        ) : isAdmin ? (
                          // Admin can directly edit
                          <button
                            type="button"
                            onClick={() => onNavigateToSchoolForm(sch.id)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-700 hover:text-white text-indigo-800 border border-indigo-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 w-full cursor-pointer shadow-2xs"
                            title="แก้ไขข้อมูล (Admin)"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>แก้ไข (Admin)</span>
                          </button>
                        ) : verifiedSchoolIds && verifiedSchoolIds.has(sch.id) ? (
                          // School already verified SMIS code in this session
                          <button
                            type="button"
                            onClick={() => onNavigateToSchoolForm(sch.id)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 w-full cursor-pointer shadow-2xs"
                            title="แก้ไขข้อมูลโรงเรียน (ยืนยันรหัส SMIS แล้ว)"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>แก้ไข (ปลดล็อก)</span>
                          </button>
                        ) : (
                          // Submitted & Not Admin: ซ่อนปุ่มแก้ไขในตาราง Dashboard อย่างสมบูรณ์!
                          <div className="flex items-center justify-center">
                            <span
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 w-full"
                              title="บันทึกข้อมูลแล้ว (ซ่อนปุ่มแก้ไขในตาราง Dashboard ตามแนวทางที่ 1 • ยืนยันรหัส SMIS 8 หลักผ่านปุ่มด้านบนเพื่อแก้ไข)"
                            >
                              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>บันทึกแล้ว</span>
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isAdmin && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong>นโยบายความมั่นคงปลอดภัย:</strong> รายชื่อบุคลากร อีเมล และแผ่นงานจัดเก็บข้อมูล ถูกจำกัดสิทธิ์เฉพาะผู้ดูแลระบบในระบบหลังบ้าน
              </span>
            </div>
            {onOpenAdminLogin && (
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer shrink-0"
              >
                เข้าสู่ระบบหลังบ้านเพื่อดูรายละเอียด ➔
              </button>
            )}
          </div>
        )}
      </div>

      {/* District Staff Breakdown by Department */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-700" />
              <span>สรุปจำนวนผู้ใช้งานเขต จำแนกตามกลุ่ม/ฝ่ายงาน (สพป.บึงกาฬ)</span>
            </h3>
            <p className="text-xs text-slate-500">
              ยอดรวมบุคลากรสำนักงานเขตพื้นที่การศึกษาที่บันทึกข้อมูลแล้วทั้งหมด: <strong>{districtStaffList.length} คน</strong>
            </p>
          </div>

          <button
            onClick={onNavigateToDistrictForm}
            className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 underline cursor-pointer"
          >
            <span>+ บันทึกบุคลากรเขตเพิ่ม</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {departmentStats.map((item, idx) => (
            <div
              key={item.department}
              className={`p-3.5 rounded-xl border ${
                item.count > 0
                  ? 'bg-indigo-50/50 border-indigo-200'
                  : 'bg-slate-50 border-slate-200 opacity-70'
              }`}
            >
              <div className="text-xs font-bold text-slate-700 truncate" title={item.department}>
                {item.department}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-indigo-950">{item.count}</span>
                <span className="text-xs text-slate-500">คน</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SMIS Authorization Modal (แนวทางที่ 1 • รหัสแบบ A) */}
      <SchoolSmisModal
        isOpen={isAuthModalOpen}
        targetSchool={authModalSchool}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthModalSchool(null);
        }}
        onSuccess={(schoolId) => {
          setIsAuthModalOpen(false);
          setAuthModalSchool(null);
          if (onVerifySchool) onVerifySchool(schoolId);
          onNavigateToSchoolForm(schoolId);
        }}
      />
    </div>
  );
};
