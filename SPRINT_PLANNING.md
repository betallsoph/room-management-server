# Sprint Planning - Apartment Rental Management System

**Project:** Nền tảng Quản lý Phòng thuê Chung cư/Trọ  
**Total Duration:** 4 weeks (2 sprints × 2 weeks)  
**Team:** Ân, Việt, Nguyên  
**Created:** October 21, 2025  
**Status:** Ready to Start

---

## 🎯 Project Goals

1. Complete production-ready API (✅ DONE)
2. Write comprehensive user stories with acceptance criteria (✅ DONE)
3. Plan work into manageable 2-week sprints
4. Assign tasks to team members
5. Track progress with Agile metrics
6. Deliver working features incrementally

---

## 📅 Timeline Overview

```
Week 1-2: SPRINT 1 (Foundation & Core)
├─ Unit Management
├─ Tenant Management  
├─ Contract Creation
├─ Automatic Invoice Generation
├─ Utility Reading Verification
├─ Maintenance Ticket Management
└─ Document Archiving

Week 3-4: SPRINT 2 (Advanced & Communication)
├─ Payment Tracking & Confirmation
├─ Notification System
├─ Message/Chat System
├─ Payment Information Broadcasting
└─ Special Notices System
```

---

## 🏃 SPRINT 1: Foundation & Core Features

### Sprint 1 Overview
- **Duration:** 2 weeks (10 business days)
- **Target Velocity:** 60 story points
- **Goal:** Implement all core apartment management features
- **Success Criteria:** All CRUD operations working, unit tests passing

### Sprint 1 Tasks Breakdown

#### WEEK 1 - Days 1-5 (Setup & Models)

| Task ID | Task | Assignee | Points | Days | Status |
|---------|------|----------|--------|------|--------|
| S1-001 | Setup test data & database | Ân | 3 | 1 | ⏳ TODO |
| S1-002 | Write model unit tests | Ân | 5 | 2 | ⏳ TODO |
| S1-003 | Create Unit API tests | Việt | 5 | 2 | ⏳ TODO |
| S1-004 | Create Tenant API tests | Việt | 5 | 2 | ⏳ TODO |
| S1-005 | Setup test fixtures | Nguyên | 3 | 1 | ⏳ TODO |
| S1-006 | Document API endpoints | Nguyên | 2 | 1 | ⏳ TODO |

**Week 1 Subtotal:** 23 points | All developers

#### WEEK 2 - Days 6-10 (Implementation & Integration)

| Task ID | Task | Assignee | Points | Days | Status |
|---------|------|----------|--------|------|--------|
| S1-007 | Implement Unit Controller tests | Ân | 3 | 1 | ⏳ TODO |
| S1-008 | Implement Contract flow tests | Ân | 5 | 1.5 | ⏳ TODO |
| S1-009 | Implement Invoice generation tests | Việt | 5 | 1.5 | ⏳ TODO |
| S1-010 | Implement UtilityReading verification | Việt | 3 | 1 | ⏳ TODO |
| S1-011 | Implement Maintenance ticket tests | Nguyên | 5 | 1 | ⏳ TODO |
| S1-012 | Implement Document archiving tests | Nguyên | 3 | 1 | ⏳ TODO |
| S1-013 | Integration testing Sprint 1 | Ân | 5 | 1 | ⏳ TODO |
| S1-014 | Bug fixes & cleanup | Việt, Nguyên | 3 | 0.5 | ⏳ TODO |

**Week 2 Subtotal:** 32 points | All developers

### Sprint 1 User Stories

#### Story US-A1: Create Rental Contract
- **Assignee:** Ân  
- **Story Points:** 8  
- **Tasks:**
  - S1-001: Create contract controller tests (2 pts)
  - S1-002: Implement contract creation endpoint (3 pts)
  - S1-003: Implement contract signing (2 pts)
  - S1-004: Document contract API (1 pt)
- **Acceptance Criteria:** All 5 criteria met ✓
- **Completion Date:** Day 7
- **Dependencies:** Unit, Tenant models exist

