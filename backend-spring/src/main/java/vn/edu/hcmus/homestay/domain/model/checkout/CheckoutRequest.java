package vn.edu.hcmus.homestay.domain.model.checkout;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class CheckoutRequest {

    private final UUID id;
    private final UUID contractId;
    private final UUID customerId;
    private final LocalDate requestedCheckoutDate;
    private final String reason;
    private final CheckoutStatus status;
    private final Instant createdAt;
    private final Instant updatedAt;

    public CheckoutRequest(
            UUID id,
            UUID contractId,
            UUID customerId,
            LocalDate requestedCheckoutDate,
            String reason,
            CheckoutStatus status,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.contractId = contractId;
        this.customerId = customerId;
        this.requestedCheckoutDate = requestedCheckoutDate;
        this.reason = reason;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getContractId() {
        return contractId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public LocalDate getRequestedCheckoutDate() {
        return requestedCheckoutDate;
    }

    public String getReason() {
        return reason;
    }

    public CheckoutStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public CheckoutRequest withStatus(CheckoutStatus newStatus) {
        return new CheckoutRequest(id, contractId, customerId, requestedCheckoutDate, reason,
                newStatus, createdAt, updatedAt);
    }
}
