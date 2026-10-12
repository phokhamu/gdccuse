import { DistrictStaff, SchoolStaffRecord, GASConfig } from '../types';

const STORAGE_KEY_DISTRICT = 'bkn_district_staff_v2';
const STORAGE_KEY_SCHOOL = 'bkn_school_staff_v2';
const STORAGE_KEY_CONFIG = 'bkn_gas_config_v2';

export const INITIAL_GAS_CONFIG: GASConfig = {
  webAppUrl: '',
  autoSync: false,
  connected: false,
};

// Initial realistic sample data
export const INITIAL_DISTRICT_STAFF: DistrictStaff[] = [
  {
    id: 'dist-001',
    prefixTh: 'นาย',
    firstNameTh: 'สมชาย',
    lastNameTh: 'รักการเรียน',
    prefixEn: 'Mr.',
    firstNameEn: 'Somchai',
    lastNameEn: 'Rakkarnrian',
    email: 'somchai.p@bkn.go.th',
    position: 'ผู้อำนวยการกลุ่ม / หัวหน้าหน่วย',
    department: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบึงกาฬ (กลุ่มนโยบายและแผน)',
    rolePermission: 'ผู้ดูแลระบบ',
    phone: '0812345678',
    createdAt: '2026-10-10 09:30:00',
  },
  {
    id: 'dist-002',
    prefixTh: 'นางสาว',
    firstNameTh: 'พรทิพย์',
    lastNameTh: 'สถิตย์ธรรม',
    prefixEn: 'Miss',
    firstNameEn: 'Porntip',
    lastNameEn: 'Satittham',
    email: 'porntip.s@bkn.go.th',
    position: 'ศึกษานิเทศก์ชำนาญการพิเศษ / ศึกษานิเทศก์',
    department: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบึงกาฬ (กลุ่มนิเทศ ติดตามฯ)',
    rolePermission: 'ผู้ใช้งาน',
    phone: '0898765432',
    createdAt: '2026-10-10 10:15:00',
  },
  {
    id: 'dist-003',
    prefixTh: 'นาง',
    firstNameTh: 'วรรณภา',
    lastNameTh: 'แก้วประสิทธิ์',
    prefixEn: 'Mrs.',
    firstNameEn: 'Wannapa',
    lastNameEn: 'Kaewprasit',
    email: 'wannapa.k@bkn.go.th',
    position: 'นักวิชาการเงินและบัญชี',
    department: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบึงกาฬ (กลุ่มบริหารงานการเงินฯ)',
    rolePermission: 'ผู้ใช้งาน',
    phone: '0861112233',
    createdAt: '2026-10-10 11:00:00',
  },
  {
    id: 'dist-004',
    prefixTh: 'นาย',
    firstNameTh: 'วรพล',
    lastNameTh: 'สิทธิชัย',
    prefixEn: 'Mr.',
    firstNameEn: 'Worapol',
    lastNameEn: 'Sitthichai',
    email: 'worapol.ict@bkn.go.th',
    position: 'นักวิชาการคอมพิวเตอร์',
    department: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบึงกาฬ (กลุ่ม DLICT)',
    rolePermission: 'ผู้ดูแลระบบ',
    phone: '0845556677',
    createdAt: '2026-10-10 11:45:00',
  },
];

