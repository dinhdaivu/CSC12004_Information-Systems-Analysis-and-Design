package vn.edu.hcmus.homestay.application.port.in;

import java.math.BigDecimal;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.bed.Bed;

public interface CreateBedUseCase {

    Bed createBed(UUID roomId, CreateBedCommand command);

    record CreateBedCommand(String bedNumber, BigDecimal pricePerMonth) {}
}
