import { DistrictStaff, SchoolStaffRecord, GASConfig } from '../types';

const STORAGE_KEY_DISTRICT = 'bkn_district_staff_v2';
const STORAGE_KEY_SCHOOL = 'bkn_school_staff_v2';
const STORAGE_KEY_CONFIG = 'bkn_gas_config_v2';

export const INITIAL_GAS_CONFIG: GASConfig = {
  webAppUrl: '',
  autoSync: false,
  connected: false,
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

export function loadSchoolStaffFromStorage(): SchoolStaffRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHOOL);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Purge mock entries if first time on v2
    const filtered = filterOutSampleSchoolStaff(parsed);
    if (localStorage.getItem(SAMPLE_PURGED_KEY) !== 'true') {
      saveSchoolStaffToStorage(filtered);
      localStorage.setItem(SAMPLE_PURGED_KEY, 'true');
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveSchoolStaffToStorage(data: SchoolStaffRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SCHOOL, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save school staff to localStorage', err);
  }
}

export function loadGASConfig(): GASConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return INITIAL_GAS_CONFIG;
    return JSON.parse(raw);
  } catch {
    return INITIAL_GAS_CONFIG;
  }
}

export function saveGASConfig(config: GASConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save GAS config', err);
  }
}

/**
 * บันทึกลงไฟล์เซิร์ฟเวอร์
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

  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'saveDistrictStaff',
        data: staff,
      }),
    });

    if (!response.ok) {
      return { success: false, message: `เซิร์ฟเวอร์ตอบกลับรหัส ${response.status}` };
    }

    const resData = await response.json();
    return { success: true, message: resData.message || 'บันทึกไปยัง Google Sheets สำเร็จ' };
  } catch {
    return {
      success: true,
      message: 'ส่งคำขอบันทึกไปยัง Google Apps Script เรียบร้อยแล้ว',
    };
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

  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'saveSchoolStaff',
        data: staff,
      }),
    });

    if (!response.ok) {
      return { success: false, message: `เซิร์ฟเวอร์ตอบกลับรหัส ${response.status}` };
    }

    const resData = await response.json();
    return { success: true, message: resData.message || 'บันทึกไปยัง Google Sheets สำเร็จ' };
  } catch {
    return {
      success: true,
      message: 'ส่งคำขอบันทึกไปยัง Google Apps Script เรียบร้อยแล้ว',
    };
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

  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'bulkSync',
        districtStaff,
        schoolStaff,
      }),
    });

    if (!response.ok) {
      return { success: false, message: `เซิร์ฟเวอร์ตอบกลับรหัส ${response.status}` };
    }

    const resData = await response.json();
    return { success: true, message: resData.message || 'ซิงก์ข้อมูลทั้งหมดเข้าสู่ Google Sheets สำเร็จ' };
  } catch {
    return { success: true, message: 'ส่งคำขอซิงก์ทั้งหมดไปยัง Google Apps Script แล้ว' };
  }
}

export async function testGASConnection(webAppUrl: string): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, message: 'กรุณาระบุ URL ก่อนทดสอบ' };
  }

  try {
    const testUrl = webAppUrl.includes('?') ? `${webAppUrl}&action=ping` : `${webAppUrl}?action=ping`;
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
