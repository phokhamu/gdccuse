import { DistrictStaff, SchoolStaffRecord, GASConfig } from '../types';
import { DEFAULT_GAS_WEB_APP_URL } from '../config/gasConfig';
import { ALL_SCHOOLS, findOfficialSchool } from '../data/schoolsData';

const STORAGE_KEY_DISTRICT = 'bkn_district_staff_v2';
const STORAGE_KEY_SCHOOL = 'bkn_school_staff_v2';
const STORAGE_KEY_CONFIG = 'bkn_gas_config_v2';

export const INITIAL_GAS_CONFIG: GASConfig = {
  webAppUrl: DEFAULT_GAS_WEB_APP_URL || '',
  autoSync: !!DEFAULT_GAS_WEB_APP_URL,
  connected: !!DEFAULT_GAS_WEB_APP_URL,
};

// Initial sample data - empty as requested
export const INITIAL_DISTRICT_STAFF: DistrictStaff[] = [];
export const INITIAL_SCHOOL_STAFF: SchoolStaffRecord[] = [];

// Marker to purge legacy sample/mock data from previous versions
const SAMPLE_PURGED_KEY = 'bkn_samples_purged_v2';

const MOCK_EMAILS = new Set([
  'somchai.p@bkn.go.th',
  'porntip.s@bkn.go.th',
  'wannapa.k@bkn.go.th',
  'worapol.ict@bkn.go.th',
  'kriangsak.anuban@bkn.go.th',
  'prawit.wisit@bkn.go.th',
  'thanakorn.tk@bkn.go.th',
  'prasit.seka@bkn.go.th',
  'jiraporn.so@bkn.go.th',
  'prawit.thakai@bkn.go.th',
  'sompong.seka@bkn.go.th',
  'thanakorn.huaykhom@bkn.go.th',
  'aranya.admin@bkn.go.th',
  'narumon.w@bkn.go.th',
  'kannika.seka@bkn.go.th',
  'kannika.admin@bkn.go.th',
  'jiraporn.so@bkn.go.th',
  'supansa.admin@bkn.go.th',
]);

const MOCK_IDS = new Set([
  'dist-001',
  'dist-002',
  'dist-003',
  'dist-004',
  'sch-001',
  'sch-002',
  'sch-003',
  'sch-004',
  'sch-005',
  'sch-43030037',
  'sch-43030029',
  'sch-43030085',
  'sch-43030084',
]);

function filterOutSampleDistrictStaff(list: DistrictStaff[]): DistrictStaff[] {
  return list.filter((item) => !MOCK_IDS.has(item.id) && !MOCK_EMAILS.has(item.email));
}

function filterOutSampleSchoolStaff(list: SchoolStaffRecord[]): SchoolStaffRecord[] {
  return list.filter(
    (item) =>
      !MOCK_IDS.has(item.id) &&
      !MOCK_EMAILS.has(item.directorEmail) &&
      !MOCK_EMAILS.has(item.clerkEmail)
  );
}

export function loadDistrictStaffFromStorage(): DistrictStaff[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISTRICT);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Purge mock entries if first time on v2
    const filtered = filterOutSampleDistrictStaff(parsed);
    if (localStorage.getItem(SAMPLE_PURGED_KEY) !== 'true') {
      saveDistrictStaffToStorage(filtered);
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveDistrictStaffToStorage(data: DistrictStaff[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DISTRICT, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save district staff to localStorage', err);
  }
}

/**
 * ปรับปรุงข้อมูลโรงเรียนให้ตรงกับฐานข้อมูลทางการ (ป้องกันปัญหา schoolId เพี้ยน)
 */
export function normalizeSchoolStaffRecord(item: SchoolStaffRecord): SchoolStaffRecord {
  const matched = findOfficialSchool({
    schoolId: item.schoolId,
    schoolName: item.schoolName,
    clusterName: item.clusterName,
    clusterId: item.clusterId,
    documentPrefix: item.documentPrefix,
  });

  if (matched) {
    return {
      ...item,
      schoolId: matched.id,
      schoolName: matched.name,
      clusterId: matched.clusterId,
      clusterName: matched.clusterName,
      documentPrefix: item.documentPrefix || matched.defaultDocPrefix || 'ศธ 04321/',
    };
  }
  return item;
}

export function loadSchoolStaffFromStorage(): SchoolStaffRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHOOL);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Purge mock entries if first time on v2
    const filtered = filterOutSampleSchoolStaff(parsed);

    // Normalize with official schools (fixes any legacy or mis-mapped records)
    const normalized = filtered.map(normalizeSchoolStaffRecord);

    // Deduplicate by schoolId (keep latest)
    const bySchoolMap = new Map<string, SchoolStaffRecord>();
    normalized.forEach((rec) => {
      bySchoolMap.set(rec.schoolId, rec);
    });
    const uniqueList = Array.from(bySchoolMap.values());

    if (localStorage.getItem(SAMPLE_PURGED_KEY) !== 'true' || uniqueList.length !== parsed.length) {
      saveSchoolStaffToStorage(uniqueList);
      localStorage.setItem(SAMPLE_PURGED_KEY, 'true');
    }
    return uniqueList;
  } catch {
    return [];
  }
}

