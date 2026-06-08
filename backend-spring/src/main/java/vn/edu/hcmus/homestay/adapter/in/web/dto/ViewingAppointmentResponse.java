package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointment;

public class ViewingAppointmentResponse {

    private UUID id;

    @JsonProperty("rental_request_id")
    private UUID rentalRequestId;

    @JsonProperty("customer_id")
    private UUID customerId;

    @JsonProperty("sale_id")
    private UUID saleId;

    @JsonProperty("room_id")
    private UUID roomId;

    @JsonProperty("bed_id")
    private UUID bedId;

    @JsonProperty("scheduled_at")
    private Instant scheduledAt;

    @JsonProperty("result_note")
    private String resultNote;

    private String status;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    public static ViewingAppointmentResponse from(ViewingAppointment appt) {
        ViewingAppointmentResponse r = new ViewingAppointmentResponse();
        r.id = appt.getId();
        r.rentalRequestId = appt.getRentalRequestId();
        r.customerId = appt.getCustomerId();
        r.saleId = appt.getSaleId();
        r.roomId = appt.getRoomId();
        r.bedId = appt.getBedId();
        r.scheduledAt = appt.getScheduledAt();
        r.resultNote = appt.getResultNote();
        r.status = appt.getStatus() != null ? appt.getStatus().name().toLowerCase() : null;
        r.createdAt = appt.getCreatedAt();
        r.updatedAt = appt.getUpdatedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
