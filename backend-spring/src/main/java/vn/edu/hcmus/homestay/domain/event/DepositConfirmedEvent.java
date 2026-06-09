package vn.edu.hcmus.homestay.domain.event;

import java.util.UUID;

public record DepositConfirmedEvent(UUID roomId, UUID bedId) {}