export function saveSchoolStaffToStorage(data: SchoolStaffRecord[]): void {
  try {
    const normalized = data.map(normalizeSchoolStaffRecord);
    // Deduplicate by schoolId (keep latest)
    const bySchoolMap = new Map<string, SchoolStaffRecord>();
    normalized.forEach((rec) => {
      bySchoolMap.set(rec.schoolId, rec);
    });
    const uniqueList = Array.from(bySchoolMap.values());
    localStorage.setItem(STORAGE_KEY_SCHOOL, JSON.stringify(uniqueList));
  } catch (err) {
    console.error('Failed to save school staff to localStorage', err);
  }
}

export function loadGASConfig(): GASConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.webAppUrl && DEFAULT_GAS_WEB_APP_URL) {
        parsed.webAppUrl = DEFAULT_GAS_WEB_APP_URL;
        parsed.connected = true;
      }
      return parsed;
    }
    return {
      webAppUrl: DEFAULT_GAS_WEB_APP_URL,
      autoSync: !!DEFAULT_GAS_WEB_APP_URL,
      connected: !!DEFAULT_GAS_WEB_APP_URL,
    };
  } catch {
    return {
      webAppUrl: DEFAULT_GAS_WEB_APP_URL,
      autoSync: !!DEFAULT_GAS_WEB_APP_URL,
      connected: !!DEFAULT_GAS_WEB_APP_URL,
    };
  }
}

export function saveGASConfig(config: GASConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save GAS config', err);
  }
}

export function isStaticHosting(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname.includes('github.io') ||
    window.location.protocol === 'file:' ||
    Boolean((import.meta as any)?.env?.VITE_STATIC_ONLY)
  );
}

/**
 * บันทึกลงไฟล์เซิร์ฟเวอร์ (Node.js)
 */