#### Story US-A2: Auto-Generate Monthly Invoices
- **Assignee:** Việt  
- **Story Points:** 8  
- **Tasks:**
  - S1-005: Invoice generation algorithm (2 pts)
  - S1-006: Implement auto-generation endpoint (3 pts)
  - S1-007: Test with sample data (2 pts)
  - S1-008: Document invoicing process (1 pt)
- **Acceptance Criteria:** All 8 criteria met ✓
- **Completion Date:** Day 9
- **Dependencies:** Contract, UtilityReading models

#### Story US-A3: Verify Utility Readings
- **Assignee:** Nguyên  
- **Story Points:** 6  
- **Tasks:**
  - S1-009: Create reading verification endpoint (2 pts)
  - S1-010: Implement approval/rejection (2 pts)
  - S1-011: Test verification workflow (1 pt)
  - S1-012: Document reading process (1 pt)
- **Acceptance Criteria:** All 6 criteria met ✓
- **Completion Date:** Day 8
- **Dependencies:** UtilityReading model

#### Story US-A6: Manage Maintenance Tickets
- **Assignee:** Ân  
- **Story Points:** 8  
- **Tasks:**
  - S1-013: Ticket assignment endpoint (2 pts)
  - S1-014: Status update workflow (2 pts)
  - S1-015: Test assignment notifications (2 pts)
  - S1-016: Document ticket process (1 pt)
  - S1-017: Cost tracking (1 pt)
- **Acceptance Criteria:** All 9 criteria met ✓
- **Completion Date:** Day 10
- **Dependencies:** MaintenanceTicket model, Notification system

#### Story US-A10: Archive & Store Documents
- **Assignee:** Việt  
- **Story Points:** 6  
- **Tasks:**
  - S1-018: Document upload endpoint (2 pts)
  - S1-019: Archive & retrieval logic (2 pts)
  - S1-020: 3-month retention policy (1 pt)
  - S1-021: Document search & org (1 pt)
- **Acceptance Criteria:** All 7 criteria met ✓
- **Completion Date:** Day 8
- **Dependencies:** Document model

#### Story US-A11: Manage Units
- **Assignee:** Nguyên  
- **Story Points:** 6  
- **Tasks:**
  - S1-022: Unit CRUD endpoints (2 pts)
  - S1-023: Status management (1 pt)
  - S1-024: Amenities & photos (1 pt)
  - S1-025: Organization & filtering (1 pt)
  - S1-026: Document unit management (1 pt)
- **Acceptance Criteria:** All 8 criteria met ✓
- **Completion Date:** Day 7
- **Dependencies:** Unit model

#### Story US-A12: View Activity Logs
- **Assignee:** Ân  
- **Story Points:** 4  
- **Tasks:**
  - S1-027: Activity log endpoints (1 pt)
  - S1-028: Filtering & search (1 pt)
  - S1-029: Export functionality (1 pt)
  - S1-030: Document logging (1 pt)
- **Acceptance Criteria:** All 7 criteria met ✓
- **Completion Date:** Day 5
- **Dependencies:** ActivityLog model (exists)

#### Story US-T1: Submit Utility Readings
- **Assignee:** Việt  
- **Story Points:** 5  
- **Tasks:**
  - S1-031: Tenant reading submission endpoint (2 pts)
  - S1-032: Validation logic (1 pt)
  - S1-033: Notification to landlord (1 pt)
  - S1-034: Confirmation response (1 pt)
- **Acceptance Criteria:** All 7 criteria met ✓
- **Completion Date:** Day 6
- **Dependencies:** UtilityReading, Notification models

#### Story US-T2: View Contract
- **Assignee:** Nguyên  
- **Story Points:** 3  
- **Tasks:**
  - S1-035: Tenant contract view endpoint (1 pt)
  - S1-036: PDF download generation (1 pt)
  - S1-037: Error handling (1 pt)
- **Acceptance Criteria:** All 7 criteria met ✓
- **Completion Date:** Day 4
- **Dependencies:** Contract model

### Sprint 1 Daily Standup Template

**Format:** Every morning at 09:00
```
Each team member reports:
1. What did I complete yesterday?
2. What will I complete today?
3. What blockers do I have?
```

### Sprint 1 Burndown Chart

