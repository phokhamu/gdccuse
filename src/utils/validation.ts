import { DistrictStaff, SchoolStaffRecord, DuplicateCheckResult } from '../types';

export function validateEmail(email: string): { isValid: boolean; message?: string } {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'กรุณากรอกอีเมล' };
  }

  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) {
    return { isValid: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' };
  }

  return { isValid: true };
}

export function validateOptionalEmail(email: string): { isValid: boolean; message?: string } {
  if (!email || !email.trim()) {
    return { isValid: true };
  }
  return validateEmail(email);
}

export function checkDistrictStaffDuplicate(
  candidate: { email: string; firstNameTh: string; lastNameTh: string; id?: string },
  allDistrictStaff: DistrictStaff[]
): DuplicateCheckResult {
  const cleanEmail = candidate.email.trim().toLowerCase();
  const cleanFirst = candidate.firstNameTh.trim();
  const cleanLast = candidate.lastNameTh.trim();

  // ตรวจสอบ e-mail สำนักงาน ซ้ำ
  if (cleanEmail) {
    const dupEmail = allDistrictStaff.find(
      (s) => s.id !== candidate.id && s.email.trim().toLowerCase() === cleanEmail
    );
    if (dupEmail) {
      return {
        isDuplicate: true,
        field: 'email',
        message: `อีเมล "${cleanEmail}" มีอยู่ในระบบแล้ว โดย "${dupEmail.prefixTh}${dupEmail.firstNameTh} ${dupEmail.lastNameTh}" (${dupEmail.position})`,
        existingRecord: dupEmail,
      };
    }
  }

  // ตรวจสอบ ชื่อ-นามสกุล ซ้ำ
  if (cleanFirst && cleanLast) {
    const dupName = allDistrictStaff.find(
      (s) =>
        s.id !== candidate.id &&
        s.firstNameTh.trim() === cleanFirst &&
        s.lastNameTh.trim() === cleanLast
    );
    if (dupName) {
      return {
        isDuplicate: true,
        field: 'fullName',
        message: `ชื่อ-นามสกุล "${cleanFirst} ${cleanLast}" มีอยู่ในระบบผู้ใช้งานเขตแล้ว (${dupName.department})`,
        existingRecord: dupName,
      };
    }
  }

  return { isDuplicate: false, message: '' };
}

export function checkSchoolStaffDuplicate(
  candidate: {
    schoolName: string;
    directorEmail?: string;
    clerkEmail?: string;
    id?: string;
  },
  allSchoolStaff: SchoolStaffRecord[]
): DuplicateCheckResult {
  const targetSchool = candidate.schoolName.trim();

  // ตรวจสอบชื่อโรงเรียนซ้ำ
  const existingSchool = allSchoolStaff.find(
    (s) => s.id !== candidate.id && s.schoolName.trim() === targetSchool
  );

  if (existingSchool) {
    return {
      isDuplicate: true,
      field: 'schoolName',
      message: `โรงเรียน "${targetSchool}" ได้บันทึกข้อมูลไว้ในระบบแล้ว หากต้องการปรับปรุงข้อมูลกรุณากดแก้ไขจากรายการเดิม`,
      existingRecord: existingSchool,
    };
  }

  return { isDuplicate: false, message: '' };
}