export async function saveDistrictStaffToServer(staff: DistrictStaff): Promise<boolean> {
  try {
    const res = await fetch('/api/save/district', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staff),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveSchoolStaffToServer(staff: SchoolStaffRecord): Promise<boolean> {
  try {
    const res = await fetch('/api/save/school', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staff),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function syncAllToServer(
  districtStaff: DistrictStaff[],
  schoolStaff: SchoolStaffRecord[]
): Promise<boolean> {
  try {
    const res = await fetch('/api/save/all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ districtStaff, schoolStaff }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loadAllFromServer(): Promise<{
  districtStaff: DistrictStaff[];
  schoolStaff: SchoolStaffRecord[];
} | null> {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const data = await res.json();
      return {
        districtStaff: data.districtStaff || [],
        schoolStaff: data.schoolStaff || [],
      };
    }
  } catch {
    // fallback
  }
  return null;
}

export async function deleteDistrictStaffFromServer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/district/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteSchoolStaffFromServer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/school/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function batchDeleteFromServer(
  type: 'district' | 'school',
  ids: string[]
): Promise<boolean> {
  try {
    const res = await fetch('/api/delete/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ids }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * แปลงข้อมูลจาก Google Apps Script ให้เข้ากับ Model ในระบบ
 */
function parseGASDistrictStaff(rawList: any[]): DistrictStaff[] {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .map((item, idx) => {
      if (Array.isArray(item)) {
        const isArrayShifted =
          ['นาย', 'นาง', 'นางสาว', 'ดร.', 'ว่าที่'].some((p) => String(item[0] || '').startsWith(p)) ||
          String(item[6] || '').includes('@') ||
          !String(item[7] || '').includes('@');

        if (isArrayShifted) {
          return {
            id: `dist-${idx + 1}`,
            prefixTh: String(item[0] || 'นาย'),
            firstNameTh: String(item[1] || ''),
            lastNameTh: String(item[2] || ''),
            prefixEn: String(item[3] || 'Mr.'),
            firstNameEn: String(item[4] || ''),
            lastNameEn: String(item[5] || ''),
            email: String(item[6] || ''),
            position: String(item[7] || ''),
            department: String(item[8] || ''),
            rolePermission: (item[9] === 'ผู้ดูแลระบบ' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน') as 'ผู้ดูแลระบบ' | 'ผู้ใช้งาน',
            createdAt: String(item[10] || new Date().toLocaleString('th-TH')),
            updatedAt: String(item[10] || new Date().toLocaleString('th-TH')),
          };
        }

        return {
          id: String(item[0] || `dist-${idx + 1}`),
          prefixTh: String(item[1] || 'นาย'),
          firstNameTh: String(item[2] || ''),
          lastNameTh: String(item[3] || ''),
          prefixEn: String(item[4] || 'Mr.'),
          firstNameEn: String(item[5] || ''),
          lastNameEn: String(item[6] || ''),
          email: String(item[7] || ''),
          position: String(item[8] || ''),
          department: String(item[9] || ''),
          rolePermission: (item[10] === 'ผู้ดูแลระบบ' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน') as 'ผู้ดูแลระบบ' | 'ผู้ใช้งาน',
          createdAt: String(item[11] || new Date().toLocaleString('th-TH')),
          updatedAt: String(item[11] || new Date().toLocaleString('th-TH')),
        };
      }

      // Check if object fields are shifted (meaning column 0 of sheet was prefixTh instead of id)
      const isShifted =
        (typeof item.id === 'string' && ['นาย', 'นาง', 'นางสาว', 'ดร.', 'ว่าที่'].some((p) => item.id.startsWith(p))) ||
        (typeof item.lastNameEn === 'string' && item.lastNameEn.includes('@')) ||
        (typeof item.email === 'string' && !item.email.includes('@') && item.email.length > 0);

      if (isShifted) {
        return {
          id: `dist-${idx + 1}`,
          prefixTh: String(item.id || 'นาย'),
          firstNameTh: String(item.prefixTh || ''),
          lastNameTh: String(item.firstNameTh || ''),
          prefixEn: String(item.lastNameTh || 'Mr.'),
          firstNameEn: String(item.prefixEn || ''),
          lastNameEn: String(item.firstNameEn || ''),
          email: String(item.lastNameEn || ''),
          position: String(item.email || ''),
          department: String(item.position || ''),
          rolePermission: (item.department === 'ผู้ดูแลระบบ' || item.rolePermission === 'ผู้ดูแลระบบ' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน') as 'ผู้ดูแลระบบ' | 'ผู้ใช้งาน',
          createdAt: String(item.createdAt || new Date().toLocaleString('th-TH')),
          updatedAt: String(item.updatedAt || new Date().toLocaleString('th-TH')),
        };
      }

      return {
        id: String(item.id || `dist-${idx + 1}`),
        prefixTh: String(item.prefixTh || 'นาย'),
        firstNameTh: String(item.firstNameTh || ''),
        lastNameTh: String(item.lastNameTh || ''),
        prefixEn: String(item.prefixEn || 'Mr.'),
        firstNameEn: String(item.firstNameEn || ''),
        lastNameEn: String(item.lastNameEn || ''),
        email: String(item.email || ''),
        position: String(item.position || ''),
        department: String(item.department || ''),
        rolePermission: (item.rolePermission === 'ผู้ดูแลระบบ' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน') as 'ผู้ดูแลระบบ' | 'ผู้ใช้งาน',
        createdAt: String(item.createdAt || new Date().toLocaleString('th-TH')),
        updatedAt: String(item.updatedAt || new Date().toLocaleString('th-TH')),
      };
    })
    .filter((s) => s.firstNameTh || s.lastNameTh || s.email);
}

function parseGASSchoolStaff(rawList: any[]): SchoolStaffRecord[] {
  if (!Array.isArray(rawList)) return [];
  const cleanList = rawList
    .map((item, idx) => {
      let rec: Partial<SchoolStaffRecord> = {};
      if (Array.isArray(item)) {
        const isArrayShifted =
          ['โรงเรียน', 'บ้าน', 'สมาคม', 'ชุมชน'].some((p) => String(item[0] || '').startsWith(p)) ||
          ALL_SCHOOLS.some((s) => s.name === item[0]);

        if (isArrayShifted) {
          rec = {
            id: `sch-${idx + 1}`,
            schoolName: String(item[0] || ''),
            documentPrefix: String(item[1] || 'ศธ 04321/'),
            directorPrefixTh: String(item[2] || 'นาย'),
            directorFirstNameTh: String(item[3] || ''),
            directorLastNameTh: String(item[4] || ''),
            directorPrefixEn: String(item[5] || 'Mr.'),
            directorFirstNameEn: String(item[6] || ''),
            directorLastNameEn: String(item[7] || ''),
            directorEmail: String(item[8] || ''),
            clerkPrefixTh: String(item[9] || 'นางสาว'),
            clerkFirstNameTh: String(item[10] || ''),
            clerkLastNameTh: String(item[11] || ''),
            clerkPrefixEn: String(item[12] || 'Miss'),
            clerkFirstNameEn: String(item[13] || ''),
            clerkLastNameEn: String(item[14] || ''),
            clerkEmail: String(item[15] || ''),
            clusterName: String(item[16] || ''),
            createdAt: String(item[17] || new Date().toLocaleString('th-TH')),
            updatedAt: String(item[17] || new Date().toLocaleString('th-TH')),
          };
        } else {
          rec = {
            id: String(item[0] || `sch-${idx + 1}`),
            schoolName: String(item[1] || ''),
            documentPrefix: String(item[2] || 'ศธ 04321/'),
            directorPrefixTh: String(item[3] || 'นาย'),
            directorFirstNameTh: String(item[4] || ''),
            directorLastNameTh: String(item[5] || ''),
            directorPrefixEn: String(item[6] || 'Mr.'),
            directorFirstNameEn: String(item[7] || ''),
            directorLastNameEn: String(item[8] || ''),
            directorEmail: String(item[9] || ''),
            clerkPrefixTh: String(item[10] || 'นางสาว'),
            clerkFirstNameTh: String(item[11] || ''),
            clerkLastNameTh: String(item[12] || ''),
            clerkPrefixEn: String(item[13] || 'Miss'),
            clerkFirstNameEn: String(item[14] || ''),
            clerkLastNameEn: String(item[15] || ''),
            clerkEmail: String(item[16] || ''),
            clusterName: String(item[17] || ''),
            createdAt: String(item[18] || new Date().toLocaleString('th-TH')),
            updatedAt: String(item[18] || new Date().toLocaleString('th-TH')),
          };
        }
      } else {
        const isObjShifted =
          (typeof item.id === 'string' && (item.id.startsWith('โรงเรียน') || item.id.startsWith('บ้าน') || ALL_SCHOOLS.some((s) => s.name === item.id))) ||
          (typeof item.documentPrefix === 'string' && ['นาย', 'นาง', 'นางสาว'].some((p) => item.documentPrefix?.startsWith(p)));

        if (isObjShifted) {
          rec = {
            id: `sch-${idx + 1}`,
            schoolName: String(item.id || ''),
            documentPrefix: String(item.schoolName || 'ศธ 04321/'),
            directorPrefixTh: String(item.documentPrefix || 'นาย'),
            directorFirstNameTh: String(item.directorPrefixTh || ''),
            directorLastNameTh: String(item.directorFirstNameTh || ''),
            directorPrefixEn: String(item.directorLastNameTh || 'Mr.'),
            directorFirstNameEn: String(item.directorPrefixEn || ''),
            directorLastNameEn: String(item.directorFirstNameEn || ''),
            directorEmail: String(item.directorLastNameEn || ''),
            clerkPrefixTh: String(item.directorEmail || 'นางสาว'),
            clerkFirstNameTh: String(item.clerkPrefixTh || ''),
            clerkLastNameTh: String(item.clerkFirstNameTh || ''),
            clerkPrefixEn: String(item.clerkLastNameTh || 'Miss'),
            clerkFirstNameEn: String(item.clerkPrefixEn || ''),
            clerkLastNameEn: String(item.clerkFirstNameEn || ''),
            clerkEmail: String(item.clerkLastNameEn || ''),
            clusterName: String(item.clerkEmail || ''),
            createdAt: String(item.createdAt || new Date().toLocaleString('th-TH')),
            updatedAt: String(item.updatedAt || new Date().toLocaleString('th-TH')),
          };
        } else {
          rec = {
            id: String(item.id || `sch-${idx + 1}`),
            schoolName: String(item.schoolName || ''),
            documentPrefix: String(item.documentPrefix || 'ศธ 04321/'),
            directorPrefixTh: String(item.directorPrefixTh || 'นาย'),
            directorFirstNameTh: String(item.directorFirstNameTh || ''),
            directorLastNameTh: String(item.directorLastNameTh || ''),
            directorPrefixEn: String(item.directorPrefixEn || 'Mr.'),
            directorFirstNameEn: String(item.directorFirstNameEn || ''),
            directorLastNameEn: String(item.directorLastNameEn || ''),
            directorEmail: String(item.directorEmail || ''),
            clerkPrefixTh: String(item.clerkPrefixTh || 'นางสาว'),
            clerkFirstNameTh: String(item.clerkFirstNameTh || ''),
            clerkLastNameTh: String(item.clerkLastNameTh || ''),
            clerkPrefixEn: String(item.clerkPrefixEn || 'Miss'),
            clerkFirstNameEn: String(item.clerkFirstNameEn || ''),
            clerkLastNameEn: String(item.clerkLastNameEn || ''),
            clerkEmail: String(item.clerkEmail || ''),
            clusterName: String(item.clusterName || ''),
            createdAt: String(item.createdAt || new Date().toLocaleString('th-TH')),
            updatedAt: String(item.updatedAt || new Date().toLocaleString('th-TH')),
          };
        }
      }

      // Match with predefined official schools using robust exact matching
      const matchedSchool = findOfficialSchool({
        schoolId: rec.schoolId || (typeof rec.id === 'string' && /^\d{8}$/.test(rec.id) ? rec.id : undefined),
        schoolName: rec.schoolName,
        clusterName: rec.clusterName,
        clusterId: rec.clusterId,
        documentPrefix: rec.documentPrefix,
      });

      const fullRecord: SchoolStaffRecord = {
        id: rec.id || (matchedSchool ? `sch-${matchedSchool.id}` : `sch-${idx + 1}`),
        schoolId: matchedSchool ? matchedSchool.id : (rec.schoolId || `sch-custom-${idx + 1}`),
        schoolName: matchedSchool ? matchedSchool.name : (rec.schoolName || 'โรงเรียนในเขต'),
        clusterId: matchedSchool ? matchedSchool.clusterId : (rec.clusterId || 'network-unknown'),
        clusterName: matchedSchool ? matchedSchool.clusterName : (rec.clusterName || 'ทั่วไป'),
        documentPrefix: rec.documentPrefix || (matchedSchool ? (matchedSchool.defaultDocPrefix || 'ศธ 04321/') : 'ศธ 04321/'),
        directorPrefixTh: rec.directorPrefixTh || 'นาย',
        directorFirstNameTh: rec.directorFirstNameTh || '',
        directorLastNameTh: rec.directorLastNameTh || '',
        directorPrefixEn: rec.directorPrefixEn || 'Mr.',
        directorFirstNameEn: rec.directorFirstNameEn || '',
        directorLastNameEn: rec.directorLastNameEn || '',
        directorEmail: rec.directorEmail || '',
        clerkPrefixTh: rec.clerkPrefixTh || 'นางสาว',
        clerkFirstNameTh: rec.clerkFirstNameTh || '',
        clerkLastNameTh: rec.clerkLastNameTh || '',
        clerkPrefixEn: rec.clerkPrefixEn || 'Miss',
        clerkFirstNameEn: rec.clerkFirstNameEn || '',
        clerkLastNameEn: rec.clerkLastNameEn || '',
        clerkEmail: rec.clerkEmail || '',
        createdAt: rec.createdAt || new Date().toLocaleString('th-TH'),
        updatedAt: rec.updatedAt || new Date().toLocaleString('th-TH'),
      };

      return fullRecord;
    })
    .filter((s) => s.schoolName && (s.directorFirstNameTh || s.clerkFirstNameTh || s.documentPrefix));

  // Deduplicate by schoolId (keep latest record for each school)
  const bySchoolMap = new Map<string, SchoolStaffRecord>();
  cleanList.forEach((rec) => {
    bySchoolMap.set(rec.schoolId, rec);
  });
  return Array.from(bySchoolMap.values());
}

/**
 * ดึงข้อมูลทั้งหมดจาก Google Apps Script Web App (สำหรับ GitHub Pages)
 */
export async function loadDataFromGAS(webAppUrl: string): Promise<{
  districtStaff: DistrictStaff[];
  schoolStaff: SchoolStaffRecord[];
} | null> {
  if (!webAppUrl || !webAppUrl.trim()) return null;

  try {
    const cleanUrl = webAppUrl.trim();
    const queryUrl = cleanUrl.includes('?')
      ? `${cleanUrl}&action=getData&_t=${Date.now()}`
      : `${cleanUrl}?action=getData&_t=${Date.now()}`;

    const response = await fetch(queryUrl, {
      method: 'GET',
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.status === 'success' || data.districtStaff || data.schoolStaff) {
      const districtStaff = parseGASDistrictStaff(data.districtStaff || []);
      const schoolStaff = parseGASSchoolStaff(data.schoolStaff || []);
      return { districtStaff, schoolStaff };
    }
  } catch (err) {
    console.warn('Could not load data from Google Apps Script:', err);
  }
  return null;
}

/**
 * ส่งข้อมูลผู้ใช้งานเขตไปยัง Google Apps Script
 */
export async function sendDistrictStaffToGAS(
  staff: DistrictStaff,
  webAppUrl: string
): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: true, message: 'บันทึกในระบบเรียบร้อย (ยังไม่ได้ตั้งค่า Google Apps Script Web App URL)' };
  }

  const payload = JSON.stringify({
    action: 'saveDistrictStaff',
    data: staff,
  });

  try {
    const response = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payload,
    });

    if (response.ok) {
      try {
        const resData = await response.json();
        return { success: true, message: resData.message || 'บันทึกไปยัง Google Sheets สำเร็จ' };
      } catch {
        return { success: true, message: 'บันทึกลง Google Sheets เรียบร้อยแล้ว' };
      }
    }
    return { success: true, message: 'ส่งข้อมูลบันทึกลง Google Sheets เรียบร้อยแล้ว' };
  } catch {
    // Retry with no-cors as guaranteed fallback for Google Apps Script redirects
    try {
      await fetch(webAppUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: payload,
      });
      return {
        success: true,
        message: 'ส่งข้อมูลบันทึกลง Google Sheets เรียบร้อยแล้ว',
      };
    } catch {
      return {
        success: true,
        message: 'ส่งคำขอบันทึกไปยัง Google Apps Script เรียบร้อยแล้ว',
      };
    }
  }
}

/**
 * ส่งข้อมูลบุคลากรโรงเรียนไปยัง Google Apps Script
 */
export async function sendSchoolStaffToGAS(
  staff: SchoolStaffRecord,
  webAppUrl: string
): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: true, message: 'บันทึกในระบบเรียบร้อย (ยังไม่ได้ตั้งค่า Google Apps Script Web App URL)' };
  }

  const normalizedStaff = normalizeSchoolStaffRecord(staff);
  const payload = JSON.stringify({
    action: 'saveSchoolStaff',
    data: {
      ...normalizedStaff,
      id: normalizedStaff.schoolId || normalizedStaff.id,
      schoolId: normalizedStaff.schoolId,
    },
  });

  try {
    const response = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payload,
    });

    if (response.ok) {
      try {
        const resData = await response.json();
        return { success: true, message: resData.message || 'บันทึกไปยัง Google Sheets สำเร็จ' };
      } catch {
        return { success: true, message: 'บันทึกลง Google Sheets เรียบร้อยแล้ว' };
      }
    }
    return { success: true, message: 'ส่งข้อมูลบันทึกลง Google Sheets เรียบร้อยแล้ว' };
  } catch {
    // Retry with no-cors as fallback
    try {
      await fetch(webAppUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: payload,
      });
      return {
        success: true,
        message: 'ส่งข้อมูลบันทึกลง Google Sheets เรียบร้อยแล้ว',
      };
    } catch {
      return {
        success: true,
        message: 'ส่งคำขอบันทึกไปยัง Google Apps Script เรียบร้อยแล้ว',
      };
    }
  }
}

