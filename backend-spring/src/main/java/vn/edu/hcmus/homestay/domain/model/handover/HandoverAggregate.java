package vn.edu.hcmus.homestay.domain.model.handover;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Read-only aggregate for rich handover responses. Immutable. */
public class HandoverAggregate {

    private final Handover handover;
    private final String customerName;
    private final String customerEmail;
    private final String managerName;
    private final UUID contractRoomId;
    private final UUID contractBedId;
    private final LocalDate contractStartDate;
    private final LocalDate contractEndDate;
    private final List<HandoverItem> items;

    public HandoverAggregate(
            Handover handover,
            String customerName,
            String customerEmail,
            String managerName,
            UUID contractRoomId,
            UUID contractBedId,
            LocalDate contractStartDate,
            LocalDate contractEndDate,
            List<HandoverItem> items) {
        this.handover = handover;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.managerName = managerName;
        this.contractRoomId = contractRoomId;
        this.contractBedId = contractBedId;
        this.contractStartDate = contractStartDate;
        this.contractEndDate = contractEndDate;
        this.items = items != null ? List.copyOf(items) : List.of();
    }

    public Handover getHandover() {
        return handover;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public String getManagerName() {
        return managerName;
    }

    public UUID getContractRoomId() {
        return contractRoomId;
    }

    public UUID getContractBedId() {
        return contractBedId;
    }

    public LocalDate getContractStartDate() {
        return contractStartDate;
    }

    public LocalDate getContractEndDate() {
        return contractEndDate;
    }

    public List<HandoverItem> getItems() {
        return items;
    }
}
