# User Stories - Apartment Rental Management System

**Project:** Nền tảng Quản lý Phòng thuê Chung cư/Trọ  
**Version:** 1.0  
**Date:** October 21, 2025

---

## 📖 User Story Format

```
Title: [Chức năng ngắn gọn]
User Role: [Admin/Staff/Tenant]
Description: As a [role], I want to [action] so that [benefit]

Acceptance Criteria:
□ Criterion 1
□ Criterion 2
□ Criterion 3

Priority: [High/Medium/Low]
Story Points: [1-13]
Sprint: [Sprint 1 / Sprint 2]
```

---

## 👥 TENANT User Stories (Khách thuê)

### US-T1: Submit Monthly Utility Readings
**Title:** Khách thuê gửi chỉ số điện nước cuối tháng  
**Role:** Tenant  
**Description:** As a tenant, I want to submit my monthly electricity and water meter readings so that the landlord can calculate my utility bills accurately.

**Acceptance Criteria:**
- ✅ Tenant can access utility reading submission form
- ✅ Form requires: month, year, electricity reading, water reading, optional notes
- ✅ System calculates usage based on previous month's reading
- ✅ Submission creates notification for landlord
- ✅ Tenant receives confirmation of successful submission
- ✅ Cannot submit readings for future months
- ✅ Previous readings are visible for reference

**Priority:** High  
**Story Points:** 5  
**Sprint:** Sprint 1  
**Dependencies:** Contract must be active

---

### US-T2: View Current Rental Contract
**Title:** Khách thuê xem hợp đồng hiện tại  
**Role:** Tenant  
**Description:** As a tenant, I want to view my current rental contract so that I can review all terms and conditions.

**Acceptance Criteria:**
- ✅ Tenant can view their active contract details
- ✅ Contract shows: start date, end date, rent amount, deposit, utility inclusions
- ✅ Contract shows landlord contact information
- ✅ Can download contract as PDF
- ✅ All contract terms are clearly visible
- ✅ Expiry date is highlighted if contract is expiring soon

**Priority:** High  
**Story Points:** 3  
**Sprint:** Sprint 1  
**Dependencies:** None

---

### US-T3: View Invoice History & Details
**Title:** Khách thuê xem lịch sử hóa đơn 3-4 tháng  
**Role:** Tenant  
**Description:** As a tenant, I want to view my recent invoices so that I can track what I owe and when payments are due.

**Acceptance Criteria:**
- ✅ Tenant can see invoices for last 3-4 months
- ✅ Each invoice shows: invoice number, month/year, amount, due date, status
- ✅ Can view detailed breakdown: rent + electricity + water + internet costs
- ✅ Can see payment history (paid date, amount, method)
- ✅ Invoices are sortable by date (newest/oldest)
- ✅ Can download invoice as PDF

**Priority:** High  
**Story Points:** 5  
**Sprint:** Sprint 1  
**Dependencies:** Invoice model, contract relationship

---

### US-T4: Submit Payment & Track Status
**Title:** Khách thuê thanh toán và theo dõi trạng thái  
**Role:** Tenant  
**Description:** As a tenant, I want to know the payment details and confirm my payment so that the landlord acknowledges receipt.

**Acceptance Criteria:**
- ✅ Can view payment methods: bank account, MoMo number, other
- ✅ Can see payment due dates clearly highlighted
- ✅ Can mark payment as submitted (with proof/reference number)
- ✅ System shows payment status: pending/confirmed/overdue
- ✅ Receives notification when payment is confirmed
- ✅ Payment history shows all previous payments with dates

**Priority:** High  
**Story Points:** 5  
**Sprint:** Sprint 2  
**Dependencies:** Payment model, notification system

---

### US-T5: Report Maintenance Issues
**Title:** Khách thuê báo cáo sự cố/hỏng hóc  
**Role:** Tenant  
**Description:** As a tenant, I want to report maintenance issues with priority levels so that problems are fixed quickly.

