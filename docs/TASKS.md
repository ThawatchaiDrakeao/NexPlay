# TASKS.md

# Task Checklist

## Documentation
- [x] Create project context
- [x] Create business requirements
- [x] Create functional requirements
- [x] Create non-functional requirements
- [x] Create functional specification with acceptance criteria
- [x] Create architecture documentation
- [x] Create user flow documentation
- [x] Create system flow documentation
- [x] Create roadmap
- [x] Create task checklist
- [x] Update project work log

## Tenant Management
- [x] Design tenant data model
- [ ] Define tenant configuration
- [ ] Define tenant onboarding workflow
- [ ] Define tenant isolation tests

## Branch and Field Management
- [x] Design branch schema
- [x] Design field schema
- [x] Define opening hours model
- [x] Define blocked time model
- [ ] Define field active/inactive workflow

## Pricing and Availability
- [ ] Design pricing rules
- [ ] Define day type and time range pricing
- [x] Define availability calculation
- [x] Define booking conflict prevention
- [ ] Define booking expiration policy

## Booking Engine
- [x] Design booking status lifecycle
- [x] Design booking slot records
- [x] Define booking creation transaction
- [ ] Define cancellation policy
- [ ] Define admin manual booking flow

## Payment
- [ ] Define PromptPay QR generation
- [x] Define payment record schema
- [ ] Define slip upload flow
- [ ] Define approval and rejection workflow
- [ ] Define payment audit requirements

## Database Foundation
- [x] Validate tenant, booking and payment foreign key hierarchy
- [x] Add booking availability indexes
- [x] Add blocked-time lookup index
- [x] Add payment lookup index
- [x] Confirm database foundation is ready for Booking Module

## LINE Integration
- [ ] Define LINE channel to tenant mapping
- [ ] Define webhook validation
- [ ] Define Rich Menu structure
- [ ] Define Flex Message templates
- [ ] Define customer session state
- [ ] Define notification retry policy

## Dashboard
- [ ] Define staff dashboard requirements
- [ ] Define admin dashboard requirements
- [ ] Define owner dashboard requirements
- [ ] Define booking calendar behavior
- [ ] Define payment approval screen
- [ ] Define report filters and export

## Authentication and Authorization
- [ ] Define JWT claims
- [ ] Define LINE Login flow
- [ ] Define RBAC matrix
- [ ] Define branch-level staff permission
- [ ] Define audit log events

## Testing
- [ ] Define unit test scope
- [ ] Define integration test scope
- [ ] Define E2E booking journey test
- [ ] Define tenant isolation test
- [ ] Define security test checklist
- [ ] Define performance test checklist

## Deployment
- [ ] Define environment variables
- [ ] Define Vercel deployment
- [ ] Define Render deployment
- [ ] Define Supabase production setup
- [ ] Define LINE OA production setup
- [ ] Define monitoring and alerting
