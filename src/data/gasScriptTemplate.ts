export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * ระบบบันทึกข้อมูลและรายงานผล - สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบึงกาฬ (สพป.บึงกาฬ)
 * Google Apps Script Web App Backend (Code.gs)
 * ==============================================================================
 * สำหรับใช้งานร่วมกับ GitHub Pages (https://phokhamu.github.io/gdccuse/)
 * 
 * ขั้นตอนการติดตั้งและใช้งาน:
 * 1. เปิด Google Sheets (สร้างไฟล์ใหม่ใน Google Drive ของท่าน)
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเดิมใน Code.gs ทั้งหมด แล้วคัดลอกโค้ดนี้ไปวางทับ
 * 4. กดปุ่มบันทึก (รูปแผ่นดิสก์ หรือ Ctrl + S)
 * 5. กดปุ่ม "ทำให้ใช้งานได้" (Deploy) สีน้ำเงินมุมขวาบน > เลือก "การทำให้ใช้งานได้รายการใหม่" (New deployment)
 * 6. คลิกรูปฟันเฟือง เลือกประเภท: "เว็บแอป" (Web app)
 * 7. ตั้งค่าสำคัญ:
 *    - คำอธิบาย: สพป.บึงกาฬ Web API Backend
 *    - ดำเนินการในฐานะ: ตัวฉัน (Me)
 *    - ผู้ที่มีสิทธิ์เข้าถึง: ทุกคน (Anyone)  <--- *** สำคัญที่สุด ห้ามลืมเลือก Anyone ***
 * 8. กดปุ่ม "ทำให้ใช้งานได้" (Deploy)
 *    - (หากมีหน้าต่างขออนุญาตสิทธิ์ ให้กด "ตรวจสอบสิทธิ์" > เลือกบัญชี Google > ขั้นสูง > ไปที่... (ไม่ปลอดภัย) > อนุญาต)
 * 9. คัดลอก "URL ของเว็บแอป" (ที่ลงท้ายด้วย /exec)
 * 10. นำ URL มาใส่ในระบบเว็บ หรือใส่ในไฟล์ src/config/gasConfig.ts ก่อน Push ขึ้น GitHub
 * ==============================================================================
 */

const DISTRICT_SHEET_NAME = 'ข้อมูลผู้ใช้งานเขต';
const SCHOOL_SHEET_NAME = 'ข้อมูลโรงเรียน';

function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. แผ่นงาน: ข้อมูลผู้ใช้งานเขต
  let districtSheet = ss.getSheetByName(DISTRICT_SHEET_NAME);
  if (!districtSheet) {
    districtSheet = ss.insertSheet(DISTRICT_SHEET_NAME);
    const headers = [
      'รหัสรายการ',
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
      'วันที่บันทึก'
    ];
    districtSheet.appendRow(headers);
    const headerRange = districtSheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1e3a8a').setFontColor('#ffffff').setFontWeight('bold');
    districtSheet.setFrozenRows(1);
  }

  // 2. แผ่นงาน: ข้อมูลโรงเรียนภายใต้เขต
  let schoolSheet = ss.getSheetByName(SCHOOL_SHEET_NAME);
  if (!schoolSheet) {
    schoolSheet = ss.insertSheet(SCHOOL_SHEET_NAME);
    const headers = [
      'รหัสรายการ',
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
      'วันที่บันทึก'
    ];
    schoolSheet.appendRow(headers);
    const headerRange = schoolSheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#065f46').setFontColor('#ffffff').setFontWeight('bold');
    schoolSheet.setFrozenRows(1);
  }
}

