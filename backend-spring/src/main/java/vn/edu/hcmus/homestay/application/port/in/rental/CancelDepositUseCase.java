package vn.edu.hcmus.homestay.application.port.in.rental;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;

public interface CancelDepositUseCase {

    DepositRequest cancelDeposit(UUID id);
}