**Acceptance Criteria:**
- ✅ Can create maintenance ticket with: category, priority, title, description
- ✅ Can attach photos/images of the issue
- ✅ Priority options: low/medium/high/urgent
- ✅ Categories: plumbing, electrical, structural, appliance, ventilation, door-lock, paint, other
- ✅ Receives ticket number for reference
- ✅ Can see ticket status (new/assigned/in-progress/completed)
- ✅ Receives notification when ticket is assigned
- ✅ Receives notification when issue is completed
- ✅ Cannot mark own tickets as completed

**Priority:** High  
**Story Points:** 8  
**Sprint:** Sprint 1  
**Dependencies:** MaintenanceTicket model, notification system

---

### US-T6: Upload Documents & ID Card
**Title:** Khách thuê upload giấy tờ lúc check-in  
**Role:** Tenant  
**Description:** As a tenant, I want to upload important documents during check-in so that landlord has records for future reference.

**Acceptance Criteria:**
- ✅ Can upload: ID card image, ID card number, car certificate (if applicable), check-in photos
- ✅ System validates file types and sizes
- ✅ Documents are stored securely with tenant profile
- ✅ Can view uploaded documents anytime
- ✅ Can replace/update documents if needed
- ✅ Documents show upload date and file name
- ✅ Landlord can download documents for verification

**Priority:** Medium  
**Story Points:** 5  
**Sprint:** Sprint 1  
**Dependencies:** Document model

---

### US-T7: Receive & View Notifications
**Title:** Khách thuê nhận thông báo quan trọng  
**Role:** Tenant  
**Description:** As a tenant, I want to receive important notifications so that I don't miss payment deadlines or maintenance updates.

**Acceptance Criteria:**
- ✅ Notifications are categorized: important vs regular
- ✅ Important notifications (invoice due, payment reminder) appear prominently
- ✅ Can see notification history
- ✅ Can mark notifications as read
- ✅ Receives notifications for: invoice issued, payment due, payment confirmed, maintenance assigned, maintenance completed
- ✅ Notifications include: title, message, action link
- ✅ Can set notification preferences (in-app/email/SMS)
- ✅ Can delete old notifications

**Priority:** High  
**Story Points:** 5  
**Sprint:** Sprint 2  
**Dependencies:** Notification model

---

### US-T8: Send Messages & Special Requests to Landlord
**Title:** Khách thuê gửi tin nhắn riêng (khác chat)  
**Role:** Tenant  
**Description:** As a tenant, I want to send special requests or notices to the landlord in a separate channel so they don't get mixed with regular chat or maintenance reports.

**Acceptance Criteria:**
- ✅ Message interface is separate from maintenance tickets
- ✅ Can type text messages with optional file attachments
- ✅ Messages are timestamped and organized chronologically
- ✅ Can see read/unread status
- ✅ Landlord receives notification of new messages
- ✅ Can see conversation history with landlord
- ✅ Message types: text, image, file
- ✅ Cannot delete landlord's messages (own messages can be deleted)

**Priority:** Medium  
**Story Points:** 6  
**Sprint:** Sprint 2  
**Dependencies:** Message model, notification system

---

### US-T9: Chat with Landlord in Real-Time
**Title:** Khách thuê chat trực tiếp với chủ nhà  
**Role:** Tenant  
**Description:** As a tenant, I want to have a chat conversation with the landlord for quick communication.

**Acceptance Criteria:**
- ✅ Real-time chat interface (or near real-time)
- ✅ Shows conversation history with landlord
- ✅ Can send/receive text and file attachments
- ✅ Shows online/offline status
- ✅ Typing indicator shows when landlord is typing
- ✅ Read receipts show when message is read
- ✅ Can search message history
- ✅ Can pin important messages

**Priority:** Medium  
**Story Points:** 8  
**Sprint:** Sprint 2  
**Dependencies:** Message model, WebSocket (future)

---

### US-T10: View & Download Payment Receipt
**Title:** Khách thuê xem hoá đơn thanh toán  
**Role:** Tenant  
**Description:** As a tenant, I want to download payment receipts so that I have proof of payment.

