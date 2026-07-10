# SYSTEM_FLOW.md

# System Flow

## LINE Webhook to Booking Flow
1. LINE ส่ง webhook event ไปยัง backend endpoint
2. Backend ตรวจสอบ LINE signature
3. Backend resolve tenant จาก LINE channel configuration
4. Backend ตรวจสอบ event type เช่น message, postback หรือ follow
5. LineWebhookService map LINE user id กับ customer profile
6. Service อ่าน session state ของ customer หากมี workflow ที่ค้างอยู่
7. ระบบประมวลผล step ปัจจุบัน เช่น select branch, select field, select date หรือ select slot
8. Service เรียก repository เพื่ออ่านข้อมูล tenant-scoped
9. Backend ส่ง Flex Message หรือ Reply Message กลับ LINE
10. ระบบบันทึก audit log และ event log

## Availability Flow
1. Customer เลือก branch, field และ date
2. AvailabilityService โหลด opening hours ของ branch
3. Service โหลด field configuration
4. Service โหลด pricing rule ที่เกี่ยวข้อง
5. Service โหลด blocked time
6. Service โหลด bookings ที่ยังมีผล เช่น pending_payment, awaiting_approval, confirmed, checked_in
7. Service คำนวณ available time slots
8. Service ส่งผลลัพธ์เป็น Flex Message ให้ customer

## Booking Creation Flow
1. Customer ยืนยัน booking detail
2. BookingService ตรวจสอบ tenant, customer, branch, field และ selected slots
3. Service เปิด database transaction
4. Service ตรวจสอบ availability ซ้ำภายใน transaction
5. Service สร้าง booking สถานะ pending_payment
6. Service สร้าง booking slot records
7. Service สร้าง payment record สถานะ pending
8. Service สร้าง PromptPay QR ตามยอดเงิน
9. Service commit transaction
10. NotificationService ส่ง payment instruction ให้ customer ผ่าน LINE
11. ระบบตั้ง payment expiration ตาม tenant configuration

## Slip Upload Flow
1. Customer ส่งรูปสลิปใน LINE
2. Backend รับ webhook event ประเภท image message
3. Backend ตรวจสอบ session หรือ booking ที่รอ slip
4. Backend ดาวน์โหลด image content จาก LINE ด้วย access token
5. Backend อัปโหลดไฟล์ไป Supabase Storage path ของ tenant
6. PaymentService อัปเดต payment เป็น submitted
7. BookingService อัปเดต booking เป็น awaiting_approval
8. NotificationService แจ้ง admin dashboard ผ่าน realtime event
9. ระบบตอบกลับ customer ว่าสลิปกำลังรอตรวจสอบ

## Admin Approval Flow
1. Admin เปิดรายการ payment ที่ awaiting_approval
2. Backend ตรวจสอบ JWT และ role permission
3. Admin เลือก approve หรือ reject
4. PaymentService ตรวจสอบสถานะล่าสุดเพื่อป้องกันการ approve ซ้ำ
5. ระบบบันทึกผลการตรวจสอบ payment
6. หาก approve ระบบเปลี่ยน booking เป็น confirmed
7. ระบบสร้าง QR check-in token
8. NotificationService ส่ง confirmation และ QR ให้ customer ผ่าน LINE
9. Supabase Realtime แจ้ง dashboard ให้ update
10. AuditLogService บันทึก admin action

## Check-In Flow
1. Staff สแกน QR หรือกรอก booking code
2. Backend ตรวจสอบ JWT, role และ branch permission
3. CheckInService ตรวจสอบ QR token, tenant, booking status และวันเวลา
4. หากถูกต้อง ระบบเปลี่ยน booking เป็น checked_in
5. ระบบบันทึก check-in time และ staff user id
6. ระบบส่ง realtime update ไป dashboard
7. ระบบบันทึก audit log

## Booking Expiration Flow
1. Background job ตรวจหา booking pending_payment ที่เกิน payment timeout
2. BookingService ตรวจสอบสถานะปัจจุบัน
3. ระบบเปลี่ยน booking เป็น expired
4. ระบบปล่อย time slot ให้กลับมาว่าง
5. NotificationService แจ้ง customer ว่า booking หมดอายุ
6. Dashboard ได้รับ realtime update

## Notification Flow
1. Service สร้าง notification event จาก business action
2. NotificationService เลือก template ตาม event type และ tenant language
3. Integration layer สร้าง LINE Flex Message หรือ text message
4. ระบบส่งผ่าน LINE Messaging API
5. ระบบบันทึก delivery status
6. หากส่งไม่สำเร็จ ระบบ log error และ retry ตาม policy

## Data Isolation Flow
1. ทุก request ถูกแปลงเป็น request context ที่มี `tenant_id`
2. Middleware ตรวจสอบ authentication และ permission
3. Service ส่ง context เข้า repository ทุกครั้ง
4. Repository เพิ่ม tenant filter ในทุก query
5. Audit log บันทึก tenant, actor, action และ resource
6. Test ต้องครอบคลุมกรณี user พยายามเข้าถึงข้อมูลข้าม tenant
