package vn.edu.hcmus.homestay.domain.model.viewing;

import java.time.Instant;
import java.util.UUID;

/** Pure domain entity — no JPA annotations, no Spring dependencies. */
public class ViewingAppointment {

    private final UUID id;
    private final UUID rentalRequestId;
    private final UUID customerId;
    private final UUID saleId;
    private final UUID roomId;
    private final UUID bedId;
    private final Instant scheduledAt;
    private final String resultNote;
    private final ViewingAppointmentStatus status;
    private final Instant createdAt;
    private final Instant updatedAt;

    public ViewingAppointment(
            UUID id,
            UUID rentalRequestId,
            UUID customerId,
            UUID saleId,
            UUID roomId,
            UUID bedId,
            Instant scheduledAt,
            String resultNote,
            ViewingAppointmentStatus status,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.rentalRequestId = rentalRequestId;
        this.customerId = customerId;
        this.saleId = saleId;
        this.roomId = roomId;
        this.bedId = bedId;
        this.scheduledAt = scheduledAt;
        this.resultNote = resultNote;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getRentalRequestId() {
        return rentalRequestId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public UUID getSaleId() {
        return saleId;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public UUID getBedId() {
        return bedId;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public String getResultNote() {
        return resultNote;
    }

    public ViewingAppointmentStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    /** Returns a copy with a new status. */
    public ViewingAppointment withStatus(ViewingAppointmentStatus newStatus) {
        return new ViewingAppointment(
                id, rentalRequestId, customerId, saleId, roomId, bedId,
                scheduledAt, resultNote, newStatus, createdAt, updatedAt);
    }

    /** Returns a copy with updated resultNote and status (record outcome). */
    public ViewingAppointment withOutcome(String newResultNote, ViewingAppointmentStatus newStatus) {
        return new ViewingAppointment(
                id, rentalRequestId, customerId, saleId, roomId, bedId,
                scheduledAt, newResultNote, newStatus, createdAt, updatedAt);
    }

    /** Returns a copy with updated scheduling fields. */
    public ViewingAppointment withUpdates(UUID newSaleId, UUID newRoomId, UUID newBedId, Instant newScheduledAt) {
        return new ViewingAppointment(
                id, rentalRequestId, customerId,
                newSaleId != null ? newSaleId : saleId,
                newRoomId != null ? newRoomId : roomId,
                newBedId != null ? newBedId : bedId,
                newScheduledAt != null ? newScheduledAt : scheduledAt,
                resultNote, status, createdAt, updatedAt);
    }
}
