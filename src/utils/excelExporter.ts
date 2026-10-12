import * as XLSX from 'xlsx';
import { DistrictStaff, SchoolStaffRecord } from '../types';

export function exportToGoogleSheetsExcel(
  districtStaffList: DistrictStaff[],
  schoolStaffList: SchoolStaffRecord[]
) {
  const workbook = XLSX.utils.book_new();

  // 1. แผ่นงาน: ข้อมูลผู้ใช้งานเขต
  const districtHeaders = [
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

  const districtRows = districtStaffList.map((item, idx) => [
    idx + 1,
    item.prefixTh || '',
    item.firstNameTh || '',
    item.lastNameTh || '',
    item.prefixEn || '',
    item.firstNameEn || '',
    item.lastNameEn || '',
    item.email || '',
    item.position || '',
    item.department || '',
    item.rolePermission || 'ผู้ใช้งาน',
    item.createdAt || '',
  ]);

  const wsDistrict = XLSX.utils.aoa_to_sheet([districtHeaders, ...districtRows]);
  wsDistrict['!cols'] = [
    { wch: 6 },  // ลำดับ
    { wch: 20 }, // คำนำหน้า (ภาษาไทย)
    { wch: 20 }, // ชื่อ (ภาษาไทย)
    { wch: 22 }, // นามสกุล (ภาษาไทย)
    { wch: 22 }, // คำนำหน้า (ภาษาอังกฤษ)
    { wch: 22 }, // ชื่อ (ภาษาอังกฤษ)
    { wch: 24 }, // นามสกุล (ภาษาอังกฤษ)
    { wch: 34 }, // e-Mail สำนักงาน ที่สามารถยืนยันตัวตนได้
    { wch: 30 }, // ตำแหน่ง
    { wch: 38 }, // สังกัด / ชื่อหน่วยงาน
    { wch: 26 }, // สิทธิ์ผู้ดูแลระบบ, ผู้ใช้งาน
    { wch: 20 }, // วันที่บันทึก
  ];
  XLSX.utils.book_append_sheet(workbook, wsDistrict, 'ข้อมูลผู้ใช้งานเขต');

  // 2. แผ่นงาน: ข้อมูลโรงเรียนภายใต้เขต
  const schoolHeaders = [
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

  const schoolRows = schoolStaffList.map((item, idx) => [
    idx + 1,
    item.schoolName || '',
    item.documentPrefix || 'ศธ 04321/',
    item.directorPrefixTh || '',
    item.directorFirstNameTh || '',
    item.directorLastNameTh || '',
    item.directorPrefixEn || '',
    item.directorFirstNameEn || '',
    item.directorLastNameEn || '',
    item.directorEmail || '',
    item.clerkPrefixTh || '',
    item.clerkFirstNameTh || '',
    item.clerkLastNameTh || '',
    item.clerkPrefixEn || '',
    item.clerkFirstNameEn || '',
    item.clerkLastNameEn || '',
    item.clerkEmail || '',
    item.clusterName || '',
    item.createdAt || '',
  ]);

  const wsSchool = XLSX.utils.aoa_to_sheet([schoolHeaders, ...schoolRows]);
  wsSchool['!cols'] = [
    { wch: 6 },  // ลำดับ
    { wch: 32 }, // ชื่อโรงเรียน (แบบเต็ม)
    { wch: 22 }, // รูปแบบเลขที่หนังสือ
    { wch: 22 }, // คำนำหน้า (ไทย) ผอ.
    { wch: 20 }, // ชื่อ (ไทย) ผอ.
    { wch: 22 }, // นามสกุล (ไทย) ผอ.
    { wch: 22 }, // คำนำหน้า (อังกฤษ) ผอ.
    { wch: 20 }, // ชื่อ (อังกฤษ) ผอ.
    { wch: 22 }, // นามสกุล (อังกฤษ) ผอ.
    { wch: 28 }, // อีเมล ผอ.
    { wch: 22 }, // คำนำหน้า (ไทย) ธุรการ
    { wch: 20 }, // ชื่อ (ไทย) ธุรการ
    { wch: 22 }, // นามสกุล (ไทย) ธุรการ
    { wch: 22 }, // คำนำหน้า (อังกฤษ) ธุรการ
    { wch: 20 }, // ชื่อ (อังกฤษ) ธุรการ
    { wch: 22 }, // นามสกุล (อังกฤษ) ธุรการ
    { wch: 28 }, // อีเมล ธุรการ
    { wch: 24 }, // กลุ่มโรงเรียน
    { wch: 20 }, // วันที่บันทึก
  ];
  XLSX.utils.book_append_sheet(workbook, wsSchool, 'ข้อมูลโรงเรียน');

  const fileName = `ไฟล์ข้อมูลสพป_บึงกาฬ_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