export const INITIAL_SCHOOL_STAFF: SchoolStaffRecord[] = [
  {
    id: 'sch-001',
    clusterId: 'cluster-muang-1',
    clusterName: 'กลุ่มเมืองบึงกาฬ 1',
    schoolId: '1038200001',
    schoolName: 'โรงเรียนอนุบาลบึงกาฬ',
    documentPrefix: 'ศธ 04321.001/',
    directorPrefixTh: 'นาย',
    directorFirstNameTh: 'เกรียงศักดิ์',
    directorLastNameTh: 'วัฒนาวงศ์',
    directorPrefixEn: 'Mr.',
    directorFirstNameEn: 'Kriangsak',
    directorLastNameEn: 'Wattanawong',
    directorEmail: 'kriangsak.anuban@bkn.go.th',
    clerkPrefixTh: 'นางสาว',
    clerkFirstNameTh: 'อรัญญา',
    clerkLastNameTh: 'บุญญารัตน์',
    clerkPrefixEn: 'Miss',
    clerkFirstNameEn: 'Aranya',
    clerkLastNameEn: 'Boonyarat',
    clerkEmail: 'aranya.admin@bkn.go.th',
    createdAt: '2026-10-10 08:30:00',
  },
  {
    id: 'sch-002',
    clusterId: 'cluster-muang-1',
    clusterName: 'กลุ่มเมืองบึงกาฬ 1',
    schoolId: '1038200002',
    schoolName: 'โรงเรียนวิศิษฐ์อำนวยศิลป์',
    documentPrefix: 'ศธ 04321.002/',
    directorPrefixTh: 'ดร.',
    directorFirstNameTh: 'ประวิทย์',
    directorLastNameTh: 'เลิศวิริยะ',
    directorPrefixEn: 'Dr.',
    directorFirstNameEn: 'Prawit',
    directorLastNameEn: 'Lertwiriya',
    directorEmail: 'prawit.wisit@bkn.go.th',
    clerkPrefixTh: 'นาง',
    clerkFirstNameTh: 'นฤมล',
    clerkLastNameTh: 'พงษ์ศิริ',
    clerkPrefixEn: 'Mrs.',
    clerkFirstNameEn: 'Narumon',
    clerkLastNameEn: 'Pongsiri',
    clerkEmail: 'narumon.w@bkn.go.th',
    createdAt: '2026-10-10 09:00:00',
  },
  {
    id: 'sch-003',
    clusterId: 'cluster-muang-1',
    clusterName: 'กลุ่มเมืองบึงกาฬ 1',
    schoolId: '1038200004',
    schoolName: 'โรงเรียนบ้านท่าไค้',
    documentPrefix: 'ศธ 04321.004/',
    directorPrefixTh: 'นาย',
    directorFirstNameTh: 'ธนากร',
    directorLastNameTh: 'ภูวเดช',
    directorPrefixEn: 'Mr.',
    directorFirstNameEn: 'Thanakorn',
    directorLastNameEn: 'Poowadech',
    directorEmail: 'thanakorn.tk@bkn.go.th',
    clerkPrefixTh: '',
    clerkFirstNameTh: '',
    clerkLastNameTh: '',
    clerkPrefixEn: '',
    clerkFirstNameEn: '',
    clerkLastNameEn: '',
    clerkEmail: '',
    createdAt: '2026-10-10 10:00:00',
  },
  {
    id: 'sch-004',
    clusterId: 'cluster-seka-1',
    clusterName: 'กลุ่มเซกา 1',
    schoolId: '1038200038',
    schoolName: 'โรงเรียนอนุบาลเซกา',
    documentPrefix: 'ศธ 04321.038/',
    directorPrefixTh: 'นาย',
    directorFirstNameTh: 'ประสิทธิ์',
    directorLastNameTh: 'สุริยวงค์',
    directorPrefixEn: 'Mr.',
    directorFirstNameEn: 'Prasit',
    directorLastNameEn: 'Suriyawong',
    directorEmail: 'prasit.seka@bkn.go.th',
    clerkPrefixTh: 'นางสาว',
    clerkFirstNameTh: 'กรรณิการ์',
    clerkLastNameTh: 'มหาวรรณ',
    clerkPrefixEn: 'Miss',
    clerkFirstNameEn: 'Kannika',
    clerkLastNameEn: 'Mahawan',
    clerkEmail: 'kannika.seka@bkn.go.th',
    createdAt: '2026-10-10 11:20:00',
  },
  {
    id: 'sch-005',
    clusterId: 'cluster-so-1',
    clusterName: 'กลุ่มโซ่พิสัย 1',
    schoolId: '1038200076',
    schoolName: 'โรงเรียนอนุบาลโซ่พิสัย',
    documentPrefix: 'ศธ 04321.076/',
    directorPrefixTh: '',
    directorFirstNameTh: '',
    directorLastNameTh: '',
    directorPrefixEn: '',
    directorFirstNameEn: '',
    directorLastNameEn: '',
    directorEmail: '',
    clerkPrefixTh: 'นางสาว',
    clerkFirstNameTh: 'จิราภรณ์',
    clerkLastNameTh: 'มิตรภาพ',
    clerkPrefixEn: 'Miss',
    clerkFirstNameEn: 'Jiraporn',
    clerkLastNameEn: 'Mittraphap',
    clerkEmail: 'jiraporn.so@bkn.go.th',
    createdAt: '2026-10-10 13:00:00',
  },
];

export function loadDistrictStaffFromStorage(): DistrictStaff[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISTRICT);
    if (!raw) {
      saveDistrictStaffToStorage(INITIAL_DISTRICT_STAFF);
      return INITIAL_DISTRICT_STAFF;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DISTRICT_STAFF;
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
    if (!raw) {
      saveSchoolStaffToStorage(INITIAL_SCHOOL_STAFF);
      return INITIAL_SCHOOL_STAFF;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SCHOOL_STAFF;
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