```
Points
  60  [████ START]
  55  [███░░░░░░]  Day 1-2: 15 pts done
  45  [█████░░░░░]  Day 3-4: 20 pts done  
  35  [██████░░░░░]  Day 5: 10 pts done
  25  [███████░░░]  Day 6-7: 15 pts done
  15  [████████░░]  Day 8-9: 15 pts done
   5  [████████░░]  Day 10: 10 pts done
   0  [█████████░]  Done!

Ideal velocity: 6 pts/day
Target completion: Day 10
```

---

## 🏃 SPRINT 2: Advanced Features & Communication

### Sprint 2 Overview
- **Duration:** 2 weeks (10 business days)  
- **Target Velocity:** 58 story points
- **Goal:** Implement payments, notifications, and communication features
- **Success Criteria:** All endpoints tested, end-to-end workflows working

### Sprint 2 Tasks Breakdown

#### WEEK 3 - Days 1-5 (Payment & Tracking)

| Task ID | Task | Assignee | Points | Days | Status |
|---------|------|----------|--------|------|--------|
| S2-001 | Payment recording endpoint | Ân | 3 | 1 | ⏳ TODO |
| S2-002 | Payment status tracking | Ân | 3 | 1 | ⏳ TODO |
| S2-003 | Payment info broadcast (bank/MoMo) | Việt | 3 | 1 | ⏳ TODO |
| S2-004 | Notification system base | Việt | 5 | 1.5 | ⏳ TODO |
| S2-005 | Notification sending endpoints | Nguyên | 3 | 1 | ⏳ TODO |
| S2-006 | Notification filtering (by building/unit) | Nguyên | 3 | 1 | ⏳ TODO |
| S2-007 | Message system base | Ân | 5 | 1.5 | ⏳ TODO |

**Week 3 Subtotal:** 28 points | All developers

#### WEEK 4 - Days 6-10 (Communication & Integration)

| Task ID | Task | Assignee | Points | Days | Status |
|---------|------|----------|--------|------|--------|
| S2-008 | Conversation history endpoints | Việt | 3 | 1 | ⏳ TODO |
| S2-009 | Message read tracking | Việt | 2 | 0.5 | ⏳ TODO |
| S2-010 | File attachment handling | Nguyên | 3 | 1 | ⏳ TODO |
| S2-011 | Tenant invoice view endpoints | Ân | 3 | 1 | ⏳ TODO |
| S2-012 | Tenant payment history | Ân | 3 | 1 | ⏳ TODO |
| S2-013 | Tenant document upload | Nguyên | 3 | 1 | ⏳ TODO |
| S2-014 | Integration testing Sprint 2 | Việt | 5 | 1 | ⏳ TODO |
| S2-015 | End-to-end testing | Nguyên | 3 | 1 | ⏳ TODO |

**Week 4 Subtotal:** 28 points | All developers

### Sprint 2 User Stories

#### Story US-A4: Track Payment Status
- **Assignee:** Ân  
- **Story Points:** 8  
- **Tasks:**
  - S2-001: Payment status endpoint (2 pts)
  - S2-002: Payment summary dashboard logic (2 pts)
  - S2-003: Payment filtering & export (2 pts)
  - S2-004: Color-coded status display (1 pt)
  - S2-005: Documentation (1 pt)
- **Acceptance Criteria:** All 8 criteria met ✓
- **Completion Date:** Day 7
- **Dependencies:** Invoice, Payment models

#### Story US-A5: Send Payment Info
- **Assignee:** Việt  
- **Story Points:** 4  
- **Tasks:**
  - S2-006: Payment info endpoint (1 pt)
  - S2-007: Notification integration (1 pt)
  - S2-008: Template support (1 pt)
  - S2-009: Documentation (1 pt)
- **Acceptance Criteria:** All 5 criteria met ✓
- **Completion Date:** Day 5
- **Dependencies:** Notification system

#### Story US-A7: Send Notifications
- **Assignee:** Việt  
- **Story Points:** 7  
- **Tasks:**
  - S2-010: Notification endpoint (2 pts)
  - S2-011: Targeting logic (building/block/unit) (2 pts)
  - S2-012: Channel selection (in-app/email/SMS) (2 pts)
  - S2-013: Documentation (1 pt)
