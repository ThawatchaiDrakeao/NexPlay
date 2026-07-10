# PLAN.md

# Project Roadmap

## Sprint 0: Discovery and Product Direction
- กำหนด project name, vision และ tagline
- ระบุ target users และ customer journey
- สรุป core business goals
- สร้าง feature list ระดับสูง
- ผลลัพธ์: แนวคิดผลิตภัณฑ์ชัดเจนและพร้อมเข้าสู่ documentation sprint

## Sprint 1: Complete Project Documentation
- สร้าง project context
- สร้าง business, functional และ non-functional requirements
- สร้าง functional specification พร้อม acceptance criteria
- สร้าง architecture, user flow และ system flow
- สร้าง plan และ task checklist
- ผลลัพธ์: ทีมสามารถเริ่ม design และ implementation โดยมีเอกสารอ้างอิงร่วมกัน

## Sprint 2: Database and Domain Design
- ออกแบบ ERD
- ออกแบบ tables สำหรับ tenant, branch, field, pricing, booking, payment, user, role และ audit log
- ออกแบบ constraints เพื่อป้องกัน double booking
- ออกแบบ Supabase Storage policy
- ผลลัพธ์: database design พร้อม migration

## Sprint 3: API and Integration Design
- ออกแบบ REST API contract
- ออกแบบ authentication และ authorization
- ออกแบบ LINE webhook contract
- ออกแบบ error response และ validation rules
- สร้าง OpenAPI/Swagger documentation
- ผลลัพธ์: API contract พร้อม implementation

## Sprint 4: UX/UI Design
- ออกแบบ dashboard information architecture
- ออกแบบ booking calendar, payment approval และ report screens
- ออกแบบ LINE Flex Message templates
- ออกแบบ Rich Menu structure
- ผลลัพธ์: UI/UX spec พร้อมสำหรับ frontend implementation

## Sprint 5: Backend Foundation
- Setup Node.js และ Express
- Setup project structure ตาม architecture
- Implement auth, tenant context, RBAC และ error handling
- เชื่อมต่อ Supabase PostgreSQL และ Storage
- ผลลัพธ์: backend foundation พร้อมต่อยอด feature

## Sprint 6: Core Booking and Payment
- Implement branch, field, pricing และ availability
- Implement booking engine และ conflict prevention
- Implement PromptPay QR generation
- Implement slip upload และ payment status
- ผลลัพธ์: booking workflow หลักทำงานได้

## Sprint 7: Dashboard Frontend
- Setup React, Vite, Tailwind, Shadcn/ui
- Implement staff/admin/owner dashboard
- Implement booking calendar
- Implement payment approval
- Implement reports overview
- ผลลัพธ์: operation dashboard ใช้งานได้

## Sprint 8: LINE Integration
- Implement webhook handler
- Implement Rich Menu และ Flex Message workflow
- Implement customer session state
- Implement notification messages
- ผลลัพธ์: customer journey ผ่าน LINE ใช้งานได้ครบ

## Sprint 9: Testing and Hardening
- Unit test service logic
- Integration test API และ database
- E2E test booking journey
- Security review tenant isolation
- Performance test availability และ booking creation
- ผลลัพธ์: ระบบพร้อม release candidate

## Sprint 10: Deployment and Production Readiness
- Deploy frontend บน Vercel
- Deploy backend บน Render
- Configure Supabase production
- Configure LINE OA production channel
- Setup monitoring, logging และ alert
- Run production readiness checklist
- ผลลัพธ์: NexPlay พร้อมใช้งาน production
