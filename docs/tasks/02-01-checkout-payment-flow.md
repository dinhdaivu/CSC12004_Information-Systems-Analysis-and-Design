# [Task] Checkout Payment Flow

> **Implementation Rules**
> 1. **Before implementation**: Check [frontend-status.md](../frontend-status.md), [api-endpoints.md](../architecture/api-endpoints.md), [database.md](../architecture/database.md), and [state-machine.md](../architecture/state-machine.md).
> 2. **Stubs**: If a dependency is not implemented, create a typed stub and add `// TODO: Implemented in task 02-01`.
> 3. **After implementation**: Update related API, database, and state-machine docs if payment/deposit behavior changes.

## GitHub Issue

- Link: TBD

---

## Overview

Implement checkout and deposit payment screens for customer booking payment. The flow covers default checkout, voucher validation failure, MoMo QR modal, and payment success state.

### Figma Screens

| Screen | Figma Link | Angular Route |
|--------|------------|---------------|
| Checkout / Payment - Default | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=331-305) | `/bookings/:id` |
| Checkout / Payment - Voucher Expired | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=341-306) | `/bookings/:id` |
| Checkout / Payment - MoMo QR Modal | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=341-351) | `/bookings/:id` |
| Checkout / Payment - Success | [Figma](https://www.figma.com/design/v5iX9OxYe2cAeoilzLuHCr/Homestay-Dorm?node-id=341-406) | `/bookings/:id` |

---

## Reference Documents

| Document | Section |
|----------|---------|
| [UC2](../UC/UC2.md) | Deposit and rental confirmation |
| [API Endpoints](../architecture/api-endpoints.md) | Deposits, Transactions |
| [State Machine](../architecture/state-machine.md) | RoomStatus, DepositStatus |
| [Software Layers](../architecture/layers.md) | PaymentView, PaymentController |

---

## Flow Summary

```text
Checkout/payment flow:

1. Customer opens /bookings/:id.
2. Frontend loads booking/deposit details.
3. Customer optionally enters voucher code.
4. System validates voucher and displays success/error state.
5. Customer selects payment method.
6. Customer starts payment.
7. QR modal or payment instructions are displayed.
8. Backend records payment result.
9. Frontend displays payment success.
10. DepositRequest becomes PAID and Room becomes DEPOSITED.
```

---

## Scope

### Frontend (Angular)

- [ ] Use existing `ngx-translate` i18n pattern for all user-facing copy; add/update matching keys in `frontend/src/assets/i18n/en.json` and `frontend/src/assets/i18n/vi.json`.

- [ ] Replace `BookingDetailComponent` placeholder with checkout UI.
- [ ] Display customer information, booking summary, price, voucher input, payment methods, and pay button.
- [ ] Implement voucher expired/error state.
- [ ] Implement QR/payment modal state.
- [ ] Implement payment success state.
- [ ] Add typed `BookingPaymentService`.
- [ ] Add loading/error states.

### Backend (Express/Supabase)

- [ ] Implement `GET /api/v1/deposits/:id` or booking detail equivalent.
- [ ] Implement `POST /api/v1/deposits` if deposit creation is part of the flow.
- [ ] Implement payment/transaction creation via `POST /api/v1/transactions`.
- [ ] Implement voucher validation endpoint only if voucher feature is retained.
- [ ] Update deposit and room status after confirmed payment.

### Tests

| Layer | Test File | Mock Target |
|-------|-----------|-------------|
| Frontend | `frontend/src/app/features/bookings/components/booking-detail/booking-detail.component.spec.ts` | Payment service |
| Backend | `backend/src/__tests__/deposits.spec.ts` | Supabase client |
| Backend | `backend/src/__tests__/transactions.spec.ts` | Payment provider/Supabase |

| # | Test Case | Layer | Expected |
|---|-----------|-------|----------|
| 1 | Checkout data loads | Frontend | Customer/booking summary rendered |
| 2 | Voucher expired | Frontend | Error message is shown |
| 3 | Payment method select | Frontend | Selected method updates state |
| 4 | QR modal opens | Frontend | QR/payment modal is visible |
| 5 | Payment success | Frontend/Backend | Success state shown, deposit marked PAID |
| 6 | Transaction record | Backend | Transaction is persisted |

---

## AI Implementation Prompt

--------------------------------------------------

Implement `docs/tasks/02-01-checkout-payment-flow.md`.

## References
- UC: `docs/UC/UC2.md`
- API: `docs/architecture/api-endpoints.md`
- State machine: `docs/architecture/state-machine.md`
- Figma screens: checkout default, voucher expired, QR modal, payment success

## Important Behavior
- Deposit payment success must update DepositStatus to `PAID`.
- Room status should move from `HOLDING` to `DEPOSITED` only after payment confirmation.
- Voucher error must not block payment if business rules allow payment without a voucher.

## Implementation
- Replace `BookingDetailComponent` placeholder.
- Add typed payment/deposit service methods.
- Implement UI states for default checkout, expired voucher, QR modal, and success.
- If payment provider integration is not ready, create a typed mock adapter with `// TODO: Implemented in task 02-01`.

## Test Requirements
- Frontend unit tests for each visual state.
- Backend tests for deposit/transaction status updates if backend routes are implemented.

--------------------------------------------------

---

## Completion Conditions

- [ ] `/bookings/:id` no longer shows placeholder text.
- [ ] Checkout default state matches the Figma structure.
- [ ] Voucher expired state is implemented.
- [ ] QR/payment modal state is implemented.
- [ ] Payment success state is implemented.
- [ ] Payment/deposit API or typed mock adapter exists.
- [ ] Tests pass for changed code.

---

## Related Tasks

- Previous: [01-02 Branch Room Detail Pages](./01-02-branch-room-detail-pages.md)
- Related: [03-03 Deposit Tracking Dashboard](./03-03-deposit-tracking-dashboard.md)

---

## Notes

- The README references VietQR as the payment provider, while the Figma checkout state includes MoMo/VNPAY/Visa visuals. Confirm the final provider list before production integration.
- Do not hard-code expiring Figma MCP asset URLs.
