package vn.edu.hcmus.homestay.application.port.out;

import vn.edu.hcmus.homestay.domain.model.eligibility.LodgingEligibility;

public interface SaveEligibilityPort {

    LodgingEligibility save(LodgingEligibility e);
}
