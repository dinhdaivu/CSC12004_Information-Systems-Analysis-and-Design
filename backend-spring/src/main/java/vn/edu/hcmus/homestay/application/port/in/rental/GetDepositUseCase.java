package vn.edu.hcmus.homestay.application.port.in.rental;

import java.util.List;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;

public interface GetDepositUseCase {

    DepositRequest getDeposit(UUID id);

    List<DepositRequest> getAllDeposits();
}