- **Acceptance Criteria:** All 7 criteria met ✓
- **Completion Date:** Day 8
- **Dependencies:** Notification model

#### Story US-A8: Send Special Notices
- **Assignee:** Nguyên  
- **Story Points:** 5  
- **Tasks:**
  - S2-014: Notice messaging endpoint (2 pts)
  - S2-015: Attachment support (1 pt)
  - S2-016: Read tracking (1 pt)
  - S2-017: Documentation (1 pt)
- **Acceptance Criteria:** All 7 criteria met ✓
- **Completion Date:** Day 6
- **Dependencies:** Message model

#### Story US-A9: Chat with Tenants
- **Assignee:** Ân  
- **Story Points:** 8  
- **Tasks:**
  - S2-018: Chat endpoint (2 pts)
  - S2-019: Conversation history (2 pts)
  - S2-020: Read receipts (2 pts)
  - S2-021: Typing indicators (optional) (1 pt)
  - S2-022: Documentation (1 pt)
- **Acceptance Criteria:** All 8 criteria met ✓
- **Completion Date:** Day 9
- **Dependencies:** Message model

#### Story US-T3: View Invoices
- **Assignee:** Việt  
- **Story Points:** 5  
- **Tasks:**
  - S2-023: Invoice list endpoint (1 pt)
  - S2-024: Invoice detail view (1 pt)
  - S2-025: PDF generation (1 pt)
  - S2-026: PDF download (1 pt)
  - S2-027: Documentation (1 pt)
- **Acceptance Criteria:** All 6 criteria met ✓
- **Completion Date:** Day 5
- **Dependencies:** Invoice model

#### Story US-T4: Payment Submission & Status
- **Assignee:** Nguyên  
- **Story Points:** 5  
- **Tasks:**
  - S2-028: Payment method display (1 pt)
  - S2-029: Payment confirmation endpoint (1 pt)
  - S2-030: Payment status tracking (1 pt)
  - S2-031: Notification integration (1 pt)
  - S2-032: Documentation (1 pt)
- **Acceptance Criteria:** All 6 criteria met ✓
- **Completion Date:** Day 7
- **Dependencies:** Payment model, Notification system

#### Story US-T5: Report Issues
- **Assignee:** Ân  
- **Story Points:** 8  
- **Tasks:**
  - S2-033: Issue ticket creation (1 pt)
  - S2-034: Photo attachment (1 pt)
  - S2-035: Priority assignment (1 pt)
  - S2-036: Status tracking (1 pt)
  - S2-037: Notification system (1 pt)
  - S2-038: Testing (1 pt)
  - S2-039: Documentation (1 pt)
- **Acceptance Criteria:** All 9 criteria met ✓
- **Completion Date:** Day 8
- **Dependencies:** MaintenanceTicket, Notification models

#### Story US-T6: Upload Documents
- **Assignee:** Việt  
- **Story Points:** 5  
- **Tasks:**
  - S2-040: Document upload endpoint (1 pt)
  - S2-041: File type validation (1 pt)
  - S2-042: Secure storage (1 pt)
  - S2-043: View uploaded docs (1 pt)
  - S2-044: Documentation (1 pt)
- **Acceptance Criteria:** All 7 criteria met ✓
- **Completion Date:** Day 6
- **Dependencies:** Document model

#### Story US-T7: Notifications
- **Assignee:** Nguyên  
- **Story Points:** 5  
- **Tasks:**
  - S2-045: Notification list endpoint (1 pt)
  - S2-046: Mark as read (1 pt)
  - S2-047: Important notification separation (1 pt)
  - S2-048: Delete notification (1 pt)
  - S2-049: Documentation (1 pt)
- **Acceptance Criteria:** All 8 criteria met ✓
- **Completion Date:** Day 7
- **Dependencies:** Notification model

#### Story US-T8: Send Messages
- **Assignee:** Ân  
- **Story Points:** 6  
- **Tasks:**
  - S2-050: Message send endpoint (1 pt)
  - S2-051: Attachment support (1 pt)
  - S2-052: Message history (1 pt)
  - S2-053: Notification on new message (1 pt)
  - S2-054: Testing (1 pt)
  - S2-055: Documentation (1 pt)
