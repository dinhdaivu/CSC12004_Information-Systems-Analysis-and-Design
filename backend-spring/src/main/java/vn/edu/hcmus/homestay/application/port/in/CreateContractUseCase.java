package vn.edu.hcmus.homestay.application.port.in;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;

public interface CreateContractUseCase {

    Contract createContract(CreateContractCommand command);

    record CreateContractCommand(
            UUID customerId,
            UUID depositRequestId,
            UUID roomId,
            UUID bedId,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal monthlyPrice,
            String notes) {}
}
