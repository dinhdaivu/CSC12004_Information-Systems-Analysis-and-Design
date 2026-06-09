package vn.edu.hcmus.homestay.adapter.out.persistence.rental;
import vn.edu.hcmus.homestay.adapter.out.persistence.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.contract.ContractStatus;

@Entity
@Table(name = "contracts", schema = "public")
public class ContractEntity extends BaseEntity {

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "deposit_request_id")
    private UUID depositRequestId;

    @Column(name = "room_id", nullable = false)
    private UUID roomId;

    @Column(name = "bed_id")
    private UUID bedId;

    @Column(name = "start_date", nullable = false, columnDefinition = "date")
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false, columnDefinition = "date")
    private LocalDate endDate;

    @Column(name = "monthly_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyPrice;

    @Convert(converter = ContractStatusConverter.class)
    @Column(name = "status", nullable = false)
    private ContractStatus status;

    @Column(name = "contract_document_url")
    private String contractDocumentUrl;

    @Column(name = "notes")
    private String notes;

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public UUID getDepositRequestId() {
        return depositRequestId;
    }

    public void setDepositRequestId(UUID depositRequestId) {
        this.depositRequestId = depositRequestId;
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

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getMonthlyPrice() {
        return monthlyPrice;
    }

    public void setMonthlyPrice(BigDecimal monthlyPrice) {
        this.monthlyPrice = monthlyPrice;
    }

    public ContractStatus getStatus() {
        return status;
    }

    public void setStatus(ContractStatus status) {
        this.status = status;
    }

    public String getContractDocumentUrl() {
        return contractDocumentUrl;
    }

    public void setContractDocumentUrl(String contractDocumentUrl) {
        this.contractDocumentUrl = contractDocumentUrl;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
