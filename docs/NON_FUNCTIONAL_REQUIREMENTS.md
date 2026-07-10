# NON_FUNCTIONAL_REQUIREMENTS.md

# Non-Functional Requirements

## Performance
- API สำหรับดู available slots ต้องตอบกลับภายใน 1 วินาทีในสภาวะปกติ
- Booking creation ต้องใช้ transaction หรือ locking เพื่อป้องกัน double booking
- Dashboard หลักต้องโหลดข้อมูลแรกภายใน 3 วินาทีสำหรับข้อมูล tenant ปกติ
- LINE webhook ต้องตอบกลับภายในเวลาที่ LINE กำหนด และงานที่ใช้เวลานานควรถูกส่งไป background process

## Security
- ทุก request ที่เข้าถึงข้อมูล tenant ต้องตรวจสอบ authentication และ authorization
- ทุก query ต้อง enforce `tenant_id`
- LINE webhook ต้องตรวจสอบ signature ก่อนประมวลผล
- JWT ต้องมีอายุจำกัดและเก็บ claim ที่จำเป็นเท่านั้น
- Password หรือ secret ต้องไม่ถูกเก็บใน repository
- Payment slip และ QR ต้องเก็บใน Supabase Storage พร้อม access policy ที่เหมาะสม
- Admin action สำคัญต้องบันทึก audit log
- Error response ต้องไม่เปิดเผย stack trace หรือ secret

## Scalability
- Backend ต้องเป็น stateless เพื่อ scale horizontal บน Render หรือ platform อื่นได้
- Database schema ต้องรองรับ tenant, branch และ field เพิ่มขึ้นโดยไม่เปลี่ยน code หลัก
- Realtime event ควรถูกออกแบบเป็น event-based เพื่อเพิ่ม worker หรือ queue ในอนาคต
- Storage path ต้องแยกตาม tenant เพื่อบริหาร quota และ security ได้ง่าย

## Availability
- ระบบ production ควรมี uptime target อย่างน้อย 99.5% ในระยะแรก
- Frontend และ backend ต้อง deploy แยกกันเพื่อลด blast radius
- Database และ storage ใช้ managed service ของ Supabase เพื่อลดภาระ operation

## Reliability
- Booking workflow ต้อง idempotent สำหรับ webhook event ที่ถูกส่งซ้ำ
- Payment approval ต้องป้องกันการ approve ซ้ำ
- Check-in QR ต้องใช้ได้ครั้งเดียวหรือมี policy ชัดเจนตาม tenant
- ต้องมี status transition ที่ชัดเจน เช่น pending_payment, awaiting_approval, confirmed, checked_in, completed, cancelled, expired

## Logging
- ต้อง log request id, tenant id, user id, booking id และ event type ใน action สำคัญ
- ห้าม log token, secret, payment data ที่ละเอียดอ่อน หรือข้อมูลส่วนบุคคลเกินจำเป็น
- Error log ต้องแยกระดับ info, warn และ error

## Monitoring
- ต้อง monitor API latency, error rate, webhook failure, booking conflict และ payment approval delay
- ต้องมี alert เมื่อ webhook failure สูงผิดปกติ
- ต้อง monitor database connection และ storage usage
- Dashboard operation ควรมี realtime status สำหรับ booking และ payment

## Maintainability
- โครงสร้าง code ต้องแยก controller, service, repository, middleware, validator และ integration
- Business logic สำคัญต้องมี unit test
- API contract ต้องมี documentation
- Naming convention ต้องสม่ำเสมอ
- Feature ใหม่ต้องไม่ทำลาย tenant isolation

## Compliance and Privacy
- เก็บข้อมูลส่วนบุคคลเท่าที่จำเป็นต่อการจองและติดต่อ
- ต้องมีแนวทางลบหรือ anonymize customer data เมื่อ tenant ร้องขอ
- สิทธิ์การเข้าถึงข้อมูลต้องเป็น least privilege
