/**
 * การตั้งค่า Google Sheets Backend สำหรับการใช้งานบน GitHub Pages
 * (https://phokhamu.github.io/gdccuse/)
 *
 * เมื่อทำการ Commit & Push โค้ดนี้ขึ้น GitHub:
 * ผู้ใช้งานทุกคนที่เข้าใช้งานผ่าน https://phokhamu.github.io/gdccuse/
 * จะสามารถบันทึกข้อมูลและดึงข้อมูลลง Google Sheet เดียวกันได้โดยอัตโนมัติ
 */
export const DEFAULT_GAS_WEB_APP_URL: string =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_GAS_WEB_APP_URL as string)) ||
  'https://script.google.com/macros/s/AKfycbwDWCe8_CHVjFkua47zjRIpwXWFc_TcrhIp2aShaQRxZK-CnvBp30QXXMD3pFb9Wv5J/exec';
