package vn.edu.hcmus.homestay.adapter.out.persistence.rental;
import vn.edu.hcmus.homestay.adapter.out.persistence.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointmentStatus;

@Entity
@Table(name = "viewing_appointments", schema = "public")
public class ViewingAppointmentEntity extends BaseEntity {

    @Column(name = "rental_request_id", nullable = false)
    private UUID rentalRequestId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "sale_id")
    private UUID saleId;

    @Column(name = "room_id")
    private UUID roomId;

    @Column(name = "bed_id")
    private UUID bedId;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "result_note")
    private String resultNote;

    @Convert(converter = ViewingAppointmentStatusConverter.class)
    @Column(name = "status", nullable = false)
    private ViewingAppointmentStatus status = ViewingAppointmentStatus.SCHEDULED;

    public UUID getRentalRequestId() {
        return rentalRequestId;
    }

    public void setRentalRequestId(UUID rentalRequestId) {
        this.rentalRequestId = rentalRequestId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public UUID getSaleId() {
        return saleId;
    }

    public void setSaleId(UUID saleId) {
        this.saleId = saleId;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }

    public UUID getBedId() {
        return bedId;
    }

    public void setBedId(UUID bedId) {
        this.bedId = bedId;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public String getResultNote() {
        return resultNote;
    }

    public void setResultNote(String resultNote) {
        this.resultNote = resultNote;
    }

    public ViewingAppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(ViewingAppointmentStatus status) {
        this.status = status;
    }
}