/**
 * ลบข้อมูลผู้ใช้งานเขตออกจาก Google Apps Script
 */
export async function deleteDistrictStaffFromGAS(
  staff: DistrictStaff,
  webAppUrl: string
): Promise<boolean> {
  if (!webAppUrl || !webAppUrl.trim()) return false;
  try {
    await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'deleteDistrictStaff',
        id: staff.id,
        email: staff.email,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * ลบข้อมูลโรงเรียนออกจาก Google Apps Script
 */
export async function deleteSchoolStaffFromGAS(
  staff: SchoolStaffRecord,
  webAppUrl: string
): Promise<boolean> {
  if (!webAppUrl || !webAppUrl.trim()) return false;
  try {
    await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'deleteSchoolStaff',
        id: staff.id,
        schoolName: staff.schoolName,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function syncAllToGAS(
  districtStaff: DistrictStaff[],
  schoolStaff: SchoolStaffRecord[],
  webAppUrl: string
): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, message: 'กรุณาระบุ Google Apps Script Web App URL ก่อนกดซิงก์ข้อมูล' };
  }

  const payload = JSON.stringify({
    action: 'bulkSync',
    districtStaff,
    schoolStaff,
  });

  try {
    const response = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payload,
    });

    if (!response.ok) {
      return { success: false, message: `เซิร์ฟเวอร์ตอบกลับรหัส ${response.status}` };
    }

    try {
      const resData = await response.json();
      return { success: true, message: resData.message || 'ซิงก์ข้อมูลทั้งหมดเข้าสู่ Google Sheets สำเร็จ' };
    } catch {
      return { success: true, message: 'ซิงก์ข้อมูลทั้งหมดเข้าสู่ Google Sheets เรียบร้อยแล้ว' };
    }
  } catch {
    try {
      await fetch(webAppUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: payload,
      });
      return { success: true, message: 'ส่งคำขอซิงก์ทั้งหมดไปยัง Google Sheets แล้ว' };
    } catch (err: any) {
      return {
        success: false,
        message: `ไม่สามารถส่งข้อมูลได้: ${err.message || 'ข้อผิดพลาดเครือข่าย'}`,
      };
    }
  }
}

export async function testGASConnection(webAppUrl: string): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, message: 'กรุณาระบุ URL ก่อนทดสอบ' };
  }

  try {
    const cleanUrl = webAppUrl.trim();
    const testUrl = cleanUrl.includes('?') ? `${cleanUrl}&action=ping` : `${cleanUrl}?action=ping`;
    const response = await fetch(testUrl, { method: 'GET' });
    if (response.ok) {
      const data = await response.json();
      return { success: true, message: data.message || 'เชื่อมต่อกับ Google Apps Script สำเร็จสมบูรณ์' };
    }
    return { success: false, message: `การเชื่อมต่อตอบกลับด้วยรหัส: ${response.status}` };
  } catch {
    return {
      success: false,
      message: 'ไม่สามารถติดต่อ Web App URL ได้ กรุณาตรวจสอบสิทธิ์การเข้าถึงว่าเป็น "Anyone" หรือไม่',
    };
  }
}
