import { SchoolCluster, SchoolInfo } from '../types';

export interface OfficialNetwork {
  networkId: number;
  networkName: string;
}

export const OFFICIAL_NETWORKS: OfficialNetwork[] = [
  { networkId: 1, networkName: 'คำแก้วถ้ำเจริญ' },
  { networkId: 2, networkName: 'โคกก่องชัยพร' },
  { networkId: 3, networkName: 'ซางหนองทุ่ม' },
  { networkId: 4, networkName: 'เซกา' },
  { networkId: 5, networkName: 'โซ่เหล่าทอง' },
  { networkId: 6, networkName: 'ดงบังท่าดอกคำ' },
  { networkId: 7, networkName: 'ดอนหญ้านาง' },
  { networkId: 8, networkName: 'ท่ากกแดงท่าสะอาด' },
  { networkId: 9, networkName: 'นาสะแบงนาแสง' },
  { networkId: 10, networkName: 'โนนสมบูรณ์นาสวรรค์คำนาดี' },
  { networkId: 11, networkName: 'โนนสว่างโป่งเปือยไคสี' },
  { networkId: 12, networkName: 'บ้านต้องโสกก่าม' },
  { networkId: 13, networkName: 'บึงกาฬวิศิษฐ์' },
  { networkId: 14, networkName: 'บึงโขงหลง' },
  { networkId: 15, networkName: 'บุ่งคล้า' },
  { networkId: 16, networkName: 'ป่งไฮน้ำจั้น' },
  { networkId: 17, networkName: 'ปากคาด' },
  { networkId: 18, networkName: 'พรเจริญ' },
  { networkId: 19, networkName: 'ศรีชมภู' },
  { networkId: 20, networkName: 'ศรีวิไลชุมภูพรนาสิงห์' },
  { networkId: 21, networkName: 'หนองพันทาบัวตูม' },
  { networkId: 22, networkName: 'หนองยองสมสนุกนาดง' },
  { networkId: 23, networkName: 'หอคำหนองเลิง' },
];

export interface OfficialSchoolRaw {
  schoolId: number;
  smis: string;
  schoolName: string;
  networkId: number;
}

