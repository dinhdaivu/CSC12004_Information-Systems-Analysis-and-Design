# State Machines

> Enum values match the course spec (BCE analysis model).

---

## Room Status

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE : room created

    AVAILABLE --> HOLDING : UC2-3 DepositRequest created
    HOLDING --> AVAILABLE : deposit EXPIRED (24h) or CANCELLED
    HOLDING --> DEPOSITED : UC2-3 deposit PAID confirmed
    DEPOSITED --> OCCUPIED : UC3-3 room handed over (contract ACTIVE)
    OCCUPIED --> CHECKOUT_PENDING : UC4-1 CheckoutRequest submitted
    CHECKOUT_PENDING --> AVAILABLE : UC4-3 checkout COMPLETED
    AVAILABLE --> AVAILABLE : maintenance done
```

| Status | Meaning |
| --- | --- |
| `AVAILABLE` | Empty, can be booked |
| `HOLDING` | DepositRequest created — 24h window to pay |
| `DEPOSITED` | Deposit confirmed, awaiting check-in |
| `OCCUPIED` | Contract active, tenant in room |
| `CHECKOUT_PENDING` | Checkout request submitted, pending settlement |

---

## Deposit Status

```mermaid
stateDiagram-v2
    [*] --> PENDING : UC2-3 DepositRequest created

    PENDING --> PAID : payment confirmed
    PENDING --> CANCELLED : customer or staff cancels
    PENDING --> EXPIRED : 24h elapsed without payment (SchedulerController)
    PAID --> [*] : settlement complete (on checkout)
```

| Status | Meaning |
| --- | --- |
| `PENDING` | Awaiting payment (24h window) |
| `PAID` | Payment received and confirmed |
| `CANCELLED` | Manually cancelled |
| `EXPIRED` | Auto-expired by SchedulerController after 24h |

**Refund Rules (applied on Settlement):**

| Condition | Refund % |
| --- | --- |
| PAID, no contract (CANCELLED) | 80% |
| Contract ACTIVE, stayed < 6 months | 50% |
| Contract ACTIVE, stayed >= 6 months | 70% |
| Contract COMPLETED (natural expiry) | 100% |
| Deductions | Unpaid rent, utilities, damages, penalties |

---

## Contract Status

```mermaid
stateDiagram-v2
    [*] --> ACTIVE : UC3-2 contract signed

    ACTIVE --> TERMINATED : UC4-3 early check-out
    ACTIVE --> COMPLETED : end_date reached (natural expiry)
    TERMINATED --> [*]
    COMPLETED --> [*]
```

| Status | Meaning |
| --- | --- |
| `ACTIVE` | Signed contract, tenant in residence |
| `TERMINATED` | Early exit before contract end_date |
| `COMPLETED` | Natural end of rental period |

---

## Checkout Status

```mermaid
stateDiagram-v2
    [*] --> REQUESTED : UC4-1 customer submits request

    REQUESTED --> CONFIRMED : UC4-2 settlement agreed by both parties
    CONFIRMED --> COMPLETED : UC4-3 room returned, payment settled
```

| Status | Meaning |
| --- | --- |
| `REQUESTED` | Customer submitted check-out request |
| `CONFIRMED` | Settlement amount agreed |
| `COMPLETED` | Room handed back, deposit settled |
