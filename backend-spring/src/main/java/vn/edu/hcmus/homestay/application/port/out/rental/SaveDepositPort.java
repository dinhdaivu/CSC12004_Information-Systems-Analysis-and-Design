package vn.edu.hcmus.homestay.application.port.out.rental;

import vn.edu.hcmus.homestay.domain.model.deposit.DepositRequest;

public interface SaveDepositPort {

    DepositRequest save(DepositRequest deposit);
}
