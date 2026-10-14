/**
 * การตั้งค่า Google Sheets Backend สำหรับการใช้งานบน GitHub Pages
 * (https://phokhamu.github.io/gdccuse/)
 *
 * คำแนะนำ:
 * 1. หลังจากสร้าง Google Apps Script และ Deploy เป็น Web app เรียบร้อยแล้ว
 * 2. นำ URL ของเว็บแอป (ลงท้ายด้วย /exec) มาวางลงในตัวแปร DEFAULT_GAS_WEB_APP_URL ด้านล่างนี้
 * 3. Commit และ Push ขึ้น GitHub
 * -> เมื่อทำขั้นตอนนี้แล้ว ผู้ใช้งานทุกคนที่เข้าใช้งานผ่าน https://phokhamu.github.io/gdccuse/
 *    จะสามารถบันทึกข้อมูลและดึงข้อมูลลง Google Sheet เดียวกันได้โดยอัตโนมัติ ไม่ต้องตั้งค่าทีละเครื่อง!
 */
export const DEFAULT_GAS_WEB_APP_URL: string =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_GAS_WEB_APP_URL as string)) ||
  '';
