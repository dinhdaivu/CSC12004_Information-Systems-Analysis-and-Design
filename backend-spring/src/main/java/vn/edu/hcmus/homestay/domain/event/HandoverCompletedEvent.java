package vn.edu.hcmus.homestay.domain.event;

import java.util.UUID;

public record HandoverCompletedEvent(UUID roomId, UUID bedId) {}