**Acceptance Criteria:**
- ✅ Receipt shows: invoice number, month/year, total amount, payment date, payment method
- ✅ Receipt shows landlord information
- ✅ Can download as PDF
- ✅ Can print receipt
- ✅ Receipt is automatically generated after payment confirmation
- ✅ Can view all payment receipts from history

**Priority:** Medium  
**Story Points:** 3  
**Sprint:** Sprint 2  
**Dependencies:** Invoice & Payment models

---

## 🏢 ADMIN/LANDLORD User Stories (Chủ nhà/Admin)

### US-A1: Create Rental Contract
**Title:** Chủ nhà tạo hợp đồng cho khách thuê  
**Role:** Admin/Staff  
**Description:** As a landlord, I want to create a rental contract for a tenant so that we have a legal agreement in place.

**Acceptance Criteria:**
- ✅ Can select unit and tenant for contract
- ✅ Can set: start date, end date, rent amount, deposit amount
- ✅ Can specify utility inclusions: electricity, water, internet
- ✅ Can add contract terms (text, bullet points)
- ✅ Can attach documents (PDF, images)
- ✅ Contract gets unique number (HĐ-2025-01-A101 format)
- ✅ Can save as draft or directly activate
- ✅ Can require both parties to sign (digital signature?)

**Priority:** High  
**Story Points:** 8  
**Sprint:** Sprint 1  
**Dependencies:** Unit, Tenant, Contract models

---

### US-A2: Auto-Generate Monthly Invoices
**Title:** Chủ nhà tự động tính tiền và tạo hóa đơn hàng tháng  
**Role:** Admin/Staff  
**Description:** As a landlord, I want to automatically generate monthly invoices based on contracts so that billing is consistent and timely.

**Acceptance Criteria:**
- ✅ Can manually trigger invoice generation for specific month
- ✅ System calculates: rent + utilities based on contract
- ✅ Invoice includes: rent, electricity, water, internet costs
- ✅ Utility costs are pulled from verified meter readings
- ✅ Invoice number auto-generated (INV-2025-01-A101)
- ✅ Invoice shows: invoice number, month, due date, tenant name, unit
- ✅ Cannot create duplicate invoices for same month/unit
- ✅ Can customize invoice template (add notes, terms)

**Priority:** High  
**Story Points:** 8  
**Sprint:** Sprint 1  
**Dependencies:** Invoice, UtilityReading, Contract models

---

### US-A3: Verify Utility Readings
**Title:** Chủ nhà xác nhận chỉ số điện nước từ khách  
**Role:** Admin/Staff  
**Description:** As a landlord, I want to verify tenant-submitted meter readings so that I ensure billing is accurate.

**Acceptance Criteria:**
- ✅ Can see list of pending utility readings
- ✅ Can see: submitted reading, previous reading, calculated usage, tenant name
- ✅ Can accept reading as submitted
- ✅ Can adjust reading if it seems incorrect
- ✅ Can reject reading with reason (triggers notification to tenant to resubmit)
- ✅ Approved readings feed into invoice generation
- ✅ Can see adjustment history (original vs approved)

**Priority:** High  
**Story Points:** 6  
**Sprint:** Sprint 1  
**Dependencies:** UtilityReading, Notification models

---

### US-A4: Track Payment Status
**Title:** Chủ nhà theo dõi trạng thái thanh toán của khách  
**Role:** Admin/Staff  
**Description:** As a landlord, I want to track which tenants have paid, partially paid, or are overdue so that I can follow up.

**Acceptance Criteria:**
- ✅ Dashboard shows payment summary: paid/partial/unpaid/overdue/missing
- ✅ Can filter by: month, year, building, unit, status
- ✅ Each status shows: tenant name, unit, amount, due date
- ✅ Can manually mark payment as confirmed (with amount & date)
- ✅ System tracks payment history for each invoice
- ✅ Can see payment method used (bank/cash/card/e-wallet)
- ✅ Can export payment report (Excel/PDF)
- ✅ Color-coded status (green=paid, yellow=partial, red=overdue)

