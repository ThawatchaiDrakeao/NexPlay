# USER_FLOW.md

# User Flow

## Customer Flow: Booking Through LINE
1. Customer เพิ่ม LINE Official Account
2. Customer เปิด Rich Menu
3. Customer เลือกเมนู Book Field
4. ระบบแสดงรายการ branch ของ tenant
5. Customer เลือก branch
6. ระบบแสดง field ที่เปิดให้จอง
7. Customer เลือก field
8. Customer เลือก date
9. ระบบแสดง available time slots
10. Customer เลือก time slot
11. ระบบสรุปรายละเอียด booking และราคา
12. Customer กดยืนยัน booking
13. ระบบสร้าง booking สถานะ pending_payment และสร้าง PromptPay QR
14. Customer ชำระเงินและอัปโหลด slip
15. ระบบเปลี่ยนสถานะเป็น awaiting_approval
16. Admin อนุมัติ slip
17. Customer ได้รับ booking confirmation และ QR check-in
18. Customer มาถึงสนามและแสดง QR
19. Staff check-in
20. Customer เล่นฟุตบอลตามเวลาที่จอง

## Customer Flow: View Booking Status
1. Customer เปิด Rich Menu
2. Customer เลือก My Bookings
3. ระบบดึง booking ของ LINE user ภายใน tenant
4. ระบบแสดง booking ที่กำลังจะมาถึงและประวัติ
5. Customer เลือก booking เพื่อดูรายละเอียด สถานะ payment และ QR

## Customer Flow: Cancel Booking
1. Customer เปิดรายละเอียด booking
2. Customer เลือก Cancel Booking
3. ระบบตรวจสอบ cancellation policy
4. หากยกเลิกได้ ระบบขอ confirmation
5. Customer ยืนยัน
6. ระบบเปลี่ยนสถานะเป็น cancelled
7. ระบบปล่อย time slot กลับสู่ availability
8. ระบบแจ้งเตือน customer และ dashboard

## Staff Flow: Check-In
1. Staff เข้าสู่ dashboard
2. Staff เลือก branch ที่ได้รับสิทธิ์
3. Staff เปิดหน้า Today Bookings
4. Customer แสดง QR confirmation
5. Staff สแกน QR หรือกรอก booking code
6. ระบบตรวจสอบ tenant, branch, booking status และวันเวลา
7. ระบบเปลี่ยนสถานะเป็น checked_in
8. Dashboard แสดงสถานะล่าสุดแบบ real-time

## Staff Flow: Daily Operation
1. Staff เปิด schedule รายวัน
2. Staff ดู booking แยกตาม field และ time slot
3. Staff ตรวจสอบ booking ที่รอ check-in
4. Staff update สถานะเป็น playing หรือ completed ตาม operation
5. ระบบบันทึก audit log ทุก action

## Admin Flow: Manage Availability
1. Admin เข้าสู่ dashboard
2. Admin เลือก branch
3. Admin จัดการ field และ active status
4. Admin ตั้ง opening hours
5. Admin ตั้งราคาแยกตามช่วงเวลา
6. Admin เพิ่ม blocked time สำหรับปิดปรับปรุงหรือ event พิเศษ
7. ระบบใช้ข้อมูลนี้ในการคำนวณ available slots

## Admin Flow: Approve Slip
1. Admin เปิดหน้า Payment Approvals
2. ระบบแสดง booking ที่มีสถานะ awaiting_approval
3. Admin เปิดดู slip และ booking detail
4. Admin ตรวจสอบยอดเงิน เวลาโอน และข้อมูลบัญชี
5. Admin เลือก approve หรือ reject
6. หาก approve ระบบเปลี่ยน booking เป็น confirmed และส่ง QR ให้ customer
7. หาก reject ระบบส่งเหตุผลให้ customer และเปิดให้ส่ง slip ใหม่ตาม policy

## Owner Flow: Business Monitoring
1. Owner เข้าสู่ dashboard
2. Owner ดูภาพรวม tenant เช่น revenue, booking count, utilization และ pending payments
3. Owner drill down ตาม branch, field และช่วงเวลา
4. Owner ดู peak hour และ customer analytics
5. Owner export report เพื่อวิเคราะห์หรือส่งต่อฝ่ายบัญชี

## Owner Flow: Tenant Settings
1. Owner เปิด tenant settings
2. Owner ตั้งค่าข้อมูลธุรกิจ สาขาหลัก และช่องทางติดต่อ
3. Owner ตั้งค่า PromptPay account
4. Owner ตั้งค่า LINE channel
5. Owner ตั้งค่า cancellation policy และ payment timeout
6. ระบบบันทึก audit log และใช้ configuration กับ workflow ทั้ง tenant
