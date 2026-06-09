package vn.edu.hcmus.homestay.application.model.query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.handover.Handover;
import vn.edu.hcmus.homestay.domain.model.handover.HandoverItem;

/**
 * Read model / projection for rich handover responses.
 * Composes a {@link Handover} aggregate root with denormalised display fields
 * (participant names, contract dates, items). Not a domain entity — has no
 * business invariants of its own.
 *
 * <p>Previously named {@code HandoverAggregate} in the domain package, which was
 * misleading: in DDD the aggregate root is {@link Handover} itself.
 */
public class HandoverDetailView {

    private final Handover handover;
    private final String customerName;
    private final String customerEmail;
    private final String managerName;
    private final UUID contractRoomId;
    private final UUID contractBedId;
    private final LocalDate contractStartDate;
    private final LocalDate contractEndDate;
    private final List<HandoverItem> items;

    public HandoverDetailView(
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
