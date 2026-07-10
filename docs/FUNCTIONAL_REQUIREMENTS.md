# FUNCTIONAL_REQUIREMENTS.md

# Functional Requirements

## Customer Functions
1. ลูกค้าสามารถเพิ่ม LINE Official Account ของ tenant ได้
2. ลูกค้าสามารถเปิด Rich Menu เพื่อเริ่มการจองได้
3. ลูกค้าสามารถเลือก branch ที่ต้องการใช้บริการได้
4. ลูกค้าสามารถเลือก field ภายใน branch ได้
5. ลูกค้าสามารถเลือก date และดู available time slots ได้
6. ลูกค้าสามารถเลือก time slot หนึ่งรายการหรือหลายรายการตามกฎของ tenant ได้
7. ลูกค้าสามารถตรวจสอบรายละเอียด booking ก่อนยืนยันได้
8. ลูกค้าสามารถสร้าง booking pending payment ได้
9. ลูกค้าสามารถรับ PromptPay QR สำหรับชำระเงินได้
10. ลูกค้าสามารถอัปโหลด payment slip ผ่าน LINE ได้
11. ลูกค้าสามารถรับ notification เมื่อสลิปอยู่ระหว่างตรวจสอบ อนุมัติ หรือถูกปฏิเสธได้
12. ลูกค้าสามารถรับ QR confirmation หลัง booking confirmed ได้
13. ลูกค้าสามารถดูสถานะ booking ปัจจุบันได้
14. ลูกค้าสามารถดูประวัติ booking ได้
15. ลูกค้าสามารถยกเลิก booking ได้ตาม cancellation policy ของ tenant

## Staff Functions
1. Staff สามารถเข้าสู่ dashboard ด้วยบัญชีที่ได้รับสิทธิ์ได้
2. Staff สามารถดู booking ของ branch ที่ได้รับมอบหมายได้
3. Staff สามารถค้นหา booking ด้วย booking code, customer name หรือ QR ได้
4. Staff สามารถสแกนหรือกรอก QR check-in เพื่อยืนยันการมาถึงของลูกค้าได้
5. Staff สามารถเปลี่ยนสถานะการใช้สนาม เช่น checked-in, playing, completed ได้
6. Staff สามารถเห็น schedule รายวันของ field ใน branch ได้

## Admin Functions
1. Admin สามารถจัดการ branch ภายใน tenant ได้
2. Admin สามารถจัดการ field, field type, capacity และ active status ได้
3. Admin สามารถตั้งค่าราคาแยกตาม field, day type และ time range ได้
4. Admin สามารถตั้งค่า opening hours และ blocked time ได้
5. Admin สามารถดู booking calendar แบบรายวัน รายสัปดาห์ และรายสนามได้
6. Admin สามารถสร้าง แก้ไข หรือยกเลิก booking ในนามลูกค้าได้
7. Admin สามารถตรวจสอบ payment slip ได้
8. Admin สามารถอนุมัติหรือปฏิเสธ payment slip พร้อมเหตุผลได้
9. Admin สามารถส่ง LINE notification ให้ลูกค้าได้
10. Admin สามารถจัดการ staff account และ permission ภายใน tenant ได้

## Owner Functions
1. Owner สามารถดู dashboard ภาพรวมของ tenant ได้
2. Owner สามารถดูรายได้รวม รายได้แยก branch และรายได้แยก field ได้
3. Owner สามารถดู booking volume, utilization rate และ peak hour ได้
4. Owner สามารถดู customer analytics เช่น ลูกค้าใหม่ ลูกค้าซ้ำ และ booking frequency ได้
5. Owner สามารถ export report เป็น CSV หรือ Excel ได้
6. Owner สามารถตั้งค่าระดับ tenant เช่น business profile, PromptPay account, LINE channel และ policy ได้

## Platform and Tenant Functions
1. ระบบต้องรองรับ tenant หลายรายในฐานข้อมูลเดียวโดยแยกข้อมูลด้วย `tenant_id`
2. ระบบต้องรองรับ branch หลายแห่งต่อ tenant
3. ระบบต้องรองรับ field หลายสนามต่อ branch
4. ระบบต้องกำหนด role และ permission ได้ตาม tenant
5. ระบบต้องเก็บ audit log ของ action สำคัญ
6. ระบบต้องรองรับ tenant configuration ที่แตกต่างกัน เช่น payment timeout, cancellation policy และ opening hours

## LINE Integration Functions
1. ระบบต้องรับ webhook event จาก LINE Messaging API ได้
2. ระบบต้อง map LINE user id กับ customer profile ได้
3. ระบบต้องส่ง Flex Message สำหรับเลือก branch, field, date, slot, payment และ booking status ได้
4. ระบบต้องส่ง Push Message หรือ Reply Message ตาม context ได้
5. ระบบต้องรองรับ LINE Login สำหรับ dashboard หรือ customer identity linking เมื่อจำเป็น
6. ระบบต้อง validate LINE signature ทุก webhook request
