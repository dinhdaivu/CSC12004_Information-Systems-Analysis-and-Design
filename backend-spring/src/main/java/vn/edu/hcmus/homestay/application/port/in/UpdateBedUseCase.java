package vn.edu.hcmus.homestay.application.port.in;

import java.math.BigDecimal;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;
import vn.edu.hcmus.homestay.domain.model.bed.BedStatus;

public interface UpdateBedUseCase {

    Bed updateBed(UUID id, UpdateBedCommand command);

    record UpdateBedCommand(String bedNumber, BigDecimal pricePerMonth, BedStatus status) {}
}