export const OFFICIAL_SCHOOLS_RAW: OfficialSchoolRaw[] = [
  { schoolId: 1, smis: '43030084', schoolName: 'บ้านห้วยคอม', networkId: 4 },
  { schoolId: 2, smis: '43030085', schoolName: 'อนุบาลเซกา', networkId: 4 },
  { schoolId: 3, smis: '43030086', schoolName: 'บ้านโนนสูงสุขสมบูรณ์', networkId: 4 },
  { schoolId: 4, smis: '43030079', schoolName: 'บ้านห้วยผักขะ', networkId: 4 },
  { schoolId: 5, smis: '43030080', schoolName: 'บ้านนางัวสายปัญญา', networkId: 4 },
  { schoolId: 6, smis: '43030081', schoolName: 'บ้านโนนเหมือดแอ่', networkId: 4 },
  { schoolId: 7, smis: '43030100', schoolName: 'บ้านเหล่าคาม', networkId: 16 },
  { schoolId: 8, smis: '43030098', schoolName: 'บ้านคำบอน', networkId: 16 },
  { schoolId: 9, smis: '43030099', schoolName: 'บ้านดงกะพุงหนองนาแซง', networkId: 16 },
  { schoolId: 10, smis: '43030082', schoolName: 'บ้านห้วยเรือ', networkId: 4 },
  { schoolId: 11, smis: '43030083', schoolName: 'บ้านทรัพย์วังทองอุดมทรัพย์', networkId: 4 },
  { schoolId: 12, smis: '43030074', schoolName: 'ชุมชนบ้านซาง', networkId: 3 },
  { schoolId: 13, smis: '43030075', schoolName: 'บ้านท่าสำราญ', networkId: 3 },
  { schoolId: 14, smis: '43030076', schoolName: 'บ้านซ่อมกอก', networkId: 3 },
  { schoolId: 15, smis: '43030077', schoolName: 'บ้านโคกบริการสันกำแพง', networkId: 3 },
  { schoolId: 16, smis: '43030119', schoolName: 'บ้านเหล่าหนองยาง', networkId: 3 },
  { schoolId: 17, smis: '43030120', schoolName: 'บ้านกุดสิม', networkId: 3 },
  { schoolId: 18, smis: '43030121', schoolName: 'บ้านหนองจิก', networkId: 3 },
  { schoolId: 19, smis: '43030117', schoolName: 'หนองทุ่มวิทยา', networkId: 3 },
  { schoolId: 20, smis: '43030087', schoolName: 'บ้านท่ากกแดง', networkId: 8 },
  { schoolId: 21, smis: '43030088', schoolName: 'ชุมชนบ้านหนองหิ้ง', networkId: 8 },
  { schoolId: 22, smis: '43030089', schoolName: 'บ้านหนองบัวแดง', networkId: 8 },
  { schoolId: 23, smis: '43030090', schoolName: 'บ้านโพธิ์น้อยหนองสิม', networkId: 8 },
  { schoolId: 24, smis: '43030091', schoolName: 'บ้านท่ากกต้อง', networkId: 8 },
  { schoolId: 25, smis: '43030097', schoolName: 'บ้านท่าสะอาด', networkId: 8 },
  { schoolId: 26, smis: '43030093', schoolName: 'บ้านหัวแฮต', networkId: 8 },
  { schoolId: 27, smis: '43030095', schoolName: 'บ้านตาลเดี่ยว', networkId: 8 },
  { schoolId: 28, smis: '43030107', schoolName: 'บ้านท่าเชียงเครือ', networkId: 16 },
  { schoolId: 29, smis: '43030112', schoolName: 'บ้านป่งไฮราษฎร์สามัคคี', networkId: 16 },
  { schoolId: 30, smis: '43030108', schoolName: 'บ้านหนองชัยวาน', networkId: 16 },
  { schoolId: 31, smis: '43030110', schoolName: 'บ้านหนองแก่งทราย', networkId: 16 },
  { schoolId: 32, smis: '43030111', schoolName: 'ท่าไร่วิทยา', networkId: 16 },
  { schoolId: 33, smis: '43030092', schoolName: 'บ้านใหม่สามัคคี', networkId: 8 },
  { schoolId: 34, smis: '43030101', schoolName: 'บ้านทุ่งทรายจก', networkId: 12 },
  { schoolId: 35, smis: '43030102', schoolName: 'บ้านดอนเสียด', networkId: 12 },
  { schoolId: 36, smis: '43030103', schoolName: 'บ้านศิริพัฒน์', networkId: 12 },
  { schoolId: 37, smis: '43030105', schoolName: 'บ้านต้องโคกกะแซ', networkId: 12 },
  { schoolId: 38, smis: '43030106', schoolName: 'บ้านโนนยางคำ', networkId: 12 },
  { schoolId: 39, smis: '43030113', schoolName: 'บ้านโสกก่ามนาตาไก้', networkId: 12 },
  { schoolId: 40, smis: '43030114', schoolName: 'บ้านดงสว่าง', networkId: 12 },
  { schoolId: 41, smis: '43030115', schoolName: 'บ้านบ่อพนา', networkId: 12 },
  { schoolId: 42, smis: '43030116', schoolName: 'บ้านโนนสำราญ-ยางเรียน', networkId: 12 },
  { schoolId: 43, smis: '43020073', schoolName: 'อนุบาลโซ่พิสัย', networkId: 5 },
  { schoolId: 44, smis: '43020074', schoolName: 'บ้านหนองตะไก้โนนมันปลา', networkId: 5 },
  { schoolId: 45, smis: '43020075', schoolName: 'บ้านไทรงามโนนภูดิน', networkId: 5 },
  { schoolId: 46, smis: '43020070', schoolName: 'บ้านห้วยทราย', networkId: 5 },
  { schoolId: 47, smis: '43020071', schoolName: 'บ้านท่าสวาทท่าลี่', networkId: 5 },
  { schoolId: 48, smis: '43020072', schoolName: 'บ้านโคกสะอาด', networkId: 5 },
  { schoolId: 49, smis: '43020069', schoolName: 'บ้านคำแวง', networkId: 1 },
  { schoolId: 50, smis: '43020063', schoolName: 'บ้านคำแก้วโนนสามัคคี', networkId: 1 },
  { schoolId: 51, smis: '43020064', schoolName: 'บ้านหนองโดดอนเสียด', networkId: 1 },
  { schoolId: 52, smis: '43020065', schoolName: 'บ้านโนนสะแบงหนองสวรรค์', networkId: 1 },
  { schoolId: 53, smis: '43020066', schoolName: 'บ้านนางวงสุ่มห้วยเนียม', networkId: 1 },
  { schoolId: 54, smis: '43020067', schoolName: 'บ้านคำเตาะเลาะโนนเค็ง', networkId: 1 },
  { schoolId: 55, smis: '43020076', schoolName: 'สังวาลย์วิทย์ 1', networkId: 1 },
  { schoolId: 56, smis: '43020078', schoolName: 'บ้านศรีนาวา', networkId: 1 },
  { schoolId: 57, smis: '43020091', schoolName: 'บ้านศรีชมภู', networkId: 19 },
  { schoolId: 58, smis: '43020092', schoolName: 'บ้านนาขาม', networkId: 19 },
  { schoolId: 59, smis: '43020093', schoolName: 'บ้านโนนประเสริฐ', networkId: 19 },
  { schoolId: 60, smis: '43020087', schoolName: 'บ้านหนองแวงประชาสรรค์', networkId: 19 },
  { schoolId: 61, smis: '43020088', schoolName: 'บ้านคำไผ่', networkId: 19 },
  { schoolId: 62, smis: '43020089', schoolName: 'บ้านโคกกลาง', networkId: 19 },
  { schoolId: 63, smis: '43020079', schoolName: 'บ้านโคกกระแชขี้เหล็กน้อย', networkId: 1 },
  { schoolId: 64, smis: '43020090', schoolName: 'บ้านแสงอรุณ', networkId: 19 },
  { schoolId: 65, smis: '43020098', schoolName: 'บ้านเหล่าทองหลาง', networkId: 5 },
  { schoolId: 66, smis: '43020099', schoolName: 'บ้านคลองทิพย์', networkId: 5 },
  { schoolId: 67, smis: '43020094', schoolName: 'ห้วยลึกวิทยา', networkId: 21 },
  { schoolId: 68, smis: '43020100', schoolName: 'บ้านซำบอน', networkId: 5 },
  { schoolId: 69, smis: '43020080', schoolName: 'บ้านโนนสวาง', networkId: 1 },
  { schoolId: 70, smis: '43020081', schoolName: 'บ้านหนองแวง', networkId: 1 },
  { schoolId: 71, smis: '43020077', schoolName: 'บ้านถ้ำเจริญ', networkId: 1 },
  { schoolId: 72, smis: '43020097', schoolName: 'บ้านหนองพันทา', networkId: 21 },
  { schoolId: 73, smis: '43020095', schoolName: 'บ้านโนนแก้วโพนทอง', networkId: 21 },
  { schoolId: 74, smis: '43020096', schoolName: 'บ้านป่าไร่โนนม่วง', networkId: 21 },
  { schoolId: 75, smis: '43020082', schoolName: 'ชุมชนบ้านตูม', networkId: 21 },
  { schoolId: 76, smis: '43020084', schoolName: 'บ้านท่าคำรวม', networkId: 21 },
  { schoolId: 77, smis: '43020085', schoolName: 'บ้านสามหนอง', networkId: 21 },
  { schoolId: 78, smis: '43020083', schoolName: 'บ้านนาเหว่อโนนอุดม', networkId: 21 },
  { schoolId: 79, smis: '43030037', schoolName: 'อนุบาลบึงกาฬวิศิษฐ์อำนวยศิลป์', networkId: 13 },
  { schoolId: 80, smis: '43030038', schoolName: 'บ้านนาป่าน', networkId: 13 },
  { schoolId: 81, smis: '43030039', schoolName: 'บ้านพันลำแสนเจริญวิทยา', networkId: 13 },
  { schoolId: 82, smis: '43030028', schoolName: 'บ้านบึงกาฬ', networkId: 13 },
  { schoolId: 83, smis: '43030035', schoolName: 'บ้านหนองนาแซง ดอนเจริญ', networkId: 13 },
  { schoolId: 84, smis: '43030029', schoolName: 'บ้านท่าไคร้', networkId: 13 },
  { schoolId: 85, smis: '43030030', schoolName: 'บ้านท่าโพธิ์', networkId: 13 },
  { schoolId: 86, smis: '43030031', schoolName: 'บ้านแสนสำราญ', networkId: 13 },
  { schoolId: 87, smis: '43030034', schoolName: 'บ้านเหล่าถาวร', networkId: 13 },
  { schoolId: 88, smis: '43030040', schoolName: 'บ้านโนนสว่าง', networkId: 11 },
  { schoolId: 89, smis: '43030032', schoolName: 'บ้านโป่งเปือย', networkId: 11 },
  { schoolId: 90, smis: '43030033', schoolName: 'บ้านห้วยสามยอดเทวกุล', networkId: 11 },
  { schoolId: 91, smis: '43030012', schoolName: 'บ้านห้วยเซือมเหนือ', networkId: 11 },
  { schoolId: 92, smis: '43030013', schoolName: 'บ้านไคสี', networkId: 11 },
  { schoolId: 93, smis: '43030014', schoolName: "บ้านคำหมื่น'ตชด.อนุสรณ์'", networkId: 11 },
  { schoolId: 94, smis: '43030015', schoolName: 'แก่งอาฮง', networkId: 11 },
  { schoolId: 95, smis: '43030047', schoolName: 'หอคำพิทยาสรรค์', networkId: 23 },
  { schoolId: 96, smis: '43030049', schoolName: 'บ้านสะง้อ', networkId: 23 },
  { schoolId: 97, smis: '43030050', schoolName: 'บ้านหนองเข็ง', networkId: 23 },
  { schoolId: 98, smis: '43030051', schoolName: 'บ้านโนนยาง', networkId: 23 },
  { schoolId: 99, smis: '43030052', schoolName: 'บ้านโคกสะอาด', networkId: 23 },
  { schoolId: 100, smis: '43030048', schoolName: 'ธเนตรวิทยา', networkId: 23 },
  { schoolId: 101, smis: '43030042', schoolName: 'บ้านหนองหมู', networkId: 23 },
  { schoolId: 102, smis: '43030043', schoolName: 'บ้านนาเจริญ', networkId: 23 },
  { schoolId: 103, smis: '43030044', schoolName: 'บ้านคลองเค็ม', networkId: 23 },
  { schoolId: 104, smis: '43030045', schoolName: 'บ้านสรรเสริญ', networkId: 23 },
  { schoolId: 105, smis: '43030046', schoolName: 'บ้านสุขสำราญ', networkId: 23 },
  { schoolId: 106, smis: '43030041', schoolName: 'บ้านดอนปอ', networkId: 11 },
  { schoolId: 107, smis: '43030025', schoolName: 'ชุมชนบ้านโนนสมบูรณ์ (ธนาคารกรุงเทพ 29)', networkId: 10 },
  { schoolId: 108, smis: '43030026', schoolName: 'บ้านทองสาย', networkId: 10 },
  { schoolId: 109, smis: '43030027', schoolName: 'บ้านกำแพงเพชร', networkId: 10 },
  { schoolId: 110, smis: '43030024', schoolName: 'บ้านโนนจำปา', networkId: 10 },
  { schoolId: 111, smis: '43030022', schoolName: 'บ้านนาสวรรค์', networkId: 10 },
  { schoolId: 112, smis: '43030001', schoolName: 'เลิดสิน', networkId: 10 },
  { schoolId: 113, smis: '43030021', schoolName: 'บ้านหนองตอ', networkId: 10 },
  { schoolId: 114, smis: '43030002', schoolName: 'บ้านชุมภูทอง', networkId: 10 },
  { schoolId: 115, smis: '43030003', schoolName: 'บ้านนาเจริญวิทยา', networkId: 10 },
  { schoolId: 116, smis: '43030004', schoolName: 'บ้านดอนแก้วโนนอินทร์แปลง', networkId: 10 },
  { schoolId: 117, smis: '43030023', schoolName: 'บ้านโคกสวาง', networkId: 10 },
  { schoolId: 118, smis: '43030011', schoolName: 'บ้านโนนวังเยี่ยม', networkId: 2 },
  { schoolId: 119, smis: '43030005', schoolName: 'บ้านโคกก่องมิตรภาพที่ 86', networkId: 2 },
  { schoolId: 120, smis: '43030006', schoolName: 'บ้านโนนสา', networkId: 2 },
  { schoolId: 121, smis: '43030007', schoolName: 'บ้านนาคำ', networkId: 2 },
  { schoolId: 122, smis: '43030008', schoolName: 'บ้านห้วยดอกไม้', networkId: 2 },
  { schoolId: 123, smis: '43030009', schoolName: 'บ้านท่าอินทร์แปลง', networkId: 2 },
  { schoolId: 124, smis: '43030017', schoolName: 'ประสานมิตรวิทยา', networkId: 2 },
  { schoolId: 125, smis: '43030018', schoolName: 'บ้านคำภู', networkId: 2 },
  { schoolId: 126, smis: '43030019', schoolName: 'บ้านหนองยาว', networkId: 2 },
  { schoolId: 127, smis: '43030016', schoolName: 'บ้านนาต้อง', networkId: 2 },
  { schoolId: 128, smis: '43030020', schoolName: 'บ้านห้วยเชือมใต้', networkId: 2 },
  { schoolId: 129, smis: '43030010', schoolName: 'บ้านไร่สุขสันต์', networkId: 2 },
  { schoolId: 130, smis: '43030059', schoolName: 'อนุบาลพรเจริญ', networkId: 18 },
  { schoolId: 131, smis: '43030058', schoolName: 'ชุมชนบ้านโคกอุดม', networkId: 18 },
  { schoolId: 132, smis: '43030056', schoolName: 'บ้านปรารถนาดี', networkId: 18 },
  { schoolId: 133, smis: '43030057', schoolName: 'บ้านใหม่ศรีชมภู', networkId: 18 },
  { schoolId: 134, smis: '43030060', schoolName: 'บ้านโคกนิยมโนนสวาท', networkId: 18 },
  { schoolId: 135, smis: '43030061', schoolName: 'บ้านวังยาว', networkId: 18 },
  { schoolId: 136, smis: '43030062', schoolName: 'บ้านสร้างคำ', networkId: 18 },
  { schoolId: 137, smis: '43030063', schoolName: 'บ้านดงเสียด', networkId: 18 },
  { schoolId: 138, smis: '43030064', schoolName: 'บ้านโนน', networkId: 18 },
  { schoolId: 139, smis: '43030065', schoolName: 'บ้านหนองผักแว่น', networkId: 18 },
  { schoolId: 140, smis: '43030066', schoolName: 'บ้านหนองบัวน้อย', networkId: 18 },
  { schoolId: 141, smis: '43030053', schoolName: 'บ้านดอนหญ้านาง', networkId: 7 },
  { schoolId: 142, smis: '43030054', schoolName: 'บ้านโคกสว่าง', networkId: 7 },
  { schoolId: 143, smis: '43030069', schoolName: 'บ้านโคกหนองลาด', networkId: 7 },
  { schoolId: 144, smis: '43030067', schoolName: 'บ้านนาคำนาใน', networkId: 7 },
  { schoolId: 145, smis: '43030068', schoolName: 'บ้านเหล่าใหญ่', networkId: 7 },
  { schoolId: 146, smis: '43030073', schoolName: 'บ้านหนองหัวช้าง', networkId: 7 },
  { schoolId: 147, smis: '43030071', schoolName: 'บ้านโนนสวรรค์โพนแก้ว', networkId: 7 },
  { schoolId: 148, smis: '43030072', schoolName: 'บ้านนาซาว', networkId: 7 },
  { schoolId: 149, smis: '43030070', schoolName: 'บ้านท่าศรีชมชื่น', networkId: 7 },
  { schoolId: 150, smis: '43030055', schoolName: 'สันติสุขเจริญราษฎร์', networkId: 7 },
  { schoolId: 151, smis: '43020112', schoolName: 'อนุบาลปากคาด', networkId: 17 },
  { schoolId: 152, smis: '43020106', schoolName: 'บ้านไร่โนนสำราญ', networkId: 22 },
  { schoolId: 153, smis: '43020108', schoolName: 'บ้านโนนเสถียร', networkId: 17 },
  { schoolId: 154, smis: '43020104', schoolName: 'บ้านนาดง', networkId: 22 },
  { schoolId: 155, smis: '43020113', schoolName: 'บ้านห้วยไม้ซอด', networkId: 17 },
  { schoolId: 156, smis: '43020111', schoolName: 'บ้านห้วยก้านเหลือง', networkId: 17 },
  { schoolId: 157, smis: '43020101', schoolName: 'บ้านต้าย', networkId: 17 },
  { schoolId: 158, smis: '43020102', schoolName: 'บ้านนากั้ง', networkId: 17 },
  { schoolId: 159, smis: '43020103', schoolName: 'บ้านหนองบัว', networkId: 17 },
  { schoolId: 160, smis: '43020109', schoolName: 'บ้านพรสวรรค์', networkId: 17 },
  { schoolId: 161, smis: '43020119', schoolName: 'ชุมชนบ้านหนองยองวิทยา', networkId: 22 },
  { schoolId: 162, smis: '43020114', schoolName: 'สมาคมสื่อมวลชนกีฬาสมัครเล่นและดารา', networkId: 22 },
  { schoolId: 163, smis: '43020118', schoolName: 'สิริภัทรวิทยา', networkId: 22 },
  { schoolId: 164, smis: '43020115', schoolName: 'ชุมชนสมสนุก', networkId: 22 },
  { schoolId: 165, smis: '43020116', schoolName: 'บ้านศรีสว่างพัฒนา', networkId: 22 },
  { schoolId: 166, smis: '43020105', schoolName: 'บ้านโสกบง', networkId: 22 },
  { schoolId: 167, smis: '43020107', schoolName: 'บ้านดาลบังบด', networkId: 22 },
  { schoolId: 168, smis: '43020117', schoolName: 'บ้านบะยาวราษฎร์นุเคราะห์', networkId: 22 },
  { schoolId: 169, smis: '43030135', schoolName: 'ชุมชนบัวโคก', networkId: 14 },
  { schoolId: 170, smis: '43030136', schoolName: 'บ้านดงชมภู', networkId: 14 },
  { schoolId: 171, smis: '43030137', schoolName: 'อนุบาลสาสนสิทธิ์อำนวย', networkId: 14 },
  { schoolId: 172, smis: '43030131', schoolName: 'บึงของหลงวิทยา', networkId: 14 },
  { schoolId: 173, smis: '43030132', schoolName: 'บ้านโสกโพธิ์โสกพอก', networkId: 14 },
  { schoolId: 174, smis: '43030133', schoolName: 'บ้านนาขามโนนสวนปอ', networkId: 14 },
  { schoolId: 175, smis: '43030134', schoolName: 'บ้านคำสมบูรณ์บึงเจริญ', networkId: 14 },
  { schoolId: 176, smis: '43030138', schoolName: 'บ้านนาอ่าง', networkId: 14 },
  { schoolId: 177, smis: '43030139', schoolName: 'หนองสิมโนนสวรรค์', networkId: 14 },
  { schoolId: 178, smis: '43030122', schoolName: 'บ้านดงโทน', networkId: 6 },
  { schoolId: 179, smis: '43030123', schoolName: 'บ้านดงบัง', networkId: 6 },
  { schoolId: 180, smis: '43030124', schoolName: 'บ้านท่าสีไค', networkId: 6 },
  { schoolId: 181, smis: '43030125', schoolName: 'บ้านหนองฮูฝอยลม', networkId: 6 },
  { schoolId: 182, smis: '43030126', schoolName: 'บ้านท่าไร่ไทยเจริญ', networkId: 6 },
  { schoolId: 183, smis: '43030127', schoolName: 'บ้านท่าดอกคำ', networkId: 6 },
  { schoolId: 184, smis: '43030128', schoolName: 'บ้านเหล่าหมากผาง', networkId: 6 },
  { schoolId: 185, smis: '43030129', schoolName: 'โนนสาสวรรค์', networkId: 6 },
  { schoolId: 186, smis: '43030130', schoolName: 'หนองแสงประชาสรรค์', networkId: 6 },
  { schoolId: 187, smis: '43030140', schoolName: 'บ้านชุมภูพรโสกก่าม', networkId: 20 },
  { schoolId: 188, smis: '43030154', schoolName: 'บ้านหนองจันทน์', networkId: 20 },
  { schoolId: 189, smis: '43030155', schoolName: 'อนุบาลศรีวิไล', networkId: 20 },
  { schoolId: 190, smis: '43030148', schoolName: 'บ้านนาสิงห์', networkId: 20 },
  { schoolId: 191, smis: '43030141', schoolName: 'บ้านโคกสำราญพรสวรรค์', networkId: 20 },
  { schoolId: 192, smis: '43030142', schoolName: 'บ้านห้วยลึก', networkId: 20 },
  { schoolId: 193, smis: '43030147', schoolName: 'บ้านนาทราย', networkId: 20 },
  { schoolId: 194, smis: '43030143', schoolName: 'บ้านโนนม่วง', networkId: 20 },
  { schoolId: 195, smis: '43030144', schoolName: 'บ้านนาสะแบง', networkId: 9 },
  { schoolId: 196, smis: '43030149', schoolName: 'บ้านนาแสง', networkId: 9 },
  { schoolId: 197, smis: '43030150', schoolName: 'บ้านนาคำแคน', networkId: 9 },
  { schoolId: 198, smis: '43030151', schoolName: 'กัลยาณิวัฒนา 2', networkId: 9 },
  { schoolId: 199, smis: '43030152', schoolName: 'บ้านคำไชยวาล', networkId: 9 },
  { schoolId: 200, smis: '43030145', schoolName: 'บ้านหนองบัวงาม', networkId: 9 },
  { schoolId: 201, smis: '43030146', schoolName: 'บ้านหนองจิก', networkId: 9 },
  { schoolId: 202, smis: '43030160', schoolName: 'อนุบาลบุ่งคล้า', networkId: 15 },
  { schoolId: 203, smis: '43030162', schoolName: 'บ้านนาจาน', networkId: 15 },
  { schoolId: 204, smis: '43030163', schoolName: 'บ้านดอนแพง', networkId: 15 },
  { schoolId: 205, smis: '43030164', schoolName: 'บ้านห้วยเล็บมือ', networkId: 15 },
  { schoolId: 206, smis: '43030165', schoolName: 'บ้านหนองเดิ่นทุ่ง', networkId: 15 },
  { schoolId: 207, smis: '43030166', schoolName: 'บ้านหนองเดิ่นท่า', networkId: 15 },
  { schoolId: 208, smis: '43030161', schoolName: 'บ้านขามเปี้ย', networkId: 15 },
  { schoolId: 209, smis: '43030158', schoolName: 'ไทยรัฐวิทยา 51 (บ้านโคกกว้าง)', networkId: 15 },
  { schoolId: 210, smis: '43030159', schoolName: 'บ้านท่าส้มโฮง', networkId: 15 },
  { schoolId: 211, smis: '43030156', schoolName: 'บ้านหาดแฮ่', networkId: 15 },
  { schoolId: 212, smis: '43030157', schoolName: 'ประวิตร (หนองบ่อ)', networkId: 15 },
  { schoolId: 213, smis: '43034001', schoolName: 'ตชด.บ้านห้วยดอกไม้', networkId: 13 },
  { schoolId: 214, smis: '43034002', schoolName: 'ตชด.บ้านนาแวง', networkId: 10 },
  { schoolId: 215, smis: '43034003', schoolName: 'ตชด.บ้านหนองตะไก้', networkId: 11 },
  { schoolId: 216, smis: '43034004', schoolName: 'ตชด.บ้านคำชมภู', networkId: 12 },
  { schoolId: 217, smis: '43034005', schoolName: 'ตชด.บ้านไทยเสรี', networkId: 4 },
];

