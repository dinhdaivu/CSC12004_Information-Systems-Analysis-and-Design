package vn.edu.hcmus.homestay.common.event;

import java.util.UUID;

public record HandoverCompletedEvent(UUID roomId, UUID bedId) {}