- **Acceptance Criteria:** All 7 criteria met ✓
- **Completion Date:** Day 8
- **Dependencies:** Message, Notification models

#### Story US-T9: Chat
- **Assignee:** Việt  
- **Story Points:** 8  
- **Tasks:**
  - S2-056: Chat endpoint (2 pts)
  - S2-057: Conversation list (1 pt)
  - S2-058: Read status (1 pt)
  - S2-059: Search history (1 pt)
  - S2-060: Message pinning (1 pt)
  - S2-061: Documentation (1 pt)
- **Acceptance Criteria:** All 8 criteria met ✓
- **Completion Date:** Day 9
- **Dependencies:** Message model

#### Story US-T10: Download Receipt
- **Assignee:** Nguyên  
- **Story Points:** 3  
- **Tasks:**
  - S2-062: Receipt generation (1 pt)
  - S2-063: PDF download (1 pt)
  - S2-064: Documentation (1 pt)
- **Acceptance Criteria:** All 6 criteria met ✓
- **Completion Date:** Day 5
- **Dependencies:** Invoice, Payment models

### Sprint 2 Daily Standup

**Format:** Same as Sprint 1
- Morning standup: 09:00
- 15-minute timeboxed
- Report blockers immediately

### Sprint 2 Burndown Chart

```
Points
  58  [████ START]
  50  [███░░░░░░]  Day 1-2: 14 pts done
  38  [█████░░░░░]  Day 3-4: 18 pts done
  28  [██████░░░░░]  Day 5: 15 pts done
  18  [███████░░░░░]  Day 6-7: 16 pts done
   8  [████████░░░░░]  Day 8-9: 14 pts done
   0  [█████████░░░░░]  Day 10: 8 pts done - DONE!
```

---

## 📊 Team Assignments & Capacity

### Team Members

#### Ân - Backend Developer
- **Skills:** Node.js, MongoDB, API design
- **Capacity:** 2 weeks × 5 days × 8 hours = 80 hours
- **Estimated Velocity:** ~20 points/sprint
- **Sprint 1 Tasks:** Contract (8), Maintenance (8), ActivityLog (4) = 20 pts
- **Sprint 2 Tasks:** Payment tracking (8), Chat (8), Document upload support (3) = 19 pts

#### Việt - Backend Developer  
- **Skills:** API development, database optimization
- **Capacity:** 2 weeks × 5 days × 8 hours = 80 hours
- **Estimated Velocity:** ~20 points/sprint
- **Sprint 1 Tasks:** Invoice generation (8), Document archiving (6), Utility readings (5) = 19 pts
- **Sprint 2 Tasks:** Payment info (4), Notifications (7), Invoices view (5), Chat (8) = 24 pts

#### Nguyên - Backend Developer
- **Skills:** API endpoints, testing, documentation
- **Capacity:** 2 weeks × 5 days × 8 hours = 80 hours
- **Estimated Velocity:** ~20 points/sprint
- **Sprint 1 Tasks:** Unit management (6), Tenant management (5), Contract view (3), ActivityLog (4) = 18 pts
- **Sprint 2 Tasks:** Messages (5), Special notices (5), Payment status (2), Receipt download (3) = 15 pts

**Total Team Capacity:** 60 points/sprint
**Sprint 1 Target:** 60 points (includes testing & integration)
**Sprint 2 Target:** 58 points

---

## 📈 Agile Metrics & Tracking

### Velocity Calculation

**Sprint 1 Velocity:**
- Target: 60 points
- If Actual: 60 points → Velocity = 60
- If Actual: 55 points → Velocity = 55 (adjust Sprint 2)

**Sprint 2 Velocity:**
- Target: 58 points
- Adjusted based on Sprint 1 actual velocity

### Burndown Chart Tracking

Track daily:
1. **Days Remaining** (X-axis): 0-10
2. **Story Points Remaining** (Y-axis): 0-60
3. **Ideal Line** (straight diagonal)
4. **Actual Line** (team progress)

**Chart Location:** `/burndown-charts/sprint1.csv`

### Definition of Done (DoD)

A story is "DONE" when:
- ✅ Code is written
- ✅ Code is reviewed (peer review)
- ✅ Unit tests pass (80%+ coverage)
- ✅ Integration tests pass
- ✅ Acceptance criteria verified
- ✅ API documented
- ✅ Error handling complete
- ✅ Activity logging working
- ✅ Ready for deployment

