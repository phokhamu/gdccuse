import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DISTRICT_FILE = path.join(DATA_DIR, 'district_staff.json');
const SCHOOL_FILE = path.join(DATA_DIR, 'school_staff.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Helpers
function readJsonFile(filePath: string, fallback: any = []) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// API: Get current saved data from physical files
app.get('/api/data', (_req, res) => {
  const districtStaff = readJsonFile(DISTRICT_FILE, []);
  const schoolStaff = readJsonFile(SCHOOL_FILE, []);
  res.json({
    status: 'success',
    districtStaff,
    schoolStaff,
    timestamp: new Date().toISOString(),
  });
});

// API: Save District Staff to file
app.post('/api/save/district', (req, res) => {
  const staff = req.body;
  if (!staff || !staff.id) {
    return res.status(400).json({ status: 'error', message: 'ข้อมูลไม่ถูกต้อง' });
  }

  const list: any[] = readJsonFile(DISTRICT_FILE, []);
  const idx = list.findIndex((item) => item.id === staff.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...staff, updatedAt: new Date().toLocaleString('th-TH') };
  } else {
    list.unshift({ ...staff, createdAt: staff.createdAt || new Date().toLocaleString('th-TH') });
  }

  writeJsonFile(DISTRICT_FILE, list);
  res.json({ status: 'success', message: 'บันทึกลงไฟล์ district_staff.json เรียบร้อย', data: staff });
});

// API: Save School Staff to file
app.post('/api/save/school', (req, res) => {
  const staff = req.body;
  if (!staff || !staff.id) {
    return res.status(400).json({ status: 'error', message: 'ข้อมูลไม่ถูกต้อง' });
  }

  const list: any[] = readJsonFile(SCHOOL_FILE, []);
  const idx = list.findIndex((item) => item.id === staff.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...staff, updatedAt: new Date().toLocaleString('th-TH') };
  } else {
    list.unshift({ ...staff, createdAt: staff.createdAt || new Date().toLocaleString('th-TH') });
  }

  writeJsonFile(SCHOOL_FILE, list);
  res.json({ status: 'success', message: 'บันทึกลงไฟล์ school_staff.json เรียบร้อย', data: staff });
});

// API: Save All (Bulk sync to file)
app.post('/api/save/all', (req, res) => {
  const { districtStaff, schoolStaff } = req.body;
  if (Array.isArray(districtStaff)) {
    writeJsonFile(DISTRICT_FILE, districtStaff);
  }
  if (Array.isArray(schoolStaff)) {
    writeJsonFile(SCHOOL_FILE, schoolStaff);
  }
  res.json({
    status: 'success',
    message: 'บันทึกข้อมูลทั้งหมดลงไฟล์เรียบร้อยแล้ว',
    timestamp: new Date().toISOString(),
  });
});

// API: Download genuine Google Sheets / Excel (.xlsx) file
app.get('/api/download/xlsx', (_req, res) => {
  const districtList: any[] = readJsonFile(DISTRICT_FILE, []);
  const schoolList: any[] = readJsonFile(SCHOOL_FILE, []);

  const workbook = XLSX.utils.book_new();

  // Sheet 1: ข้อมูลผู้ใช้งานเขต
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

  const districtRows = districtList.map((item, idx) => [
    idx + 1,
    item.prefixTh || item.prefix || '',
    item.firstNameTh || (item.fullName ? item.fullName.split(' ')[0] : ''),
    item.lastNameTh || (item.fullName ? item.fullName.split(' ').slice(1).join(' ') : ''),
    item.prefixEn || '',
    item.firstNameEn || '',
    item.lastNameEn || '',
    item.email || '',
    item.position || '',
    item.department || '',
    item.rolePermission || 'ผู้ใช้งาน',
    item.createdAt || '',
  ]);

  const districtSheet = XLSX.utils.aoa_to_sheet([districtHeaders, ...districtRows]);
  XLSX.utils.book_append_sheet(workbook, districtSheet, 'ข้อมูลผู้ใช้งานเขต');

  // Sheet 2: ข้อมูลโรงเรียนภายใต้เขต
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

  const schoolRows = schoolList.map((item, idx) => [
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

  const schoolSheet = XLSX.utils.aoa_to_sheet([schoolHeaders, ...schoolRows]);
  XLSX.utils.book_append_sheet(workbook, schoolSheet, 'ข้อมูลโรงเรียน');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  const filename = `ข้อมูลสพป_บึงกาฬ_${new Date().toISOString().slice(0, 10)}.xlsx`;

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.send(buffer);
});

// Vite middleware in dev or static in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
