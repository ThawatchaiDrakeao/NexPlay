# SPEC.md

# Functional Specification

## Product Summary
NexPlay เป็น SaaS football field booking platform ที่ให้ลูกค้าทำ booking journey ทั้งหมดผ่าน LINE Official Account และให้ staff, admin, owner จัดการ operation ผ่าน web dashboard

## Roles
- Customer: ผู้จองสนามผ่าน LINE
- Staff: พนักงานสาขาที่ดูแลหน้างานและ check-in
- Admin: ผู้ดูแล tenant ที่จัดการ booking, payment, branch, field และ user
- Owner: เจ้าของธุรกิจที่ดูรายงานและตั้งค่าระดับ tenant

## Booking Specification
### Requirement
ระบบต้องให้ลูกค้าเลือก branch, field, date และ available time slot ผ่าน LINE และสร้าง booking ได้โดยไม่ต้องคุยกับแอดมิน

### Acceptance Criteria
- Given ลูกค้าเลือก branch และ field แล้ว When เลือก date Then ระบบต้องแสดงเฉพาะ time slots ที่ว่าง
- Given time slot ถูกจองแล้ว When ลูกค้าคนอื่นเลือกวันเดียวกัน Then time slot นั้นต้องไม่แสดงเป็นว่าง
- Given ลูกค้ายืนยัน booking Then ระบบต้องสร้าง booking สถานะ pending_payment
- Given booking pending_payment เกินเวลาที่กำหนด Then ระบบต้องเปลี่ยนเป็น expired และปล่อย slot
- Given มี concurrent booking บน slot เดียวกัน Then ระบบต้องยอมรับได้เพียง booking เดียว

## Payment Specification
### Requirement
ระบบต้องสร้าง PromptPay QR สำหรับ booking และให้ลูกค้าอัปโหลด slip ผ่าน LINE

### Acceptance Criteria
- Given booking pending_payment Then ระบบต้องสร้าง payment record และ PromptPay QR ที่ยอดตรงกับ booking
- Given ลูกค้าอัปโหลด slip Then ระบบต้องเก็บไฟล์ใน Supabase Storage และเปลี่ยน payment เป็น submitted
- Given slip ถูกส่งแล้ว Then admin ต้องเห็นรายการใน Payment Approvals
- Given admin approve slip Then booking ต้องเป็น confirmed และลูกค้าต้องได้รับ QR check-in
- Given admin reject slip Then ลูกค้าต้องได้รับเหตุผลและสถานะ booking ต้องไม่เป็น confirmed

## LINE Messaging Specification
### Requirement
ระบบต้องสื่อสารกับลูกค้าผ่าน LINE Messaging API ด้วย Rich Menu, Flex Message, Reply Message และ Push Message

### Acceptance Criteria
- Given LINE webhook เข้ามา Then backend ต้อง validate signature ก่อนประมวลผล
- Given customer follow OA Then ระบบต้องสร้างหรือ update customer profile
- Given customer เลือกเมนู booking Then ระบบต้องส่ง Flex Message สำหรับ step ถัดไป
- Given booking confirmed Then ระบบต้องส่ง confirmation message พร้อม QR
- Given webhook event ถูกส่งซ้ำ Then ระบบต้องประมวลผลแบบ idempotent

## Dashboard Specification
### Requirement
ระบบต้องมี dashboard สำหรับ staff, admin และ owner ตามสิทธิ์

### Acceptance Criteria
- Given staff login Then ต้องเห็นเฉพาะ branch ที่ได้รับสิทธิ์
- Given admin login Then ต้องจัดการ branch, field, price, booking และ payment ภายใน tenant ได้
- Given owner login Then ต้องเห็นภาพรวม tenant และรายงานทุก branch
- Given booking หรือ payment เปลี่ยนสถานะ Then dashboard ต้อง update ผ่าน realtime หรือ refresh ได้อย่างถูกต้อง

## Multi-Tenant Specification
### Requirement
ระบบต้องแยกข้อมูลแต่ละธุรกิจอย่างชัดเจนและปลอดภัย

### Acceptance Criteria
- Given user อยู่ tenant A When เรียกดู booking Then ต้องไม่เห็นข้อมูล tenant B
- Given LINE webhook มาจาก channel ของ tenant A Then ระบบต้อง resolve เป็น tenant A
- Given admin tenant A พยายามแก้ resource tenant B Then ระบบต้องปฏิเสธ
- Given storage file ของ tenant A Then tenant B ต้องไม่สามารถเข้าถึงได้

## Check-In Specification
### Requirement
ระบบต้องสร้าง QR สำหรับ booking confirmed และให้ staff ใช้ check-in ลูกค้าที่สนาม

### Acceptance Criteria
- Given booking confirmed Then ระบบต้องสร้าง QR check-in
- Given staff scan QR ที่ถูกต้องใน branch ที่มีสิทธิ์ Then booking ต้องเปลี่ยนเป็น checked_in
- Given QR ของ booking cancelled, expired หรือผิด tenant Then ระบบต้องปฏิเสธ
- Given check-in สำเร็จ Then ระบบต้องบันทึกเวลาและ staff ผู้ทำรายการ

## Reporting Specification
### Requirement
Owner ต้องดูข้อมูลธุรกิจเพื่อการตัดสินใจได้

### Acceptance Criteria
- Given owner เปิด dashboard Then ต้องเห็น revenue, booking count, utilization และ pending payments
- Given owner filter ตาม branch/date Then รายงานต้องแสดงข้อมูลตาม filter
- Given owner export report Then ระบบต้องสร้างไฟล์ข้อมูลที่ตรงกับ filter
