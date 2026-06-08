package vn.edu.hcmus.homestay.domain.model.rental;

import java.util.Map;
import java.util.Set;

public enum RentalRequestStatus {
    REQUESTED,
    REVIEWING,
    VIEWING_SCHEDULED,
    ACCEPTED,
    REJECTED,
    CANCELLED,
    DEPOSIT_PENDING,
    COMPLETED;

    /** Documents valid transitions — not yet enforced, used as refactor baseline. */
    public static final Map<RentalRequestStatus, Set<RentalRequestStatus>> VALID_TRANSITIONS =
            Map.of(
                    REQUESTED, Set.of(REVIEWING, CANCELLED),
                    REVIEWING, Set.of(VIEWING_SCHEDULED, ACCEPTED, REJECTED, CANCELLED),
                    VIEWING_SCHEDULED, Set.of(ACCEPTED, REJECTED, CANCELLED),
                    ACCEPTED, Set.of(DEPOSIT_PENDING, CANCELLED),
                    DEPOSIT_PENDING, Set.of(COMPLETED, CANCELLED),
                    REJECTED, Set.of(),
                    CANCELLED, Set.of(),
                    COMPLETED, Set.of());
}
