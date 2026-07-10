# ARCHITECTURE.md

# Architecture

## Overall Architecture
NexPlay ใช้สถาปัตยกรรมแบบ web application + LINE integration โดยแบ่งหน้าที่ชัดเจนระหว่าง customer journey ใน LINE OA และ operation dashboard บน web application

ส่วนประกอบหลัก:
- LINE Official Account: ช่องทางหลักของลูกค้า
- Frontend Dashboard: React, Vite, Tailwind, Shadcn/ui
- Backend API: Node.js, Express
- Database: Supabase PostgreSQL
- Storage: Supabase Storage สำหรับ payment slip และ asset ที่เกี่ยวข้อง
- Realtime: Supabase Realtime สำหรับ dashboard update
- Messaging: LINE Messaging API
- Deployment: Vercel สำหรับ frontend และ Render สำหรับ backend

## Multi-Tenant Architecture
ทุกข้อมูลธุรกิจต้องผูกกับ `tenant_id` เช่น branch, field, booking, payment, user, role, pricing และ audit log

หลักการสำคัญ:
- API ต้อง resolve tenant จาก LINE channel, subdomain, request header หรือ authenticated user context
- Repository ทุกตัวต้อง filter ด้วย `tenant_id`
- Role และ permission ต้อง scoped ภายใน tenant
- Storage path ควรใช้รูปแบบ `tenants/{tenant_id}/...`
- Audit log ต้องบันทึก `tenant_id` ทุกครั้ง

## Layered Architecture
ระบบ backend ควรแบ่งเป็น 5 ชั้นหลัก:

1. Route Layer
รับ HTTP route และ mapping endpoint ไปยัง controller

2. Controller Layer
ตรวจสอบ request, เรียก service และแปลงผลลัพธ์เป็น response โดยไม่มี business logic

3. Service Layer
เก็บ business logic เช่น availability calculation, booking state transition, payment approval และ notification orchestration

4. Repository Layer
จัดการ database access และ enforce tenant scope

5. Integration Layer
เชื่อมต่อบริการภายนอก เช่น LINE Messaging API, Supabase Storage, PromptPay QR generator และ notification provider

## Repository Pattern
Repository ต้องรับ `tenant_id` ผ่าน context เสมอ และไม่อนุญาตให้ query ข้าม tenant ยกเว้น platform-level operation ที่มีสิทธิ์เฉพาะ

ตัวอย่าง repository ที่ควรมี:
- TenantRepository
- BranchRepository
- FieldRepository
- PricingRepository
- AvailabilityRepository
- BookingRepository
- PaymentRepository
- CustomerRepository
- UserRepository
- AuditLogRepository

## Service Layer
Service ต้องเป็นจุดรวม business rule และ transaction orchestration

Service ที่ควรมี:
- TenantService
- AvailabilityService
- BookingService
- PaymentService
- SlipApprovalService
- CheckInService
- NotificationService
- LineWebhookService
- ReportService
- AuthService

## Booking Consistency
การสร้าง booking ต้องป้องกัน double booking ด้วยกลไกต่อไปนี้:
- ตรวจสอบ availability จาก field, opening hours, blocked time และ existing bookings
- ใช้ database transaction ระหว่างสร้าง booking และ booking slots
- ใช้ unique constraint หรือ exclusion logic สำหรับ field/date/time range
- สร้าง booking lock ชั่วคราวเมื่อรอ payment
- expire booking อัตโนมัติเมื่อไม่ชำระเงินภายในเวลาที่กำหนด

## Folder Structure
โครงสร้างที่แนะนำ:

```text
src/
  config/
  routes/
  controllers/
  services/
  repositories/
  middlewares/
  validators/
  integrations/
    line/
    supabase/
    promptpay/
  models/
  utils/
  jobs/
  tests/
```

Frontend dashboard:

```text
src/
  app/
  components/
  features/
    bookings/
    branches/
    fields/
    payments/
    reports/
    users/
  hooks/
  lib/
  services/
  styles/
```

## Deployment Architecture
- Vercel host frontend dashboard
- Render host backend API
- Supabase host PostgreSQL, Storage และ Realtime
- LINE Messaging API ส่ง webhook มาที่ backend public endpoint
- Backend ส่ง notification กลับ LINE และอ่าน/เขียนข้อมูลผ่าน Supabase

## Security Architecture
- JWT สำหรับ dashboard authentication
- LINE signature validation สำหรับ webhook
- Role-based access control สำหรับ staff, admin และ owner
- Tenant isolation ในทุก layer
- Storage policy แยกตาม tenant
- Audit log สำหรับ action สำคัญ
- Environment variables สำหรับ secret ทั้งหมด

## Future Scaling
- เพิ่ม background worker สำหรับ payment verification, notification retry และ booking expiration
- เพิ่ม queue เมื่อ LINE event volume สูงขึ้น
- เพิ่ม cache สำหรับ availability ที่อ่านบ่อย แต่ต้อง invalidate เมื่อ booking เปลี่ยน
- แยก read model สำหรับ reporting หากข้อมูลใหญ่ขึ้น
- รองรับ payment gateway ที่ verify อัตโนมัติในอนาคต
