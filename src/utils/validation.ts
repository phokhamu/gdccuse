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
    schoolId?: string;
    clusterId?: string;
    clusterName?: string;
    directorEmail?: string;
    clerkEmail?: string;
    id?: string;
  },
  allSchoolStaff: SchoolStaffRecord[]
): DuplicateCheckResult {
  const targetSchool = candidate.schoolName.trim();
  const cleanTargetName = targetSchool.replace(/^โรงเรียน/, '').trim();
  const targetSchoolId = candidate.schoolId?.trim();
  const currentRecordId = candidate.id?.trim();
  const targetClusterId = candidate.clusterId?.trim();
  const targetClusterName = candidate.clusterName?.trim();

  // If candidate is already editing an existing record for this school (by record ID),
  // it is an update, NOT a duplicate!
  if (currentRecordId) {
    const isEditingSelf = allSchoolStaff.some((s) => s.id === currentRecordId);
    if (isEditingSelf) {
      return { isDuplicate: false, message: '' };
    }
  }

  // Check if a DIFFERENT record already exists for this exact school
  const duplicateSchool = allSchoolStaff.find((s) => {
    if (currentRecordId && s.id === currentRecordId) return false;

    // 1. If both records have schoolId (8-digit SMIS code):
    // SMIS is the strict unique key for schools
    if (targetSchoolId && s.schoolId) {
      return s.schoolId === targetSchoolId;
    }

    // 2. If schoolId is not present on one of them, check name + cluster
    const cleanSName = s.schoolName ? s.schoolName.replace(/^โรงเรียน/, '').trim() : '';
    const isNameMatch = cleanSName === cleanTargetName || s.schoolName?.trim() === targetSchool;
    if (!isNameMatch) return false;

    // Name matches, but if clusters are known and different, they are DIFFERENT schools!
    if (targetClusterId && s.clusterId && targetClusterId !== s.clusterId) {
      return false;
    }
    if (targetClusterName && s.clusterName && targetClusterName !== s.clusterName) {
      return false;
    }

    return true;
  });

  if (duplicateSchool) {
    return {
      isDuplicate: true,
      field: 'schoolName',
      message: `โรงเรียน "${targetSchool}" ได้บันทึกข้อมูลไว้ในระบบแล้ว หากต้องการปรับปรุงข้อมูลกรุณายืนยันรหัสประจำโรงเรียนเพื่อเข้าดูและแก้ไข`,
      existingRecord: duplicateSchool,
    };
  }

  return { isDuplicate: false, message: '' };
}
