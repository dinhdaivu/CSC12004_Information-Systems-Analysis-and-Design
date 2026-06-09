package vn.edu.hcmus.homestay.domain.event;

import java.util.UUID;

public record DepositExpiredEvent(UUID roomId, UUID bedId) {}
