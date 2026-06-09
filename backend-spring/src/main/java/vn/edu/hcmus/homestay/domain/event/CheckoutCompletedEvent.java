package vn.edu.hcmus.homestay.domain.event;

import java.util.UUID;

public record CheckoutCompletedEvent(UUID roomId, UUID bedId) {}
