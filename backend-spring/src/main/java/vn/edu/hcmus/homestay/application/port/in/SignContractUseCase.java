package vn.edu.hcmus.homestay.application.port.in;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.contract.Contract;

public interface SignContractUseCase {

    Contract signContract(UUID id, SignContractCommand command);

    record SignContractCommand(String contractDocumentUrl, String notes) {}
}
