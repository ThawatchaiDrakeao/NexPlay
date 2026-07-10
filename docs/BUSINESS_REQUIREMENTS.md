# BUSINESS_REQUIREMENTS.md

# Business Requirements

## Business Objectives
NexPlay ต้องช่วยให้ธุรกิจสนามฟุตบอลบริหารการจองได้แม่นยำ รวดเร็ว และขยายได้ โดยเปลี่ยนกระบวนการจองจาก manual chat หรือโทรศัพท์ให้เป็น workflow อัตโนมัติผ่าน LINE Official Account

## Stakeholders
- Customer: ต้องการจองสนามง่าย เห็นเวลาว่างจริง ชำระเงินสะดวก และได้รับการยืนยันทันที
- Staff: ต้องการดู booking หน้างาน เช็คอินลูกค้า และจัดการสถานะสนามได้รวดเร็ว
- Admin: ต้องการจัดการสาขา สนาม ราคา booking payment และ notification ได้จาก dashboard
- Owner: ต้องการดูยอดขาย อัตราการใช้งานสนาม peak hour และผลประกอบการหลายสาขา
- Platform Operator: ต้องการดูแลระบบ SaaS ให้รองรับหลาย tenant อย่างปลอดภัยและเสถียร

## Business Scope
ระบบต้องครอบคลุมตั้งแต่ลูกค้าเพิ่ม LINE OA จนถึงการเช็คอินสำเร็จที่สนาม รวมถึงงานหลังบ้านสำหรับจัดการธุรกิจสนามฟุตบอลหลายสาขา

## In Scope
- LINE OA customer journey
- Rich Menu navigation
- Branch, field, date และ time slot selection
- Booking creation and booking status tracking
- PromptPay QR payment
- Slip upload and admin approval
- QR confirmation and check-in
- Staff/admin/owner dashboard
- Multi-tenant data isolation
- Notification through LINE Messaging API
- Reporting and analytics

## Out of Scope for Initial Production
- Marketplace รวมหลายธุรกิจให้ลูกค้าค้นหาข้าม tenant
- ระบบชำระเงินผ่าน payment gateway แบบ auto settlement
- Dynamic pricing จาก AI
- Mobile application แยกจาก LINE
- Accounting integration ภายนอก

## Business Rules
- ลูกค้าต้องเลือก tenant, branch, field, date และ time slot ก่อนยืนยัน booking
- Time slot ที่ถูกจองหรือถูก lock ต้องไม่สามารถถูกจองซ้ำได้
- Booking ที่ยังไม่ชำระเงินต้องมีเวลาหมดอายุ
- การยืนยัน booking สมบูรณ์หลัง admin อนุมัติสลิปหรือระบบชำระเงินยืนยันสำเร็จ
- QR check-in ต้องผูกกับ booking ที่ได้รับการยืนยันแล้วเท่านั้น
- Staff เห็นเฉพาะข้อมูล branch ที่ได้รับสิทธิ์
- Admin เห็นข้อมูลภายใน tenant ของตนเท่านั้น
- Owner เห็นข้อมูลทั้ง tenant และสามารถดูรายงานรวมทุก branch

## Revenue and Value Drivers
- ลดต้นทุนแรงงานแอดมิน
- เพิ่ม conversion จากลูกค้าที่จองได้ทันที
- ลดรายได้สูญเสียจาก double booking และ missed booking
- เพิ่ม visibility ของการใช้สนามในแต่ละช่วงเวลา
- รองรับรูปแบบ subscription SaaS สำหรับธุรกิจสนามฟุตบอล

## Success Criteria
- เปิดใช้งาน tenant ใหม่ได้ภายใน 1 วันทำการ
- ลูกค้าจองสนามผ่าน LINE ได้โดยไม่ต้องคุยกับแอดมิน
- Admin สามารถดูและอนุมัติ payment ได้จาก dashboard เดียว
- Owner สามารถดูรายได้และ booking แยกตาม branch และ field ได้
- ระบบสามารถ audit เหตุการณ์สำคัญ เช่น booking created, payment approved, booking cancelled และ check-in completed
