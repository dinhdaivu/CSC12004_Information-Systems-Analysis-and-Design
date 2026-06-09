package vn.edu.hcmus.homestay.common.event;

import java.util.UUID;

public record CheckoutCompletedEvent(UUID roomId, UUID bedId) {}
