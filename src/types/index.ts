export interface DistrictStaff {
  id: string;
  prefixTh: string; // คำนำหน้า (ภาษาไทย)
  firstNameTh: string; // ชื่อ (ภาษาไทย)
  lastNameTh: string; // นามสกุล (ภาษาไทย)
  prefixEn: string; // คำนำหน้า (ภาษาอังกฤษ)
  firstNameEn: string; // ชื่อ (ภาษาอังกฤษ)
  lastNameEn: string; // นามสกุล (ภาษาอังกฤษ)
  email: string; // e-Mail สำนักงาน ที่สามารถยืนยันตัวตนได้
  position: string; // ตำแหน่ง
  department: string; // สังกัด / ชื่อหน่วยงาน
  rolePermission: 'ผู้ใช้งาน' | 'ผู้ดูแลระบบ'; // สิทธิ์ผู้ดูแลระบบ, ผู้ใช้งาน
  phone?: string;
  citizenId?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SchoolStaffRecord {
  id: string;
  clusterId: string;
  clusterName: string; // กลุ่มโรงเรียน
  schoolId: string;
  schoolName: string; // ชื่อโรงเรียน (แบบเต็ม)
  documentPrefix: string; // รูปแบบเลขที่หนังสือ (เช่น ศธ 04321.xxx/)

  // ผู้อำนวยการโรงเรียน (ผอ.รร.)
  directorPrefixTh: string; // คำนำหน้า (ภาษาไทย) ผู้อำนวยการโรงเรียน
  directorFirstNameTh: string; // ชื่อ (ภาษาไทย) ผู้อำนวยการโรงเรียน
  directorLastNameTh: string; // นามสกุล (ภาษาไทย) ผู้อำนวยการโรงเรียน
  directorPrefixEn: string; // คำนำหน้า (ภาษาอังกฤษ) ผู้อำนวยการโรงเรียน
  directorFirstNameEn: string; // ชื่อ (ภาษาอังกฤษ) ผู้อำนวยการโรงเรียน
  directorLastNameEn: string; // นามสกุล (ภาษาอังกฤษ) ผู้อำนวยการโรงเรียน
  directorEmail: string; // e-Mail ผู้อำนวยการโรงเรียน

  // เจ้าหน้าที่ธุรการโรงเรียน (ธุรการ รร.)
  clerkPrefixTh: string; // คำนำหน้า (ภาษาไทย) ธุรการโรงเรียน
  clerkFirstNameTh: string; // ชื่อ (ภาษาไทย) ธุรการโรงเรียน
  clerkLastNameTh: string; // นามสกุล (ภาษาไทย) ธุรการโรงเรียน
  clerkPrefixEn: string; // คำนำหน้า (ภาษาอังกฤษ) ธุรการโรงเรียน
  clerkFirstNameEn: string; // ชื่อ (ภาษาอังกฤษ) ธุรการโรงเรียน
  clerkLastNameEn: string; // นามสกุล (ภาษาอังกฤษ) ธุรการโรงเรียน
  clerkEmail: string; // e-Mail ธุรการโรงเรียน

  directorPhone?: string;
  clerkPhone?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SchoolInfo {
  id: string;
  name: string;
  clusterId: string;
  clusterName: string;
  subdistrict?: string;
  district: string;
  defaultDocPrefix?: string;
}

export interface SchoolCluster {
  id: string;
  name: string;
  district: string;
  schoolCount: number;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  message: string;
  field?: string;
  existingRecord?: any;
}

export interface GASConfig {
  webAppUrl: string;
  sheetId?: string;
  lastSyncTime?: string;
  autoSync: boolean;
  connected: boolean;
}

export type UserTab = 'dashboard' | 'school-form' | 'district-form';
export type AdminTab = 'sheets-view' | 'data-list' | 'gas-settings' | 'security';
export type AppTab = UserTab | AdminTab;
