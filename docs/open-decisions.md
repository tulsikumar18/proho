# Proho Platform — Open Decisions & Product Questions

This document tracks unresolved product questions, edge-case policies, and architectural choices that require stakeholder or product owner confirmation before final implementation in later phases.

---

| Item ID | Topic | Current Working Assumption | Impacted Modules | Status | Decision Owner |
|---|---|---|---|---|---|
| **OD-01** | **OTP SMS Provider** | Mock SMS service in Phase 1-4; Twilio or Fast2SMS / Gupshup for India in Phase 7-8. | Accounts, Visits | `PENDING_CONFIRMATION` | Product / Tech Lead |
| **OD-02** | **TDS Deduction Rate** | Default standard 5% under Section 194H for Indian broker commission if PAN is valid, 20% if PAN not submitted. | Ledger, Invoices | `CONFIRMED_WORKING_ASSUMPTION` | Finance / Legal |
| **OD-03** | **Smart-Lock Vendor** | Mock provider interface (`MockLockService`) implemented in Phase 1-5; vendor selection (TTLock vs Tuya) deferred to Phase 9. | Visits, Smart-Lock | `DEFERRED_TO_PHASE_9` | Operations |
| **OD-04** | **Referral Cooling-Off Period** | Fixed at 60 calendar days of inactivity before another partner can register the same lead. | Leads & Referrals | `CONFIRMED_AND_IMPLEMENTED` | Sales Leadership |
| **OD-05** | **Offline Visits without Smart Locks** | If a unit does not have a smart lock, does an on-site Proho executive verify the visit OTP using their own app/portal? *Assumption: Yes, the site manager or security guard portal verifies the OTP.* | Visits, Bookings | `PENDING_CONFIRMATION` | Operations |
| **OD-06** | **Payout Minimum & Frequency** | Minimum ₹5,000 threshold; payout batch processed weekly on Thursdays. | Payouts | `CONFIRMED_WORKING_ASSUMPTION` | Finance |
| **OD-07** | **Multi-Language Content** | UI strings localized for English and Hindi. Dynamic property descriptions stored in English, optional Hindi translation fallback. | Mobile App | `CONFIRMED_WORKING_ASSUMPTION` | Product |
| **OD-22** | **Public Property Discovery, Sharing Links, & Duplicate Listing Policy** | Approved inventory is browsable publicly without disclosing exact unit numbers; sharing links carry partner referral tokens for buyer attribution; duplicate submissions matching `(society_name, tower, unit_number)` trigger admin arbitration. | Properties, Inventory, Leads | `CONFIRMED_AND_IMPLEMENTED` | Product / Operations |

---

## Escalation & Review Process
1. Working assumptions allow development of data structures, service interfaces, and tests to proceed without blocking.
2. Changes to any confirmed working assumption will trigger a documentation update and test suite validation.
