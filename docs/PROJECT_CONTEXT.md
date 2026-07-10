# PROJECT_CONTEXT.md

# NexPlay

## Vision
NexPlay คือแพลตฟอร์ม SaaS สำหรับธุรกิจสนามฟุตบอลที่ทำให้ลูกค้าจองสนาม ตรวจสอบเวลาว่าง ชำระเงิน อัปโหลดสลิป รับการยืนยัน และเช็คอินได้ครบภายใน LINE Official Account โดยไม่ต้องโทรศัพท์หรือรอแอดมินตอบแชท

ระบบถูกออกแบบให้รองรับ Multi-Tenant ตั้งแต่ต้น เพื่อให้หลายธุรกิจสนามฟุตบอลสามารถใช้ระบบเดียวกันได้อย่างเป็นอิสระ ทั้งข้อมูลลูกค้า สนาม สาขา ราคา การจอง การชำระเงิน และรายงาน

## Mission
- ลดงาน manual ของแอดมินและพนักงานสนาม
- ลดความผิดพลาดจากการจองซ้ำหรือจองทับช่วงเวลา
- ทำให้ลูกค้าจองและชำระเงินได้รวดเร็วผ่าน LINE
- ให้เจ้าของธุรกิจเห็นข้อมูลรายได้ การใช้งานสนาม และสถานะการจองแบบ real-time
- สร้างสถาปัตยกรรมที่พร้อมต่อการขยายเป็น SaaS ระดับ production

## Problem Statement
ธุรกิจสนามฟุตบอลจำนวนมากยังรับจองผ่านโทรศัพท์ แชท หรือการจดบันทึก ทำให้เกิดปัญหาเวลาว่างไม่ตรงกัน จองซ้ำ ตรวจสอบสลิปช้า ลูกค้าต้องรอการตอบกลับ และเจ้าของธุรกิจไม่มีข้อมูล real-time สำหรับตัดสินใจ

## Solution
NexPlay รวม booking engine, payment workflow, slip approval, notification, check-in QR, dashboard และ reporting ไว้ในระบบเดียว โดย customer journey อยู่ใน LINE OA ส่วน staff, admin และ owner ใช้ web dashboard สำหรับจัดการงานหลังบ้าน

## Target Users
- Customer: ลูกค้าที่ต้องการจองสนามผ่าน LINE
- Staff: พนักงานสาขาที่ดูแลการเช็คอิน หน้างาน และสถานะการใช้สนาม
- Admin: ผู้ดูแลระบบของแต่ละ tenant ที่จัดการสนาม สาขา ราคา การจอง และการอนุมัติสลิป
- Owner: เจ้าของธุรกิจที่ต้องการดูรายงาน รายได้ performance และตั้งค่าระดับธุรกิจ

## Business Goals
- ให้ลูกค้าจองสนามผ่าน LINE ได้ครบ 100%
- ลดเวลาการตอบลูกค้าและลดภาระแอดมิน
- ป้องกัน double booking ด้วย booking lock และ transaction control
- รองรับหลาย tenant หลายสาขา และหลายสนาม
- มี dashboard real-time สำหรับ operation และ management
- พร้อม deployment บน Vercel, Render และ Supabase

## Core Modules
- Tenant Management
- Branch Management
- Field Management
- Availability and Pricing
- Booking Engine
- Payment and PromptPay QR
- Slip Upload and Approval
- LINE Integration
- Notification
- QR Check-in
- Dashboard
- Reports and Analytics
- User and Role Management
- Audit Log

## Architecture
- Frontend: React, Vite, Tailwind, Shadcn/ui
- Backend: Node.js, Express
- Database: Supabase PostgreSQL
- Storage: Supabase Storage
- Realtime: Supabase Realtime
- Authentication: JWT, LINE Login
- Messaging: LINE Messaging API
- Deployment: Vercel for frontend, Render for backend

## Coding Standards
- ใช้ Clean Architecture เป็นแนวคิดหลัก
- Controller รับ request, validate input และส่งต่อให้ service เท่านั้น
- Business logic อยู่ใน service layer
- Data access อยู่ใน repository layer
- ทุก query ต้องมี `tenant_id` เพื่อป้องกันข้อมูลข้าม tenant
- API response ต้องมีรูปแบบสม่ำเสมอ
- Error handling ต้องไม่เปิดเผยข้อมูลภายในระบบ
- ตั้งชื่อไฟล์ ตัวแปร และ endpoint ด้วยภาษาอังกฤษที่สื่อความหมาย
- ต้องมี test สำหรับ logic สำคัญ เช่น availability, booking conflict, payment approval และ permission

## Git Workflow
- `main`: production-ready branch
- `develop`: integration branch
- `feature/*`: งาน feature ราย sprint
- `hotfix/*`: งานแก้ production issue
- `release/*`: เตรียม release
- ทุก pull request ต้องผ่าน code review, test และ security check ก่อน merge

## Success Metrics
- Booking ผ่าน LINE สำเร็จไม่น้อยกว่า 95% ของ booking ทั้งหมด
- Double booking ต้องเป็น 0
- เวลาเฉลี่ยจากลูกค้าเลือกเวลาถึงสร้าง booking สำเร็จไม่เกิน 2 นาที
- เวลาแอดมินอนุมัติสลิปเฉลี่ยลดลงอย่างน้อย 50%
- Dashboard แสดงข้อมูล booking และ payment ภายใน 5 วินาทีหลังเกิด event
- ระบบรองรับ tenant ใหม่โดยไม่ต้อง deploy code ใหม่
