package vn.edu.hcmus.homestay.common.event;

import java.util.UUID;

public record DepositExpiredEvent(UUID roomId, UUID bedId) {}