function doGet(e) {
  try {
    initSheets();
    const action = (e && e.parameter && e.parameter.action) || 'ping';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'getData') {
      const districtSheet = ss.getSheetByName(DISTRICT_SHEET_NAME);
      const schoolSheet = ss.getSheetByName(SCHOOL_SHEET_NAME);

      const dRows = readSheetRows(districtSheet);
      const sRows = readSheetRows(schoolSheet);

      const districtList = dRows.map(function(r, idx) {
        return {
          id: String(r[0] || ('dist-' + (idx + 1))),
          prefixTh: String(r[1] || ''),
          firstNameTh: String(r[2] || ''),
          lastNameTh: String(r[3] || ''),
          prefixEn: String(r[4] || ''),
          firstNameEn: String(r[5] || ''),
          lastNameEn: String(r[6] || ''),
          email: String(r[7] || ''),
          position: String(r[8] || ''),
          department: String(r[9] || ''),
          rolePermission: String(r[10] || 'ผู้ใช้งาน'),
          createdAt: String(r[11] || ''),
          updatedAt: String(r[11] || '')
        };
      });

      const schoolList = sRows.map(function(r, idx) {
        return {
          id: String(r[0] || ('sch-' + (idx + 1))),
          schoolId: String(r[0] || ''),
          schoolName: String(r[1] || ''),
          documentPrefix: String(r[2] || ''),
          directorPrefixTh: String(r[3] || ''),
          directorFirstNameTh: String(r[4] || ''),
          directorLastNameTh: String(r[5] || ''),
          directorPrefixEn: String(r[6] || ''),
          directorFirstNameEn: String(r[7] || ''),
          directorLastNameEn: String(r[8] || ''),
          directorEmail: String(r[9] || ''),
          clerkPrefixTh: String(r[10] || ''),
          clerkFirstNameTh: String(r[11] || ''),
          clerkLastNameTh: String(r[12] || ''),
          clerkPrefixEn: String(r[13] || ''),
          clerkFirstNameEn: String(r[14] || ''),
          clerkLastNameEn: String(r[15] || ''),
          clerkEmail: String(r[16] || ''),
          clusterName: String(r[17] || ''),
          createdAt: String(r[18] || ''),
          updatedAt: String(r[18] || '')
        };
      });

      return createJsonResponse({
        status: 'success',
        districtStaff: districtList,
        schoolStaff: schoolList,
        timestamp: new Date().toISOString()
      });
    }

    return createJsonResponse({
      status: 'success',
      message: 'ระบบเชื่อมต่อ Google Apps Script สพป.บึงกาฬ พร้อมใช้งาน',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    initSheets();
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. บันทึก/อัปเดต ข้อมูลผู้ใช้งานเขต
    if (action === 'saveDistrictStaff') {
      const data = payload.data;
      const sheet = ss.getSheetByName(DISTRICT_SHEET_NAME);
      const existingRows = sheet.getDataRange().getValues();

      const targetEmail = String(data.email || '').trim().toLowerCase();
      const targetId = String(data.id || '').trim();

      // ตรวจสอบว่ามีอีเมลหรือรหัสรายการซ้ำหรือไม่ (เพื่ออัปเดต)
      for (let i = 1; i < existingRows.length; i++) {
        const rowId = String(existingRows[i][0] || '').trim();
        const rowEmail = String(existingRows[i][7] || '').trim().toLowerCase();

        if ((targetId && rowId === targetId) || (targetEmail && rowEmail === targetEmail)) {
          sheet.getRange(i + 1, 1, 1, 12).setValues([[
            rowId || targetId || ('dist-' + i),
            data.prefixTh || '',
            data.firstNameTh || '',
            data.lastNameTh || '',
            data.prefixEn || '',
            data.firstNameEn || '',
            data.lastNameEn || '',
            data.email || '',
            data.position || '',
            data.department || '',
            data.rolePermission || 'ผู้ใช้งาน',
            new Date().toLocaleString('th-TH')
          ]]);
          return createJsonResponse({ status: 'success', message: 'อัปเดตข้อมูลผู้ใช้งานเขตใน Google Sheets เรียบร้อยแล้ว' });
        }
      }

      // ถ้าไม่มีซ้ำ ให้เพิ่มแถวใหม่
      sheet.appendRow([
        targetId || ('dist-' + Date.now()),
        data.prefixTh || '',
        data.firstNameTh || '',
        data.lastNameTh || '',
        data.prefixEn || '',
        data.firstNameEn || '',
        data.lastNameEn || '',
        data.email || '',
        data.position || '',
        data.department || '',
        data.rolePermission || 'ผู้ใช้งาน',
        new Date().toLocaleString('th-TH')
      ]);

      return createJsonResponse({ status: 'success', message: 'บันทึกข้อมูลผู้ใช้งานเขตลง Google Sheets สำเร็จ' });
    }

    // 2. บันทึก/อัปเดต ข้อมูลโรงเรียน
    if (action === 'saveSchoolStaff') {
      const data = payload.data;
      const sheet = ss.getSheetByName(SCHOOL_SHEET_NAME);
      const existingRows = sheet.getDataRange().getValues();

      const targetSchool = String(data.schoolName || '').trim();
      const cleanTargetSchool = targetSchool.replace(/^โรงเรียน/, '').trim();
      const targetId = String(data.id || '').trim();
      const targetSchoolId = String(data.schoolId || '').trim();
      const targetCluster = String(data.clusterName || '').trim();

      // ตรวจสอบชื่อโรงเรียนหรือรหัสซ้ำเพื่ออัปเดต (ป้องกันการเขียนทับข้ามโรงเรียนที่ชื่อเหมือนกัน)
      for (let i = 1; i < existingRows.length; i++) {
        const rowId = String(existingRows[i][0] || '').trim();
        const rowSchool = String(existingRows[i][1] || '').trim();
        const cleanRowSchool = rowSchool.replace(/^โรงเรียน/, '').trim();
        const rowCluster = String(existingRows[i][17] || '').trim();

        // 1. ตรวจสอบรหัส SMIS หรือ Record ID ตรงกันแบบเคร่งครัด
        let isMatch = false;
        if (targetSchoolId && (rowId === targetSchoolId || rowId === ('sch-' + targetSchoolId))) {
          isMatch = true;
        } else if (targetId && (rowId === targetId || rowId === ('sch-' + targetId))) {
          isMatch = true;
        } else if (targetSchool && (rowSchool === targetSchool || (cleanRowSchool && cleanRowSchool === cleanTargetSchool))) {
          // หากรหัส SMIS ทั้งสองฝั่งมีค่าและไม่ตรงกัน ห้ามถือว่าเป็นโรงเรียนเดียวกัน
          const isRowId8Digits = /^\d{8}$/.test(rowId.replace(/^sch-/, ''));
          const isTargetId8Digits = /^\d{8}$/.test(targetSchoolId.replace(/^sch-/, ''));
          if (isRowId8Digits && isTargetId8Digits && rowId.replace(/^sch-/, '') !== targetSchoolId.replace(/^sch-/, '')) {
            isMatch = false;
          } else if (targetCluster && rowCluster && targetCluster !== rowCluster) {
            // หากกลุ่มโรงเรียนต่างกัน ห้ามถือว่าเป็นโรงเรียนเดียวกัน (แก้ปัญหาชื่อโรงเรียนซ้ำกันในคนละกลุ่ม)
            isMatch = false;
          } else {
            isMatch = true;
          }
        }

        if (isMatch) {
          sheet.getRange(i + 1, 1, 1, 19).setValues([[
            targetSchoolId || rowId || targetId || ('sch-' + i),
            data.schoolName || '',
            data.documentPrefix || 'ศธ 04321/',
            data.directorPrefixTh || '',
            data.directorFirstNameTh || '',
            data.directorLastNameTh || '',
            data.directorPrefixEn || '',
            data.directorFirstNameEn || '',
            data.directorLastNameEn || '',
            data.directorEmail || '',
            data.clerkPrefixTh || '',
            data.clerkFirstNameTh || '',
            data.clerkLastNameTh || '',
            data.clerkPrefixEn || '',
            data.clerkFirstNameEn || '',
            data.clerkLastNameEn || '',
            data.clerkEmail || '',
            data.clusterName || '',
            new Date().toLocaleString('th-TH')
          ]]);
          return createJsonResponse({ status: 'success', message: 'อัปเดตข้อมูลโรงเรียน ' + targetSchool + ' ใน Google Sheets เรียบร้อยแล้ว' });
        }
      }

      // ถ้าไม่มีซ้ำ ให้เพิ่มแถวใหม่
      sheet.appendRow([
        targetSchoolId || targetId || ('sch-' + Date.now()),
        data.schoolName || '',
        data.documentPrefix || 'ศธ 04321/',
        data.directorPrefixTh || '',
        data.directorFirstNameTh || '',
        data.directorLastNameTh || '',
        data.directorPrefixEn || '',
        data.directorFirstNameEn || '',
        data.directorLastNameEn || '',
        data.directorEmail || '',
        data.clerkPrefixTh || '',
        data.clerkFirstNameTh || '',
        data.clerkLastNameTh || '',
        data.clerkPrefixEn || '',
        data.clerkFirstNameEn || '',
        data.clerkLastNameEn || '',
        data.clerkEmail || '',
        data.clusterName || '',
        new Date().toLocaleString('th-TH')
      ]);

      return createJsonResponse({ status: 'success', message: 'บันทึกข้อมูลโรงเรียนลง Google Sheets สำเร็จ' });
    }

    // 3. ลบข้อมูลผู้ใช้งานเขต
    if (action === 'deleteDistrictStaff') {
      const targetId = String(payload.id || '').trim();
      const targetEmail = String(payload.email || '').trim().toLowerCase();
      const sheet = ss.getSheetByName(DISTRICT_SHEET_NAME);
      if (sheet) {
        const rows = sheet.getDataRange().getValues();
        for (let i = rows.length - 1; i >= 1; i--) {
          const rowId = String(rows[i][0] || '').trim();
          const rowEmail = String(rows[i][7] || '').trim().toLowerCase();
          if ((targetId && rowId === targetId) || (targetEmail && rowEmail === targetEmail)) {
            sheet.deleteRow(i + 1);
            return createJsonResponse({ status: 'success', message: 'ลบรายการออกจาก Google Sheets เรียบร้อยแล้ว' });
          }
        }
      }
      return createJsonResponse({ status: 'success', message: 'ไม่พบรายการใน Google Sheets' });
    }

    // 4. ลบข้อมูลโรงเรียน
    if (action === 'deleteSchoolStaff') {
      const targetId = String(payload.id || '').trim();
      const targetSchoolId = String(payload.schoolId || '').trim();
      const targetSchool = String(payload.schoolName || '').trim().toLowerCase();
      const targetCluster = String(payload.clusterName || '').trim().toLowerCase();
      const sheet = ss.getSheetByName(SCHOOL_SHEET_NAME);
      if (sheet) {
        const rows = sheet.getDataRange().getValues();
        for (let i = rows.length - 1; i >= 1; i--) {
          const rowId = String(rows[i][0] || '').trim();
          const rowSchool = String(rows[i][1] || '').trim().toLowerCase();
          const rowCluster = String(rows[i][17] || '').trim().toLowerCase();

          let isMatch = false;
          if (targetSchoolId && (rowId === targetSchoolId || rowId === ('sch-' + targetSchoolId))) {
            isMatch = true;
          } else if (targetId && rowId === targetId) {
            isMatch = true;
          } else if (targetSchool && rowSchool === targetSchool) {
            if (!targetCluster || !rowCluster || targetCluster === rowCluster) {
              isMatch = true;
            }
          }

          if (isMatch) {
            sheet.deleteRow(i + 1);
            return createJsonResponse({ status: 'success', message: 'ลบรายการออกจาก Google Sheets เรียบร้อยแล้ว' });
          }
        }
      }
      return createJsonResponse({ status: 'success', message: 'ไม่พบรายการใน Google Sheets' });
    }

    // 5. ซิงก์ข้อมูลทั้งหมด (Bulk Sync)
    if (action === 'bulkSync') {
      const districtStaff = payload.districtStaff || [];
      const schoolStaff = payload.schoolStaff || [];

      // เคลียร์และสร้างแผ่นงานข้อมูลผู้ใช้งานเขต
      let dSheet = ss.getSheetByName(DISTRICT_SHEET_NAME);
      if (dSheet) dSheet.clear();
      initSheets();
      dSheet = ss.getSheetByName(DISTRICT_SHEET_NAME);
      for (let i = 0; i < districtStaff.length; i++) {
        const d = districtStaff[i];
        dSheet.appendRow([
          d.id || ('dist-' + (i + 1)),
          d.prefixTh || '',
          d.firstNameTh || '',
          d.lastNameTh || '',
          d.prefixEn || '',
          d.firstNameEn || '',
          d.lastNameEn || '',
          d.email || '',
          d.position || '',
          d.department || '',
          d.rolePermission || 'ผู้ใช้งาน',
          d.createdAt || new Date().toLocaleString('th-TH')
        ]);
      }

      // เคลียร์และสร้างแผ่นงานข้อมูลโรงเรียน
      let sSheet = ss.getSheetByName(SCHOOL_SHEET_NAME);
      if (sSheet) sSheet.clear();
      initSheets();
      sSheet = ss.getSheetByName(SCHOOL_SHEET_NAME);
      for (let j = 0; j < schoolStaff.length; j++) {
        const s = schoolStaff[j];
        sSheet.appendRow([
          s.id || s.schoolId || ('sch-' + (j + 1)),
          s.schoolName || '',
          s.documentPrefix || 'ศธ 04321/',
          s.directorPrefixTh || '',
          s.directorFirstNameTh || '',
          s.directorLastNameTh || '',
          s.directorPrefixEn || '',
          s.directorFirstNameEn || '',
          s.directorLastNameEn || '',
          s.directorEmail || '',
          s.clerkPrefixTh || '',
          s.clerkFirstNameTh || '',
          s.clerkLastNameTh || '',
          s.clerkPrefixEn || '',
          s.clerkFirstNameEn || '',
          s.clerkLastNameEn || '',
          s.clerkEmail || '',
          s.clusterName || '',
          s.createdAt || new Date().toLocaleString('th-TH')
        ]);
      }

      return createJsonResponse({
        status: 'success',
        message: 'ซิงก์ข้อมูลทั้งหมด (' + districtStaff.length + ' ผู้ใช้งานเขต และ ' + schoolStaff.length + ' โรงเรียน) เข้าสู่ Google Sheets เรียบร้อยแล้ว'
      });
    }

    return createJsonResponse({ status: 'error', message: 'ไม่พบคำสั่งที่ระบุ: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function readSheetRows(sheet) {
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    // กรองแถวที่ว่างทั้งหมด
    const hasData = values[i].some(function(cell) {
      return cell !== null && String(cell).trim() !== '';
    });
    if (hasData) {
      rows.push(values[i]);
    }
  }
  return rows;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