// Map into standard SchoolCluster list
export const SCHOOL_CLUSTERS: SchoolCluster[] = OFFICIAL_NETWORKS.map((net) => {
  const count = OFFICIAL_SCHOOLS_RAW.filter((s) => s.networkId === net.networkId).length;
  return {
    id: `network-${net.networkId}`,
    name: net.networkName,
    district: 'สพป.บึงกาฬ',
    schoolCount: count,
  };
});

// Map into standard SchoolInfo list
export const ALL_SCHOOLS: SchoolInfo[] = OFFICIAL_SCHOOLS_RAW.map((s) => {
  const network = OFFICIAL_NETWORKS.find((n) => n.networkId === s.networkId);
  const clusterName = network ? network.networkName : 'ไม่ระบุกลุ่ม';
  const fullSchoolName = s.schoolName.startsWith('อนุบาล') ||
    s.schoolName.startsWith('ชุมชน') ||
    s.schoolName.startsWith('ตชด.') ||
    s.schoolName.startsWith('ไทยรัฐ') ||
    s.schoolName.startsWith('สังวาลย์') ||
    s.schoolName.startsWith('ธเนตร') ||
    s.schoolName.startsWith('เลิดสิน') ||
    s.schoolName.startsWith('กัลยาณิวัฒนา') ||
    s.schoolName.startsWith('สิริภัทร') ||
    s.schoolName.startsWith('สมาคม') ||
    s.schoolName.startsWith('สันติสุข') ||
    s.schoolName.startsWith('ประสานมิตร') ||
    s.schoolName.startsWith('แก่งอาฮง') ||
    s.schoolName.startsWith('ประวิตร') ||
    s.schoolName.endsWith('วิทยา') ||
    s.schoolName.endsWith('สรรค์')
      ? s.schoolName
      : `โรงเรียน${s.schoolName}`;

  return {
    id: s.smis,
    name: fullSchoolName,
    clusterId: `network-${s.networkId}`,
    clusterName: clusterName,
    district: 'สพป.บึงกาฬ',
    defaultDocPrefix: `ศธ 04321.${s.smis.slice(-3)}/`,
  };
});