### Definition of Ready (DoR)

A story is "READY" for sprint when:
- ✅ User story is clear
- ✅ Acceptance criteria is written
- ✅ Dependencies are identified
- ✅ Assignee is confirmed
- ✅ Story points are estimated
- ✅ No blockers identified

---

## 🐛 Issue Tracking & Resolution

### Issue Priority Levels

| Level | Response Time | Example |
|-------|---------------|---------|
| CRITICAL | 1 hour | API down, data loss |
| HIGH | 4 hours | User story blocker |
| MEDIUM | 8 hours | UI issue, minor feature bug |
| LOW | 24 hours | Nice to have, documentation |

### Escalation Path

1. Developer identifies issue
2. Reports in daily standup
3. If unresolved after 2 hours → discuss with team lead
4. If unresolved after 4 hours → escalate to manager
5. Document in issue tracker

---

## 📝 Daily Standup Questions

Every team member answers (5 min max):

1. **Yesterday:** What did I accomplish?
2. **Today:** What will I complete?
3. **Blockers:** What's preventing progress?
4. **Help Needed:** Do I need assistance?

---

## 🎉 Sprint Review & Retrospective

### Sprint Review (Day 10, Afternoon)
- **Duration:** 1 hour
- **Attendees:** Team, stakeholders
- **Agenda:**
  1. Demo completed features (30 min)
  2. Review metrics (10 min)
  3. Q&A (20 min)

### Sprint Retrospective (Day 10, After Review)
- **Duration:** 45 minutes
- **Attendees:** Team only
- **Agenda:**
  1. What went well? (10 min)
  2. What could improve? (10 min)
  3. Action items for next sprint (10 min)
  4. Team celebration! (15 min)

---

## 🚀 Deployment Checklist

After each sprint, before production:

- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Code review completed
- ✅ No console errors
- ✅ API documentation updated
- ✅ Security review done
- ✅ Database migrations ready
- ✅ Rollback plan documented
- ✅ Team approved for deployment

---

## 📞 Communication Plan

### Channels
- **Daily Standup:** 09:00 AM (15 min, in-person)
- **Slack:** For questions/updates during day
- **Weekly Sync:** Friday 4 PM (30 min, review & planning)
- **Issue Board:** Jira/GitHub Projects for tracking

### Response Times
- **Standup Questions:** Immediate
- **Slack Urgent:** < 1 hour
- **Slack Normal:** < 4 hours
- **Email:** < 24 hours

---

## ✅ Success Criteria for Entire Project

### By End of Sprint 2:
- ✅ All 22 user stories implemented
- ✅ 90%+ unit test coverage
- ✅ Zero critical bugs
- ✅ All endpoints documented
- ✅ Performance acceptable (< 500ms response)
- ✅ Team satisfied with quality
- ✅ Ready for production deployment
- ✅ Ready for UI team integration

---

## 📚 Documentation Deliverables

- ✅ `API_DOCUMENTATION.md` - 60+ endpoints
- ✅ `USER_STORIES.md` - 22 user stories
- ✅ `SPRINT_PLANNING.md` - This document
- ✅ `COMPLETION_REPORT.md` - Backend status
- ⏳ `TESTING_GUIDE.md` - Unit/Integration test guide
- ⏳ `DEPLOYMENT_GUIDE.md` - Production setup
- ⏳ `TROUBLESHOOTING.md` - Common issues & fixes

---

## 🎯 Final Notes

**This sprint plan is:**
- ✅ Realistic (based on team capacity)
- ✅ Achievable (within 2 weeks)
- ✅ Flexible (can adjust based on actual velocity)
- ✅ Measurable (clear acceptance criteria)
- ✅ Valuable (incremental delivery)

**Key Success Factors:**
1. Clear communication during standups
2. Quick issue resolution
3. Peer code review quality
4. Testing discipline
5. Documentation completeness

**Go Team Ân/Việt/Nguyên! 🚀**

---

**Created:** October 21, 2025  
**Ready to Start:** YES ✅  
**Target Completion:** November 4, 2025