**Priority:** High  
**Story Points:** 8  
**Sprint:** Sprint 2  
**Dependencies:** Invoice, Payment models

---

### US-A5: Send Payment Information to Tenants
**Title:** Chủ nhà gửi thông tin ngân hàng, MoMo cho khách  
**Role:** Admin/Staff  
**Description:** As a landlord, I want to send payment information to tenants so they know how to pay rent.

**Acceptance Criteria:**
- ✅ Can select invoice and add payment details
- ✅ Payment details include: bank name, account number, holder name, MoMo number, etc.
- ✅ System sends notification with payment info to tenant
- ✅ Tenant sees payment methods clearly in invoice details
- ✅ Can include payment deadline reminder
- ✅ Can send to single tenant or all unpaid invoices

**Priority:** Medium  
**Story Points:** 4  
**Sprint:** Sprint 2  
**Dependencies:** Notification system, Payment model

---

### US-A6: Manage Maintenance Tickets
**Title:** Chủ nhà quản lý báo cáo sự cố từ khách  
**Role:** Admin/Staff  
**Description:** As a landlord, I want to manage tenant maintenance requests so that issues are resolved promptly.

**Acceptance Criteria:**
- ✅ Can see all maintenance tickets with: priority, status, date submitted
- ✅ Can assign ticket to maintenance staff
- ✅ Can set estimated completion date
- ✅ Can update ticket status (assigned → in-progress → completed)
- ✅ Can add cost to ticket if chargeable to tenant
- ✅ Can view attachment photos
- ✅ Can filter by: status, priority, building, assigned staff
- ✅ Can send notification to staff when assigned
- ✅ Can notify tenant when completed

**Priority:** High  
**Story Points:** 8  
**Sprint:** Sprint 1  
**Dependencies:** MaintenanceTicket, Notification models

---

### US-A7: Send Notifications to Tenants
**Title:** Chủ nhà gửi thông báo cho khách (theo phòng/toà/block)  
**Role:** Admin/Staff  
**Description:** As a landlord, I want to send announcements to tenants (specific or bulk) so that important information reaches them.

**Acceptance Criteria:**
- ✅ Can send notification to: single tenant, specific unit, entire building, specific block
- ✅ Notification types: invoice issued, payment due, maintenance update, announcement, system alert
- ✅ Can choose delivery method: in-app, email, SMS
- ✅ System tracks delivery status (sent/failed)
- ✅ Can schedule notifications for future date/time
- ✅ Tenants can mark important notifications to see them prominently
- ✅ Can see notification delivery report

**Priority:** High  
**Story Points:** 7  
**Sprint:** Sprint 2  
**Dependencies:** Notification model

---

### US-A8: Send Special Notices/Requests to Tenants
**Title:** Chủ nhà gửi lưu ý/yêu cầu riêng cho khách (khác chat)  
**Role:** Admin/Staff  
**Description:** As a landlord, I want to send special notices to tenants separately from chat so they don't get lost.

**Acceptance Criteria:**
- ✅ Separate interface from chat and maintenance tickets
- ✅ Can send text message with optional attachments
- ✅ Messages are timestamped and searchable
- ✅ Tenant receives notification of new message
- ✅ Can see read/unread status
- ✅ Can see conversation history with specific tenant
- ✅ Can target specific tenant or group of tenants

**Priority:** Medium  
**Story Points:** 5  
**Sprint:** Sprint 2  
**Dependencies:** Message model, Notification system

---

### US-A9: Chat with Tenants
**Title:** Chủ nhà chat trực tiếp với khách thuê  
**Role:** Admin/Staff  
**Description:** As a landlord, I want to have direct chat conversations with tenants for quick communication.

**Acceptance Criteria:**
- ✅ Real-time chat interface (or near real-time)
- ✅ Can see list of all tenant conversations
- ✅ Can search past messages
- ✅ Can send text and file attachments
- ✅ Shows online/offline status
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Can export conversation history

**Priority:** Medium  
**Story Points:** 8  
**Sprint:** Sprint 2  
**Dependencies:** Message model

