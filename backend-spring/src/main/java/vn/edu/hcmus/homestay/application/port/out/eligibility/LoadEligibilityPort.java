package vn.edu.hcmus.homestay.application.port.out.eligibility;

import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.eligibility.LodgingEligibility;

public interface LoadEligibilityPort {

    Optional<LodgingEligibility> loadByCustomerId(UUID customerId);
}
