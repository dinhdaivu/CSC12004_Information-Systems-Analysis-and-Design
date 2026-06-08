package vn.edu.hcmus.homestay.common.event;

import java.util.UUID;

public record DepositConfirmedEvent(UUID roomId, UUID bedId) {}