export function getSchoolsByCluster(clusterId: string): SchoolInfo[] {
  if (!clusterId) return [];
  return ALL_SCHOOLS.filter((s) => s.clusterId === clusterId);
}

export function getSchoolById(schoolId: string): SchoolInfo | undefined {
  return ALL_SCHOOLS.find((s) => s.id === schoolId);
}

/**
 * ค้นหาข้อมูลโรงเรียนทางการจาก ALL_SCHOOLS อย่างแม่นยำ
 * รองรับทั้งการค้นหาด้วย รหัส SMIS 8 หลัก, ชื่อเต็ม, ชื่อตัดคำนำหน้า 'โรงเรียน', และกลุ่มโรงเรียน
 */
export function findOfficialSchool(identifier: {
  schoolId?: string;
  schoolName?: string;
  clusterName?: string;
  clusterId?: string;
  documentPrefix?: string;
}): SchoolInfo | undefined {
  if (!identifier) return undefined;

  const rawSchoolId = String(identifier.schoolId || '').trim();
  const cleanId = rawSchoolId.replace(/^sch-/, '').trim();
  const rawName = String(identifier.schoolName || '').trim();
  const cleanName = rawName.replace(/^โรงเรียน/, '').trim();
  const rawCluster = String(identifier.clusterName || '').trim();
  const targetClusterId = String(identifier.clusterId || '').trim();

  // 1. Strict SMIS Code (8 digits) match - SMIS is 100% unique per school
  if (/^\d{8}$/.test(cleanId)) {
    const byId = ALL_SCHOOLS.find((s) => s.id === cleanId);
    if (byId) return byId;
  }

  // 2. Exact match by school name AND cluster (resolves duplicate school names like บ้านโคกสะอาด, บ้านหนองจิก)
  if (rawName && (rawCluster || targetClusterId)) {
    const byNameAndCluster = ALL_SCHOOLS.find((s) => {
      const nameMatch = s.name === rawName || s.name.replace(/^โรงเรียน/, '').trim() === cleanName;
      if (!nameMatch) return false;
      if (targetClusterId && s.clusterId === targetClusterId) return true;
      if (rawCluster && (s.clusterName === rawCluster || s.clusterName.includes(rawCluster) || rawCluster.includes(s.clusterName))) return true;
      return false;
    });
    if (byNameAndCluster) return byNameAndCluster;
  }

  // 3. Match by document prefix number e.g. 'ศธ 04321.052/' (matches last 3 digits of SMIS code)
  if (identifier.documentPrefix && rawName) {
    const match = identifier.documentPrefix.match(/\.(\d{3})\//);
    if (match) {
      const code3 = match[1];
      const byPrefixAndName = ALL_SCHOOLS.find(
        (s) =>
          s.id.endsWith(code3) &&
          (s.name === rawName || s.name.replace(/^โรงเรียน/, '').trim() === cleanName)
      );
      if (byPrefixAndName) return byPrefixAndName;
    }
  }

  // 4. Exact match by school name ONLY IF the name is unique in ALL_SCHOOLS
  // If multiple schools share the same name (e.g. บ้านโคกสะอาด, บ้านหนองจิก), never guess blindly!
  if (rawName) {
    const matchingSchools = ALL_SCHOOLS.filter(
      (s) => s.name === rawName || s.name.replace(/^โรงเรียน/, '').trim() === cleanName
    );
    if (matchingSchools.length === 1) {
      return matchingSchools[0];
    }
  }

  return undefined;
}
