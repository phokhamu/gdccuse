import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/gasScriptTemplate';
import { GASConfig, DistrictStaff, SchoolStaffRecord } from '../types';
import { testGASConnection, syncAllToGAS } from '../utils/gasService';
import {
  FileSpreadsheet,
  Copy,
  Check,
  Link,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Database,
  ArrowRight,
  Server,
  Sparkles,
} from 'lucide-react';

interface GASSettingsTabProps {
  gasConfig: GASConfig;
  onUpdateConfig: (config: GASConfig) => void;
  districtStaffList: DistrictStaff[];
  schoolStaffList: SchoolStaffRecord[];
}

export const GASSettingsTab: React.FC<GASSettingsTabProps> = ({
  gasConfig,
  onUpdateConfig,
  districtStaffList,
  schoolStaffList,
}) => {
  const [webAppUrl, setWebAppUrl] = useState<string>(gasConfig.webAppUrl || '');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveUrl = () => {
    const cleanUrl = webAppUrl.trim();
    onUpdateConfig({
      ...gasConfig,
      webAppUrl: cleanUrl,
      connected: cleanUrl.length > 0,
    });
  };

  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      setTestResult({ success: false, message: 'กรุณาระบุ Web App URL ก่อนทดสอบ' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGASConnection(webAppUrl.trim());
      setTestResult(res);
      if (res.success) {
        onUpdateConfig({
          ...gasConfig,
          webAppUrl: webAppUrl.trim(),
          connected: true,
          lastSyncTime: new Date().toLocaleTimeString('th-TH'),
        });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleBulkSync = async () => {
    if (!webAppUrl.trim()) {
      setSyncResult({ success: false, message: 'กรุณาระบุ Web App URL ก่อนกดซิงก์ข้อมูล' });
      return;
    }
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncAllToGAS(districtStaffList, schoolStaffList, webAppUrl.trim());
      setSyncResult(res);
      if (res.success) {
        onUpdateConfig({
          ...gasConfig,
          lastSyncTime: new Date().toLocaleTimeString('th-TH'),
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Google Apps Script (GAS) Web App
                </span>
                <span className="text-xs text-slate-500">Google Sheets Integration</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
                การตั้งค่าเชื่อมต่อ Google Sheets ผ่าน Google Apps Script
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                เชื่อมต่อระบบเว็บเข้ากับ Google Sheets ของท่านโดยตรง เพื่อบันทึกข้อมูลผู้ใช้งานเขตและข้อมูลโรงเรียนแบบอัตโนมัติ
              </p>
            </div>
          </div>

          <div
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              gasConfig.webAppUrl
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                gasConfig.webAppUrl ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
              }`}
            />
            <span>{gasConfig.webAppUrl ? 'ตั้งค่า URL แล้ว' : 'ยังไม่ได้เชื่อมต่อ Google Sheets'}</span>
          </div>
        </div>

        {/* Web App URL Input & Action Buttons */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Link className="w-4 h-4 text-teal-700" />
                <span>Google Apps Script Web App URL *</span>
              </div>
              <span className="text-xs text-slate-400 font-normal">
                (ต้องลงท้ายด้วย /exec)
              </span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                value={webAppUrl}
                onChange={(e) => setWebAppUrl(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
              />
              <button
                type="button"
                onClick={handleSaveUrl}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                บันทึก URL
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-400"
              >
                {isTesting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>ทดสอบการเชื่อมต่อ</span>
              </button>
            </div>
          </div>

          {/* Test connection alert result */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="mt-0.5">
                {testResult.success ? '✓' : '✗'}
              </div>
              <div>
                <p className="font-bold">{testResult.success ? 'เชื่อมต่อสำเร็จ!' : 'เชื่อมต่อไม่สำเร็จ'}</p>
                <p>{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Bulk Sync Section */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-teal-950 flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-700" />
                <span>ซิงก์ข้อมูลทั้งหมดเข้าสู่ Google Sheets</span>
              </div>
              <p className="text-xs text-teal-800 mt-0.5">
                ส่งข้อมูลผู้ใช้งานเขต ({districtStaffList.length} คน) และข้อมูลโรงเรียน ({schoolStaffList.length} คน) ขึ้นไปยัง Google Sheets ทันที
              </p>
            </div>

            <button
              type="button"
              onClick={handleBulkSync}
              disabled={isSyncing || !webAppUrl.trim()}
              className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed shrink-0"
            >
              {isSyncing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังส่งข้อมูล...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ซิงก์ข้อมูลทั้งหมดทันที</span>
                </>
              )}
            </button>
          </div>

          {syncResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                syncResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="mt-0.5">{syncResult.success ? '✓' : '✗'}</div>
              <div>
                <p className="font-bold">{syncResult.success ? 'ซิงก์สำเร็จ!' : 'เกิดข้อผิดพลาด'}</p>
                <p>{syncResult.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step by step Setup Guide */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <HelpCircle className="w-5 h-5 text-teal-700" />
          <span>ขั้นตอนการติดตั้ง Google Apps Script (5 ขั้นตอนง่ายๆ)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <div className="font-bold text-xs text-slate-800 pt-1">เปิด Google Sheets</div>
            <p className="text-[11px] text-slate-600">
              สร้าง Google Sheet ใหม่ หรือเปิดไฟล์ของ สพป.บึงกาฬ ที่ต้องการ
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <div className="font-bold text-xs text-slate-800 pt-1">เปิด Apps Script</div>
            <p className="text-[11px] text-slate-600">
              ไปที่เมนู <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <div className="font-bold text-xs text-slate-800 pt-1">วางโค้ด Code.gs</div>
            <p className="text-[11px] text-slate-600">
              คัดลอกโค้ดด้านล่าง วางทับในไฟล์ <strong>Code.gs</strong> แล้วกดบันทึก (Save)
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center">
              4
            </span>
            <div className="font-bold text-xs text-slate-800 pt-1">Deploy เป็น Web App</div>
            <p className="text-[11px] text-slate-600">
              กด <strong>ทำให้ใช้งานได้ (Deploy)</strong> &gt; เลือก <strong>เว็บแอป (Web app)</strong> &gt; ใครเข้าถึงได้เลือก <strong>ทุกคน (Anyone)</strong>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center">
              5
            </span>
            <div className="font-bold text-xs text-slate-800 pt-1">วาง URL ในระบบ</div>
            <p className="text-[11px] text-slate-600">
              คัดลอก Web app URL มาวางในช่องด้านบน แล้วกด <strong>บันทึก URL</strong> พร้อมใช้งานทันที!
            </p>
          </div>
        </div>

        {/* Sheets Tab Structure Description */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            โครงสร้างแผ่นงานที่จะถูกสร้างอัตโนมัติใน Google Sheets:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-blue-200 space-y-1">
              <span className="font-bold text-blue-900">แผ่นงานที่ 1: "ข้อมูลผู้ใช้งานเขต"</span>
              <p className="text-slate-600">
                คอลัมน์: ลำดับ, รหัสอ้างอิง, วันที่บันทึก, คำนำหน้า, ชื่อ-สกุล, ตำแหน่ง, กลุ่ม/ฝ่ายงาน, เลขประจำตัวประชาชน, เบอร์โทรศัพท์, อีเมล, ไอดีไลน์, หมายเหตุ
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-1">
              <span className="font-bold text-emerald-900">แผ่นงานที่ 2: "ข้อมูลโรงเรียน"</span>
              <p className="text-slate-600">
                คอลัมน์: ลำดับ, รหัสอ้างอิง, วันที่บันทึก, กลุ่มโรงเรียน, รหัสโรงเรียน, ชื่อโรงเรียน, ตำแหน่งเป้าหมาย (ผอ./ธุรการ), คำนำหน้า, ชื่อ-สกุล, เลขประจำตัวประชาชน, เบอร์โทรศัพท์, อีเมล, ไอดีไลน์, หมายเหตุ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer with Copy Button */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-800 space-y-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono text-teal-400">Code.gs (Google Apps Script Backend)</div>
            <h4 className="text-base font-bold text-white mt-0.5">
              ซอร์สโค้ดสำหรับวางใน Google Sheets
            </h4>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>คัดลอกเรียบร้อยแล้ว ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>คัดลอกโค้ดทั้งหมด (Copy Code)</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-300 max-h-96 overflow-y-auto leading-relaxed border border-slate-800">
            {GOOGLE_APPS_SCRIPT_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
};
