export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * ระบบบันทึกข้อมูลและรายงานผล - สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบึงกาฬ (สพป.บึงกาฬ)
 * Google Apps Script Web App Backend (Code.gs)
 * ==============================================================================
 * คำแนะนำการติดตั้ง:
 * 1. เปิด Google Sheets ใหม่ หรือไฟล์ที่มีอยู่แล้ว
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเดิมใน Code.gs ทั้งหมด แล้ววางโค้ดนี้ลงไป
 * 4. กดปุ่มบันทึก (Save)
 * 5. กดปุ่ม "ทำให้ใช้งานได้" (Deploy) > "การทำให้ใช้งานได้รายการใหม่" (New deployment)
 * 6. เลือกประเภท: "เว็บแอป" (Web app)
 * 7. ตั้งค่า:
 *    - คำอธิบาย: สพป.บึงกาฬ Web API
 *    - ดำเนินการในฐานะ: ตัวฉัน (Me)
 *    - ผู้ที่มีสิทธิ์เข้าถึง: ทุกคน (Anyone)  <--- สำคัญมาก เพื่อให้ส่งข้อมูลจากเว็บได้
 * 8. กด "ทำให้ใช้งานได้" (Deploy) แล้วคัดลอก "URL ของเว็บแอป" (Web app URL)
 * 9. นำ URL มาวางในหน้าระบบ เพื่อเชื่อมต่อแบบ Real-time
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

    if (action === 'getData') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const districtSheet = ss.getSheetByName(DISTRICT_SHEET_NAME);
      const schoolSheet = ss.getSheetByName(SCHOOL_SHEET_NAME);

      return createJsonResponse({
        status: 'success',
        districtStaff: readSheetRows(districtSheet),
        schoolStaff: readSheetRows(schoolSheet),
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

    if (action === 'saveDistrictStaff') {
      const data = payload.data;
      const sheet = ss.getSheetByName(DISTRICT_SHEET_NAME);
      const existingRows = sheet.getDataRange().getValues();

      // ตรวจอีเมลซ้ำ
      for (let i = 1; i < existingRows.length; i++) {
        const rowEmail = String(existingRows[i][7] || '').trim().toLowerCase();
        const targetEmail = String(data.email || '').trim().toLowerCase();
        if (targetEmail && rowEmail === targetEmail) {
          // อัปเดตแถวเดิม
          sheet.getRange(i + 1, 2, 1, 11).setValues([[
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
          return createJsonResponse({ status: 'success', message: 'อัปเดตข้อมูลผู้ใช้งานเขตเรียบร้อยแล้ว' });
        }
      }

      // เพิ่มแถวใหม่
      const nextNo = Math.max(1, existingRows.length);
      sheet.appendRow([
        nextNo,
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

      return createJsonResponse({ status: 'success', message: 'บันทึกข้อมูลผู้ใช้งานเขตเรียบร้อยแล้ว' });
    }

    if (action === 'saveSchoolStaff') {
      const data = payload.data;
      const sheet = ss.getSheetByName(SCHOOL_SHEET_NAME);
      const existingRows = sheet.getDataRange().getValues();

      // ตรวจชื่อโรงเรียนซ้ำ (ถ้ามีให้ทำการอัปเดต)
      for (let i = 1; i < existingRows.length; i++) {
        const rowSchool = String(existingRows[i][1] || '').trim();
        const targetSchool = String(data.schoolName || '').trim();

        if (rowSchool && rowSchool === targetSchool) {
          sheet.getRange(i + 1, 3, 1, 17).setValues([[
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
          return createJsonResponse({ status: 'success', message: 'อัปเดตข้อมูลโรงเรียน ' + targetSchool + ' เรียบร้อยแล้ว' });
        }
      }

      // เพิ่มแถวใหม่
      const nextNo = Math.max(1, existingRows.length);
      sheet.appendRow([
        nextNo,
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

      return createJsonResponse({ status: 'success', message: 'บันทึกข้อมูลโรงเรียนเรียบร้อยแล้ว' });
    }

    return createJsonResponse({ status: 'error', message: 'Unknown action' });
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
    rows.push(values[i]);
  }
  return rows;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