---

### US-A10: Archive & Store Tenant Documents
**Title:** Chủ nhà lưu trữ bill, chứng chỉ, hình ảnh (lưu 3 tháng)  
**Role:** Admin/Staff  
**Description:** As a landlord, I want to archive and retrieve tenant documents for verification and dispute resolution.

**Acceptance Criteria:**
- ✅ Can upload/archive: utility bills, invoices, receipts, meter photos, check-in photos
- ✅ System stores documents for minimum 3 months
- ✅ Can organize by: tenant, unit, document type, date
- ✅ Can search documents by keyword/date
- ✅ Can set document expiry (documents older than 3 months marked archived)
- ✅ Can share specific documents with tenant
- ✅ Can download/export documents for tax records

**Priority:** Medium  
**Story Points:** 6  
**Sprint:** Sprint 1  
**Dependencies:** Document model

---

### US-A11: Manage Units/Rooms
**Title:** Chủ nhà quản lý phòng (tạo, sửa, xóa)  
**Role:** Admin/Staff  
**Description:** As a landlord, I want to manage my rental units so that I can track which rooms are available or occupied.

**Acceptance Criteria:**
- ✅ Can create new unit: number, building, floor, size, room type, rent price
- ✅ Can update unit information
- ✅ Can delete unit (only if not occupied)
- ✅ Can add amenities list and photos
- ✅ Unit status tracking: available/occupied/maintenance
- ✅ Can see current tenant for occupied units
- ✅ Can list available units for reference/promotion
- ✅ Can organize by: building, floor, room type

**Priority:** High  
**Story Points:** 6  
**Sprint:** Sprint 1  
**Dependencies:** Unit model

---

### US-A12: View Activity Logs
**Title:** Admin xem activity log của tất cả thao tác  
**Role:** Admin  
**Description:** As an admin, I want to see activity logs so that I can track all system operations for security and accountability.

**Acceptance Criteria:**
- ✅ Can see logs of all admin actions: create, update, delete
- ✅ Logs show: user name, action type, timestamp, target entity
- ✅ Can filter by: user, action type, date, target type
- ✅ Can search logs by keyword
- ✅ Logs are tamper-proof (cannot be edited)
- ✅ Can export logs for audit purposes
- ✅ Logs kept for minimum 1 year

**Priority:** Medium  
**Story Points:** 4  
**Sprint:** Sprint 1  
**Dependencies:** ActivityLog model

---

## 📋 Story Point Estimation Scale

| Points | Complexity | Time (hours) |
|--------|-----------|------------|
| 1-2 | Trivial | < 1 |
| 3-5 | Simple | 2-4 |
| 5-8 | Medium | 4-8 |
| 8-13 | Complex | 8+ |

---

## 📊 Sprint Distribution

### Sprint 1 (Week 1-2): Foundation & Core Features
**Total Points:** 60
- US-A1: Create Rental Contract (8)
- US-A2: Auto-Generate Invoices (8)
- US-A3: Verify Readings (6)
- US-A6: Manage Maintenance (8)
- US-A10: Archive Documents (6)
- US-A11: Manage Units (6)
- US-A12: Activity Logs (4)
- US-T1: Submit Readings (5)
- US-T2: View Contract (3)

### Sprint 2 (Week 3-4): Advanced Features & Communication
**Total Points:** 58
- US-A4: Track Payments (8)
- US-A5: Send Payment Info (4)
- US-A7: Send Notifications (7)
- US-A8: Send Special Notices (5)
- US-A9: Chat (8)
- US-T3: View Invoices (5)
- US-T4: Submit Payments (5)
- US-T5: Report Issues (8)
- US-T6: Upload Documents (5)
- US-T7: Receive Notifications (5)
- US-T8: Send Messages (6)
- US-T9: Chat (8)
- US-T10: Download Receipt (3)

**Total:** 118 points / 2 sprints = 59 points/sprint (realistic)

---

**Next Step:** Create detailed task breakdown, assign story points based on team capacity, identify blockers, and establish sprint timeline.
